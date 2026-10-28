# Amber Depths: project handoff

An amber-CRT ASCII roguelike, built as one self-contained HTML file. It runs as a Claude artifact and as an installable phone app (PWA) hosted on GitHub Pages.

- **Source of truth:** `amber-depths-source.html` (the artifact version, about 2,800 lines, with all CSS and JS inline).
- **Live artifact:** https://claude.ai/artifact/W7Vj7dh7naTGKmMx4E6rKn. Read it with the Artifact tool, then republish to the same URL to update it.
- **Phone app:** https://sam-carton6.github.io/amber-depths/
- **Repo:** `sam-carton6/amber-depths`

## Owner preferences
- Be honest and blunt but constructive. Say when something is a bad idea.
- **Fun matters more than balance.** They want long-term goals, unlocks and reasons to come back.
- They mostly play on an **iPhone 17**, installed to the home screen.
- Don't build when they're only asking a question. Ask, or answer, first.
- Test before shipping. They asked for: update, test, update, test.

## How deployment works (updated Oct 27, evening)
The repo now publishes the **`app/` folder** directly. `.github/workflows/deploy.yml` uploads `app/` to GitHub Pages on every push to `main`, and the zip is gone. Another Claude Code session also added Project Kit files: CLAUDE.md, README.md, TODO.md, BUGS.md and DONE.md.

`app/` holds 10 flat files: `index.html, sw.js, manifest.webmanifest, apple-touch-icon.png, icon-192.png, icon-512.png, maskable-512.png, vt323.woff2, jbm-400.woff2, jbm-700.woff2`.

**Done (Oct 27, late):** the source and tests now live in the repo under `src/`, and `node src/build.mjs` builds `app/index.html` and bumps `VERSION` in `app/sw.js` automatically. The repo's CLAUDE.md has the current steps. The manual steps below are kept only as a record of what the script does.

The phone picks up a new version the next time the app opens online, because the service worker fetches `index.html` network-first.

## Building app/index.html from the source (what src/build.mjs does)
1. The icons, fonts, manifest and sw.js already live in `app/`.
2. Rebuild `index.html` from `amber-depths-source.html`:
   - Remove the `<meta name="claude:viewport-fit-sides">` line and both Google Fonts `<link>` lines.
   - Add these lines at the top of the `<style>` block:
     ```css
     @font-face { font-family: "VT323"; src: url("vt323.woff2") format("woff2"); font-display: swap; }
     @font-face { font-family: "JetBrains Mono"; src: url("jbm-400.woff2") format("woff2"); font-weight: 400; font-display: swap; }
     @font-face { font-family: "JetBrains Mono"; src: url("jbm-700.woff2") format("woff2"); font-weight: 700; font-display: swap; }
     :root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
     html { overscroll-behavior: none; -webkit-text-size-adjust: 100%; background: #120d08; }
     body { margin: 0; font-size: 14px; }
     ```
   - Wrap it in a full document. Use `<!doctype html><html lang="en"><head>`, then these head tags, then the title and style, then `</head><body>` and the rest:
     ```html
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
     <meta name="theme-color" content="#120d08">
     <meta name="apple-mobile-web-app-capable" content="yes">
     <meta name="mobile-web-app-capable" content="yes">
     <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
     <meta name="apple-mobile-web-app-title" content="Amber Depths">
     <link rel="manifest" href="manifest.webmanifest">
     <link rel="apple-touch-icon" href="apple-touch-icon.png">
     <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
     ```
   - Just before `</body>`, register the service worker:
     ```html
     <script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));</script>
     ```
3. In `app/sw.js`, bump `const VERSION = 'amber-depths-vN'`. The latest build is **v4**; the next one is v5.
4. Test it: serve the folder over local HTTP, check that the service worker registers, then switch offline, reload, and confirm it still plays.

## Code map (inside the single HTML file)
- **Title screen:**
  - `buildTitle()` draws the class, mode, difficulty, ability, Ascension and relic pickers.
  - The daily run banner is `renderDaily()`.
- **Game state:** a single global `S`.
  - Saving is `saveGame()` / `loadGame()`, which serialize `S` to localStorage. The `Set`s are turned into arrays, and `S.C`, `S.M` and `S.D` are rebuilt on load. `S.D` comes from `buildD(diff, asc)`.
- **Generation:**
  - `descend()` seeds the RNG for the daily run, then calls `genFloor()`, `genBoss()` or `genHollow()`.
  - Floor contents come from `decorate()` (themes), `placeShop()`, `placeSecret()`, `placeTraps()` and `placeGolem()`.
  - Generation code must use `RNG()`, `rnd()` and `pick()`, never `Math.random`, so daily dungeons stay deterministic.
- **Turns:**
  - `act(dx, dy)` calls `playerMove()`, then `endTurn()`. `endTurn()` ticks statuses, spots traps, then runs `monstersTurn()`.
  - Monster turns branch: `allyTurn`, `heartTurn`, `golemTurn`, `bossTurn` (the Wyrm), or normal AI.
  - `monStep()` sets off traps when a monster moves onto one.
- **Abilities:** `ability()` handles the main abilities, and `altAbility()` the Gold-mastery alternates (in the `ALT` table).
  - The Ranger's aim uses `S.aiming`, and `act()` routes the next direction into `volley()`.
- **Progression:** a persistent `PROF` object, stored under localStorage key `amber-depths-profile`.
  - Challenges are in the `CH` table. Count-based ones have a `prog()`; event-based ones call `complete(id)`.
  - `creditWyrm()` handles everything that happens when the Wyrm dies.
  - `finishRun()` writes run history and the daily result.
- **Sound and music:** the `SND` module, which generates WebAudio in code. It has three music tracks (title, dungeon, boss) and named sound effects.
- **Other localStorage keys:**
  - `amber-depths-save` (current run)
  - `amber-depths-sel` (title-screen choices)
  - `amber-depths-best`
  - `amber-depths-daily`
  - `amber-depths-history`
  - `amber-depths-mute`
  - `amber-depths-music`

## Content currently in the game
- **10 classes:** Warrior, Rogue, Mage, Necromancer, Berserker, Paladin, Gambler, Ranger, Trapper, Alchemist. Seven are unlocked through challenges. Each has a Gold-mastery alternate ability.
- **Run lengths:** Short (5 floors), Standard (10), Endless.
- **Difficulties:** Easy, Normal, Hard, and Nightmare (unlockable; no shops, double gold).
- **Ascension 1–10:** Standard length on Nightmare only. Modifiers are in the `ASC` list.
- **Zones:** Amber Caves, Flooded Halls, Bone Crypt, the Wyrm's Lair, and the secret Hollow.
- **Bosses:** Stone Golem (mid-run), Amber Wyrm (final), and Amber Heart (secret).
- **Secret path:** three runes `¤` can appear in secret rooms, one per zone, only on non-daily Standard or Endless runs. With all three, killing the Wyrm opens stairs to the Hollow instead of ending the run.
- **Other systems:** 12 relics, the daily run, run history, the in-game guide (G), the challenges screen (C), and 5 screen colors.

## Testing harness
`test-bot.js` is a bot that runs inside the page and plays real games:
- It explores, fights, uses potions and abilities, and dodges telegraphed attacks.
- It checks invariants every turn: NaN stats, monsters stacked on each other or inside walls, items under the merchant, unreachable stairs, save/load mismatches, and stalls.

`test-sweep.mjs` runs that bot across every class, mode, difficulty, Ascension level, alternate ability and relic in headless Chromium through Playwright.
- It needs a copy of the source exposing `window.__T`. Do that by replacing `showScreen('title');\n(document.fonts` with `window.__T = { get S(){return S}, ... }; showScreen('title');\n(document.fonts`. The exact list of exposed functions is in the sweeps' usage.
- Run it with `node test-sweep.mjs <reps>`.

Results at the last sweep: about 300 games, zero errors. Win rates: Short Normal about 100%, Standard Normal about 70%, A5 about 20%, A10 about 15%.

## Open items
- An **independent tester** (a fresh agent trying to break the game) was promised but hasn't run yet.
- The owner is collecting a **bug list** from real iPhone play. Expect touch, Safari and feel issues that headless Chromium can't catch.
- Balance is probably on the easy side below Ascension. The owner is fine with that.
- **Possible future ideas:** more classes, a second wave of relics, cosmetic titles on daily share text, and leaderboards. Leaderboards would need a backend.
