# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** v13 (10 classes, relics, Ascension, the Hollow, all the tester's bugs fixed, pixel font, scanlines
everywhere, CRT sweep, updates arrive at once), built from `src/` with `node src/build.mjs` (merged 28 Oct 2026,
commit `905e9af`).
**On `staging`, not live yet:** v14, Endless gets deadlier past floor 12 (say "merge" to put it live).
**Next up:** Sam plays deep Hard Endless on staging/live and says if the curve feels right (too steep, too gentle?).

## To do

- **Tune the Endless curve from Sam's play.** Knobs at the top of the monster code in the source: `DEEP_FROM` (12),
  `DEEP_DMG` (1.04 per floor, compounding), `DEEP_POTS` (0.95). If potions still pile up, cap how many you can carry.
  Soak test: `test/soak.js` (ignored file; see DONE.md 5 Nov 2026 for how it was run).
- Sam's iPhone bug list from real play (touch, Safari, feel) goes in BUGS.md as it comes.

## Ideas (later)

- More classes, a second wave of relics, cosmetic titles on the daily share text.
- Leaderboards (would need a backend).
- **Endless, more ceremony:** a special floor or mini-boss every 10 floors, a "new depth record" moment, deep-only
  monsters or elite abilities past floor 15-20.
- **Endless build choices:** a pick every few levels (e.g. big damage for less HP) so you can spec a glass cannon. Biggest
  piece; do after the curve feels right.
- **Sprite pack option:** swap ASCII cells for tiles (e.g. Kenney's free 1-bit pack tinted amber). ~25-40% of a window.
- **Learning project (Sam):** write a smarter bot: rule-based first, then look-ahead search, then reinforcement learning
  (needs the game logic split out to run headless in Node).

## What's new at the next merge

- Endless gets deadlier past floor 12: monsters hit about 4% harder every floor (it adds up fast) and drop fewer
  potions. Deep runs now end in a real fight instead of you giving up.
