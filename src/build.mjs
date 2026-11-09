// Builds the phone app from the claude.ai artifact version of the game.
//   node src/build.mjs         -> app/index.html (and bumps VERSION in app/sw.js when index.html changed)
//   node src/build.mjs --test  -> test/game_test.html, a copy exposing window.__T for test-bot.js (not published)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const test = process.argv.includes('--test');
let src = fs.readFileSync(path.join(root, 'src/amber-depths-source.html'), 'utf8').replace(/\r\n/g, '\n');

// Swap that must happen exactly once, or the build stops (the source changed shape and this script needs updating).
const swap = (from, to) => {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`expected 1 match for ${JSON.stringify(from.slice(0, 60))}, found ${n}`);
  src = src.replace(from, () => to);
};

// The artifact-only head lines go; local fonts and phone-app tweaks go at the top of the stylesheet.
src = src.split('\n').filter(l => !l.includes('claude:viewport-fit-sides') && !l.includes('fonts.googleapis.com')).join('\n');
swap('<style>\n', `<style>
@font-face { font-family: "VT323"; src: url("vt323.woff2") format("woff2"); font-display: swap; }
@font-face { font-family: "VT323 UI"; src: url("vt323.woff2") format("woff2"); size-adjust: 137%; font-display: swap; }
@font-face { font-family: "JetBrains Mono"; src: url("jbm-400.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "JetBrains Mono"; src: url("jbm-700.woff2") format("woff2"); font-weight: 700; font-display: swap; }
@font-face { font-family: "Atkinson Hyperlegible Mono"; src: url("ahm-400.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Atkinson Hyperlegible Mono"; src: url("ahm-700.woff2") format("woff2"); font-weight: 700; font-display: swap; }
:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
html { overscroll-behavior: none; -webkit-text-size-adjust: 100%; background: #120d08; }
body { margin: 0; font-size: 14px; }

`);

// The test copy runs with reduced motion, like the original Playwright sweep (reducedMotion: 'reduce').
if (test) swap("const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;", 'const reduce = true;');
if (test) swap("showScreen('title');\n(document.fonts", `window.__T = { get S() { return S; }, sel, PROF, RELICS, CLASSES, W, H, PACK,
  newGame, monAt, shopAt, stats, buy, closeShop, descend, saveGame, loadGame, act, useItem, gearScore, ability, free, clear, itemAt, VAMP };
showScreen('title');
(document.fonts`);

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#120d08">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Amber Depths">
<meta name="description" content="Free retro ASCII roguelike for your browser and phone. Pick from 12 classes, dive the amber dungeon and slay the Wyrm, or go Endless.">
<!-- The test copy and the old GitHub Pages address serve this same page; this tells search engines the real one. -->
<link rel="canonical" href="https://amberdepths.com/">
<!-- Link previews (Messages, Discord, WhatsApp...): the picture and blurb shown when someone shares the link. -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Amber Depths">
<meta property="og:url" content="https://amberdepths.com/">
<meta property="og:title" content="Amber Depths: a retro ASCII roguelike">
<meta property="og:description" content="Free retro ASCII roguelike for your browser and phone. Pick from 12 classes, dive the amber dungeon and slay the Wyrm, or go Endless.">
<meta property="og:image" content="https://amberdepths.com/icon-512.png">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta property="og:image:alt" content="A glowing amber @ between two torches">
<meta name="twitter:card" content="summary">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="preload" href="jbm-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="vt323.woff2" as="font" type="font/woff2" crossorigin>
`;
// The <title> and <style> come first in the source; </style> ends the head.
swap('</style>\n', '</style>\n</head>\n<body>\n');
const sw = test ? '' : `<script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));</script>\n`;
const out = head + src.trimEnd() + '\n' + sw + '</body>\n</html>\n';
// The title screen's version tag says "dev" in the source (and the claude.ai artifact); the build writes in the
// sw.js VERSION number. It's left out when comparing, so the tag alone never counts as a change.
const VER_TAG = /<span class="ver" id="ver" aria-label="Version">[^<]*<\/span>/;
if (!VER_TAG.test(out)) throw new Error('version tag not found in the source');
const withVer = (html, v) => html.replace(VER_TAG, `<span class="ver" id="ver" aria-label="Version">${v}</span>`);

if (test) {
  fs.mkdirSync(path.join(root, 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/game_test.html'), withVer(out, 'test'));
  console.log('wrote test/game_test.html');
} else {
  const target = path.join(root, 'app/index.html');
  const old = fs.existsSync(target) ? fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') : '';
  if (withVer(old, 'dev') === out) { console.log('app/index.html already up to date'); process.exit(0); }
  // A new VERSION makes installed phones drop their old offline copy.
  const swPath = path.join(root, 'app/sw.js');
  const swSrc = fs.readFileSync(swPath, 'utf8');
  const m = swSrc.match(/const VERSION = 'amber-depths-v(\d+)';/);
  if (!m) throw new Error('VERSION line not found in app/sw.js');
  const v = Number(m[1]) + 1;
  fs.writeFileSync(target, withVer(out, 'v' + v));
  fs.writeFileSync(swPath, swSrc.replace(m[0], `const VERSION = 'amber-depths-v${v}';`));
  console.log(`wrote app/index.html, sw.js VERSION -> v${v}`);
}
