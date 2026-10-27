// Servidor local do TechFatec (sem dependências): serve os arquivos estáticos
// e expõe o banco JSON em /api/db (GET lê, PUT grava em data/db.json).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const SEED_FILE = path.join(ROOT, 'data', 'db.seed.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

if (!fs.existsSync(SEED_FILE)) fs.copyFileSync(DB_FILE, SEED_FILE); // cópia para restaurar o banco

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 5e6) { reject(new Error('Corpo muito grande')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function writeDb(text) {
  JSON.parse(text); // valida antes de gravar
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, DB_FILE); // gravação atômica
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/db' && req.method === 'GET') return send(res, 200, fs.readFileSync(DB_FILE));
    if (url.pathname === '/api/db' && req.method === 'PUT') {
      writeDb(await readBody(req));
      return send(res, 200, '{"ok":true}');
    }
    if (url.pathname === '/api/reset' && req.method === 'POST') {
      fs.copyFileSync(SEED_FILE, DB_FILE);
      return send(res, 200, fs.readFileSync(DB_FILE));
    }
    if (url.pathname.startsWith('/api/')) return send(res, 404, '{"erro":"rota inexistente"}');

    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = path.normalize(path.join(ROOT, rel));
    if (!file.startsWith(ROOT + path.sep) || file === SEED_FILE || path.basename(file) === 'server.js') return send(res, 403, 'Acesso negado', 'text/plain; charset=utf-8');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Não encontrado', 'text/plain; charset=utf-8');
    send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
  } catch (err) {
    send(res, 400, JSON.stringify({ erro: err.message }));
  }
});

server.listen(PORT, () => console.log(`TechFatec rodando em http://localhost:${PORT}`));
