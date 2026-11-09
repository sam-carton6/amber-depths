# Deep bot results

One block per bot version. Same seeds (1-20) each time, so the numbers compare fairly.

## Upgrade DOE (9 Nov 2026), all 12 classes, Hard Endless, seeds 1-20, `node bot/doe.mjs`
6 upgrade-pick orders x 12 classes x 20 seeds = 1,440 games (45 min, 28 at a time). Each game compared with the
defensive order on the same seed; 28 stuck games left out with their partner. Floors gained over defensive,
average over all classes (± 2 standard errors):
| Tank | Sam's mix | Crit/dodge | Damage | Glass cannon |
|---|---|---|---|---|
| −0.8 ± 0.6 | −1.3 ± 0.6 | −4.5 ± 0.8 | −6.7 ± 0.8 | −8.0 ± 0.9 |
- **Defensive (Regeneration first) is best or tied for every class.** Nothing beat it clearly anywhere.
- Damage-first orders cost 5-16 floors (Paladin worst: Glass cannon −15.7). Reckless's +20% damage taken hurts more
  than its +40% attack helps once monsters hit for 40+.
- Tank and Sam's mix (Might first, one Regeneration) are close behind: defence and Regeneration are what matter.
- Three near-ties re-tested on seeds 21-60 (360 games): Mage Tank +1.3 → +0.3 ± 1.2, Berserker Tank +0.1 → −0.8 ± 1.6,
  Vampire Sam's mix +1.3 → +0.5 ± 2.4 (Tank +1.0 ± 2.0). All noise, so **every class keeps the defensive order**.

## v3: Sam's merchant and gear rules + fair-play screen view (9 Nov 2026), Warrior, Hard Endless, v81
First batch from the runner (20 games in 1 minute). Merchant order (sell junk, sharpen, potions, Teleport, gear only
if 2+ better, scrolls, full heal only if better value), two merchant visits a floor, swap gear when the pack is full,
Mapping from floor 20, hidden rooms first, new potions used. The bot now sees only what's on screen.
- **Average floor 55.9** (worst 51, middle 57, best 60), up from 53.8: the first real gain since v1.
- Killed by: troll 9, frost wisp 5, ghoul 3, fire imp 2, wraith 1.
- Flagged: seeds 5 (floor 25) and 16 (floor 40) took ~750 turns on one floor (usual ~175). Worth watching.

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
