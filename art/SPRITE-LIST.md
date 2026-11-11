# Sprites needed

Every sprite the game could use, grouped the way the PicSquare file is. Tick one off (`[x]`) when it's in the game.
Map letter in brackets. ★ = good next. Anything without a sprite keeps its letter, so any order works.
Extra versions (e.g. 2-3 floors with cracks or moss) are welcome for floor and wall; keep their edges matching.
How to send them and file names: [README.md](README.md).

## Dungeon
- [x] Floor `.` (versions welcome; mossy done)
- [x] Wall `#` (versions welcome; mossy done)
- [x] Stairs down `>`
- [x] Stairs, locked (boss floors, until the boss dies) `>`
- [x] Wall torch `ψ` (sits in a wall; mossy version too)
- [x] Cracked wall `▒` (a secret room behind it)
- [x] Water `~`: a puddle; shimmer (2 frames) and drip (9 frames)
- [ ] Bigger puddles, later: 2x2 and 3x3 drawn as one 32x32 / 48x48 PNG, sliced by Claude
- [ ] Bones `%`
- [ ] Rune `¤` (rare)

## Traps and hazards
- [ ] Trap you spotted `^`
- [ ] Web `"` (slows you)
- [ ] Your snare `×` (Trapper)
- [ ] Corpse `,` (Necromancer raises them)
- [ ] Danger tile `≈` (flashes before a big attack; may be best left as a letter)

## Items
- [x] Healing potion `!` (red)
- [x] Strength potion `!` (orange; the game's letter is red)
- [x] Haste potion `!` (cyan; the game's letter is pink)
- [x] Antidote `!` (green)
- [ ] ★ Gold `$`
- [ ] Chest `=` (a mimic hides as one)
- [ ] Scroll `?`
- [ ] Weapon `)` (one to start)
- [ ] Armor `[` (one to start)
- Later, if wanted: one per weapon (Dagger, Short sword, Mace, Longsword, War axe, Runeblade), per armor (Leather,
  Studded leather, Chain mail, Scale mail, Plate, Amberplate) and per scroll (Fire, Frost, Teleport, Mapping)

## People
- [ ] Merchant `&`
- [ ] The cat `f` (friendly; an easter egg)

## Player
- [x] Knight (stands in for every class for now)
- Later, one per class: Warrior, Rogue, Mage, Necromancer, Berserker, Paladin, Gambler, Ranger, Trapper, Mole,
  Alchemist, Vampire

## Monsters (in the order you meet them)
- [x] Rat `r` (floor 1)
- [ ] ★ Bat `b` (floor 1)
- [ ] ★ Goblin `g` (floor 2)
- [ ] Cave spider `x` (floor 2)
- [ ] Kobold archer `k` (floor 3)
- [ ] Fire imp `i` (floor 3)
- [ ] Skeleton `s` (floor 4)
- [ ] Frost wisp `f` (floor 4)
- [ ] Orc `o` (floor 5+)
- [ ] Amber shard `a`
- [ ] Ghoul `z`
- [ ] Wraith `w`
- [ ] Troll `T`
- [ ] Mimic `M`
- Allies (the Necromancer's raised dead, bribed monsters) reuse the monster's sprite.

## Bosses
- [ ] Stone Golem `G`
- [ ] Cyclops `C`
- [ ] Drake `d`
- [ ] Lich `L`
- [ ] Brood Mother `B`
- [ ] Shadow `S`
- [ ] Amber Wyrm `D`
- [ ] Amber Heart `Ø`

## Not planned for now
Spell and arrow effects (they flash for a moment), the title screen and menus. The five dungeon looks (Amber Caves,
Flooded Halls, Bone Crypt, Wyrm's Lair, The Hollow) could each get their own floor and wall one day.

## Code notes for Claude
- In the game so far (10 Nov 2026): floor, wall, knight, rat, healing potion. Drawn but not wired in yet: mossy floor and
  wall versions, torches, cracked wall, stairs, locked stairs (shares `>`), water (puddle; animated; the game's water
  is patches, so every `~` would be a puddle until bigger puddles exist), the 3 new potions. Sprites show only on
  localhost and the test copy (a check in the source; remove it when Sam wants them live).
- Showcase page for friends: `node art/make-showcase.mjs art/sprites <out.html>`, published as a claude.ai artifact
  (https://claude.ai/artifact/882QsHfAVyJrHBDXm7kve8; republish to the same link from a new chat with `url`).
- The three new potions share the `!` letter, so each needs its own key in `SPRITES` (by potion kind) before its
  sprite can show; floor/wall versions and the cat (which shares `f` with the frost wisp) need small code changes too.
