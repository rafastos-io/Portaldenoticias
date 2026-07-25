# Fila executável do MVP-0

Estados: `READY`, `IN_PROGRESS`, `VERIFY`, `DONE`, `BLOCKED`.

O executor sempre escolhe a tarefa P0 `READY` de menor número cujas dependências estejam `DONE`. Ao finalizar, registra evidências em `STATUS.md`.

| ID | Pri. | Estado | Dependências | Entrega |
|---|---|---|---|---|
| T001 | P0 | READY | - | Scaffold Next.js/TypeScript/Tailwind/pnpm e checks |
| T002 | P0 | BLOCKED | T001 | Estrutura visual base, design tokens e shell público/admin |
| T003 | P0 | BLOCKED | T001 | Vincular projeto Supabase definitivo e criar migrations |
| T004 | P0 | BLOCKED | T003 | Seed idempotente com 3 marcas e 24 matérias |
| T005 | P0 | BLOCKED | T001 | Gate ADM `USER / User123`, cookie e logout |
| T006 | P0 | BLOCKED | T003,T005 | CMS: listar, criar, editar, publicar, pausar e retomar |
| T007 | P0 | BLOCKED | T002,T004 | Portal público: home, editoria e matéria |
| T008 | P0 | BLOCKED | T002,T003,T004,T005 | Central white-label: tokens, variantes e preview |
| T009 | P0 | BLOCKED | T004,T007,T008 | Três tenants visualmente distintos |
| T010 | P0 | BLOCKED | T004,T007 | Rota JSON demo com `demo: true` |
| T011 | P0 | BLOCKED | T005,T006,T008 | Auditoria mínima com ator `demo-operator` |
| T012 | P0 | BLOCKED | T006,T007,T008 | QA desktop/mobile, acessibilidade e estados |
| T013 | P0 | BLOCKED | T009,T010,T011,T012 | Build final, variáveis e deploy Vercel |
| T014 | P0 | BLOCKED | T013 | Auditoria final independente e handoff |

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
- nenhum segredo no bundle;
- Vercel conectada ao Git.

### T014

- auditor independente revisa diff acumulado e app publicado;
- valida todos os critérios de `docs/01-escopo-mvp.md`;
- achados P0/P1 corrigidos e reverificados;
- `STATUS.md` contém URL, commit, checks e limitações;
- nenhuma tarefa P0 permanece aberta sem justificativa.

## Como desbloquear

Ao concluir uma tarefa, atualizar para `DONE` e trocar dependentes de `BLOCKED` para `READY` quando todas as dependências estiverem concluídas e nenhuma decisão externa faltar.

T003 permanece bloqueada até o usuário escolher o projeto Supabase existente ou autorizar a criação de um projeto específico.
