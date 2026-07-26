# Status do MVP-0

Atualizado em: 26/07/2026.

## Estado

- documentação de produto: concluída;
- recorte MVP-0: concluído;
- auditoria independente da documentação: aprovada, sem bloqueios P0/P1;
- aplicação: scaffold, estrutura visual e gate ADM aprovados;
- Git: branch `agent/mvp0-specification` acompanhada no remoto; este arquivo registra evidências por commit e deploy;
- GitHub: implementação publicada em `rafastos-io/Portaldenoticias`, branch `agent/mvp0-specification`, PR draft `#1` aberta para `main`;
- Supabase: projeto definitivo `Portaldenoticias` (`yhatwpxsxntlorfgxpdl`), `us-east-2`, Postgres 17, ativo e saudável;
- Vercel: projeto `portaldenoticias` conectado e acessível por conector/CLI;
- domínio público vigente: `https://portaldenoticias-five.vercel.app`;
- domínio `https://portaldenoticias.vercel.app`: projeto antigo, fora do MVP atual;
- tarefa concluída: `T001`;
- tarefa concluída: `T002`;
- tarefa concluída: `T003`;
- tarefa concluída: `T004`;
- tarefa concluída: `T005`;
- tarefa concluída: `T006`;
- tarefa concluída: `T007`;
- tarefa concluída: `T008`;
- tarefa concluída: `T009`;
- tarefa concluída: `T010`;
- tarefa concluída: `T011`;
- tarefa concluída: `T012`;
- tarefa `T013`: em andamento para corrigir/republicar o login;
- tarefa `T014`: bloqueada até a reverificação publicada;
- Ciclo 2: documentação `docs/17` a `docs/21` e prompt operacional criados.

## Bloqueios externos

Nenhum bloqueio de acesso ativo. Antes de fechar `T013`, ainda é obrigatório
publicar a correção em Preview, executar o smoke e promover/reverificar
Production.

O incidente histórico da secret exposta apenas no working tree continua
registrado. A varredura anterior confirmou zero ocorrências rastreadas; qualquer
deploy novo deve repetir a verificação do bundle.

## Auditoria de produção — 26/07/2026

### URLs e proteção

- deployment auditado:
  `portaldenoticias-dnh46i58q-raafastosgmailcoms-projects.vercel.app`;
- o URL gerado possui Vercel Authentication/Standard Protection e não serve
  como link público de pitch;
- aliases do projeto incluem `portaldenoticias-five.vercel.app`;
- o alias público retorna o MVP atual sem exigir login da Vercel.

### Falha reproduzida

- `/admin/login` carregou com o formulário e `USER / User123`;
- a submissão retornou
  `Não foi possível validar a origem da solicitação`;
- a falha ocorre antes da validação de credenciais;
- causa: `x-forwarded-host` era priorizado e o `host`/alias público ficava fora
  da lista de origens exatas.

### Correção local

- a origem agora é comparada com `host` e `x-forwarded-host`;
- aliases exatos de `VERCEL_PROJECT_PRODUCTION_URL` e `VERCEL_URL` são aceitos;
- origem externa continua recusada;
- placeholders que começam com `replace-with-` são recusados como segredo;
- Next Server Actions recebem aliases exatos adicionais, sem wildcard;
- teste focado: 10 casos aprovados;
- lint e typecheck aprovados;
- browser local: login redirecionou para `/admin`;
- `/api/admin/session` retornou ator `demo-operator` e `demo=true`;
- logout retornou para `/admin/login`.

### Evidências visuais

Pasta: `artifacts/audit-2026-07-26/`.

- produção antiga incorreta;
- deployment protegido pela Vercel;
- home do MVP;
- login desktop/mobile;
- falha de origem publicada.

### Supabase

- advisor de segurança: zero alertas;
- advisor de performance: apenas avisos informativos de índices ainda não
  usados;
- nenhuma migration foi criada nesta correção.

### Próximo passo

Publicar Preview, repetir o smoke, promover Production e acionar o verificador
independente de `T014`. O `pnpm check` final já passou com 53 testes.

## Evidências de implementação

### T001 — scaffold

- Next.js 16.2.11 App Router, React 19.2.8 e Tailwind 4.3.3;
- TypeScript 6.0.3 em modo `strict`;
- dependências fixadas, `pnpm-lock.yaml` gerado para versionamento e workspace local isolado;
- `pnpm check`: lint, typecheck, 1 teste e build concluídos;
- build de produção gerou `/` e `/_not-found` sem erro;
- navegador real: 390 x 844 e 1440 x 900, sem overflow horizontal;
- metadado `noindex, nofollow` confirmado na página inicial;
- remoto Git preexistente não foi alterado; nenhum push ou deploy realizado.
- auditoria independente: P1 de runtime corrigido com Node 22+; reverificação aprovada sem P0/P1.

### T002 — estrutura visual base

- tokens semânticos de cor, tipografia, espaço, foco e movimento em `globals.css`;
- shell público com aviso demo, skip link, navegação, hero editorial e rodapé;
- shell ADM responsivo com aviso permanente, navegação, tenant ativo e tabela;
- asset editorial original gerado para o projeto, sem texto, marca ou instituição real;
- `pnpm check`: lint, typecheck, 1 teste e build concluídos;
- build de produção gerou `/`, `/admin` e `/_not-found` sem erro;
- navegador real em 390 x 844 e 1440 x 900: sem overflow horizontal da página;
- `noindex, nofollow`, um `h1`, aviso demo e textos alternativos confirmados;
- tabela do ADM e navegação pública usam rolagem contida quando necessário.
- auditoria independente: dois P1 de contraste corrigidos; reverificação aprovada sem P0/P1.

### T005 — gate demonstrativo do ADM

- credenciais vindas do ambiente, com defaults documentados `USER / User123`;
- `DEMO_SESSION_SECRET` obrigatório, sem placeholder e com mínimo de 32 bytes;
- comparação de credenciais com digests fixos e `timingSafeEqual`;
- sessão stateless assinada por HMAC-SHA256, duração de 4 horas e ator `demo-operator`;
- cookie `HttpOnly`, `SameSite=Strict`, `Secure` em produção/Vercel, `Path=/`, `maxAge` e prioridade alta;
- `/admin` protegido em layout dinâmico; actions e Route Handler revalidam a sessão no servidor;
- mutações validam `Origin` contra host/protocolo ou `NEXT_PUBLIC_APP_URL`;
- rate limit simples por endereço: 5 tentativas em 10 minutos, com armazenamento limitado por processo;
- login com erro acessível, logout e aviso permanente de autenticação real desativada;
- `pnpm check`: lint, typecheck, 10 testes e build concluídos;
- navegador real: acesso sem sessão redireciona, credencial inválida falha, credencial válida entra e logout volta a bloquear;
- login em 390 x 844 e 1440 x 900 sem overflow horizontal;
- `/api/admin/session` sem cookie retorna 401, `Cache-Control: private, no-store` e `X-Robots-Tag: noindex, nofollow`;
- `.env.local` usado apenas no teste local e confirmado como ignorado pelo Git.
- auditoria independente: aprovada sem P0/P1.

### T003 — Supabase, migrations e isolamento

- projeto definitivo `Portaldenoticias` (`yhatwpxsxntlorfgxpdl`) confirmado ativo em `us-east-2`, Postgres 17;
- três migrations aplicadas e alinhadas ao histórico remoto: `initial_mvp0_schema`, `add_foreign_key_indexes` e `harden_public_privileges`;
- 15 tabelas públicas multi-tenant criadas, todas com RLS habilitado e forçado;
- papel `PUBLIC` sem uso do schema ou privilégios herdados; `anon` e `authenticated` sem `SELECT` ou escrita nas tabelas públicas; `service_role` recebeu privilégios explícitos;
- teste HTTP real de `INSERT` com publishable key retornou `401 / 42501 permission denied`;
- nenhuma view foi criada; funções privilegiadas ficam no schema privado, com `search_path` vazio e execução revogada do público;
- bucket privado `demo-media`, limite de 8 MiB e MIME types de imagem aprovados;
- chaves de Storage exigem prefixo `<tenant_uuid>/`; trigger recusa prefixo de tenant inexistente;
- teste real transacional: um objeto do tenant B consultado como `anon` retornou zero linhas;
- repository privilegiado sempre filtra `owner_tenant_id` e `id`; teste negativo A → item B retorna `null`;
- helper server-side recusa chave de Storage de outro tenant; teste unitário negativo incluído;
- cliente tipado do Supabase importa `server-only`, aceita somente URL segura e chave moderna `sb_secret_`;
- tipos TypeScript foram gerados a partir do schema remoto;
- advisor de segurança: zero alertas;
- advisor de desempenho: chaves estrangeiras indexadas; permanecem apenas avisos informativos de índices ainda não usados porque o banco está sem seed;
- `pnpm check`: lint, typecheck, 15 testes e build concluídos.
- auditoria independente: proteção incompleta do reset e dois P2 do parser de conexão corrigidos; reverificação aprovada sem P0/P1/P2.
- auditoria independente: P1 de teste privilegiado entre tenants e P2 de validação de chave corrigidos; reverificação final aprovada sem P0/P1/P2.

### T004 — catálogo fictício e reset

- `supabase/seed.sql` usa UUIDs determinísticos e `UPSERT`; três execuções consecutivas mantiveram as mesmas contagens;
- quatro operações persistidas: tenant editorial da plataforma e os três clientes fictícios Banco Demo Horizonte, Seguros Demo Atlas e Healthtech Demo Lúmen;
- catálogo remoto validado com 24 matérias e 24 revisões, 5 autores fictícios, 6 editorias, 12 tags e 48 vínculos de tags;
- cada matéria contém título, linha fina e 4 parágrafos; 23 usam fallback visual próprio e 1 cobre o estado sem imagem;
- casos obrigatórios: 3 patrocinadas rotuladas, 1 pausada, 1 draft com `scheduled_at`, 1 nota de correção;
- 31 distribuições apontam para apenas 24 itens canônicos, sem duplicação por tenant; 9 placements e 3 temas publicados são distintos;
- isolamento de curadoria validado: Horizonte tem 10 conteúdos distintos, Atlas 11 e Lúmen 10; estados pausado/draft não aparecem como ativos;
- todos os registros aplicáveis consultados têm `is_demo = true`;
- migrations `add_guarded_demo_reset` e `harden_demo_reset_guard` mantêm a função destrutiva em schema privado, verificam todas as tabelas com `is_demo` e removem `EXECUTE` de `PUBLIC`, `anon`, `authenticated` e `service_role`;
- reset sem ambiente explícito foi recusado; reset autorizado com ambiente `demo` e confirmação literal limpou e restaurou o catálogo na mesma transação;
- script `pnpm demo:reset` também recusa Production e exige que a conexão corresponda ao banco local ou ao project ID demo documentado;
- advisor de segurança após seed/reset: zero alertas;
- `pnpm check`: lint, typecheck, 15 testes e build concluídos.

### T006 — CMS editorial

- tela protegida lista e filtra matérias pelo `owner_tenant_id` do tenant selecionado, com estados vazio, carregando e erro de configuração;
- formulários server-side criam rascunho e nova revisão, com validação de título, linha fina, corpo, UUIDs, autor e editoria;
- actions revalidam cookie demonstrativo e origem antes de qualquer mutação;
- transições aceitas: rascunho para publicado, publicado para pausado e pausado para publicado;
- pausa exige motivo e confirmação explícita na interface e novamente no servidor;
- RPCs transacionais usam `security invoker`, `search_path` vazio e `EXECUTE` exclusivo de `service_role`;
- triggers de integridade recusam autoria ou editoria que não pertença à plataforma ou ao tenant do conteúdo;
- imagem principal permite o asset editorial gerado ou exceção explícita sem imagem; texto alternativo é validado no servidor e persistido em `body_json`;
- pausa canônica fotografa em auditoria apenas os destinos ativos, pausa esses IDs e retoma somente os mesmos; estados `draft`, `revoked` e `expired` permanecem inalterados;
- teste remoto em transação validou criar, editar, publicar, pausar e retomar, com cinco eventos de auditoria e ator `demo-operator`; rollback preservou as 24 matérias do seed;
- testes remotos negativos recusaram editar item de outro tenant e associar autor de outro tenant;
- advisor de segurança após as migrations: zero alertas;
- 22 testes locais aprovados; `pnpm check` (lint, typecheck, testes e build) aprovado;
- navegador real em 390 x 844 e 1440 x 900: gate e estado de erro responsivos, sem overflow horizontal;
- limitação externa: sem `SUPABASE_SECRET_KEY` no ambiente local, a leitura e as mutações reais da UI não puderam ser exercitadas pelo navegador; o fluxo persistente foi validado diretamente no banco.
- auditoria independente: duas rodadas de correção cobriram imagem, pausa cruzada e preservação de autorizações por destino; reverificação final aprovada sem P0/P1/P2 de implementação.

### T007 — portal público persistente

- home, editoria e matéria são renderizadas no servidor a partir de distribuições `active` com canal `portal` e conteúdo canônico `published`;
- tenant é resolvido por slug explícito e cada link público preserva o contexto; slug desconhecido retorna 404, sem fallback para outro cliente;
- home respeita placements ativos e janelas de publicação; títulos e linhas finas podem usar overrides sem duplicar a revisão canônica;
- matéria exibe autoria fictícia, editoria, quatro parágrafos, patrocínio, nota de correção e exceção sem imagem quando aplicável;
- query remota validou Horizonte com 10 itens públicos, Atlas com 10 e Lúmen com 9; draft e conteúdo pausado não vazam;
- aviso público, `noindex, nofollow`, `robots.txt` com `Disallow: /` e ausência de sitemap confirmados;
- estados loading, vazio e erro foram implementados;
- navegador real em 390 x 844 e 1440 x 900: tenant Lúmen resolvido no shell, aviso/robots presentes e sem overflow horizontal;
- `pnpm check`: lint, typecheck, 26 testes e build concluídos;
- limitação externa: sem `SUPABASE_SECRET_KEY` local, as páginas persistentes completas não puderam ser percorridas no navegador; consultas equivalentes foram verificadas no banco remoto.
- auditoria independente: aprovada sem P0/P1; P2 registrados para ampliar testes automatizados dos filtros públicos e consumir mais overrides de placement nas tarefas de identidade.

### T008 — central de identidade white-label

- rota protegida `/admin/identidade` permite selecionar um tenant e editar nome/logo textual, slogan, cinco cores, tipografia e variantes aprovadas de cabeçalho, hero e cartões;
- formulário e Server Action revalidam sessão demo, origem, UUID, limites de texto, cores hexadecimais, allowlists e contraste WCAG mínimo de 4,5:1;
- JSONs persistidos também passam pelo parser seguro antes de chegar ao runtime; valores desconhecidos não são convertidos em estilos;
- previews de 1440 px e 390 px usam iframes das próprias rotas públicas, garantindo o mesmo resolvedor, componentes e conteúdo do portal;
- migration `add_cms_theme_update` atualiza transacionalmente apenas a versão vigente do tenant demo e grava `theme.updated` com ator `demo-operator`;
- RPC usa `security invoker`, `search_path` vazio, argumentos não nulos e `EXECUTE` exclusivo de `service_role`;
- teste remoto em transação confirmou persistência na versão correta e rollback sem alterar o seed; variante não aprovada e tenant fora do escopo demo foram recusados;
- advisor de segurança: zero alertas;
- navegador real em 390 x 844 e 1440 x 900: rota protegida, aviso demo, `noindex,nofollow`, navegação ativa e ausência de overflow confirmados;
- `pnpm check`: lint, typecheck, 32 testes e build concluídos;
- limitação externa: sem `SUPABASE_SECRET_KEY` local, o formulário persistente e os previews completos não puderam ser exercitados ponta a ponta no navegador;
- auditoria independente: três P1 de contraste, leitura não validada e preview paralelo corrigidos; reverificação final aprovada sem P0/P1.

### T009 — três tenants visualmente distintos

- o tema publicado é resolvido no servidor por `tenant_id` e `published_version_id` a cada request, sem rebuild e sem qualquer acesso Supabase no navegador;
- `PublicShell`, `PublicHeader`, hero e `StoryList` são a mesma base de componentes para os três tenants e recebem somente tokens/variantes aprovados;
- Horizonte usa editorial/azul, Atlas humana/verde e Lúmen geométrica/roxo, com cabeçalhos, heroes e cartões distintos;
- curadoria persistida define três heroes diferentes e os overrides de eyebrow `Planejamento`, `Proteção` e `Ciência`;
- consulta remota confirmou 10 itens públicos para Horizonte, 10 para Atlas e 9 para Lúmen, além de temas e destaques diferentes;
- troca real por `?tenant=` no navegador alterou marca, fonte e paleta sem rebuild; 390 px e 1440 px permaneceram sem overflow;
- parser de tema valida primária/branco, primária/fundo e texto/fundo em 4,5:1 antes de criar variáveis CSS;
- 33 testes e `pnpm check` completos aprovados; após o reforço de contraste, 12 testes focados e typecheck também passaram;
- limitação externa: sem `SUPABASE_SECRET_KEY` local, as homes completas não puderam ser renderizadas no navegador; o estado de erro seguro confirmou os tokens por tenant e os dados completos foram validados no banco;
- auditoria independente: aprovada sem P0/P1; o P2 de contraste da seleção foi corrigido, e permanece apenas a particularidade documentada do App Router poder responder 200 em `notFound()` após streaming, sempre com `noindex`.

### T010 — rota JSON demonstrativa

- `GET /api/demo/content` exige um tenant demonstrativo explícito, aceita filtro opcional por `editoria` e fixa `status=published`;
- a implementação reutiliza o repository público, portanto mantém filtros por tenant, distribuição ativa, canal portal, janela e revisão publicada;
- resposta expõe apenas metadados editoriais resumidos, inclui `demo: true` e disclaimer que nega credenciais comerciais, SLA e garantia de compatibilidade;
- estados 400, 404, 405 e 503 também retornam JSON com `demo: true`, `Cache-Control: private, no-store` e `X-Robots-Tag: noindex, nofollow`;
- POST, PUT, PATCH, DELETE e OPTIONS retornam 405 explícito com `Allow: GET`;
- HTTP local confirmou 503 seguro sem chave, 404 para tenant desconhecido, 400 para status não público e 405 para método não permitido;
- testes verificam isolamento da chamada por tenant, filtro de editoria, recusa de draft, erros e headers;
- `pnpm check`: lint, typecheck, 42 testes e build concluídos;
- auditoria independente: P1 do 405 automático sem headers/corpo corrigido; reverificação final aprovada sem P0/P1.

### T011 — trilha de auditoria mínima

- rota protegida `/admin/auditoria` revalida o gate no layout dinâmico e possui navegação ativa dedicada;
- consulta server-only exige `tenant_id`, `is_demo=true`, allowlist de ações e limite de 100 eventos;
- projeção seleciona somente ID, ator, ação, alvo, motivo e horário, sem snapshots, secrets, IP, request ID, user agent ou corpo editorial;
- UI filtra tenant/ação e cobre tabela, vazio e erro seguro;
- seed idempotente inclui cinco eventos append-only por tenant: criação, edição, publicação, pausa e retomada;
- os 15 eventos usam `demo-operator`, `is_demo=true`, snapshots mínimos e alvos pertencentes ao tenant;
- `ON CONFLICT (id) DO NOTHING` foi validado remotamente contra o trigger append-only, mantendo uma única linha;
- navegador real em 390 px e 1440 px confirmou gate, aviso demo, noindex, link correto, estado ativo e ausência de overflow;
- `pnpm check` passou com 44 testes; teste adicional congela `tenant_id`, `is_demo` e a projeção segura;
- auditoria independente: dois P1 de link incorreto e conflito com append-only corrigidos; reverificação final aprovada sem P0/P1/P2.

### T012 — QA integrada desktop/mobile

- ambiente local conectado ao projeto Supabase definitivo por secret moderna exclusivamente server-side; `.env.local` está ignorado pelo Git;
- portal completo validado nos três tenants em 390 px e 1440 px, com marcas, temas, heroes e catálogos isolados e sem overflow horizontal;
- home, editoria, matéria, correção fictícia e conteúdo patrocinado foram percorridos no navegador com imagens, textos alternativos, aviso público e `noindex, nofollow`;
- gate demonstrativo recusou credencial inválida, aceitou `USER` / `User123`, redirecionou visitante sem cookie e exibiu o aviso de autenticação real desativada;
- CMS persistente criou nova revisão, pausou e retomou uma matéria, refletiu o estado imediatamente na rota JSON e preservou o total de 24 itens;
- central de identidade salvou a versão vigente, confirmou três combinações de contraste AA e carregou previews reais de 1440 px e 390 px;
- auditoria registrou edição, imagem, pausa, retomada e identidade com tenant, ator e alvo, sem corpo editorial, secrets, IP ou user agent;
- estados loading, vazio, erro e sem permissão foram exercitados; skip link apresenta foco visível com outline e halo ao teclado;
- migrations `repair_demo_seed_utf8`, `repair_demo_settings_utf8` e `repair_cms_function_utf8` corrigiram dados e literais das RPCs; consultas remotas confirmaram zero sequências conhecidas de mojibake;
- rota JSON retorna `X-Robots-Tag: noindex, nofollow`, páginas têm meta robots equivalente e `/sitemap.xml` retorna 404;
- `.env.example` contém somente placeholders; a varredura confirmou zero ocorrências da secret atual em arquivos rastreados ou no histórico Git;
- bundle estático contém zero ocorrências do valor e do nome da secret; advisor de segurança do Supabase retorna zero alertas;
- as três páginas administrativas revalidam a sessão antes de qualquer consulta, além da proteção no layout e nas actions; HTTP anônimo confirmou zero vazamento de tenant, título, tema ou evento;
- `pnpm check`: lint, typecheck, 52 testes e build de produção concluídos;
- auditoria independente: P0 de secret no arquivo de exemplo, P1 de streaming paralelo sem gate na page e dois P2 documentais corrigidos; reverificação final aprovada sem P0/P1/P2.

## Última auditoria

O verificador independente identificou e as especificações passaram a cobrir:

- gate demo em vez de autenticação real;
- conteúdo fictício não indexável;
- Supabase com acesso server-side e RLS;
- Vercel como alvo;
- seed persistente e idempotente;
- API/RSS comercial fora do MVP-0;
- loop executor/verificador.

## Próxima ação do executor

Concluir `T013`: publicar a correção em Preview, executar login/sessão/logout,
promover Production e registrar URL, deployment, commit e evidências.
