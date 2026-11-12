// Builds the sprite showcase page from art/sprites/*.png (sprites inlined as data: URIs).
// usage: node art/make-showcase.mjs art/sprites <out.html>
// Published as https://claude.ai/artifact/882QsHfAVyJrHBDXm7kve8 (republish to that url to keep the link).
import fs from 'fs';
import path from 'path';
const [dir, out] = process.argv.slice(2);
const spr = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.png'))) spr[f.slice(0, -4)] = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');

// Animations: frames, ms per frame, and how many extra frames to rest on the first one.
const range = (p, n) => Array.from({ length: n }, (_, i) => `${p}${i + 1}`);
const ANIM = {
  torch: { frames: range('torch-flame-', 5), ms: 120, hold: 0 },
  mossytorch: { frames: range('torch-mossy-flame-', 5), ms: 120, hold: 0 },
  shimmer: { frames: ['water', 'water-2'], ms: 520, hold: 0 },
  drip: { frames: range('water-drop-', 9), ms: 110, hold: 7 },
  trap: { frames: ['trap', 'trap', 'trap', 'trap-sprung'], ms: 380, hold: 0 },
  danger: { frames: ['danger', null], ms: 300, hold: 0 },
};
for (const a of Object.values(ANIM)) for (const f of a.frames) if (f && !spr[f]) throw new Error('missing sprite ' + f);

const groups = [
  ['Dungeon', 'The stone the dungeon is built from.', [
    ['floor', 'Floor'], ['floor-2', 'Mossy floor'], ['floor-cracked', 'Cracked floor'],
    ['wall', 'Wall'], ['wall-2', 'Mossy wall'], ['wall-cracked', 'Cracked wall', 'a secret room behind it'],
    ['torch-flame-1', 'Torch', null, 'torch'], ['torch-mossy-flame-1', 'Mossy torch', null, 'mossytorch'],
    ['stairs', 'Stairs down'], ['stairs-locked', 'Locked stairs', 'until the boss falls'],
    ['bones', 'Bones'], ['bones-2', 'A bone'], ['bones-3', 'Skull'], ['rune', 'Rune', 'rare']]],
  ['Water', 'A puddle, in two animations.', [
    ['water', 'Shimmer', null, 'shimmer'], ['water-drop-1', 'Drip', null, 'drip']]],
  ['Traps', 'Watch your step.', [
    ['trap', 'Spike trap', null, 'trap'], ['web', 'Web', 'slows you'], ['web-2', 'Web, torn'],
    ['snare', 'Snare', 'the Trapper sets these'], ['danger', 'Danger!', 'something big is coming', 'danger']]],
  ['Loot', 'What you came down here for.', [
    ['gold', 'Gold'], ['chest', 'Chest', 'or a mimic'], ['weapon', 'Weapon'], ['armor', 'Armor'], ['scroll', 'Scroll']]],
  ['Potions', 'Each one its own colour.', [
    ['potion', 'Healing'], ['potion-strength', 'Strength', 'double damage'], ['potion-haste', 'Haste', 'two moves for one'], ['potion-antidote', 'Antidote', 'cures poison']]],
  ['Creatures', 'Who you are, and the first thing that bites.', [
    ['knight', 'The hero'], ['rat', 'Rat', 'floor 1']]],
];

const card = ([id, name, note, anim]) => `<figure class="spr">
  <div class="px"><img src="${spr[id]}" alt="${name}"${anim ? ` data-anim="${anim}"` : ''} width="16" height="16"></div>
  <figcaption><b>${name}</b>${note ? `<span>${note}</span>` : ''}</figcaption>
</figure>`;

const html = `<title>Amber Depths Sprites</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=VT323&family=JetBrains+Mono:wght@400;700&display=swap">
<style>
/* Layout: one column, like a page torn from the game itself: a lit room first, the sprite sheet below. Single dark look. */
:root {
  --bg: #120d08; --panel: #1b140c; --line: #3a2a16; --amber: #ffb547; --hot: #ffd894; --dim: #a9773a; --fog: #5e4527;
  --display: "VT323", "JetBrains Mono", ui-monospace, monospace; --mono: "JetBrains Mono", ui-monospace, Consolas, monospace;
  color-scheme: dark;
}
body { background: var(--bg); color: var(--amber); font-family: var(--mono); font-size: 14px; line-height: 1.5; }
.wrap { max-width: 860px; margin: 0 auto; padding-block: 28px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 36px; }
header { display: grid; gap: 6px; }
h1 { font-family: var(--display); font-weight: 400; font-size: clamp(44px, 10vw, 76px); line-height: .9; margin: 0; color: var(--hot); text-shadow: 0 0 14px rgba(255,181,71,.45); letter-spacing: .02em; text-wrap: balance; }
.sub { margin: 0; color: var(--dim); max-width: 60ch; }
.scene { display: grid; gap: 10px; }
.stage { position: relative; background: #000; border: 1px solid var(--line); padding: 10px; }
canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; }
.bar { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; justify-content: space-between; }
.cap { margin: 0; color: var(--dim); font-size: 12px; }
.toggle { display: inline-flex; border: 1px solid var(--line); }
.toggle button { font: 700 12px var(--mono); letter-spacing: .08em; text-transform: uppercase; background: transparent; color: var(--dim); border: 0; padding: 8px 14px; cursor: pointer; }
.toggle button[aria-pressed="true"] { background: var(--amber); color: var(--bg); }
.toggle button:focus-visible { outline: 2px solid var(--hot); outline-offset: 2px; }
section { display: grid; gap: 14px; }
h2 { font-family: var(--display); font-weight: 400; font-size: 34px; line-height: 1; margin: 0; color: var(--hot); }
h2 + p { margin: -8px 0 0; color: var(--dim); font-size: 13px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 14px; }
.spr { margin: 0; display: grid; gap: 8px; align-content: start; }
.px { background: var(--panel); border: 1px solid var(--line); aspect-ratio: 1; max-width: 100%; display: grid; place-items: center; }
.px img { width: 75%; height: auto; image-rendering: pixelated; }
figcaption { display: grid; gap: 1px; font-size: 12px; }
figcaption b { color: var(--amber); font-weight: 700; }
figcaption span { color: var(--dim); }
footer { color: var(--fog); font-size: 12px; border-top: 1px solid var(--line); padding-top: 14px; }
</style>
<div class="wrap">
  <header>
    <h1>Amber Depths</h1>
    <p class="sub">The sprites for our little dungeon game. Every picture below is 16 by 16 pixels, drawn by hand, one pixel at a time.</p>
  </header>

  <div class="scene">
    <div class="stage"><canvas id="room" width="960" height="640" aria-label="A small dungeon room drawn with the sprites: a knight, a wandering rat, loot, potions, traps, puddles, torches and stairs."></canvas></div>
    <div class="bar">
      <p class="cap" id="cap">A room on floor 1. The rat wanders; the torches flicker; the water drips.</p>
      <div class="toggle" role="group" aria-label="How the map is drawn">
        <button type="button" id="b-pic" aria-pressed="true">Sprites</button>
        <button type="button" id="b-txt" aria-pressed="false">Before</button>
      </div>
    </div>
  </div>

  ${groups.map(([h, p, items]) => `<section><h2>${h}</h2><p>${p}</p><div class="grid">${items.map(card).join('')}</div></section>`).join('\n  ')}

  <footer>Amber Depths is a small retro dungeon crawler. Before these sprites, everything was drawn with letters: you were an @, and rats were an r.</footer>
</div>
<script>
const SPR = ${JSON.stringify(spr)};
const ANIM = ${JSON.stringify(ANIM)};
const img = {};
for (const k in SPR) { const i = new Image(); i.src = SPR[k]; img[k] = i; }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
// The sprites' own small frame-by-frame animations always play (they're gentle); the wandering rat and the torch glow
// follow Reduce Motion.
function frameAt(name, t) { const a = ANIM[name], n = a.frames.length + a.hold, i = (t / a.ms | 0) % n; return a.frames[i < a.frames.length ? i : 0]; }

// Room plan, 15 x 10. W wall, w mossy wall, K cracked wall, T torch, t mossy torch (both animated),
// . floor, , mossy floor, c cracked floor, ~ shimmer puddle, d dripping puddle, > stairs, L locked stairs.
const PLAN = [
  'WWWTWWWwWWWTWWW',
  'W.,....W...,..W',
  'W......W.....>W',
  'W..c...w......w',
  'W.............W',
  'w....~....d...W',
  'W..,.....c....K',
  'W.......,.....W',
  'W.c....~...,.LW',
  'WWWWWWtWWWWwWWW',
];
const H = PLAN.length, Wd = PLAN[0].length, T = 64;
// Things on the floor: [x, y, sprite or animation, letter, letter colour]
const OBJ = [
  [2, 2, 'potion', '!', '#ff5d5d'], [10, 7, 'potion-strength', '!', '#ff9a3c'], [12, 3, 'potion-haste', '!', '#5fe3ff'], [3, 7, 'potion-antidote', '!', '#6dff8a'],
  [9, 1, 'gold', '$', '#ffd700'], [4, 4, 'gold', '$', '#ffd700'], [12, 1, 'chest', '=', '#c98f45'], [8, 2, 'scroll', '?', '#e8e0c8'],
  [1, 4, 'weapon', ')', '#e0e0e0'], [1, 5, 'armor', '[', '#e0e0e0'],
  [1, 1, 'web', '"', '#d8d8d8'], [6, 1, 'web-2', '"', '#d8d8d8'], [11, 8, 'bones', '%', '#e8e0c8'], [12, 8, 'bones-3', '%', '#e8e0c8'], [13, 7, 'bones-2', '%', '#e8e0c8'],
  [8, 4, 'trap', '^', '#ff7043'], [5, 7, 'snare', '×', '#c0c0c0'], [11, 5, 'danger', '≈', '#ff3030'], [4, 1, 'rune', '¤', '#c060ff'],
];
const hero = [6, 5];
let rat = [9, 3];
const floorish = (x, y) => '.,c'.includes(PLAN[y][x]);
const blocked = (x, y) => !floorish(x, y) || (x === hero[0] && y === hero[1]) || OBJ.some(o => o[0] === x && o[1] === y);
const TILE = { W: 'wall', w: 'wall-2', K: 'wall-cracked', t: 'torch-2', '.': 'floor', ',': 'floor-2', c: 'floor-cracked', '>': 'stairs', L: 'stairs-locked' };
const LETTER = { W: ['#', '#c98f45'], w: ['#', '#c98f45'], K: ['▒', '#a9773a'], T: ['ψ', '#ffb547'], t: ['ψ', '#ffb547'], '.': ['.', '#e7a54a'], ',': ['.', '#e7a54a'], c: ['.', '#e7a54a'], '>': ['>', '#ffd894'], L: ['>', '#ff6a3d'], '~': ['~', '#6aa8ff'], d: ['~', '#6aa8ff'] };

const cv = document.getElementById('room'), g = cv.getContext('2d');
g.imageSmoothingEnabled = false;
let mode = 'pic', t0 = performance.now();
function sprite(k, t) { return ANIM[k] ? frameAt(k, t) : k; }
function draw(now) {
  const t = now - t0;
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  if (mode === 'txt') {
    g.font = '700 46px "JetBrains Mono", Consolas, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const put = (x, y, ch, col) => { g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 10; g.fillText(ch, x * T + T / 2, y * T + T / 2 + 2); };
    for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) { const c = PLAN[y][x], [ch, col] = LETTER[c]; put(x, y, c === '~' || c === 'd' ? (((t / 450 + x * .7 + y) | 0) % 3 ? '~' : '-') : ch, col); }
    for (const [x, y, k, ch, col] of OBJ) if (k !== 'danger' || frameAt('danger', t)) put(x, y, ch, col);
    put(rat[0], rat[1], 'r', '#e7a54a'); put(hero[0], hero[1], '@', '#ffd894');
    g.shadowBlur = 0;
    return;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
    const c = PLAN[y][x];
    const k = c === 'T' ? frameAt('torch', t + x * 370) : c === 't' ? frameAt('mossytorch', t + x * 370) : c === '~' ? frameAt('shimmer', t + x * 200) : c === 'd' ? frameAt('drip', t) : TILE[c];
    g.drawImage(img[k], x * T, y * T, T, T);
  }
  // torchlight: a soft warm glow that breathes
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) if ('Tt'.includes(PLAN[y][x])) {
    const f = reduce ? .22 : .2 + .06 * Math.sin(t / 140 + x) + .03 * Math.sin(t / 53 + x * 3);
    const cy = y === 0 ? y * T + T * .4 : y * T + T * .6;
    const gr = g.createRadialGradient(x * T + T / 2, cy, 4, x * T + T / 2, cy, T * 3.2);
    gr.addColorStop(0, 'rgba(255,170,60,' + f + ')'); gr.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = gr; g.fillRect(x * T - T * 3, y * T - T * 3, T * 7, T * 7);
  }
  for (const [x, y, k] of OBJ) { const s = sprite(k, t); if (s) g.drawImage(img[s], x * T, y * T, T, T); }
  g.drawImage(img.rat, rat[0] * T, rat[1] * T, T, T);
  g.drawImage(img.knight, hero[0] * T, hero[1] * T, T, T);
}
function wander() {
  const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [rat[0] + dx, rat[1] + dy]).filter(([x, y]) => !blocked(x, y));
  if (opts.length) rat = opts[Math.random() * opts.length | 0];
}
// Start at once (pictures not loaded yet are simply skipped for a frame).
setInterval(() => draw(performance.now()), 50);
if (!reduce) setInterval(wander, 650);
const bp = document.getElementById('b-pic'), bt = document.getElementById('b-txt'), cap = document.getElementById('cap');
function setMode(m) {
  mode = m; bp.setAttribute('aria-pressed', String(m === 'pic')); bt.setAttribute('aria-pressed', String(m === 'txt'));
  cap.textContent = m === 'pic' ? 'A room on floor 1. The rat wanders; the torches flicker; the water drips.' : 'The same room, the way the game drew it before: all letters.';
}
bp.onclick = () => setMode('pic'); bt.onclick = () => setMode('txt');

// Animated sprites in the gallery
const anims = [...document.querySelectorAll('img[data-anim]')];
const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
setInterval(() => { const t = performance.now() - t0; for (const el of anims) { const f = frameAt(el.dataset.anim, t); const src = f ? SPR[f] : blank; if (el.src !== src) el.src = src; } }, 50);
</script>
`;
fs.writeFileSync(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(1) + ' KB');
