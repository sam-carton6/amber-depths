// Batch runner for the deep bot: plays many games at once in hidden browser tabs and makes a results page.
// Runs on your own PC (no Claude needed). From VS Code: Terminal > Run Task > "Bot: run batch". Or by hand:
//   node bot/run.mjs --cls warrior --seeds 1-20 --label v3      (play seeds 1 to 20, open the results page)
//   node bot/run.mjs --watch 11                                   (watch seed 11 play in a visible window)
// Options: --cls (class id), --seeds (1-20 or 1,5,9), --diff (easy|normal|hard|nightmare), --mode (short|standard|
// endless), --label (a name for this batch), --jobs (games at once), --speed (ms per turn when watching), --no-open.
// Each batch goes in bot/runs/<date>-<label>/ (not in git): one JSON file per game, summary.json and report.html.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BOT = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(BOT, '..');

// --- Options ---
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1] === undefined || args[i + 1].startsWith('--') ? true : args[i + 1]; };
const seedList = spec => String(spec).split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; }).filter(Number.isFinite);
const game = { cls: opt('cls', 'warrior'), mode: opt('mode', 'endless'), diff: opt('diff', 'hard') };
const watchSeed = opt('watch', null);
const seeds = seedList(opt('seeds', '1-20'));
const label = String(opt('label', '') || '').replace(/[^\w.-]+/g, '-');
const jobs = Math.max(1, Math.min(+opt('jobs', Math.max(1, os.cpus().length - 4)), 32, seeds.length));

// --- 1. Build the test page (sound off, test hooks; see src/build.mjs) ---
execFileSync(process.execPath, [path.join(ROOT, 'src/build.mjs'), '--test'], { cwd: ROOT, stdio: 'ignore' });

// --- 2. A tiny local web server for the repo (the game needs http://, not file://) ---
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_ = `http://127.0.0.1:${server.address().port}/test/game_test.html`;

// Opens a fresh tab (its own storage, so one game can't change the next) with the game and the bot loaded.
async function openGame(browser, viewport) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 1000, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(URL_);
  await page.waitForFunction(() => window.__T);
  await page.addScriptTag({ path: path.join(BOT, 'deep-bot.js') });
  return { ctx, page };
}

if (watchSeed) {
  // --- Watch one seed in a visible window ---
  const browser = await chromium.launch({ headless: false });
  const { page } = await openGame(browser, { width: 1200, height: 900 });
  console.log(`Watching seed ${watchSeed} (${game.cls}, ${game.diff} ${game.mode}). Close the window to stop.`);
  const r = await page.evaluate(o => DeepBot.play(o), { ...game, seed: +watchSeed, delay: +opt('speed', 120) }).catch(() => null);
  if (r) console.log(`Seed ${r.seed}: reached floor ${r.depth}${r.death ? ', ' + r.death.by : ''}`);
  await browser.close().catch(() => {}); server.close();
} else {
  // --- Play the batch, several games at once ---
  const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
  const dir = path.join(BOT, 'runs', stamp + (label ? '-' + label : ''));
  fs.mkdirSync(path.join(dir, 'games'), { recursive: true });
  console.log(`${seeds.length} games of ${game.cls} (${game.diff} ${game.mode}), ${jobs} at a time. Results: ${path.relative(ROOT, dir)}`);
  const browser = await chromium.launch();
  const queue = [...seeds], results = [], t0 = Date.now();
  await Promise.all(Array.from({ length: jobs }, async () => {
    while (queue.length) {
      const seed = queue.shift(), g0 = Date.now();
      let r;
      try {
        const { ctx, page } = await openGame(browser);
        r = await page.evaluate(o => DeepBot.play(o), { ...game, seed });
        await ctx.close();
      } catch (e) { r = { seed, ...game, error: String(e.message || e).split('\n')[0], floors: [] }; }
      r.secs = Math.round((Date.now() - g0) / 1000);
      results.push(r);
      fs.writeFileSync(path.join(dir, 'games', `seed-${seed}.json`), JSON.stringify(r, null, 1));
      const how = r.error ? 'ERROR ' + r.error : r.stuck ? 'stuck' : r.stalled ? 'stalled' : r.death ? r.death.by : 'alive';
      console.log(`[${results.length}/${seeds.length}] seed ${seed}: floor ${r.depth ?? '?'} (${how}) ${r.secs}s`);
    }
  }));
  await browser.close(); server.close();
  results.sort((a, b) => a.seed - b.seed);

  // --- Summary, fair-play flags and the results page ---
  const summary = summarise(results);
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(summary, null, 1));
  const sam = JSON.parse(fs.readFileSync(path.join(BOT, 'sam-runs.json'), 'utf8'));
  const page = fs.readFileSync(path.join(BOT, 'report-template.html'), 'utf8')
    .replace('/*DATA*/null', JSON.stringify({ label: label || stamp, stamp, game, summary, sam, games: results.map(lean) }));
  fs.writeFileSync(path.join(dir, 'report.html'), page);
  fs.writeFileSync(path.join(BOT, 'runs', 'latest.html'), page);
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  console.log(`\nDone in ${mins} min. Average floor ${summary.avg} (worst ${summary.min}, middle ${summary.median}, best ${summary.max}).`);
  if (summary.flags.length) console.log(`${summary.flags.length} weird thing(s) flagged: see the report.`);
  if (opt('open', true) !== 'false' && !args.includes('--no-open')) exec(process.platform === 'win32' ? `start "" "${path.join(dir, 'report.html')}"` : `open "${path.join(dir, 'report.html')}"`);
}

// What the page needs from each game (the full record stays in games/).
function lean(r) {
  return { seed: r.seed, depth: r.depth, dead: r.dead, turns: r.turns, lv: r.lv, kills: r.kills, rest: r.rest || 0, peeks: r.peeks || 0, stuck: r.stuck, stalled: r.stalled,
    error: r.error, secs: r.secs, by: r.death && r.death.by, floors: (r.floors || []).map(f => [f.floor, f.turn, f.hp, f.max, f.lv, f.atk, f.def, f.potions, f.gold, f.rest || 0]),
    boons: r.floors && r.floors.length ? r.floors[r.floors.length - 1].boons : '' };
}

function summarise(rs) {
  const ok = rs.filter(r => !r.error), depths = ok.map(r => r.depth).sort((a, b) => a - b);
  const q = (arr, p) => { if (!arr.length) return null; const a = [...arr].sort((x, y) => x - y), i = (a.length - 1) * p, lo = Math.floor(i); return +(a[lo] + (a[Math.ceil(i)] - a[lo]) * (i - lo)).toFixed(1); };
  // Per-floor stats on arrival (games that reached the floor), and how long each floor took.
  const KEYS = ['hp', 'max', 'lv', 'atk', 'def', 'potions', 'gold'];
  // What happened on each floor of each game: turns (not counting rest), levels and gold gained.
  const byFloor = {}, steps = [];
  const stepOf = (f, n) => ({ floor: f.floor, turns: n.turn - f.turn - ((n.rest || 0) - (f.rest || 0)), lv: n.lv - f.lv, gold: n.gold - f.gold });
  for (const r of ok) r.floors.forEach((f, i) => {
    const n = r.floors[i + 1]; if (!n || n.floor === f.floor) return;
    (byFloor[f.floor] = byFloor[f.floor] || []).push(f);
    steps.push(stepOf(f, n));
  });
  const floorTurns = steps.map(x => x.turns);
  // "Usual" for a floor = the middle value on that same floor in the other games (gold and levels grow with depth, and
  // merchant floors, every third, bring in lots of gold from selling gear). Needs 3+ games there, else no flag.
  const usual = (floor, k) => { const v = steps.filter(x => x.floor === floor).map(x => x[k]); return v.length >= 3 ? q(v, .5) || 1 : Infinity; };
  const floors = Object.entries(byFloor).map(([fl, fs]) => ({ floor: +fl, n: fs.length, ...Object.fromEntries(KEYS.map(k => [k, [q(fs.map(f => f[k]), .25), q(fs.map(f => f[k]), .5), q(fs.map(f => f[k]), .75)]])) })).sort((a, b) => a.floor - b.floor);
  const medTurns = q(floorTurns, .5) || 1;
  // Fair-play flags: things a person wouldn't (or couldn't) do, each with the seed to watch.
  const flags = [];
  for (const r of rs) {
    const add = (what, floor) => flags.push({ seed: r.seed, floor, what });
    if (r.error) { add('the game crashed: ' + r.error); continue; }
    if (r.peeks) add(`revealed the map ${r.peeks} time(s) when lost (a "peek": not something a player can do)`);
    if (r.stuck) add('stuck: over 3,000 turns on one floor, stopped', r.depth);
    if (r.stalled) add('stalled: turns stopped going by (the bot kept trying something that does nothing)', r.depth);
    if (r.rest > r.turns / 2) add(`spent ${Math.round(100 * r.rest / r.turns)}% of its turns resting`);
    r.floors.forEach((f, i) => {
      const n = r.floors[i + 1]; if (!n || n.floor === f.floor) return;
      // (No gold check: gold swings with selling gear and buying upgrades. Farming shows up in turns and levels.)
      const x = stepOf(f, n), ut = usual(f.floor, 'turns'), ul = usual(f.floor, 'lv');
      if (x.turns > Math.max(600, 4 * ut)) add(`took ${x.turns} turns (usual on this floor: ${Math.round(ut)}): farming or going in circles?`, f.floor);
      if (x.lv > Math.max(6, 4 * ul)) add(`gained ${x.lv} levels on one floor (usual on this floor: ${ul})`, f.floor);
    });
  }
  const killers = {};
  for (const r of ok) if (r.death) { const k = (r.death.by || '?').replace(/^(An? |The )/, '').replace(/('s|’s| hits| slam| breath| bites| bolt).*$/, '').replace(/^.*?(poison|flames).*$/, 'the $1').trim(); killers[k] = (killers[k] || 0) + 1; }
  return { games: rs.length, errors: rs.length - ok.length, avg: +(depths.reduce((a, b) => a + b, 0) / (depths.length || 1)).toFixed(1), min: depths[0], median: q(depths, .5), max: depths[depths.length - 1],
    turns: Math.round(ok.reduce((a, r) => a + r.turns, 0) / (ok.length || 1)), medFloorTurns: medTurns, killers, floors, flags };
}
