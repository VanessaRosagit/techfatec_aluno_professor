# TechFatec

Plataforma de grupos de estudo da FATEC São Roque, em HTML, CSS e JavaScript puros, com banco de dados em JSON.
Projeto de demonstração acadêmica: nenhum dado real é armazenado.

## Como rodar

**Jeito mais simples:** dê dois cliques em `index.html`. Funciona em qualquer navegador, sem instalar nada.
Nesse modo o banco inicial vem de `data/db.js` (cópia do `db.json`) e as alterações ficam salvas no navegador
(`localStorage`), neste computador.

**Para gravar direto em `data/db.json`:** com o Node.js instalado (sem dependências):

```
node server.js
```

Abra http://localhost:3000. Use `PORT=4000 node server.js` para trocar a porta.

O servidor serve os arquivos e expõe o banco em `/api/db`: tudo que você faz na plataforma
(cadastros, grupos, entregas, feedbacks…) é gravado em `data/db.json`.
Para voltar ao estado inicial, faça `POST /api/reset` (o servidor guarda uma cópia do banco
original em `data/db.seed.json` na primeira execução) ou restaure o `db.json` manualmente.

Se você editar os arquivos em `js/` ou o `data/db.json`, rode `node build.js` para atualizar
`js/app.bundle.js` e `data/db.js`, que são os arquivos que o `index.html` carrega.

## Acesso de demonstração

O acesso usa a conta da Fatec, então a plataforma não cria nem guarda senhas.
Aqui isso é simulado: qualquer e-mail `@fatec.sp.gov.br` cadastrado entra com a senha `fatec123`
(definida em `meta.sso` no `db.json`).

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | tiago.santos@fatec.sp.gov.br | fatec123 |
| Professor | camila.souza@fatec.sp.gov.br | fatec123 |

Depois de 3 senhas erradas o acesso fica bloqueado por 30 segundos.

## O que tem

- **Acesso:** login (aluno/professor), cadastro de aluno e de professor, recuperar senha, verifique e-mail.
- **Aluno:** início, explorar grupos (participar/sair), agenda, materiais, atividades e entrega (arquivo ou link, limite de 25 MB), projetos, videoaulas com player simulado, legendas e transcrição, meus agentes de estudo, enviar feedback.
- **Professor:** dashboard, gerenciar grupos (criar, editar, convidar, remover, excluir), atividades, projetos, publicar videoaula, relatórios.
- **Em todas as telas:** painel de acessibilidade (tamanho do texto e alto contraste), assistente com respostas por palavras-chave, busca na página e notificações.

## Estrutura

```
index.html          página única (rotas por #/...)
build.js            gera js/app.bundle.js e data/db.js (arquivos carregados pelo index.html)
server.js           servidor estático + API do banco JSON
data/db.json        banco de dados
css/styles.css      estilos (paleta e fontes da Fatec)
js/dom.js           helper el(): monta o DOM sem innerHTML
js/store.js         leitura/gravação do banco
js/auth.js          login simulado, cadastro, recuperação
js/ui.js            layout, formulários, modal, toast, acessibilidade, assistente
js/app.js           rotas
js/pages/           telas (acesso, aluno, professor, comum)
assets/             logo Fatec São Roque / CPS
```

## Limites do protótipo

- Arquivos enviados (entregas, materiais do agente, videoaulas) têm só nome e tamanho gravados; o conteúdo não é armazenado.
- Os agentes de estudo não leem os materiais: a leitura exigirá integração com armazenamento e um modelo de IA.
- As fontes (Roboto e Roboto Slab) vêm do Google Fonts e precisam de internet; sem ela entram fontes do sistema.
- Os números de "participantes" e os relatórios de participação e entregas são dados de demonstração do `db.json`.
- Plataforma só para desktop, sem layout para tablet ou celular.
