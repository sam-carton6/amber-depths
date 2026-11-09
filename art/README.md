# Art (sprites)

This folder is in the repo (so it's backed up on GitHub) but **outside `app/`, so nothing here goes live by
itself**. The build reads one file from it, `sprites.png`, and puts it inside the game.

- **`sprites.png`**: the sprite sheet the game uses. A PNG with a see-through background, made of
  **16x16-pixel squares**. Any number of columns and rows works; the game counts the squares left to right, top to
  bottom, starting at 0. Empty squares are fine.
- **Working files** (PicSquare/Pixquare projects, sketches, older versions): keep them here too, under any name.
  The build ignores everything except `sprites.png`.
- The repo is public for now (see CLAUDE.md), so anything in here can be seen by anyone.

Which square is what lives in `SPRITES` in `src/amber-depths-source.html` (keyed by monster name, `player`,
`player:<class>`, or a map letter such as `>`). Anything not listed there keeps its letter.

## Squares so far

| # | What |
|---|------|
| (none yet) | |
