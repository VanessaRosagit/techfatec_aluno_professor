// Área do aluno.
import { el, icon, trocar } from '../dom.js';
import { data, save, uid, porId } from '../store.js';
import { go, cabecalho, voltar, toast, modal, campo, input, alerta, focarInvalido, lerCampos, fmtCurta, fmtBR, fmtTempo, hojeISO } from '../ui.js';
import { lista, linha, selo, barra, estatisticas, hero, atividadesRecentes, cartaoGrupo, contagem, nomeProfessor, dataBox, vazio } from './comum.js';

const LIMITE_MB = 25;
const entregaDe = (user, atividadeId) => data().entregas.find((e) => e.atividadeId === atividadeId && e.alunoId === user.id);
const meusGrupos = (user) => data().grupos.filter((g) => g.participantes.some((p) => p.userId === user.id && p.status === 'ativo'));

/* ---------- início ---------- */
export function inicio(user) {
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
export function grupos() {
  return el('div', {}, cabecalho('COLABORAÇÃO', 'Explorar grupos', 'Encontre espaços para estudar e colaborar.'),
    el('div', { class: 'grade-3' }, data().grupos.map((g) => cartaoGrupo(g, 'Ver grupo', `/aluno/grupos/${g.id}`))));
}

export function grupoDetalhe(user, { id }) {
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
export function agenda() {
  const eventos = [...data().eventos].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  return el('div', {}, cabecalho('ORGANIZAÇÃO ACADÊMICA', 'Agenda', 'Seus próximos compromissos e prazos.'),
    eventos.length ? el('div', { class: 'lista estreita' }, eventos.map((e) => el('div', { class: 'linha item' }, dataBox(e.data),
      el('div', { class: 'linha-texto' }, el('b', {}, e.titulo), el('div', { class: 'miudo' }, `${e.hora} · ${e.local}`))))) : vazio('Nenhum compromisso agendado.'));
}

export function materiais() {
  return el('div', {}, cabecalho('CONTEÚDO ACADÊMICO', 'Materiais acadêmicos', 'Consulte os recursos disponíveis e seu contexto.'),
    lista(...data().materiais.map((m) => linha({ icone: 'materiais', titulo: m.titulo, sub: `${m.tipo} · ${m.tamanho}`,
      direita: [el('span', { class: 'miudo' }, `Adicionado em ${fmtBR(m.adicionado)}`), el('button', { type: 'button', class: 'btn btn-sec peq', onClick: () => toast(`Abrindo "${m.titulo}" (simulado na demonstração).`) }, 'Acessar')] }))));
}

export function projetos() {
  const detalhe = (p) => modal({ titulo: p.nome, corpo: el('div', {}, el('p', { class: 'sub' }, p.descricao), barra(p.progresso), el('p', { class: 'miudo' }, `${p.progresso}% concluído`)), acoes: [{ rotulo: 'Fechar', primario: true, onClick: () => true }] });
  return el('div', {}, cabecalho('CONTEÚDO ACADÊMICO', 'Projetos', 'Acompanhe o andamento dos projetos.'),
    lista(...data().projetos.map((p) => linha({ icone: 'projetos', titulo: p.nome, sub: p.descricao,
      direita: [el('div', { class: 'progresso' }, barra(p.progresso), el('span', { class: 'miudo' }, `${p.progresso}% concluído`)), el('button', { type: 'button', class: 'btn btn-sec peq', onClick: () => detalhe(p) }, 'Acessar')] }))));
}

/* ---------- atividades e entrega ---------- */
export function atividades(user) {
  return el('div', {}, cabecalho('CONTEÚDO ACADÊMICO', 'Atividades', 'Consulte os recursos disponíveis e seu contexto.'),
    lista(...[...data().atividades].sort((a, b) => a.entrega.localeCompare(b.entrega)).map((a) => linha({ icone: 'materiais', titulo: a.titulo, sub: a.disciplina,
      direita: [selo(entregaDe(user, a.id) ? 'Entregue' : 'Pendente', entregaDe(user, a.id) ? 'ok' : 'aviso'), el('span', { class: 'miudo' }, `Entrega ${fmtCurta(a.entrega)}`), el('a', { class: 'btn btn-sec peq', href: `#/aluno/atividades/${a.id}` }, 'Acessar')] }))));
}

export function entrega(user, { id }) {
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
export function videoaulas() {
  const gradientes = ['linear-gradient(120deg,#005c6d,#2bb8c9)', 'linear-gradient(120deg,#373737,#888)', 'linear-gradient(120deg,#8a0000,#c20000)'];
  return el('div', {}, cabecalho('APRENDIZADO', 'Videoaulas', 'Materiais publicados pelos professores, com legendas e transcrição.'),
    el('div', { class: 'grade-3' }, [...data().videoaulas].sort((a, b) => a.numero - b.numero).map((v, i) =>
      el('article', { class: 'card video item' },
        el('div', { class: 'miniatura', style: { background: gradientes[i % gradientes.length] } }, icon('play', 34)),
        el('div', { class: 'eyebrow' }, `Aula ${v.numero}`), el('h3', {}, v.titulo), el('p', { class: 'miudo' }, v.descricao),
        el('a', { class: 'btn btn-sec', href: `#/aluno/videoaulas/${v.id}` }, 'Assistir')))));
}

export function player(user, { id }) {
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
export function agentes(user, _p, consulta) {
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
export function feedback(user) {
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
