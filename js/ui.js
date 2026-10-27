// Componentes de interface compartilhados: layout, formulários, toast, modal,
// painel de acessibilidade e assistente.
import { el, icon, trocar } from './dom.js';
import { data } from './store.js';
import { encerrarSessao } from './auth.js';

export const go = (rota) => { location.hash = '#' + rota; };

/* ---------- formatação ---------- */
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const fmtCurta = (iso) => { const [, m, d] = iso.split('-'); return `${d} ${MESES[+m - 1]}`; };
export const fmtBR = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; };
export const partesData = (iso) => { const [, m, d] = iso.split('-'); return { dia: d, mes: MESES[+m - 1].toUpperCase() }; };
export const hojeISO = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
export const fmtTempo = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const iniciais = (nome) => { const p = nome.trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); };
const siglaCurso = (c = '') => c.split(/\s+/).filter((w) => /^[A-ZÀ-Ú]/.test(w)).map((w) => w[0]).join('');
export const rotuloUsuario = (u) => (u.tipo === 'aluno' ? `Aluno${u.curso ? ' · ' + siglaCurso(u.curso) : ''}` : 'Professor(a)');

/* ---------- formulários ---------- */
export function input(attrs = {}, erro) {
  return el(attrs.tag || 'input', { class: `in${erro ? ' invalido' : ''}${attrs.class ? ' ' + attrs.class : ''}`, ...attrs, tag: null, 'aria-invalid': erro ? 'true' : null });
}
export function campo(rotulo, controle, erro) {
  return el('label', { class: 'campo' }, rotulo, controle, erro ? el('span', { class: 'erro-msg' }, '! ' + erro) : null);
}
export function alerta(tipo, titulo, texto) {
  return el('div', { class: `alerta alerta-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' },
    el('span', { class: 'alerta-ic', 'aria-hidden': 'true' }, tipo === 'erro' ? '!' : '✓'),
    el('span', {}, el('b', {}, titulo), texto ? ' ' + texto : ''));
}
export function focarInvalido(raiz) {
  const alvo = raiz.querySelector('[aria-invalid="true"]') || raiz.querySelector('[role="alert"]');
  if (alvo) { if (!alvo.hasAttribute('tabindex') && alvo.tagName === 'DIV') alvo.setAttribute('tabindex', '-1'); alvo.focus(); }
}
export const lerCampos = (form) => Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, typeof v === 'string' ? v : v.name]));

export function cabecalho(eyebrow, titulo, sub, acao) {
  return el('div', { class: 'cab' },
    el('div', {}, el('div', { class: 'eyebrow' }, eyebrow), el('h1', { class: 'titulo' }, titulo), sub ? el('p', { class: 'sub' }, sub) : null),
    acao || null);
}
export const voltar = (texto, rota) => el('a', { class: 'voltar', href: '#' + rota }, '← ' + texto);

/* ---------- toast e modal ---------- */
export function toast(msg, tipo = 'ok') {
  let box = document.getElementById('toasts');
  if (!box) { box = el('div', { id: 'toasts', 'aria-live': 'polite' }); document.body.append(box); }
  const t = el('div', { class: `toast toast-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' }, msg);
  box.append(t);
  setTimeout(() => t.remove(), 3800);
}

export function modal({ titulo, corpo, acoes = [] }) {
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

export function confirmar(titulo, texto, rotulo, aoConfirmar) {
  modal({ titulo, corpo: el('p', { class: 'sub' }, texto), acoes: [{ rotulo: 'Cancelar', onClick: () => true }, { rotulo, primario: true, onClick: () => { aoConfirmar(); return true; } }] });
}

/* ---------- acessibilidade ---------- */
const ACESS = 'techfatec_acessibilidade';
const acessPadrao = { escala: 100, contraste: false };
function lerAcess() { try { return { ...acessPadrao, ...JSON.parse(localStorage.getItem(ACESS) || '{}') }; } catch (e) { return { ...acessPadrao }; } }
export function aplicarAcessibilidade(c = lerAcess()) {
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

export const marca = (largura = 172, tamanho = 19) => el('div', { class: 'marca' },
  el('img', { src: 'assets/logo-fatec-cps.png', alt: 'Fatec São Roque · Centro Paula Souza', style: { width: largura + 'px' } }),
  el('div', { class: 'marca-nome', style: { fontSize: tamanho + 'px' } }, 'TechFatec'));

function proximos(user) {
  if (user.tipo === 'aluno') return [...data().eventos].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)).slice(0, 3).map((e) => [e.titulo, `${fmtCurta(e.data)} · ${e.hora}`]);
  return [...data().atividades].sort((a, b) => a.entrega.localeCompare(b.entrega)).slice(0, 3).map((a) => [a.titulo, `Entrega ${fmtCurta(a.entrega)}`]);
}

export function shell(user, nav, conteudo) {
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
export function paginaAcesso(conteudo) {
  const pAcess = painelAcessibilidade();
  const fab = el('div', { class: 'fabs' }, el('button', { type: 'button', class: 'fab fab-escuro', 'aria-label': 'Acessibilidade', onClick: () => { pAcess.hidden = !pAcess.hidden; } }, icon('acess', 20)));
  return el('div', { class: 'acesso' }, el('div', { class: 'acesso-cartao' }, el('div', { class: 'acesso-form' }, marca(210, 22), conteudo)), fab, pAcess);
}
