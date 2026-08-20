# Fila executável do MVP-0

Estados: `READY`, `IN_PROGRESS`, `VERIFY`, `DONE`, `BLOCKED`.

O executor sempre escolhe a tarefa P0 `READY` de menor número cujas dependências estejam `DONE`. Ao finalizar, registra evidências em `STATUS.md`.

| ID | Pri. | Estado | Dependências | Entrega |
|---|---|---|---|---|
| T001 | P0 | DONE | - | Scaffold Next.js/TypeScript/Tailwind/pnpm e checks |
| T002 | P0 | DONE | T001 | Estrutura visual base, design tokens e shell público/admin |
| T003 | P0 | DONE | T001 | Vincular projeto Supabase definitivo e criar migrations |
| T004 | P0 | DONE | T003 | Seed idempotente com 3 marcas e 24 matérias |
| T005 | P0 | DONE | T001 | Gate ADM `USER / User123`, cookie e logout |
| T006 | P0 | DONE | T003,T005 | CMS: listar, criar, editar, publicar, pausar e retomar |
| T007 | P0 | DONE | T002,T004 | Portal público: home, editoria e matéria |
| T008 | P0 | DONE | T002,T003,T004,T005 | Central white-label: tokens, variantes e preview |
| T009 | P0 | DONE | T004,T007,T008 | Três tenants visualmente distintos |
| T010 | P0 | DONE | T004,T007 | Rota JSON demo com `demo: true` |
| T011 | P0 | DONE | T005,T006,T008 | Auditoria mínima com ator `demo-operator` |
| T012 | P0 | DONE | T006,T007,T008 | QA desktop/mobile, acessibilidade e estados |
| T013 | P0 | DONE | T009,T010,T011,T012 | Build final, variáveis, correção do login e deploy Vercel |
| T014 | P0 | DONE | T013 | Auditoria final independente e handoff |

## Fila do Ciclo 2

O Ciclo 2 só avança depois que o ambiente publicado estiver estável. O escopo
está em `docs/17-plano-ciclo-de-melhoria.md`.

| ID | Pri. | Estado | Dependências | Entrega |
|---|---|---|---|---|
| C201 | P0 | DONE | - | Especificar escopo, variantes, QA e sistema de agentes |
| C202 | P0 | DONE | T013 | Smoke automatizado Preview/Production |
| C203 | P0 | DONE | T014,C202 | Baseline visual/funcional aprovado para o Ciclo 2 |
| C204 | P1 | DONE | C210 | Tenant padrão reutilizável na URL pública |
| C205 | P1 | DONE | C212 | Expandir catálogo para 40 matérias, 10 por vertical, com imagens exclusivas e crossovers |
| C210 | P1 | DONE | C203 | Contexto global de tenant no ADM |
| C211 | P1 | DONE | C204 | Workbench de identidade com preview vivo |
| C212 | P1 | DONE | C211 | Quatro modelos estruturais de site por segmento |
| C213 | P1 | DONE | C210,C211,C212 | Criar/duplicar tenant demo escolhendo o modelo |
| C214 | P1 | READY | C213 | Logo e mídia fictícia com Storage isolado |
| C220 | P1 | BLOCKED | C210 | Templates e variantes de cadastro editorial |
| C221 | P1 | BLOCKED | C220 | Distribuição e overrides por tenant |
| C230 | P1 | BLOCKED | C212,C214 | Densidade editorial e navegação mobile |
| C240 | P1 | BLOCKED | C213,C214,C221,C230 | Matriz final de QA e auditoria adversarial |
| C250 | P0 | DONE | C205,C212 | Separar Abrafarma/Broadcast Saúde, adotar conteúdo real autorizado e ticker setorial |
| C251 | P0 | DONE | C211,C250 | Corrigir upload de logo de até 2 MB e confirmar persistência da identidade no portal |
| C252 | P0 | DONE | C250 | Adicionar análise sobre canetas emagrecedoras sem substituir pautas existentes |
| C253 | P0 | VERIFY | C213 | Catalogar a pauta BV Educação e compartilhá-la com o padrão de crédito |

`C205` é uma entrega editorial independente: melhora a densidade e a variedade
do MVP publicado, mas não altera as dependências técnicas de `C214`, `C220`,
`C221`, `C230` ou `C240`.

## Critérios por tarefa

### T001

- inicializar Git local se `.git` não existir;
- App Router.
- TypeScript strict.
- pnpm e lockfile.
- lint, typecheck, test e build definidos.
- `.env.example`.
- sem segredos no Git.

### T002

- tokens semânticos;
- layout responsivo;
- componentes acessíveis;
- navegação pública e ADM;
- aviso de demonstração previsto.

### T003

- migrations no repositório;
- RLS habilitado;
- grants e revokes explícitos;
- sem escrita `anon`;
- policies de tabelas e Storage aplicadas em migration;
- objetos de Storage prefixados/isolados por tenant;
- nenhuma service/secret key no browser;
- client server-side;
- teste real de escrita anônima negada;
- teste negativo entre tenants;
- teste negativo de acesso a objeto de outro tenant no Storage;
- views apenas com `security_invoker` ou fora de schema exposto;
- advisor de segurança revisado;
- projeto ID documentado sem segredos.

### T004

- reset idempotente;
- reset recusado fora de ambiente local/demo;
- `is_demo = true`;
- três tenants;
- 24 matérias;
- conteúdo não atribuído a instituições reais;
- estados e fallbacks cobertos.

### T005

- login validado no servidor;
- comparação timing-safe;
- `DEMO_SESSION_SECRET` validado e com tamanho mínimo;
- cookie assinado por HMAC ou biblioteca consolidada, HttpOnly, SameSite Strict e Secure na Vercel;
- maxAge/expiração definida;
- credenciais vindas do ambiente;
- `/admin`, Server Actions e Route Handlers protegidos;
- proteção de origin/CSRF nas mutações;
- rate limit simples do login;
- logout;
- teste de sucesso e falha;
- banner `Modo demonstração - autenticação real desativada`.

### T006

- CRUD persistente;
- status draft/published/paused;
- filtro por tenant;
- confirmação em pausa;
- erros e vazios;
- grava evento básico com ator `demo-operator`; a consulta/página completa fica em T011.

### T007

- home, editoria e matéria;
- tenant resolvido;
- `noindex, nofollow`;
- aviso público;
- demos fora do sitemap;
- desktop e mobile.

### T008

- logo/nome textual, paleta e tipografia;
- variantes aprovadas;
- preview desktop/mobile;
- validação de contraste;
- tema salvo no Supabase;
- sem CSS/JS livre.

### T009

- Banco Demo Horizonte;
- Seguros Demo Atlas;
- Healthtech Demo Lúmen;
- mesma base de componentes;
- conteúdo e destaque diferentes;
- troca sem rebuild.

### T010

- apenas conteúdo do tenant;
- `demo: true`;
- filtro simples;
- header `X-Robots-Tag: noindex, nofollow`;
- sem alegação de API comercial.

### T011

- lista de eventos por tenant;
- ator, ação, alvo e horário;
- criação/edição/publicação/pausa/retomada;
- nenhuma secret ou corpo integral nos eventos;
- gate revalidado no servidor.

### T012

- 390 px e 1440 px;
- teclado e foco;
- contraste;
- loading, vazio e erro;
- sem overflow;
- sem matéria fictícia indexável;
- screenshots/evidências.

### T013

- build limpo;
- variáveis documentadas;
- migrations aplicadas;
- preview funcional;
- smoke manual mínimo de login, sessão, ADM e logout em Preview/Production;
- nenhum segredo no bundle;
- Vercel conectada ao Git.

### T014

- auditor independente revisa diff acumulado e app publicado;
- valida todos os critérios de `docs/01-escopo-mvp.md`;
- achados P0/P1 corrigidos e reverificados;
- `STATUS.md` contém URL, commit, checks e limitações;
- nenhuma tarefa P0 permanece aberta sem justificativa.

### C201

- `docs/17` a `docs/21` aprovados;
- escopo incluído/excluído explícito;
- papéis de líder, executor, verificador e auditor adversarial;
- matriz de evidências;
- prompt executável do ciclo.

### C202

- transformar o smoke manual de T013 em fluxo repetível e automatizado;
- Preview e Production;
- login inválido e válido;
- sessão 200 e 401;
- Conteúdo, Identidades e Auditoria;
- logout;
- falha produz evidência e impede promoção.

### C203

- registrar commit e URLs vigentes;
- smoke publicado de C202 aprovado;
- capturar home, login, Conteúdo e Identidades em 390 px e 1440 px;
- consolidar achados em P0/P1/P2;
- zero P0 aberto;
- P1 recebe tarefa/dono antes de liberar C210;
- não implementar melhoria visual nesta tarefa.

### C204

- `/` sem query usa o tenant demonstrativo publicado como padrão global;
- `?tenant=<slug>` continua sendo um preview direto e não altera o padrão;
- trocar o contexto do ADM não publica silenciosamente a marca;
- ação explícita confirma que a URL pública mudará para todos;
- configuração singleton persistida com FK, RLS forçada e acesso server-only;
- gravação valida tenant demo, revisão concorrente e sessão no servidor;
- mudança e valor anterior ficam na trilha de auditoria;
- configuração ausente ou inválida falha fechado, sem fallback cruzado;
- invalidar a home após a mudança e validar 390 px e 1440 px;
- não criar tenant nem aprofundar o workbench de identidade nesta tarefa.

### C210

- tenant ativo único aparece no cabeçalho;
- seleção persiste entre Conteúdo, Identidades e Auditoria;
- links administrativos preservam o contexto;
- ações continuam validando tenant no servidor;
- ação fora do contexto exige confirmação;
- teste negativo A → B;
- não criar/duplicar tenant ainda.

### C211

- seletor de cor e hexadecimal sincronizados;
- preview local antes de salvar;
- 390/768/1440;
- alterações pendentes, desfazer e restaurar preset;
- validação de contraste em tempo real e no servidor;
- salvar/recarregar versão vigente;
- não criar nova marca nem histórico/rollback.

### C212

- quatro IDs de modelo aprovados e persistidos no tema;
- serviços financeiros/crédito, investimentos/gestão, seguros/previdência e
  saúde/farma com composições estruturalmente distintas;
- mesma base segura de componentes;
- home, editoria e matéria respeitam o modelo;
- quatro homes em 390 e 1440;
- modelos distinguíveis em escala de cinza e sem logo;
- conteúdo essencial visível com movimento reduzido;
- nenhuma diferença depende apenas de cor, fonte ou alinhamento;
- modelo inválido falha fechado, sem fallback de outro tenant;
- não criar matéria, editoria ou taxonomia;
- não criar tenant ou mídia.
- concluída em 27/07/2026: registro tipado, parser fechado, persistência
  versionada, migration remota, quatro composições de home/editoria/matéria,
  advisors e matriz de Preview aprovados; P0/P1 pendentes: zero.

### C213

- criar quarta marca demo de serviços financeiros/crédito sem editar código;
- escolher um dos quatro modelos antes de personalizar a marca;
- duplicar tema/placements/distribuições por referência;
- nunca duplicar corpo canônico;
- slug único, `kind/status=demo` e `is_demo=true`;
- troca sem rebuild;
- salvar/recarregar o modelo no preview e no portal;
- auditoria e teste negativo;
- não implementar upload de logo nesta tarefa.
- progresso visual em 27/07/2026: seleção fechada dos quatro modelos no
  cadastro/edição, RPC versionada e quarta marca persistida; tarefa liberada
  para completar e validar o fluxo operacional de criação/duplicação.
- progresso em 29/07/2026: `createIdentityAction` agora coberto por testes
  automatizados (happy, falha de RPC por slug colidindo, confirmação A→B e
  negação de preset adulterado); `pnpm lint`, `pnpm typecheck`, `pnpm test`
  (128 testes) e `pnpm build` aprovados; permanecem como gates para `DONE` o
  teste transacional remoto com rollback (exige `DATABASE_URL`) e a validação
  de browser em 390/1440 + Preview/smoke.
- concluída em 20/08/2026: `bv-educacao` cadastrada pelo fluxo real, com tema,
  distribuições por referência, auditoria e marca persistidos no Supabase;
  produção validada em 390/1440 e deploy da `main` aprovado na Vercel.

### C214

- upload de logo/imagem fictícia no bucket privado;
- chave prefixada por tenant;
- MIME, tamanho, dimensões, alt, crédito e direito;
- leitura e remoção recusadas para outro tenant;
- fallback seguro;
- nenhuma mídia real ou upload livre.

### C220

- templates: padrão, explicador/análise, patrocinada fictícia, correção e sem
  mídia;
- campos condicionais e labels obrigatórios;
- erro preserva dados e foca o campo;
- submissão dupla bloqueada;
- listar/filtrar tipo, correção, patrocínio e mídia;
- não editar distribuição nesta tarefa.

### C221

- selecionar dois ou mais tenants de destino;
- editar headline/subtitle override;
- revogar um destino sem afetar os demais;
- pausa/retomada preserva destinos;
- corpo canônico permanece único;
- auditoria e teste negativo A → B;
- apenas canal portal demonstrativo.

### C230

- hero mais compacto ou grade acima da dobra;
- metadados editoriais nos cards;
- navegação mobile com indicação clara de rolagem/menu;
- imagens fictícias variadas do catálogo aprovado;
- sem overflow e com foco/zoom 200%;
- comparação dos quatro modelos em 390/1440;
- não alterar workflow ou schema editorial.
- progresso antecipado em 27/07/2026: ticker contínuo com ações/moedas, seção
  editorial por categorias e rodapé robusto entregues e validados em
  390/1440; `C230` permanece `BLOCKED` até `C212` e `C214` serem concluídas e a
  matriz completa das quatro marcas poder ser executada.

### C240

- matriz de `docs/20` executada;
- quatro marcas × portal/CMS/identidade;
- login, tenant, distribuição, mídia e origem auditados adversarialmente;
- advisors Supabase revisados após todo DDL;
- secret scan e bundle scan;
- Preview e Production sem P0/P1;
- commit, URLs, checks, screenshots e limitações em `STATUS.md`.

### C250

- preservar o tenant e a identidade já aprovados da Abrafarma;
- criar o tenant `broadcast-saude` no modelo `health-pharma`, sem duplicar
  conteúdo canônico;
- usar `abrafarma` e `broadcast-saude` como slugs públicos;
- manter publicada e em `home.hero` a matéria já aprovada de IA;
- mover as demais matérias antigas da vertical de saúde para rascunho ou
  retirar apenas suas distribuições nessa vertical, sem exclusão física;
- cadastrar uma única vez as matérias reais autorizadas do DOCX, preservando
  literalmente títulos e textos, exceto ajustes mecânicos de espaçamento;
- consolidar apenas a duplicidade exata da matéria da Bayer;
- cadastrar as editorias Empresas, M&A, RelGov, Investimentos, Regulação,
  Pesquisa, Tecnologia e Inovação, Análise e Radar da Imprensa;
- distribuir o catálogo real para Abrafarma e Broadcast Saúde por referência;
- incluir no modelo de saúde o ticker setorial com ativos validados e fallback
  sem preço falso quando a fonte autenticada não estiver configurada;
- validar fidelidade textual, isolamento, 390/768/1440, conteúdo pausado,
  lint, tipos, testes, build e auditor independente sem P0/P1.

### C253

- catalogar as 18 matérias fornecidas na pasta `BV` e os três vídeos indicados
  no briefing, preservando título, autoria, data, origem e link;
- criar as editorias Indicadores, Investimentos, Alerta de golpes, Programando
  o futuro, Isso ou aquilo, Saia das dívidas, Alívio no orçamento, Guias,
  Dicas valiosas e Glossário;
- manter um único conteúdo canônico e distribuir por referência para todos os
  tenants ativos do modelo `financial-services-credit`;
- registrar autorização, procedência, direitos e caráter externo dos vídeos;
- não criar conteúdo para Glossário enquanto não houver verbetes ou links;
- validar idempotência, isolamento de tenants, navegação, rota JSON, portal em
  390/1440, lint, tipos, testes e build.

## Como desbloquear

Ao concluir uma tarefa, atualizar para `DONE` e trocar dependentes de `BLOCKED` para `READY` quando todas as dependências estiverem concluídas e nenhuma decisão externa faltar.

T013 e T014 estão concluídas: login, sessão, páginas protegidas e logout foram
reverificados em Preview e Production, e o auditor independente aprovou o commit
final sem achados P0/P1. No estado atual, `C212` está concluída e `C213` é a
próxima tarefa executável.
