---
modules: [software]
status: active
summary: A little retro ASCII roguelike you can install on your phone.
runs: github-pages
live: https://sam-carton6.github.io/amber-depths/
showcase: no
---
# Amber Depths

A little retro dungeon diver: an ASCII roguelike that runs in the browser and installs on a phone as an app.
Made for fun, played with friends.

## Run it

No build step. Serve the `app/` folder and open it:

```
cd app
python -m http.server 8765
```

Then go to http://localhost:8765.

## Where it runs

- `main` = live: GitHub Pages at https://sam-carton6.github.io/amber-depths/ (every push to `main` redeploys it)
- `staging` = work in progress: local only

## Secrets

None. The repo is public, so nothing private ever goes in it.

## Notes

How this project is run day to day: [CLAUDE.md](CLAUDE.md), [TODO.md](TODO.md), [BUGS.md](BUGS.md).
