# Amber Depths — done (the archive)

Finished work, moved out of TODO.md so a new chat reads less. Nothing here needs doing. Newest first.

<!-- Format:
### YYYY-MM-DD — what was done (commit abc1234)
- One or two lines on how it works or anything a future chat should know.
-->

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
