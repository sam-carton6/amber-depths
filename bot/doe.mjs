// Upgrade DOE ("design of experiments"): which upgrade-pick order gets each class deepest?
// Plays every class with every strategy below on the same seeds, all in one pool of hidden browser tabs, then makes a
// page comparing each strategy with today's "defensive" order, seed by seed (same seed = same dungeon, so the pairs
// are fair). Games that got stuck or stalled are left out, along with their partner game.
//   node bot/doe.mjs                      (all 12 classes x 6 strategies x seeds 1-20, ~40 min)
//   node bot/doe.mjs --resume             (carry on with the newest DOE folder: games already played are skipped)
//   node bot/doe.mjs --page-only          (no games: rebuild the page from the newest DOE folder)
// Options: --seeds (1-20), --only "warrior,rogue", --strategies "defensive,tank", --diff, --mode, --jobs, --label, --no-open.
// Results: bot/runs/<date>-<label>-doe/ (games/, summary.json, doe.html), and bot/runs/latest-doe.html.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BOT = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(BOT, '..'), RUNS = path.join(BOT, 'runs');

// The strategies (upgrade picks, best first). "regen:1" = take it at most once, then it drops to the end of the list.
// Upgrades not listed (Scavenger) always come last.
const STRATEGIES = {
  defensive: { name: 'Defensive (today)', order: ['regen', 'skin', 'vitality', 'might', 'thirst', 'evasion', 'keen', 'reckless'] },
  sam:       { name: "Sam's mix",         order: ['might', 'regen:1', 'skin', 'vitality', 'keen', 'thirst', 'evasion', 'reckless'] },
  damage:    { name: 'Damage',            order: ['might', 'keen', 'reckless', 'thirst', 'regen', 'skin', 'vitality', 'evasion'] },
  glass:     { name: 'Glass cannon',      order: ['reckless', 'might', 'keen', 'thirst', 'evasion', 'regen', 'vitality', 'skin'] },
  tank:      { name: 'Tank',              order: ['vitality', 'skin', 'regen', 'thirst', 'might', 'keen', 'evasion', 'reckless'] },
  crit:      { name: 'Crit / dodge',      order: ['keen', 'evasion', 'might', 'thirst', 'regen', 'skin', 'vitality', 'reckless'] },
};
const CLASSES = ['warrior', 'rogue', 'mage', 'necro', 'berserker', 'paladin', 'gambler', 'ranger', 'trapper', 'mole', 'alch', 'vampire'];
const NAMES = { warrior: 'Warrior', rogue: 'Rogue', mage: 'Mage', necro: 'Necromancer', berserker: 'Berserker', paladin: 'Paladin', gambler: 'Gambler', ranger: 'Ranger', trapper: 'Trapper', mole: 'Mole', alch: 'Alchemist', vampire: 'Vampire' };

// --- Options ---
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 || args[i + 1] === undefined || args[i + 1].startsWith('--') ? d : args[i + 1]; };
const list = (k, all) => opt(k, '') ? String(opt(k)).split(',').map(s => s.trim()).filter(s => all.includes(s)) : all;
const seedList = spec => String(spec).split(',').flatMap(p => { const [a, b] = p.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]; }).filter(Number.isFinite);
const seeds = seedList(opt('seeds', '1-20')), classes = list('only', CLASSES), strats = list('strategies', Object.keys(STRATEGIES));
if (!strats.includes('defensive')) strats.unshift('defensive'); // everything is measured against it
const game = { mode: opt('mode', 'endless'), diff: opt('diff', 'hard') };
const label = String(opt('label', 'upgrades')).replace(/[^\w.-]+/g, '-');
const jobs = Math.max(1, Math.min(+opt('jobs', Math.max(1, os.cpus().length - 4)), 32));
const openFile = f => exec(process.platform === 'win32' ? `start "" "${f}"` : `open "${f}"`);

// The folder: a new one, or the newest with this label (--resume, --page-only).
const newest = () => fs.existsSync(RUNS) && fs.readdirSync(RUNS).filter(d => d.endsWith(`-${label}-doe`)).sort().pop();
let dir;
if (args.includes('--resume') || args.includes('--page-only')) {
  const d = newest(); if (!d) { console.log(`No DOE folder with the label "${label}" yet.`); process.exit(1); }
  dir = path.join(RUNS, d);
} else dir = path.join(RUNS, new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-') + `-${label}-doe`);
const GAMES = path.join(dir, 'games');
fs.mkdirSync(GAMES, { recursive: true });
const fileOf = (cls, st, seed) => path.join(GAMES, `${cls}-${st}-${seed}.json`);
const t0 = Date.now();

if (!args.includes('--page-only')) {
  // --- 1. Build the test page and serve the repo (same as run.mjs) ---
  execFileSync(process.execPath, [path.join(ROOT, 'src/build.mjs'), '--test'], { cwd: ROOT, stdio: 'ignore' });
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const URL_ = `http://127.0.0.1:${server.address().port}/test/game_test.html`;

  // --- 2. Every game in one queue: seed by seed, so a stopped run still has whole seeds to compare ---
  const queue = [];
  for (const seed of seeds) for (const cls of classes) for (const st of strats) if (!fs.existsSync(fileOf(cls, st, seed))) queue.push({ seed, cls, st });
  const total = queue.length;
  console.log(`Upgrade DOE: ${classes.length} classes x ${strats.length} strategies x ${seeds.length} seeds = ${total} games to play (${game.diff} ${game.mode}), ${jobs} at a time.\nResults: ${path.relative(ROOT, dir)}  (stop any time; --resume carries on)`);
  const browser = await chromium.launch();
  let done = 0;
  await Promise.all(Array.from({ length: Math.min(jobs, total) }, async () => {
    while (queue.length) {
      const { seed, cls, st } = queue.shift(), g0 = Date.now();
      let r;
      try {
        const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 } });
        const page = await ctx.newPage();
        await page.goto(URL_); await page.waitForFunction(() => window.__T);
        await page.addScriptTag({ path: path.join(BOT, 'deep-bot.js') });
        r = await page.evaluate(o => DeepBot.play(o), { ...game, cls, seed, boonOrder: STRATEGIES[st].order });
        await ctx.close();
      } catch (e) { r = { error: String(e.message || e).split('\n')[0] }; }
      const last = (r.floors || []).at(-1);
      const g = { seed, cls, st, depth: r.depth, turns: r.turns, lv: r.lv, dead: r.dead, stuck: !!(r.stuck || r.stalled), error: r.error,
        by: r.death && (r.death.killer || r.death.by), boons: last ? last.boons : '', secs: Math.round((Date.now() - g0) / 1000) };
      fs.writeFileSync(fileOf(cls, st, seed), JSON.stringify(g));
      done++;
      const eta = done ? Math.round((Date.now() - t0) / done * (total - done) / 60000) : '?';
      console.log(`[${done}/${total}] ${cls} ${st} seed ${seed}: floor ${g.depth ?? '?'}${g.error ? ' ERROR ' + g.error : g.stuck ? ' (stuck)' : ''}  ~${eta} min left`);
    }
  }));
  await browser.close(); server.close();
}

// --- 3. The numbers: each strategy vs defensive, paired by seed ---
const games = fs.readdirSync(GAMES).map(f => JSON.parse(fs.readFileSync(path.join(GAMES, f), 'utf8')));
const ok = g => g && !g.error && !g.stuck && Number.isFinite(g.depth);
const get = (cls, st, seed) => games.find(g => g.cls === cls && g.st === st && g.seed === seed);
const mean = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const se = a => a.length < 2 ? null : Math.sqrt(a.reduce((s, x) => s + (x - mean(a)) ** 2, 0) / (a.length - 1) / a.length);
const r1 = x => x == null ? null : +x.toFixed(1), r2 = x => x == null ? null : +x.toFixed(2);
const usedStrats = Object.keys(STRATEGIES).filter(st => games.some(g => g.st === st));
const usedClasses = CLASSES.filter(c => games.some(g => g.cls === c));
const rows = usedClasses.map(cls => {
  const cells = {};
  for (const st of usedStrats) {
    const mine = games.filter(g => g.cls === cls && g.st === st);
    const diffs = [], pairs = [];
    for (const g of mine) { const b = get(cls, 'defensive', g.seed); if (ok(g) && ok(b)) { diffs.push(g.depth - b.depth); pairs.push([g.seed, g.depth, b.depth]); } }
    const good = mine.filter(ok);
    cells[st] = { n: diffs.length, played: mine.length, stuck: mine.filter(g => !ok(g)).length, avg: r1(mean(good.map(g => g.depth))),
      diff: st === 'defensive' ? 0 : r2(mean(diffs)), se: st === 'defensive' ? 0 : r2(se(diffs)), pairs,
      boons: Object.entries(good.flatMap(g => (g.boons || '').split(' ').filter(Boolean)).reduce((m, b) => (m[b] = (m[b] || 0) + 1, m), {}))
        .map(([b, k]) => [b, r1(k / (good.length || 1))]).sort((a, b) => b[1] - a[1]) };
  }
  // The winner: the biggest average gain over defensive (defensive itself counts as 0). "Clear" = the gain minus two
  // standard errors is still above 0, so it's unlikely to be luck.
  const best = usedStrats.reduce((a, b) => (cells[b].diff ?? -1e9) > (cells[a].diff ?? -1e9) ? b : a, 'defensive');
  const w = cells[best];
  return { cls, name: NAMES[cls], cells, winner: best, clear: best !== 'defensive' && w.se != null && w.diff - 2 * w.se > 0 };
});
// Each strategy over all classes: every pair counts once.
const overall = Object.fromEntries(usedStrats.map(st => { const d = rows.flatMap(r => r.cells[st].pairs.map(p => p[1] - p[2])); return [st, { n: d.length, diff: st === 'defensive' ? 0 : r2(mean(d)), se: st === 'defensive' ? 0 : r2(se(d)) }]; }));
const summary = { label, stamp: path.basename(dir).slice(0, 16), seeds: seeds.length ? `${Math.min(...seeds)}-${Math.max(...seeds)}` : '', game,
  games: games.length, stuck: games.filter(g => !ok(g)).length, mins: +(games.reduce((a, g) => a + (g.secs || 0), 0) / 60 / jobs).toFixed(0),
  strategies: Object.fromEntries(usedStrats.map(st => [st, STRATEGIES[st]])), rows, overall };
fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(summary, null, 1));
const page = fs.readFileSync(path.join(BOT, 'doe-template.html'), 'utf8').replace('/*DATA*/null', JSON.stringify(summary));
fs.writeFileSync(path.join(dir, 'doe.html'), page);
fs.writeFileSync(path.join(RUNS, 'latest-doe.html'), page);

console.log(`\n${games.length} games (${summary.stuck} stuck or crashed, left out with their partner game). ${((Date.now() - t0) / 60000).toFixed(1)} min.`);
const pm = c => c.diff == null ? '   -   ' : `${c.diff >= 0 ? '+' : ''}${c.diff.toFixed(1)}±${(2 * (c.se || 0)).toFixed(1)}`;
console.log('Class        defensive  ' + usedStrats.filter(s => s !== 'defensive').map(s => s.padEnd(11)).join('') + 'winner');
for (const r of rows) console.log(r.name.padEnd(13) + String(r.cells.defensive.avg).padEnd(11) + usedStrats.filter(s => s !== 'defensive').map(s => pm(r.cells[s]).padEnd(11)).join('') + r.winner + (r.clear ? ' (clear)' : r.winner === 'defensive' ? '' : ' (within noise)'));
console.log(`Page: ${path.relative(ROOT, path.join(dir, 'doe.html'))}`);
if (!args.includes('--no-open')) openFile(path.join(dir, 'doe.html'));
