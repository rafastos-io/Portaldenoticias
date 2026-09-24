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
| C253 | P0 | DONE | C213 | Catalogar a pauta BV Educação e compartilhá-la com o padrão de crédito |
| C254 | P0 | DONE | C253 | Incorporar vídeos e reforçar acessibilidade pública gratuita |
| C255 | P1 | READY | C254 | Avatar discreto de matérias relacionadas por categoria |
| C256 | P1 | DONE | C254 | Ajustar posicionamento, rodapé, navegação editorial e lista de notícias do BV Educação |
| C257 | P1 | DONE | C256 | Adicionar Jornada de crédito BV e Especialista responde ao catálogo autorizado |
| C258 | P0 | DONE | C257 | Restringir catálogo BV e exibir conteúdos distribuídos com segurança no Admin |

`C205` é uma entrega editorial independente: melhora a densidade e a variedade
do MVP publicado, mas não altera as dependências técnicas de `C214`, `C220`,
`C221`, `C230` ou `C240`.

## Ciclo 3 — revisão estrutural e nova frente

Este ciclo foi promovido pelo responsável em 31/08/2026. Enquanto `R301` a
`R305` não estiverem concluídas, tarefas `READY` do Ciclo 2 permanecem
tecnicamente prontas, mas não devem introduzir nova superfície no portal. O
protocolo está em `docs/25-protocolo-revisao-estrutural.md` e a baseline em
`docs/26-auditoria-estrutural-2026-08-31.md`.

| ID | Pri. | Estado | Dependências | Entrega |
|---|---|---|---|---|
| R300 | P0 | DONE | - | Criar branch, protocolo, baseline automatizada e relatório priorizado |
| R301 | P0 | DONE | R300 | Tornar cadastro editorial e metadados uma única transação sem perda de JSON |
| R302 | P1 | DONE | R301 | Substituir preview paralelo pelo renderer real compartilhado |
| R303 | P1 | DONE | R302 | Consolidar `site_model`, registro de componentes e paridade TypeScript/SQL |
| R304 | P1 | READY | R303 | Remover código morto confirmado, exceções por slug e reconciliar documentação — **pendência de segurança adiada, obrigatória antes de migrar `bv-educacao` ou abrir um sexto modelo** |
| R305 | P1 | BLOCKED | R304 | Versionar matriz E2E dos cinco modelos e corrigir atritos mobile — **pendência de segurança adiada, mesma condição de R304** |
| R310 | P1 | DONE | D34 | Implementar o quinto modelo `automotive-mobility` e o tenant isolado `financiacar` — promovido a produção em 24/09/2026 |
| R311 | P1 | BLOCKED | R310 | Matriz local/Preview do novo modelo e auditoria adversarial |

Emenda de 23/09/2026: D34 foi decidida (briefing FinanciaCar/Banco BV). O
responsável autorizou antecipar `R310` antes de `R304`/`R305` porque a entrega
cria um tenant novo e isolado e não altera nenhum tenant existente. `R304` e
`R305` continuam obrigatórias e voltam a ser a prioridade assim que o
FinanciaCar estabilizar. Registro na CENTRAL:
`Freelancers/05 - Decisões/DEC-2026-09-02 - Definir o quinto modelo do Broadcast`.

Emenda de 24/09/2026: junto com R310 foram para produção o título de aba e o
favicon por cliente e a restauração da navegação própria do Crédito Demo Órbita
(migration `20260924010000`), que havia recebido o menu do catálogo BV em
20/08. Reexecutar `private.apply_bv_educacao_credit_catalog()` sobrescreve esse
menu; nesse caso, reexecutar `private.restore_orbita_navigation()`.

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

### C254

- incorporar vídeos autorizados do YouTube na página da matéria sem copiar a
  mídia e sem obrigar a saída do portal;
- restringir embeds a URLs HTTPS reconhecidas do YouTube e usar o domínio de
  privacidade reforçada;
- integrar VLibras e controles gratuitos de tamanho do texto, contraste e
  redução de movimento, mantendo navegação por teclado e preferências locais;
- manter ESLint JSX a11y e axe como gates automatizados, complementados por
  revisão manual WCAG 2.2 AA;
- validar 390/768/1440, teclado, movimento reduzido, vídeo, lint, tipos,
  testes, build, Preview e Production.

### C255

- exibir no canto inferior esquerdo um avatar opcional e não intrusivo,
  preservando o canto do VLibras;
- sugerir matérias correlatas da mesma categoria sem compartilhar dados entre
  tenants e sem cobrir controles de acessibilidade;
- respeitar movimento reduzido, fechamento, teclado, leitores de tela e
  persistência da preferência do visitante;
- definir frequência, copy, estados vazio/erro e medição antes de implementar.

### C256

- substituir referências genéricas a saúde e longevidade no cabeçalho e no
  rodapé do tenant `bv-educacao` por linguagem de educação financeira;
- preservar o texto dos demais modelos e tenants;
- esconder a scrollbar nativa da navegação editorial, mantendo rolagem por
  toque, trackpad, teclado e controles laterais acessíveis;
- indicar visualmente quando existem editorias fora da área visível;
- fazer chamadas sem imagem ocuparem a largura disponível na lista de notícias;
- validar 390/768/1440, foco, movimento reduzido, lint, tipos, testes e build.

### C257

- criar `Jornada de crédito BV` com sete pautas na ordem do briefing;
- publicar placeholders explícitos até o recebimento dos textos definitivos;
- criar `Especialista responde` com três vídeos externos fornecidos;
- não copiar vídeo, thumbnail ou transcrição do YouTube;
- preservar conteúdo canônico único e distribuir por referência somente para o
  tenant `bv-educacao` autorizado nesta solicitação;
- exibir todos os sete itens na página da editoria e manter a ordem editorial;
- validar idempotência, isolamento, direitos, embed, navegação, 390/1440,
  lint, tipos, testes, build e banco remoto.

### C258

- remover do `bv-educacao` somente as distribuições herdadas dos quatro tenants
  demonstrativos, preservando seus conteúdos canônicos;
- manter 31 conteúdos autorizados, 11 categorias com conteúdo e Glossário vazio;
- substituir os três placements legados da home por matérias BV autorizadas;
- usar a navegação publicada como allowlist para barra, home, editoria e matéria;
- listar no Admin conteúdos próprios e distribuídos, diferenciando origem;
- impedir edição canônica e ações de status em conteúdo apenas distribuído;
- validar isolamento, idempotência, portal/Admin em 390/1440, lint, tipos,
  testes, build, banco remoto, Preview e Production.

### R300

- preservar `main`, arquivos não rastreados e estado de origem;
- adotar protocolo repetível para incorreto, morto, inútil, atalho e dívida;
- executar baseline sem mutação externa;
- registrar achados P0/P1/P2 com evidência e ordem de correção;
- documentar gate específico para o quinto modelo.

### R301

- teste deve reproduzir perda/estado parcial antes da correção;
- conteúdo, revisão, mídia, tipo editorial e metadados são gravados na mesma
  transação;
- `body_json` preserva campos existentes por merge explícito;
- todo resultado de escrita é validado;
- erro e retry não criam item ou revisão duplicada;
- categoria e autoria pertencem ao tenant atual ou ao tenant de plataforma;
- teste negativo de tenant e rollback remoto antes de concluir.

### R302

- remover `LivePortalPreview` paralelo;
- home, editoria e matéria do preview usam os mesmos componentes do portal;
- dados de preview são fixtures tipadas, não uma segunda linguagem visual;
- mudanças não salvas continuam visíveis em 390/768/1440;
- contraste, estados sem imagem e modelo inválido são verificados.

### R303

- reconciliar divergências históricas local/remoto antes de criar a próxima
  migration estrutural, sem reaplicar DDL ou seeds já presentes;
- `site_model` passa a ser a fonte de verdade estrutural;
- compatibilidade de `header/hero/card` recebe fronteira e data de retirada;
- registro único associa ID, definição e componentes de home/editoria/matéria;
- allowlist SQL possui teste de paridade com TypeScript;
- migração é backward-compatible e falha fechado para ID desconhecido.

### R304

- confirmar e remover apenas órfãos reais;
- mover textos/links específicos de marca para configuração validada;
- eliminar fallback por slug ou restringi-lo explicitamente a fixture local;
- reconciliar `TASKS.md`, `STATUS.md`, `.env.example` e estado real;
- dividir arquivos grandes somente onde testes preservem comportamento.

### R305

- versionar o ensaio de seis tenants em 390/768/1440;
- atravessar home, primeira editoria e primeira matéria de um tenant por modelo;
- falhar em HTTP inesperado, modelo divergente, overlay, `pageerror`, conteúdo
  vazio ou overflow horizontal;
- capturar erros de console e registrar warnings de framework/performance;
- ampliar acessibilidade além do tenant BV sem duplicar regras por slug;
- separar pré-requisitos de `next dev`, Preview e Production para evitar falso
  negativo de rede/cookie;
- impedir que VLibras ou outro controle flutuante cubra conteúdo em 390 px.

### R310

- D34 decidida e registrada antes de editar código;
- novo modelo difere em ao menos seis eixos de `docs/22`;
- nenhuma árvore de rota, matéria ou CSS/JS arbitrário duplicado;
- nenhuma condicional por slug do tenant de validação;
- home, editoria e matéria usam o registro consolidado;
- troca e persistência sem rebuild; modelo inválido falha fechado.

### R311

- 390/768/1440, teclado, foco, zoom de 200% e reduced motion;
- com imagem, sem imagem, catálogo vazio e erro;
- teste negativo de tenant, modelo inválido e persistência;
- lint, tipos, testes, build, Preview e verificador independente;
- Production somente mediante autorização separada.

## Como desbloquear

Ao concluir uma tarefa, atualizar para `DONE` e trocar dependentes de `BLOCKED` para `READY` quando todas as dependências estiverem concluídas e nenhuma decisão externa faltar.

T013/T014 e C213 estão concluídas. A revisão promovida em 31/08/2026 fechou
`R300` e `R301`; o preflight transacional no banco oficial passou em 23/23
asserções e está documentado em `docs/28-evidencia-r301-banco-oficial.md`.
`R302` está `DONE`, com evidência em
`docs/29-evidencia-r302-renderer-compartilhado.md`. `R303` está `DONE`, com
evidência em `docs/30-evidencia-r303-registro-modelos.md`, e `R304` está
`READY`. O
relatório completo da baseline está em
`docs/27-relatorio-verificacao-completa-2026-08-31.md`. `C214` e `C255`
preservam estado `READY`, mas ficam congeladas até a matriz estrutural de
`R305`.
