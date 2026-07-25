# Prompt inicial para o Codex

```text
Você é o agente líder de implementação do MVP-0 Broadcast Saúde & Longevidade.

Trabalhe autonomamente no repositório atual até concluir o máximo possível do MVP-0. Leia integralmente, nesta ordem:

1. AGENTS.md
2. docs/15-mvp0-decisoes-confirmadas.md
3. docs/16-catalogo-ficticio-seed.md
4. TASKS.md
5. STATUS.md
6. DELIVERY_LOOP.md
7. README.md
8. docs/01-escopo-mvp.md
9. docs/03-arquitetura-tecnica.md
10. docs/04-modelo-de-dados.md
11. docs/05-cms-e-operacao-editorial.md
12. docs/06-central-de-identidade-visual.md
13. docs/07-experiencia-e-arquitetura-da-informacao.md
14. docs/09-seguranca-lgpd-e-governanca.md
15. docs/adr/0003-vercel-supabase-e-gate-demo.md

Objetivo: construir uma plataforma editorial white-label demonstrativa com Next.js, TypeScript, Tailwind, Supabase Postgres/Storage e deploy na Vercel.

Crie a aplicação Next.js diretamente no root deste repositório, preservando toda a documentação existente.

Para o trabalho operacional, `docs/15-mvp0-decisoes-confirmadas.md` e `TASKS.md` têm precedência. Os documentos mais amplos descrevem o produto futuro e não autorizam ampliar o MVP-0.

Requisitos fechados:

- todos os dados, marcas, autores, fontes e matérias são fictícios;
- 3 marcas: Banco Demo Horizonte, Seguros Demo Atlas e Healthtech Demo Lúmen;
- pelo menos 24 matérias seed persistidas;
- portal responsivo com home, editoria e matéria;
- ADM com CMS para cadastrar, editar, publicar, pausar e retomar;
- central de identidade com tokens, variantes e preview desktop/mobile;
- troca de tenant sem rebuild;
- login visual do ADM usando DEMO_ADMIN_USER=USER e DEMO_ADMIN_PASSWORD=User123;
- não usar Supabase Auth agora;
- validar login no servidor e usar cookie assinado HttpOnly;
- mostrar “Modo demonstração - autenticação real desativada” no ADM;
- acessar Supabase apenas no servidor;
- nunca expor secret/service role no browser;
- habilitar RLS nas tabelas expostas;
- definir grants/revokes e políticas de Storage;
- conteúdo demo deve ter noindex,nofollow, ficar fora de sitemap/RSS e mostrar aviso público;
- rota JSON demo com demo:true, sem chamá-la de API comercial;
- nenhum CSS ou JavaScript arbitrário por tenant.

Use `Broadcast V2.pdf` apenas como referência visual editorial inicial. Não copie código, interface ou conteúdo do site Broadcast. O catálogo obrigatório de seed está em `docs/16-catalogo-ficticio-seed.md`.

Use pnpm e fixe versões no lockfile. Antes de adotar APIs do Supabase, confira documentação/changelog atual. Use migrations versionadas e seed idempotente. Não invente IDs de projeto, URLs ou segredos.

Siga rigorosamente DELIVERY_LOOP.md:

- pegue o P0 READY de menor número;
- implemente uma pequena fatia vertical;
- rode lint, typecheck, testes e build;
- verifique a UI real em 390 px e 1440 px;
- crie um subagente verificador independente para auditar a entrega;
- corrija todos os achados P0/P1;
- atualize TASKS.md e STATUS.md;
- puxe imediatamente a próxima tarefa desbloqueada.

Não pare para perguntas não bloqueantes. Faça suposições reversíveis, registre-as em STATUS.md e continue. Pare apenas para credencial/decisão externa indispensável, ação destrutiva, publicação externa não autorizada, falha repetida três vezes ou fila vazia.

GitHub ainda não tem repositório/remoto confirmado. Isso não bloqueia T001-T012: implemente e verifique localmente. Antes de criar repositório, dar push ou configurar deploy, peça confirmação do nome, proprietário e visibilidade se ainda não estiverem registrados em STATUS.md.

Comece agora por T001. Primeiro inspecione o workspace, apresente um plano curto e então implemente. Não apenas descreva: crie os arquivos, rode os checks e mantenha o loop ativo.

Você está autorizado a executar `git init` local em T001 se `.git` ainda não existir. Isso não autoriza criar repositório remoto, dar push ou publicar.
```
