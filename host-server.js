// File 7: host-server.js
// Simple Node.js host for keys-host-share.html
// Run: node host-server.js
// No dependencies - uses only Node built-ins

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// In-memory store for hosted shares: id -> { payload, exp, created }
// For production, replace with Redis / DB / file storage
const store = new Map();

// Clean up expired shares every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of store) {
    if (now > item.exp) store.delete(id);
  }
}, 5 * 60 * 1000);

function parseExpiry(str) {
  str = (str || '24h').trim().toLowerCase();
  const m = str.match(/^(\d+)(h|d|m)?$/);
  if (!m) return 24 * 3600 * 1000;
  const n = parseInt(m[1], 10);
  const u = m[2] || 'h';
  return n * (u === 'd' ? 86400000 : u === 'm' ? 60000 : 3600000);
}

function sendJSON(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // --- Static: serve the main page ---
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return sendFile(res, path.join(__dirname, 'keys-host-share.html'), 'text/html');
  }

  // --- API: Create a hosted share ---
  // POST /api/share  body: { n, v, note, expiry, pw }
  if (req.method === 'POST' && pathname === '/api/share') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (!data.n || !data.v) return sendJSON(res, 400, { error: 'name and value required' });

        const id = crypto.randomBytes(6).toString('hex'); // 12-char id
        const exp = Date.now() + parseExpiry(data.expiry || '24h');

        store.set(id, {
          n: data.n,
          v: data.v, // already base64 from frontend
          note: data.note || '',
          pw: data.pw || '', // already base64 if set
          exp,
          created: Date.now(),
          views: 0
        });

        const link = `${url.origin}/s/${id}`;
        sendJSON(res, 200, { id, link, exp });
      } catch (e) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // --- API: Get a hosted share ---
  // GET /api/share/:id  ?pw=...
  if (req.method === 'GET' && pathname.startsWith('/api/share/')) {
    const id = pathname.split('/')[3];
    const item = store.get(id);
    if (!item) return sendJSON(res, 404, { error: 'Not found or expired' });
    if (Date.now() > item.exp) {
      store.delete(id);
      return sendJSON(res, 410, { error: 'Link expired' });
    }
    if (item.pw) {
      const pw = url.searchParams.get('pw') || '';
      // frontend sends base64 pw, compare directly
      if (!pw || pw !== item.pw) return sendJSON(res, 401, { error: 'Password required', needsPassword: true });
    }
    item.views++;
    return sendJSON(res, 200, {
      n: item.n,
      v: item.v,
      note: item.note,
      exp: item.exp,
      views: item.views
    });
  }

  // --- API: Delete a share ---
  // DELETE /api/share/:id
  if (req.method === 'DELETE' && pathname.startsWith('/api/share/')) {
    const id = pathname.split('/')[3];
    const deleted = store.delete(id);
    return sendJSON(res, 200, { deleted });
  }

  // --- Short link page: /s/:id ---
  if (req.method === 'GET' && pathname.startsWith('/s/')) {
    const id = pathname.split('/')[2];
    const item = store.get(id);
    if (!item || Date.now() > item.exp) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>Link not found or expired</h1><p><a href="/">Go home</a></p>');
      return;
    }
    // Serve a minimal viewer that fetches via API
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shared Key - ${id}</title>
    <style>body{font-family:sans-serif;background:#0f1115;color:#fff;padding:20px} .card{background:#1a1d23;padding:20px;border-radius:12px;max-width:500px;margin:0 auto} input,button{width:100%;padding:10px;margin-top:10px;border-radius:8px;border:1px solid #333;background:#0f1115;color:#fff} button{background:#4f7cff;border:none;cursor:pointer}</style></head>
    <body><div class="card"><h2>🔑 Shared Key</h2><p id="info">Loading...</p><div id="pwBox" style="display:none"><input id="pw" type="password" placeholder="Enter share password"><button onclick="load()">Unlock</button></div><div id="result"></div></div>
    <script>
      async function load(){
        const pw = document.getElementById('pw')?.value || '';
        const pwB64 = pw ? btoa(pw) : '';
        const r = await fetch('/api/share/${id}' + (pwB64 ? '?pw='+encodeURIComponent(pwB64) : ''));
        const d = await r.json();
        if(r.status===401){ document.getElementById('pwBox').style.display='block'; document.getElementById('info').textContent='This share needs a password.'; return; }
        if(!r.ok){ document.getElementById('info').textContent = d.error || 'Error'; return; }
        const val = decodeURIComponent(escape(atob(d.v)));
        document.getElementById('info').textContent = 'Name: ' + d.n + (d.note ? ' • ' + d.note : '');
        document.getElementById('result').innerHTML = '<p style="word-break:break-all;background:#0f1115;padding:12px;border-radius:8px;margin-top:12px">'+val.replace(/</g,'&lt;')+'</p><button onclick="navigator.clipboard.writeText('+JSON.stringify(val)+')">Copy Key</button>';
      }
      load();
    <\/script></body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // --- Health check ---
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJSON(res, 200, { ok: true, stored: store.size, uptime: process.uptime() });
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`✅ Keys Host running at http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT} for the main app`);
  console.log(`   API: POST /api/share  |  GET /api/share/:id  |  GET /s/:id`);
});
