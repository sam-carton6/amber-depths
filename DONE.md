# Amber Depths — done (the archive)

Finished work, moved out of TODO.md so a new chat reads less. Nothing here needs doing. Newest first.

<!-- Format:
### YYYY-MM-DD — what was done (commit abc1234)
- One or two lines on how it works or anything a future chat should know.
-->

### 2026-10-27 — v6: fixes for the independent tester's bugs 1–5 (on staging)
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
