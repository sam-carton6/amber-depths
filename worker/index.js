// Amber Depths server: cloud saves (sync codes) and leaderboards, stored in D1 (DB).
// Only /api/* reaches this code; every other request is a static file from app/ (ASSETS).
//
// A player is a sync code like WOLF-7Q3K-M2XD. The code is the only key: the server keeps a hash of it, never the
// code itself, so the database alone can't be used to take over a save. The game sends it in the X-Sync-Code header.
//
// Saves: the game uploads its whole localStorage as a backup code (the same format as the Backup button). Each
// upload names the version it was based on (`base`); if another device uploaded since, the server refuses (409) and
// the game downloads the newer save instead.
//
// Scores: one row per player, board and key (e.g. daily / 2026-11-06), keeping the best value. Boards:
//   daily   key = date          val = score    (info: cls, depth, won)
//   endless key = difficulty    val = deepest floor
//   best    key = mode          val = score    (short / standard)
// Daily streaks and wins are worked out from the daily rows.
//
// Safety net: the last KEEP uploads of each player's save stay in `saves`, so a damaged save (a bug in a test version,
// a wrong restore) can be undone from the game's Save & sync sheet.
// The test copy (test.amberdepths.com, env TEST_COPY) shares this database but ignores scores.

const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
const MAX_SAVE = 1_000_000; // characters; a big save is ~60k
const KEEP = 10; // earlier saves kept per player
const JOINS_PER_DAY = 20; // new sync codes per network address per day

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, created INTEGER NOT NULL,
     save TEXT, save_t INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS scores (id TEXT NOT NULL, board TEXT NOT NULL, k TEXT NOT NULL, val INTEGER NOT NULL,
     info TEXT, t INTEGER NOT NULL, PRIMARY KEY (id, board, k))`,
  `CREATE INDEX IF NOT EXISTS scores_board ON scores (board, k, val DESC)`,
  `CREATE TABLE IF NOT EXISTS saves (id TEXT NOT NULL, t INTEGER NOT NULL, save TEXT NOT NULL, PRIMARY KEY (id, t))`,
  `CREATE TABLE IF NOT EXISTS joins (ip TEXT NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (ip, day))`,
];
let ready = null; // tables are created once per Worker instance
const setup = env => ready ??= env.DB.batch(SCHEMA.map(s => env.DB.prepare(s))).catch(e => { ready = null; throw e; });

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const fail = (status, error) => json({ error }, status);

async function hash(code) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function newCode() {
  const r = crypto.getRandomValues(new Uint8Array(12));
  const s = [...r].map(x => ALPHA[x % ALPHA.length]).join('');
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}
// Names: 1-16 visible characters, no line breaks or control characters.
const cleanName = n => String(n || '').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);

async function player(req, env) {
  const code = normCode(req.headers.get('x-sync-code'));
  if (code.length !== 12) return null;
  const id = await hash(code);
  const row = await env.DB.prepare('SELECT id, name, save_t FROM players WHERE id = ?').bind(id).first();
  return row;
}

async function body(req) {
  try { return await req.json(); } catch (e) { return null; }
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const BOARDS = {
  daily: k => DAY.test(k),
  endless: k => ['easy', 'normal', 'hard', 'nightmare'].includes(k),
  best: k => ['short', 'standard'].includes(k),
};

// Daily streak (days in a row ending today or yesterday, by the player's dates) and total wins, per player.
function streaks(rows, today) {
  const by = new Map();
  for (const r of rows) {
    const p = by.get(r.id) || { name: r.name, days: new Set(), wins: 0, played: 0 };
    p.days.add(r.k); p.played++; if (r.won) p.wins++;
    by.set(r.id, p);
  }
  const step = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const out = [];
  for (const p of by.values()) {
    let d = p.days.has(today) ? today : step(today, -1), streak = 0;
    while (p.days.has(d)) { streak++; d = step(d, -1); }
    out.push({ name: p.name, streak, wins: p.wins, played: p.played });
  }
  return out.sort((a, b) => b.streak - a.streak || b.wins - a.wins || b.played - a.played).slice(0, 50);
}

async function route(req, env, url) {
  await setup(env);
  const path = url.pathname, m = req.method;

  if (path === '/api/join' && m === 'POST') {
    const b = await body(req), name = cleanName(b && b.name);
    if (!name) return fail(400, 'Pick a name first.');
    const ip = req.headers.get('cf-connecting-ip') || 'local', day = new Date().toISOString().slice(0, 10);
    const j = await env.DB.prepare('INSERT INTO joins (ip, day, n) VALUES (?, ?, 1) ON CONFLICT (ip, day) DO UPDATE SET n = n + 1 RETURNING n').bind(ip, day).first();
    if (j.n > JOINS_PER_DAY) return fail(429, 'Too many new sync codes today. Try again tomorrow.');
    const code = newCode();
    await env.DB.prepare('INSERT INTO players (id, name, created) VALUES (?, ?, ?)').bind(await hash(normCode(code)), name, Date.now()).run();
    return json({ code, name, t: 0 });
  }

  if (path === '/api/board' && m === 'GET') {
    const board = url.searchParams.get('b'), k = url.searchParams.get('k') || '';
    if (board === 'streak') {
      if (!DAY.test(k)) return fail(400, 'Bad day.');
      const { results } = await env.DB.prepare(`SELECT s.id, s.k, json_extract(s.info, '$.won') AS won, p.name FROM scores s
        JOIN players p ON p.id = s.id WHERE s.board = 'daily'`).all();
      return json({ rows: streaks(results, k) });
    }
    if (!BOARDS[board] || !BOARDS[board](k)) return fail(400, 'Unknown board.');
    const { results } = await env.DB.prepare(`SELECT p.name, s.val, s.info FROM scores s JOIN players p ON p.id = s.id
      WHERE s.board = ? AND s.k = ? ORDER BY s.val DESC, s.t ASC LIMIT 50`).bind(board, k).all();
    return json({ rows: results.map(r => ({ name: r.name, val: r.val, ...JSON.parse(r.info || '{}') })) });
  }

  // Everything below needs a sync code.
  const me = await player(req, env);
  if (!me) return fail(401, 'That sync code isn\'t known. Check it and try again.');

  if (path === '/api/me' && m === 'GET') return json({ name: me.name, t: me.save_t });

  if (path === '/api/name' && m === 'POST') {
    const b = await body(req), name = cleanName(b && b.name);
    if (!name) return fail(400, 'Pick a name first.');
    await env.DB.prepare('UPDATE players SET name = ? WHERE id = ?').bind(name, me.id).run();
    return json({ name });
  }

  if (path === '/api/save' && m === 'GET') {
    const row = await env.DB.prepare('SELECT save, save_t FROM players WHERE id = ?').bind(me.id).first();
    return json({ t: row.save_t, data: row.save });
  }

  if (path === '/api/save' && m === 'PUT') {
    const b = await body(req);
    if (!b || typeof b.data !== 'string' || !/^AD1z?:/.test(b.data) || b.data.length > MAX_SAVE) return fail(400, 'That save can\'t be stored.');
    const t = Math.max(Date.now(), me.save_t + 1);
    // Only replace the save this device last saw; otherwise another device got there first.
    const r = await env.DB.prepare('UPDATE players SET save = ?, save_t = ? WHERE id = ? AND save_t = ?').bind(b.data, t, me.id, +b.base || 0).run();
    if (!r.meta.changes) return json({ error: 'newer', t: me.save_t }, 409);
    await env.DB.batch([
      env.DB.prepare('INSERT INTO saves (id, t, save) VALUES (?, ?, ?)').bind(me.id, t, b.data),
      env.DB.prepare('DELETE FROM saves WHERE id = ? AND t NOT IN (SELECT t FROM saves WHERE id = ? ORDER BY t DESC LIMIT ?)').bind(me.id, me.id, KEEP),
    ]);
    return json({ t });
  }

  // Earlier saves: the list (times only), or one of them with ?t=
  if (path === '/api/saves' && m === 'GET') {
    const t = +url.searchParams.get('t');
    if (t) {
      const row = await env.DB.prepare('SELECT t, save FROM saves WHERE id = ? AND t = ?').bind(me.id, t).first();
      return row ? json({ t: row.t, data: row.save }) : fail(404, 'That save is no longer kept.');
    }
    const { results } = await env.DB.prepare('SELECT t FROM saves WHERE id = ? ORDER BY t DESC').bind(me.id).all();
    return json({ rows: results.map(r => r.t) });
  }

  if (path === '/api/score' && m === 'POST') {
    if (env.TEST_COPY) return json({ ok: true, ignored: 'test copy' });
    const b = await body(req);
    const board = b && b.board, k = b && String(b.k || ''), val = b && Math.floor(+b.val);
    if (!BOARDS[board] || !BOARDS[board](k) || !Number.isFinite(val) || val < 0 || val > 1e7) return fail(400, 'Bad score.');
    const info = JSON.stringify(Object.fromEntries(Object.entries(b.info || {}).filter(([key, v]) => ['cls', 'depth', 'won', 'diff', 'lv'].includes(key)
      && (typeof v === 'string' ? v.length <= 20 : typeof v === 'number' || typeof v === 'boolean'))));
    await env.DB.prepare(`INSERT INTO scores (id, board, k, val, info, t) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (id, board, k) DO UPDATE SET val = excluded.val, info = excluded.info, t = excluded.t WHERE excluded.val > scores.val`)
      .bind(me.id, board, k, val, info, Date.now()).run();
    return json({ ok: true });
  }

  return fail(404, 'Not found.');
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try { return await route(req, env, url); } catch (e) { console.error(e); return fail(500, 'The server had a problem. Try again later.'); }
  },
};
