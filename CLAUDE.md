# Amber Depths — notes for Claude

A little retro ASCII roguelike (dungeon diver) that runs in the browser and installs on a phone as an app (PWA).
A hobby game Sam plays with friends (mostly on an iPhone, from the home screen): changes shouldn't wipe anyone's
progress. Fun matters more than balance.
Sam's general rules are in `~/.claude/CLAUDE.md` (master copy: `Projects/_Project Kit/global-CLAUDE.md`); this file
adds what's specific to this project and wins where they differ.

Notes: [BUGS.md](BUGS.md) (Sam's inbox, read every chat), [TODO.md](TODO.md) (open work; read *Where things stand*
every chat), [DONE.md](DONE.md) (the archive; history only). Code map and game content:
[src/HANDOFF.md](src/HANDOFF.md) (read only the section the work needs).

## Where it runs
- **Kind:** web app (PWA)
- **Live:** GitHub Pages at https://sam-carton6.github.io/amber-depths/ — [deploy.yml](.github/workflows/deploy.yml)
  publishes the `app/` folder on every push to `main`. **Every push to `main` changes the game on friends' phones.**
- **Try `staging`:** `python -m http.server 8765` in the repo root, then http://localhost:8765/app/.
  (The service worker doesn't register there in the Claude browser pane; that's expected.)
- **Repo:** GitHub `sam-carton6/amber-depths` (**public**: free GitHub Pages needs it, so never commit anything
  private). Main copy on the tower: `D:\Users\Sam\Documents\Projects\Amber Depths`.
- The game also exists as a claude.ai artifact (link in src/HANDOFF.md), where it was first built.

## Branches
`main` = live, `staging` = all work. Merge `staging` → `main` only when Sam says "merge".

## Source and build
- **Edit [src/amber-depths-source.html](src/amber-depths-source.html), never `app/index.html`.** It's the
  claude.ai artifact version (one file, all CSS and JS inline).
- `node src/build.mjs` writes `app/index.html` from it (local fonts, phone-app head tags, service worker) and bumps
  `VERSION` in `app/sw.js` when the output changed. Commit the source, `app/index.html` and `app/sw.js` together.
- If Sam brings a newer source from a claude.ai chat, drop it in as `src/amber-depths-source.html` and rebuild.

## Checking work
1. `node src/build.mjs --test` writes `test/game_test.html` (ignored; exposes `window.__T`, reduced motion on).
2. Serve the repo root, open http://localhost:8765/test/game_test.html, load `/src/test-bot.js` into the page and
   call `__runGame(cls, mode, diff, maxTurns, relic, asc, alt)` per class (it plays real games and checks invariants).
   Run long sweeps in the background inside the page; the browser tool times out after 45 s.
   Without reduced motion the bot reports false "stalls": it starts the next game while the last one's end
   animation is still playing. `src/test-sweep.mjs` is the original Playwright version (paths are from claude.ai's
   sandbox, so it doesn't run here as-is).
3. Play the change at http://localhost:8765/app/ and check the console.

## Stack
Plain HTML/CSS/JS, no framework, no npm. Node is only used for the build script. Fonts and icons are local files in
`app/`. [app/sw.js](app/sw.js) caches the files for offline play (network-first for the page). Data lives only in
each player's browser (`localStorage`).

## Conventions
- `app/` is exactly what gets published; nothing else in the repo goes live.
- `localStorage` keys are `amber-depths-*` (profile, save, sel, best, daily, history, mute, music; the old
  `unlocks` is migrated into the profile). Don't rename them or change their format without a migration: that
  would wipe friends' unlocks and progress.
- Generation code uses `RNG()` / `rnd()` / `pick()`, never `Math.random`, so daily dungeons stay the same for everyone.
- When adding or renaming a file in `app/`, update `ASSETS` in `sw.js`.

## Decisions so far
- Deploy the `app/` folder directly, not a zip (27 Oct 2026; the zip was only for uploading from a phone).
- The source lives in the repo under `src/`; `app/index.html` is built from it (27 Oct 2026).
