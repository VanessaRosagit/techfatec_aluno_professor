// Telas de acesso: login, cadastro (aluno/professor), recuperar senha, verifique e-mail.
import { el, trocar } from '../dom.js';
import { data } from '../store.js';
import { tentarLogin, cadastrar, recuperarSenha, iniciarSessao } from '../auth.js';
import { go, paginaAcesso, campo, input, alerta, focarInvalido, lerCampos } from '../ui.js';

const rotaInicial = (u) => (u.tipo === 'aluno' ? '/aluno' : '/professor');
const rodape = () => el('div', { class: 'miudo centro' }, 'Demonstração acadêmica. Nenhum dado real é armazenado.');

export function login() {
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

export function cadastro(tipoInicial) {
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

export function recuperar() {
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

export function verifique() {
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
