# Status do MVP-0

Atualizado em: 20/08/2026.

## C254 — vídeos incorporados e acessibilidade pública — 20/08/2026

### Contrato da entrega

- resultado: reproduzir os três vídeos BV dentro da matéria e adicionar um
  conjunto gratuito, leve e verificável de recursos de acessibilidade;
- aceite: embed seguro e responsivo, VLibras, controles de leitura persistidos,
  navegação por teclado, contraste e movimento reduzido validados em
  390/768/1440;
- ferramentas: VLibras para tradução assistiva; controles nativos para tamanho,
  contraste e movimento; ESLint JSX a11y, axe e revisão manual WCAG 2.2 AA para
  qualidade;
- riscos: widget ou automação não substituem conformidade manual; não copiar
  mídia do YouTube; preservar tenant, procedência e alterações locais do usuário;
- escopo posterior: avatar de matérias relacionadas registrado em `C255`.

### Implementação e evidências locais

- os três formatos autorizados (`watch`, `shorts` e `youtu.be`) são convertidos
  somente quando HTTPS e com ID válido para `youtube-nocookie.com`;
- iframe responsivo com título acessível, tela cheia, carregamento tardio,
  pedido de legendas em português e link de origem alternativo;
- VLibras carregado após a interação inicial, sem bloquear o conteúdo;
- painel nativo com texto padrão/grande/muito grande, alto contraste e redução
  de movimento; preferências persistem no navegador e usam `aria-pressed`;
- axe identificou seis falhas reais de contraste no rodapé BV; todas foram
  corrigidas e o smoke final passou em duas rotas × 390/768/1440;
- navegador real confirmou embed, VLibras, persistência, contraste, movimento,
  ausência de overflow e console limpo em mobile/desktop;
- evidências visuais em `artifacts/c254-accessibility/`;
- `pnpm check`: lint, tipos, 30 arquivos/153 testes e build aprovados.

Status: `VERIFY`; falta Preview, Production e reverificação pública.

## C253 — pauta BV Educação e padrão de crédito — 20/08/2026

### Contrato da entrega

- resultado: cadastrar a pauta fornecida para `BV Educação` e compartilhá-la,
  sem duplicação canônica, com os tenants ativos do modelo de crédito;
- entrada: 18 arquivos em `BV`, um vídeo do especial de Imposto de Renda e
  dois Shorts de Dicas valiosas; Glossário foi indicado sem conteúdo;
- aceite: dez categorias ativas, 21 conteúdos catalogados, procedência e
  autorização persistidas, distribuições ativas para BV e Crédito Órbita,
  navegação atualizada e portal/JSON validados em 390/1440;
- riscos: preservar as mudanças locais não relacionadas, não copiar mídia do
  YouTube e não inventar verbetes ausentes.

### Implementação e evidências

- 18 textos locais e três vídeos catalogados em 21 conteúdos canônicos;
- dez categorias ativas; Glossário permanece vazio por ausência de verbetes;
- 42 distribuições ativas com `authorized-real`: 21 para `bv-educacao` e 21
  para `credito-demo-orbita`, sem distribuição para outros modelos;
- três vídeos por tenant mantêm `allow_full_body/allow_media=false` e link para
  a origem; nenhuma mídia ou transcrição do YouTube foi copiada;
- navegação do padrão de crédito ordenada pelas categorias do briefing e
  ampliada de cinco para até dez editorias com rolagem horizontal;
- produção com dados atuais: rota JSON HTTP 200 e 46 matérias totais; matéria
  de inflação HTTP 200 com fonte e corpo; vídeo HTTP 200 com aviso externo e
  link para a origem; sem overflow ou erros de console em 390/1440;
- `ff74ee7` publicado na `main` com deploy de produção aprovado pela Vercel;
  a navegação pública exibe as nove categorias com conteúdo na ordem definida,
  enquanto Glossário permanece cadastrado e vazio;
- reverificação pública final em desktop e mobile: marca BV, nove categorias,
  matéria integral e referência externa corretas, sem overflow ou mensagens de
  erro no console; o Preview protegido exigiu SSO e a validação funcional foi
  concluída no domínio público de produção;
- `pnpm check`: lint, tipos, 29 arquivos/150 testes e build aprovados.

Status: `DONE`.

## C213 — retomada: cadastro persistente da marca BV Educação — 20/08/2026

### Contrato da entrega

- resultado: cadastrar `bv-educacao` pelo fluxo multi-tenant real, com tema,
  logo e referências editoriais persistidos no Supabase, sem depender de
  fallback codificado;
- aceite: tenant `kind/status=demo`, `is_demo=true`, modelo
  `financial-services-credit`, tema publicado, logo no Storage isolado,
  matérias reaproveitadas por distribuição, auditoria e portal/ADM validados
  em 390/768/1440 px;
- riscos: uso autorizado de marca real precisa manter procedência do logo e o
  ambiente demonstrativo; nenhuma matéria canônica será duplicada;
- deploy: Preview aprovado antes de integrar a branch na `main`, publicar a
  Production e remover a branch remota;
- diagnóstico inicial: o commit `17dc23e` não persistiu o tenant. O script
  dependia de `DATABASE_URL`, ausente neste ambiente, e encerrava com sucesso;
  fallbacks de código e seed incompleto mascaravam a ausência no Supabase.

### Implementação e evidências locais

- removidos o script silencioso, o seed incompleto, o logo público sem
  isolamento e os fallbacks codificados de `bv-educacao`;
- a resolução pública e a rota JSON agora aceitam qualquer tenant demo válido
  persistido, com slogan vindo de `settings_json`, sem allowlist por slug;
- o cadastro real pelo ADM criou o tenant
  `d1780f5a-16ec-4dae-9b07-070f0d8c7b8a`, com modelo
  `financial-services-credit`, tema publicado e auditoria
  `tenant.demo_created`, `theme.updated` e `theme.logo_updated`;
- 27 distribuições e três placements foram copiados por referência; o tenant
  possui zero `content_items` e zero categorias próprias, comprovando que não
  houve duplicação canônica;
- o portal e a rota JSON publicaram 25 matérias ativas do preset de crédito;
- logo PNG de 17.613 bytes salvo no bucket privado sob prefixo do tenant, com
  alt, crédito, `authorized-brand-validation` e URL assinada funcional;
- navegador local: portal 200, um `h1`, logo presente, sem overlay, sem erro de
  console e sem overflow em 390 e 1440 px; evidências em
  `artifacts/c213-bv/`;
- `pnpm check`: lint, TypeScript, 27 arquivos/145 testes e build de produção
  aprovados.

### Publicação concluída

- commit de produção: `58c009135010e8698eeb5be113ffb962380c5f75`;
- implantação da `main` concluída com sucesso na Vercel;
- produção reverificada em 390 e 1440 px: HTTP 200, marca e logo presentes,
  um `h1`, sem overflow e sem erros no console;
- rota pública confirmou o tenant `bv-educacao` e 25 matérias ativas;
- `C213` promovida a `DONE`; `C214` liberada para `READY`.

## C252 — nova análise sobre canetas emagrecedoras — 12/08/2026

### Resultado

- a pauta `A revolução das canetas emagrecedoras` foi adicionada como um novo
  conteúdo canônico da editoria Análise, sem alterar a análise existente do
  BTG Pactual;
- o corpo preserva os intertítulos `Estilo de vida` e `Benefício corporativo`
  como headings estruturados, renderizados semanticamente no artigo;
- a análise foi distribuída por referência para Abrafarma e Broadcast Saúde,
  com `rights_code = authorized-real`, autorização de 12/08/2026 e auditoria
  individual por tenant;
- o catálogo de saúde passa a ter 17 pautas reais autorizadas, além do hero de
  IA preservado, totalizando 18 conteúdos ativos em cada marca;
- a persistência remota foi conferida lado a lado com a análise anterior: dois
  itens publicados, duas distribuições ativas e cinco blocos no novo corpo.

## C251 — correção da persistência da identidade — 12/08/2026

### Diagnóstico e correção

- as alterações recentes da Abrafarma foram confirmadas no tema publicado e
  no portal de produção, sem cache estático: nome, slogan e tokens chegam ao
  HTML como variáveis CSS do tenant;
- o upload de um PNG com 1,18 MB reproduziu HTTP 500 antes da Server Action,
  embora a interface e a validação aceitassem até 2 MB;
- `serverActions.bodySizeLimit` passou a 3 MB para comportar o arquivo de 2 MB
  e o envelope multipart, mantendo no servidor o limite efetivo de 2 MB;
- a seleção do arquivo agora recusa imediatamente logos acima de 2 MB com uma
  mensagem acessível, antes do envio;
- um teste de regressão fixa a relação entre o limite de transporte e o limite
  validado do arquivo.

## C250 — Abrafarma, Broadcast Saúde e catálogo real autorizado — 09/08/2026

### Resultado

- o tenant existente de saúde foi preservado como `abrafarma` e definido como
  portal público padrão;
- o tenant `broadcast-saude` foi criado separadamente no modelo
  `health-pharma`, com tema próprio;
- ambas as marcas recebem por referência o mesmo catálogo canônico: 16 pautas
  reais autorizadas e a matéria de IA já aprovada como `home.hero`;
- 17 matérias anteriores da vertical passaram para rascunho e outras
  distribuições antigas da Abrafarma foram retiradas da seleção pública, sem
  exclusão física;
- a duplicidade exata da Bayer foi consolidada em um único conteúdo;
- três referências da Viva usam `external_only`, sem corpo reproduzido, e
  encaminham à fonte original;
- as editorias promovidas são Empresas, M&A, RelGov, Investimentos, Regulação,
  Pesquisa, Tecnologia e Inovação, Análise e Radar da Imprensa;
- a ordem editorial do briefing foi aplicada aos destaques: Biomm, Novo Nordisk
  e Novartis nos ranks 0, 1 e 2 das duas marcas.

### Procedência, ticker e persistência

- cada pauta real registra origem, data/link quando disponíveis, ordem do
  briefing e autorização em `body_json.editorial_origin`;
- as distribuições usam `rights_code = authorized-real` e referência de
  autorização explícita;
- o ticker de saúde cobre Rede D’Or, Fleury, Hapvida, Mater Dei, Dasa,
  Oncoclínicas, Qualicorp, BradSaúde e a transição OdontoPrev → BradSaúde;
- `BRAPI_API_TOKEN` é opcional e exclusivamente server-side; sem token, nenhum
  preço é inventado e a UI informa `cotação indisponível`;
- migrations remotas aplicadas: `20260809154809` e `20260809161927`;
- a função de catálogo foi reaplicada e manteve Abrafarma na revisão 32, 16
  pautas reais e uma Bayer, confirmando idempotência;
- advisor Supabase de segurança: zero alertas; performance: apenas avisos
  informativos preexistentes de índices ainda não utilizados.

### QA e auditoria

- `pnpm check`: lint, TypeScript, 26 arquivos/138 testes e build de produção
  aprovados após a correção final;
- navegador automatizado validou Abrafarma, Broadcast Saúde e uma pauta
  `external_only`, com imagens carregadas, CTA de fonte e sem overlay de erro;
- viewports 390, 768 e 1440 px foram percorridos; em 768 e 1440,
  `scrollWidth === clientWidth`;
- as nove editorias aparecem no menu final e nas seções da home;
- evidências visuais em `artifacts/c250-browser/`;
- auditor independente encontrou um P1 de ordem dos destaques; após a correção
  e nova consulta remota, aprovou a C250 sem P0/P1;
- documentação de escopo e governança atualizada em
  `docs/24-validacao-broadcast-saude-conteudo-real.md` e documentos correlatos.

### Deploy Vercel — 09/08/2026

- o banco Supabase definitivo já recebeu as migrations e os dados;
- `BRAPI_API_TOKEN` foi configurado como variável sensível nos ambientes
  Preview e Production, sem exposição no cliente;
- a integração foi ajustada para consultar um ativo por requisição, limite do
  plano atual da Brapi, preservando falha isolada e cache por ativo;
- Preview tipográfica validada: `dpl_9haac3FSVX576ijkmUHAc9Dx3o9o`;
- Production promovida e `READY`: `dpl_7pc65sGFRRJ5RfKLTshyvjKVqWfR`;
- alias estável: `https://portaldenoticias-five.vercel.app`;
- HTTP público confirmou `200`, marca correta, conteúdo real, ticker com preços
  e zero ocorrência de `cotação indisponível` em Abrafarma e Broadcast Saúde;
- título das matérias de saúde recalibrado de `43,2–91,2 px` para `36–64 px`;
  navegador em 1920 x 1024 e 390 x 844 confirmou hierarquia legível, ausência de
  overflow horizontal, overlay e erros de console;
- logs da nova Production nos 30 minutos após a validação: zero erro.

## Reforma do cadastro editorial — 29/07/2026

### Problema

- o cadastro de matéria exibia "Autor inválido" quando o `<select>` de
  autoria vinha vazio ou sem opção selecionável;
- não existia seletor de variante editorial;
- a autoria era uma lista fixa, sem permitir digitar o nome.

### Resultado implementado

- `parseEditorialForm` agora valida `authorName` (texto, 2–120 caracteres)
  em vez de `authorId` (UUID), eliminando o gatilho do "Autor inválido";
- `resolveAuthorByName` faz lookup-or-create: busca por `display_name`
  case-insensitive na plataforma + tenant e, se não existir, cadastra um novo
  autor sob o tenant com slug normalizado;
- novo `EditorialTypeFields` (client component) oferece quatro variantes
  estruturais: Matéria padrão, Explicador ou análise, Patrocinada fictícia e
  Correção, com campos condicionais:
  - **explainer**: tópicos-chave (até 8, armazenados em `body_json.key_topics`);
  - **sponsored**: patrocinador fictício (2–120 caracteres, `sponsorship_label`
    + `content_type=sponsored`);
  - **correction**: nota de correção (12–500 caracteres, `correction_note`);
- `findOwnedContentItem` agora retorna `authorName`, `editorialType`,
  `correctionNote`, `sponsorshipLabel` e `keyTopics` para repovoar o editor sem
  perder dados;
- nenhum CSS/JS/HTML arbitrário: variantes são allowlist tipada em código;
- `createAdminContent` e `updateAdminContent` preservam RPCs existentes
  (`cms_create_content_with_media` / `cms_update_content_with_media`) e
  aplicam metadados editoriais via update pós-RPC — sem migration.

### Evidências

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (25 arquivos, 133 testes) e
  `pnpm build` aprovados;
- `content-form.test.ts`: 7 testes cobrem happy path, autor vazio, patrocinada
  sem patrocinador, correção sem nota, patrocinada válida e correção válida;
- `content-repository.test.ts`: mock ampliado com `authors` e métodos
  `or/ilike/insert/single/update`; teste de `findOwnedContentItem` agora valida
  `authorName` e `editorialType`;
- `actions.test.ts`: 12 testes preservados (C213);
- build de produção gerou todas as rotas sem erro.

### Limites

- o novo autor criado por texto é cadastrado sob o tenant ativo com
  `owner_tenant_id = tenantId`; um trigger existente já garante que conteúdo
  de tenant B só pode referenciar autores do próprio tenant B ou da
  plataforma — não há vazamento;
- nenhuma publicação Vercel foi feita nesta sessão; o domínio público vigente
  continua servindo a versão anterior até Preview, smoke, auditoria
  independente e promoção autorizada;
- a UI não foi exercitada em browser real nesta sessão — recomenda-se
  validação em 390/1440 antes de fechar a tarefa como `DONE`.

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
- tarefa concluída: `C205`;
- tarefa concluída: `C211`;
- tarefa concluída: `C212`;
- tarefa pronta: `C213` (`P1`, `READY`);
- nenhuma tarefa `P0` permanece pronta ou aberta.

## Expansão editorial do MVP — 27/07/2026

### Catálogo e mídia

- adicionadas 40 matérias canônicas inéditas, dez por vertical: crédito,
  investimentos, seguros e saúde;
- cada matéria tem título, linha fina, quatro parágrafos próprios, autor,
  categoria, tags, texto alternativo e imagem WebP exclusiva;
- adicionadas oito assinaturas editoriais fictícias;
- 40 caminhos de imagem e 40 arquivos distintos em
  `public/images/editorial/2026-07/`, totalizando aproximadamente 4 MB;
- composição visual distribuída entre adultos jovens, meia-idade e 50+, com
  cenas de serviço, trabalho, laboratório, prevenção, tecnologia e planejamento;
- o seed original permanece disponível para validar draft, pausa, correção e
  conteúdo patrocinado.

### Persistência e distribuição

- migrations `20260727224132_expand_editorial_catalog.sql` e
  `20260727230600_fix_editorial_home_placements.sql` aplicadas no Supabase
  `yhatwpxsxntlorfgxpdl`;
- resultado remoto: 40 novas matérias, 40 imagens exclusivas, dez matérias por
  vertical, 76 distribuições ativas e 36 crossovers planejados;
- 12 placements novos ocupam hero e destaques dos quatro portais;
- quatro eventos de auditoria registram a expansão;
- advisor de segurança: zero alertas;
- advisor de performance: somente avisos informativos de índices ainda não
  utilizados, sem regressão criada pela carga editorial.

## Ajustes visuais rápidos dos modelos — 27/07/2026

- Banco Horizonte: itens da faixa de cotações centralizados verticalmente;
- Crédito Demo Órbita: grid e escala da manchete ajustados, com zero
  interseção entre texto e imagem;
- Healthtech Lúmen: manchete reduzida e hero completo encerrando em 740 px num
  viewport de 900 px;
- desktop 1920 × 900 e mobile 390 × 844: HTTP 200, uma `h1`, zero overflow,
  overlay, imagem sem `alt` ou erro de página;
- `pnpm check`: lint, tipos, 24 arquivos/120 testes e build aprovados;
- commit funcional `c314acc`; Preview
  `dpl_5Gf8xwBuLHnu5hxn6EX5hw25PvTh` aprovado e promovido;
- Production `dpl_D8EiktTg1f4LWjSt1ERZbvNqHA52`, `READY`, no domínio
  `https://portaldenoticias-five.vercel.app`;
- smoke atualizado para os rótulos vigentes do login: 14 etapas aprovadas em
  Preview e 14 em Production; o único erro de log observado foi a recusa
  intencional do teste negativo de Origin externa.

## Planejamento do sprint visual por segmento — 27/07/2026

### Resultado

- formalizada a camada `design system -> modelo de segmento -> marca/tenant ->
  conteúdo/placements`;
- definidos quatro modelos: serviços financeiros/crédito,
  investimentos/gestão, seguros/previdência e saúde/farma;
- registrado que a diferença deve ser estrutural em home, editoria e matéria,
  não apenas cor, fonte ou alinhamento;
- definido o ID do modelo como allowlist persistida no tema, sem nova aplicação
  ou duplicação de conteúdo;
- replanejadas `C212` e `C213` para implementar a camada e permitir que a marca
  escolha o modelo;
- conteúdos, categorias e pautas permanecem fora deste sprint.

### Arquivos de execução

- `docs/22-arquitetura-visual-modelos-de-segmento.md`;
- `docs/23-plano-sprint-modelos-visuais.md`;
- `PROMPT-SPRINT-MODELOS-VISUAIS-CODEX.md`.

### Estratégia de custo

- um executor por padrão;
- testes focados durante contratos;
- check completo e revisão visual no gate final;
- um único verificador independente ao final;
- auditoria adversarial limitada a allowlist, tenant, persistência e fallback.

Nenhuma implementação, migration, publicação ou mudança externa foi feita nesta
entrega de planejamento.

## Implementação local dos quatro modelos de segmento — 27/07/2026

### Resultado implementado

- criada a allowlist tipada `SiteModelId` com os quatro IDs aprovados e
  compatibilidade explícita para os três tenants legados;
- `theme_versions.components_json.site_model` passou a ser validado no servidor;
  modelo persistido incoerente falha fechado;
- home, editoria e matéria agora despacham para composições nomeadas em
  `src/components/public/models/`, preservando uma única árvore de rotas e o
  mesmo conteúdo canônico;
- implementados: central de serviços para crédito, publicação densa para
  investimentos, guia humano para seguros e briefing científico para
  saúde/farma;
- menu mobile explícito, foco visível, `noindex`, links com tenant, reduced
  motion e estados sem imagem foram preservados;
- o workbench e o cadastro de identidade agora escolhem um modelo coerente,
  sem combinação livre de header/hero/card;
- migration `20260727184629_add_site_models.sql` e seed da quarta marca
  `Crédito Demo Órbita` foram preparados sem criar matéria, editoria ou
  taxonomia e sem duplicar corpo canônico.

### Evidências locais

- lint e typecheck aprovados;
- 24 arquivos de teste e 120 testes aprovados;
- build Next.js 16.2.11 aprovado;
- browser no build de produção local: três homes persistidas em 390/1440,
  editoria e matéria alternadas em 390/1440, uma `h1`, `noindex, nofollow`,
  zero overflow, zero overlay e zero erro de runtime;
- menu mobile abriu por teclado, foco exibiu outline de 3 px e reflow equivalente
  a zoom de 200% passou em 720 px;
- tenant inválido exibiu estado 404 sem conteúdo de outro tenant;
- o quarto modelo foi selecionado no preview vivo sem salvar, habilitou a ação
  de persistência e permaneceu visualmente distinto;
- P1 encontrado no hero de seguros (mídia comprimindo a coluna de texto) foi
  corrigido e reverificado;
- o verificador também confirmou o backfill coerente das composições e o
  fail-closed de `site_model` presente e inválido; parecer final `P0=0`,
  `P1=0`;
- três pranchas compactas em
  `artifacts/c212-site-models-2026-07-27/`.

### Estado remoto

- a migration `add_site_models` foi aplicada no projeto
  `yhatwpxsxntlorfgxpdl` após autorização explícita;
- o constraint de `schema_version` foi versionado de forma fechada para aceitar
  apenas `1` ou `2`;
- as quatro marcas persistem composições coerentes; Crédito Demo Órbita possui
  10 distribuições e 3 placements por referência, enquanto o total canônico
  permanece em 24 matérias;
- as RPCs v2 usam `security invoker`, `search_path` vazio, recusam execução de
  `anon`/`authenticated` e permitem apenas `service_role`;
- advisor de segurança: zero alertas; advisor de performance: somente índices
  ainda não utilizados, informativos e anteriores ao sprint;
- commit funcional final: `a4e7a0b` na branch
  `agent/mvp0-specification`;
- Preview imutável `dpl_AchEtC61KeeyAHsWSDrfHtV8PDiJ`, `READY`, em
  `portaldenoticias-qpi8gojfv-raafastosgmailcoms-projects.vercel.app`;
- o primeiro Preview revelou sobreposição da mídia no hero de crédito; o grid
  foi contido com tracks `minmax(0, ...)`, reverificado localmente e republicado;
- quatro homes no Preview: HTTP 200, modelo correto, uma `h1`, zero overflow,
  overlay, imagem sem `alt` ou erro de runtime;
- Crédito Demo Órbita preservou tenant e modelo na home, editoria e matéria; o
  menu mobile abriu, manteve links do tenant e reduced motion foi respeitado;
- logs do deployment e agregação de runtime da última hora: zero erro;
- nenhuma promoção para Production foi feita;
- `C212` concluída e `C213` liberada para `READY`.

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

Nenhum bloqueio externo permanece para `C212`.

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

## C213 — cobertura automatizada do fluxo de criação/duplicação — 29/07/2026

### Resultado

- `createIdentityAction` agora possui cobertura automatizada de caminho feliz,
  falha de RPC (slug colidindo recusada com mensagem segura) e controle de
  contexto (confirmação A→B e negação de preset adulterado) em
  `src/app/admin/(protected)/actions.test.ts`;
- o mock de `@/lib/supabase/theme-repository` passou a expor
  `createDemoTenantFromPreset`, espelhando o contrato `cms_create_demo_tenant_v2`
  já aplicado remotamente na migration `add_site_models`;
- `parseCreateIdentityForm`, `createDemoTenantFromPreset`, persistência do
  `site_model`, cópia por referência de distribuições/placements e o form de
  cadastro na central de identidade permanecem com a implementação C212;
- nenhuma migration, nova RPC ou alteração de schema foi necessária nesta
  passagem: o fluxo operacional já estava implementado e a lacuna era a prova
  negativa automatizada da action.

### Evidências

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (25 arquivos, 128 testes) e
  `pnpm build` aprovados;
- `actions.test.ts`: 12 testes (4 novos cobrem `createIdentityAction`);
- build de produção gerou `/`, `/admin`, `/admin/identidade`,
  `/admin/auditoria`, `/admin/login`, `/api/admin/session`,
  `/api/demo/content`, `/editoria/[slug]`, `/materia/[slug]` e `/robots.txt`
  sem erro;
- diff da sessão limitado a `src/app/admin/(protected)/actions.test.ts`;
  nenhum segredo, migration ou alteração de schema touchado.

### Gates restantes para fechar C213 como DONE

- teste transacional remoto com rollback chamando
  `cms_create_demo_tenant_v2` a partir de um preset e provando:
  `kind=demo/status=demo/is_demo=true`, distribuições e placements copiados
  por referência, `site_model` persistido coerente, eventos
  `tenant.demo_created` e `theme.updated`, e nenhum novo `content_item`; exige
  `DATABASE_URL` configurada no executor autorizado;
- validação de browser em 390 px e 1440 px do fluxo de cadastro/duplicação na
  central de identidade e da home do novo tenant com o modelo escolhido;
- Preview imutável + smoke `C202` 14/14, verificador independente e auditoria
  adversarial curta (allowlist de modelo, isolamento e fallback fechado) antes
  da promoção;
- nenhuma publicação Production sem autorização explícita.

A tarefa permanece `READY`; o que ficou pronto acelera o fechamento na próxima
sessão com `DATABASE_URL`/browser disponíveis.

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

Não há P0 pronta. A próxima tarefa executável é `C213` (`P1`, `READY`):
completar o fluxo de criação/duplicação de tenant demo usando o modelo já
persistido e reverificado.
