# Broadcast Saúde & Longevidade

Base de planejamento para um MVP editorial B2B focado em saúde, longevidade, inovação médica e impactos econômicos do aumento da expectativa de vida.

O produto proposto combina:

- portal jornalístico responsivo;
- CMS e fluxo editorial;
- central de identidades visuais white-label;
- demonstrações comerciais por cliente;
- distribuição licenciada por feed/API;
- governança adequada a conteúdo de saúde.

## Recorte confirmado para o MVP-0

O primeiro ciclo será deliberadamente demonstrativo:

- todas as marcas, matérias, autores, organizações e métricas serão fictícios;
- três identidades white-label serão entregues como exemplos;
- o ADM terá tela de login, mas sem autenticação real ou Supabase Auth;
- credenciais de demonstração: `USER` / `User123`;
- o gate será validado no servidor usando variáveis de ambiente e cookie assinado;
- Next.js será publicado na Vercel;
- Supabase Postgres e Storage serão usados para persistência;
- API comercial, autenticação multiusuário e integrações de clientes ficam para depois da validação visual e operacional.

Essas decisões estão formalizadas em [MVP-0 - decisões confirmadas](docs/15-mvp0-decisoes-confirmadas.md).

## Por que este produto existe

A longevidade já afeta previdência, crédito, seguros, consumo 50+, gestão de patrimônio, custos assistenciais, inovação médica e estratégia corporativa. A oportunidade é transformar cobertura jornalística especializada em uma infraestrutura de conteúdo que possa ser exibida, licenciada e adaptada para bancos, seguradoras, gestoras, healthtechs, farmacêuticas, hospitais e portais de investimento.

A apresentação `Broadcast V2.pdf` posiciona saúde, longevidade e mercado financeiro como uma vertical comercial, com formatos como feed de notícias, branded content, newsletters, hubs temáticos, add-ons e conteúdo multimídia. Este repositório traduz essa tese para um sistema construível.

## Decisão central do MVP

O MVP será uma plataforma multi-tenant com conteúdo canônico compartilhado e distribuição configurável por cliente. Uma mesma matéria poderá aparecer:

- no portal editorial principal;
- em um portal com a identidade de um cliente;
- em uma demonstração temporária de vendas;
- em um feed/API contratado;
- com destaque, janela e chamada diferentes, sem duplicar o texto original.

## Mapa da documentação

| Arquivo | Finalidade |
|---|---|
| [Visão do produto](docs/00-visao-do-produto.md) | Tese, proposta de valor e princípios |
| [Escopo do MVP](docs/01-escopo-mvp.md) | Incluído, excluído e critérios de sucesso |
| [Personas e jornadas](docs/02-personas-e-jornadas.md) | Usuários, necessidades e fluxos |
| [Arquitetura técnica](docs/03-arquitetura-tecnica.md) | Stack sugerida, módulos e operação |
| [Modelo de dados](docs/04-modelo-de-dados.md) | Entidades, relações e invariantes |
| [CMS e operação editorial](docs/05-cms-e-operacao-editorial.md) | Cadastro, revisão, publicação e correções |
| [Central de identidade visual](docs/06-central-de-identidade-visual.md) | Temas, tokens, preview e governança |
| [Experiência e arquitetura de informação](docs/07-experiencia-e-arquitetura-da-informacao.md) | Telas, navegação e responsividade |
| [API e distribuição](docs/08-api-e-distribuicao.md) | Feed, autenticação, formatos e contratos |
| [Segurança, LGPD e governança](docs/09-seguranca-lgpd-e-governanca.md) | Isolamento, auditoria e conteúdo de saúde |
| [Roadmap e backlog](docs/10-roadmap-e-backlog.md) | Fases, épicos e prioridades |
| [Decisões em aberto](docs/11-decisoes-em-aberto.md) | Perguntas para lapidar com negócio |
| [Métricas e eventos](docs/12-metricas-e-analytics.md) | KPIs do produto, editorial e vendas |
| [Síntese da apresentação](docs/13-sintese-da-apresentacao.md) | O que foi extraído do PDF e implicações |
| [Plano de discovery](docs/14-plano-de-discovery.md) | Reuniões e saídas para fechar o briefing |
| [Decisões confirmadas do MVP-0](docs/15-mvp0-decisoes-confirmadas.md) | Recorte rápido para Vercel + Supabase |
| [Catálogo fictício de seed](docs/16-catalogo-ficticio-seed.md) | Marcas, autores, editorias e 24 matérias |
| [Plano do Ciclo 2](docs/17-plano-ciclo-de-melhoria.md) | Estabilização, ondas e métricas do ciclo |
| [Maleabilidade de marcas](docs/18-maleabilidade-de-marcas-e-personalizacao.md) | Cadastro de demos, tokens, presets e variantes |
| [Variantes editoriais](docs/19-variantes-de-cadastro-e-operacao-editorial.md) | Templates, distribuição e contexto do ADM |
| [Matriz de QA](docs/20-matriz-qa-ciclo-de-melhoria.md) | Smoke, viewports, segurança e evidências |
| [Sistema de agentes](docs/21-sistema-de-agentes-e-governanca.md) | Papéis, posse, verificação e auditoria adversarial |
| [Fila executável](TASKS.md) | Próximas tarefas e critérios de conclusão |
| [Loop de entrega](DELIVERY_LOOP.md) | Ciclo executor + auditor para o Codex |
| [Prompt inicial](PROMPT-INICIAL-CODEX.md) | Prompt pronto para iniciar a construção |
| [Prompt do Ciclo 2](PROMPT-CICLO-MELHORIA-CODEX.md) | Prompt pronto para iniciar a rodada de melhorias |

## Fontes consideradas

- Apresentação interna `Broadcast V2.pdf`, 20 páginas, revisada em 24/07/2026.
- [Site institucional da Broadcast](https://www.broadcast.com.br/).
- [Broadcast White Label](https://www.broadcast.com.br/broadcast-white-label/).
- [Broadcast Datafeed](https://www.broadcast.com.br/broadcast-datafeed/).
- [Broadcast Widgets](https://www.broadcast.com.br/broadcast-widgets/).
- [Broadcast Curadoria](https://www.broadcast.com.br/broadcast-curadoria/).

As referências externas servem para alinhamento de posicionamento. Elas não autorizam copiar código, conteúdo protegido, marca de terceiros ou interfaces proprietárias.

## Estado atual

Fase: MVP-0 implementado e publicado; estabilização do login e abertura do
Ciclo 2 em andamento.

Domínio público atual:
`https://portaldenoticias-five.vercel.app`.

O domínio `portaldenoticias.vercel.app` pertence a um projeto anterior e não
representa este MVP. Para continuar a evolução, use
`PROMPT-CICLO-MELHORIA-CODEX.md`.
