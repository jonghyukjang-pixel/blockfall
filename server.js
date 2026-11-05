// BLOCKFALL local dev server
// - Serves the game (blockfall.html)
// - /api/scores uses the same Supabase code as the Vercel function (lib/db.js)
// Reads SUPABASE_URL / SUPABASE_SECRET_KEY from .env.local if present.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// minimal .env.local loader (KEY=VALUE lines)
const envFile = path.join(ROOT, '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { topScores, addScore } = require('./lib/db');
const PORT = process.env.PORT || 3000;

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 10000) { reject(new Error('too large')); req.destroy(); }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handleApi(req, res, url) {
  if (url.pathname !== '/api/scores') return sendJson(res, 404, { error: 'not found' });
  if (req.method === 'GET') return sendJson(res, 200, await topScores(url.searchParams.get('limit')));
  if (req.method === 'POST') {
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (e) { return sendJson(res, 400, { error: '잘못된 요청입니다' }); }
    const out = await addScore(body);
    return sendJson(res, out.status, out.body);
  }
  res.writeHead(405, { Allow: 'GET, POST' });
  res.end();
}

function serveStatic(req, res, url) {
  if (url.pathname !== '/' && url.pathname !== '/blockfall.html') { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(ROOT, 'blockfall.html'), (err, data) => {
    if (err) { res.writeHead(500); return res.end('Error'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch(err => { console.error(err); sendJson(res, 500, { error: 'server error' }); });
  } else {
    serveStatic(req, res, url);
  }
}).listen(PORT, () => console.log(`BLOCKFALL server: http://localhost:${PORT}`));
