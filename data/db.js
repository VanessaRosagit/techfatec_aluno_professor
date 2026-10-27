// ARQUIVO GERADO por build.js a partir de db.json (usado quando a página abre sem servidor).
window.TF_SEED = {
  "meta": {
    "projeto": "TechFatec",
    "descricao": "Banco de dados de demonstração acadêmica. Nenhum dado real é armazenado.",
    "sso": {
      "dominio": "@fatec.sp.gov.br",
      "senhaDemonstracao": "fatec123",
      "observacao": "Simula o login da Fatec. A plataforma não cria nem guarda senhas; qualquer conta cadastrada entra com a senha de demonstração."
    }
  },
  "disciplinas": [
    "Desenvolvimento Web III",
    "Banco de Dados II",
    "Projeto de Navegação e Interação"
  ],
  "users": [
    {
      "id": "u-tiago",
      "tipo": "aluno",
      "nome": "Tiago Santos",
      "email": "tiago.santos@fatec.sp.gov.br",
      "ra": "0000000000001",
      "curso": "Sistemas para Internet"
    },
    {
      "id": "u-alu2",
      "tipo": "aluno",
      "nome": "Aluno de demonstração 2",
      "email": "aluno2@fatec.sp.gov.br",
      "ra": "0000000000002",
      "curso": "Sistemas para Internet"
    },
    {
      "id": "u-alu3",
      "tipo": "aluno",
      "nome": "Aluno de demonstração 3",
      "email": "aluno3@fatec.sp.gov.br",
      "ra": "0000000000003",
      "curso": "Sistemas para Internet"
    },
    {
      "id": "u-camila",
      "tipo": "professor",
      "nome": "Camila Souza",
      "email": "camila.souza@fatec.sp.gov.br",
      "matricula": "P0001"
    },
    {
      "id": "u-marcos",
      "tipo": "professor",
      "nome": "Marcos Lima",
      "email": "marcos.lima@fatec.sp.gov.br",
      "matricula": "P0002"
    },
    {
      "id": "u-renato",
      "tipo": "professor",
      "nome": "Renato Alves",
      "email": "renato.alves@fatec.sp.gov.br",
      "matricula": "P0003"
    }
  ],
  "grupos": [
    {
      "id": "g-web",
      "nome": "Desenvolvimento Web",
      "disciplina": "Desenvolvimento Web III",
      "professorId": "u-camila",
      "limite": 30,
      "outrosParticipantes": 22,
      "status": "Em andamento",
      "descricao": "Espaço para estudar e colaborar em Desenvolvimento Web: troca de materiais, dúvidas e acompanhamento das entregas da disciplina.",
      "participantes": [
        {
          "userId": "u-tiago",
          "status": "ativo"
        },
        {
          "userId": "u-alu2",
          "status": "ativo"
        },
        {
          "userId": "u-alu3",
          "status": "convite"
        }
      ]
    },
    {
      "id": "g-bd",
      "nome": "Banco de Dados",
      "disciplina": "Banco de Dados II",
      "professorId": "u-marcos",
      "limite": 30,
      "outrosParticipantes": 17,
      "status": "Em andamento",
      "descricao": "Grupo de estudos de modelagem e consulta em bancos de dados relacionais.",
      "participantes": [
        {
          "userId": "u-tiago",
          "status": "ativo"
        }
      ]
    },
    {
      "id": "g-ux",
      "nome": "UX e Design de Interação",
      "disciplina": "Projeto de Navegação e Interação",
      "professorId": "u-renato",
      "limite": 40,
      "outrosParticipantes": 31,
      "status": "Em andamento",
      "descricao": "Discussão de fluxos de navegação, protótipos e acessibilidade nos projetos da disciplina.",
      "participantes": []
    }
  ],
  "eventos": [
    {
      "id": "e1",
      "titulo": "Reunião do grupo TechFatec",
      "data": "2026-11-03",
      "hora": "09:30",
      "local": "Sala de projetos",
      "grupoId": "g-web"
    },
    {
      "id": "e2",
      "titulo": "Entrega do protótipo navegável",
      "data": "2026-11-10",
      "hora": "23:59",
      "local": "Ambiente virtual",
      "grupoId": "g-web"
    },
    {
      "id": "e3",
      "titulo": "Avaliação de Banco de Dados",
      "data": "2026-11-12",
      "hora": "19:00",
      "local": "Laboratório 4",
      "grupoId": "g-bd"
    }
  ],
  "materiais": [
    {
      "id": "m1",
      "titulo": "Guia de Acessibilidade WCAG 2.2",
      "tipo": "PDF",
      "tamanho": "2,4 MB",
      "adicionado": "2026-10-22"
    },
    {
      "id": "m2",
      "titulo": "Componentização com React",
      "tipo": "Apresentação",
      "tamanho": "6 MB",
      "adicionado": "2026-10-18"
    },
    {
      "id": "m3",
      "titulo": "Modelo de projeto acadêmico",
      "tipo": "DOCX",
      "tamanho": "1,2 MB",
      "adicionado": "2026-10-14"
    }
  ],
  "atividades": [
    {
      "id": "a-proto",
      "titulo": "Protótipo navegável",
      "disciplina": "Projeto de Navegação e Interação",
      "entrega": "2026-11-10",
      "hora": "23:59",
      "local": "Ambiente virtual",
      "instrucoes": "Entregue o protótipo navegável do projeto, cobrindo os fluxos principais de acesso e navegação. Anexe o arquivo ou o link de acesso e descreva as decisões de design adotadas.",
      "criadoPor": "u-camila",
      "criadoEm": "2026-10-20"
    },
    {
      "id": "a-bd",
      "titulo": "Modelagem do banco de dados",
      "disciplina": "Banco de Dados II",
      "entrega": "2026-11-12",
      "hora": "23:59",
      "local": "Ambiente virtual",
      "instrucoes": "Instruções a definir pelo professor.",
      "criadoPor": "u-marcos",
      "criadoEm": "2026-10-20"
    },
    {
      "id": "a-react",
      "titulo": "Lista de exercícios React",
      "disciplina": "Desenvolvimento Web III",
      "entrega": "2026-11-19",
      "hora": "23:59",
      "local": "Ambiente virtual",
      "instrucoes": "Instruções a definir pelo professor.",
      "criadoPor": "u-camila",
      "criadoEm": "2026-10-19"
    }
  ],
  "entregas": [],
  "projetos": [
    {
      "id": "p1",
      "nome": "TechFatec",
      "descricao": "Plataforma de colaboração acadêmica",
      "progresso": 75
    },
    {
      "id": "p2",
      "nome": "Portal de Turismo",
      "descricao": "Projeto interdisciplinar",
      "progresso": 42
    }
  ],
  "videoaulas": [
    {
      "id": "v1",
      "numero": 1,
      "titulo": "Arquitetura da informação",
      "disciplina": "Desenvolvimento Web III",
      "duracao": 700,
      "descricao": "Videoaula acessível · Material de estudo",
      "publicadoPor": "u-camila",
      "transcricao": [
        {
          "t": 0,
          "texto": "Introdução à aula e objetivos."
        },
        {
          "t": 80,
          "texto": "O que é arquitetura da informação."
        },
        {
          "t": 192,
          "texto": "Organização, rotulagem e navegação."
        },
        {
          "t": 405,
          "texto": "Mapa do site e fluxos de usuário."
        },
        {
          "t": 570,
          "texto": "Resumo e próximos passos."
        }
      ]
    },
    {
      "id": "v2",
      "numero": 2,
      "titulo": "React: estado e propriedades",
      "disciplina": "Desenvolvimento Web III",
      "duracao": 600,
      "descricao": "Videoaula acessível · Material de estudo",
      "publicadoPor": "u-camila",
      "transcricao": [
        {
          "t": 0,
          "texto": "Transcrição de demonstração."
        }
      ]
    },
    {
      "id": "v3",
      "numero": 3,
      "titulo": "Modelagem de dados",
      "disciplina": "Banco de Dados II",
      "duracao": 540,
      "descricao": "Videoaula acessível · Material de estudo",
      "publicadoPor": "u-marcos",
      "transcricao": [
        {
          "t": 0,
          "texto": "Transcrição de demonstração."
        }
      ]
    }
  ],
  "feedbacks": [],
  "agentes": [],
  "relatorios": {
    "observacao": "Dados de demonstração do semestre atual.",
    "participacaoMedia": 82,
    "atividadesEntregues": 76,
    "engajamento": [
      {
        "grupoId": "g-web",
        "valor": 88
      },
      {
        "grupoId": "g-bd",
        "valor": 76
      },
      {
        "grupoId": "g-ux",
        "valor": 64
      }
    ]
  },
  "faq": {
    "aluno": [
      {
        "chaves": [
          "material",
          "materiais"
        ],
        "resposta": "Seus materiais estão em Materiais, no menu lateral. Lá você encontra PDFs, apresentações e documentos publicados."
      },
      {
        "chaves": [
          "prova",
          "provas",
          "avaliação",
          "avaliacao",
          "agenda"
        ],
        "resposta": "Datas de provas e entregas aparecem em Agenda. Os próximos compromissos também ficam no sino, no topo da tela."
      },
      {
        "chaves": [
          "videoaula",
          "videoaulas",
          "vídeo",
          "video",
          "assist"
        ],
        "resposta": "As videoaulas ficam em Videoaulas. Cada aula tem legendas e transcrição para consulta."
      },
      {
        "chaves": [
          "grupo",
          "grupos",
          "participar"
        ],
        "resposta": "Em Explorar grupos você vê os grupos abertos e pode participar de um deles pela página do grupo."
      },
      {
        "chaves": [
          "atividade",
          "atividades",
          "entregar",
          "entrega"
        ],
        "resposta": "Abra Atividades, escolha uma e use Acessar para enviar seu arquivo ou link, com comentário opcional."
      },
      {
        "chaves": [
          "agente",
          "agentes",
          "estudo",
          "estudar"
        ],
        "resposta": "Em Meus agentes você cria uma base de estudos por disciplina anexando seus materiais."
      },
      {
        "chaves": [
          "projeto",
          "projetos"
        ],
        "resposta": "O andamento dos projetos aparece em Projetos, com a porcentagem concluída."
      }
    ],
    "professor": [
      {
        "chaves": [
          "atividade",
          "atividades",
          "criar"
        ],
        "resposta": "Em Gerenciar atividades, use Novo item, preencha título, disciplina, data de entrega e instruções, e publique."
      },
      {
        "chaves": [
          "videoaula",
          "videoaulas",
          "vídeo",
          "video",
          "publicar"
        ],
        "resposta": "Em Publicar videoaula, informe título, disciplina e arquivo, confirme que há legendas ou transcrição e publique."
      },
      {
        "chaves": [
          "engajamento",
          "relatório",
          "relatorio",
          "relatórios",
          "relatorios"
        ],
        "resposta": "O engajamento por grupo está em Relatórios, junto da participação média e das entregas."
      },
      {
        "chaves": [
          "grupo",
          "grupos",
          "convidar"
        ],
        "resposta": "Em Gerenciar grupos você cria grupos, edita dados e convida alunos pelo e-mail institucional."
      },
      {
        "chaves": [
          "projeto",
          "projetos"
        ],
        "resposta": "Em Gerenciar projetos você cadastra projetos e atualiza a porcentagem concluída."
      }
    ],
    "padrao": "Não encontrei essa dúvida. Tente perguntar sobre grupos, materiais, atividades, projetos ou videoaulas."
  }
};
