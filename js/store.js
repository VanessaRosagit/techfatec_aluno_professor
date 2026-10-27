// Camada de dados. Fonte: data/db.json.
// Com `node server.js` as alterações são gravadas no próprio arquivo (modo "api").
// Com um servidor estático qualquer, o banco é lido do arquivo e as alterações
// ficam no localStorage do navegador (modo "local").
const KEY = 'techfatec_db_v1';
let db = null;
let mode = 'local';

const SEM_SERVIDOR = location.protocol === 'file:'; // aberto com duplo clique

export async function init() {
  try {
    if (SEM_SERVIDOR) throw new Error('sem servidor');
    const r = await fetch('/api/db', { cache: 'no-store' });
    if (r.ok) { db = await r.json(); mode = 'api'; return; }
  } catch (e) { /* sem API: usa modo local */ }
  try {
    const local = localStorage.getItem(KEY);
    if (local) { db = JSON.parse(local); return; }
  } catch (e) { /* localStorage indisponível */ }
  db = await semente();
  persistLocal();
}

function persistLocal() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignora */ }
}

// Banco inicial: lê data/db.json; se não houver servidor (arquivo aberto direto), usa data/db.js.
async function semente() {
  try {
    if (SEM_SERVIDOR) throw new Error('sem servidor');
    const r = await fetch('data/db.json');
    if (r.ok) return await r.json();
  } catch (e) { /* abre direto do disco */ }
  return JSON.parse(JSON.stringify(window.TF_SEED));
}

export const data = () => db;
export const modo = () => mode;

export async function save() {
  if (mode === 'api') {
    const r = await fetch('/api/db', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(db, null, 2) });
    if (!r.ok) throw new Error('Não foi possível gravar o banco de dados.');
  } else {
    persistLocal();
  }
}

export async function restaurar() {
  if (mode === 'api') {
    const r = await fetch('/api/reset', { method: 'POST' });
    db = await r.json();
  } else {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
    db = await semente();
    persistLocal();
  }
}

export const uid = (prefixo) => `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const porId = (colecao, id) => db[colecao].find((x) => x.id === id);
