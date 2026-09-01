# Evidência R301 no banco oficial

Data: 31/08/2026.

Projeto confirmado pelo responsável: `Portaldenoticias`
(`yhatwpxsxntlorfgxpdl`).

## Objetivo

Provar no PostgreSQL real que as RPCs de criação e atualização editorial
gravam conteúdo, revisão, mídia, tipo e metadados de forma atômica, sem aplicar
a migration nem deixar conteúdo de teste no banco oficial.

## Salvaguardas

- nenhuma branch Supabase foi criada;
- inspeção de segurança somente de leitura antes da escrita;
- zero sessões concorrentes ativas, locks aguardando ou transações ociosas;
- nenhuma função base ou trigger das tabelas-alvo chamou HTTP, webhook ou fila;
- execução dentro de `BEGIN` e `ROLLBACK`;
- `lock_timeout=3s`, `statement_timeout=60s` e
  `idle_in_transaction_session_timeout=60s`;
- nenhuma extensão foi instalada;
- nenhum trigger temporário foi criado em tabela persistente;
- slugs exclusivos `r301-*` e somente tenants de demonstração;
- project ref conferido pelo runner antes de compor o SQL.

## Resultado

O preflight transacional terminou em aproximadamente 4,3 segundos com:

```text
status: PASS
asserções: 23/23
```

As verificações cobriram:

- existência, assinatura, `security invoker` e `search_path` vazio;
- execução exclusiva por `service_role`;
- criação patrocinada e atualização para correção;
- preservação de `body_json`, mídia e conteúdo estruturado;
- persistência de tópicos do explicador;
- retry sem duplicidade;
- metadados inválidos sem item parcial;
- autoria de outro tenant recusada;
- atualização cruzada entre tenants recusada;
- rollback de item, revisão, distribuição, vínculos e auditoria.

A primeira execução segura revelou um erro no próprio teste: cinco UUIDs eram
expandidos por `unnest`, mas a asserção esperava uma linha. A expectativa foi
corrigida de `count(*) = 1` para `count(*) = 5` antes da execução aprovada.

## Contraprova após o rollback do preflight

Uma consulta independente, somente de leitura, confirmou:

```text
cms_create_editorial_content persistida: não
cms_update_editorial_content persistida: não
conteúdos com slug r301-*: 0
locks não concedidos: 0
sessões idle in transaction: 0
```

Portanto, a migration e os dados de ensaio não permaneceram no banco oficial.

O lint remoto posterior terminou com `No schema errors found`. No repositório,
`pnpm audit:structure`, `pnpm check`, `pnpm typecheck:strict` e
`git diff --check` passaram; o pipeline executou lint, tipos, 35 arquivos/170
testes e build das 11 rotas.

## Aplicação definitiva

Depois do preflight, o responsável executou manualmente a migration completa
no SQL Editor do projeto oficial e apresentou o resultado
`Success. No rows returned`.

A verificação independente posterior confirmou:

```text
funções encontradas: 2/2
security invoker: sim
search_path vazio: sim
guard de tenant: presente nas duas funções
merge com jsonb_set: presente nas duas funções
service_role pode executar: sim
anon pode executar: não
authenticated pode executar: não
locks não concedidos: 0
sessões idle in transaction: 0
db lint: nenhum erro
advisors de segurança/performance: nenhum achado
```

Como a execução ocorreu pelo SQL Editor, a versão `20260831110000` foi
registrada depois com `supabase migration repair --status applied`. A listagem
posterior confirmou essa versão alinhada nas colunas local e remota. Permanecem
divergências históricas anteriores, fora do escopo funcional do R301; elas
devem ser reconciliadas antes da próxima migration estrutural.

## Evidência reproduzível

- migration:
  `supabase/migrations/20260831110000_make_editorial_metadata_atomic.sql`;
- matriz canônica pgTAP:
  `supabase/tests/preflight/editorial_atomicity_preflight.sql`;
- inspeção somente de leitura:
  `supabase/tests/preflight/r301_safety_probe.sql`;
- compositor/guard de projeto:
  `scripts/run-r301-production-preflight.mjs`.

O runner é inerte sem `--execute`: por padrão apenas valida a composição e
informa `READY`. O SQL gerado sempre precisa terminar em `ROLLBACK`.

## Limitações e próximo gate

- o R301 foi aplicado ao banco oficial, mas o código da aplicação que passa a
  chamar as novas RPCs permanece somente na branch de revisão;
- a versão do R301 está reconciliada; divergências históricas anteriores entram
  no housekeeping de migrations do R303;
- publicar o código continua sendo uma autorização separada e exige smoke do
  portal/Admin;
- a consulta HTTP externa não pôde ser repetida nesta sessão porque o resolvedor
  DNS local falhou e o conector Vercel está autenticado em outra conta;
- a saúde do banco foi confirmada por zero locks/transações residuais, mas isso
  não substitui observabilidade HTTP permanente.
