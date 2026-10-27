// Blocos de interface reutilizados pelas áreas do aluno e do professor.
import { el, icon } from '../dom.js';
import { data, porId } from '../store.js';
import { fmtCurta } from '../ui.js';

export const contagem = (g) => g.outrosParticipantes + g.participantes.filter((p) => p.status === 'ativo').length;
export const nomeProfessor = (g) => (porId('users', g.professorId) || { nome: '—' }).nome;

export const lista = (...linhas) => el('div', { class: 'lista' }, linhas);
export function linha({ icone, titulo, sub, direita = [] }) {
  return el('div', { class: 'linha item' },
    icone ? el('div', { class: 'ic' }, icon(icone)) : null,
    el('div', { class: 'linha-texto' }, el('b', {}, titulo), sub ? el('div', { class: 'miudo' }, sub) : null),
    direita);
}
export const selo = (texto, tom = 'acc') => el('span', { class: `selo selo-${tom}` }, texto);
export const barra = (valor) => el('div', { class: 'barra', role: 'progressbar', 'aria-valuenow': valor, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': `${valor}% concluído` }, el('span', { style: { width: valor + '%' } }));

export function estatisticas(itens) {
  return el('div', { class: 'estat-grade' }, itens.map(([titulo, valor, sub]) =>
    el('div', { class: 'card estat' }, el('div', { class: 'miudo' }, titulo), el('div', { class: 'estat-valor' }, String(valor)), el('div', { class: 'miudo' }, sub))));
}

export function hero(titulo, texto, rotuloBotao, rota) {
  return el('section', { class: 'hero' },
    el('div', {}, el('div', { class: 'eyebrow claro' }, 'TECHFATEC'), el('h2', {}, titulo), el('p', {}, texto)),
    el('a', { class: 'btn btn-claro', href: '#' + rota }, rotuloBotao));
}

export function atividadesRecentes() {
  const itens = [...data().atividades].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 4);
  return el('section', { class: 'card' },
    el('h2', { class: 'subtitulo' }, 'Atividades recentes'), el('p', { class: 'sub' }, 'Últimas movimentações.'),
    el('div', { class: 'lista interna' }, itens.map((a) => el('div', { class: 'linha' },
      el('div', { class: 'ic txt' }, 'TF'),
      el('div', { class: 'linha-texto' }, el('b', {}, a.titulo), el('div', { class: 'miudo' }, a.disciplina)),
      el('span', { class: 'miudo' }, fmtCurta(a.criadoEm))))));
}

export function cartaoGrupo(g, rotulo, rota) {
  return el('article', { class: 'card grupo item' },
    selo(g.status, g.status === 'Em andamento' ? 'ok' : 'neutro'),
    el('h3', {}, g.nome),
    el('p', { class: 'miudo' }, `Prof. ${nomeProfessor(g)} · ${contagem(g)} participantes`),
    el('a', { class: 'btn btn-sec', href: '#' + rota }, rotulo));
}

export function dataBox(iso) {
  const [, m, d] = iso.split('-');
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return el('div', { class: 'databox' }, d, el('small', {}, meses[+m - 1]));
}

export const vazio = (texto) => el('p', { class: 'vazio' }, texto);
