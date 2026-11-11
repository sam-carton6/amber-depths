// Builds the sprite showcase page from art/sprites/*.png (sprites inlined as data: URIs).
// usage: node make-showcase.mjs <sprites dir> <out.html>
import fs from 'fs';
import path from 'path';
const [dir, out] = process.argv.slice(2);
const spr = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.png'))) spr[f.slice(0, -4)] = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');

const groups = [
  ['Dungeon', 'The stone the dungeon is built from.', [
    ['floor', 'Floor'], ['floor-2', 'Mossy floor'], ['wall', 'Wall'], ['wall-2', 'Mossy wall'],
    ['torch', 'Torch'], ['torch-2', 'Mossy torch'], ['crack', 'Cracked wall', 'hides a secret room'],
    ['stairs', 'Stairs down'], ['stairs-locked', 'Locked stairs', 'until the boss falls']]],
  ['Water', 'A puddle, in two animations.', [
    ['water', 'Shimmer', null, ['water', 'water-2']],
    ['water-drop-1', 'Drip', null, ['water-drop-1', 'water-drop-2', 'water-drop-3', 'water-drop-4', 'water-drop-5', 'water-drop-6', 'water-drop-7', 'water-drop-8', 'water-drop-9']]]],
  ['Potions', 'Each one its own colour.', [
    ['potion', 'Healing'], ['potion-strength', 'Strength', 'double damage'], ['potion-haste', 'Haste', 'two moves for one'], ['potion-antidote', 'Antidote', 'cures poison']]],
  ['Creatures', 'Who you are, and the first thing that bites.', [
    ['knight', 'The hero'], ['rat', 'Rat', 'floor 1']]],
];

const card = ([id, name, note, anim]) => `<figure class="spr">
  <div class="px"><img src="${spr[id]}" alt="${name}"${anim ? ` data-anim="${anim.join(',')}"` : ''} width="16" height="16"></div>
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
.spr { margin: 0; display: grid; gap: 8px; }
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
    <p class="sub">The first sprites for our little dungeon game. Every picture below is 16 by 16 pixels, drawn by hand, one pixel at a time.</p>
  </header>

  <div class="scene">
    <div class="stage"><canvas id="room" width="832" height="576" aria-label="A small dungeon room drawn with the sprites: a knight, a wandering rat, potions, puddles, torches and stairs."></canvas></div>
    <div class="bar">
      <p class="cap" id="cap">A room on floor 1. The rat wanders; the water drips.</p>
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
const img = {};
for (const k in SPR) { const i = new Image(); i.src = SPR[k]; img[k] = i; }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Room plan, 13 x 9. W wall, w mossy wall, T torch, t mossy torch, C cracked wall, . floor, , mossy floor,
// ~ shimmer puddle, d dripping puddle, > stairs. Things on the floor are placed separately.
const PLAN = [
  'WWWTWWWWwWtWW',
  'W.,....W....W',
  'W..........>W',
  'W.....,.....w',
  'W..,........W',
  'w....~...d..W',
  'W.......,...W',
  'W..,....~...W',
  'WWWWWCWWWWwWW',
];
const H = PLAN.length, Wd = PLAN[0].length, T = 64;
const items = [[2, 2, 'potion'], [9, 7, 'potion-strength'], [10, 3, 'potion-haste'], [3, 6, 'potion-antidote']];
const hero = [5, 4];
let rat = [8, 2];
const floorish = (x, y) => '.,'.includes(PLAN[y][x]);
const blocked = (x, y) => !floorish(x, y) || (x === hero[0] && y === hero[1]) || items.some(i => i[0] === x && i[1] === y);
const tileFor = c => ({ W: 'wall', w: 'wall-2', T: 'torch', t: 'torch-2', C: 'crack', '.': 'floor', ',': 'floor-2', '>': 'stairs', '~': 'water', d: 'water-drop-1' })[c];
const LETTER = { W: ['#', '#c98f45'], w: ['#', '#c98f45'], T: ['ψ', '#ffb547'], t: ['ψ', '#ffb547'], C: ['▒', '#a9773a'], '.': ['.', '#e7a54a'], ',': ['.', '#e7a54a'], '>': ['>', '#ffd894'], '~': ['~', '#6aa8ff'], d: ['~', '#6aa8ff'] };

const cv = document.getElementById('room'), g = cv.getContext('2d');
g.imageSmoothingEnabled = false;
let mode = 'pic', t0 = performance.now();
function draw(now) {
  const t = now - t0;
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  if (mode === 'txt') {
    g.font = '700 46px "JetBrains Mono", Consolas, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const put = (x, y, ch, col) => { g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 10; g.fillText(ch, x * T + T / 2, y * T + T / 2 + 2); };
    for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) { const [ch, col] = LETTER[PLAN[y][x]]; put(x, y, PLAN[y][x] === '~' || PLAN[y][x] === 'd' ? (((t / 450 + x * .7 + y) | 0) % 3 ? '~' : '-') : ch, col); }
    for (const [x, y, k] of items) put(x, y, '!', { potion: '#ff5d5d', 'potion-strength': '#ff9a3c', 'potion-haste': '#5fe3ff', 'potion-antidote': '#6dff8a' }[k]);
    put(rat[0], rat[1], 'r', '#e7a54a'); put(hero[0], hero[1], '@', '#ffd894');
    g.shadowBlur = 0;
    return;
  }
  const shimmer = reduce ? 'water' : ((t / 520) | 0) % 2 ? 'water-2' : 'water';
  const dc = reduce ? 0 : (t / 110 | 0) % 22; // 9 frames of drip, then a pause on the still puddle
  const drip = 'water-drop-' + (dc < 9 ? dc + 1 : 1);
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
    const c = PLAN[y][x];
    const k = c === '~' ? shimmer : c === 'd' ? drip : tileFor(c);
    g.drawImage(img[k], x * T, y * T, T, T);
  }
  // torchlight: a soft warm glow that breathes
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) if ('Tt'.includes(PLAN[y][x])) {
    const f = reduce ? .22 : .2 + .06 * Math.sin(t / 140 + x) + .03 * Math.sin(t / 53 + x * 3);
    const gr = g.createRadialGradient(x * T + T / 2, y * T + T * .4, 4, x * T + T / 2, y * T + T * .4, T * 3.2);
    gr.addColorStop(0, 'rgba(255,170,60,' + f + ')'); gr.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = gr; g.fillRect(x * T - T * 3, y * T - T * 3, T * 7, T * 7);
  }
  for (const [x, y, k] of items) g.drawImage(img[k], x * T, y * T, T, T);
  g.drawImage(img.rat, rat[0] * T, rat[1] * T, T, T);
  g.drawImage(img.knight, hero[0] * T, hero[1] * T, T, T);
}
function loop(now) { draw(now); if (!reduce) requestAnimationFrame(loop); }
function wander() {
  const opts = [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]].map(([dx, dy]) => [rat[0] + dx, rat[1] + dy]).filter(([x, y]) => !(x === rat[0] && y === rat[1]) && !blocked(x, y));
  if (opts.length) rat = opts[Math.random() * opts.length | 0];
  if (reduce) draw(performance.now());
}
Promise.all(Object.values(img).map(i => i.decode().catch(() => {}))).then(() => {
  requestAnimationFrame(loop);
  if (!reduce) setInterval(wander, 650);
});
const bp = document.getElementById('b-pic'), bt = document.getElementById('b-txt'), cap = document.getElementById('cap');
function setMode(m) {
  mode = m; bp.setAttribute('aria-pressed', String(m === 'pic')); bt.setAttribute('aria-pressed', String(m === 'txt'));
  cap.textContent = m === 'pic' ? 'A room on floor 1. The rat wanders; the water drips.' : 'The same room, the way the game drew it before: all letters.';
  if (reduce) draw(performance.now());
}
bp.onclick = () => setMode('pic'); bt.onclick = () => setMode('txt');

// Animated sprites in the gallery
const anims = [...document.querySelectorAll('img[data-anim]')].map(el => ({ el, frames: el.dataset.anim.split(',') }));
if (!reduce) setInterval(() => { const n = Date.now(); for (const a of anims) { const sp = a.frames.length > 2 ? 110 : 520, len = a.frames.length > 2 ? a.frames.length + 13 : a.frames.length; const i = (n / sp | 0) % len; a.el.src = SPR[a.frames[i < a.frames.length ? i : 0]]; } }, 55);
</script>
`;
fs.writeFileSync(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(1) + ' KB');
