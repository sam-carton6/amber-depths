# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** v80 (merged 9 Nov 2026, commit `adb9bc6`): easter eggs + class birthdays, step over seen traps,
Brood Mother/spider fix, merchant gold sinks; sprites are in the code but hidden on live (`SPR_HOST`). Details in DONE.md.
**On `staging`, not live yet:** 3 new potions (Strength, Haste, Antidote) and the Scavenger upgrade (9 Nov 2026).
**Art (8 Nov 2026):** Sam's first 5 sprites are in (v76, staging), waiting for him to try them on the iPhone. See *Art* below.
**Next up:** Sam's Hard Endless run with Backup codes before boss floors.
**Bot chat (9 Nov 2026):** the deep bot ([bot/](bot/README.md)) now runs from VS Code (Sam runs it himself: 20 games a
minute, a results page with charts). Warrior Hard Endless, v3 rules: floor 55.9 average. Next: other classes.
**Cloudflare (6 Nov 2026):** live at amberdepths.com (Worker `amber-depths`, `main`); test at test.amberdepths.com
(Worker `amber-depths-preview`, `staging`). Friends move their saves via the old address's moved screen; once all
have, remove deploy.yml (and optionally make the repo private).

## To do

- **Check the new deep curve against Sam's play** (retuned 5 Nov 2026 from his floor-40 Hard Rogue backup: Lv 70,
  ATK 123, 45 potions, 43k gold, one-shotting everything). Knobs: `DEEP_FROM` 12, `DEEP_HP` 1.05 (new: monster HP
  per floor), `DEEP_DMG` 1.012 (was 1.04, then 1.025), `DEEP_POTS` 0.95. With his character on floor 41: monsters take
  ~4 hits and now hit for 33-43 of his 300 HP (~8 hits to kill him; was 56-69, 5 hits, deadly when surrounded).
  Deep floors draw from the last 4 monster types only; flooded floors are ~40% frost wisps. Still open: potions
  (45) and gold (43k) pile up; a carry cap or pricier deep shops are the next knobs if he says so.
  **Sam's Hard Endless Berserker run (test copy, v71), 7 Nov 2026:** floor 19: Lv 38, 231/253 HP, ATK 45, DEF 0,
  41 potions (2 drunk all run), 9.3k gold, 253 kills, 12,160 damage dealt vs 1,069 taken. Too easy so far.
  Sam: "easy so far, nothing scary yet", but he got lucky with lots of damage upgrades.
  Floor 29: Lv 52, 215/337 HP, ATK 70, 56 potions (11 drunk in all), 20.6k gold, 411 kills, biggest hit taken 32.
  Damage taken on floors 19-29: 2,049 (twice floors 1-19 together), but potions still pile up faster than he drinks.
  Backup in `test/sam-save-f29.json`. Sam: "could breeze through most of them and spam potions if I was too
  reckless"; the Brood Mother (floor 30) came for him right away (a bug, fixed in v73).
  Floor 39: Lv 68, 315/433 HP, ATK 102, 46 potions (37 drunk in all: 26 on floors 29-39), 43.6k gold, 594 kills,
  biggest hit taken 50. Damage taken on floors 29-39: 5,387 (2.6x the floors before). First time the potion pile
  shrank (56 to 46). Sam: "def getting harder". Backup in `test/sam-save-f39.json`.
  Floor 49: Lv 82, 517/517 HP, ATK 119, 16 potions (44 drunk on floors 39-49), 71k gold, 769 kills, biggest hit
  taken 97. Damage taken on floors 39-49: 11,875 (2.2x the floors before). At this rate he runs dry around floor 52-55,
  close to where the deep bot dies (~53). Backup in `test/sam-save-f49.json`. Curve looks right; gold still useless.
  **Died on floor 51** (9 Nov 2026): Lv 86, 812 kills, 12,286 turns, 46k gold left. Matches the forecast (52-55) and
  the deep bot (~53): the deep curve is confirmed, no change needed. Gold sinks (v78) came in after this run's
  floor-49 backup; see how much gold the next deep run has left.
  Backup in `test/sam-save-f19.json` (ignored). Waiting for floors 29/39/49 before changing anything.
  Testing with a real save: decode the backup code into `test/sam-save.json` (ignored; private) and load it in the
  test page (`localStorage` save key + `__T.loadGame()`). Soak test: `test/soak.js` (ignored; see DONE.md).
- Sam's iPhone bug list from real play (touch, Safari, feel) goes in BUGS.md as it comes.
- **Tune the Vampire from Sam's play** (built 6 Nov 2026, v51). Knobs in `VAMP`: ward .25 of max HP, feed .1 of damage
  dealt, Bite refills .25 of the ward, +3 max HP per potion up to +60. Bot (Hard Endless, floors 10-12): ends with
  30-90% HP, never died; it only Bites when the ward is under half. Deep floors (bot, Hard Endless, 7 Nov 2026, 7 games):
  Vampire dies on floors 8-19 (mostly 13-19), Warrior 16-23, Rogue 12-13, Berserker 16-27: in line, no change needed yet. `__T.VAMP` is exposed in
  the test page to try numbers without rebuilding.

## Art (sprites)

- **First 5 sprites in (8 Nov 2026, v76, staging):** floor, wall, knight (player, all classes), rat, potion. Sam to
  look at them on test.amberdepths.com on the iPhone (`?ascii` turns them off there to compare). Sprites are hidden on the live game (`SPR_HOST` in the source) until Sam says they're ready. PicSquare can't
  export a sheet, so each sprite is its own file in `art/sprites/` (see [art/README.md](art/README.md)).
- **Size question to settle with Sam:** a map cell is ~7 pt wide on an iPhone (40 columns across), so the knight and
  rat are drawn 1.15em (a row's height) and overlap the cells beside them; floor and wall tiles fill their cell and
  join up. Bigger would need square cells and a map that scrolls with the player (a real layout change; parked).
- Later, if wanted: a Settings choice Letters / Pictures; tinting sprites for hurt, poisoned, burning (only hit-flash,
  frozen and invisible have a look so far); walls and floors as tiles.

## Ideas (later)

- **"Equip best" button in the pack** (Sam, 6 Nov 2026): puts on the highest `gearScore` weapon and armor. Small: the
  game already scores gear (pickup message, sell-junk). Watch out for cursed gear and Vampiric/Thorned trade-offs.

- **Save sync across devices** (Sam, 5 Nov 2026, with the Cloudflare move): needs server storage (e.g. Workers KV
  or D1) and some way to tell players apart. A big feature of its own; do it after the hosting move is finished.
  Leaderboards (Sam, 6 Nov 2026) would share the same server and player names.
- **Ko-fi link for donations** (Sam, 6 Nov 2026): a small "Support" link on the title screen (and maybe the Guide).
  Needs Sam's Ko-fi page address.
- More classes, a second wave of relics, cosmetic titles on the daily share text.
- **Echo** (reveal everything within 8 tiles for a few turns) as an upgrade or scroll; spare from the Mole design.
- Leaderboards (would need a backend).
- Other deep-Endless ideas: a "new depth record" moment, deep-only monsters or elite abilities past floor 15-20,
  a challenge for beating each boss (`PROF.bosses` already counts kills).
- **Map/ASCII-art font options (Sam, 5 Nov 2026; probably not worth it):** the map needs a monospace font with
  box-drawing glyphs, or the grid breaks; only a few fit (e.g. IBM Plex Mono, Fira Mono). Small win, some risk.
- **More upgrades for the pool** as they come up (e.g. thorns, faster ability recharge, potion strength).
- **Trade-off gear bonuses** like a "Reckless" weapon (+50% damage dealt, +25% taken), left over from the deep-loot
  idea (the +N gear itself is done).
- **Cross-device sync without moving (option):** a Worker on a free workers.dev address can store saves for the game
  where it is now, with a short sync code, so no domain move and no lost progress. Mostly Sam playing for now.
- **Cloudflare move (Sam, 5 Nov 2026):** the repo can go private then (Cloudflare deploys from private repos;
  GitHub Pages was the only reason it is public). Unless Sam wants it public as a portfolio piece.
  Plan: own domain (~$11/yr) on Cloudflare, Worker + D1/KV for leaderboards and
  cross-device saves (a sync code instead of accounts), Ko-fi link (like Popsicle CAD's). Moving domains wipes localStorage, so players
  must Backup on the old address and restore on the new one. Ask Sam before creating anything in Cloudflare.
  Anti-cheat plan: server checks the score formula and plausibility (turns per floor, kills, gold, level); a run token
  from the server at start with a time check; later, full replay checks (seeded randomness + game logic split out to
  run in the Worker, same refactor as the bot project). Anti-abuse: Cloudflare rate limits + Turnstile on submits,
  generated or filtered names, prepared statements, size caps, long random sync codes stored hashed, admin key as a
  Worker secret (never in this public repo).
- **More text styles as unlocks (optional):** extra novelty fonts earned from challenges, like the screen colours.
- **Key rebinding screen:** choose your own keys (numpad is built in for now).
- **Sprite pack option:** swap ASCII cells for tiles (e.g. Kenney's free 1-bit pack tinted amber). ~25-40% of a window.
  Sam may draw his own: 16×16 tiles (bosses 32×32), white/greyscale on transparent so the game can tint them for each
  screen colour, one PNG sheet on a grid. Needs square map cells; on phones the 40×21 map would be ~9 px a tile, so
  add a camera that follows the player there (~20×11 tiles visible).
  Unlock plan (Sam, 5 Nov 2026): ASCII stays the default; a greyscale pixel pack tinted by the screen colour you've
  unlocked (so the existing colour challenges carry over); full-colour pixel art as its own medium-hard challenge.
  Draw once in full colour: the game can make the greyscale version itself.
- **Learning project (Sam):** write a smarter bot: rule-based first, then look-ahead search, then reinforcement learning.
  **Started 7 Nov 2026:** rule-based v1 in [bot/deep-bot.js](bot/deep-bot.js) (in the test page, seeded replays;
  headless Node comes later, for the search and learning stages). Bot ideas to try: dive past floor ~45 instead of
  clearing floors; Frost/Teleport scrolls in bad fights; other classes.
  **Batch runner done (9 Nov 2026):** VS Code tasks "Bot: ..." ([bot/README.md](bot/README.md)), 20 games a minute,
  results page with charts and fair-play flags; the bot sees only what's on screen. v3 rules: floor 55.9 average.
  Next: watch flagged seeds 5 and 16 (slow floors), then teach the other classes. Step 2 (later, only if speed is
  needed): split the game rules from the screen code to run without a browser (1-2 windows, touches live code).
  How (decided 5 Nov 2026): Sam writes the strategy as plain rules or pseudocode, Claude turns it into JavaScript in
  this repo (a `bot/` folder, outside `app/` so it never goes live), with comments Sam can tweak.
  (needs the game logic split out to run headless in Node).
  Uses (Sam, 5 Nov 2026): (1) a smarter soak: a bot that plays well (fights Golems, uses upgrades, kites) gives
  real difficulty numbers, e.g. "a good player dies around floor N", so the curve can be tuned against it; the
  current bot skips stuck floors and Golems, so its numbers are rough. (2) Tougher enemies: reuse its pathfinding
  and danger checks for smarter monster behaviour (archers keep distance, packs surround, the wounded flee),
  rule-based and telegraphed so it stays fair; not a learned AI (hard to tune, can feel cheap).

## What's new at the next merge

- Three new potions: Strength (double damage for 10 turns), Haste (two moves for every monster move) and Antidote
  (cures poison, burning and slowness, and keeps them off for a while). Drink them from your pack; P still drinks healing.
- New upgrade: Scavenger. Gear you find or buy is +1 better and more often has a bonus.
- A boss's summoned minions (Lich skeletons, Brood Mother spiderlings) no longer give XP or drop loot, so they can't
  be farmed, and they're weaker on deep floors (only half the deep-floor HP growth: the Lich's skeletons were ~650 HP
  walls on floor 60).
- Boss arenas seal behind you once the boss sees you, and open again when it falls (the Lich could back away out of
  its arena and stay out of reach forever). The Guide says so.
- The merchant's list is shorter: potions and scrolls are small tiles two to a row (two of the same potion share one
  tile, ×2), and temper, reinforce and the bigger pack sit side by side.
