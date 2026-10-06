// Minimal zero-dependency server for the LoanLens demo app.
// Serves static files from ./public and the loan portfolio at /api/loans.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, 'public');
const LOANS_FILE = path.join(__dirname, 'data', 'loans.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': MIME['.json'] });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/loans') {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
    const loans = JSON.parse(fs.readFileSync(LOANS_FILE, 'utf8'));
    const type = url.searchParams.get('type');
    return sendJson(res, 200, type ? loans.filter((l) => l.type === type) : loans);
  }

  if (url.pathname === '/health') return sendJson(res, 200, { status: 'ok' });

  const route = { '/': '/index.html', '/calculator': '/calculator.html' }[url.pathname] || url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, route));
  if (!filePath.startsWith(PUBLIC_DIR)) return sendJson(res, 403, { error: 'Forbidden' });

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`LoanLens running at http://localhost:${PORT}`));
