// Amber Depths "deep bot": a rule-based player that tries to get as deep as it can.
// It runs inside the test page (test/game_test.html) and plays the real game through window.__T.
// Never goes live: nothing outside app/ is published. How to run it: bot/README.md.
//
// It plays fair: it only uses what a player could see (no peeking at the map, no forced descents).
// Every run has a seed, so the same seed plays the exact same game again (watch it with DeepBot.watch).
//
// The rules are checked top to bottom every turn; the first one that applies is what the bot does.
// The numbers in KNOBS are the easiest things to tweak.

window.DeepBotKnobs = {
  drinkInFight: 0.40,     // drink a potion when HP falls below this share of max HP with enemies next to you
  drinkCalm: 0.50,        // with no enemies around, drink below this share (only if none of the potion is wasted)
  teleportAt: 0.25,       // out of potions and this hurt next to enemies: read a Teleport scroll to escape
  waitTurns: 4,           // most turns in a row to wait for an enemy that doesn't come any closer
  timingRange: 6,         // use the even/odd timing (rule 9) on enemies at most this many steps away
  fireScrollFoes: 3,      // read a Fire scroll when this many enemies are in sight (or a boss is awake)
  floorTurnLimit: 700,    // after this many turns on one floor, stop exploring and head for the stairs (resting first if you can)
  itemDetour: 60,         // ignore items further than this many steps away
  gearBuyBy: 2,           // only buy merchant gear at least this much better than what you wear (sell price is a third)
  mapFrom: 20,            // read Mapping scrolls only from this floor down (save them for when floors get dangerous)
  alchKeep: 5,            // Alchemist: only throw bombs while holding more than this many healing potions
  digSaves: 10,           // Mole: dig through a wall when it saves at least this many steps
  goldReserve: 3,         // before buying temper/reinforce, keep enough gold for this many future shop visits (heal + 2 potions each)
  smith: 'reinforce',     // which never-sell-out upgrade to buy: 'reinforce' (+1 defence) or 'temper' (+1 attack). They share
                          // one doubling price; defence takes 1 off every hit you take, so it's worth more deep down.
  // Upgrade picks after a Golem or boss, best first (no natural healing in this game, so Regeneration is gold).
  boonOrder: ['regen', 'skin', 'vitality', 'might', 'thirst', 'evasion', 'keen', 'reckless'],
};

(() => {
  const KNOBS = window.DeepBotKnobs;
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const dist = (a, b, c, d) => Math.abs(a - c) + Math.abs(b - d);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // Small seeded random generator (mulberry32). While a run plays, Math.random is swapped for it.
  const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  async function play(opts) {
    const o = { cls: 'warrior', mode: 'endless', diff: 'hard', seed: 1, maxTurns: 300000, delay: 0, ...opts };
    const T = window.__T;
    const realRandom = Math.random;
    Math.random = seeded(o.seed);
    // Runs change the profile (relics found, challenges), and that changes later games. Put it back afterwards
    // so a seed always replays the same game.
    const profBefore = JSON.stringify(T.PROF);
    const floors = [], trail = [];
    let S, waited = 0, floorStart = 0, lastDepth = 0, lastTurn = -1, stall = 0, peeks = 0, stuck = false, patientFrom = 0, backedAt = -99, restTurns = 0, restAll = 0, lastGap = 99, shopVisits = 0;
    const dropped = new Set(); // gear the bot put down on purpose: don't pick it back up
    const bumped = new Set(); // unseen tiles it walked into that turned out to be walls (a player learns that too)
    let guardian = null; // where it last saw the Golem or arena boss that holds the stairs
    const chased = new Map(); // monster -> turn it last went after where that monster vanished (once per 30 turns)
    let lastFoe = null; // where it last saw the enemy it was going for (so it doesn't lose interest when it steps out of view)
    let bossBest = Infinity, bossSince = 0, cutThrough = false; // arena fights: switch tactics when one goes nowhere
    const visited = new Set(); // tiles stood on this floor (to go and look around when stuck for ideas)

    // FAIR PLAY: the bot reads the game only through this "screen view", never the game itself, so it can only know
    // what a player sees: unseen tiles are '?', and monsters, items, traps, cracked walls, cats, the merchant and the
    // stairs show up only once seen (monsters only while in sight). Writes go to the real game (only the counted peek).
    const screen = G => {
      const seen = (x, y) => G.seen[y] && G.seen[y][x];
      const map = G.map.map((row, y) => row.map((c, x) => seen(x, y) ? c : '?'));
      return new Proxy(G, {
        get(t, k) {
          switch (k) {
            case 'map': return map;
            case 'mons': return t.mons.filter(m => m.ally || (t.vis[m.y] && t.vis[m.y][m.x])
              || (t.cls === 'mole' && Math.max(Math.abs(m.x - t.px), Math.abs(m.y - t.py)) <= T.TREMOR)); // Mo2: a Mole feels them (shown dim)
            case 'items': return t.items.filter(e => seen(e.x, e.y));
            case 'traps': return t.traps.filter(tr => tr.seen);
            case 'secret': return new Set([...t.secret].filter(k => { const [x, y] = k.split(',').map(Number); return seen(x, y); }));
            case 'cats': return (t.cats || []).filter(c => seen(c.x, c.y));
            case 'shop': return t.shop && seen(t.shop.x, t.shop.y) ? t.shop : null;
            case 'stairs': return t.stairs && seen(t.sx, t.sy);
            default: return t[k];
          }
        },
        set(t, k, v) { t[k] = v; return true; },
      });
    };
    const monAt = (x, y) => S.mons.find(m => m.x === x && m.y === y);
    const itemAt = (x, y) => S.items.find(e => e.x === x && e.y === y);
    const shopAt = (x, y) => !!(S.shop && S.shop.x === x && S.shop.y === y);
    const free = (x, y) => S.map[y] && S.map[y][x] !== undefined && S.map[y][x] !== '#' && S.map[y][x] !== '?' && !monAt(x, y) && !shopAt(x, y)
      && !S.cats.some(c => c.x === x && c.y === y) && !(itemAt(x, y) && itemAt(x, y).it.type === 'chest') && !(x === S.px && y === S.py);
    const log = what => { trail.push(`t${S.turn} f${S.depth} hp${S.hp}/${T.stats().max}: ${what}`); if (trail.length > 60) trail.shift(); };
    const heal = i => i.type === 'potion' && !i.kind; // healing potions (Strength, Haste and Antidote have a kind)
    const potions = () => S.pack.filter(heal).reduce((a, i) => a + (i.n || 1), 0);
    const packIdx = (type, kind) => S.pack.findIndex(i => i.type === type && (!kind || i.kind === kind));
    const snapshotFloor = () => { const st = T.stats(); floors.push({ floor: S.depth, turn: S.turn, hp: S.hp, max: st.max, lv: S.lv, atk: st.atk, def: st.def, potions: potions(), gold: S.gold, kills: S.kills, rest: restAll, boons: (S.boons || []).join(' ') }); };

    // A tile the bot is willing to walk on (it only knows what it has seen).
    let allowTraps = false, allowMons = false;
    const walkable = (x, y, goal) => {
      if (x < 0 || y < 0 || x >= T.W || y >= T.H) return false;
      const k = x + ',' + y;
      if ((S.map[y][x] === '#' && !S.secret.has(k)) || bumped.has(k)) return false; // a cracked wall you've seen can be walked through
      if (S.cats.some(c => c.x === x && c.y === y)) return false; // easter-egg cats don't move; walk around them
      if (goal) return true;
      if (!S.seen[y][x]) return false;
      const m = monAt(x, y); if (m && !m.ally && !allowMons && S.vis[y][x]) return false; // walking into an unseen (or only felt) one just attacks it
      if (shopAt(x, y) || S.danger.has(k)) return false;
      if (!allowTraps && o.cls !== 'trapper' && S.traps.some(t => t.x === x && t.y === y && !t.mine)) return false;
      return true;
    };
    // The first step toward the nearest tile where goal(x, y) is true, plus how far it is. Steps around known traps,
    // and over them only when there's no other way (a trap can sit in a doorway).
    const path = goal => { const p = bfs(goal); if (p) return p; allowTraps = true; try { return bfs(goal); } finally { allowTraps = false; } };
    const bfs = goal => {
      const prev = new Map([[S.px + ',' + S.py, null]]), q = [[S.px, S.py]];
      for (let i = 0; i < q.length; i++) {
        const [x, y] = q[i];
        if (i > 0 && goal(x, y)) {
          let cur = [x, y], steps = 0;
          while (true) { const p = prev.get(cur[0] + ',' + cur[1]); if (p[0] === S.px && p[1] === S.py) break; cur = p; steps++; }
          return { dx: cur[0] - S.px, dy: cur[1] - S.py, steps: steps + 1 };
        }
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
          if (prev.has(k) || !walkable(nx, ny, (nx >= 0 && ny >= 0 && nx < T.W && ny < T.H) && goal(nx, ny))) continue;
          prev.set(k, [x, y]); q.push([nx, ny]);
        }
      }
      return null;
    };
    // Steps from (sx, sy) to the nearest tile where goal is true (for the Mole's dig shortcuts), or null.
    const stepsFrom = (sx, sy, goal) => {
      const seen = new Set([sx + ',' + sy]), q = [[sx, sy, 0]];
      for (let i = 0; i < q.length; i++) {
        const [x, y, d] = q[i];
        if (goal(x, y)) return d;
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
          if (seen.has(k) || !walkable(nx, ny, nx >= 0 && ny >= 0 && nx < T.W && ny < T.H && goal(nx, ny))) continue;
          seen.add(k); q.push([nx, ny, d + 1]);
        }
      }
      return null;
    };
    // How many open tiles touch (x, y) straight-on: 2 or fewer means a corridor, where only 1-2 enemies can reach you.
    const openness = (x, y) => DIRS.filter(([dx, dy]) => S.map[y + dy] && S.map[y + dy][x + dx] !== undefined && S.map[y + dy][x + dx] !== '#').length;

    // For the turn-by-turn viewer (run.mjs --text): the screen after each move, from slowFrom to stopAfter.
    const frames = [];
    const frame = what => { if (o.frames && S.depth >= (o.slowFrom || 0)) frames.push({ t: S.turn, f: S.depth, hp: S.hp, max: T.stats().max, what, map: mapText(T.S), log: T.S.log.slice(0, 3).map(l => l.t) }); };
    async function act(dx, dy, what) {
      log(what);
      const x = S.px + dx, y = S.py + dy, t0 = S.turn;
      await T.act(dx, dy);
      // Walked into the unknown and nothing happened: it's a wall. Remember it.
      if ((dx || dy) && T.S.px === S.px && T.S.py === S.py && T.S.turn === t0 && S.map[y] && S.map[y][x] === '?') bumped.add(x + ',' + y);
      frame(what);
    }
    async function use(i, what) { log(what); await T.useItem(i); frame(what); }
    // Uses the class ability; Ranger and Mole then pick a direction. Says whether a turn went by.
    async function useAbility(what, dir) {
      const t0 = S.turn; log(what);
      await T.ability();
      if (T.S.aiming) await T.act(dir ? dir[0] : 0, dir ? dir[1] : 0);
      frame(what);
      return T.S.turn !== t0;
    }

    // RULE 6, per class: when to use the ability (only called when it's ready). Plain-English list: bot/RULES.md.
    async function classMove({ st, foes, adj, touching, awake, pot }) {
      const hit = 3 + st.atk, tough = m => m.boss || m.hp > 3 * hit; // a normal hit does about 3 + attack
      const near = list => [...list].sort((a, b) => Math.hypot(a.x - S.px, a.y - S.py) - Math.hypot(b.x - S.px, b.y - S.py));
      const inLine = m => T.clear(S.px, S.py, m.x, m.y);
      switch (o.cls) {
        case 'warrior': // Cleave when 2+ enemies touch you (diagonals count), or next to a boss
          if (touching.length >= 2 || (touching.some(m => m.boss) && adj.length)) return useAbility('cleave x' + touching.length);
          break;
        case 'rogue': {
          if (S.invis) break;
          if (adj.length >= 3) return useAbility('vanish (surrounded)'); // R3
          if (adj.length && S.hp < st.max * .3 && !S.pack.some(heal)) return useAbility('vanish (escape)'); // R2
          const big = awake.find(m => tough(m) && dist(m.x, m.y, S.px, S.py) >= 2 && dist(m.x, m.y, S.px, S.py) <= 4);
          if (big && !adj.length) return useAbility('vanish, then strike the ' + big.name); // R1: the next hit triples
          break;
        }
        case 'mage': { // M1: fire at the nearest enemy in sight; M2: with a boss up, save it unless a minion is in your face
          const t = near(foes.filter(inLine))[0], boss = foes.find(m => m.boss && m.awake);
          if (!t || !awake.length) break;
          if (boss && t !== boss && dist(t.x, t.y, S.px, S.py) > 1) break;
          return useAbility('firebolt the ' + t.name);
        }
        case 'necro': // N1: raise a corpse in sight while you have fewer than 2 thralls
          if (S.mons.filter(m => m.ally).length < 2 && S.corpses.some(c => S.vis[c.y][c.x] && free(c.x, c.y))) return useAbility('raise a thrall');
          break;
        case 'berserker': // B1: Frenzy next to a tough enemy or 2+, only above half HP (no potions during it); B2: drink first
          if (!S.frenzy && (adj.some(tough) || adj.length >= 2)) {
            if (S.hp > st.max * .5) return useAbility('frenzy');
            if (pot >= 0) { await use(pot, 'drink before frenzy'); return true; }
          }
          break;
        case 'paladin': // P2: Holy Light when 2+ undead are in sight (P1, healing with it, is in rules 2 and 10)
          if (foes.filter(m => T.UNDEAD.has(m.name)).length >= 2) return useAbility('holy light (undead)');
          break;
        case 'gambler': { // G1: bribe the nearest when it's the toughest of 2+; G2: keep the merchant reserve
          const cand = near(foes.filter(m => !m.boss)), m = cand[0];
          if (!m || awake.filter(x => !x.boss).length < 2 || m.maxhp < Math.max(...cand.map(x => x.maxhp))) break;
          const e = S.depth * S.M.scale, cost = Math.round((10 + m.maxhp) * (1 + e * .08));
          const reserve = KNOBS.goldReserve * ((8 + 3 * e) + 2 * (14 + 4 * e));
          if (S.gold - cost >= reserve) return useAbility(`bribe the ${m.name} (${cost}g)`);
          break;
        }
        case 'ranger': { // Ra1, Ra2: shoot down the straight line with the most enemies; not point-blank at a lone one
          let best = null;
          for (const [dx, dy] of DIRS) {
            let n = 0, first = 0;
            for (let i = 1; i <= 8; i++) {
              const x = S.px + dx * i, y = S.py + dy * i;
              if (!S.map[y] || S.map[y][x] === undefined || S.map[y][x] === '#' || S.map[y][x] === '?' || shopAt(x, y) || S.cats.some(c => c.x === x && c.y === y)) break;
              const m = monAt(x, y); if (m && !m.ally) { n++; if (!first) first = i; }
            }
            if (n && (!best || n > best.n)) best = { dx, dy, n, first };
          }
          if (best && (best.n >= 2 || best.first >= 2)) return useAbility(`volley (${best.n} in line)`, [best.dx, best.dy]);
          break;
        }
        case 'trapper': // T1: an awake enemy 2-6 steps away and none next to you: snare, then wait for it (rule 9)
          if (!adj.length && awake.some(m => { const d = dist(m.x, m.y, S.px, S.py); return d >= 2 && d <= 6; })) return useAbility('set a snare');
          break;
        case 'alch': { // A1: bomb a boss, or 3+ enemies bunched together, while keeping enough healing potions
          if (potions() <= KNOBS.alchKeep) break;
          const t = near(foes.filter(inLine))[0]; if (!t) break;
          const bunch = foes.filter(m => Math.max(Math.abs(m.x - t.x), Math.abs(m.y - t.y)) <= 1).length;
          if ((t.boss && t.awake) || bunch >= 3) return useAbility(`bomb (${bunch} caught)`);
          break;
        }
        case 'vampire': // V2: Bite when the ward is under half, or next to a boss
          if (touching.length && ((S.ward || 0) < T.wardMax() / 2 || touching.some(m => m.boss))) return useAbility('bite');
          break;
      }
      return false;
    }

    // Mole Mo1: if tunnelling through a wall (up to DIG_LEN tiles, never the outer wall) is much shorter, dig.
    async function digShortcut(mv, goal) {
      let best = null;
      const inner = (x, y) => x > 0 && y > 0 && x < T.W - 1 && y < T.H - 1;
      for (const [dx, dy] of DIRS) {
        let k = 0, x = S.px + dx, y = S.py + dy;
        while (k < T.DIG_LEN && inner(x, y) && S.map[y][x] === '#') { k++; x += dx; y += dy; }
        if (!k || !inner(x, y) || S.map[y][x] === '#') continue;
        const rest = stepsFrom(x, y, goal); if (rest === null) continue;
        const total = k + 2 + rest; // dig, walk the tunnel, step out, then the rest of the way
        if (!best || total < best.total) best = { dx, dy, total, k };
      }
      if (best && mv.steps - best.total >= KNOBS.digSaves) return useAbility(`dig ${best.k} wall(s), saves ${mv.steps - best.total} steps`, [best.dx, best.dy]);
      return false;
    }

    T.sel.relic = o.relic || null;
    T.sel.alt = { [o.cls]: !!o.alt };
    T.newGame({ cls: o.cls, mode: o.mode, diff: o.diff, asc: o.asc || 0 });
    try {
      for (let step = 0; step < o.maxTurns * 4; step++) {
        S = T.S && screen(T.S);
        if (!S || S.dead || S.won || S.turn > o.maxTurns) break;
        if (o.stopAfter && S.depth > o.stopAfter) break; // watching one floor: stop when it's done
        if (o.delay && S.depth >= (o.slowFrom || 0)) await sleep(o.delay); // fast-forward to slowFrom, then watch speed
        else if (step % 200 === 0) await sleep(0); // let the page breathe, so DeepBot.status() can answer mid-batch

        // --- Pop-up screens ---
        if (!document.getElementById('boon').hidden) { // RULE: upgrade pick, by KNOBS.boonOrder
          const best = [...S.boonOffer].sort((a, b) => KNOBS.boonOrder.indexOf(a) - KNOBS.boonOrder.indexOf(b))[0];
          log('upgrade ' + best); T.takeBoon(S.boonOffer.indexOf(best)); continue;
        }
        if (!document.getElementById('shop').hidden) { shop(); continue; }

        if (S.depth !== lastDepth) { lastDepth = S.depth; floorStart = S.turn; restTurns = 0; shopVisits = 0; guardian = null; bumped.clear(); visited.clear(); bossBest = Infinity; cutThrough = false; lastFoe = null; snapshotFloor(); }
        visited.add(S.px + ',' + S.py);
        if (S.turn === lastTurn) { if (++stall > 40) { log('STALLED'); break; } } else { stall = 0; lastTurn = S.turn; }
        if (S.turn - floorStart - restTurns > 3000) { stuck = true; log('STUCK on this floor'); break; } // a bug in the bot (or a farm): stop and report it
        if (state.stop) break;

        const st = T.stats(), here = S.px + ',' + S.py;
        const foes = S.mons.filter(m => !m.ally && S.vis[m.y] && S.vis[m.y][m.x]);
        const adj = foes.filter(m => dist(m.x, m.y, S.px, S.py) === 1);
        const touching = foes.filter(m => Math.max(Math.abs(m.x - S.px), Math.abs(m.y - S.py)) === 1); // diagonals too (Cleave reaches them)
        const awake = foes.filter(m => m.awake);
        const pot = S.pack.findIndex(heal);

        // RULE 1: standing where a telegraphed attack will land? Step out.
        if (S.danger.has(here)) {
          const out = path((x, y) => !S.danger.has(x + ',' + y) && free(x, y));
          if (out) { await act(out.dx, out.dy, 'dodge'); continue; }
        }
        const vamp = o.cls === 'vampire', canDrink = pot >= 0 && !S.frenzy && !vamp; // Frenzy blocks potions; a Vampire's never heal
        const ready = S.cd === 0, holy = 6 + 2 * S.lv; // Holy Light's heal (Paladin)
        // RULE 2: hurt in a fight: drink (Paladin: Holy Light first, it saves a potion); no potions: teleport away.
        const drinkAt = o.cls === 'alch' ? .35 : KNOBS.drinkInFight; // A2: Alchemist potions heal 50% more, so drink a bit later
        if (adj.length && S.hp < st.max * drinkAt) {
          if (o.cls === 'paladin' && ready && await useAbility('holy light (heal)')) continue; // P1
          if (canDrink) { await use(pot, 'drink (fight)'); continue; }
        }
        const tele = packIdx('scroll', 'teleport'); // V3: a Vampire can't drink to heal, so it teleports when low
        if (adj.length && tele >= 0 && (vamp ? S.hp < st.max * .35 : S.hp < st.max * KNOBS.teleportAt && !canDrink)) { await use(tele, 'teleport away'); continue; }
        // RULE 3: poisoned or burning and low: drink (it cures them).
        if ((S.status.poison > 1 || S.status.burn > 1) && S.hp < st.max * .5 && pot >= 0 && !S.frenzy) { await use(pot, 'drink (cure)'); continue; }
        // RULE 3b: the special potions. Antidote when poisoned, burning or slowed for a while; Strength (double damage,
        // 10 turns) next to a boss or 3+ enemies; Haste (two moves for one, 16 turns) when a boss is awake.
        const odd = k => S.frenzy ? -1 : S.pack.findIndex(i => i.type === 'potion' && i.kind === k); // no potions at all during Frenzy
        if (odd('cure') >= 0 && (S.status.poison > 2 || S.status.burn > 2 || S.status.slow > 1)) { await use(odd('cure'), 'antidote'); continue; }
        if (odd('str') >= 0 && !S.str && (adj.some(m => m.boss) || touching.length >= 3)) { await use(odd('str'), 'strength potion'); continue; }
        if (odd('haste') >= 0 && !S.haste && foes.some(m => m.boss && m.awake)) { await use(odd('haste'), 'haste potion'); continue; }
        // RULE 4: wear better gear (free when no enemy is in sight).
        const up = S.pack.findIndex(it => it.type === 'gear' && it.mod !== 'cursed' && T.gearScore(it) > T.gearScore(S[it.kind]));
        if (up >= 0 && !adj.length) { await use(up, 'equip ' + S.pack[up].name); continue; }
        // RULE 5: swarmed or facing an awake boss: Frost (freeze them) or Fire.
        const bossUp = foes.some(m => m.boss && m.awake);
        if (awake.length >= KNOBS.fireScrollFoes || bossUp) {
          const fr = packIdx('scroll', 'frost'), fi = packIdx('scroll', 'fire');
          if (adj.length && S.hp < st.max * .6 && fr >= 0) { await use(fr, 'frost scroll'); continue; }
          if (fi >= 0) { await use(fi, 'fire scroll'); continue; }
        }
        // RULE 6: the class's ability (classMove, below the turn loop).
        if (ready && await classMove({ st, foes, adj, touching, awake, pot })) continue;
        // Rogue R2: invisible and badly hurt: slip away (to the stairs if you know them) instead of fighting.
        if (o.cls === 'rogue' && S.invis && S.hp < st.max * .3 && foes.length) {
          let away = S.stairs && !S.stairsLocked ? path((x, y) => x === S.sx && y === S.sy) : null;
          if (!away) {
            const gap = (x, y) => Math.min(...foes.map(m => dist(m.x, m.y, x, y)));
            const far = DIRS.filter(([dx, dy]) => free(S.px + dx, S.py + dy)).map(([dx, dy]) => ({ dx, dy, d: gap(S.px + dx, S.py + dy) })).sort((a, b) => b.d - a.d)[0];
            if (far && far.d > gap(S.px, S.py)) away = far;
          }
          if (away) { await act(away.dx, away.dy, 'slip away'); continue; }
        }
        // RULE 7a: an arena boss in sight (not the Golem, whose slam you must dodge): push toward it, and only hit
        // the minions standing in the way. Fighting minions forever gets you nowhere: the boss makes more.
        // (Out of sight in a sealed arena, e.g. for a Mole's short sight: head for where it was last seen.)
        const arenaBoss = foes.find(m => m.arena && m.awake)
          || (S.arena && S.stairsLocked && guardian && guardian.name !== 'Stone Golem' ? { ...guardian, arena: true, hp: bossBest, seen: false } : null);
        if (arenaBoss && dist(arenaBoss.x, arenaBoss.y, S.px, S.py) > 1) {
          // Go around its minions if that's not much longer (it raises new ones behind the line you're cutting through);
          // cut through them only when there's no real way around.
          const atBoss = arenaBoss.seen === false ? (x, y) => dist(x, y, arenaBoss.x, arenaBoss.y) <= 1 : (x, y) => x === arenaBoss.x && y === arenaBoss.y;
          allowMons = true; const through = path(atBoss); allowMons = false;
          if (arenaBoss.hp < bossBest) { bossBest = arenaBoss.hp; bossSince = S.turn; }
          else if (S.turn - bossSince > 150) { cutThrough = !cutThrough; bossSince = S.turn; log(cutThrough ? 'switch: cut through' : 'switch: go around'); }
          const around = cutThrough ? null : path(atBoss), to = around && (!through || around.steps <= through.steps + 8) ? around : through;
          if (to) { const m = monAt(S.px + to.dx, S.py + to.dy); await act(to.dx, to.dy, m ? 'clear the way: ' + m.name : 'push toward ' + arenaBoss.name); waited = 0; continue; }
        }
        // RULE 7: hit the enemy next to you: a boss first (its minions keep coming back), else the weakest.
        if (adj.length) { const m = adj.find(m => m.boss) || adj.sort((a, b) => a.hp - b.hp)[0]; await act(m.x - S.px, m.y - S.py, 'attack ' + m.name + ' (' + m.hp + 'hp)'); waited = 0; continue; }
        // RULE 8: several awake enemies coming and you're in the open: back into a corridor first.
        const coming = awake.filter(m => !m.ranged && !m.boss && dist(m.x, m.y, S.px, S.py) <= 6);
        const patient = S.turn >= patientFrom && !S.invis; // after a wait that came to nothing, stop waiting for a while (and never while invisible)
        if (patient && S.turn - backedAt > 12 && coming.length >= 2 && openness(S.px, S.py) >= 3) { // not again right after (no back-and-forth)
          const back = DIRS.map(([dx, dy]) => [dx, dy]).filter(([dx, dy]) => walkable(S.px + dx, S.py + dy) && free(S.px + dx, S.py + dy) && openness(S.px + dx, S.py + dy) <= 2
            && coming.every(m => dist(m.x, m.y, S.px + dx, S.py + dy) >= 2));
          if (back.length) { backedAt = S.turn; await act(back[0][0], back[0][1], 'back into corridor'); continue; }
        }
        // RULE 9: first-hit timing. You always move before the monsters, so count the steps to the nearest awake enemy
        // (not an archer): an even number (2, 4...) means wait, and it walks into reach on its own turn; an odd number
        // (3, 5...) means step in, which leaves an even gap. Either way you hit first.
        const archer = awake.find(m => m.ranged);
        if (patient && !archer && coming.length) {
          allowMons = true; const near = path((x, y) => coming.some(m => m.x === x && m.y === y)); allowMons = false;
          const gap = near ? near.steps : 99;
          if (gap <= KNOBS.timingRange && gap % 2 === 0) {
            waited = gap < lastGap ? 0 : waited + 1; lastGap = gap; // it's coming closer: keep waiting
            if (waited < KNOBS.waitTurns) { await act(0, 0, 'wait (' + gap + ' steps from ' + coming[0].name + ')'); continue; }
            patientFrom = S.turn + 15; // it didn't come (something blocks it, or it wanders): go to it
          }
        }
        waited = 0; lastGap = 99;
        // RULE 10: patch up between fights (only when no potion is wasted).
        if (!foes.length && o.cls === 'paladin' && ready && st.max - S.hp >= holy && await useAbility('holy light (patch up)')) continue; // P1
        if (!foes.length && canDrink && S.hp < st.max * KNOBS.drinkCalm && st.max - S.hp >= T.healAmt()) { await use(pot, 'drink (calm)'); continue; }
        // V1: a Vampire's potions raise max HP (up to a cap), so drink them whenever it's quiet.
        if (vamp && !foes.length && pot >= 0 && (S.blood || 0) < T.VAMP.potCap) { await use(pot, 'drink (more max HP)'); continue; }
        // RULE 11: read a Mapping scroll on arrival, from floor KNOBS.mapFrom down (it also shows cracked walls: rule 12b).
        if (S.depth >= KNOBS.mapFrom && S.turn - floorStart < 3 && packIdx('scroll', 'mapping') >= 0 && !foes.length) { await use(packIdx('scroll', 'mapping'), 'mapping scroll'); continue; }

        // --- Moving ---
        const tooLong = S.turn - floorStart > KNOBS.floorTurnLimit;
        let mv = null, why = '', goal = null; // goal: where it's heading, for the Mole's dig shortcuts
        const want = e => dropped.has(e.it) ? false : e.it.type === 'potion' || e.it.type === 'scroll' || e.it.type === 'chest' || e.it.type === 'rune' || e.it.type === 'gold'
          || (e.it.type === 'gear' && (T.gearScore(e.it) > T.gearScore(S[e.it.kind]) || S.pack.length < T.PACK - 2));
        const g = S.mons.find(m => m.golem || m.arena); if (g) guardian = { x: g.x, y: g.y, name: g.name };
        const boss = S.stairsLocked && guardian; // where you last saw it
        // RULE 12: go hit enemies you can see (archers first).
        const bossInSight = foes.find(m => m.boss && m.awake);
        if (bossInSight) { mv = path((x, y) => x === bossInSight.x && y === bossInSight.y); why = 'go for ' + bossInSight.name; }
        if (!mv && archer) { mv = path((x, y) => x === archer.x && y === archer.y); why = 'charge archer'; }
        if (!mv && foes.length) {
          mv = path((x, y) => foes.some(m => m.x === x && m.y === y)); why = 'go fight';
          // Remember where it was, to follow it a few steps if it slips out of view; but only once per 30 turns per
          // monster, so an enemy that keeps popping in and out of view (across water, say) can't lead it in circles.
          const m = foes[0];
          if (mv && !(chased.get(m) > S.turn - 30)) lastFoe = { x: m.x, y: m.y, turn: S.turn, m };
        }
        // ...and if it just stepped out of view, keep going to where you last saw it for a few turns (no flip-flopping).
        if (!mv && !foes.length && lastFoe && S.turn - lastFoe.turn <= 8 && !(S.px === lastFoe.x && S.py === lastFoe.y)) {
          mv = path((x, y) => x === lastFoe.x && y === lastFoe.y); why = 'after the enemy I saw';
          if (lastFoe.m && !chased.has(lastFoe.m)) chased.set(lastFoe.m, S.turn); else if (lastFoe.m) chased.set(lastFoe.m, Math.max(chased.get(lastFoe.m), lastFoe.turn));
        }
        if (lastFoe && S.px === lastFoe.x && S.py === lastFoe.y) lastFoe = null;
        // RULE 12b: a cracked wall (hidden room) you've seen: break in first. Monsters on the way get fought (rule 7).
        if (!mv) { mv = path((x, y) => S.secret.has(x + ',' + y) && S.seen[y][x]); why = 'break into hidden room'; }
        // RULE 12c: the merchant, as soon as you've seen it: sell junk and shop (see "At a merchant").
        const junk = S.pack.some(it => it.type === 'gear' && T.gearScore(it) <= T.gearScore(S[it.kind]));
        if (!mv && S.shop && shopVisits === 0 && S.seen[S.shop.y][S.shop.x]) { mv = path((x, y) => shopAt(x, y)); why = 'go to shop'; }
        // RULE 13a: pack full and better gear than you wear is lying nearby: drop your least valuable gear, then take it
        // (rule 4 puts it on).
        const full = S.pack.length >= T.PACK + (S.relic === 'mule' ? 5 : 0) + (S.packX || 0);
        if (!mv && full && !tooLong) {
          const better = path((x, y) => { const e = itemAt(x, y); return e && S.seen[y][x] && e.it.type === 'gear' && e.it.mod !== 'cursed' && !dropped.has(e.it) && T.gearScore(e.it) > T.gearScore(S[e.it.kind]); });
          const gi = S.pack.map((it, i) => [it, i]).filter(([it]) => it.type === 'gear').sort((a, b) => T.gearScore(a[0]) - T.gearScore(b[0]))[0];
          if (better && better.steps <= KNOBS.itemDetour && gi) {
            // Drop the worst piece wherever you stand (dropping needs an empty tile: if something lies here, step to
            // the nearest empty tile first), then the pack has room and rule 13 picks the better gear up.
            if (!itemAt(S.px, S.py)) { dropped.add(gi[0]); log('drop ' + gi[0].name + ' to make room'); T.dropItem(gi[1]); continue; }
            mv = path((x, y) => free(x, y) && !itemAt(x, y)); why = 'find an empty tile to drop gear on';
          }
        }
        // RULE 13: pick up useful things nearby.
        if (!mv && !tooLong) { mv = path((x, y) => { const e = itemAt(x, y); return e && S.seen[y][x] && want(e) && T.canAdd(e.it); }); if (mv && mv.steps > KNOBS.itemDetour) mv = null; why = 'get item'; }
        // RULE 14: explore what you haven't seen yet.
        if (!mv && !tooLong) { goal = (x, y) => !S.seen[y][x]; mv = path(goal); why = 'explore'; if (!mv) goal = null; }
        // RULE 15: one more merchant visit before leaving the floor: sell the last junk, and the full heal if it's worth it.
        if (!mv && S.shop && shopVisits === 1 && S.seen[S.shop.y][S.shop.x] && (junk || S.hp < st.max)) { mv = path((x, y) => shopAt(x, y)); why = 'last shop visit'; }
        // RULE 15b: with Regeneration, rest to full before the next fight with the guardian or the next floor.
        // Nothing is in sight; resting costs nothing but turns.
        if (!mv && !foes.length && (S.bn && S.bn.regen) && (vamp ? (S.ward || 0) < T.wardMax() : S.hp < st.max) && (boss || (S.stairs && !S.stairsLocked))) { restTurns++; restAll++; await act(0, 0, 'rest'); continue; }
        // RULE 16: the stairs are locked: go fight their guardian.
        if (!mv && boss) { mv = path((x, y) => x === boss.x && y === boss.y); why = 'fight ' + boss.name; }
        // Necromancer N2: before going down to a boss floor, raise a full pair of thralls (they follow you down).
        const nextIsBoss = o.mode === 'endless' && (S.depth + 1) % 10 === 0;
        if (!mv && o.cls === 'necro' && nextIsBoss && S.mons.filter(m => m.ally).length < 2) {
          const c = S.corpses.find(c => S.seen[c.y][c.x] && free(c.x, c.y));
          if (c && S.vis[c.y][c.x] && !ready) { await act(0, 0, 'wait to raise a thrall'); continue; }
          if (c && !S.vis[c.y][c.x]) { mv = path((x, y) => x === c.x && y === c.y); why = 'go raise a thrall'; }
        }
        // RULE 17: take the stairs.
        // (Standing on the stairs when they unlock, e.g. after resting there: step off, then back on.)
        if (!mv && S.stairs && !S.stairsLocked && S.px === S.sx && S.py === S.sy) { const off = DIRS.find(([dx, dy]) => free(S.px + dx, S.py + dy)); if (off) { mv = { dx: off[0], dy: off[1] }; why = 'step off the stairs to use them'; } }
        if (!mv && S.stairs && !S.stairsLocked && S.seen[S.sy][S.sx]) { goal = (x, y) => x === S.sx && y === S.sy; mv = path(goal); why = 'stairs'; }
        if (!mv && tooLong) { mv = path((x, y) => !S.seen[y][x]); why = 'explore (late)'; }
        // RULE 18: the stairs are locked and you haven't found their guardian: walk to the stairs, else go and look
        // in places you've seen from afar but not been to (a boss waits out of sight in its arena).
        if (!mv && S.stairsLocked && S.stairs) { mv = path((x, y) => x === S.sx && y === S.sy); why = 'to the locked stairs'; }
        if (!mv && S.stairsLocked) { mv = path((x, y) => S.seen[y][x] && S.map[y][x] !== '#' && !visited.has(x + ',' + y) && !(S.vis[y] && S.vis[y][x])); why = 'look around'; }
        // Last resort (counted as a "peek", so it shows in the results): reveal the map like the old bot did.
        if (!mv && S.stairs && !S.stairsLocked) { if (!peeks && o.debug) o.debug.firstPeek = { trail: trail.slice(-8), map: mapText(S), stairsSeen: S.seen[S.sy][S.sx], at: [S.px, S.py], stairs: [S.sx, S.sy] }; peeks++; S.seen = S.seen.map(r => r.map(() => true)); mv = path((x, y) => x === S.sx && y === S.sy); why = 'PEEK at stairs'; }
        // Mole Mo1: dig through a wall when that's a much shorter way to where it's going.
        if (o.cls === 'mole' && ready && mv && goal && await digShortcut(mv, goal)) continue;
        if (mv) await act(mv.dx, mv.dy, why);
        else await act(0, 0, `nothing to do (stairs ${S.sx},${S.sy} ${S.stairs ? 'seen' : 'unseen'}${S.stairsLocked ? ' locked' : ''}, danger ${S.danger.size}, bumped ${bumped.has(S.sx + ',' + S.sy)})`);
      }

      // At a merchant, in this order: sell junk, sharpen, potions, a Teleport scroll, gear (only if clearly better),
      // other scrolls, the full heal (only if it's better value than a potion), then temper/reinforce with what's left.
      function shop() {
        shopVisits++;
        const st = T.stats();
        T.sellJunk();
        // Buys the first thing in stock that passes test; says whether it worked (a full pack refuses).
        const buyFirst = (test, what, keep = 0) => { const i = S.shop.stock.findIndex(test); if (i < 0 || S.gold - S.shop.stock[i].price < keep) return false; const g = S.gold; T.buy(i); if (S.gold === g) return false; log('buy ' + what); return true; };
        const price = test => (S.shop.stock.find(test) || {}).price;
        const potPrice = price(s => s.it && heal(s.it)) || 14 + 4 * S.depth, healPrice = price(s => s.svc === 'heal') || 0;
        buyFirst(s => s.svc === 'sharpen', 'sharpen');
        // (A Vampire's potions only add max HP up to a cap, so it stops buying once its pack would reach the cap.)
        while ((o.cls !== 'vampire' || (S.blood || 0) + T.VAMP.pot * potions() < T.VAMP.potCap) && buyFirst(s => s.it && heal(s.it), 'potion'));
        buyFirst(s => s.it && s.it.type === 'scroll' && s.it.kind === 'teleport', 'teleport scroll');
        while (buyFirst(s => s.it && s.it.type === 'gear' && s.it.mod !== 'cursed' && T.gearScore(s.it) >= T.gearScore(S[s.it.kind]) + KNOBS.gearBuyBy && !S.pack.some(p => p.kind === s.it.kind && T.gearScore(p) >= T.gearScore(s.it)), 'gear')); // worn right after (rule 4)
        buyFirst(s => s.it && s.it.type === 'scroll', 'scroll');
        if (o.cls === 'vampire') { if ((S.ward || 0) < T.wardMax() / 2) buyFirst(s => s.svc === 'heal', 'ward refill'); } // V4
        else if (healPrice && (st.max - S.hp) / healPrice >= T.healAmt() / potPrice) buyFirst(s => s.svc === 'heal', 'full heal');
        // Spare gold: temper or reinforce (they never sell out; the price doubles each time), keeping a reserve for
        // the next few merchants. The bigger pack isn't worth it for this bot: potions and scrolls stack.
        const reserve = KNOBS.goldReserve * (healPrice + 2 * potPrice);
        while (buyFirst(s => s.svc === KNOBS.smith, KNOBS.smith, reserve));
        T.closeShop();
      }
    } finally {
      Math.random = realRandom;
      const p = JSON.parse(profBefore); for (const k of Object.keys(T.PROF)) delete T.PROF[k]; Object.assign(T.PROF, p);
    }
    S = T.S;
    snapshotFloor();
    // The killer's name as the game records it in the run history (e.g. "troll", "the Lich"); by = the last bad message.
    let killer = null; try { if (S.dead) killer = (JSON.parse(localStorage.getItem('amber-depths-history') || '[]')[0] || {}).by || null; } catch (e) {}
    if (killer) killer = killer.replace(/^(the|an?) /i, '');
    const death = S.dead || stuck || stall > 40 ? { killer, by: (S.log.find(l => l.cls === 'bad') || {}).t, map: mapText(S), last: trail.slice(-25) } : null;
    return { seed: o.seed, cls: o.cls, mode: o.mode, diff: o.diff, depth: S.depth, dead: S.dead, won: S.won, turns: S.turn, lv: S.lv, kills: S.kills, peeks, rest: restAll, stalled: stall > 40, stuck, floors, death, ...(o.frames ? { frames } : {}) };
  }

  // The map as text: what the player had seen, with monsters in sight and @ for the player.
  function mapText(S) {
    const rows = [];
    for (let y = 0; y < S.map.length; y++) {
      let r = '';
      for (let x = 0; x < S.map[y].length; x++) {
        const m = S.mons.find(m => m.x === x && m.y === y && S.vis[y][x]);
        const e = S.items.find(e => e.x === x && e.y === y && S.seen[y][x]);
        r += x === S.px && y === S.py ? '@' : m ? m.ch : e ? e.it.ch : S.seen[y][x] ? S.map[y][x] : ' ';
      }
      rows.push(r.replace(/\s+$/, ''));
    }
    return rows.join('\n');
  }

  // Play many seeds in the background; results collect in DeepBot.results (check DeepBot.status()).
  const state = { results: [], running: false, total: 0, stop: false };
  function batch(opts) {
    const { seeds = [1, 2, 3, 4, 5], ...rest } = opts || {};
    state.results = []; state.running = true; state.total = seeds.length; state.stop = false;
    (async () => { for (const seed of seeds) { if (state.stop) break; state.results.push(await play({ ...rest, seed })); } state.running = false; })();
    return 'started ' + seeds.length + ' runs';
  }
  const status = () => ({ done: state.results.length, of: state.total, running: state.running,
    depths: state.results.map(r => r.depth + (r.stuck ? ' stuck' : r.stalled ? ' stalled' : r.dead ? '' : ' alive')), avg: +(state.results.reduce((a, r) => a + r.depth, 0) / (state.results.length || 1)).toFixed(1) });
  // Replay one seed slowly so you can watch it (same seed = same game).
  const watch = (seed, delay = 120, opts) => play({ ...opts, seed, delay });

  const stop = () => { state.stop = true; return 'stopping after this turn'; };
  window.DeepBot = { KNOBS, play, batch, status, watch, stop, get results() { return state.results; } };
})();
