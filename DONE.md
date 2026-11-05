# Amber Depths — done (the archive)

Finished work, moved out of TODO.md so a new chat reads less. Nothing here needs doing. Newest first.

<!-- Format:
### YYYY-MM-DD — what was done (commit abc1234)
- One or two lines on how it works or anything a future chat should know.
-->

### 2026-11-05 — v20: pack stays open on gear swaps, Pack Mule relic, Sell all junk (on staging)
- `useItem()` keeps the pack open for gear when no enemy is in sight, re-renders it after the turn, and closes it if
  an enemy appears. Pack size goes through `packMax()` (Pack Mule +5). Junk = gear not better than what's worn
  (`junkGear()`); the shop's Sell all junk button sells it at the normal third of the price.
- Tested each in the browser; bot sweep with Pack Mule (10 classes, Standard).

### 2026-11-05 — v19 merged to `main` (commit 0aed9ae)
- Deploy passed; live index.html and sw.js match `main` (VERSION v19). Includes v18 and v19.

### 2026-11-05 — v19: Phoenix Feather relic, Golem gets the deep curve (on staging)
- Phoenix Feather (`phoenix` in `RELICS`): `die()` checks it first; once per run (`S.revived`) you come back at half
  max HP with statuses cleared. Collector II now counts every relic (13), so players who had all 12 keep the badge.
- The Golem's melee and slam use `DEEP_DMG ** deep()` like other monsters (floor 30 Golem bonus 10 -> 20).
- Bot sweep with the feather, 20 games (Standard and Endless Hard, every class): every death had used the revive
  first, no errors.

### 2026-11-05 — v18: Backup and restore (on staging)
- Title-screen Backup sheet: every `amber-depths-*` key, gzipped (CompressionStream) and base64'd into an `AD1z:`
  code (24 KB of data became 5 KB), or the same code as a .txt file (share sheet on phones, download elsewhere).
  Restore from a pasted code or file replaces all keys after a confirm, then reloads. Also calls
  `navigator.storage.persist()`. Tested: wipe + restore gave identical data and the run continued; bad codes are
  refused. Not tested: Save as file and Open file on a real iPhone.

### 2026-11-05 — v17 merged to `main` (commit 031a7c4)
- Deploy passed; live index.html and sw.js match `main` (VERSION v17). Includes v14-v17.

### 2026-11-05 — v17: numpad . and 0 swapped (. pack, 0 wait); Frost Nova freezes 5 turns, bosses 2 (on staging)
- Checked: two enemies frozen by Nova stay frozen for 4 of your turns after the cast (was 2).

### 2026-11-05 — v16: Golem upgrades, Rogue dodge, numpad controls (on staging)
- Upgrades ("boons", `BOONS` in the source): after a Golem in Endless (every 5 floors) or Standard (floor 5), a sheet
  offers 3 of 8; values scale with `boonTier()` = depth / 5. Stored in `S.bn` (numbers), `S.boons` (names taken);
  an open offer is `S.boonOffer` and reopens after a reload. Old saves just have none. Dodge caps at 50%.
- Rogue `dodge: .1` (melee and arrows only, not traps or telegraphed attacks). Numpad keys map by `e.code`, only on
  the game screen (so numpad 6 doesn't start the daily on the title).
- The test bot now picks a random upgrade. Soak: 40 Hard Endless games plus 10 Standard, no errors. The bot often
  skips floors it can't solve (and so the Golem), so most bot runs got 0-1 upgrades: it checks safety, not balance.
  Gotcha: `test/soak.js` must fetch the bot with no-store, or the browser hands back an old copy.

### 2026-11-05 — v14: Endless gets deadlier past floor 12 (on staging)
- Measured first: on Hard Endless the danger climbed to floor 12, then went flat (about 11 average hits to kill you from
  floor 12 to 80; potions piled to 50). Now, in Endless past floor 12, monster damage is multiplied by 1.04 per floor
  (in `makeMon`) and the kill-drop potion chance by 0.95 per floor. Short/Standard unchanged.
- Soak: 80 bot games per version (10 classes × 4, two tabs), `test/soak.js` hooked into the bot. Hits to kill you,
  old → new: f13-18 13.6 → 12, f19-24 13 → 8, f25-30 12 → 5.7, f31+ 11 → 5. Deepest bot run 81 → 33; median depth
  about the same (15-18, the bot dies early to its own mistakes). Gotcha: the browser cached the old test page,
  so load it with `?v=something` and check the page has the new code before soaking.

### 2026-10-28 — v13 merged to `main` (commit 905e9af)
- Deploy passed; live index.html and sw.js match `main` (VERSION v13).

### 2026-10-28 — v13: tester's bugs 6 and 7
- Bug 6: `loadHist()` ignores a history that isn't a list (and junk entries); profile fields with the wrong type reset
  to their defaults on load. Tested with broken storage: title, history and end screen all work.
- Bug 7: text changed to match the code (balance unchanged): A3 keeps the Wyrm/Heart floor potions, A6 includes the
  Amber Heart, Shield Wall doesn't halve poison/burn, Golden Shot costs 4 per floor on Short, and the shop's full-pack
  message says to sell gear (no "drop", the pack can't open there). Bot sweep: 20 games, all classes, no issues.

### 2026-10-28 — v9 merged to `main` (commit ab94b59)
- Deploy passed; live files match. The v8 no-delay fix is proven: a browser that loaded v8 just before the merge
  got v9 on its first reload, then dropped the v8 cache.

### 2026-10-28 — v9: scanlines everywhere, CRT sweep, calmer title blink
- Scanline pitches: 2px chips/bars (`--scan-2`), 3px buttons/cards/challenges (`--scan`), 4px sheets/toasts
  (`--scan-4`), 5px faint light lines on the page. `!important` so selected/pressed states keep them.
- `body::after` is a fixed beam sweeping down every 9 s behind everything (`isolation: isolate` on body keeps it
  above the page background). Off with reduced motion.
- The card stat lines used `.st`, the map's stairs class, so every title card pulsed like the stairs. Now only class
  cards pulse (`statglow`, 4.5 s, modest brightness).

### 2026-10-27 — v8 merged to `main` (commit ae04ebf)
- Deploy passed; live files match. A real browser with v7 installed moved to the v8 worker and cache by itself, and
  the page served through the new worker matches the server. The no-delay part gets its real proof at the next deploy.

### 2026-10-27 — v8 service worker: no more 10-minute update delay
- `sw.js` fetches the page with `cache: 'no-cache'` (ETag check) and installs assets with `cache: 'reload'`, so the
  browser's HTTP cache (GitHub Pages `max-age=600`) can't hand back an old page. Checked with a Node fake-browser
  test (install, online page, offline fallback, cached assets); the old sw.js fails it. Not run in a real browser:
  the Claude browser pane can't run service workers on localhost.

### 2026-10-27 — v7 merged to `main` (commit cec47f0): pixel font for UI text, CRT scanlines on boxes
- UI text uses "VT323 UI" (VT323 at 137%, defined in build.mjs); map/logo/ASCII art stay JetBrains Mono.
  Scanlines (`--scan`) on buttons, cards, challenges, sheets and the daily banner. Phone HUD: name on its own line.
- Deploy passed and live files match `app/`, but a browser that had loaded the page in the last 10 minutes got the
  old page once (HTTP cache, see TODO).

### 2026-10-27 — v6 merged to `main` (commit 6d039c8)
- Deploy passed; live files match `app/`, the live service worker moved to the v6 cache, no console errors.

### 2026-10-27 — v6: fixes for the independent tester's bugs 1–5
- Menu button ignored while the death/win animation plays; `die()`/`victory()` skip `showEnd` if the run changed.
- `.controls` gap 8px under 400px wide; `fit()` shrinks the map if the page still overflows (safe areas included).
  Measured: 375×812 and 402×874 fit with 47–62px top / 34px bottom insets simulated.
- `useItem()` refuses a potion at full HP (same check as the Potion button). `startDaily()` confirms before
  replacing a save. Ranger's fov 9 is set before the Ascension 4 Darkness cut (A4: Ranger 7, others 5).

### 2026-10-27 — v5 merged to `main` (commit 757287f)
- Deploy passed; live files match `app/`, `src/` isn't published, and a browser that had v1 installed moved to the
  v5 offline cache on its own.

### 2026-10-27 — Source into the repo, latest build (v5)
- `src/` holds the claude.ai source, HANDOFF.md and the test bot; `src/build.mjs` builds `app/index.html`.
- The live build had been the very first version; this brings in everything from claude.ai (10 classes, relics,
  Ascension, the Hollow). Bot sweep: 50 games, all classes, Short Hard to Nightmare A10, no issues or errors.

### 2026-10-27 — Merged to `main` (commit 12c42e6)
- Deploy run passed; live files match `app/` and the offline worker registers. Notes files aren't published.

### 2026-10-27 — Brought into the Project Kit
- Added CLAUDE.md, README.md, TODO.md, BUGS.md, DONE.md, .gitignore; created the `staging` branch.

### 2026-10-27 — Deploy from `app/` instead of a zip (commit b11b3cb)
- The app files moved out of `amber-depths-app.zip` into `app/`; the Pages workflow publishes that folder as-is.
