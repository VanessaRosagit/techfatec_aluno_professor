// Área do professor.
import { el, trocar } from '../dom.js';
import { data, save, uid, porId } from '../store.js';
import { go, cabecalho, voltar, toast, modal, confirmar, campo, input, alerta, focarInvalido, lerCampos, fmtCurta, fmtBR, hojeISO } from '../ui.js';
import { lista, linha, selo, barra, estatisticas, hero, atividadesRecentes, cartaoGrupo, contagem, nomeProfessor, vazio } from './comum.js';

const gravar = async (msg) => { try { await save(); if (msg) toast(msg); return true; } catch (e) { toast(e.message, 'erro'); return false; } };
const contar = (erros) => Object.keys(erros).length;
const resumo = (erros, titulo, texto) => (contar(erros) ? alerta('erro', titulo || `Revise ${contar(erros)} ${contar(erros) === 1 ? 'campo' : 'campos'}.`, texto) : null);

/* ---------- dashboard ---------- */
export function dashboard(user) {
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
export function grupos() {
  return el('div', {}, cabecalho('GERENCIAMENTO', 'Gerenciar grupos', 'Consulte e gerencie os registros autorizados.', el('a', { class: 'btn btn-primario', href: '#/professor/grupos/novo' }, 'Novo registro')),
    el('div', { class: 'grade-3' }, data().grupos.map((g) => cartaoGrupo(g, 'Gerenciar', `/professor/grupos/${g.id}`))));
}

export function grupoForm(user, { id }) {
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

export function gerenciarGrupo(user, { id }) {
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
export function atividades() {
  return el('div', {}, cabecalho('GERENCIAMENTO ACADÊMICO', 'Gerenciar atividades', 'Consulte os recursos disponíveis e seu contexto.', el('a', { class: 'btn btn-primario', href: '#/professor/atividades/nova' }, 'Novo item')),
    data().atividades.length ? lista(...[...data().atividades].sort((a, b) => a.entrega.localeCompare(b.entrega)).map((a) => {
      const n = data().entregas.filter((e) => e.atividadeId === a.id).length;
      return linha({ icone: 'materiais', titulo: a.titulo, sub: `${a.disciplina} · ${n} ${n === 1 ? 'entrega recebida' : 'entregas recebidas'}`,
        direita: [el('span', { class: 'miudo' }, `Entrega ${fmtCurta(a.entrega)}`), el('a', { class: 'btn btn-sec peq', href: `#/professor/atividades/${a.id}/editar` }, 'Gerenciar')] });
    })) : vazio('Nenhuma atividade cadastrada.'));
}

export function atividadeForm(user, { id }) {
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
export function projetos() {
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

export function videoaula(user) {
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
export function relatorios() {
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
