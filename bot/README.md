# The deep bot

A rule-based player that tries to get as deep as it can (Warrior, Hard Endless for now). It's Sam's learning
project: the plan is rules first, then look-ahead search, then maybe reinforcement learning (TODO.md has the plan).
Nothing in `bot/` goes live; only `app/` is published.

## Where things are
- [RULES.md](RULES.md): every rule in plain English (what Sam approves).
- [deep-bot.js](deep-bot.js): the bot. `KNOBS` at the top holds the numbers to tweak; the rules below it are
  checked top to bottom every turn, each with a comment saying what it does.
- [RESULTS.md](RESULTS.md): how deep each version got, so changes can be compared.
- [run.mjs](run.mjs): the batch runner; [report-template.html](report-template.html): its results page.
- [sam-runs.json](sam-runs.json): your own runs, drawn on the charts next to the bot.

## Running it from VS Code (on your PC, no Claude needed)
Open the Amber Depths folder in VS Code, then **Terminal → Run Task...**:
- **Bot: install (first time only)**: downloads Playwright (the tool that runs hidden browser tabs) into `bot/`.
- **Bot: run batch**: pick a class, difficulty and seeds (`1-20`, or `1,5,9`) and give the batch a name. It plays
  them about 25 at a time (20 games take a minute) and opens a results page with charts: floor reached, what killed
  it, the character floor by floor next to your own run, a fair-play "weird things" list, and every game.
- **Bot: watch a seed**: replays one seed slowly in a visible window (same seed = same game).
  To step through one floor turn by turn instead: `node bot/run.mjs --watch 5 --from 25 --to 25 --text`.
- **Bot: open last results**: reopens the latest results page.

Each batch is saved in `bot/runs/<date>-<name>/` (not in git): one file per game, `summary.json`, `report.html`.
The same from a terminal: `node bot/run.mjs --cls warrior --seeds 1-20 --label v3` or `node bot/run.mjs --watch 11`.
Your own runs on the charts come from [sam-runs.json](sam-runs.json): add a run there as you play.

## Fair play
The bot only sees what's on screen (a "screen view": unseen tiles are unknown; monsters only while in sight; items,
traps, cracked walls, the merchant and stairs once seen), and it acts only through the game's own moves and buttons.
The results page flags games where it did something a person wouldn't: map peeks, stalls, a floor that took far
longer than the same floor in other games, or a big level jump on one floor.

## Running it in the browser pane (how Claude tests a single game)
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
