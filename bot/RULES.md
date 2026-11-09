# The deep bot's rules, in plain English

Sam approves these; [deep-bot.js](deep-bot.js) follows them (rule numbers match its comments). Every turn the bot
goes down the list and does the first thing that fits. The numbers to tweak are `KNOBS` at the top of the file.
**Fair play:** the bot only sees what's on screen (see [README.md](README.md)).

## Pop-up screens
- **Upgrade pick:** Regeneration → Iron Skin → Vitality → Might → Bloodthirst → Evasion → Keen Eye → Reckless.
- **At a merchant**, in order: sell junk → sharpen → healing potions (all) → a Teleport scroll → gear only if at least
  2 better than what you wear → other scrolls → the full heal only if it gives more HP per gold than a potion → with
  what's left, Reinforce (+1 defence), keeping enough gold for the next three merchants' heal and potions.
  Visit the merchant as soon as you see it, and once more before leaving the floor (last junk, heal if worth it).

## Staying alive
1. **Dodge:** standing where a telegraphed attack will land? Step out.
2. **Hurt in a fight** (below 40% HP; Alchemist 35%): drink a healing potion (Paladin: Holy Light first). No potion
   and below 25%: read Teleport. (Vampire: potions don't heal, so Teleport below 35%.)
3. **Poisoned or burning** and below half HP: drink (it cures). **Special potions:** Antidote when poisoned, burning
   or slowed for a while; Strength next to a boss or 3+ enemies; Haste when a boss is awake. No potions at all
   during a Berserker's Frenzy (the game refuses them).
4. **Gear up:** put on better gear (never cursed) as soon as no enemy is next to you.
5. **Swarmed (3+ awake) or a boss is awake:** Frost scroll if hurt and they're next to you, else Fire.

## Fighting
6. **Use the class ability** (see *Classes* below).
7. **Bosses first.** An arena boss in sight: go for it, around its minions if that isn't much longer, through them if
   there's no way around (switch tactics if the boss's HP hasn't dropped in 150 turns). Next to enemies: hit the boss,
   else the weakest.
8. **Corridors:** 2+ awake enemies coming and you're in the open: step back into a corridor (not again for 12 turns).
9. **First-hit timing:** count the steps to the nearest awake enemy (not an archer). Even (2, 4...): wait, it walks
   into reach on its turn. Odd (3, 5...): step in. You hit first either way. Gives up after 4 waits if it doesn't come.
   Not while invisible (they've lost track of you).

## Between fights
10. **Patch up** with no enemies in sight, below half HP, only if no potion is wasted (Paladin: Holy Light first).
    Vampire: drink potions whenever it's quiet (they raise max HP up to a cap).
11. **Mapping scroll** on arriving at a floor, from floor 20 down.

## Moving
12. Head for a boss in sight, then archers, then any enemy in sight. Then a **cracked wall** you've seen (hidden
    room). Then the **merchant**, as soon as you've seen it.
13. **Pick things up** within 60 steps: potions, scrolls, chests, runes, gold, better gear. Pack full and better gear
    nearby: drop your worst gear on an empty tile, then take it. Never pick up what you dropped.
14. **Explore** what you haven't seen.
15. **Merchant once more** before leaving (junk to sell, or hurt). **Rest** (with Regeneration) to full before the
    stairs or the stairs' guardian.
16. **Stairs locked:** go fight their guardian (where you last saw it).
17. **Take the stairs.** After 700 turns on a floor, stop exploring and go.
18. **Can't find the guardian:** walk to the locked stairs, else look around places you've seen but not been to.
- **Walking:** around known traps (over one only if there's no other way), around enemies you can see, through cracked
  walls you've found. Walls you bump into in the dark are remembered.
- **Last resort ("peek"):** reveal the map. Counted as cheating in every result; should stay 0.

## Classes (rule 6)
- **Warrior** (Cleave): when 2+ enemies touch you (diagonals count), or next to a boss.
- **Rogue** (Vanish): R1 before attacking a boss or an enemy that takes 3+ hits (2-4 steps away), then strike for
  triple. R2 below 30% HP with no healing potion: Vanish and slip away (to the stairs if known). R3 3+ next to you.
- **Mage** (Firebolt): whenever an awake enemy is in sight. With a boss awake, save it for the boss unless the
  nearest enemy is right next to you.
- **Necromancer** (Raise Dead): raise a corpse in sight while you have fewer than 2 thralls. Before going down to a
  boss floor, raise a full pair (thralls follow you down).
- **Berserker** (Frenzy): next to an enemy that takes 3+ hits, or 2+ enemies, only above half HP. Below half: drink
  first, then Frenzy.
- **Paladin** (Holy Light): the first heal, before any potion (in a fight, and to patch up when its heal fits).
  Also when 2+ undead are in sight.
- **Gambler** (Bribe): when 2+ awake enemies are in sight and the nearest is the toughest; only if the gold reserve
  for merchants is left after paying.
- **Ranger** (Volley): down the straight line (8 tiles) with the most enemies; not point-blank at a lone enemy.
- **Trapper** (Snare): an awake enemy 2-6 steps away and none next to you: set a snare, then wait for it. Walks over
  dungeon traps (disarms them for gold).
- **Mole** (Dig): through a wall (up to 3 tiles) when that saves 10+ steps to where it's going. Monsters it feels
  through walls count as seen (they show dim on screen).
- **Alchemist** (Brew): bomb a boss, or 3+ enemies bunched together, only while holding more than 5 healing potions.
- **Vampire** (Bite): when the ward is under half, or next to a boss. Merchant: the ward refill when the ward is under
  half; potions only until max HP is capped. Rests (with Regeneration) to fill the ward.
- **Not yet:** the Gold-mastery alternate abilities.
