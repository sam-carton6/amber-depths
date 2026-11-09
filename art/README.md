# Art (sprites)

This folder is in the repo (so it's backed up on GitHub) but **outside `app/`, so nothing here goes live by
itself**. The build reads only `art/sprites/*.png` and puts those pictures inside the game.

- **`sprites/`**: one PNG per sprite, **16x16 pixels**, see-through background, named after what it is
  (`rat.png`, `wall.png`; only a-z, 0-9 and `-` in the name). No sprite sheet needed.
- **Working files** (PicSquare projects, sketches, older versions): keep them anywhere in `art/` *outside*
  `sprites/`. The build ignores them.
- The repo is public for now (see CLAUDE.md), so anyone can see what's in here.

Which picture goes with what lives in `SPRITES` in `src/amber-depths-source.html`: a monster's name, `player`
(or `player:<class>`), or a map letter. Anything not listed keeps its letter.

## Sprites so far

Sam draws them as frames of one PicSquare project and exports every frame each time (`Amber Depths 1 - N.png` in a
zip). **Frame N is matched by its number**, so new sprites go at the end and old frames never move. To bring in a new
export: unzip it to a scratch folder and copy frame N to the file name below (all of them; edited ones change).

| Frame | File | Drawn for | Added |
|------:|------|-----------|-------|
| 1 | floor.png | `.` floor (tiled, so neighbours join up) | 8 Nov 2026 |
| 2 | wall.png | `#` wall (tiled) | 8 Nov 2026 |
| 3 | knight.png | the player, every class | 8 Nov 2026 |
| 4 | rat.png | rat | 8 Nov 2026 |
| 5 | potion.png | `!` potion | 8 Nov 2026 |
