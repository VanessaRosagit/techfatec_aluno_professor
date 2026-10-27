// Autenticação simulada. O acesso real usaria a conta Fatec (SSO); aqui a
// plataforma não cria nem guarda senhas: aceita a senha de demonstração do db.json.
import { data, save, uid } from './store.js';

const SESSAO = 'techfatec_sessao';
const TENT = 'techfatec_tentativas';
const MAX_TENTATIVAS = 3;
const BLOQUEIO_MS = 30000;

export function usuarioAtual() {
  let id = null;
  try { id = sessionStorage.getItem(SESSAO) || localStorage.getItem(SESSAO); } catch (e) { /* ignora */ }
  return id ? data().users.find((u) => u.id === id) || null : null;
}

export function iniciarSessao(user, lembrar) {
  try {
    sessionStorage.setItem(SESSAO, user.id);
    if (lembrar) localStorage.setItem(SESSAO, user.id); else localStorage.removeItem(SESSAO);
  } catch (e) { /* ignora */ }
}

export function encerrarSessao() {
  try { sessionStorage.removeItem(SESSAO); localStorage.removeItem(SESSAO); } catch (e) { /* ignora */ }
}

const dominio = () => data().meta.sso.dominio;
export const emailInstitucional = (e) => e.trim().toLowerCase().endsWith(dominio()) && e.trim().length > dominio().length;

function tentativas() {
  try { return JSON.parse(sessionStorage.getItem(TENT) || '{}'); } catch (e) { return {}; }
}
function gravarTentativas(t) {
  try { sessionStorage.setItem(TENT, JSON.stringify(t)); } catch (e) { /* ignora */ }
}

// Retorna { user } em caso de sucesso ou { erros: { geral, email, senha } }.
export function tentarLogin({ email, senha, tipo }) {
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
export async function cadastrar(tipo, v) {
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

export function recuperarSenha(email) {
  if (!email.trim()) return { erro: 'Campo obrigatório.' };
  if (!emailInstitucional(email)) return { erro: `Use seu e-mail institucional (${dominio()}).` };
  const existe = data().users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  return existe ? { ok: true } : { erro: 'Verifique se digitou corretamente ou faça seu cadastro.', naoEncontrado: true };
}
