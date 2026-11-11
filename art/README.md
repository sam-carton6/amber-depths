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

## Bringing in a new export

Sam keeps the PicSquare file grouped (all floor versions together, and so on) and exports every frame each time
(`Amber Depths 1 - N.png` in a zip), so **frame numbers can change between exports**. Sam says which frames are which
(e.g. "1-3 floor, 4-5 wall"); otherwise look at them and ask. Unzip to a scratch folder, copy each frame to its file
name below, rebuild. Extra versions of one sprite are `floor.png`, `floor-2.png`, `floor-3.png`...
(versions aren't wired up in the game yet: plain one most of the time, others sprinkled in by map position).

## Every sprite the game could use

The checklist is in [SPRITE-LIST.md](SPRITE-LIST.md).

## Files in art/sprites/ now

| File | What | Added |
|------|------|-------|
| floor.png, floor-2.png | floor; mossy floor | 8 / 10 Nov 2026 |
| wall.png, wall-2.png | wall; mossy wall | 8 / 10 Nov 2026 |
| torch.png, torch-2.png | wall torch; mossy torch | 10 Nov 2026 |
| floor-cracked.png | cracked floor (a floor version) | 10 Nov 2026 |
| stairs.png, stairs-locked.png | stairs down; locked (boss floors) | 10 Nov 2026 |
| water.png, water-2.png | puddle, shimmer animation (2 frames) | 10 Nov 2026 |
| water-drop-1..9.png | puddle, drip animation (9 frames) | 10 Nov 2026 |
| potion.png | healing potion (red) | 8 / 10 Nov 2026 |
| potion-strength / -haste / -antidote.png | orange / cyan / green | 10 Nov 2026 |
| knight.png | the player, every class | 8 Nov 2026 |
| rat.png | rat | 8 Nov 2026 |

**Exporting from PicSquare:** it flattens every *visible layer* into each frame, so export one layer at a time with
the others hidden (or keep each sprite on its own frame). Sam sends one zip per layer and says which is which.
