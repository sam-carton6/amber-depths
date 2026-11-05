# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** v21 (merged 5 Nov 2026, commit `8b52381`): deadlier Endless, Golem upgrades, Rogue dodge,
Backup button, Phoenix Feather and Pack Mule relics, Sell all junk, free equipping out of combat, numpad and
arrow-cluster keys. Built from `src/` with `node src/build.mjs`.
**On `staging`, not live yet:** nothing.
**Next up:** Sam plays deep Hard Endless and says how the curve and the upgrades feel (too strong, too weak, missing picks?).

## To do

- **Tune the Endless curve from Sam's play.** Knobs at the top of the monster code in the source: `DEEP_FROM` (12),
  `DEEP_DMG` (1.04 per floor, compounding), `DEEP_POTS` (0.95). If potions still pile up, cap how many you can carry.
  Soak test: `test/soak.js` (ignored file; see DONE.md 5 Nov 2026 for how it was run).
- Sam's iPhone bug list from real play (touch, Safari, feel) goes in BUGS.md as it comes.

## Ideas (later)

- More classes, a second wave of relics, cosmetic titles on the daily share text.
- **New class: the Mole (Sam, 5 Nov 2026):** sight only ~3 tiles. Ability Dig: pick a direction (aimed like the
  Ranger's Volley), tunnel through up to 3 wall tiles (not the map edge; can't skip a Golem, the stairs stay locked).
  Passive tremor sense: feels monsters within ~6 tiles through walls (dim letters), folding in the Seer idea.
  Possible unlock: win a run on Ascension 4+ (Darkness). Spare ideas: Echo (reveal 8 tiles for a few turns) as an
  upgrade or scroll; the Lurker overlaps the Rogue, so skip it.
- Leaderboards (would need a backend).
- **Endless boss floors, step 2 (Sam's plan, 5 Nov 2026):** every 10th floor a half-size dungeon with a roomy stair
  area: the boss gets a small arena, then the upgrade pick. Different mini-bosses instead of always the Golem.
  Other ideas: a "new depth record" moment, deep-only monsters or elite abilities past floor 15-20.
- **More upgrades for the pool** as they come up (e.g. thorns, faster ability recharge, potion strength).
- **Endless loot that keeps mattering:** gear caps at +7 (Runeblade / Amberplate) by about floor 10 and bonuses are
  flat. Ideas: "+N" gear or tiers past the cap; bonuses that grow with depth; trade-off bonuses like "Reckless"
  (+50% damage dealt, +25% taken) so you can choose to be a glass cannon.
- **Cross-device sync without moving (option):** a Worker on a free workers.dev address can store saves for the game
  where it is now, with a short sync code, so no domain move and no lost progress. Mostly Sam playing for now.
- **Cloudflare move (Sam, 5 Nov 2026):** own domain (~$11/yr) on Cloudflare, Worker + D1/KV for leaderboards and
  cross-device saves (a sync code instead of accounts), Ko-fi link (like Popsicle CAD's). Moving domains wipes localStorage, so players
  must Backup on the old address and restore on the new one. Ask Sam before creating anything in Cloudflare.
  Anti-cheat plan: server checks the score formula and plausibility (turns per floor, kills, gold, level); a run token
  from the server at start with a time check; later, full replay checks (seeded randomness + game logic split out to
  run in the Worker, same refactor as the bot project). Anti-abuse: Cloudflare rate limits + Turnstile on submits,
  generated or filtered names, prepared statements, size caps, long random sync codes stored hashed, admin key as a
  Worker secret (never in this public repo).
- **Key rebinding screen:** choose your own keys (numpad is built in for now).
- **Sprite pack option:** swap ASCII cells for tiles (e.g. Kenney's free 1-bit pack tinted amber). ~25-40% of a window.
  Sam may draw his own: 16×16 tiles (bosses 32×32), white/greyscale on transparent so the game can tint them for each
  screen colour, one PNG sheet on a grid. Needs square map cells; on phones the 40×21 map would be ~9 px a tile, so
  add a camera that follows the player there (~20×11 tiles visible).
  Unlock plan (Sam, 5 Nov 2026): ASCII stays the default; a greyscale pixel pack tinted by the screen colour you've
  unlocked (so the existing colour challenges carry over); full-colour pixel art as its own medium-hard challenge.
  Draw once in full colour: the game can make the greyscale version itself.
- **Learning project (Sam):** write a smarter bot: rule-based first, then look-ahead search, then reinforcement learning
  (needs the game logic split out to run headless in Node).

## What's new at the next merge

- 
