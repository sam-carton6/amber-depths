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
| floor.png, floor-2.png, floor-cracked.png | floor; mossy; cracked (all floor versions) | 8-10 Nov 2026 |
| wall.png, wall-2.png | wall; mossy wall | 8-10 Nov 2026 |
| wall-cracked.png | cracked wall (secret room) | 11 Nov 2026 |
| torch-flame-1..5.png | wall torch, flame animation (5 frames) | 11 Nov 2026 |
| torch-mossy-flame-1..5.png | mossy wall torch, flame animation (5 frames) | 11 Nov 2026 |
| torch.png, torch-2.png | wall torch; mossy torch (older still versions) | 10 Nov 2026 |
| stairs.png, stairs-locked.png | stairs down; locked (boss floors) | 10 Nov 2026 |
| water.png, water-2.png | puddle, shimmer animation (2 frames) | 10 Nov 2026 |
| water-drop-1..9.png | puddle, drip animation (9 frames) | 10 Nov 2026 |
| bones.png, bones-2.png, bones-3.png | bones `%`: crossed bones; a bone; skull | 11 Nov 2026 |
| rune.png | rune `¤` | 11 Nov 2026 |
| web.png, web-2.png | web `"`; torn web | 11 Nov 2026 |
| trap.png, trap-sprung.png | spike trap `^`: one trap, holes then spikes up (confirmed by Sam) | 11 Nov 2026 |
| snare.png | Trapper's snare `×` | 11 Nov 2026 |
| danger.png | danger tile `≈` (red !) | 11 Nov 2026 |
| gold.png, chest.png, scroll.png, weapon.png, armor.png | `$` `=` `?` `)` `[` | 11 Nov 2026 |
| potion.png | healing potion (red) | 8-11 Nov 2026 |
| potion-strength / -haste / -antidote.png | orange / cyan / green | 10-11 Nov 2026 |
| knight.png | the player, every class | 8 Nov 2026 |
| rat.png | rat | 8 Nov 2026 |

**Exporting from PicSquare:** it flattens every *visible layer* into each frame, so export one layer at a time with
the others hidden (or keep each sprite on its own frame). Sam sends one zip per layer and says which is which.
