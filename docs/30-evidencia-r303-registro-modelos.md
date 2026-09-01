# Evidência R303 — registro central e contrato de `site_model`

Data: 31/08/2026

Branch: `codex/revisao-estrutural-nova-frente`

Banco oficial: `Portaldenoticias` (`yhatwpxsxntlorfgxpdl`)

## Resultado

R303 está concluída. O banco oficial não recebeu uma branch paga e o portal não
precisou ser interrompido. O histórico de migrations foi reconciliado, os quatro
modelos possuem um registro React exaustivo e `site_model` passou a ser o único
campo estrutural enviado pela aplicação na gravação da identidade.

O banco preserva o contrato anterior para a versão atualmente publicada da
aplicação. A RPC `cms_save_theme_v2` continua com a mesma assinatura, valida o
trio legado e delega para `cms_save_theme_v3`. A nova RPC recebe somente
`site_model`; cabeçalho, hero e card são derivados da allowlist SQL.

## Reconciliação do histórico

A inspeção inicial encontrou três migrations remotas com timestamps diferentes
dos arquivos locais equivalentes:

- `20260727194548 add_site_models`;
- `20260727230435 expand_editorial_catalog`;
- `20260727230654 fix_editorial_home_placements`.

Consultas somente leitura provaram que schema, catálogo e posicionamentos dessas
entregas já estavam presentes. `migration repair` removeu somente essas entradas
do histórico remoto e marcou os timestamps locais equivalentes como aplicados;
nenhum SQL de negócio foi reexecutado.

Quatro arquivos locais adicionais foram confrontados com o estado real. Três já
estavam aplicados e tiveram apenas o histórico reparado. A migration
`20260812124308_rename_ti_category.sql` era a única realmente ausente: o dry-run
listou apenas ela, a aplicação atualizou “TI” para “Tecnologia e Inovação” e a
auditoria posterior passou.

Antes de criar a migration estrutural, local e remoto estavam integralmente
alinhados. Depois de R303, a lista contém 32 timestamps iguais nos dois lados.

## Fronteiras do novo contrato

### TypeScript e React

- `SITE_MODELS` contém as definições canônicas;
- `SiteModelId` e `SITE_MODEL_IDS` são derivados das chaves dessas definições;
- `SITE_MODEL_REGISTRY` exige, para cada ID, definição e componentes de home,
  editoria e matéria;
- adicionar um ID sem os três renderizadores passa a falhar no TypeScript;
- `header`, `hero` e `card` usados na leitura de versões antigas são derivados
  das definições, e não de listas manuais paralelas;
- o formulário de gravação não envia mais os três campos legados.

### PostgreSQL

A migration `20260901011057_centralize_site_model_registry.sql` cria:

- `cms_resolve_site_model_components(text)`, allowlist SQL canônica, com
  `EXECUTE` apenas para `service_role`;
- `cms_save_theme_v3`, fronteira de escrita baseada somente em `site_model`;
- `cms_save_theme_v2`, wrapper retrocompatível que recusa composição divergente;
- `cms_create_demo_tenant_v2` atualizado para usar o mesmo resolvedor.

Todas as funções públicas permanecem `security invoker`, com `search_path`
vazio. ID nulo ou desconhecido falha fechado. Não houve criação ou alteração de
tabela, remoção de coluna, duplicação de conteúdo ou alteração de RLS.

## Compatibilidade com o sistema em produção

O trio `header/hero/card` fica restrito a:

1. leitura e preview de versões já persistidas;
2. assinatura do wrapper `cms_save_theme_v2` para clientes antigos.

Data limite de retirada: 31/10/2026. Marco responsável: `R311`. A remoção só
deve ocorrer depois que a aplicação publicada estiver comprovadamente em `v3`
e a matriz do quinto modelo estiver aprovada.

A ordem operacional evitou janela incompatível:

1. aplicar primeiro o banco retrocompatível;
2. manter Production atual usando `v2` normalmente;
3. preparar a aplicação da branch para usar `v3`;
4. publicar código somente pelo fluxo Preview → smoke → autorização de
   Production.

R303 não promoveu código da branch para Preview ou Production.

## Evidência no banco oficial

`supabase/tests/preflight/r303_migration_history_audit.sql` executa em transação
somente leitura e confirmou:

- status geral `PASS`;
- 32 migrations alinhadas;
- quatro modelos resolvidos corretamente;
- zero modelos inválidos e zero composições divergentes publicadas;
- `cms_save_theme_v2`, `cms_save_theme_v3` e criação de tenant disponíveis;
- resolvedor negado a `anon` e autorizado ao `service_role`;
- catálogo e correções históricas preservados.

`supabase/tests/preflight/r303_theme_rpc_compatibility.sql` chamou `v2` e `v3`
com a identidade publicada de um tenant demo e terminou em `ROLLBACK`. Resultado:
`PASS`, sem persistência de alterações.

O teste negativo separado chamou o resolvedor com `unknown-r303-model` e recebeu
`unapproved site model`, como esperado.

## Gates locais

- `pnpm lint`: aprovado;
- `pnpm typecheck:strict`: aprovado;
- `pnpm test`: 38 arquivos e 184 testes aprovados;
- `pnpm build`: aprovado, 12 rotas;
- `pnpm audit:structure`: executado; os candidatos e slugs remanescentes foram
  preservados para confirmação em R304;
- `git diff --check`: aprovado.

## Próxima ação

R304 está liberada. Ela deve confirmar consumidores antes de remover os dois
candidatos heurísticos, mover especificidades de marca para configuração
validada, eliminar fallbacks por slug no runtime e reconciliar documentos e
variáveis de ambiente. R305 e o quinto modelo continuam bloqueados.
