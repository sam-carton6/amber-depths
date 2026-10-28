# Amber Depths — notes for Claude

A little retro ASCII roguelike (dungeon diver) that runs in the browser and installs on a phone as an app (PWA).
A hobby game Sam plays with friends: changes shouldn't wipe anyone's progress.
Sam's general rules are in `~/.claude/CLAUDE.md` (master copy: `Projects/_Project Kit/global-CLAUDE.md`); this file
adds what's specific to this project and wins where they differ.

Notes: [BUGS.md](BUGS.md) (Sam's inbox, read every chat), [TODO.md](TODO.md) (open work; read *Where things stand*
every chat), [DONE.md](DONE.md) (the archive; history only).

## Where it runs
- **Kind:** web app (PWA)
- **Live:** GitHub Pages at https://sam-carton6.github.io/amber-depths/ — [deploy.yml](.github/workflows/deploy.yml)
  publishes the `app/` folder on every push to `main`. **Every push to `main` changes the game on friends' phones.**
- **Try `staging`:** locally only: `python -m http.server 8765` inside `app/`, then open http://localhost:8765.
  (The service worker doesn't register there in the Claude browser pane; that's expected.)
- **Repo:** GitHub `sam-carton6/amber-depths` (**public**: free GitHub Pages needs it, so never commit anything
  private). Main copy on the tower: `D:\Users\Sam\Documents\Projects\Amber Depths`.

## Branches
`main` = live, `staging` = all work. Merge `staging` → `main` only when Sam says "merge".

## Checking work
No build or tests in the repo yet. Serve `app/` locally (above), play the change in the browser, and check the
console for errors. (`test-bot.js` / `test-sweep.mjs` exist in Sam's claude.ai project, not here yet: see TODO.md.)

## Stack
Plain HTML/CSS/JS in one file, [app/index.html](app/index.html); no framework, no build step. Fonts and icons are
local files in `app/`. [app/sw.js](app/sw.js) caches the files for offline play (network-first for the page).
Data lives only in each player's browser (`localStorage`).

## Conventions
- `app/` is exactly what gets published; nothing else in the repo goes live.
- `localStorage` keys are `amber-depths-*` (unlocks, best, sel, mute, music). Don't rename them or change their
  format without a migration: that would wipe friends' unlocks and best scores.
- When adding or renaming a file in `app/`, update `ASSETS` in `sw.js` and bump `VERSION` there.

## Decisions so far
- Deploy the `app/` folder directly, not a zip (27 Oct 2026; the zip was only for uploading from a phone).
