// ARQUIVO GERADO por build.js. Edite os arquivos em js/ e rode "node build.js".
"use strict";
const __m = {};

__m["dom"] = (function () {
// Helper de DOM: monta elementos sem usar innerHTML.
const SVG_NS = 'http://www.w3.org/2000/svg';

function apply(node, props) {
  let value;
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') value = v;
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  return value;
}

function append(node, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

// Troca os filhos de um nó ignorando null/false (replaceChildren escreveria "null" na tela).
function trocar(node, ...children) {
  node.replaceChildren();
  return append(node, children);
}

function el(tag, props, ...children) {
  const node = document.createElement(tag);
  const value = apply(node, props);
  append(node, children);
  if (value !== undefined) node.value = value; // depois dos filhos (necessário para <select>)
  return node;
}

function svgEl(tag, props, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  apply(node, props);
  return append(node, children);
}

const ICONS = {
  inicio: [['path', { d: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z' }]],
  grupos: [['circle', { cx: 9, cy: 8, r: 3.5 }], ['path', { d: 'M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6' }]],
  agenda: [['rect', { x: 3.5, y: 5, width: 17, height: 15, rx: 2 }], ['path', { d: 'M3.5 10h17M8 3v4M16 3v4' }]],
  materiais: [['path', { d: 'M6 3h8l4 4v14H6z' }], ['path', { d: 'M14 3v4h4' }]],
  atividades: [['path', { d: 'M6 3h8l4 4v14H6z' }], ['path', { d: 'M9 13h6M9 17h6' }]],
  projetos: [['path', { d: 'M4 20V4M4 20h16M8 15l4-4 3 3 5-6' }]],
  video: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M10 8.5l5 3.5-5 3.5z' }]],
  chat: [['path', { d: 'M4 5h16v11H9l-5 4z' }]],
  feedback: [['path', { d: 'M4 5h16v11H9l-5 4z' }], ['path', { d: 'M8 10h8' }]],
  bell: [['path', { d: 'M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4' }]],
  acess: [['circle', { cx: 12, cy: 5, r: 2 }], ['path', { d: 'M5 9l7 2 7-2M12 11v5l-3 5M12 16l3 5' }]],
  dashboard: [['rect', { x: 3, y: 3, width: 7, height: 7 }], ['rect', { x: 14, y: 3, width: 7, height: 7 }], ['rect', { x: 3, y: 14, width: 7, height: 7 }], ['rect', { x: 14, y: 14, width: 7, height: 7 }]],
  relatorios: [['path', { d: 'M5 20V10M12 20V4M19 20v-7' }]],
  sair: [['path', { d: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9' }]],
  fechar: [['path', { d: 'M6 6l12 12M18 6L6 18' }]],
  ok: [['path', { d: 'M5 12l4.5 4.5L19 7' }]],
  alerta: [['path', { d: 'M12 8v5M12 16.5v.5' }], ['circle', { cx: 12, cy: 12, r: 9 }]],
  play: [['path', { d: 'M8 5l11 7-11 7z' }]],
  pausa: [['path', { d: 'M8 5v14M16 5v14' }]],
};

function icon(name, size = 16, extra = {}) {
  const s = svgEl('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'aria-hidden': 'true', ...extra });
  for (const [tag, attrs] of ICONS[name] || []) s.append(svgEl(tag, attrs));
  return s;
}

return { append, trocar, el, svgEl, icon };
})();

__m["store"] = (function () {
// Camada de dados. Fonte: data/db.json.
// Com `node server.js` as alterações são gravadas no próprio arquivo (modo "api").
// Com um servidor estático qualquer, o banco é lido do arquivo e as alterações
// ficam no localStorage do navegador (modo "local").
const KEY = 'techfatec_db_v1';
let db = null;
let mode = 'local';

const SEM_SERVIDOR = location.protocol === 'file:'; // aberto com duplo clique

async function init() {
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

const data = () => db;
const modo = () => mode;

async function save() {
  if (mode === 'api') {
    const r = await fetch('/api/db', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(db, null, 2) });
    if (!r.ok) throw new Error('Não foi possível gravar o banco de dados.');
  } else {
    persistLocal();
  }
}

async function restaurar() {
  if (mode === 'api') {
    const r = await fetch('/api/reset', { method: 'POST' });
    db = await r.json();
  } else {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
    db = await semente();
    persistLocal();
  }
}

const uid = (prefixo) => `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const porId = (colecao, id) => db[colecao].find((x) => x.id === id);

return { init, data, modo, save, restaurar, uid, porId };
})();

__m["auth"] = (function () {
// Autenticação simulada. O acesso real usaria a conta Fatec (SSO); aqui a
// plataforma não cria nem guarda senhas: aceita a senha de demonstração do db.json.
const { data, save, uid } = __m["store"];

const SESSAO = 'techfatec_sessao';
const TENT = 'techfatec_tentativas';
const MAX_TENTATIVAS = 3;
const BLOQUEIO_MS = 30000;

function usuarioAtual() {
  let id = null;
  try { id = sessionStorage.getItem(SESSAO) || localStorage.getItem(SESSAO); } catch (e) { /* ignora */ }
  return id ? data().users.find((u) => u.id === id) || null : null;
}

function iniciarSessao(user, lembrar) {
  try {
    sessionStorage.setItem(SESSAO, user.id);
    if (lembrar) localStorage.setItem(SESSAO, user.id); else localStorage.removeItem(SESSAO);
  } catch (e) { /* ignora */ }
}

function encerrarSessao() {
  try { sessionStorage.removeItem(SESSAO); localStorage.removeItem(SESSAO); } catch (e) { /* ignora */ }
}

const dominio = () => data().meta.sso.dominio;
const emailInstitucional = (e) => e.trim().toLowerCase().endsWith(dominio()) && e.trim().length > dominio().length;

function tentativas() {
  try { return JSON.parse(sessionStorage.getItem(TENT) || '{}'); } catch (e) { return {}; }
}
function gravarTentativas(t) {
  try { sessionStorage.setItem(TENT, JSON.stringify(t)); } catch (e) { /* ignora */ }
}

// Retorna { user } em caso de sucesso ou { erros: { geral, email, senha } }.
function tentarLogin({ email, senha, tipo }) {
  const erros = {};
  if (!email.trim()) erros.email = 'Informe seu e-mail institucional.';
  else if (!emailInstitucional(email)) erros.email = `Use seu e-mail institucional (${dominio()}).`;
  if (!senha) erros.senha = 'Informe a senha da sua conta Fatec.';
  if (Object.keys(erros).length) return { erros };

  const chave = email.trim().toLowerCase();
  const t = tentativas();
  const reg = t[chave] || { n: 0, ate: 0 };
  if (Date.now() < reg.ate) {
    const s = Math.ceil((reg.ate - Date.now()) / 1000);
    return { erros: { geral: `Acesso bloqueado temporariamente. Tente novamente em ${s} segundos.`, bloqueado: true } };
  }

  const user = data().users.find((u) => u.email.toLowerCase() === chave);
  if (!user || senha !== data().meta.sso.senhaDemonstracao) {
    reg.n += 1;
    if (reg.n >= MAX_TENTATIVAS) { reg.n = 0; reg.ate = Date.now() + BLOQUEIO_MS; t[chave] = reg; gravarTentativas(t); return { erros: { geral: `Muitas tentativas. Acesso bloqueado por ${BLOQUEIO_MS / 1000} segundos.`, bloqueado: true } }; }
    t[chave] = reg; gravarTentativas(t);
    return { erros: { geral: 'Não foi possível entrar. E-mail ou senha incorretos. Confira os dados e tente novamente.', email: '', senha: `Senha incorreta. Restam ${MAX_TENTATIVAS - reg.n} tentativas antes do bloqueio temporário.` } };
  }
  if (tipo && user.tipo !== tipo) {
    return { erros: { geral: `Este e-mail pertence a ${user.tipo === 'aluno' ? 'um aluno' : 'um professor'}. Selecione o perfil correto e tente novamente.` } };
  }
  delete t[chave]; gravarTentativas(t);
  return { user };
}

// Retorna { user } ou { erros: { campo: mensagem } }.
async function cadastrar(tipo, v) {
  const erros = {};
  if (v.nome.trim().length < 3) erros.nome = 'Informe seu nome completo.';
  if (!v.email.trim()) erros.email = 'Campo obrigatório.';
  else if (!emailInstitucional(v.email)) erros.email = `Use seu e-mail institucional (${dominio()}).`;
  else if (data().users.some((u) => u.email.toLowerCase() === v.email.trim().toLowerCase())) erros.email = 'Este e-mail já possui cadastro.';
  if (tipo === 'aluno') {
    if (!v.ra.trim()) erros.ra = 'Campo obrigatório.';
    if (!v.curso.trim()) erros.curso = 'Campo obrigatório.';
  } else if (!v.matricula.trim()) erros.matricula = 'Campo obrigatório.';
  if (Object.keys(erros).length) return { erros };

  const user = { id: uid('u'), tipo, nome: v.nome.trim().replace(/\s+/g, ' '), email: v.email.trim().toLowerCase() };
  if (tipo === 'aluno') { user.ra = v.ra.trim(); user.curso = v.curso.trim(); } else user.matricula = v.matricula.trim();
  data().users.push(user);
  await save();
  return { user };
}

function recuperarSenha(email) {
  if (!email.trim()) return { erro: 'Campo obrigatório.' };
  if (!emailInstitucional(email)) return { erro: `Use seu e-mail institucional (${dominio()}).` };
  const existe = data().users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  return existe ? { ok: true } : { erro: 'Verifique se digitou corretamente ou faça seu cadastro.', naoEncontrado: true };
}

return { usuarioAtual, iniciarSessao, encerrarSessao, emailInstitucional, tentarLogin, cadastrar, recuperarSenha };
})();

__m["ui"] = (function () {
// Componentes de interface compartilhados: layout, formulários, toast, modal,
// painel de acessibilidade e assistente.
const { el, icon, trocar } = __m["dom"];
const { data } = __m["store"];
const { encerrarSessao } = __m["auth"];

const go = (rota) => { location.hash = '#' + rota; };

/* ---------- formatação ---------- */
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fmtCurta = (iso) => { const [, m, d] = iso.split('-'); return `${d} ${MESES[+m - 1]}`; };
const fmtBR = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; };
const partesData = (iso) => { const [, m, d] = iso.split('-'); return { dia: d, mes: MESES[+m - 1].toUpperCase() }; };
const hojeISO = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const fmtTempo = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const iniciais = (nome) => { const p = nome.trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); };
const siglaCurso = (c = '') => c.split(/\s+/).filter((w) => /^[A-ZÀ-Ú]/.test(w)).map((w) => w[0]).join('');
const rotuloUsuario = (u) => (u.tipo === 'aluno' ? `Aluno${u.curso ? ' · ' + siglaCurso(u.curso) : ''}` : 'Professor(a)');

/* ---------- formulários ---------- */
function input(attrs = {}, erro) {
  return el(attrs.tag || 'input', { class: `in${erro ? ' invalido' : ''}${attrs.class ? ' ' + attrs.class : ''}`, ...attrs, tag: null, 'aria-invalid': erro ? 'true' : null });
}
function campo(rotulo, controle, erro) {
  return el('label', { class: 'campo' }, rotulo, controle, erro ? el('span', { class: 'erro-msg' }, '! ' + erro) : null);
}
function alerta(tipo, titulo, texto) {
  return el('div', { class: `alerta alerta-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' },
    el('span', { class: 'alerta-ic', 'aria-hidden': 'true' }, tipo === 'erro' ? '!' : '✓'),
    el('span', {}, el('b', {}, titulo), texto ? ' ' + texto : ''));
}
function focarInvalido(raiz) {
  const alvo = raiz.querySelector('[aria-invalid="true"]') || raiz.querySelector('[role="alert"]');
  if (alvo) { if (!alvo.hasAttribute('tabindex') && alvo.tagName === 'DIV') alvo.setAttribute('tabindex', '-1'); alvo.focus(); }
}
const lerCampos = (form) => Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, typeof v === 'string' ? v : v.name]));

function cabecalho(eyebrow, titulo, sub, acao) {
  return el('div', { class: 'cab' },
    el('div', {}, el('div', { class: 'eyebrow' }, eyebrow), el('h1', { class: 'titulo' }, titulo), sub ? el('p', { class: 'sub' }, sub) : null),
    acao || null);
}
const voltar = (texto, rota) => el('a', { class: 'voltar', href: '#' + rota }, '← ' + texto);

/* ---------- toast e modal ---------- */
function toast(msg, tipo = 'ok') {
  let box = document.getElementById('toasts');
  if (!box) { box = el('div', { id: 'toasts', 'aria-live': 'polite' }); document.body.append(box); }
  const t = el('div', { class: `toast toast-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' }, msg);
  box.append(t);
  setTimeout(() => t.remove(), 3800);
}

function modal({ titulo, corpo, acoes = [] }) {
  const anterior = document.activeElement;
  const fechar = () => { fundo.remove(); document.removeEventListener('keydown', tecla); if (anterior && anterior.focus) anterior.focus(); };
  const tecla = (e) => { if (e.key === 'Escape') fechar(); };
  const botoes = acoes.map((a) => el('button', { type: 'button', class: a.primario ? 'btn btn-primario' : 'btn btn-sec', onClick: () => { if (a.onClick() !== false) fechar(); } }, a.rotulo));
  const fundo = el('div', { class: 'modal-fundo', onClick: (e) => { if (e.target === fundo) fechar(); } },
    el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo },
      el('h2', {}, titulo), corpo, el('div', { class: 'modal-acoes' }, botoes)));
  document.body.append(fundo);
  document.addEventListener('keydown', tecla);
  const primeiro = fundo.querySelector('input, textarea, select, button');
  if (primeiro) primeiro.focus();
  return fechar;
}

function confirmar(titulo, texto, rotulo, aoConfirmar) {
  modal({ titulo, corpo: el('p', { class: 'sub' }, texto), acoes: [{ rotulo: 'Cancelar', onClick: () => true }, { rotulo, primario: true, onClick: () => { aoConfirmar(); return true; } }] });
}

/* ---------- acessibilidade ---------- */
const ACESS = 'techfatec_acessibilidade';
const acessPadrao = { escala: 100, contraste: false };
function lerAcess() { try { return { ...acessPadrao, ...JSON.parse(localStorage.getItem(ACESS) || '{}') }; } catch (e) { return { ...acessPadrao }; } }
function aplicarAcessibilidade(c = lerAcess()) {
  document.documentElement.style.setProperty('--escala', String(c.escala / 100));
  document.body.classList.toggle('alto-contraste', !!c.contraste);
  try { localStorage.setItem(ACESS, JSON.stringify(c)); } catch (e) { /* ignora */ }
}

function painel(id, titulo, sub, corpo) {
  const p = el('aside', { class: 'painel', id, role: 'dialog', 'aria-label': titulo, hidden: true },
    el('header', { class: 'painel-cab' },
      el('div', {}, el('b', {}, titulo), el('div', { class: 'miudo' }, sub)),
      el('button', { type: 'button', class: 'icone-btn', 'aria-label': 'Fechar', onClick: () => { p.hidden = true; } }, icon('fechar'))),
    corpo);
  return p;
}

function painelAcessibilidade() {
  const rotulo = el('span', { class: 'escala-valor', 'aria-live': 'polite' });
  const troca = el('button', { type: 'button', role: 'switch', class: 'switch', 'aria-label': 'Alto contraste' });
  const sincronizar = () => { const c = lerAcess(); rotulo.textContent = c.escala + '%'; troca.setAttribute('aria-checked', String(!!c.contraste)); };
  const mudar = (parcial) => { aplicarAcessibilidade({ ...lerAcess(), ...parcial }); sincronizar(); };
  troca.addEventListener('click', () => mudar({ contraste: !lerAcess().contraste }));
  sincronizar();
  return painel('painel-acess', 'Acessibilidade', 'Personalize sua experiência', el('div', { class: 'painel-corpo' },
    el('div', { class: 'cartao-simples' }, el('b', {}, 'Tamanho do texto'), el('div', { class: 'miudo' }, 'Ajuste para facilitar a leitura'),
      el('div', { class: 'escala' },
        el('button', { type: 'button', class: 'btn btn-sec', 'aria-label': 'Diminuir texto', onClick: () => mudar({ escala: Math.max(80, lerAcess().escala - 10) }) }, 'A−'),
        rotulo,
        el('button', { type: 'button', class: 'btn btn-sec', 'aria-label': 'Aumentar texto', onClick: () => mudar({ escala: Math.min(160, lerAcess().escala + 10) }) }, 'A+'))),
    el('div', { class: 'cartao-simples linha-switch' }, el('div', {}, el('b', {}, 'Alto contraste'), el('div', { class: 'miudo' }, 'Aumenta a diferença entre as cores')), troca),
    el('button', { type: 'button', class: 'btn btn-sec', onClick: () => mudar({ ...acessPadrao }) }, 'Restaurar configurações')));
}

/* ---------- assistente (chatbot por palavras-chave do db.json) ---------- */
const historicoAssistente = [];
function responder(papel, texto) {
  const faq = data().faq;
  const t = semAcento(texto);
  const achou = (faq[papel] || []).find((f) => f.chaves.some((c) => t.includes(semAcento(c))));
  return achou ? achou.resposta : faq.padrao;
}
function painelAssistente(user) {
  const papel = user.tipo;
  const sugestoes = papel === 'aluno' ? ['Onde estão meus materiais?', 'Como vejo as provas?', 'Onde assisto às videoaulas?'] : ['Como criar uma atividade?', 'Como publicar uma videoaula?', 'Onde vejo o engajamento?'];
  const lista = el('div', { class: 'chat-lista', 'aria-live': 'polite' });
  const inicial = papel === 'aluno'
    ? `Olá, ${user.nome.split(' ')[0]}! Posso ajudar com grupos, agentes, materiais, atividades, projetos e videoaulas.`
    : 'Olá, professor(a)! Posso ajudar com grupos, atividades, videoaulas, projetos e relatórios.';
  const bolha = (autor, texto) => el('div', { class: `bolha bolha-${autor}` }, texto);
  const desenhar = () => trocar(lista, bolha('bot', inicial), ...historicoAssistente.map((m) => bolha(m.autor, m.texto)));
  const enviar = (texto) => {
    if (!texto.trim()) return;
    historicoAssistente.push({ autor: 'eu', texto: texto.trim() }, { autor: 'bot', texto: responder(papel, texto) });
    desenhar(); lista.scrollTop = lista.scrollHeight;
  };
  const campoMsg = el('input', { class: 'in', type: 'text', placeholder: 'Digite sua dúvida...', 'aria-label': 'Mensagem' });
  const form = el('form', { class: 'chat-form', onSubmit: (e) => { e.preventDefault(); enviar(campoMsg.value); campoMsg.value = ''; } },
    campoMsg, el('button', { class: 'btn btn-primario', type: 'submit', 'aria-label': 'Enviar' }, '→'));
  desenhar();
  return painel('painel-assistente', 'Assistente TechFatec', papel === 'aluno' ? 'Ajuda para alunos' : 'Ajuda para professores',
    el('div', { class: 'painel-corpo chat' }, lista,
      el('div', { class: 'chips' }, sugestoes.map((s) => el('button', { type: 'button', class: 'chip', onClick: () => enviar(s) }, s))), form));
}

/* ---------- layout principal ---------- */
const NAV = {
  aluno: [['inicio', 'Início', 'inicio', '/aluno'], ['grupos', 'Explorar grupos', 'grupos', '/aluno/grupos'], ['agenda', 'Agenda', 'agenda', '/aluno/agenda'],
    ['materiais', 'Materiais', 'materiais', '/aluno/materiais'], ['atividades', 'Atividades', 'atividades', '/aluno/atividades'], ['projetos', 'Projetos', 'projetos', '/aluno/projetos'],
    ['videoaulas', 'Videoaulas', 'video', '/aluno/videoaulas'], ['agentes', 'Meus agentes', 'chat', '/aluno/agentes'], ['feedback', 'Enviar feedback', 'feedback', '/aluno/feedback']],
  professor: [['dashboard', 'Dashboard', 'dashboard', '/professor'], ['grupos', 'Gerenciar grupos', 'grupos', '/professor/grupos'], ['atividades', 'Gerenciar atividades', 'atividades', '/professor/atividades'],
    ['projetos', 'Gerenciar projetos', 'projetos', '/professor/projetos'], ['videoaula', 'Publicar videoaula', 'video', '/professor/videoaula'], ['relatorios', 'Relatórios', 'relatorios', '/professor/relatorios']],
};

const marca = (largura = 172, tamanho = 19) => el('div', { class: 'marca' },
  el('img', { src: 'assets/logo-fatec-cps.png', alt: 'Fatec São Roque · Centro Paula Souza', style: { width: largura + 'px' } }),
  el('div', { class: 'marca-nome', style: { fontSize: tamanho + 'px' } }, 'TechFatec'));

function proximos(user) {
  if (user.tipo === 'aluno') return [...data().eventos].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)).slice(0, 3).map((e) => [e.titulo, `${fmtCurta(e.data)} · ${e.hora}`]);
  return [...data().atividades].sort((a, b) => a.entrega.localeCompare(b.entrega)).slice(0, 3).map((a) => [a.titulo, `Entrega ${fmtCurta(a.entrega)}`]);
}

function shell(user, nav, conteudo) {
  const papel = user.tipo;
  const principal = el('main', { class: 'principal' });
  const busca = el('input', { class: 'in busca', type: 'search', placeholder: 'Pesquisar...', 'aria-label': 'Pesquisar', onInput: () => {
    const q = semAcento(busca.value);
    principal.querySelectorAll('.item').forEach((n) => { n.hidden = q && !semAcento(n.textContent).includes(q); });
  } });
  const pop = el('div', { class: 'pop', hidden: true }, el('b', {}, papel === 'aluno' ? 'Próximos compromissos' : 'Próximas entregas'),
    proximos(user).map(([t, s]) => el('div', { class: 'pop-item' }, el('div', {}, t), el('div', { class: 'miudo' }, s))));
  const sino = el('button', { type: 'button', class: 'icone-btn caixa', 'aria-label': 'Notificações', onClick: () => { pop.hidden = !pop.hidden; } }, icon('bell'));
  principal.append(el('div', { class: 'topbar' }, busca, el('div', { class: 'pop-wrap' }, sino, pop)), conteudo);

  const pAcess = painelAcessibilidade();
  const pAssist = painelAssistente(user);
  const alternar = (qual, outro) => { outro.hidden = true; qual.hidden = !qual.hidden; };

  const lateral = el('aside', { class: 'lateral' },
    marca(),
    el('div', { class: 'eyebrow lateral-papel' }, papel === 'aluno' ? 'ÁREA DO ALUNO' : 'ÁREA DO PROFESSOR'),
    el('nav', { class: 'nav', 'aria-label': 'Principal' }, NAV[papel].map(([chave, texto, ic, rota]) =>
      el('a', { href: '#' + rota, class: `nv${chave === nav ? ' on' : ''}`, 'aria-current': chave === nav ? 'page' : null }, icon(ic), texto))),
    el('div', { class: 'usuario' }, el('div', { class: 'avatar' }, iniciais(user.nome)),
      el('div', { class: 'usuario-nome' }, user.nome, el('div', { class: 'miudo' }, rotuloUsuario(user))),
      el('button', { type: 'button', class: 'icone-btn', 'aria-label': 'Sair', title: 'Sair', onClick: () => { encerrarSessao(); go('/login'); } }, icon('sair'))));

  const fabs = el('div', { class: 'fabs' },
    el('button', { type: 'button', class: 'fab fab-escuro', 'aria-label': 'Acessibilidade', onClick: () => alternar(pAcess, pAssist) }, icon('acess', 20)),
    el('button', { type: 'button', class: 'fab fab-acc', 'aria-label': 'Assistente', onClick: () => alternar(pAssist, pAcess) }, icon('chat', 20)));

  return el('div', { class: 'app' }, lateral, principal, fabs, pAcess, pAssist);
}

/* ---------- layout das telas de acesso ---------- */
function paginaAcesso(conteudo) {
  const pAcess = painelAcessibilidade();
  const fab = el('div', { class: 'fabs' }, el('button', { type: 'button', class: 'fab fab-escuro', 'aria-label': 'Acessibilidade', onClick: () => { pAcess.hidden = !pAcess.hidden; } }, icon('acess', 20)));
  return el('div', { class: 'acesso' }, el('div', { class: 'acesso-cartao' }, el('div', { class: 'acesso-form' }, marca(210, 22), conteudo)), fab, pAcess);
}

return { go, fmtCurta, fmtBR, partesData, hojeISO, fmtTempo, semAcento, iniciais, rotuloUsuario, input, campo, alerta, focarInvalido, lerCampos, cabecalho, voltar, toast, modal, confirmar, aplicarAcessibilidade, marca, shell, paginaAcesso };
})();

__m["comum"] = (function () {
// Blocos de interface reutilizados pelas áreas do aluno e do professor.
const { el, icon } = __m["dom"];
const { data, porId } = __m["store"];
const { fmtCurta } = __m["ui"];

const contagem = (g) => g.outrosParticipantes + g.participantes.filter((p) => p.status === 'ativo').length;
const nomeProfessor = (g) => (porId('users', g.professorId) || { nome: '—' }).nome;

const lista = (...linhas) => el('div', { class: 'lista' }, linhas);
function linha({ icone, titulo, sub, direita = [] }) {
  return el('div', { class: 'linha item' },
    icone ? el('div', { class: 'ic' }, icon(icone)) : null,
    el('div', { class: 'linha-texto' }, el('b', {}, titulo), sub ? el('div', { class: 'miudo' }, sub) : null),
    direita);
}
const selo = (texto, tom = 'acc') => el('span', { class: `selo selo-${tom}` }, texto);
const barra = (valor) => el('div', { class: 'barra', role: 'progressbar', 'aria-valuenow': valor, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': `${valor}% concluído` }, el('span', { style: { width: valor + '%' } }));

function estatisticas(itens) {
  return el('div', { class: 'estat-grade' }, itens.map(([titulo, valor, sub]) =>
    el('div', { class: 'card estat' }, el('div', { class: 'miudo' }, titulo), el('div', { class: 'estat-valor' }, String(valor)), el('div', { class: 'miudo' }, sub))));
}

function hero(titulo, texto, rotuloBotao, rota) {
  return el('section', { class: 'hero' },
    el('div', {}, el('div', { class: 'eyebrow claro' }, 'TECHFATEC'), el('h2', {}, titulo), el('p', {}, texto)),
    el('a', { class: 'btn btn-claro', href: '#' + rota }, rotuloBotao));
}

function atividadesRecentes() {
  const itens = [...data().atividades].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 4);
  return el('section', { class: 'card' },
    el('h2', { class: 'subtitulo' }, 'Atividades recentes'), el('p', { class: 'sub' }, 'Últimas movimentações.'),
    el('div', { class: 'lista interna' }, itens.map((a) => el('div', { class: 'linha' },
      el('div', { class: 'ic txt' }, 'TF'),
      el('div', { class: 'linha-texto' }, el('b', {}, a.titulo), el('div', { class: 'miudo' }, a.disciplina)),
      el('span', { class: 'miudo' }, fmtCurta(a.criadoEm))))));
}

function cartaoGrupo(g, rotulo, rota) {
  return el('article', { class: 'card grupo item' },
    selo(g.status, g.status === 'Em andamento' ? 'ok' : 'neutro'),
    el('h3', {}, g.nome),
    el('p', { class: 'miudo' }, `Prof. ${nomeProfessor(g)} · ${contagem(g)} participantes`),
    el('a', { class: 'btn btn-sec', href: '#' + rota }, rotulo));
}

function dataBox(iso) {
  const [, m, d] = iso.split('-');
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return el('div', { class: 'databox' }, d, el('small', {}, meses[+m - 1]));
}

const vazio = (texto) => el('p', { class: 'vazio' }, texto);

return { contagem, nomeProfessor, lista, linha, selo, barra, estatisticas, hero, atividadesRecentes, cartaoGrupo, dataBox, vazio };
})();

__m["acesso"] = (function () {
// Telas de acesso: login, cadastro (aluno/professor), recuperar senha, verifique e-mail.
const { el, trocar } = __m["dom"];
const { data } = __m["store"];
const { tentarLogin, cadastrar, recuperarSenha, iniciarSessao } = __m["auth"];
const { go, paginaAcesso, campo, input, alerta, focarInvalido, lerCampos } = __m["ui"];

const rotaInicial = (u) => (u.tipo === 'aluno' ? '/aluno' : '/professor');
const rodape = () => el('div', { class: 'miudo centro' }, 'Demonstração acadêmica. Nenhum dado real é armazenado.');

function login() {
  const estado = { erros: {}, valores: { email: '', senha: '', lembrar: false } };
  const raiz = el('div', { class: 'coluna' });

  function enviar(e) {
    e.preventDefault();
    const f = lerCampos(e.target);
    estado.valores = { email: f.email || '', senha: f.senha || '', lembrar: !!f.lembrar };
    const r = tentarLogin({ email: estado.valores.email, senha: estado.valores.senha });
    if (r.user) { iniciarSessao(r.user, estado.valores.lembrar); go(rotaInicial(r.user)); return; }
    estado.erros = r.erros; desenhar(); focarInvalido(raiz);
  }

  function desenhar() {
    const { erros, valores } = estado;
    const sso = data().meta.sso;
    const emailInvalido = erros.email !== undefined; const senhaInvalida = erros.senha !== undefined;
    trocar(raiz, 
      el('div', { class: 'eyebrow' }, 'SUA JORNADA ACADÊMICA'),
      el('h1', { class: 'titulo grande' }, 'Acesse sua conta'),
      el('p', { class: 'sub' }, 'Um único acesso para estudantes e professores.'),
      erros.geral ? alerta('erro', erros.geral.split('. ')[0] + '.', erros.geral.split('. ').slice(1).join('. ')) : null,
      el('div', { class: 'nota' }, 'Seu ambiente será carregado de acordo com o seu perfil.'),
      el('form', { class: 'coluna', novalidate: true, onSubmit: enviar },
        campo('E-mail institucional', input({ name: 'email', type: 'email', placeholder: `seunome${sso.dominio}`, autocomplete: 'username', value: valores.email }, emailInvalido ? erros.email || ' ' : ''), erros.email),
        campo('Senha da conta Fatec', input({ name: 'senha', type: 'password', placeholder: 'Mesma senha da Fatec', autocomplete: 'current-password', value: valores.senha }, senhaInvalida ? erros.senha || ' ' : ''), erros.senha),
        el('div', { class: 'linha-entre' },
          el('label', { class: 'check' }, el('input', { type: 'checkbox', name: 'lembrar', checked: valores.lembrar }), ' Lembrar de mim'),
          el('a', { href: '#/recuperar' }, 'Esqueci minha senha')),
        el('button', { class: 'btn btn-primario cheio', type: 'submit', disabled: erros.bloqueado }, erros.bloqueado ? 'Aguarde...' : estado.erros.geral ? 'Tentar novamente' : 'Entrar →')),
      el('div', { class: 'centro sub' }, 'Ainda não possui uma conta?'),
      el('div', { class: 'centro' }, el('a', { href: '#/cadastro-aluno' }, 'Cadastrar como aluno'), ' · ', el('a', { href: '#/cadastro-professor' }, 'Cadastrar como professor')),
      el('div', { class: 'nota' }, el('b', {}, 'Demonstração: '), `aluno ${data().users.find((u) => u.tipo === 'aluno').email} ou professor ${data().users.find((u) => u.tipo === 'professor').email}, senha ${sso.senhaDemonstracao}. O acesso real usaria a conta Fatec.`));
  }
  desenhar();
  return paginaAcesso(raiz);
}

function cadastro(tipoInicial) {
  const tipo = tipoInicial;
  const estado = { erros: {}, v: { nome: '', email: '', ra: '', curso: '', matricula: '' } };
  const raiz = el('div', { class: 'coluna' });
  const total = (erros) => Object.keys(erros).length;

  async function enviar(e) {
    e.preventDefault();
    estado.v = { ...estado.v, ...lerCampos(e.target) };
    const r = await cadastrar(tipo, estado.v);
    if (r.user) { iniciarSessao(r.user, false); go(rotaInicial(r.user)); return; }
    estado.erros = r.erros; desenhar(); focarInvalido(raiz);
  }

  function desenhar() {
    const { erros, v } = estado;
    const c = (rotulo, nome, ph, extra = {}) => campo(rotulo, input({ name: nome, type: 'text', placeholder: ph, value: v[nome], ...extra }, erros[nome]), erros[nome]);
    trocar(raiz, 
      el('div', { class: 'eyebrow' }, tipo === 'aluno' ? 'SUA JORNADA ACADÊMICA' : 'CRIAR CONTA'),
      el('h1', { class: 'titulo' }, tipo === 'aluno' ? 'Cadastro de aluno' : 'Cadastro de professor'),
      el('p', { class: 'sub' }, tipo === 'aluno' ? 'Faça parte da comunidade TechFatec.' : 'Preencha seus dados para participar da plataforma.'),
      total(erros) ? alerta('erro', `Revise ${total(erros)} ${total(erros) === 1 ? 'campo' : 'campos'}.`, 'O cadastro não foi concluído.') : null,
      el('form', { class: 'coluna', novalidate: true, onSubmit: enviar },
        c('Nome completo', 'nome', tipo === 'aluno' ? 'Como você gostaria de ser chamado?' : 'Digite seu nome completo', { autocomplete: 'name' }),
        campo('E-mail institucional', input({ name: 'email', type: 'email', placeholder: `seunome${data().meta.sso.dominio}`, value: v.email, autocomplete: 'username' }, erros.email), erros.email),
        tipo === 'aluno' ? [c('RA', 'ra', 'Seu registro acadêmico'), c('Curso', 'curso', 'Ex.: Sistemas para Internet')] : c('Matrícula do professor', 'matricula', 'Digite sua matrícula'),
        el('div', { class: 'nota' }, 'Seu acesso usa a mesma senha da sua conta Fatec. Não é preciso criar uma senha aqui.'),
        el('button', { class: 'btn btn-primario cheio', type: 'submit' }, tipo === 'aluno' ? 'Concluir cadastro →' : 'Criar cadastro')),
      el('div', { class: 'linha-entre' }, el('a', { href: '#/login' }, 'Já tenho uma conta'),
        tipo === 'aluno' ? el('a', { href: '#/cadastro-professor' }, 'Sou professor') : el('a', { href: '#/cadastro-aluno' }, 'Sou aluno')),
      rodape());
  }
  desenhar();
  return paginaAcesso(raiz);
}

function recuperar() {
  const estado = { erro: null, naoEncontrado: false, email: '' };
  const raiz = el('div', { class: 'coluna' });

  function enviar(e) {
    e.preventDefault();
    estado.email = lerCampos(e.target).email || '';
    const r = recuperarSenha(estado.email);
    if (r.ok) { sessionStorage.setItem('techfatec_recuperacao', estado.email.trim()); go('/verifique'); return; }
    estado.erro = r.erro; estado.naoEncontrado = !!r.naoEncontrado; desenhar(); focarInvalido(raiz);
  }

  function desenhar() {
    trocar(raiz, 
      el('div', { class: 'eyebrow' }, 'RECUPERAÇÃO DE ACESSO'),
      el('h1', { class: 'titulo' }, 'Esqueci minha senha'),
      el('p', { class: 'sub' }, 'Informe seu e-mail institucional para receber as instruções de recuperação.'),
      estado.naoEncontrado ? alerta('erro', 'E-mail não encontrado.', 'Não localizamos uma conta com esse e-mail institucional.') : null,
      el('form', { class: 'coluna', novalidate: true, onSubmit: enviar },
        campo('E-mail institucional', input({ name: 'email', type: 'email', placeholder: `nome${data().meta.sso.dominio}`, value: estado.email }, estado.erro), estado.erro),
        el('button', { class: 'btn btn-primario cheio', type: 'submit' }, 'Ir para a recuperação da Fatec')),
      el('div', { class: 'linha-entre' }, el('a', { href: '#/login' }, 'Voltar para o login'), estado.naoEncontrado ? el('a', { href: '#/cadastro-aluno' }, 'Criar uma conta') : null),
      rodape());
  }
  desenhar();
  return paginaAcesso(raiz);
}

function verifique() {
  let email = '';
  try { email = sessionStorage.getItem('techfatec_recuperacao') || ''; } catch (e) { /* ignora */ }
  return paginaAcesso(el('div', { class: 'coluna' },
    el('div', { class: 'eyebrow' }, 'RECUPERAÇÃO ENVIADA'),
    el('h1', { class: 'titulo' }, 'Verifique seu e-mail'),
    el('p', { class: 'sub' }, 'Enviamos as instruções para o seu e-mail institucional.'),
    alerta('ok', email ? `Instruções enviadas para ${email}.` : 'Instruções enviadas.'),
    el('p', { class: 'sub' }, 'Confira também a caixa de spam. Esta é uma confirmação simulada da demonstração acadêmica.'),
    el('a', { class: 'btn btn-primario cheio', href: '#/login' }, 'Voltar para o login'),
    rodape()));
}

return { login, cadastro, recuperar, verifique };
})();

__m["aluno"] = (function () {
// Área do aluno.
const { el, icon, trocar } = __m["dom"];
const { data, save, uid, porId } = __m["store"];
const { go, cabecalho, voltar, toast, modal, campo, input, alerta, focarInvalido, lerCampos, fmtCurta, fmtBR, fmtTempo, hojeISO } = __m["ui"];
const { lista, linha, selo, barra, estatisticas, hero, atividadesRecentes, cartaoGrupo, contagem, nomeProfessor, dataBox, vazio } = __m["comum"];

const LIMITE_MB = 25;
const entregaDe = (user, atividadeId) => data().entregas.find((e) => e.atividadeId === atividadeId && e.alunoId === user.id);
const meusGrupos = (user) => data().grupos.filter((g) => g.participantes.some((p) => p.userId === user.id && p.status === 'ativo'));

/* ---------- início ---------- */
function inicio(user) {
  const pendentes = data().atividades.filter((a) => !entregaDe(user, a.id)).length;
  const compromissos = data().eventos.length;
  return el('div', {},
    cabecalho('ÁREA DO ALUNO', `Olá, ${user.nome.split(' ')[0]}.`, 'Organize seus estudos e acompanhe suas atividades.'),
    hero('Continue avançando nos seus estudos.', `Você tem ${pendentes} ${pendentes === 1 ? 'atividade pendente' : 'atividades pendentes'} e ${compromissos} ${compromissos === 1 ? 'compromisso' : 'compromissos'}.`, 'Ver agora →', '/aluno/atividades'),
    estatisticas([
      ['Meus grupos', meusGrupos(user).length, 'neste semestre'],
      ['Compromissos', compromissos, 'na agenda'],
      ['Materiais', data().materiais.length, 'disponíveis'],
      ['Projetos', data().projetos.filter((p) => p.progresso < 100).length, 'em andamento'],
    ]),
    atividadesRecentes());
}

/* ---------- grupos ---------- */
function grupos() {
  return el('div', {}, cabecalho('COLABORAÇÃO', 'Explorar grupos', 'Encontre espaços para estudar e colaborar.'),
    el('div', { class: 'grade-3' }, data().grupos.map((g) => cartaoGrupo(g, 'Ver grupo', `/aluno/grupos/${g.id}`))));
}

function grupoDetalhe(user, { id }) {
  const g = porId('grupos', id);
  if (!g) return vazio('Grupo não encontrado.');
  const raiz = el('div');

  async function alternar() {
    const meu = g.participantes.find((p) => p.userId === user.id);
    if (meu && meu.status === 'ativo') g.participantes = g.participantes.filter((p) => p.userId !== user.id);
    else {
      if (contagem(g) >= g.limite) { toast('Este grupo atingiu o limite de participantes.', 'erro'); return; }
      if (meu) meu.status = 'ativo'; else g.participantes.push({ userId: user.id, status: 'ativo' });
    }
    try { await save(); toast(meu && meu.status === 'ativo' ? 'Você agora participa do grupo.' : 'Você saiu do grupo.'); } catch (e) { toast(e.message, 'erro'); }
    desenhar();
  }

  function desenhar() {
    const participa = g.participantes.some((p) => p.userId === user.id && p.status === 'ativo');
    const ativos = g.participantes.filter((p) => p.status === 'ativo').map((p) => porId('users', p.userId)).filter(Boolean);
    const eventos = data().eventos.filter((e) => e.grupoId === g.id).sort((a, b) => a.data.localeCompare(b.data));
    trocar(raiz, 
      voltar('Explorar grupos', '/aluno/grupos'),
      el('div', { class: 'cab' }, el('div', {}, selo(g.status, 'ok'), el('h1', { class: 'titulo' }, g.nome), el('p', { class: 'sub' }, `Prof. ${nomeProfessor(g)} · ${contagem(g)} participantes`)),
        el('button', { type: 'button', class: participa ? 'btn btn-sec' : 'btn btn-primario', onClick: alternar }, participa ? 'Sair do grupo' : 'Participar do grupo')),
      el('div', { class: 'grade-2' },
        el('section', { class: 'card' }, el('h2', { class: 'subtitulo' }, 'Sobre o grupo'), el('p', { class: 'texto' }, g.descricao),
          el('h2', { class: 'subtitulo espaco' }, 'Próximos encontros'),
          eventos.length ? el('div', { class: 'lista interna' }, eventos.map((e) => el('div', { class: 'linha' }, dataBox(e.data), el('div', { class: 'linha-texto' }, el('b', {}, e.titulo), el('div', { class: 'miudo' }, `${e.hora} · ${e.local}`))))) : vazio('Nenhum encontro agendado.')),
        el('section', { class: 'card' }, el('h2', { class: 'subtitulo' }, 'Participantes'),
          el('div', { class: 'lista interna' },
            el('div', { class: 'linha' }, el('div', { class: 'avatar' }, nomeProfessor(g).split(' ').map((p) => p[0]).slice(0, 2).join('')), el('div', { class: 'linha-texto' }, el('b', {}, nomeProfessor(g)), el('div', { class: 'miudo' }, 'Professor(a)'))),
            ativos.map((u) => el('div', { class: 'linha' }, el('div', { class: 'avatar' }, u.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')), el('div', { class: 'linha-texto' }, el('b', {}, u.nome), el('div', { class: 'miudo' }, `Aluno${u.curso ? ' · ' + u.curso : ''}`)))),
            g.outrosParticipantes ? el('div', { class: 'miudo' }, `+ ${g.outrosParticipantes} participantes`) : null))));
  }
  desenhar();
  return raiz;
}

/* ---------- agenda, materiais, projetos ---------- */
function agenda() {
  const eventos = [...data().eventos].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  return el('div', {}, cabecalho('ORGANIZAÇÃO ACADÊMICA', 'Agenda', 'Seus próximos compromissos e prazos.'),
    eventos.length ? el('div', { class: 'lista estreita' }, eventos.map((e) => el('div', { class: 'linha item' }, dataBox(e.data),
      el('div', { class: 'linha-texto' }, el('b', {}, e.titulo), el('div', { class: 'miudo' }, `${e.hora} · ${e.local}`))))) : vazio('Nenhum compromisso agendado.'));
}

function materiais() {
  return el('div', {}, cabecalho('CONTEÚDO ACADÊMICO', 'Materiais acadêmicos', 'Consulte os recursos disponíveis e seu contexto.'),
    lista(...data().materiais.map((m) => linha({ icone: 'materiais', titulo: m.titulo, sub: `${m.tipo} · ${m.tamanho}`,
      direita: [el('span', { class: 'miudo' }, `Adicionado em ${fmtBR(m.adicionado)}`), el('button', { type: 'button', class: 'btn btn-sec peq', onClick: () => toast(`Abrindo "${m.titulo}" (simulado na demonstração).`) }, 'Acessar')] }))));
}

function projetos() {
  const detalhe = (p) => modal({ titulo: p.nome, corpo: el('div', {}, el('p', { class: 'sub' }, p.descricao), barra(p.progresso), el('p', { class: 'miudo' }, `${p.progresso}% concluído`)), acoes: [{ rotulo: 'Fechar', primario: true, onClick: () => true }] });
  return el('div', {}, cabecalho('CONTEÚDO ACADÊMICO', 'Projetos', 'Acompanhe o andamento dos projetos.'),
    lista(...data().projetos.map((p) => linha({ icone: 'projetos', titulo: p.nome, sub: p.descricao,
      direita: [el('div', { class: 'progresso' }, barra(p.progresso), el('span', { class: 'miudo' }, `${p.progresso}% concluído`)), el('button', { type: 'button', class: 'btn btn-sec peq', onClick: () => detalhe(p) }, 'Acessar')] }))));
}

/* ---------- atividades e entrega ---------- */
function atividades(user) {
  return el('div', {}, cabecalho('CONTEÚDO ACADÊMICO', 'Atividades', 'Consulte os recursos disponíveis e seu contexto.'),
    lista(...[...data().atividades].sort((a, b) => a.entrega.localeCompare(b.entrega)).map((a) => linha({ icone: 'materiais', titulo: a.titulo, sub: a.disciplina,
      direita: [selo(entregaDe(user, a.id) ? 'Entregue' : 'Pendente', entregaDe(user, a.id) ? 'ok' : 'aviso'), el('span', { class: 'miudo' }, `Entrega ${fmtCurta(a.entrega)}`), el('a', { class: 'btn btn-sec peq', href: `#/aluno/atividades/${a.id}` }, 'Acessar')] }))));
}

function entrega(user, { id }) {
  const a = porId('atividades', id);
  if (!a) return vazio('Atividade não encontrada.');
  const raiz = el('div');
  const estado = { erros: {}, nomeArquivo: '', tamanhoMB: 0, link: '', comentario: '' };

  async function enviar(e) {
    e.preventDefault();
    const f = lerCampos(e.target);
    estado.link = (f.link || '').trim(); estado.comentario = f.comentario || '';
    const erros = {};
    if (!estado.nomeArquivo && !estado.link) erros.arquivo = 'Anexe um arquivo ou informe um link de acesso.';
    if (estado.tamanhoMB > LIMITE_MB) erros.arquivo = `O arquivo excede o limite de ${LIMITE_MB} MB. Reduza o tamanho ou envie um link de acesso.`;
    if (estado.link && !/^https?:\/\/\S+$/i.test(estado.link)) erros.link = 'Informe um link válido, começando com http:// ou https://.';
    estado.erros = erros;
    if (Object.keys(erros).length) { desenhar(); focarInvalido(raiz); return; }
    const anterior = entregaDe(user, a.id);
    const reg = { id: anterior ? anterior.id : uid('en'), atividadeId: a.id, alunoId: user.id, arquivoNome: estado.nomeArquivo, tamanhoMB: estado.tamanhoMB, link: estado.link, comentario: estado.comentario, enviadoEm: new Date().toISOString() };
    if (anterior) Object.assign(anterior, reg); else data().entregas.push(reg);
    try { await save(); toast('Atividade enviada com sucesso.'); } catch (err) { toast(err.message, 'erro'); }
    desenhar();
  }

  function desenhar() {
    const feita = entregaDe(user, a.id);
    const { erros } = estado;
    const arquivo = el('input', { type: 'file', name: 'arquivo', 'aria-label': 'Selecionar arquivo', onChange: (ev) => {
      const f = ev.target.files[0];
      estado.nomeArquivo = f ? f.name : ''; estado.tamanhoMB = f ? +(f.size / 1048576).toFixed(1) : 0;
      estado.erros = estado.tamanhoMB > LIMITE_MB ? { arquivo: `O arquivo excede o limite de ${LIMITE_MB} MB. Reduza o tamanho ou envie um link de acesso.` } : {};
      desenhar();
    } });
    trocar(raiz, 
      voltar('Atividades', '/aluno/atividades'),
      el('div', { class: 'eyebrow espaco' }, a.disciplina.toUpperCase()),
      el('div', { class: 'cab simples' }, el('h1', { class: 'titulo' }, a.titulo), selo(feita ? 'Entregue' : 'Pendente', feita ? 'ok' : 'aviso')),
      el('p', { class: 'sub' }, `Entrega até ${fmtCurta(a.entrega)} · ${a.hora} · ${a.local}`),
      erros.arquivo || erros.link ? alerta('erro', 'Não foi possível enviar a atividade.', erros.arquivo ? '' : erros.link) : null,
      el('div', { class: 'grade-2' },
        el('section', { class: 'card' }, el('h2', { class: 'subtitulo' }, 'Instruções'), el('p', { class: 'texto' }, a.instrucoes)),
        el('form', { class: 'card coluna', novalidate: true, onSubmit: enviar },
          el('h2', { class: 'subtitulo' }, 'Sua entrega'),
          feita ? alerta('ok', `Entrega enviada em ${fmtBR(feita.enviadoEm.slice(0, 10))}.`, 'Você pode substituí-la enviando novamente.') : null,
          el('label', { class: `solta${erros.arquivo ? ' invalido' : ''}` }, el('b', {}, 'Selecionar arquivo'), ' ou arraste até aqui', arquivo),
          estado.nomeArquivo ? el('div', { class: `arquivo${estado.tamanhoMB > LIMITE_MB ? ' invalido' : ''}` }, el('b', {}, estado.nomeArquivo), el('span', { class: 'miudo' }, estado.tamanhoMB > LIMITE_MB ? `${estado.tamanhoMB} MB · acima do limite de ${LIMITE_MB} MB` : `${estado.tamanhoMB} MB`)) : null,
          erros.arquivo ? el('span', { class: 'erro-msg' }, '! ' + erros.arquivo) : null,
          campo('Link de acesso (opcional)', input({ name: 'link', type: 'url', placeholder: 'https://...', value: estado.link }, erros.link), erros.link),
          campo('Comentário (opcional)', input({ tag: 'textarea', name: 'comentario', placeholder: 'Escreva um recado para o professor...', value: estado.comentario })),
          el('p', { class: 'miudo' }, 'Protótipo: o conteúdo do arquivo não é armazenado, apenas o nome e o tamanho.'),
          el('button', { type: 'submit', class: 'btn btn-primario' }, erros.arquivo ? 'Tentar enviar novamente' : feita ? 'Enviar novamente →' : 'Enviar atividade →'))));
  }
  desenhar();
  return raiz;
}

/* ---------- videoaulas ---------- */
function videoaulas() {
  const gradientes = ['linear-gradient(120deg,#005c6d,#2bb8c9)', 'linear-gradient(120deg,#373737,#888)', 'linear-gradient(120deg,#8a0000,#c20000)'];
  return el('div', {}, cabecalho('APRENDIZADO', 'Videoaulas', 'Materiais publicados pelos professores, com legendas e transcrição.'),
    el('div', { class: 'grade-3' }, [...data().videoaulas].sort((a, b) => a.numero - b.numero).map((v, i) =>
      el('article', { class: 'card video item' },
        el('div', { class: 'miniatura', style: { background: gradientes[i % gradientes.length] } }, icon('play', 34)),
        el('div', { class: 'eyebrow' }, `Aula ${v.numero}`), el('h3', {}, v.titulo), el('p', { class: 'miudo' }, v.descricao),
        el('a', { class: 'btn btn-sec', href: `#/aluno/videoaulas/${v.id}` }, 'Assistir')))));
}

function player(user, { id }) {
  const v = porId('videoaulas', id);
  if (!v) return vazio('Videoaula não encontrada.');
  const estado = { t: 0, tocando: false, legendas: true, vel: 1 };
  const raiz = el('div');
  let timer = null;

  const falaAtual = () => [...v.transcricao].reverse().find((s) => s.t <= estado.t) || v.transcricao[0];
  function tick() {
    if (!raiz.isConnected) { clearInterval(timer); return; }
    estado.t = Math.min(v.duracao, estado.t + estado.vel);
    if (estado.t >= v.duracao) { estado.tocando = false; clearInterval(timer); }
    desenhar();
  }
  function alternarPlay() {
    estado.tocando = !estado.tocando; clearInterval(timer);
    if (estado.tocando) { if (estado.t >= v.duracao) estado.t = 0; timer = setInterval(tick, 1000); }
    desenhar();
  }
  function baixar() {
    const txt = `${v.titulo}\n\n` + v.transcricao.map((s) => `${fmtTempo(s.t)}  ${s.texto}`).join('\n');
    const a = el('a', { href: URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' })), download: `transcricao-aula-${v.numero}.txt` });
    document.body.append(a); a.click(); a.remove();
  }

  function desenhar() {
    trocar(raiz, 
      voltar('Videoaulas', '/aluno/videoaulas'),
      el('div', { class: 'palco', id: 'palco' },
        el('button', { type: 'button', class: 'palco-play', 'aria-label': estado.tocando ? 'Pausar' : 'Reproduzir', onClick: alternarPlay }, icon(estado.tocando ? 'pausa' : 'play', 34)),
        estado.legendas ? el('div', { class: 'legenda' }, falaAtual().texto) : null,
        el('div', { class: 'controles' },
          el('button', { type: 'button', class: 'icone-btn claro', 'aria-label': estado.tocando ? 'Pausar' : 'Reproduzir', onClick: alternarPlay }, icon(estado.tocando ? 'pausa' : 'play', 18)),
          el('input', { type: 'range', min: 0, max: v.duracao, value: estado.t, 'aria-label': 'Progresso do vídeo', onInput: (e) => { estado.t = +e.target.value; desenhar(); } }),
          el('span', { class: 'tempo' }, `${fmtTempo(estado.t)} / ${fmtTempo(v.duracao)}`),
          el('button', { type: 'button', class: 'btn-claro-mini', onClick: () => { estado.legendas = !estado.legendas; desenhar(); }, 'aria-pressed': String(estado.legendas) }, 'Legendas'),
          el('button', { type: 'button', class: 'btn-claro-mini', onClick: () => { estado.vel = estado.vel === 1 ? 1.5 : estado.vel === 1.5 ? 2 : 1; desenhar(); } }, `${estado.vel}x`),
          el('button', { type: 'button', class: 'btn-claro-mini', onClick: () => { const p = document.getElementById('palco'); if (document.fullscreenElement) document.exitFullscreen(); else if (p && p.requestFullscreen) p.requestFullscreen(); } }, 'Tela cheia'))),
      el('div', { class: 'cab' }, el('div', {}, el('div', { class: 'eyebrow' }, `Aula ${v.numero}`), el('h1', { class: 'titulo' }, v.titulo), el('p', { class: 'sub' }, `${v.descricao} · ${v.disciplina}`)),
        el('div', { class: 'acoes' }, selo(estado.legendas ? 'Legendas ativadas' : 'Legendas desativadas', 'ok'),
          el('button', { type: 'button', class: 'btn btn-sec', onClick: baixar }, 'Baixar transcrição'),
          el('a', { class: 'btn btn-primario', href: `#/aluno/agentes?disciplina=${encodeURIComponent(v.disciplina)}` }, 'Perguntar ao agente'))),
      el('section', { class: 'card' }, el('h2', { class: 'subtitulo' }, 'Transcrição'),
        el('div', { class: 'lista interna' }, v.transcricao.map((s) => el('button', { type: 'button', class: `transc${falaAtual() === s ? ' on' : ''}`, onClick: () => { estado.t = s.t; desenhar(); } }, el('b', {}, fmtTempo(s.t)), ' ', s.texto)))));
  }
  desenhar();
  return raiz;
}

/* ---------- agentes de estudo ---------- */
function agentes(user, _p, consulta) {
  const disciplinas = data().disciplinas;
  const pedida = consulta && consulta.get('disciplina');
  const estado = { disc: disciplinas.includes(pedida) ? pedida : disciplinas[0] };
  const raiz = el('div', { class: 'coluna-cheia' });

  const agente = (disc) => {
    let a = data().agentes.find((x) => x.alunoId === user.id && x.disciplina === disc);
    if (!a) { a = { id: uid('ag'), alunoId: user.id, disciplina: disc, materiais: [], mensagens: [] }; data().agentes.push(a); }
    return a;
  };
  async function dizer(a, texto) {
    const nomes = a.materiais.map((m) => m.nome).join(', ');
    let resp;
    if (!a.materiais.length) resp = 'Anexe pelo menos um material desta disciplina para eu poder ajudar.';
    else resp = `Materiais considerados: ${nomes}. Protótipo: a leitura do conteúdo e a resposta sobre "${texto}" exigirão integração com armazenamento e um modelo de IA.`;
    a.mensagens.push({ autor: 'eu', texto }, { autor: 'bot', texto: resp });
    try { await save(); } catch (e) { toast(e.message, 'erro'); }
    desenhar();
  }

  function desenhar() {
    const a = agente(estado.disc);
    const campoMsg = el('input', { class: 'in', type: 'text', placeholder: 'Pergunte sobre os materiais desta disciplina...', 'aria-label': 'Mensagem' });
    const anexo = el('input', { type: 'file', hidden: true, onChange: async (e) => {
      const f = e.target.files[0]; if (!f) return;
      a.materiais.push({ nome: f.name, tamanhoMB: +(f.size / 1048576).toFixed(1) });
      try { await save(); toast('Material anexado.'); } catch (err) { toast(err.message, 'erro'); }
      desenhar();
    } });
    const bolhas = [el('div', { class: 'bolha bolha-bot' }, `Olá! Sou o agente de ${estado.disc}. Anexe seus materiais e peça resumos, questões ou explicações.`), ...a.mensagens.map((m) => el('div', { class: `bolha bolha-${m.autor}` }, m.texto))];
    trocar(raiz, 
      cabecalho('ESTUDO PERSONALIZADO', 'Meus agentes', 'Crie uma base de estudos para cada disciplina usando seus próprios materiais.'),
      el('div', { class: 'seletor' }, disciplinas.map((d) => {
        const n = data().agentes.find((x) => x.alunoId === user.id && x.disciplina === d);
        return el('button', { type: 'button', class: d === estado.disc ? 'on' : '', onClick: () => { estado.disc = d; desenhar(); } }, el('b', {}, d), el('div', { class: 'miudo' }, `${n ? n.materiais.length : 0} ${n && n.materiais.length === 1 ? 'material' : 'materiais'}`));
      })),
      el('section', { class: 'card agente' },
        el('div', { class: 'agente-cab' }, el('div', { class: 'ic acc' }, icon('chat')), el('div', { class: 'linha-texto' }, el('b', {}, `Agente de ${estado.disc}`), el('div', { class: 'miudo' }, 'Assistente de estudos da disciplina')),
          el('button', { type: 'button', class: 'btn btn-sec peq', onClick: () => anexo.click() }, 'Anexar material'), anexo),
        a.materiais.length ? el('div', { class: 'anexos' }, a.materiais.map((m) => el('span', { class: 'anexo' }, m.nome))) : null,
        el('div', { class: 'agente-chat' }, bolhas),
        el('div', { class: 'chips' }, ['Resumir materiais', 'Criar questões', 'Explicar conceitos'].map((c) => el('button', { type: 'button', class: 'chip', onClick: () => dizer(a, c) }, c))),
        el('form', { class: 'chat-form', onSubmit: (e) => { e.preventDefault(); if (campoMsg.value.trim()) dizer(a, campoMsg.value.trim()); } }, campoMsg, el('button', { class: 'btn btn-primario', type: 'submit', 'aria-label': 'Enviar' }, '→')),
        el('p', { class: 'miudo' }, 'Protótipo: o nome dos arquivos fica salvo no banco, mas o conteúdo não é lido. A leitura exigirá integração com armazenamento e um modelo de IA.')));
  }
  desenhar();
  return raiz;
}

/* ---------- feedback ---------- */
function feedback(user) {
  const estado = { enviado: false, erros: {}, assunto: 'Navegação', mensagem: '' };
  const raiz = el('div');

  async function enviar(e) {
    e.preventDefault();
    const f = lerCampos(e.target);
    estado.assunto = f.assunto; estado.mensagem = f.mensagem || '';
    const erros = {};
    if (estado.mensagem.trim().length < 10) erros.mensagem = 'Escreva ao menos 10 caracteres para descrever sua sugestão.';
    estado.erros = erros;
    if (Object.keys(erros).length) { desenhar(); focarInvalido(raiz); return; }
    data().feedbacks.push({ id: uid('f'), userId: user.id, assunto: estado.assunto, mensagem: estado.mensagem.trim(), data: hojeISO() });
    try { await save(); estado.enviado = true; estado.mensagem = ''; } catch (err) { toast(err.message, 'erro'); }
    desenhar();
  }

  function desenhar() {
    if (estado.enviado) {
      trocar(raiz, el('div', { class: 'centralizado' }, el('div', { class: 'card sucesso' },
        el('div', { class: 'ic-grande' }, icon('ok', 26)), el('div', { class: 'eyebrow' }, 'OBRIGADO'), el('h1', { class: 'titulo' }, 'Feedback enviado'),
        el('p', { class: 'sub' }, 'Recebemos sua sugestão. Esta é uma confirmação simulada da demonstração acadêmica.'),
        el('a', { class: 'btn btn-primario', href: '#/aluno' }, 'Voltar ao início'),
        el('button', { type: 'button', class: 'link', onClick: () => { estado.enviado = false; desenhar(); } }, 'Enviar outro feedback'))));
      return;
    }
    const { erros } = estado;
    trocar(raiz, cabecalho('SUA OPINIÃO IMPORTA', 'Enviar feedback', 'Conte como podemos melhorar sua experiência.'),
      erros.mensagem ? alerta('erro', 'Não foi possível enviar o feedback.', 'Revise o campo destacado.') : null,
      el('form', { class: 'card coluna formulario', novalidate: true, onSubmit: enviar },
        campo('Assunto', el('select', { class: 'in', name: 'assunto', value: estado.assunto }, ['Navegação', 'Conteúdo', 'Acessibilidade', 'Outro'].map((o) => el('option', { value: o }, o)))),
        campo('Mensagem', input({ tag: 'textarea', name: 'mensagem', placeholder: 'Descreva sua sugestão...', class: 'alta', value: estado.mensagem }, erros.mensagem), erros.mensagem),
        el('button', { type: 'submit', class: 'btn btn-primario' }, 'Enviar feedback')));
  }
  desenhar();
  return raiz;
}

return { inicio, grupos, grupoDetalhe, agenda, materiais, projetos, atividades, entrega, videoaulas, player, agentes, feedback };
})();

__m["prof"] = (function () {
// Área do professor.
const { el, trocar } = __m["dom"];
const { data, save, uid, porId } = __m["store"];
const { go, cabecalho, voltar, toast, modal, confirmar, campo, input, alerta, focarInvalido, lerCampos, fmtCurta, fmtBR, hojeISO } = __m["ui"];
const { lista, linha, selo, barra, estatisticas, hero, atividadesRecentes, cartaoGrupo, contagem, nomeProfessor, vazio } = __m["comum"];

const gravar = async (msg) => { try { await save(); if (msg) toast(msg); return true; } catch (e) { toast(e.message, 'erro'); return false; } };
const contar = (erros) => Object.keys(erros).length;
const resumo = (erros, titulo, texto) => (contar(erros) ? alerta('erro', titulo || `Revise ${contar(erros)} ${contar(erros) === 1 ? 'campo' : 'campos'}.`, texto) : null);

/* ---------- dashboard ---------- */
function dashboard(user) {
  const revisar = data().entregas.length;
  return el('div', {},
    cabecalho('ÁREA DO PROFESSOR', 'Dashboard acadêmico', 'Gerencie conteúdos e acompanhe suas turmas.'),
    hero('Tudo pronto para orientar suas turmas.', `Você tem ${revisar} ${revisar === 1 ? 'entrega' : 'entregas'} de alunos para revisar.`, 'Ver agora →', '/professor/atividades'),
    estatisticas([
      ['Grupos ativos', data().grupos.filter((g) => g.status === 'Em andamento').length, 'neste semestre'],
      ['Atividades', data().atividades.length, 'publicadas'],
      ['Materiais', data().materiais.length, 'disponíveis'],
      ['Projetos', data().projetos.length, 'cadastrados'],
    ]),
    atividadesRecentes());
}

/* ---------- grupos ---------- */
function grupos() {
  return el('div', {}, cabecalho('GERENCIAMENTO', 'Gerenciar grupos', 'Consulte e gerencie os registros autorizados.', el('a', { class: 'btn btn-primario', href: '#/professor/grupos/novo' }, 'Novo registro')),
    el('div', { class: 'grade-3' }, data().grupos.map((g) => cartaoGrupo(g, 'Gerenciar', `/professor/grupos/${g.id}`))));
}

function grupoForm(user, { id }) {
  const g = id ? porId('grupos', id) : null;
  if (id && !g) return vazio('Grupo não encontrado.');
  const estado = { erros: {}, v: g ? { nome: g.nome, disciplina: g.disciplina, limite: String(g.limite), descricao: g.descricao, status: g.status } : { nome: '', disciplina: data().disciplinas[0], limite: '', descricao: '', status: 'Em andamento' } };
  const raiz = el('div');

  async function enviar(e) {
    e.preventDefault();
    estado.v = { ...estado.v, ...lerCampos(e.target) };
    const { nome, limite } = estado.v; const erros = {};
    if (nome.trim().length < 3) erros.nome = 'Informe o nome do grupo.';
    const n = Number(limite);
    if (!limite.trim()) erros.limite = 'Campo obrigatório.';
    else if (!Number.isInteger(n) || n < 1 || n > 200) erros.limite = 'Informe um número inteiro entre 1 e 200.';
    else if (g && n < contagem(g)) erros.limite = `O grupo já tem ${contagem(g)} participantes.`;
    estado.erros = erros;
    if (contar(erros)) { desenhar(); focarInvalido(raiz); return; }
    const campos = { nome: nome.trim(), disciplina: estado.v.disciplina, limite: n, descricao: estado.v.descricao.trim() || 'Sem descrição.', status: estado.v.status };
    if (g) Object.assign(g, campos);
    else data().grupos.push({ id: uid('g'), professorId: user.id, outrosParticipantes: 0, participantes: [], ...campos });
    if (await gravar(g ? 'Grupo atualizado.' : 'Grupo criado.')) go(g ? `/professor/grupos/${g.id}` : '/professor/grupos');
  }

  function desenhar() {
    const { erros, v } = estado;
    trocar(raiz, voltar('Gerenciar grupos', g ? `/professor/grupos/${g.id}` : '/professor/grupos'),
      cabecalho('GERENCIAMENTO', g ? 'Editar grupo' : 'Novo registro', g ? 'Atualize os dados do grupo.' : 'Crie um grupo de estudos para uma disciplina.'),
      resumo(erros, null, 'O grupo não foi salvo.'),
      el('form', { class: 'card coluna formulario', novalidate: true, onSubmit: enviar },
        campo('Nome do grupo', input({ name: 'nome', type: 'text', placeholder: 'Ex.: Desenvolvimento Web', value: v.nome }, erros.nome), erros.nome),
        campo('Disciplina', el('select', { class: 'in', name: 'disciplina', value: v.disciplina }, data().disciplinas.map((d) => el('option', { value: d }, d)))),
        campo('Limite de participantes', input({ name: 'limite', type: 'number', min: 1, placeholder: 'Ex.: 30', value: v.limite }, erros.limite), erros.limite),
        campo('Descrição', input({ tag: 'textarea', name: 'descricao', placeholder: 'Descreva o objetivo do grupo...', value: v.descricao })),
        campo('Status', el('select', { class: 'in', name: 'status', value: v.status }, ['Em andamento', 'Rascunho'].map((s) => el('option', { value: s }, s)))),
        el('div', { class: 'acoes' }, el('button', { type: 'submit', class: 'btn btn-primario' }, g ? 'Salvar alterações' : 'Criar grupo'), el('a', { class: 'btn btn-sec', href: g ? `#/professor/grupos/${g.id}` : '#/professor/grupos' }, 'Cancelar'))));
  }
  desenhar();
  return raiz;
}

function gerenciarGrupo(user, { id }) {
  const g = porId('grupos', id);
  if (!g) return vazio('Grupo não encontrado.');
  const raiz = el('div');

  function convidar() {
    let email; let erro = null; const dica = el('span', { class: 'erro-msg', hidden: true });
    email = input({ type: 'email', placeholder: 'aluno@fatec.sp.gov.br', 'aria-label': 'E-mail institucional do aluno' });
    modal({ titulo: 'Convidar aluno', corpo: el('div', { class: 'coluna' }, campo('E-mail institucional do aluno', email), dica), acoes: [
      { rotulo: 'Cancelar', onClick: () => true },
      { rotulo: 'Enviar convite', primario: true, onClick: () => {
        const aluno = data().users.find((u) => u.tipo === 'aluno' && u.email === email.value.trim().toLowerCase());
        if (!aluno) erro = 'Nenhum aluno cadastrado com esse e-mail.';
        else if (g.participantes.some((p) => p.userId === aluno.id)) erro = 'Este aluno já está no grupo ou já foi convidado.';
        else erro = null;
        if (erro) { dica.textContent = '! ' + erro; dica.hidden = false; email.setAttribute('aria-invalid', 'true'); email.focus(); return false; }
        g.participantes.push({ userId: aluno.id, status: 'convite' });
        gravar('Convite enviado.').then(desenhar);
        return true;
      } }] });
  }

  function remover(p, u) {
    const pendente = p.status === 'convite';
    confirmar(pendente ? 'Cancelar convite' : 'Remover participante', `${pendente ? 'Cancelar o convite de' : 'Remover'} ${u.nome}?`, pendente ? 'Cancelar convite' : 'Remover', async () => {
      g.participantes = g.participantes.filter((x) => x !== p); await gravar(pendente ? 'Convite cancelado.' : 'Participante removido.'); desenhar();
    });
  }

  function excluir() {
    confirmar('Excluir grupo', `Excluir o grupo "${g.nome}"? Os encontros ligados a ele também serão removidos.`, 'Excluir', async () => {
      data().grupos = data().grupos.filter((x) => x.id !== g.id); data().eventos = data().eventos.filter((e) => e.grupoId !== g.id);
      if (await gravar('Grupo excluído.')) go('/professor/grupos');
    });
  }

  function desenhar() {
    trocar(raiz, voltar('Gerenciar grupos', '/professor/grupos'),
      cabecalho('GERENCIAMENTO', g.nome, `Prof. ${nomeProfessor(g)} · ${contagem(g)} participantes · ${g.status}`,
        el('div', { class: 'acoes' }, el('a', { class: 'btn btn-sec', href: `#/professor/grupos/${g.id}/editar` }, 'Editar grupo'), el('button', { type: 'button', class: 'btn btn-primario', onClick: convidar }, 'Convidar aluno'))),
      el('section', { class: 'card' }, el('h2', { class: 'subtitulo' }, 'Participantes'),
        g.participantes.length ? el('div', { class: 'lista interna' }, g.participantes.map((p) => {
          const u = porId('users', p.userId); if (!u) return null;
          return el('div', { class: 'linha item' }, el('div', { class: 'avatar' }, u.nome.split(' ').map((x) => x[0]).slice(0, 2).join('')),
            el('div', { class: 'linha-texto' }, el('b', {}, u.nome), el('div', { class: 'miudo' }, `Aluno${u.curso ? ' · ' + u.curso : ''}`)),
            selo(p.status === 'ativo' ? 'Ativo' : 'Convite pendente', p.status === 'ativo' ? 'ok' : 'aviso'),
            el('button', { type: 'button', class: 'btn btn-sec peq', onClick: () => remover(p, u) }, p.status === 'ativo' ? 'Remover' : 'Cancelar convite'));
        })) : vazio('Nenhum participante cadastrado ainda.'),
        g.outrosParticipantes ? el('p', { class: 'miudo' }, `+ ${g.outrosParticipantes} participantes de demonstração`) : null),
      el('div', { class: 'perigo' }, el('button', { type: 'button', class: 'btn btn-perigo', onClick: excluir }, 'Excluir grupo')));
  }
  desenhar();
  return raiz;
}

/* ---------- atividades ---------- */
function atividades() {
  return el('div', {}, cabecalho('GERENCIAMENTO ACADÊMICO', 'Gerenciar atividades', 'Consulte os recursos disponíveis e seu contexto.', el('a', { class: 'btn btn-primario', href: '#/professor/atividades/nova' }, 'Novo item')),
    data().atividades.length ? lista(...[...data().atividades].sort((a, b) => a.entrega.localeCompare(b.entrega)).map((a) => {
      const n = data().entregas.filter((e) => e.atividadeId === a.id).length;
      return linha({ icone: 'materiais', titulo: a.titulo, sub: `${a.disciplina} · ${n} ${n === 1 ? 'entrega recebida' : 'entregas recebidas'}`,
        direita: [el('span', { class: 'miudo' }, `Entrega ${fmtCurta(a.entrega)}`), el('a', { class: 'btn btn-sec peq', href: `#/professor/atividades/${a.id}/editar` }, 'Gerenciar')] });
    })) : vazio('Nenhuma atividade cadastrada.'));
}

function atividadeForm(user, { id }) {
  const a = id ? porId('atividades', id) : null;
  if (id && !a) return vazio('Atividade não encontrada.');
  const estado = { erros: {}, v: a ? { titulo: a.titulo, disciplina: a.disciplina, entrega: a.entrega, instrucoes: a.instrucoes } : { titulo: '', disciplina: '', entrega: '', instrucoes: '' }, anexo: a ? a.anexo || '' : '' };
  const raiz = el('div');

  async function enviar(e) {
    e.preventDefault();
    estado.v = { ...estado.v, ...lerCampos(e.target) };
    const { titulo, disciplina, entrega } = estado.v; const erros = {};
    if (!titulo.trim()) erros.titulo = 'Campo obrigatório.';
    if (!disciplina) erros.disciplina = 'Selecione uma disciplina.';
    if (!entrega) erros.entrega = 'Informe a data de entrega.';
    else if (entrega < hojeISO() && !(a && a.entrega === entrega)) erros.entrega = 'A data não pode estar no passado.';
    estado.erros = erros;
    if (contar(erros)) { desenhar(); focarInvalido(raiz); return; }
    const campos = { titulo: titulo.trim(), disciplina, entrega, instrucoes: estado.v.instrucoes.trim() || 'Instruções a definir pelo professor.', anexo: estado.anexo };
    if (a) Object.assign(a, campos); else data().atividades.push({ id: uid('a'), hora: '23:59', local: 'Ambiente virtual', criadoPor: user.id, criadoEm: hojeISO(), ...campos });
    if (await gravar(a ? 'Atividade atualizada.' : 'Atividade publicada.')) go('/professor/atividades');
  }

  function excluir() {
    confirmar('Excluir atividade', `Excluir "${a.titulo}" e as entregas recebidas?`, 'Excluir', async () => {
      data().atividades = data().atividades.filter((x) => x.id !== a.id); data().entregas = data().entregas.filter((x) => x.atividadeId !== a.id);
      if (await gravar('Atividade excluída.')) go('/professor/atividades');
    });
  }

  function desenhar() {
    const { erros, v } = estado;
    const numErros = contar(erros);
    trocar(raiz, voltar('Gerenciar atividades', '/professor/atividades'),
      cabecalho('GERENCIAMENTO ACADÊMICO', a ? 'Editar item' : 'Novo item', 'Cadastre uma atividade para as turmas.'),
      numErros ? alerta('erro', 'A atividade não foi publicada.', `Corrija ${numErros === 1 ? 'o campo destacado' : `os ${numErros} campos destacados`}.`) : null,
      el('form', { class: 'card coluna formulario', novalidate: true, onSubmit: enviar },
        campo('Título da atividade', input({ name: 'titulo', type: 'text', placeholder: 'Ex.: Lista de exercícios React', value: v.titulo }, erros.titulo), erros.titulo),
        el('div', { class: 'duas-colunas' },
          campo('Disciplina', input({ tag: 'select', name: 'disciplina', value: v.disciplina }, erros.disciplina), erros.disciplina),
          campo('Data de entrega', input({ name: 'entrega', type: 'date', value: v.entrega }, erros.entrega), erros.entrega)),
        campo('Instruções', input({ tag: 'textarea', name: 'instrucoes', placeholder: 'Descreva o que o aluno deve entregar...', value: v.instrucoes })),
        el('label', { class: 'campo' }, 'Anexar material de apoio', el('input', { type: 'file', onChange: (e) => { estado.anexo = e.target.files[0] ? e.target.files[0].name : ''; } }), estado.anexo ? el('span', { class: 'miudo' }, `Arquivo: ${estado.anexo}`) : null),
        el('div', { class: 'acoes' }, el('button', { type: 'submit', class: 'btn btn-primario' }, a ? 'Salvar alterações' : 'Publicar atividade'), el('a', { class: 'btn btn-sec', href: '#/professor/atividades' }, 'Cancelar'),
          a ? el('button', { type: 'button', class: 'btn btn-perigo', onClick: excluir }, 'Excluir') : null)));
    // <select> precisa das opções: inclui após montar
    const sel = raiz.querySelector('select[name="disciplina"]');
    sel.append(el('option', { value: '' }, 'Selecione uma disciplina'), ...data().disciplinas.map((d) => el('option', { value: d }, d)));
    sel.value = v.disciplina;
  }
  desenhar();
  return raiz;
}

/* ---------- projetos ---------- */
function projetos() {
  const raiz = el('div');

  function editar(p) {
    const nome = input({ type: 'text', value: p ? p.nome : '', placeholder: 'Nome do projeto', 'aria-label': 'Nome do projeto' });
    const desc = input({ type: 'text', value: p ? p.descricao : '', placeholder: 'Descrição curta', 'aria-label': 'Descrição' });
    const valor = el('output', {}, `${p ? p.progresso : 0}%`);
    const prog = el('input', { type: 'range', min: 0, max: 100, step: 5, value: p ? p.progresso : 0, 'aria-label': 'Progresso', onInput: () => { valor.textContent = prog.value + '%'; } });
    const dica = el('span', { class: 'erro-msg', hidden: true }, '! Informe o nome do projeto.');
    const acoes = [{ rotulo: 'Cancelar', onClick: () => true }];
    if (p) acoes.push({ rotulo: 'Excluir', onClick: () => { data().projetos = data().projetos.filter((x) => x.id !== p.id); gravar('Projeto excluído.').then(desenhar); return true; } });
    acoes.push({ rotulo: 'Salvar', primario: true, onClick: () => {
      if (!nome.value.trim()) { dica.hidden = false; nome.setAttribute('aria-invalid', 'true'); nome.focus(); return false; }
      const campos = { nome: nome.value.trim(), descricao: desc.value.trim() || 'Sem descrição', progresso: Number(prog.value) };
      if (p) Object.assign(p, campos); else data().projetos.push({ id: uid('p'), ...campos });
      gravar('Projeto salvo.').then(desenhar); return true;
    } });
    modal({ titulo: p ? 'Gerenciar projeto' : 'Novo projeto', corpo: el('div', { class: 'coluna' }, campo('Nome', nome), dica, campo('Descrição', desc), campo('Progresso', el('div', { class: 'faixa' }, prog, valor))), acoes });
  }

  function desenhar() {
    trocar(raiz, cabecalho('GERENCIAMENTO ACADÊMICO', 'Gerenciar projetos', 'Consulte os recursos disponíveis e seu contexto.', el('button', { type: 'button', class: 'btn btn-primario', onClick: () => editar(null) }, 'Novo item')),
      data().projetos.length ? lista(...data().projetos.map((p) => linha({ icone: 'projetos', titulo: p.nome, sub: p.descricao,
        direita: [el('div', { class: 'progresso' }, barra(p.progresso), el('span', { class: 'miudo' }, `${p.progresso}% concluído`)), el('button', { type: 'button', class: 'btn btn-sec peq', onClick: () => editar(p) }, 'Gerenciar')] }))) : vazio('Nenhum projeto cadastrado.'));
  }
  desenhar();
  return raiz;
}

/* ---------- videoaula ---------- */
function duracaoDoArquivo(arquivo) {
  return new Promise((resolve) => {
    const v = document.createElement('video'); const url = URL.createObjectURL(arquivo);
    const fim = (s) => { URL.revokeObjectURL(url); resolve(s); };
    const t = setTimeout(() => fim(600), 1500);
    v.preload = 'metadata';
    v.onloadedmetadata = () => { clearTimeout(t); fim(Number.isFinite(v.duration) && v.duration > 0 ? Math.round(v.duration) : 600); };
    v.onerror = () => { clearTimeout(t); fim(600); };
    v.src = url;
  });
}

function videoaula(user) {
  const estado = { publicada: false, erros: {}, v: { titulo: '', disciplina: data().disciplinas[0], descricao: '', legendas: false }, arquivo: null };
  const raiz = el('div');

  async function enviar(e) {
    e.preventDefault();
    const f = lerCampos(e.target);
    estado.v = { titulo: f.titulo || '', disciplina: f.disciplina, descricao: f.descricao || '', legendas: !!f.legendas };
    const erros = {};
    if (!estado.v.titulo.trim()) erros.titulo = 'Campo obrigatório.';
    if (!estado.arquivo) erros.arquivo = 'Selecione o arquivo do vídeo.';
    if (!estado.v.legendas) erros.legendas = 'Marque a confirmação de acessibilidade para publicar.';
    estado.erros = erros;
    if (contar(erros)) { desenhar(); focarInvalido(raiz); return; }
    const duracao = await duracaoDoArquivo(estado.arquivo);
    const numero = data().videoaulas.reduce((m, x) => Math.max(m, x.numero), 0) + 1;
    data().videoaulas.push({ id: uid('v'), numero, titulo: estado.v.titulo.trim(), disciplina: estado.v.disciplina, duracao, descricao: estado.v.descricao.trim() || 'Videoaula acessível · Material de estudo', arquivoNome: estado.arquivo.name, publicadoPor: user.id, transcricao: [{ t: 0, texto: 'Transcrição ainda não anexada.' }] });
    if (await gravar()) { estado.publicada = true; estado.arquivo = null; estado.v = { titulo: '', disciplina: data().disciplinas[0], descricao: '', legendas: false }; }
    desenhar();
  }

  function desenhar() {
    if (estado.publicada) {
      const todas = [...data().videoaulas].sort((a, b) => a.numero - b.numero);
      trocar(raiz, cabecalho('MATERIAL DE ESTUDO', 'Publicar videoaula'),
        alerta('ok', 'Videoaula publicada com sucesso.', 'Ela já está disponível para os alunos da disciplina. Confirmação simulada da demonstração acadêmica.'),
        el('section', { class: 'card' }, el('h2', { class: 'subtitulo' }, 'Conteúdos publicados'), el('p', { class: 'sub' }, `${todas.length} videoaulas disponíveis`),
          el('div', { class: 'lista interna' }, todas.map((v) => el('div', { class: 'linha' }, el('div', { class: 'linha-texto' }, el('b', {}, v.titulo), el('div', { class: 'miudo' }, `Publicado · Aula ${v.numero}`)))))),
        el('div', { class: 'acoes espaco' }, el('button', { type: 'button', class: 'btn btn-primario', onClick: () => { estado.publicada = false; desenhar(); } }, 'Publicar outra aula'), el('a', { class: 'btn btn-sec', href: '#/professor' }, 'Voltar ao dashboard')));
      return;
    }
    const { erros, v } = estado;
    trocar(raiz, cabecalho('MATERIAL DE ESTUDO', 'Publicar videoaula', 'Envie uma aula para disponibilizá-la na biblioteca dos alunos.'),
      contar(erros) ? alerta('erro', 'A videoaula não foi publicada.', 'Revise os itens destacados.') : null,
      el('form', { class: 'card coluna formulario', novalidate: true, onSubmit: enviar },
        el('h2', { class: 'subtitulo' }, 'Nova videoaula'),
        campo('Título da aula', input({ name: 'titulo', type: 'text', placeholder: 'Ex.: Introdução ao React', value: v.titulo }, erros.titulo), erros.titulo),
        campo('Disciplina', el('select', { class: 'in', name: 'disciplina', value: v.disciplina }, data().disciplinas.map((d) => el('option', { value: d }, d)))),
        campo('Arquivo do vídeo', el('input', { type: 'file', name: 'arquivo', accept: 'video/*', 'aria-invalid': erros.arquivo ? 'true' : null, onChange: (e) => { estado.arquivo = e.target.files[0] || null; } }), erros.arquivo),
        campo('Descrição', input({ tag: 'textarea', name: 'descricao', placeholder: 'Apresente o conteúdo e os objetivos desta aula.', value: v.descricao })),
        el('div', { class: 'coluna miudo-gap' }, el('label', { class: 'check' }, el('input', { type: 'checkbox', name: 'legendas', checked: v.legendas, 'aria-invalid': erros.legendas ? 'true' : null }), ' Confirmo que o vídeo possui legendas ou transcrição.'),
          erros.legendas ? el('span', { class: 'erro-msg' }, '! ' + erros.legendas) : null),
        el('div', { class: 'acoes' }, el('button', { type: 'submit', class: 'btn btn-primario' }, contar(erros) ? 'Tentar publicar novamente' : 'Publicar para os alunos →'))));
  }
  desenhar();
  return raiz;
}

/* ---------- relatórios ---------- */
function relatorios() {
  const r = data().relatorios;
  const eng = r.engajamento.map((e) => [porId('grupos', e.grupoId), e.valor]).filter(([g]) => g);
  const fb = [...data().feedbacks].reverse();
  return el('div', {}, cabecalho('ACOMPANHAMENTO', 'Relatórios acadêmicos', 'Informações demonstrativas do semestre atual.'),
    estatisticas([['Participação média', r.participacaoMedia + '%', 'dados de demonstração'], ['Atividades entregues', r.atividadesEntregues + '%', 'dados de demonstração'], ['Projetos ativos', data().projetos.length, 'cadastrados']]),
    el('section', { class: 'card' }, el('h2', { class: 'subtitulo' }, 'Engajamento por grupo'), el('p', { class: 'sub' }, 'Constituição dos grupos monitorados.'),
      el('div', { class: 'engaja' }, eng.map(([g, valor]) => el('div', { class: 'engaja-linha' }, el('span', {}, g.nome), barra(valor), el('b', {}, valor + '%'))))),
    el('section', { class: 'card espaco' }, el('h2', { class: 'subtitulo' }, 'Feedbacks recebidos'),
      fb.length ? el('div', { class: 'lista interna' }, fb.map((f) => { const u = porId('users', f.userId); return el('div', { class: 'linha' }, el('div', { class: 'linha-texto' }, el('b', {}, `${f.assunto} · ${u ? u.nome : 'Aluno'}`), el('div', { class: 'miudo' }, f.mensagem)), el('span', { class: 'miudo' }, fmtBR(f.data))); })) : vazio('Nenhum feedback recebido ainda.')));
}

return { dashboard, grupos, grupoForm, gerenciarGrupo, atividades, atividadeForm, projetos, videoaula, relatorios };
})();

__m["app"] = (function () {
// Ponto de entrada: carrega o banco, aplica acessibilidade e controla as rotas (#/...).
const { el, trocar } = __m["dom"];
const { init, modo } = __m["store"];
const { usuarioAtual } = __m["auth"];
const { shell, aplicarAcessibilidade } = __m["ui"];
const acesso = __m["acesso"];
const aluno = __m["aluno"];
const prof = __m["prof"];

// [padrão, tipo, item do menu, título, função da página]
const ROTAS = [
  ['/login', 'acesso', null, 'Entrar', () => acesso.login()],
  ['/cadastro-aluno', 'acesso', null, 'Cadastro de aluno', () => acesso.cadastro('aluno')],
  ['/cadastro-professor', 'acesso', null, 'Cadastro de professor', () => acesso.cadastro('professor')],
  ['/recuperar', 'acesso', null, 'Recuperar senha', () => acesso.recuperar()],
  ['/verifique', 'acesso', null, 'Verifique seu e-mail', () => acesso.verifique()],

  ['/aluno', 'aluno', 'inicio', 'Início', aluno.inicio],
  ['/aluno/grupos', 'aluno', 'grupos', 'Explorar grupos', aluno.grupos],
  ['/aluno/grupos/:id', 'aluno', 'grupos', 'Grupo', aluno.grupoDetalhe],
  ['/aluno/agenda', 'aluno', 'agenda', 'Agenda', aluno.agenda],
  ['/aluno/materiais', 'aluno', 'materiais', 'Materiais', aluno.materiais],
  ['/aluno/atividades', 'aluno', 'atividades', 'Atividades', aluno.atividades],
  ['/aluno/atividades/:id', 'aluno', 'atividades', 'Entregar atividade', aluno.entrega],
  ['/aluno/projetos', 'aluno', 'projetos', 'Projetos', aluno.projetos],
  ['/aluno/videoaulas', 'aluno', 'videoaulas', 'Videoaulas', aluno.videoaulas],
  ['/aluno/videoaulas/:id', 'aluno', 'videoaulas', 'Videoaula', aluno.player],
  ['/aluno/agentes', 'aluno', 'agentes', 'Meus agentes', aluno.agentes],
  ['/aluno/feedback', 'aluno', 'feedback', 'Enviar feedback', aluno.feedback],

  ['/professor', 'professor', 'dashboard', 'Dashboard', prof.dashboard],
  ['/professor/grupos', 'professor', 'grupos', 'Gerenciar grupos', prof.grupos],
  ['/professor/grupos/novo', 'professor', 'grupos', 'Novo grupo', prof.grupoForm],
  ['/professor/grupos/:id', 'professor', 'grupos', 'Gerenciar grupo', prof.gerenciarGrupo],
  ['/professor/grupos/:id/editar', 'professor', 'grupos', 'Editar grupo', prof.grupoForm],
  ['/professor/atividades', 'professor', 'atividades', 'Gerenciar atividades', prof.atividades],
  ['/professor/atividades/nova', 'professor', 'atividades', 'Nova atividade', prof.atividadeForm],
  ['/professor/atividades/:id/editar', 'professor', 'atividades', 'Editar atividade', prof.atividadeForm],
  ['/professor/projetos', 'professor', 'projetos', 'Gerenciar projetos', prof.projetos],
  ['/professor/videoaula', 'professor', 'videoaula', 'Publicar videoaula', prof.videoaula],
  ['/professor/relatorios', 'professor', 'relatorios', 'Relatórios', prof.relatorios],
].map(([padrao, tipo, nav, titulo, pagina]) => ({
  tipo, nav, titulo, pagina,
  re: new RegExp('^' + padrao.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'),
}));

const home = (u) => (u ? (u.tipo === 'aluno' ? '/aluno' : '/professor') : '/login');

function resolver() {
  const bruto = location.hash.replace(/^#/, '') || '/';
  const [caminho, query = ''] = bruto.split('?');
  const rota = caminho === '/' ? null : ROTAS.find((r) => r.re.test(caminho));
  const params = rota ? { ...rota.re.exec(caminho).groups } : {};
  return { rota, params, consulta: new URLSearchParams(query) };
}

function desenhar() {
  const app = document.getElementById('app');
  const user = usuarioAtual();
  const { rota, params, consulta } = resolver();

  if (!rota) { location.replace('#' + home(user)); return; }
  if (rota.tipo === 'acesso' && user && rota.titulo !== 'Verifique seu e-mail') { location.replace('#' + home(user)); return; }
  if (rota.tipo !== 'acesso' && (!user || user.tipo !== rota.tipo)) { location.replace('#' + home(user)); return; }

  document.body.classList.toggle('tema-acesso', rota.tipo === 'acesso');
  let tela;
  try {
    const conteudo = rota.pagina(user, params, consulta);
    tela = rota.tipo === 'acesso' ? conteudo : shell(user, rota.nav, conteudo);
  } catch (err) {
    console.error(err);
    tela = el('div', { class: 'erro-geral' }, el('h1', {}, 'Algo deu errado'), el('p', {}, 'Não foi possível abrir esta tela. Volte ao início e tente novamente.'), el('a', { class: 'btn btn-primario', href: '#' + home(user) }, 'Voltar ao início'));
  }
  trocar(app, tela);
  document.title = `${rota.titulo} · TechFatec`;
  window.scrollTo(0, 0);
  const alvo = app.querySelector('h1');
  if (alvo) { alvo.setAttribute('tabindex', '-1'); alvo.focus({ preventScroll: true }); }
}

async function iniciar() {
  aplicarAcessibilidade();
  try {
    await init();
  } catch (err) {
    trocar(document.getElementById('app'), el('div', { class: 'erro-geral' }, el('h1', {}, 'Banco de dados indisponível'),
      el('p', {}, 'Não foi possível carregar data/db.json. Abra a plataforma pelo servidor: execute "node server.js" e acesse http://localhost:3000.')));
    return;
  }
  document.documentElement.dataset.banco = modo();
  document.getElementById('pular').addEventListener('click', () => {
    const alvo = document.querySelector('#app h1');
    if (alvo) alvo.focus();
  });
  window.addEventListener('hashchange', desenhar);
  desenhar();
}

iniciar();

return {  };
})();
