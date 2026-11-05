# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** v13 (10 classes, relics, Ascension, the Hollow, all the tester's bugs fixed, pixel font, scanlines
everywhere, CRT sweep, updates arrive at once), built from `src/` with `node src/build.mjs` (merged 28 Oct 2026,
commit `905e9af`).
**On `staging`, not live yet:** v16: Endless deadlier past floor 12, Golem upgrades (pick 1 of 3), Rogue dodge,
numpad controls (say "merge" to put it live).
**Next up:** Sam plays deep Hard Endless and says how the curve and the upgrades feel (too strong, too weak, missing picks?).

## To do

- **Tune the Endless curve from Sam's play.** Knobs at the top of the monster code in the source: `DEEP_FROM` (12),
  `DEEP_DMG` (1.04 per floor, compounding), `DEEP_POTS` (0.95). If potions still pile up, cap how many you can carry.
  Soak test: `test/soak.js` (ignored file; see DONE.md 5 Nov 2026 for how it was run).
- Sam's iPhone bug list from real play (touch, Safari, feel) goes in BUGS.md as it comes.

## Ideas (later)

- More classes, a second wave of relics, cosmetic titles on the daily share text.
- Leaderboards (would need a backend).
- **Endless boss floors, step 2 (Sam's plan, 5 Nov 2026):** every 10th floor a half-size dungeon with a roomy stair
  area: the boss gets a small arena, then the upgrade pick. Different mini-bosses instead of always the Golem.
  Also: the Golem doesn't get the deep damage curve (it's made outside `makeMon`), so deep down it hits softer than
  normal monsters. Other ideas: a "new depth record" moment, deep-only monsters or elite abilities past floor 15-20.
- **More upgrades for the pool** as they come up (e.g. thorns, faster ability recharge, potion strength).
- **Endless loot that keeps mattering:** gear caps at +7 (Runeblade / Amberplate) by about floor 10 and bonuses are
  flat. Ideas: "+N" gear or tiers past the cap; bonuses that grow with depth; trade-off bonuses like "Reckless"
  (+50% damage dealt, +25% taken) so you can choose to be a glass cannon.
- **Key rebinding screen:** choose your own keys (numpad is built in for now).
- **Sprite pack option:** swap ASCII cells for tiles (e.g. Kenney's free 1-bit pack tinted amber). ~25-40% of a window.
- **Learning project (Sam):** write a smarter bot: rule-based first, then look-ahead search, then reinforcement learning
  (needs the game logic split out to run headless in Node).

## What's new at the next merge

- Endless gets deadlier past floor 12: monsters hit about 4% harder every floor (it adds up fast) and drop fewer
  potions. Deep runs now end in a real fight instead of you giving up.
- Beat the Stone Golem in Endless (every 5 floors) or Standard (once) to pick 1 of 3 upgrades for the run: Might,
  Vitality, Keen Eye, Evasion, Iron Skin, Regeneration, Bloodthirst or Reckless. Deeper golems give stronger ones.
- The Rogue now dodges 10% of monster attacks and arrows.
- Numpad controls: 8 4 5 6 move, 7 ability, 9 potion, 0 pack, . wait.
