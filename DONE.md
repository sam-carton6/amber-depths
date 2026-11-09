# Amber Depths — done (the archive)

Finished work, moved out of TODO.md so a new chat reads less. Nothing here needs doing. Newest first.

<!-- Format:
### YYYY-MM-DD — what was done (commit abc1234)
- One or two lines on how it works or anything a future chat should know.
-->

### 2026-11-09 — 3 new potions and the Scavenger upgrade (staging)
- `POTIONS` (str, haste, cure): a potion with a `kind`; no kind = healing, so old saves are untouched. `isHeal` picks
  healing for P, the HUD count, the Alchemist's Brew and the bots. Timers `S.str` (10), `S.haste` (16 of your turns:
  `endTurn` skips every other `monstersTurn`), `S.cure` (30: `applyStatus` refuses poison, burn, slow; haste refuses slow).
- Where they come from: 1 potion drop in 5 from monsters is a rarer one (so fewer healing potions deep down), 35% of
  floors have one lying around, every merchant sells one. Strength doubles `attack()` damage (melee and Whirlwind).
- Scavenger (`BOONS.scav`): +1 plus on every new piece of gear and +15% bonus chance per pick.
- Checked: each potion's effect (Strength 2x hits, Haste 4 monster moves in 8 turns, Antidote cures and blocks), stacking,
  save/reload, shop and floor drops, Scavenger (+2 plus and 45% bonus rate at 2 picks); 5 bot games clean.

### 2026-11-09 — v80 live
- Merged `staging` → `main` at `adb9bc6`: easter eggs and class birthdays (v71), step over seen traps (v72), Brood
  Mother/spider wake-up fix (v73), merchant temper/reinforce/bigger pack (v78), sprites hidden on live (v80).

### 2026-11-09 — v80: sprites hidden on the live game (staging)
- `SPR_HOST` in the source: sprites show only on localhost and test.* until Sam says they're ready (then drop the
  check). Checked: localhost 35 sprite cells, `?ascii` 0, another address ([::1], like live) 0.

### 2026-11-08 — v76: Sam's first 5 sprites in the game (staging)
- floor, wall, knight (player), rat, potion; one PNG per sprite in `art/sprites/` (PicSquare can't export a sheet), so
  the v74 sheet code was swapped for per-file sprites. Floor/wall tile across cells; the player draws above monsters;
  the Guide's symbol list shows sprites. Bot: 2 games, no issues; checked at phone width.

: sprite sheet support, no art yet (staging)
- `art/sprites.png` (16x16 squares, any number of rows/columns) is inlined by the build; `SPRITES` in the source maps
  monster names / `player` / map letters to squares. Tested with a throwaway sheet: draws on the map, bot played 400
  turns with no issues; with no sheet the game is unchanged. Details in src/HANDOFF.md (Sprites) and TODO.md (Art).

### 2026-11-09 — v78: gold sinks at merchants (staging)
- Sam's Hard Endless run ended floor 49 with 71k unspent gold. Every shop now also offers three services that never
  sell out: Temper your weapon (+1 attack) and Reinforce your armor (+1 defence) share one price that doubles each
  buy (500, 1000, 2000...; `SMITH_BASE`, counted in `S.smith`), and A bigger pack (+2 slots, up to +6; 1000, 3000,
  9000; `S.packX`, added in `packMax()`). Gambler and birthday discounts apply (`dynPrice`). On Sam's floor-49 save:
  63.5k buys +4 attack +3 defence. Guide's How to play line updated.

### 2026-11-07 — v73: poisonous monsters no longer poison themselves (staging)
- Sam: the Brood Mother came for him as soon as floor 30 started. Cause: a monster's poison bite and "this monster is
  poisoned" shared one field (`m.poison`), so cave spiders, ghouls and the Brood Mother spawned poisoned, took a tick on
  turn 1 (which wakes anything, even out of sight) and lost their bite once it ran out. The bite is now `venom`;
  loadGame fills it in for monsters in older saves. Checked on Sam's floor-29 save: she sleeps until she sees you.

### 2026-11-07 — v72: step over seen traps (staging)
- Sam: hallway traps you must cross again and again were annoying. A trap you've spotted (or that has already
  caught you) is now stepped over safely ("You step carefully over the ... trap."). Hidden traps still fire once.
  Webs, snares and the Trapper's disarm are unchanged. Guide's How to play line updated. Bot: 4 classes clean.

### 2026-11-07 — v71: easter eggs and class birthdays (staging)
- All in the source's "easter eggs" section: odds in `EGGS` (cat nook 3%/floor, shop cat 10%/shop, footsteps 0.2%/floor,
  ghost after 100 still turns with no enemy in sight). `xyzzy` in a run; Konami on the title (logo hue cycle); 10 torch
  taps (blue, this session); Halloween/New Year (`HOLIDAYS`: map tint + title and run greeting); cats `S.cats` (sleeping
  in a carved nook, or next to the merchant; one +1 max HP per run, `S.catPet`); floor 13 death "Unlucky."; Endless
  floor 99 silent credits floor; class birthdays `BDAY` (10% off, shop greeting, shown in the Guide's class list).
- Testing: on localhost and test.* only, `?eggs` forces every chance egg (ghost after 5 turns), `?date=MM-DD` fakes the date.

### 2026-11-07 — v70 live: item under a merchant fixed (commit `4e86721`)
- `placeShop` picks from the room's open tiles (or nudges the item aside); was ~1 shop in 900.

### 2026-11-07 — v69 live: title screen, daily set-aside, more leaderboards (commit `61de9ef`)
- Main menu (Continue, Start game / New run, Save & sync, Settings, Guide, Support → ko-fi.com/samcarton) and a run
  setup page (`#title[data-page]`, `setPage()`; top bar Back/Challenges/History/Leaderboards/sound). The new menu's id
  is `mainmenu`: `menu` is the in-game Main menu button. Settings sheet (`openSet`, `#setbody`) took controls, text
  style, screen color and sound out of Challenges. "How to play" lives in the Guide (`#howtotpl`).
- Starting the daily parks the saved run in `amber-depths-parked`; `finishRun` puts it back, the end screen offers
  "Back to your … run".
- Boards cleared on 7 Nov; only runs finished since then count (no history upload). Added fastest win / toughest win
  (lowest first, `LOW` in worker/index.js), biggest hit, most kills.

### 2026-11-07 — v59 live: cloud sync and leaderboards (commit `7df1995`)
- worker/index.js + D1 `amber-depths` (shared with test.amberdepths.com, which ignores scores via `TEST_COPY`).
  Sync codes (hashed), whole-save upload with version check (409 → take the newer save), last 10 saves kept.

### 2026-11-06 — Moved to Cloudflare Workers (amberdepths.com, test.amberdepths.com); old github.io shows a moved screen

### 2026-11-06 — v51 on `staging`: the Vampire class
- No healing from anything (potions, level-ups, merchant meal, Regen/Vamp boons, Vampiric gear: those feed the
  ward instead). Blood ward `S.ward` (25% of max HP) soaks hits first, refills by 10% of damage dealt (`hurtMon`)
  and fully on each new floor; the merchant's meal becomes "A cup of something red" that fills it. Potions give +3
  max HP for good (`S.blood`, cap 60). Bite (cd 6): double damage to the toughest adjacent enemy, refills 25% of
  the ward. Alt (Gold mastery): Blood Burst. Unlock challenge `c_vampire` "Bloodless": floor 10 without a potion.
- First tuning had the ward refill by a third of damage dealt and Bite refill it fully: the bot lost almost no HP
  in 10 Hard floors. Test bot now Bites and drinks blood potions when safe.

### 2026-11-06 — v48 merged to `main`: compact pack (commit 37379c5)
- Potions and scrolls are tiles, two to a row (short name, count, one-line description, × to drop); gear keeps
  full rows. Root cause of the tall rows: on touch screens the hidden number badge shifted the grid, putting the
  description in a thin column beside the name (also fixed in the shop lists).

### 2026-11-06 — v47 merged to `main`: softer deep hits, no frost lock (commit bb40c57)
- Sam died on floor 41 (Hard Endless Rogue, Lv 72) surrounded by wisps and trolls: each deep hit was ~20% of his HP.
  `DEEP_DMG` 1.025 -> 1.012 (floor-41 hits 56-69 -> 33-43). Frost no longer refreshes a running slow, and can't
  re-slow for 3 turns after it ends (`S.status.thaw`); a wisp hitting every turn now slows you ~30% of the time, not
  ~100%. Guide's status section says so.

### 2026-11-05 — v45 merged to `main`: Endless boss floors and deep retune (commit 26fb771)
- **Endless boss floors:** every 10th floor is a short dungeon (left) and a lit arena with pillars (right) where a
  boss holds the stairs, from a shuffled deck (each once before repeats, never twice running): Cyclops (stomp and
  boulders, 2 turns' warning), Drake (thin fire line, 1 turn, burns; leaps back), Lich (bolts, brittle skeletons,
  blinks after each quarter of its HP), Brood Mother (webs `"` that slow you, spiderlings, poison bite), Shadow (fast;
  vanishes and strikes the X around you). Every 50th floor: the **Amber Wyrm** (wide breath with 2 turns' warning,
  tail sweep, brittle minions at half HP, enrages). Rewards: 2 upgrade picks (Wyrm 3), gear +2 extra (Wyrm +3), more
  gold, relic 75% (Wyrm always). Golems now on floors 5, 15, 25...
- **Deep Endless retuned:** monsters past floor 12 gain HP every floor (`DEEP_HP` 1.05) and their damage grows slower
  (`DEEP_DMG` 1.04 -> 1.025), so fights last a few hits instead of one-shots both ways. Tested with Sam's floor-40
  character: floor-40 bosses take 12-18 turns (the Lich 67-195, the slog), the floor-50 Wyrm won 1 of 3 at his current
  strength and 3 of 3 with ~10 more levels.

### 2026-11-05 — v31 merged to `main` (commit 51b1a6d)
- Deploy passed; live sw.js is v31 and the page has the version tag and Controls. Includes v29-v31.

### 2026-11-05 — v31: phone Controls setting (commit 51b1a6d)
- Challenges menu > Controls: Arrows, Big arrows (cells `min(84px, (100vw - 176px) / 3)`, about 68px on a 375px
  phone, up from 56), or Tap the map (`tapDir`: the screen split like an X, the middle quarter-square waits; faint
  `.tapguide` lines; buttons in one row; foldable `#phstats` Run stats on phones, open state in `PROF.statsOpen`).
- `PROF.ctl` holds the choice; root `data-controls`. The map may use 50% of the screen height in tap mode (40% otherwise).

### 2026-11-05 — v30: version number on the title screen (commit a316b11)
- `src/build.mjs` writes the sw.js VERSION into `#ver` ("dev" in the source, "test" on the test page); the tag is
  ignored when deciding whether the output changed, so it never causes a bump by itself.

### 2026-11-05 — v29: Challenges menu fix (merged, commit e94f223)
- With Clean/Readable text or a non-amber screen colour, the page root carried `data-font`/`data-crt`, so the
  pickers' click handler (which reopens the menu) landed on the whole page: ✕ didn't close it and any click reopened
  it. Both pickers are now selected inside `#chalbody`.

### 2026-11-05 — v28 merged to `main` (commit de55c6e)
- Deploy passed; live index.html, sw.js and the new font files match `main` (VERSION v28). Includes v25-v28.

### 2026-11-05 — v28: run stats panel (on staging)
- `rs()` keeps per-run counters in `S.rs` (created lazily, so older saves work): damage dealt (in `hurtMon`, capped at
  the monster's HP, not counting allies via `allyDmg`), damage and hits taken (`damagePlayer`, `hurtSelf`), crits,
  dodges, biggest hits, gold found. `statRows()` feeds the STATS side panel (wide screens only, like Equipped) and a
  THIS RUN section in the guide. Checked: numbers match a 400-turn bot run; 1024×768 and 375×812 layouts OK (the 11px
  of extra height at 1024×768 was there before).

### 2026-11-05 — v26: walls no longer take an item's colour (on staging)
- Cause: JetBrains Mono's code ligatures joined pairs like `#!`, `#?`, `#[`, `]#` into one glyph across the map's
  spans and painted it in the item's colour. Fix: `font-variant-ligatures: none` plus `liga`/`calt` off on `#map`,
  `.ascii` and `pre`. Shown side by side at 56px before the fix: the walls took the item colour; after: correct.

### 2026-11-05 — v25: text style picker (on staging)
- `FONTS` / `applyFont()`: `PROF.font` sets `data-font` on the page root, and CSS swaps `--font-ui` (Clean = JetBrains
  Mono, Readable = Atkinson Hyperlegible Mono, local `app/ahm-400/700.woff2`, in `ASSETS`). The map always stays on
  JetBrains Mono. Picker is on the Challenges screen next to Screen color; all three are free (readability shouldn't
  be locked). `app/FONTS-LICENSE.txt` holds the OFL text for all three fonts. Headings stay pixel in every style.
- Checked on a 375×812 screen: no overflow with any style, the setting is saved in the profile and backups.

### 2026-11-05 — v23 merged to `main` (commit 529df11)
- Deploy passed; live index.html and sw.js match `main` (VERSION v23).

### 2026-11-05 — v23: Endless gear past +7 (on staging)
- `gearPlus()`: in Endless past floor 10, every piece made by `gear()` gets `plus` = (depth - 10) / 3 ± 1, added to
  `val` (so the name reads "Runeblade +10" for base 7 + 3). `modVal()` scales Vampiric (1 + plus/4 per hit),
  Vigorous (8 + 2 × plus HP) and Thorned (2 + plus/2); Keen stays +15%. Prices follow `val` as before.
- Sampled: f12 best +8, f20 +11, f30 +14, f45 +19; Standard still tops out at +7.

### 2026-11-05 — v22 merged to `main` (commit ddaf2c3)
- Deploy passed; live index.html and sw.js match `main` (VERSION v22).

### 2026-11-05 — v22: the Mole class (on staging)
- `CLASSES.mole`: sight 3 (`descend()`; the A4 Darkness cut no longer raises short sight), Dig aims like Volley
  (`S.aiming`, `dig()`): up to `DIG_LEN` 3 wall tiles, never the outer wall, no cooldown if there's no wall.
  Tremor sense: `render()` draws monsters within `TREMOR` 8 tiles that aren't in view as dim `.tremor` letters, even
  on unexplored tiles. Alternate: Cave-in (2 + level to every enemy felt within 8). Unlock `c_mole` "Burrower":
  reach floor 15 in Endless (checked at startup, so existing progress counts).
- Tested in the browser (dig, no-wall case, tremor near/far, Cave-in); bot taught to dig; Mole bot games below.

### 2026-11-05 — v21 merged to `main` (commit 8b52381)
- Deploy passed; live index.html and sw.js match `main` (VERSION v21). Includes v20 and v21.

### 2026-11-05 — v21: free equipping out of combat; Delete / End / Page Down / right Ctrl keys (on staging)
- `useItem()` returns before `endTurn()` for gear when no enemy is in sight (and saves). Keys map by `e.code`; right
  Ctrl gets past the ctrl-key guard only on its own keydown (no repeats), so Ctrl+C etc. still do nothing.

### 2026-11-05 — v20: pack stays open on gear swaps, Pack Mule relic, Sell all junk (on staging)
- `useItem()` keeps the pack open for gear when no enemy is in sight, re-renders it after the turn, and closes it if
  an enemy appears. Pack size goes through `packMax()` (Pack Mule +5). Junk = gear not better than what's worn
  (`junkGear()`); the shop's Sell all junk button sells it at the normal third of the price.
- Tested each in the browser; bot sweep with Pack Mule (10 classes, Standard).

### 2026-11-05 — v19 merged to `main` (commit 0aed9ae)
- Deploy passed; live index.html and sw.js match `main` (VERSION v19). Includes v18 and v19.

### 2026-11-05 — v19: Phoenix Feather relic, Golem gets the deep curve (on staging)
- Phoenix Feather (`phoenix` in `RELICS`): `die()` checks it first; once per run (`S.revived`) you come back at half
  max HP with statuses cleared. Collector II now counts every relic (13), so players who had all 12 keep the badge.
- The Golem's melee and slam use `DEEP_DMG ** deep()` like other monsters (floor 30 Golem bonus 10 -> 20).
- Bot sweep with the feather, 20 games (Standard and Endless Hard, every class): every death had used the revive
  first, no errors.

### 2026-11-05 — v18: Backup and restore (on staging)
- Title-screen Backup sheet: every `amber-depths-*` key, gzipped (CompressionStream) and base64'd into an `AD1z:`
  code (24 KB of data became 5 KB), or the same code as a .txt file (share sheet on phones, download elsewhere).
  Restore from a pasted code or file replaces all keys after a confirm, then reloads. Also calls
  `navigator.storage.persist()`. Tested: wipe + restore gave identical data and the run continued; bad codes are
  refused. Not tested: Save as file and Open file on a real iPhone.

### 2026-11-05 — v17 merged to `main` (commit 031a7c4)
- Deploy passed; live index.html and sw.js match `main` (VERSION v17). Includes v14-v17.

### 2026-11-05 — v17: numpad . and 0 swapped (. pack, 0 wait); Frost Nova freezes 5 turns, bosses 2 (on staging)
- Checked: two enemies frozen by Nova stay frozen for 4 of your turns after the cast (was 2).

### 2026-11-05 — v16: Golem upgrades, Rogue dodge, numpad controls (on staging)
- Upgrades ("boons", `BOONS` in the source): after a Golem in Endless (every 5 floors) or Standard (floor 5), a sheet
  offers 3 of 8; values scale with `boonTier()` = depth / 5. Stored in `S.bn` (numbers), `S.boons` (names taken);
  an open offer is `S.boonOffer` and reopens after a reload. Old saves just have none. Dodge caps at 50%.
- Rogue `dodge: .1` (melee and arrows only, not traps or telegraphed attacks). Numpad keys map by `e.code`, only on
  the game screen (so numpad 6 doesn't start the daily on the title).
- The test bot now picks a random upgrade. Soak: 40 Hard Endless games plus 10 Standard, no errors. The bot often
  skips floors it can't solve (and so the Golem), so most bot runs got 0-1 upgrades: it checks safety, not balance.
  Gotcha: `test/soak.js` must fetch the bot with no-store, or the browser hands back an old copy.

### 2026-11-05 — v14: Endless gets deadlier past floor 12 (on staging)
- Measured first: on Hard Endless the danger climbed to floor 12, then went flat (about 11 average hits to kill you from
  floor 12 to 80; potions piled to 50). Now, in Endless past floor 12, monster damage is multiplied by 1.04 per floor
  (in `makeMon`) and the kill-drop potion chance by 0.95 per floor. Short/Standard unchanged.
- Soak: 80 bot games per version (10 classes × 4, two tabs), `test/soak.js` hooked into the bot. Hits to kill you,
  old → new: f13-18 13.6 → 12, f19-24 13 → 8, f25-30 12 → 5.7, f31+ 11 → 5. Deepest bot run 81 → 33; median depth
  about the same (15-18, the bot dies early to its own mistakes). Gotcha: the browser cached the old test page,
  so load it with `?v=something` and check the page has the new code before soaking.

### 2026-10-28 — v13 merged to `main` (commit 905e9af)
- Deploy passed; live index.html and sw.js match `main` (VERSION v13).

### 2026-10-28 — v13: tester's bugs 6 and 7
- Bug 6: `loadHist()` ignores a history that isn't a list (and junk entries); profile fields with the wrong type reset
  to their defaults on load. Tested with broken storage: title, history and end screen all work.
- Bug 7: text changed to match the code (balance unchanged): A3 keeps the Wyrm/Heart floor potions, A6 includes the
  Amber Heart, Shield Wall doesn't halve poison/burn, Golden Shot costs 4 per floor on Short, and the shop's full-pack
  message says to sell gear (no "drop", the pack can't open there). Bot sweep: 20 games, all classes, no issues.

### 2026-10-28 — v9 merged to `main` (commit ab94b59)
- Deploy passed; live files match. The v8 no-delay fix is proven: a browser that loaded v8 just before the merge
  got v9 on its first reload, then dropped the v8 cache.

### 2026-10-28 — v9: scanlines everywhere, CRT sweep, calmer title blink
- Scanline pitches: 2px chips/bars (`--scan-2`), 3px buttons/cards/challenges (`--scan`), 4px sheets/toasts
  (`--scan-4`), 5px faint light lines on the page. `!important` so selected/pressed states keep them.
- `body::after` is a fixed beam sweeping down every 9 s behind everything (`isolation: isolate` on body keeps it
  above the page background). Off with reduced motion.
- The card stat lines used `.st`, the map's stairs class, so every title card pulsed like the stairs. Now only class
  cards pulse (`statglow`, 4.5 s, modest brightness).

### 2026-10-27 — v8 merged to `main` (commit ae04ebf)
- Deploy passed; live files match. A real browser with v7 installed moved to the v8 worker and cache by itself, and
  the page served through the new worker matches the server. The no-delay part gets its real proof at the next deploy.

### 2026-10-27 — v8 service worker: no more 10-minute update delay
- `sw.js` fetches the page with `cache: 'no-cache'` (ETag check) and installs assets with `cache: 'reload'`, so the
  browser's HTTP cache (GitHub Pages `max-age=600`) can't hand back an old page. Checked with a Node fake-browser
  test (install, online page, offline fallback, cached assets); the old sw.js fails it. Not run in a real browser:
  the Claude browser pane can't run service workers on localhost.

### 2026-10-27 — v7 merged to `main` (commit cec47f0): pixel font for UI text, CRT scanlines on boxes
- UI text uses "VT323 UI" (VT323 at 137%, defined in build.mjs); map/logo/ASCII art stay JetBrains Mono.
  Scanlines (`--scan`) on buttons, cards, challenges, sheets and the daily banner. Phone HUD: name on its own line.
- Deploy passed and live files match `app/`, but a browser that had loaded the page in the last 10 minutes got the
  old page once (HTTP cache, see TODO).

### 2026-10-27 — v6 merged to `main` (commit 6d039c8)
- Deploy passed; live files match `app/`, the live service worker moved to the v6 cache, no console errors.

### 2026-10-27 — v6: fixes for the independent tester's bugs 1–5
- Menu button ignored while the death/win animation plays; `die()`/`victory()` skip `showEnd` if the run changed.
- `.controls` gap 8px under 400px wide; `fit()` shrinks the map if the page still overflows (safe areas included).
  Measured: 375×812 and 402×874 fit with 47–62px top / 34px bottom insets simulated.
- `useItem()` refuses a potion at full HP (same check as the Potion button). `startDaily()` confirms before
  replacing a save. Ranger's fov 9 is set before the Ascension 4 Darkness cut (A4: Ranger 7, others 5).

### 2026-10-27 — v5 merged to `main` (commit 757287f)
- Deploy passed; live files match `app/`, `src/` isn't published, and a browser that had v1 installed moved to the
  v5 offline cache on its own.

### 2026-10-27 — Source into the repo, latest build (v5)
- `src/` holds the claude.ai source, HANDOFF.md and the test bot; `src/build.mjs` builds `app/index.html`.
- The live build had been the very first version; this brings in everything from claude.ai (10 classes, relics,
  Ascension, the Hollow). Bot sweep: 50 games, all classes, Short Hard to Nightmare A10, no issues or errors.

### 2026-10-27 — Merged to `main` (commit 12c42e6)
- Deploy run passed; live files match `app/` and the offline worker registers. Notes files aren't published.

### 2026-10-27 — Brought into the Project Kit
- Added CLAUDE.md, README.md, TODO.md, BUGS.md, DONE.md, .gitignore; created the `staging` branch.

### 2026-10-27 — Deploy from `app/` instead of a zip (commit b11b3cb)
- The app files moved out of `amber-depths-app.zip` into `app/`; the Pages workflow publishes that folder as-is.
