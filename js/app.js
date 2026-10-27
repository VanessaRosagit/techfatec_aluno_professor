// Ponto de entrada: carrega o banco, aplica acessibilidade e controla as rotas (#/...).
import { el, trocar } from './dom.js';
import { init, modo } from './store.js';
import { usuarioAtual } from './auth.js';
import { shell, aplicarAcessibilidade } from './ui.js';
import * as acesso from './pages/acesso.js';
import * as aluno from './pages/aluno.js';
import * as prof from './pages/prof.js';

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
