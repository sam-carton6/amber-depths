# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** v53 (merged 6 Nov 2026, commit `4d75bfc`): the Vampire class; the old github.io address now
shows only a "moved" screen with Backup (no play; preview with `?moved`); `wrangler.jsonc` for Cloudflare Workers.
**On `staging`, not live yet:** nothing.
**Next up:** Sam starts a fresh Hard Endless run (Berserker suggested) and sends a Backup code before each boss floor
(20, 30, 40, 50) plus a line on how it felt. Then potions/gold if they still pile up.
**Moving to Cloudflare Workers (6 Nov 2026):** Worker `amber-depths-preview` (test.amberdepths.com, should build
`staging` with `npx wrangler deploy --env preview`; was still serving v52, check its branch). Still to create:
Worker `amber-depths` (branch `main`, `npx wrangler deploy`) for amberdepths.com. Then friends move their saves;
later remove the GitHub Pages workflow, update CLAUDE.md "Where it runs" and the README.

## To do

- **Check the new deep curve against Sam's play** (retuned 5 Nov 2026 from his floor-40 Hard Rogue backup: Lv 70,
  ATK 123, 45 potions, 43k gold, one-shotting everything). Knobs: `DEEP_FROM` 12, `DEEP_HP` 1.05 (new: monster HP
  per floor), `DEEP_DMG` 1.012 (was 1.04, then 1.025), `DEEP_POTS` 0.95. With his character on floor 41: monsters take
  ~4 hits and now hit for 33-43 of his 300 HP (~8 hits to kill him; was 56-69, 5 hits, deadly when surrounded).
  Deep floors draw from the last 4 monster types only; flooded floors are ~40% frost wisps. Still open: potions
  (45) and gold (43k) pile up; a carry cap or pricier deep shops are the next knobs if he says so.
  Testing with a real save: decode the backup code into `test/sam-save.json` (ignored; private) and load it in the
  test page (`localStorage` save key + `__T.loadGame()`). Soak test: `test/soak.js` (ignored; see DONE.md).
- Sam's iPhone bug list from real play (touch, Safari, feel) goes in BUGS.md as it comes.
- **Tune the Vampire from Sam's play** (built 6 Nov 2026, v51). Knobs in `VAMP`: ward .25 of max HP, feed .1 of damage
  dealt, Bite refills .25 of the ward, +3 max HP per potion up to +60. Bot (Hard Endless, floors 10-12): ends with
  30-90% HP, never died; it only Bites when the ward is under half. Deep floors untested. `__T.VAMP` is exposed in
  the test page to try numbers without rebuilding.

## Ideas (later)

- **"Equip best" button in the pack** (Sam, 6 Nov 2026): puts on the highest `gearScore` weapon and armor. Small: the
  game already scores gear (pickup message, sell-junk). Watch out for cursed gear and Vampiric/Thorned trade-offs.

- **Save sync across devices** (Sam, 5 Nov 2026, with the Cloudflare move): needs server storage (e.g. Workers KV
  or D1) and some way to tell players apart. A big feature of its own; do it after the hosting move is finished.
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
- **Learning project (Sam):** write a smarter bot: rule-based first, then look-ahead search, then reinforcement learning
  How (decided 5 Nov 2026): Sam writes the strategy as plain rules or pseudocode, Claude turns it into JavaScript in
  this repo (a `bot/` folder, outside `app/` so it never goes live), with comments Sam can tweak.
  (needs the game logic split out to run headless in Node).
  Uses (Sam, 5 Nov 2026): (1) a smarter soak: a bot that plays well (fights Golems, uses upgrades, kites) gives
  real difficulty numbers, e.g. "a good player dies around floor N", so the curve can be tuned against it; the
  current bot skips stuck floors and Golems, so its numbers are rough. (2) Tougher enemies: reuse its pathfinding
  and danger checks for smarter monster behaviour (archers keep distance, packs surround, the wounded flee),
  rule-based and telegraphed so it stays fair; not a learned AI (hard to tune, can feel cheap).

## What's new at the next merge

(Nothing yet.)
