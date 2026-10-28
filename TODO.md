# Amber Depths — to do

Only what's still open. Finished work goes to [DONE.md](DONE.md) with the date and commit. Ideas Sam mentions go
under *Ideas (later)*; ask before building one.

## Where things stand (keep this current, a few lines)

**Live on `main`:** v7 (10 classes, relics, Ascension, the Hollow, tester's bugs 1–5 fixed, pixel font + scanlines),
built from `src/` with `node src/build.mjs` (merged 27 Oct 2026, commit `cec47f0`).
**On `staging`, not live yet:** nothing.
**Next up:** Sam plays it on the iPhone (check the screen layout and the scanlines) and notes anything odd in BUGS.md.

## To do

- Updates can show up to 10 minutes late: GitHub Pages sends `Cache-Control: max-age=600`, and `sw.js` fetches the
  page with a plain `fetch(req)`, which accepts the browser's cached copy. Fix: `fetch(req, { cache: 'no-cache' })`
  for the page (a cheap ETag check). Seen right after the v7 merge.

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

- 

- 
