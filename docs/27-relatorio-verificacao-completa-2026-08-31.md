# Relatório de verificação completa — 31/08/2026

## Conclusão executiva

Resultado geral: **baseline local aprovado, liberação da nova frente ainda
condicionada**.

- não foi encontrada falha P0 no código atual, no gate administrativo ou nas
  quatro famílias visuais em execução local;
- lint, tipos, TypeScript estrito, 35 arquivos/170 testes e build passaram;
- 34 cenários públicos de browser passaram entre home, editoria, matéria,
  desktop, tablet e mobile;
- o smoke administrativo passou os 13 passos de login, sessão, origem externa,
  cookie adulterado, navegação protegida e logout;
- a nova atomicidade editorial está correta no contrato local, mas **não está
  aprovada para aplicação**: não houve PostgreSQL local, pgTAP, advisors,
  rollback real nem validação negativa entre tenants;
- o quinto modelo deve continuar bloqueado até fechar `R301` a `R305` e D34.

Em termos práticos, o sistema existente está estável o suficiente para ser
revisado e consolidado. Ainda não existe evidência suficiente para adicionar
uma quinta arquitetura visual sem ampliar as fontes de verdade e a dívida de
teste.

## Contexto reproduzido

| Item | Valor observado |
|---|---|
| Branch | `codex/revisao-estrutural-nova-frente` |
| Base local | `363a16e` |
| Node.js | `v24.14.0` |
| pnpm executado | `11.19.0` |
| pnpm declarado | `11.10.0` |
| Next.js | `16.2.11` |
| Supabase CLI consultado | `2.101.0` |
| Servidor dos smokes | `next dev`, `127.0.0.1:3000` |
| Dados | Supabase configurado em `.env.local`, sem exposição de valores |

As variáveis server-side necessárias ao portal e ao gate estavam presentes.
`DATABASE_URL` e `SUPABASE_PROJECT_ID` não estavam presentes. O Docker local
também não estava ativo, portanto não existia uma instância PostgreSQL local
na qual aplicar e reverter migrations.

## Testes executados

### Pipeline de código

| Verificação | Resultado | Evidência resumida |
|---|---|---|
| `pnpm audit:structure` | PASS com achados | 62 arquivos de produção e 15 entradas Next analisados |
| `pnpm typecheck:strict` | PASS | sem símbolos locais ou parâmetros não usados |
| `pnpm lint` | PASS | zero warning permitido |
| `pnpm typecheck` | PASS | tipos de rotas gerados e `tsc --noEmit` aprovado |
| `pnpm test` | PASS | 35 arquivos, 170 testes, zero falha |
| `pnpm build` | PASS | build Turbopack e 11 rotas concluídos |
| `pnpm check` | PASS | pipeline oficial completo aprovado |

Os testes atuais cobrem autenticação demo, escopo de tenant, repositórios,
formulários, migrations por inspeção, catálogos, modelos, API demo, mercado,
embed seguro e ações administrativas. Eles não medem cobertura de linhas e não
substituem execução das migrations em Postgres.

### Acessibilidade pública

`scripts/smoke-accessibility.mjs` foi executado contra o servidor local com
dados persistidos.

- 2 rotas: home BV e matéria com vídeo;
- 3 viewports: 390 × 844, 768 × 1024 e 1440 × 1000;
- 6/6 combinações aprovadas;
- axe sem violações nas regras configuradas;
- sem overflow horizontal;
- embed `youtube-nocookie` presente, com título e tela cheia;
- preferências de fonte, contraste e movimento aplicadas e persistidas.

Limitação: o script está preso ao tenant BV e a uma matéria específica. Isso
deve virar uma matriz configurável antes do quinto modelo.

### Gate e área administrativa

Relatório bruto aprovado:
`artifacts/revisao-estrutural/smoke-admin/2026-08-31T13-55-33-028Z-127.0.0.1/report.json`.

Os 13 passos passaram:

1. login e aviso de demonstração;
2. recusa de credencial inválida;
3. sessão anônima `401`;
4. recusa de Server Action com origem externa;
5. login válido e redirecionamento;
6. sessão autenticada `200`, `demo=true` e ator correto;
7. cookie adulterado recusado, preservando cookies não demo;
8. restabelecimento da sessão;
9. reload da área protegida;
10. navegação para Identidades;
11. navegação para Auditoria;
12. retorno a Conteúdo;
13. logout, bloqueio de `/admin` e nova sessão `401`.

O retorno `500` da tentativa com origem externa é o comportamento do Next.js
ao abortar a Server Action e não criou sessão. Funcionalmente o ataque foi
recusado, mas vale avaliar futuramente se a observabilidade deve separar essa
recusa esperada de erro interno inesperado.

### Matriz dos tenants e modelos

Foram verificados os seis tenants conhecidos em 390 × 844 e 1440 × 1000:

| Tenant | Modelo resolvido | Home mobile/desktop |
|---|---|---|
| `bv-educacao` | `financial-services-credit` | PASS / PASS |
| `credito-demo-orbita` | `financial-services-credit` | PASS / PASS |
| `banco-demo-horizonte` | `investments-asset-management` | PASS / PASS |
| `seguros-demo-atlas` | `insurance-pension` | PASS / PASS |
| `abrafarma` | `health-pharma` | PASS / PASS |
| `broadcast-saude` | `health-pharma` | PASS / PASS |

Nos 12 cenários, o HTTP foi `200`, o modelo foi resolvido, havia conteúdo
significativo, e não houve overlay, exceção de página ou overflow horizontal.

Também foi percorrido um representante de cada modelo da home até o primeiro
link real de editoria e de matéria, em mobile e desktop. Foram 16/16
navegações aprovadas, sempre preservando o `data-site-model` esperado.

### Inspeção visual

Evidências válidas com acesso aos assets externos:

- `artifacts/revisao-estrutural/home-desktop-networked.png`;
- `artifacts/revisao-estrutural/home-mobile-networked.png`;
- `artifacts/revisao-estrutural/home-mobile-viewport-networked.png`.

Logo, imagens, hierarquia, conteúdo e rodapé renderizaram corretamente. Em
390 px, o botão flutuante do VLibras cobre parte de uma linha do resumo do hero.
É um achado P2 de usabilidade/acessibilidade visual: não quebra o fluxo, mas
precisa de uma área segura ou posicionamento que não cubra conteúdo.

As capturas `home-desktop.png` e `home-mobile.png` sem o sufixo `networked` não
devem ser usadas para avaliar assets externos. Nesse ensaio, o sandbox bloqueou
Supabase Storage e VLibras com `ERR_NETWORK_ACCESS_DENIED`, produzindo um falso
logo quebrado.

## Ensaios inicialmente reprovados e diagnóstico

Uma primeira execução usou `next start` dentro do sandbox:

- o servidor não alcançou o Supabase (`fetch failed`, `EACCES`) e a matéria
  caiu no estado de contingência sem o vídeo esperado;
- `next start` usa `NODE_ENV=production`, portanto gerou cookie `Secure` mesmo
  sobre HTTP local; o filtro de cookies do smoke local não o encontrou.

Esses resultados não foram classificados como regressões porque o mesmo código
foi repetido no ambiente contratual correto (`next dev`, rede disponível) e os
dois smokes passaram integralmente. O protocolo deve explicitar essa diferença
para evitar falso negativo futuro.

## O que não foi executado

| Item | Motivo | Consequência |
|---|---|---|
| `pnpm test:watch` | modo interativo da mesma suíte | nenhuma cobertura adicional perdida |
| `pnpm demo:reset` | operação destrutiva; sem `DATABASE_URL`/projeto demo autorizado | seed e idempotência não foram revalidados |
| `pnpm release:promote` | altera deployment/Production e não existe Preview deste branch | nenhuma promoção foi autorizada |
| smoke de Preview/Production | o branch não foi publicado | runtime remoto deste diff permanece não testado |
| `supabase db reset` | Docker/Supabase local indisponível | migrations não foram aplicadas em banco descartável |
| pgTAP e `supabase test db` | dependem da instância local | funções, grants e rollback não foram provados no Postgres |
| advisors após a nova migration | migration não aplicada | segurança/performance do DDL permanece em `VERIFY` |
| teste remoto de escrita/rollback | evitar mutar o projeto sem etapa controlada | `R301` não pode ser `DONE` |

Atualização de 31/08/2026: essa lacuna foi fechada após autorização explícita,
sem branch paga. Um preflight no banco oficial executou 23/23 asserções dentro
de uma transação com limites rígidos e `ROLLBACK`; a contraprova encontrou zero
funções, dados, locks ou transações residuais. Evidência em
`docs/28-evidencia-r301-banco-oficial.md`.

## Achados e atuação recomendada

### P0 — bloqueio imediato

Nenhum P0 funcional foi reproduzido no código atual. Isso não equivale a
autorizar a migration nova: ausência de banco de teste é uma lacuna de
evidência, tratada como gate P1/P0 de entrega em `R301`.

### P1.1 — provar a atomicidade em Postgres real (`R301`)

Status posterior ao relatório: `DONE`. O plano abaixo permanece como registro
da recomendação original; foi substituído por preflight transacional autorizado
no banco oficial, sem persistência e sem branch Supabase.

Situação: as novas RPCs usam `security invoker`, `search_path=''`, grants
restritos a `service_role`, merge com `jsonb_set` e validação de `row_count`.
O desenho local segue as práticas esperadas, mas o teste atual lê o SQL como
texto.

Como atuar:

1. iniciar Supabase local descartável e executar `supabase db reset`;
2. criar testes pgTAP para existência/assinatura/privilégios das duas funções;
3. criar um conteúdo de cada variante e confirmar item, revisão, mídia e
   metadados na mesma transação;
4. forçar erro depois da criação da revisão e provar rollback sem item órfão;
5. repetir a mesma chave/retry e provar ausência de duplicidade;
6. tentar editar conteúdo de outro tenant e provar zero alteração;
7. executar database tests, lint/advisors e gerar tipos a partir do schema;
8. aplicar em Preview, repetir as consultas e somente então marcar `R301=DONE`.

Critério de saída: rollback, retry, isolamento, grants e advisors aprovados com
evidência reproduzível.

### P1.2 — eliminar o preview paralelo (`R302`)

Situação: `LivePortalPreview` recria uma linguagem visual que não é o renderer
de produção. Isso permite o ADM aprovar algo que o portal não exibirá igual.

Como atuar: fazer o preview consumir fixtures tipadas no mesmo
`SiteModelHome/Category/Article`, `PublicShell` e `PublicHeader` usados pelo
portal. Estados pendentes devem entrar por props, não por uma segunda árvore.

Critério de saída: a mesma fixture produz estrutura equivalente no workbench e
no portal em 390/768/1440, com e sem imagem.

### P1.3 — uma fonte de verdade para modelos (`R303`)

Situação: `site_model`, composição legada, registros React, condicionais de
header, CSS, formulário e allowlists SQL precisam ser alterados separadamente.

Como atuar: criar um registro central que associe ID, definição, componentes e
capacidades. Gerar ou testar explicitamente a paridade do contrato SQL. Manter
compatibilidade legada com data e etapa de remoção.

Critério de saída: adicionar um ID inválido falha fechado; adicionar um ID
válido exige alteração em um contrato central e testes apontam qualquer parte
ausente.

### P1.4 — remover exceções por slug e órfãos confirmados (`R304`)

Situação: há lógica de marca por slug e fallback de temas por slug. O auditor
também apontou `category-spotlights.tsx` e `story-list.tsx` como candidatos a
órfãos, ainda não como remoção segura.

Como atuar: mover copy/capacidades de marca para configuração validada;
restringir fallback a fixtures explícitas de desenvolvimento; confirmar o
grafo de imports e remover órfãos apenas com regressão verde.

Critério de saída: nenhum tenant novo requer `if (slug === ...)`, e cada arquivo
removido possui evidência de ausência de consumidor.

### P1.5 — versionar a matriz real (`R305`)

Situação: a matriz de 12 homes e 16 rotas passou, mas foi executada como ensaio
ad hoc. O smoke de acessibilidade continua preso a BV.

Como atuar: criar um smoke Playwright versionado que descubra os links reais e
cubra um tenant por modelo em home/editoria/matéria, 390/768/1440, modelo,
HTTP, conteúdo, overlay, `pageerror` e overflow. Separar pré-requisitos locais
de Preview e Production.

Critério de saída: um comando único reproduz a matriz e falha se um modelo,
rota ou viewport regredir.

### P1.6 — reconciliar variantes editoriais (`C220`/A06)

Situação: documentação e banco descrevem padrão, explicador, patrocinada e
correção; a interface operacional ainda envia somente `standard`.

Como atuar: depois de `R301`, implementar campos condicionais, preservação após
erro, listagem/filtro e testes de criação/edição. Não declarar a variante pronta
enquanto a UI não atravessar o fluxo real.

### P2 — melhorias controladas

1. corrigir a sobreposição do VLibras em 390 px com área segura e teste visual;
2. dividir `identity-workbench.tsx` (763 linhas), página admin (693),
   `portal-repository.ts` (635) e `content-repository.ts` (551) por
   responsabilidade, sempre depois de testes de caracterização;
3. reconciliar `SUPABASE_STORAGE_BUCKET`, hoje documentado mas não consumido,
   com o bucket `demo-media` usado no código/schema;
4. revisar catches amplos e adicionar contexto/telemetria sem registrar
   segredo, cookie ou corpo editorial integral;
5. alinhar a versão efetiva do pnpm com `packageManager` via Corepack/CI;
6. corrigir o warning de navegação do Next.js declarando
   `data-scroll-behavior="smooth"` no `<html>` ou removendo o comportamento
   global se ele não for necessário;
7. marcar a imagem principal acima da dobra para carregamento prioritário e
   confirmar a melhora de LCP sem antecipar imagens secundárias;
8. manter `TASKS.md`, `STATUS.md` e estado real sincronizados após cada gate.

## Ordem recomendada antes do quinto modelo

```text
R301 banco real e rollback
  -> R302 renderer único no preview
    -> R303 registro único de modelos
      -> R304 slugs, órfãos e documentação
        -> R305 matriz E2E versionada
          -> D34 direção do quinto modelo aprovada
            -> R310 implementação
              -> R311 Preview e auditoria adversarial
```

Não se deve começar `R310` apenas adicionando um quinto valor às allowlists
atuais. Isso multiplicaria os pontos de mudança que a revisão identificou.

## Parecer final

- **Continuar manutenção/revisão local:** sim.
- **Confiar no comportamento atual dos quatro modelos:** sim, dentro da matriz
  executada.
- **Aplicar a nova migration diretamente em Production:** não.
- **Começar a implementar o quinto modelo agora:** não.
- **Próxima ação objetiva:** disponibilizar Supabase local ou Preview
  descartável e concluir `R301` com pgTAP, rollback, isolamento e advisors.

## Referências operacionais

- [Database Functions — Supabase](https://supabase.com/docs/guides/database/functions)
- [Testing Your Database — Supabase](https://supabase.com/docs/guides/database/testing)
- [Database Migrations — Supabase](https://supabase.com/docs/guides/deployment/database-migrations)
- [Performance and Security Advisors — Supabase](https://supabase.com/docs/guides/database/database-advisors)
