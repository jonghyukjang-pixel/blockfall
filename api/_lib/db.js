// Shared score storage (Supabase) for both the local server and the Vercel function.
// Talks to Supabase's REST API (PostgREST) with the project's secret key, server-side only.
// Required env vars: SUPABASE_URL, SUPABASE_SECRET_KEY

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY 환경변수가 없습니다');
  return { base: url.replace(/\/$/, '') + '/rest/v1/scores', key };
}

function headers(key, extra) {
  const h = { apikey: key, 'Content-Type': 'application/json', ...extra };
  // legacy service_role keys are JWTs and also go in Authorization
  if (key.startsWith('eyJ')) h.Authorization = 'Bearer ' + key;
  return h;
}

async function call(path, opts = {}) {
  const { base, key } = config();
  const res = await fetch(base + path, { ...opts, headers: headers(key, opts.headers) });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res;
}

function toInt(v, min, max) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

// "2026-11-05T05:19:15+00:00" -> "2026-11-05 14:19:15" (KST)
function kst(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return String(ts || '');
  return new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
}

async function topScores(limitParam) {
  const limit = toInt(limitParam || 10, 1, 100) || 10;
  const res = await call(`?select=name,score,lines,level,created_at&order=score.desc,id.asc&limit=${limit}`);
  const rows = await res.json();
  return rows.map(r => ({ ...r, created_at: kst(r.created_at) }));
}

// Returns { status, body } so both HTTP layers can reply the same way
async function addScore(body) {
  body = body || {};
  const name = String(body.name || '').trim().slice(0, 12);
  const score = toInt(body.score, 0, 100000000);
  const lines = toInt(body.lines, 0, 1000000);
  const level = toInt(body.level, 1, 10000);
  if (!name) return { status: 400, body: { error: '이름을 입력하세요' } };
  if (score === null || lines === null || level === null) return { status: 400, body: { error: '점수 값이 올바르지 않습니다' } };

  await call('', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ name, score, lines, level }),
  });
  // rank = number of strictly higher scores + 1
  const res = await call(`?select=id&score=gt.${score}`, { method: 'HEAD', headers: { Prefer: 'count=exact' } });
  const total = Number((res.headers.get('content-range') || '*/0').split('/')[1]) || 0;
  return { status: 201, body: { ok: true, rank: total + 1 } };
}

module.exports = { topScores, addScore };
