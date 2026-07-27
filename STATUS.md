# Status do MVP-0

Atualizado em: 27/07/2026.

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
- tarefa concluída: `T013`;
- tarefa concluída: `T014`;
- Ciclo 2: documentação `docs/17` a `docs/21` e prompt operacional criados.
- tarefa concluída: `C202`;
- tarefa concluída: `C203`;
- tarefa concluída: `C210`;
- tarefa concluída: `C204`;
- tarefa em verificação: `C211` (`P1`, `VERIFY`);
- nenhuma tarefa `P0` permanece pronta ou aberta.

## Entrega rápida de portal e identidade — 27/07/2026

### Resultado implementado

- a tarja demonstrativa foi removida somente do portal público; o aviso
  obrigatório permanece no ADM;
- todos os acessos públicos ao ADM foram removidos do header e do footer; o
  gate continua disponível apenas por URL direta;
- o login não preenche mais as credenciais na tela e oferece exibir/ocultar
  senha; token de login, sessão assinada, cookie `HttpOnly`, rate limit e
  revalidação no servidor foram preservados;
- a home recebeu hero mais compacto, hierarquia de jornal, lista editorial
  densa, quatro imagens fictícias variadas e ticker diário de USD/EUR/GBP em
  BRL por API pública sem chave, com cache e atribuição;
- a matéria recebeu hierarquia editorial, imagem destacada e metadados mais
  claros;
- a central de identidade agora tem preview local vivo, cores sincronizadas,
  contraste, desfazer, páginas e larguras 390/768/1440;
- o ADM permite criar uma nova identidade demo por preset sem duplicar o corpo
  canônico e permite associar logo PNG/JPEG de até 2 MB no Storage privado,
  prefixado e validado por tenant;
- resíduos antigos de UTF-8 no corpo das matérias demonstrativas foram
  corrigidos no banco.

### Evidências

- `pnpm check`: lint, tipos, 21 arquivos de teste, 109 testes e build aprovados;
- browser no build de produção local: home, matéria, login e central de
  identidade aprovados em desktop e 390 px, sem overflow e sem overlay;
- login direto `USER / User123` redirecionou para `/admin`; os campos iniciaram
  vazios e o controle exibir/ocultar senha funcionou;
- preview da identidade refletiu nome não salvo, alternou página/largura e
  desfez a alteração sem persistir o teste;
- teste transacional do Supabase criou uma identidade temporária, copiou 10
  distribuições e 3 placements, associou logo e registrou 2 eventos; rollback
  aplicado;
- teste negativo recusou logo de outro tenant;
- advisor de segurança do Supabase: zero alertas;
- advisor de performance: somente avisos informativos preexistentes de índices
  ainda sem uso;
- migrations remotas reconciliadas com
  `20260727142807_create_demo_identity_and_logo.sql` e
  `20260727144320_repair_residual_demo_utf8.sql`;
- screenshots em `artifacts/c211-quick-sprint-2026-07-27/`.

### Limitação de entrega

- nenhuma publicação Vercel foi feita nesta sessão; o domínio público vigente
  continua servindo a versão anterior até Preview, smoke, auditoria independente
  e promoção autorizada.

## Refino rápido da home — mercados, editorias e rodapé — 27/07/2026

### Resultado implementado

- o ticker passou a combinar quatro ações brasileiras de referência e seis
  moedas em BRL, com cache server-side, data e fontes visíveis;
- a faixa replica os itens para movimento contínuo, pausa em hover/foco e
  desativa a animação para `prefers-reduced-motion`;
- a home ganhou uma seção própria de editorias em três colunas, com matéria
  dominante, chamadas compactas e continuidade “Mais de…”;
- o rodapé agora reúne posicionamento editorial, slogan, navegação, editorias e
  fechamento institucional, com composição responsiva;
- nenhum token, segredo ou chamada de mercado foi exposto ao navegador.

### Evidências

- 22 arquivos de teste e 111 testes aprovados; o primeiro ciclo registrou um
  timeout intermitente no teste Playwright preexistente e a repetição passou;
- lint, tipos e build de produção aprovados;
- browser em 1440 × 1000 e 390 × 844: zero overflow horizontal, zero imagem
  quebrada e zero erro de console;
- o ticker estava em execução e mudou para `paused` ao receber foco;
- comparação visual e capturas em
  `artifacts/c230-market-categories-footer-2026-07-27/`;
- `design-qa.md`: `passed`, sem achado P0/P1/P2 pendente.

### Limite de escopo

- a brapi sem token expõe somente a lista gratuita de teste; ampliar o universo
  de ações exige token configurado exclusivamente no servidor e uma decisão
  explícita de produto;
- nenhuma publicação Vercel foi feita nesta sessão.

## Bloqueios externos

Nenhum bloqueio externo ativo.

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

### Correção final

- a validação CSRF duplicada foi removida depois que os Previews mostraram que
  aliases protegidos podem chegar à aplicação com host e Fetch Metadata
  reescritos pela Vercel;
- a proteção nativa dos Server Actions permanece ativa com `allowedOrigins`
  exatos e sem wildcard;
- o login exige token HMAC de finalidade específica, emitido por request e
  válido por 15 minutos;
- sessão HMAC de 4 horas, cookie `HttpOnly`, `SameSite=Strict`, `Secure` na
  Vercel e rate limit de 5 tentativas em 10 minutos permanecem ativos;
- placeholders que começam com `replace-with-` continuam recusados como
  segredo;
- todas as mutações administrativas revalidam a sessão no servidor.

### Primeiro Preview do reparo

- commit: `461d052`;
- deployment: `dpl_5GcoofGF9UD6BKiEuowAMDtjUr3i`;
- build Vercel aprovado;
- o smoke mostrou que a Vercel pode omitir `Origin` no contexto observado;
- a primeira versão continuou recusando o login e não foi promovida;
- a defesa foi ajustada para o fallback restrito de `Sec-Fetch-Site`;
- teste focado ampliado para 11 casos.

### Fechamento publicado de T013/T014

- commit promovido: `fb312ba`;
- Preview validado: `dpl_FvQf45QTuUpZ9n8CdwisqBoBXcw5`;
- Production promovida: `dpl_APNGiVduwMjLmgsoTq7sTzGog6AF`;
- URL pública: `https://portaldenoticias-five.vercel.app`;
- login `USER / User123` redirecionou para `/admin`;
- `/api/admin/session` autenticada retornou `demo-operator` e `demo=true`;
- Conteúdo, Identidade visual e Trilha de auditoria carregaram sem erro;
- logout retornou para `/admin/login`;
- após logout, `/api/admin/session` retornou `unauthorized`;
- `pnpm check`: lint, tipos, 52 testes e build aprovados;
- auditoria independente do commit final: aprovada sem P0/P1;
- advisor de segurança do Supabase: zero alertas.

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

A publicação foi automatizada em `C202` e a linha de base foi aprovada em
`C203`. Não há P0 pronta; `C210` é a próxima tarefa executável.

## C202 — smoke automatizado publicado

Estado: `DONE`.

- runner Playwright cobre aviso demo, login inválido e válido, sessão 401/200,
  Conteúdo, Identidades, Auditoria, logout e novo 401;
- negativos automatizados recusam Origin externa e cookie adulterado;
- Production também valida `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/` e
  expiração do cookie;
- falhas retornam código não zero e geram relatório e screenshot sanitizados;
- gate exige a mesma URL HTTPS imutável para smoke do Preview e
  `vercel promote`, fixa o alias público de Production e bloqueia alvos
  divergentes antes da rede;
- bypass da Vercel é enviado apenas à origin exata do Preview e usa
  `maxRedirects=0`; teste integrado A → 302 → B confirmou zero header no
  destino externo;
- commit promovido: `eb050280f593a1a33e68d9f6a2cd75d77304374a`;
- Preview aprovado: `dpl_FJtzXUrCQMiUPa1qRnEThdqCruLU`,
  `https://portaldenoticias-dhjm7cc6y-raafastosgmailcoms-projects.vercel.app`;
- Production promovida: `dpl_67pSeiwLcm2bEFR1Zsxd1HmqNpzH`,
  `https://portaldenoticias-five.vercel.app`;
- `pnpm check`: lint, tipos, 75 testes e build aprovados;
- smoke do gate: 14 etapas aprovadas em Preview e 14 em Production, sem dados
  sensíveis nos relatórios;
- verificador independente e auditor adversarial aprovaram implementação,
  Preview e Production sem P0/P1;
- os únicos HTTP 500 observados no runtime foram os negativos deliberados de
  Origin externa; zero erro inesperado;
- relatórios finais:
  `artifacts/smoke-admin/2026-07-26T16-14-41-240Z-portaldenoticias-dhjm7cc6y-raafastosgmailcoms-projects.vercel.app/report.json`
  e
  `artifacts/smoke-admin/2026-07-26T16-14-56-531Z-portaldenoticias-five.vercel.app/report.json`.

## C203 — baseline visual e funcional

Estado: `DONE`.

- ambiente: commit `eb050280f593a1a33e68d9f6a2cd75d77304374a`,
  deployment Production `dpl_67pSeiwLcm2bEFR1Zsxd1HmqNpzH` e
  `https://portaldenoticias-five.vercel.app`;
- smoke C202 repetido em Production: 14 etapas aprovadas, zero falha;
- oito capturas aprovadas de Home, Login, Conteúdo e Identidades em
  `390 x 844` e `1440 x 900`, com HTTP 200, um H1, aviso demo,
  `noindex, nofollow` e zero overflow global;
- a primeira captura da Home congelou a animação de entrada e produziu um falso
  P1 de contraste; as duas Homes foram recapturadas em estado settled com
  reduced motion, conteúdo integralmente visível e contraste de `12,36:1`;
- P0: zero;
- P1: previews salvos de Identidades permanecem no skeleton por incompatibilidade
  entre o sandbox seguro e a hidratação; dono: executor de `C211`;
- P2: tabela administrativa móvel e navegação editorial sem affordance clara;
  dono: executor de `C230`;
- P2: tenant inexistente renderiza 404 visual com HTTP 200, sem fallback ou
  vazamento entre tenants; dono: executor de `C240`;
- três tenants revalidados sem conteúdo cruzado; catálogos da API isolados em
  `10 / 10 / 9`; sessão ausente e cookie adulterado retornaram 401;
- `pnpm check`: lint, tipos, 75 testes e build aprovados;
- verificador independente e auditor adversarial aprovaram `C203` para `DONE`
  e `C210` para `READY`, sem P0;
- evidências: `artifacts/c203-baseline-2026-07-26/`.

## C210 — contexto global de tenant no ADM

Estado: `DONE`.

- cabeçalho administrativo concentra um único seletor de tenant ativo e link
  para o portal correspondente;
- query validada prevalece sobre cookie de contexto `HttpOnly`; tenant
  ausente usa o default demonstrativo e query/cookie inválido falha fechado;
- Conteúdo, Identidades e Auditoria preservam tenant e filtros sem seletores
  locais duplicados;
- queries e mutações continuam recebendo tenant explícito e validado no
  servidor pela allowlist de tenants demo;
- mutação aberta em A depois da troca global para B retorna confirmação antes
  do repositório; adulteração é negada e confirmação explícita executa uma única
  chamada;
- navegador local: persistência entre as três áreas, slug público, filtro
  `status=published`, contexto inválido, 390 px e 1440 px aprovados, sem
  overflow global;
- ensaio A → B exibiu a confirmação acessível e consulta remota confirmou a
  matéria ainda `published` antes do segundo passo;
- commit funcional `64297973c801538bb62a8ac42a8f328bce862c40`;
- Preview imutável `dpl_5PBsdEyjgXhbr7NfF7zNKt52SkJo`, `READY`, com
  smoke dry-run 14/14 aprovado em
  `artifacts/smoke-admin/2026-07-26T18-14-19-562Z-portaldenoticias-8o51cdlig-raafastosgmailcoms-projects.vercel.app/report.json`;
- Production `dpl_4o5u2ssyF21LNxqr1rDX7DcEuxPX`, `READY`, promovida do
  mesmo Preview e no mesmo SHA;
- smoke pós-Production 14/14 aprovado, incluindo login inválido/válido,
  sessão 401/200, política do cookie, Conteúdo, Identidades, Auditoria e
  logout, em
  `artifacts/smoke-admin/2026-07-26T23-57-34-337Z-portaldenoticias-five.vercel.app/report.json`;
- evidência visual publicada em 390 px e 1440 px confirmou Lúmen, persistência
  em navegação/marca, slug público e zero overflow global em
  `artifacts/smoke-admin/c210-production-visual-evidence/`;
- runtime do deployment mostrou somente os dois 500 deliberados do teste de
  Origin externa; demais respostas observadas: 211×200, 10×303 e 8×401;
- o parser do smoke e da promoção passou a aceitar o separador literal `--`
  repassado pelo pnpm, com dois testes de regressão;
- `pnpm check`: lint, tipos, 85 testes e build aprovados;
- verificador independente e auditor adversarial aprovaram o diff corrigido
  e Production sem P0/P1/P2 novo;
- o P2 de rolagem interna pouco evidente na tabela móvel permanece atribuído
  à `C230`, sem regressão da `C210`;
- nenhuma migration, dependência, criação ou duplicação de tenant;
- dependência técnica da `C211` satisfeita; a fila foi repriorizada para `C204`
  antes do workbench de identidade.

## C204 — tenant padrão reutilizável na URL pública

Estado: `DONE`.

- `/` agora resolve um singleton persistido e dinâmico; `?tenant=<slug>`
  continua sendo preview explícito sem alterar o padrão;
- trocar o tenant ativo do ADM permanece uma ação pessoal e separada da nova
  ação confirmada `Definir como portal padrão`;
- a Server Action revalida sessão, allowlist, contexto, confirmação global e
  revisão otimista antes de chamar a RPC;
- a RPC `cms_set_default_demo_tenant` bloqueia a linha, rejeita revisão
  obsoleta e tenant fora da demonstração, e grava `portal.default_changed` na
  mesma transação;
- migrations remotas alinhadas:
  `20260727012034_add_default_demo_portal` e
  `20260727012319_index_default_demo_portal_tenant`;
- tabela com RLS habilitada e forçada; `anon` e `authenticated` não possuem
  leitura nem execução; `service_role` possui apenas `SELECT`, `UPDATE` e a
  execução da RPC;
- ensaio transacional com rollback aprovou mudança, incremento de revisão,
  auditoria exata, no-op sem evento, conflito `40001` e recusa do tenant de
  plataforma;
- advisor de segurança do Supabase: zero alertas; o alerta de FK sem índice foi
  eliminado;
- `pnpm check`: lint, tipos, 103 testes e build aprovados; `/` gerada como rota
  dinâmica;
- navegador local: selecionar Lúmen não alterou `/`; publicar Lúmen alterou a
  home sem query e preservou o preview explícito do Banco; Auditoria exibiu
  Banco → Lúmen;
- 390 px e 1440 px aprovados, sem overflow global e sem erro de console da
  aplicação;
- o teste local restaurou o Banco pela própria interface; ao fim dessa fase o
  estado remoto era `banco-demo-horizonte`, revisão `3`, com os dois eventos de
  ida e volta;
- auditoria adversarial local aprovada sem P0/P1/P2; o P3 de cobertura foi
  fechado com regressões para sessão ausente e contexto adulterado na nova
  Server Action;
- commit funcional: `bab3f202c9d3a4423f73ea9b9f1f298d0f3892b9`;
- Preview imutável `dpl_4CKpds2GzPPf7o5kFqj6hPwxAygW`, `READY`, no SHA
  funcional exato;
- smoke Preview dry-run aprovado em 14/14 etapas, incluindo Origin externa,
  sessão 401/200, Conteúdo, Identidades, Auditoria e logout:
  `artifacts/smoke-admin/2026-07-27T01-51-03-073Z-portaldenoticias-1bbkbaa7p-raafastosgmailcoms-projects.vercel.app/report.json`;
- a primeira tentativa foi bloqueada antes do login por uma Access URL obsoleta;
  uma URL temporária da origin imutável corrigiu apenas o acesso à proteção e
  o gate passou sem promover;
- navegador no Preview exato: selecionar Lúmen manteve Banco em `/`; publicar
  mudou `/` sem query para Lúmen; `?tenant=banco-demo-horizonte` preservou o
  preview direto; Auditoria exibiu Banco → Lúmen; Banco foi restaurado;
- estado final compartilhado após a restauração: `banco-demo-horizonte`,
  revisão `7`, último evento Lúmen → Banco;
- capturas sanitizadas:
  `artifacts/c204-preview-bab3f20/home-lumen-root-1440.png` e
  `artifacts/c204-preview-bab3f20/home-banco-restaurada-1440.png`;
- verificador independente e auditor adversarial aprovaram o Preview exato
  sem P0/P1/P2 e autorizaram a promoção;
- P3 documental aceito: capturas durante a animação não servem como baseline
  visual e o relatório do smoke não embute deployment/SHA; URL, timestamp e
  metadados Vercel preservam a cadeia de custódia nesta entrega;
- Production `dpl_FZGsy6tFnZ1xcBaMTXSJfXCcPjsa`, `READY`, promovida do
  Preview aprovado, no SHA funcional exato e publicada em
  `https://portaldenoticias-five.vercel.app`;
- metadados Vercel confirmam `action=promote` e
  `originalDeploymentId=dpl_4CKpds2GzPPf7o5kFqj6hPwxAygW`;
- smoke pós-Production aprovado em 14/14 etapas, incluindo política completa do
  cookie, login inválido/válido, sessão 401/200, Conteúdo, Identidades,
  Auditoria e logout:
  `artifacts/smoke-admin/2026-07-27T02-06-01-815Z-portaldenoticias-five.vercel.app/report.json`;
- navegador em Production confirmou Banco em `/` sem query e Lúmen em
  `/?tenant=healthtech-demo-lumen`, sem erro de console;
- runtime do deployment Production sem `error` ou `fatal`;
- verificador independente e auditor adversarial aprovaram Production e o
  fechamento da C204, sem P0/P1/P2;
- P3 futuro: embutir SHA/deployment ID no relatório, capturar evidência visual
  settled em 390 px e fixar a major do Node em vez de `>=22`;
- `C211` liberada para `READY`; nenhuma tarefa P0 permanece pronta.
- fora de escopo preservado: criação de tenant e aprofundamento do workbench de
  identidade.

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
- Server Actions usam a proteção CSRF nativa do Next com aliases exatos;
- login usa token HMAC curto e específico, além da validação nativa;
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
- actions revalidam a sessão demonstrativa no servidor antes de qualquer mutação;
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
- formulário e Server Action revalidam sessão demo, UUID, limites de texto, cores hexadecimais, allowlists e contraste WCAG mínimo de 4,5:1;
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

Não há P0 pronta. A próxima tarefa executável é `C211` (`P1`, `READY`):
workbench de identidade com preview vivo.
