# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** the latest build (v5: 10 classes, relics, Ascension, the Hollow), built from `src/` with
`node src/build.mjs` (merged 27 Oct 2026, commit `757287f`).
**On `staging`, not live yet:** v6, fixes for the tester's bugs 1–5 (see DONE.md).
**Next up:** Sam says "merge", then plays it on the iPhone and notes anything odd in BUGS.md.

## To do

- **Left from the independent tester (27 Oct 2026; 1–5 fixed in v6):**
  6. Corrupted storage only: `amber-depths-history` holding a non-array, or a profile with `done: null`, stops the
     end screen or blanks the title. Can't happen in normal play; low priority.
  7. Guide/ability text vs code: A3 still puts potions on the Wyrm floor and in the Hollow; A6's HP boost also hits the
     Amber Heart; Golden Shot doubles on Short; Shield Wall doesn't halve poison/burn; the shop's "drop something"
     hint, but the pack can't open in the shop.
- Sam's iPhone bug list from real play (touch, Safari, feel) goes in BUGS.md as it comes.

## Ideas (later)

- More classes, a second wave of relics, cosmetic titles on the daily share text.
- Leaderboards (would need a backend).

## What's new at the next merge

- Tapping Menu right as you die or win no longer breaks the end screen.
- Smaller iPhones (mini, SE, 11 Pro): all the buttons fit on screen again.
- The Pack won't let you waste a potion at full health.
- Play daily asks before replacing a saved run.
- Ascension 4 Darkness now dims the Ranger too (still sees farther than other classes).

- 
