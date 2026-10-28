// In-page bot + invariant checker. Returns a result object per game.
window.__runGame = async (cls, mode, diff, maxTurns, relic, asc, alt) => {
  const T = window.__T;
  const issues = [];
  const note = (k, d) => { if (issues.length < 25) issues.push(k + (d ? ': ' + d : '')); };
  T.sel.relic = relic || null;
  T.sel.alt = { [cls]: !!alt };
  T.newGame({ cls, mode, diff, asc: asc || 0 });
  if (relic && T.S.relic !== relic) note('relic not applied', relic);
  let S = T.S;
  const trail = [];
  let lastTurn = -1, stall = 0, floorTurns = 0, lastDepth = 1, saveTests = 0, forced = 0;
  const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];
  const W = T.W, H = T.H;
  const bfs = (goal) => { // returns first step [dx,dy] toward nearest tile satisfying goal(x,y)
    const prev = new Map(); const q = [[S.px, S.py]]; prev.set(S.px + ',' + S.py, null);
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      if (i > 0 && goal(x, y)) { let k = x + ',' + y, step = [x, y]; while (prev.get(k) && prev.get(k).join(',') !== S.px + ',' + S.py) { step = prev.get(k); k = step.join(','); } return [step[0] - S.px, step[1] - S.py, i]; }
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (prev.has(k) || nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const wall = S.map[ny][nx] === '#' && !S.secret.has(k);
        if (wall) continue;
        if (!S.seen[ny][nx] && !goal(nx, ny)) continue;
        const m = T.monAt(nx, ny); if (m && !m.ally && !goal(nx, ny)) continue;
        if (T.shopAt(nx, ny) && !goal(nx, ny)) continue;
        if (S.danger.has(k) && !goal(nx, ny)) continue;
        if (S.traps.some(t => t.seen && t.x === nx && t.y === ny) && !goal(nx, ny)) continue;
        prev.set(k, [x, y]); q.push([nx, ny]);
      }
    }
    return null;
  };
  const checkInvariants = () => {
    const st = T.stats();
    if (!Number.isFinite(S.hp) || !Number.isFinite(S.gold) || !Number.isFinite(S.xp)) note('NaN stat', JSON.stringify({ hp: S.hp, gold: S.gold, xp: S.xp }));
    if (S.hp > st.max) note('hp>max', S.hp + '/' + st.max);
    if (S.gold < 0) note('negative gold', S.gold);
    if (S.pack.length > T.PACK) note('pack overflow', S.pack.length);
    if (S.map[S.py][S.px] === '#') note('player in wall', S.depth);
    const seenPos = new Set();
    for (const m of S.mons) {
      const k = m.x + ',' + m.y;
      if (seenPos.has(k)) note('monsters stacked', m.name + ' @' + k + ' floor ' + S.depth);
      seenPos.add(k);
      if (m.x === S.px && m.y === S.py) note('monster on player', m.name);
      if (S.map[m.y] === undefined || S.map[m.y][m.x] === '#') note('monster in wall', m.name);
      if (!Number.isFinite(m.hp)) note('monster NaN hp', m.name);
      if (m.hp <= 0) note('dead monster lingering', m.name + ' ' + m.hp);
    }
    for (const e of S.items) { if (S.map[e.y][e.x] === '#') note('item in wall', e.it.type); if (T.shopAt(e.x, e.y)) note('item under merchant', e.it.type); }
    for (const it of S.pack) if ((it.n || 1) < 1) note('empty stack', it.type);
  };
  const stairsReachable = () => {
    if (!S.stairs) return true;
    const seen = new Set([S.px + ',' + S.py]), q = [[S.px, S.py]];
    for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; if (x === S.sx && y === S.sy) return true;
      for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        if ((S.map[ny][nx] === '#' && !S.secret.has(k)) || T.shopAt(nx, ny)) continue; seen.add(k); q.push([nx, ny]); } }
    return false;
  };
  for (let step = 0; step < maxTurns * 3; step++) {
    S = T.S;
    if (!S || S.dead || S.won) break;
    if (!document.getElementById('shop').hidden) {
      const pi = S.shop.stock.findIndex(x => x.it && x.it.type === 'potion');
      if (pi >= 0 && S.gold >= S.shop.stock[pi].price) T.buy(pi);
      const wi = S.shop.stock.findIndex(x => x.svc === 'sharpen');
      if (wi >= 0 && S.gold >= S.shop.stock[wi].price) T.buy(wi);
      T.closeShop(); S.shopDone = S.depth;
    }
    if (S.depth !== lastDepth) {
      lastDepth = S.depth; floorTurns = 0;
      if (!stairsReachable()) note('stairs unreachable', `${mode} floor ${S.depth} theme ${S.theme}`);
    }
    if (S.turn === lastTurn) { if (++stall > 40) { note('stalled (no turn progress)', `floor ${S.depth} last=${trail.slice(-3).join(' / ')} log=${S.log.slice(0, 2).map(l => l.t).join(' | ')}`); break; } } else { stall = 0; lastTurn = S.turn; floorTurns++; }
    if (S.turn > maxTurns) break;
    if (floorTurns > 350) { forced++; floorTurns = 0; S.stairsLocked = false; T.descend(); continue; }
    if (step % 97 === 50 && saveTests < 4) {
      saveTests++;
      const before = JSON.stringify({ d: S.depth, hp: S.hp, g: S.gold, p: S.pack.length, m: S.mons.length, px: S.px, py: S.py, lv: S.lv, t: S.traps.length, sec: S.secret.size });
      T.saveGame(); T.loadGame(); S = T.S;
      const after = JSON.stringify({ d: S.depth, hp: S.hp, g: S.gold, p: S.pack.length, m: S.mons.length, px: S.px, py: S.py, lv: S.lv, t: S.traps.length, sec: S.secret.size });
      if (before !== after) note('save/load mismatch', before + ' vs ' + after);
    }
    checkInvariants();
    const st = T.stats();
    const hostiles = S.mons.filter(m => !m.ally && S.vis[m.y] && S.vis[m.y][m.x]);
    const adj = hostiles.filter(m => Math.abs(m.x - S.px) + Math.abs(m.y - S.py) === 1);
    const pIdx = S.pack.findIndex(i => i.type === 'potion');
    // 1. dodge telegraphed attacks
    if (S.danger.has(S.px + ',' + S.py)) {
      const out = bfs((x, y) => !S.danger.has(x + ',' + y) && T.free(x, y));
      if (out) { await T.act(out[0], out[1]); continue; }
    }
    // 2. heal
    if ((S.hp < st.max * .4 || (S.status.poison > 2 && S.hp < st.max * .6)) && pIdx >= 0 && !S.frenzy) { await T.useItem(pIdx); continue; }
    // 3. upgrades
    const up = S.pack.findIndex(it => it.type === 'gear' && T.gearScore(it) > T.gearScore(S[it.kind]));
    if (up >= 0) { trail.push('equip'); await T.useItem(up); continue; }
    // 4. ability
    if (S.cd === 0) {
      const use = { warrior: adj.length >= 1, rogue: adj.length >= 2 || (hostiles.some(m => m.boss) && Math.random() < .3), mage: hostiles.length > 0, necro: S.corpses.some(c => S.vis[c.y][c.x]),
        trapper: hostiles.length > 0 && !adj.length, alch: hostiles.length > 0 && S.pack.filter(i => i.type === 'potion').reduce((a, i) => a + (i.n || 1), 0) >= 2,
        ranger: hostiles.some(m => (m.x === S.px || m.y === S.py) && Math.abs(m.x - S.px) + Math.abs(m.y - S.py) <= 8 && T.clear(S.px, S.py, m.x, m.y)),
        berserker: adj.length > 0, paladin: S.hp < st.max * .7 || hostiles.some(m => ['skeleton','wraith','ghoul'].includes(m.name)), gambler: hostiles.length > 0 && S.gold > 60 }[S.cls];
      if (use) {
        const t0 = S.turn; trail.push('ability'); await T.ability();
        if (T.S.aiming) { const m = hostiles.find(m => (m.x === S.px || m.y === S.py) && Math.abs(m.x - S.px) + Math.abs(m.y - S.py) <= 8); if (m) await T.act(Math.sign(m.x - S.px), Math.sign(m.y - S.py)); else await T.act(0, 0); }
        if (T.S.turn !== t0) continue;
      }
    }
    // 5. scrolls when fighting bosses or swarmed
    const sIdx = S.pack.findIndex(i => i.type === 'scroll' && (i.kind === 'fire' || i.kind === 'frost'));
    if (sIdx >= 0 && (hostiles.length >= 3 || hostiles.some(m => m.boss && m.awake))) { await T.useItem(sIdx); continue; }
    // 6. attack adjacent
    if (adj.length) { const m = adj.sort((a, b) => a.hp - b.hp)[0]; trail.push('attack ' + m.name); await T.act(m.x - S.px, m.y - S.py); continue; }
    // 7. move: items > enemies > stairs/golem > explore
    let mv = null;
    const golem = S.stairsLocked && S.mons.find(m => m.golem);
    mv = bfs((x, y) => { const e = T.itemAt(x, y); return e && S.seen[y][x] && (e.it.type !== 'gear' || T.gearScore(e.it) > T.gearScore(S[e.it.kind]) || S.pack.length < T.PACK - 2); });
    if (mv && mv[2] > 60) mv = null;
    if (!mv && hostiles.length) mv = bfs((x, y) => hostiles.some(m => m.x === x && m.y === y));
    if (!mv && S.shop && S.shopDone !== S.depth && S.seen[S.shop.y][S.shop.x]) mv = bfs((x, y) => x === S.shop.x && y === S.shop.y);
    if (!mv && golem) mv = bfs((x, y) => x === golem.x && y === golem.y);
    if (!mv && S.stairs && !S.stairsLocked && S.seen[S.sy][S.sx]) mv = bfs((x, y) => x === S.sx && y === S.sy);
    if (!mv) mv = bfs((x, y) => !S.seen[y][x]);
    if (!mv && S.stairs && !S.stairsLocked) { S.seen = S.seen.map(r => r.map(() => true)); mv = bfs((x, y) => x === S.sx && y === S.sy); }
    trail.push(mv ? `move ${mv[0]},${mv[1]} to ${S.px + mv[0]},${S.py + mv[1]} tile=${S.map[S.py + mv[1]][S.px + mv[0]]}` : 'wait');
    if (mv) await T.act(mv[0], mv[1]);
    else await T.act(0, 0);
  }
  S = T.S;
  return { cls, mode, diff, asc, alt, hollow: !!S.hollowOpen, trueEnd: !!S.trueEnd, depth: S.depth, won: S.won, dead: S.dead, lv: S.lv, turns: S.turn, kills: S.kills, gold: S.gold, by: S.dead ? (S.log.find(l => l.cls === 'bad') || {}).t : null, forced, issues };
};
