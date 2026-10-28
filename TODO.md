# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** the latest build (v5: 10 classes, relics, Ascension, the Hollow), built from `src/` with
`node src/build.mjs` (merged 27 Oct 2026, commit `757287f`).
**On `staging`, not live yet:** nothing.
**Next up:** Sam plays it on the iPhone and notes anything odd in BUGS.md.

## To do

- **Bugs from the independent tester (27 Oct 2026; each checked in the code or re-measured).** Most serious first:
  1. Tapping Menu during the death animation breaks the end screen (error in `showEnd`, or "YOU DIED" over a new
     run). `die()` / `victory()` aren't awaited (lines ~1868, 1927, 2305), so `busy` clears too early.
  2. iPhone mini/SE-width screens (375 px): in a run, the Pack button is below the screen (page 929 px tall on 812).
     The d-pad + actions row needs 344 px but gets 343, so it wraps; `fit()` also ignores the safe-area insets.
  3. Drinking a potion from the Pack at full HP wastes it and counts toward "Thirsty" (`useItem()` lacks the
     full-HP check the Potion button has).
  4. "Play daily" silently replaces a saved run (`startDaily()` doesn't check for one).
  5. Ranger ignores Ascension 4 Darkness (`descend()` sets fov 9 after the darkness cut).
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

- 
