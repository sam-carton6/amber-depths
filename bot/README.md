# The deep bot

A rule-based player that tries to get as deep as it can (Warrior, Hard Endless for now). It's Sam's learning
project: the plan is rules first, then look-ahead search, then maybe reinforcement learning (TODO.md has the plan).
Nothing in `bot/` goes live; only `app/` is published.

## Where things are
- [deep-bot.js](deep-bot.js): the bot. `KNOBS` at the top holds the numbers to tweak; the rules below it are
  checked top to bottom every turn, each with a comment saying what it does.
- [RESULTS.md](RESULTS.md): how deep each version got, so changes can be compared.

## Running it
1. `node src/build.mjs --test` (writes `test/game_test.html`: sound off, reduced motion, test hooks).
2. `python -m http.server 8765` in the repo root, open http://localhost:8765/test/game_test.html.
3. In the browser console (F12), load the bot:
   ```js
   await import('/bot/deep-bot.js?' + Date.now())
   ```
4. Then:
   - `await DeepBot.play({ seed: 5 })` plays one game and returns what happened (depth, floors, death report).
   - `DeepBot.batch({ seeds: [1, 2, 3, 4, 5] })` plays several in the background; `DeepBot.status()` shows
     progress and `DeepBot.results` the details.
   - `DeepBot.watch(5, 150)` replays seed 5 slowly (150 ms a turn) so you can watch it on screen.
   - Options for `play` / `batch`: `cls`, `mode`, `diff`, `relic`, `asc`, `alt`, `maxTurns`.

## Seeds and replays
While the bot plays, the game's randomness comes from the seed, so the same seed (and the same bot rules) plays the
exact same game every time. Change a rule and the game can play out differently from the first changed move.
The test build mutes sound and keeps torch flicker off the dice for this reason (`src/build.mjs`), and the bot puts
the profile back after each run (relics found would otherwise change later games).

## What a result holds
- `depth`, `turns`, `lv`, `kills`, `dead` / `won`
- `floors`: one row per floor reached (HP, max HP, level, attack, defense, potions, gold, kills, upgrades)
- `death`: what killed it, its last 25 moves (with HP) and the map at the end
- `peeks`: times it couldn't find the way on and had to reveal the map (should be 0)
