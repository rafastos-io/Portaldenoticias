# Escopo do MVP-0

## Objetivo

Entregar rapidamente uma demonstração funcional de portal editorial white-label com dados fictícios persistidos, ADM simplificado e três identidades visuais.

Este arquivo, `docs/15-mvp0-decisoes-confirmadas.md` e `TASKS.md` definem o escopo executável. Em caso de divergência, `docs/15` e `TASKS.md` vencem.

## Resultado demonstrável

Uma pessoa consegue:

1. entrar no ADM com `USER / User123`;
2. selecionar um tenant;
3. criar, editar, publicar, pausar e retomar uma matéria;
4. alterar tokens de marca;
5. visualizar home, editoria e matéria;
6. conferir desktop e mobile;
7. abrir três portais visualmente distintos;
8. persistir mudanças no Supabase;
9. consultar uma rota JSON demo;
10. publicar o app na Vercel.

## Dados do MVP-0

- 100% fictícios;
- três marcas fictícias;
- pelo menos 24 matérias;
- cinco autores fictícios;
- seis editorias;
- tags, placements e assets demonstrativos;
- seed idempotente;
- reset permitido apenas em ambiente local/demo;
- `is_demo = true` nos registros aplicáveis;
- nenhuma ingestão, scraping ou marca real.

O catálogo obrigatório está em `docs/16-catalogo-ficticio-seed.md`.

## P0 - obrigatório

### Aplicação

- Next.js App Router no root do repositório;
- TypeScript strict;
- Tailwind CSS;
- pnpm e lockfile;
- lint, typecheck, testes e build;
- estados de loading, vazio e erro;
- layout em 390 px e 1440 px.

### Portal demonstrativo

- home;
- página de editoria;
- página de matéria;
- cabeçalho, navegação e rodapé por tenant;
- aviso visível de conteúdo fictício;
- `noindex, nofollow`;
- fora de sitemap e RSS discovery;
- `X-Robots-Tag: noindex, nofollow` nas rotas demo/JSON;
- conteúdo pausado ausente das listagens públicas.

### Gate do ADM

- tela `/admin/login`;
- credenciais de ambiente com defaults `USER / User123`;
- validação exclusivamente no servidor;
- `DEMO_SESSION_SECRET` forte e validado na inicialização;
- comparação timing-safe;
- cookie assinado por HMAC ou biblioteca consolidada, `HttpOnly`, `SameSite=Strict`, `Secure` na Vercel;
- expiração/maxAge definida;
- guard em toda página, Server Action e Route Handler administrativo;
- validação de origin/CSRF nas mutações;
- logout;
- rate limit simples por janela;
- aviso `Modo demonstração - autenticação real desativada`;
- ator fixo de auditoria `demo-operator`.

Esse gate protege somente conteúdo fictício e não é autenticação real.

### CMS

- listar matérias;
- filtrar por tenant e status;
- criar;
- editar título, linha fina, corpo simples, editoria, autor e imagem;
- publicar;
- pausar com confirmação;
- retomar;
- persistir no Supabase;
- registrar evento básico de auditoria.

Estados implementados: `draft`, `published`, `paused`.

### Central white-label

- três tenants;
- nome/slogan/wordmark;
- paleta semântica;
- tipografia aprovada;
- variantes conhecidas de header, hero e cards;
- preview desktop/mobile;
- validação de contraste;
- salvar tokens no Supabase;
- trocar de tenant sem rebuild;
- nenhum CSS/JS livre.

### Supabase

- Postgres e Storage;
- migrations versionadas;
- seed/reset idempotente e restrito;
- cliente server-side;
- nenhuma secret/service role no navegador;
- RLS em tabelas expostas;
- grants/revokes explícitos;
- escrita `anon` bloqueada;
- políticas de bucket/objetos documentadas;
- escopo de tenant em toda query administrativa;
- advisors de segurança revisados depois de DDL.

### Rota JSON demo

- conteúdo filtrado por tenant;
- `demo: true`;
- filtros simples por editoria/status público;
- `X-Robots-Tag`;
- sem chave comercial;
- sem promessa de compatibilidade/SLA;
- não chamada de API pronta para cliente.

### Verificação

- browser real;
- desktop e mobile;
- teclado, foco e contraste;
- isolamento de tenant;
- gate e logout;
- ausência de segredos no bundle;
- lint, typecheck, testes e build;
- auditor independente;
- achados P0/P1 corrigidos.

### Deploy

- GitHub;
- Vercel;
- `main` como produção demo;
- branches/PRs como preview;
- variáveis separadas;
- build limpo;
- nenhum segredo commitado.

## P1 - após o MVP-0

- Supabase Auth;
- usuários, convites, papéis e recuperação;
- MFA;
- workflow de revisão/aprovação;
- revisão/correção versionada completa;
- agendamento automatizado;
- busca;
- página de autor;
- compartilhamento social;
- editor rico;
- duplicação e ações em lote;
- biblioteca de mídia avançada;
- tema com histórico e rollback;
- links privados de preview com expiração;
- domínio customizado automatizado;
- API comercial autenticada;
- RSS, webhooks, credenciais e rate limit comercial;
- `updated_since` e tombstones;
- analytics e dashboards;
- newsletter;
- SEO e sitemap para conteúdo real.

## Fora do MVP-0

- dados e marcas reais;
- conteúdo clínico real;
- recomendação médica ou de investimento;
- cliente acessando o ADM;
- paywall/cobrança;
- comentários;
- app nativo;
- microsserviços;
- filas e Redis dedicados;
- IA editorial;
- CSS/JavaScript arbitrário;
- cotações e dados financeiros em tempo real.

## Critérios de aceite

### Funcional

- CRUD e pausa sobrevivem a reload/redeploy;
- tenant muda conteúdo e tema sem rebuild;
- três identidades usam os mesmos componentes;
- 24 matérias seed estão disponíveis;
- rota JSON entrega apenas o tenant solicitado;
- login incorreto não cria sessão;
- logout bloqueia o ADM.

### Segurança demonstrativa

- nenhuma secret no cliente ou Git;
- cookie e segredo atendem aos requisitos;
- toda mutação revalida o gate;
- toda query administrativa recebe tenant explícito;
- RLS/grants/policies foram revisados;
- reset não roda em produção real.

### Visual

- utilizável em 390 px e 1440 px;
- sem overflow ou texto cortado;
- contraste aceitável;
- foco por teclado;
- avisos de demonstração visíveis;
- branded fictício claramente identificado.

### Qualidade

- lint;
- typecheck;
- testes críticos;
- build Vercel;
- auditor independente aprovado;
- `TASKS.md` e `STATUS.md` atualizados.

## Definição de pronto

Uma tarefa só termina com:

- critérios atendidos;
- checks executados;
- evidências registradas;
- auditoria concluída;
- documentação atualizada;
- dependentes corretamente desbloqueados.
