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

Map letter in brackets. ✅ = done, ★ = good next. Anything without a sprite keeps its letter, so any order works.

**Dungeon**
- ✅ Floor `.` (versions welcome) · ✅ Wall `#` (versions welcome)
- ★ Stairs down `>` · Stairs, locked (boss floor, before the boss dies) `>`
- ★ Wall torch `ψ` (sits in a wall) · Cracked wall `▒` (secret room behind it)
- Water `~` (2 frames could ripple) · Bones `%` · Rune `¤` (rare)

**Traps and hazards**
- Trap you spotted `^` · Web `"` (slows you) · Your snare `×` (Trapper)
- Corpse `,` (one for all; Necromancer raises them) · Danger tile `≈` (flashes before a big attack; may be best as a
  letter)

**Items**
- ✅ Potion `!` · ★ Gold `$` · Chest `=` (a mimic hides as one) · Scroll `?`
- Weapon `)` and armor `[`: one each to start. Later, if wanted, one per kind: Dagger, Short sword, Mace,
  Longsword, War axe, Runeblade; Leather, Studded leather, Chain mail, Scale mail, Plate, Amberplate.
- Later, if wanted: one per scroll (Fire, Frost, Teleport, Mapping)

**People**
- Merchant `&` · The cat `f` (friendly; an easter egg)

**Player**
- ✅ Knight (stands in for every class for now)
- One per class, later: Warrior, Rogue, Mage, Necromancer, Berserker, Paladin, Gambler, Ranger, Trapper, Mole,
  Alchemist, Vampire

**Monsters** (in the order you meet them)
- Floor 1: ✅ rat `r` · ★ bat `b`
- Floor 2: ★ goblin `g` · cave spider `x`
- Floor 3: kobold archer `k` · fire imp `i`
- Floor 4: skeleton `s` · frost wisp `f`
- Floor 5+: orc `o` · amber shard `a` · ghoul `z` · wraith `w` · troll `T` · mimic `M`
- Allies (Necromancer's raised dead, bribed monsters) reuse the monster's sprite.

**Bosses**
- Stone Golem `G` · Cyclops `C` · Drake `d` · Lich `L` · Brood Mother `B` · Shadow `S` · Amber Wyrm `D` ·
  Amber Heart `Ø`

**Not planned for now:** spell and arrow effects (they flash for a moment), the title screen and menus.
The five dungeon looks (Amber Caves, Flooded Halls, Bone Crypt, Wyrm's Lair, The Hollow) could each get their own
floor and wall one day; for now they share one set.

## Files in art/sprites/ now

| File | Drawn for | Added |
|------|-----------|-------|
| floor.png | `.` floor (tiled, so neighbours join up) | 8 Nov 2026 |
| wall.png | `#` wall (tiled) | 8 Nov 2026 |
| knight.png | the player, every class | 8 Nov 2026 |
| rat.png | rat | 8 Nov 2026 |
| potion.png | `!` potion | 8 Nov 2026 |
