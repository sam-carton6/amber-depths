# Deep bot results

One block per bot version. Same seeds (1-20) each time, so the numbers compare fairly.

## v2: Sam's first tweaks (9 Nov 2026), Warrior, Hard Endless, game v81
Even/odd first-hit timing, rest to full with Regeneration, full heal only when it's better value than a potion,
merchant visited after exploring, reinforce with spare gold, walk around cats. Same game for both rows:
| | games | average floor | range | potions on floor 40 | gold left |
|---|---|---|---|---|---|
| v1 rules (+ the cat fix) | 13 (stopped) | 53.6 | 49-58 | 72 | 58k |
| v2 rules | 20 | 53.8 | 50-58 | 73 | 19k |
- **No real change** (seeds 1-13: v1 53.6, v2 53.1). The tactics aren't what stops it: monsters gain 5% HP a floor,
  potions run out around floor 50-55 either way. Reinforce bought ~5 defence, too late to matter (after floor ~40).
- Two v2 games died on floor 50 to the Endless Wyrm.
- Next (v3, not run yet): Sam's merchant order, two merchant visits a floor, gear swaps when the pack is full,
  Mapping only from floor 20, hidden rooms first.

## v1: rules (7 Nov 2026), Warrior, Hard Endless, seeds 1-20
- **Deepest floor: average 53.3** (worst 48, middle 54, best 57). All 20 died; none got stuck or peeked.
- About 10,300 turns and level 88 at the end; ~45 s a game in the browser.
- Killed by: troll 6, fire imp 5, frost wisp 3, wraith 2, ghoul 2, cave spider 1.
- **The wall is potions.** ~78 potions on floor 40, ~13 used per floor after that, none left by 50-55. By then
  monsters have ~1,000 HP (≈7 hits) and hit for 40+.
- **Gold is useless late:** ~57,000 gold unspent at death (shops stock only 2 potions).
- Before (old test bot, which skips Golems and forces its way down): Warrior died on floors 16-23.

### Found along the way (game, not bot)
- **Boss minions can be farmed forever.** The Lich and Brood Mother keep making minions worth 1 XP each; an early
  version of the bot spent 12,000 turns on floor 10 and went from level 17 to 41. A patient player could too.
