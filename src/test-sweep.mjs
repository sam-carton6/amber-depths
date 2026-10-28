import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const b = await chromium.launch(); const errs = [];
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })).newPage();
page.on('pageerror', e => errs.push(e.message + ' | ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
await page.goto('file://' + process.cwd() + '/game_test.html'); await page.waitForTimeout(300);
await page.addScriptTag({ content: fs.readFileSync('bot.js', 'utf8') });
await page.evaluate(() => { const P = window.__T.PROF; for (const k of ['c_berserker','c_paladin','c_gambler','c_necro','c_nightmare','c_ranger','c_trapper','c_alch']) P.done[k] = 1; for (const k of Object.keys(window.__T.RELICS)) P.relics[k] = 1; P.runes = { amber: 1, flooded: 1, crypt: 1 }; for (const k of Object.keys(window.__T.CLASSES)) P.won[k] = { short: 1, standard: 1, hard: 1 }; });
const classes = (process.argv[3] || 'warrior,rogue,mage,necro,berserker,paladin,gambler,ranger,trapper,alch').split(',');
const RELS = ['', 'flask','lens','eye','boots','whet','shell','purse','heart','idol','ward','fang','coin'];
const configs = [];
const reps = Number(process.argv[2] || 2);
for (const cls of classes) for (const [mode, diff, asc, alt] of [['short','normal',0,0],['standard','normal',0,1],['short','hard',0,1],['standard','nightmare',5,0],['standard','nightmare',10,1],['endless','normal',0,0]]) for (let r = 0; r < reps; r++) configs.push([cls, mode, diff, asc, alt]);
const results = [];
const t0 = Date.now();
for (const [cls, mode, diff, asc, alt] of configs) {
  const errBefore = errs.length;
  let r;
  const relic = RELS[results.length % RELS.length];
  try { r = await page.evaluate(([c, m, d, rl, a, al]) => window.__runGame(c, m, d, m === 'endless' ? 3000 : 2500, rl, a, al), [cls, mode, diff, relic, asc, alt]); r.relic = relic; }
  catch (e) { r = { cls, mode, diff, asc, crash: e.message.slice(0, 200), issues: [] }; await page.reload(); await page.waitForTimeout(300); await page.addScriptTag({ content: fs.readFileSync('bot.js', 'utf8') }); await page.evaluate(() => { const P = window.__T.PROF; for (const k of ['c_berserker','c_paladin','c_gambler','c_necro','c_nightmare','c_ranger','c_trapper','c_alch']) P.done[k] = 1; for (const k of Object.keys(window.__T.RELICS)) P.relics[k] = 1; P.runes = { amber: 1, flooded: 1, crypt: 1 }; for (const k of Object.keys(window.__T.CLASSES)) P.won[k] = { short: 1, standard: 1, hard: 1 }; }); }
  r.pageErrors = errs.slice(errBefore);
  results.push(r);
}
fs.writeFileSync('sweep.json', JSON.stringify(results, null, 1));
console.log('games', results.length, 'in', Math.round((Date.now() - t0) / 1000) + 's');
const allIssues = {};
for (const r of results) for (const i of [...(r.issues || []), ...(r.pageErrors || []), ...(r.crash ? ['CRASH ' + r.crash] : [])]) { const k = i.split(':')[0]; (allIssues[k] = allIssues[k] || []).push(`${r.cls}/${r.mode}/${r.diff}: ${i}`); }
for (const [k, v] of Object.entries(allIssues)) console.log(`ISSUE ${k} x${v.length}\n   ` + v.slice(0, 3).join('\n   '));
const by = {};
for (const r of results) { const k = r.cls; by[k] = by[k] || { n: 0, won: 0, depth: 0 }; by[k].n++; by[k].won += r.won ? 1 : 0; by[k].depth += r.depth || 0; }
console.log('per class (wins/games, avg depth):', Object.entries(by).map(([k, v]) => `${k} ${v.won}/${v.n} d${(v.depth / v.n).toFixed(1)}`).join(' | '));
const bm = {};
for (const r of results) { const k = r.mode + '/' + r.diff + (r.asc ? '/A' + r.asc : '') + (r.alt ? '/alt' : ''); bm[k] = bm[k] || { n: 0, won: 0, depth: 0 }; bm[k].n++; bm[k].won += r.won ? 1 : 0; bm[k].depth += r.depth || 0; }
console.log('per mode:', Object.entries(bm).map(([k, v]) => `${k} ${v.won}/${v.n} d${(v.depth / v.n).toFixed(1)}`).join(' | '));
const killers = {}; for (const r of results) if (r.dead && r.by) { const m = r.by.match(/^The (.+?)('s| hits| destroys)|^(An arrow from the (.+?) )|^(Spikes|A dart|Fire bursts)/); const k = m ? (m[1] || m[4] || m[5]) : r.by.slice(0, 30); killers[k] = (killers[k] || 0) + 1; }
console.log('deaths by:', JSON.stringify(killers));
console.log('hollow reached:', results.filter(r => r.hollow).length, 'true endings:', results.filter(r => r.trueEnd).length);
console.log('forced descends (bot got lost):', results.reduce((a, r) => a + (r.forced || 0), 0));
await b.close();
