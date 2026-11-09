// Plays every class (bot/run.mjs once per class) and makes one page comparing them, with charts.
// From VS Code: Terminal > Run Task > "Bot: all classes". By hand: node bot/all.mjs --seeds 1-20 --label classes
// Options: --seeds, --diff, --mode, --label (default "classes"), --only "warrior,rogue" (a subset), --no-open,
// --compare-only (no games: just rebuild the comparison page from the newest runs with that label).
// Each class keeps its own folder and report in bot/runs/; the comparison goes in bot/runs/<date>-<label>-compare/.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 || args[i + 1] === undefined || args[i + 1].startsWith('--') ? d : args[i + 1]; };
const CLASSES = ['warrior', 'rogue', 'mage', 'necro', 'berserker', 'paladin', 'gambler', 'ranger', 'trapper', 'mole', 'alch', 'vampire'];
const NAMES = { warrior: 'Warrior', rogue: 'Rogue', mage: 'Mage', necro: 'Necromancer', berserker: 'Berserker', paladin: 'Paladin', gambler: 'Gambler', ranger: 'Ranger', trapper: 'Trapper', mole: 'Mole', alch: 'Alchemist', vampire: 'Vampire' };
const label = String(opt('label', 'classes')).replace(/[^\w.-]+/g, '-');
const only = opt('only', '') ? String(opt('only')).split(',').map(s => s.trim()) : CLASSES;
const seeds = opt('seeds', '1-20'), diff = opt('diff', 'hard'), mode = opt('mode', 'endless');
const t0 = Date.now();

// 1. Play each class (--compare-only skips this and rebuilds the page from the newest runs under --label).
if (!args.includes('--compare-only')) for (const cls of only) {
  console.log(`\n=== ${NAMES[cls] || cls} ===`);
  spawnSync(process.execPath, [path.join(BOT, 'run.mjs'), '--cls', cls, '--seeds', seeds, '--diff', diff, '--mode', mode, '--label', `${label}-${cls}`, '--no-open'], { stdio: 'inherit' });
}

// 2. Gather the newest batch of each class under this label.
const runs = path.join(BOT, 'runs'), rows = [];
for (const cls of only) {
  const dir = fs.readdirSync(runs).filter(d => d.endsWith(`-${label}-${cls}`)).sort().pop();
  if (!dir) continue;
  const summary = JSON.parse(fs.readFileSync(path.join(runs, dir, 'summary.json'), 'utf8'));
  const games = fs.readdirSync(path.join(runs, dir, 'games')).map(f => JSON.parse(fs.readFileSync(path.join(runs, dir, 'games', f), 'utf8')))
    .map(r => ({ seed: r.seed, depth: r.depth, stuck: r.stuck || r.stalled, error: r.error, by: r.death && r.death.by, killer: r.death && r.death.killer, lv: r.lv,
      at30: (r.floors || []).find(f => f.floor === 30) || null }));
  rows.push({ cls, name: NAMES[cls] || cls, dir, summary, games });
}

// 3. The comparison page.
const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
const out = path.join(runs, `${stamp}-${label}-compare`);
fs.mkdirSync(out, { recursive: true });
const page = fs.readFileSync(path.join(BOT, 'compare-template.html'), 'utf8')
  .replace('/*DATA*/null', JSON.stringify({ label, stamp, seeds, diff, mode, rows }));
fs.writeFileSync(path.join(out, 'compare.html'), page);
fs.writeFileSync(path.join(runs, 'latest-compare.html'), page.replace(/"dir":"/g, '"dir":"./'));
console.log(`\nAll done in ${((Date.now() - t0) / 60000).toFixed(1)} min. Comparison: ${path.relative(path.join(BOT, '..'), path.join(out, 'compare.html'))}`);
for (const r of [...rows].sort((a, b) => b.summary.avg - a.summary.avg)) console.log(`  ${r.name.padEnd(12)} average floor ${r.summary.avg}  (${r.summary.min}-${r.summary.max})${r.summary.flags.length ? `  ${r.summary.flags.length} flagged` : ''}`);
if (!args.includes('--no-open')) exec(process.platform === 'win32' ? `start "" "${path.join(out, 'compare.html')}"` : `open "${path.join(out, 'compare.html')}"`);
