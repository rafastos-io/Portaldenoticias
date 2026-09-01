\set ON_ERROR_STOP on

begin;

create extension if not exists pgtap with schema extensions;

\ir ../../migrations/20260831110000_make_editorial_metadata_atomic.sql

create temporary table r301_test_context (
  tenant_a uuid not null,
  tenant_b uuid not null,
  category_id uuid not null,
  platform_author_id uuid not null,
  foreign_author_id uuid not null,
  sponsored_slug text not null,
  explainer_slug text not null,
  invalid_slug text not null,
  cross_tenant_slug text not null,
  forced_failure_slug text not null,
  sponsored_id uuid,
  explainer_id uuid,
  correction_revision_id uuid
) on commit drop;

insert into r301_test_context (
  tenant_a,
  tenant_b,
  category_id,
  platform_author_id,
  foreign_author_id,
  sponsored_slug,
  explainer_slug,
  invalid_slug,
  cross_tenant_slug,
  forced_failure_slug
)
select
  tenant_a.id,
  tenant_b.id,
  (
    select category.id
    from public.categories category
    join public.tenants owner on owner.id = category.owner_tenant_id
    where owner.kind = 'platform' and category.status = 'active'
    order by category.id
    limit 1
  ),
  (
    select author.id
    from public.authors author
    join public.tenants owner on owner.id = author.owner_tenant_id
    where owner.kind = 'platform' and author.status = 'active'
    order by author.id
    limit 1
  ),
  (
    select author.id
    from public.authors author
    where author.owner_tenant_id = tenant_b.id and author.status = 'active'
    order by author.id
    limit 1
  ),
  'r301-sponsored-' || txid_current()::text,
  'r301-explainer-' || txid_current()::text,
  'r301-invalid-' || txid_current()::text,
  'r301-cross-tenant-' || txid_current()::text,
  'r301-forced-failure-' || txid_current()::text
from public.tenants tenant_a
cross join public.tenants tenant_b
where tenant_a.slug = 'credito-demo-orbita'
  and tenant_a.kind = 'demo'
  and tenant_a.status = 'demo'
  and tenant_b.slug = 'banco-demo-horizonte'
  and tenant_b.kind = 'demo'
  and tenant_b.status = 'demo';

create function pg_temp.r301_invalid_metadata_rejected()
returns boolean
language plpgsql
as $$
declare
  context_row pg_temp.r301_test_context%rowtype;
begin
  select * into strict context_row from pg_temp.r301_test_context;
  perform public.cms_create_editorial_content(
    context_row.tenant_a,
    context_row.invalid_slug,
    'Metadados inválidos devem ser recusados',
    'Linha fina válida para o ensaio transacional.',
    'Texto fictício suficientemente longo para exercitar a validação editorial sem persistir nenhum dado após o rollback do ensaio.',
    context_row.category_id,
    context_row.platform_author_id,
    'none',
    '',
    'standard',
    array['tópico indevido'],
    null,
    null
  );
  return false;
exception
  when others then
    return sqlerrm = 'invalid editorial metadata';
end;
$$;

create function pg_temp.r301_duplicate_rejected()
returns boolean
language plpgsql
as $$
declare
  context_row pg_temp.r301_test_context%rowtype;
begin
  select * into strict context_row from pg_temp.r301_test_context;
  perform public.cms_create_editorial_content(
    context_row.tenant_a,
    context_row.sponsored_slug,
    'Retry não deve duplicar conteúdo',
    'Linha fina válida para o ensaio de retry.',
    'Texto fictício suficientemente longo para provar que uma repetição da mesma chave não cria item ou revisão duplicada no catálogo.',
    context_row.category_id,
    context_row.platform_author_id,
    'none',
    '',
    'sponsored',
    array[]::text[],
    'Patrocínio fictício para teste',
    null
  );
  return false;
exception
  when unique_violation then
    return true;
end;
$$;

create function pg_temp.r301_cross_tenant_author_rejected()
returns boolean
language plpgsql
as $$
declare
  context_row pg_temp.r301_test_context%rowtype;
begin
  select * into strict context_row from pg_temp.r301_test_context;
  perform public.cms_create_editorial_content(
    context_row.tenant_a,
    context_row.cross_tenant_slug,
    'Autoria de outro tenant deve ser recusada',
    'Linha fina válida para o ensaio negativo de tenant.',
    'Texto fictício suficientemente longo para provar que uma autoria privada de outro tenant não pode atravessar o limite do catálogo.',
    context_row.category_id,
    context_row.foreign_author_id,
    'none',
    '',
    'standard',
    array[]::text[],
    null,
    null
  );
  return false;
exception
  when others then
    return sqlerrm = 'invalid author or category scope';
end;
$$;

create function pg_temp.r301_cross_tenant_update_rejected()
returns boolean
language plpgsql
as $$
declare
  context_row pg_temp.r301_test_context%rowtype;
begin
  select * into strict context_row from pg_temp.r301_test_context;
  perform public.cms_update_editorial_content(
    context_row.tenant_b,
    context_row.sponsored_id,
    'Edição cruzada deve ser recusada',
    'Linha fina válida para o ensaio negativo de edição.',
    'Texto fictício suficientemente longo para provar que outro tenant não consegue criar uma revisão sobre conteúdo que não possui.',
    context_row.category_id,
    context_row.platform_author_id,
    'none',
    '',
    'standard',
    array[]::text[],
    null,
    null
  );
  return false;
exception
  when others then
    return sqlerrm = 'content unavailable for tenant';
end;
$$;

create function pg_temp.r301_force_metadata_failure()
returns trigger
language plpgsql
as $$
begin
  if new.slug_snapshot = (
    select context.forced_failure_slug from pg_temp.r301_test_context context
  ) and new.body_json ? 'editorial_type'
  then
    raise exception 'r301 forced metadata failure';
  end if;
  return new;
end;
$$;

create trigger r301_force_metadata_failure
before update of body_json on public.content_revisions
for each row execute function pg_temp.r301_force_metadata_failure();

create function pg_temp.r301_post_create_failure_rolled_back()
returns boolean
language plpgsql
as $$
declare
  context_row pg_temp.r301_test_context%rowtype;
begin
  select * into strict context_row from pg_temp.r301_test_context;
  perform public.cms_create_editorial_content(
    context_row.tenant_a,
    context_row.forced_failure_slug,
    'Falha posterior deve reverter tudo',
    'Linha fina válida para o ensaio de rollback.',
    'Texto fictício suficientemente longo para criar item, revisão, distribuição e auditoria antes da falha de metadados forçada.',
    context_row.category_id,
    context_row.platform_author_id,
    'fallback',
    'Composição abstrata fictícia para o teste de rollback.',
    'standard',
    array[]::text[],
    null,
    null
  );
  return false;
exception
  when others then
    return sqlerrm = 'r301 forced metadata failure';
end;
$$;

select extensions.plan(23);

select extensions.ok(
  (select count(*) = 5 and bool_and(value is not null)
   from pg_temp.r301_test_context context
   cross join lateral unnest(array[
     context.tenant_a,
     context.tenant_b,
     context.category_id,
     context.platform_author_id,
     context.foreign_author_id
   ]) value),
  'fixtures de tenant, categoria e autoria estão disponíveis'
);

select extensions.ok(
  to_regprocedure('public.cms_create_editorial_content(uuid,text,text,text,text,uuid,uuid,text,text,text,text[],text,text)') is not null,
  'RPC de criação editorial existe'
);
select extensions.ok(
  to_regprocedure('public.cms_update_editorial_content(uuid,uuid,text,text,text,uuid,uuid,text,text,text,text[],text,text)') is not null,
  'RPC de atualização editorial existe'
);
select extensions.ok(
  (select bool_and(not procedure.prosecdef)
   from pg_proc procedure
   where procedure.oid in (
     'public.cms_create_editorial_content(uuid,text,text,text,text,uuid,uuid,text,text,text,text[],text,text)'::regprocedure,
     'public.cms_update_editorial_content(uuid,uuid,text,text,text,uuid,uuid,text,text,text,text[],text,text)'::regprocedure
   )),
  'RPCs usam security invoker'
);
select extensions.ok(
  (select bool_and(procedure.proconfig @> array['search_path=""'])
   from pg_proc procedure
   where procedure.oid in (
     'public.cms_create_editorial_content(uuid,text,text,text,text,uuid,uuid,text,text,text,text[],text,text)'::regprocedure,
     'public.cms_update_editorial_content(uuid,uuid,text,text,text,uuid,uuid,text,text,text,text[],text,text)'::regprocedure
   )),
  'RPCs usam search_path vazio'
);
select extensions.ok(
  has_function_privilege('service_role', 'public.cms_create_editorial_content(uuid,text,text,text,text,uuid,uuid,text,text,text,text[],text,text)', 'execute')
  and has_function_privilege('service_role', 'public.cms_update_editorial_content(uuid,uuid,text,text,text,uuid,uuid,text,text,text,text[],text,text)', 'execute'),
  'service_role pode executar as RPCs'
);
select extensions.ok(
  not has_function_privilege('anon', 'public.cms_create_editorial_content(uuid,text,text,text,text,uuid,uuid,text,text,text,text[],text,text)', 'execute')
  and not has_function_privilege('anon', 'public.cms_update_editorial_content(uuid,uuid,text,text,text,uuid,uuid,text,text,text,text[],text,text)', 'execute'),
  'anon não pode executar as RPCs'
);
select extensions.ok(
  not has_function_privilege('authenticated', 'public.cms_create_editorial_content(uuid,text,text,text,text,uuid,uuid,text,text,text,text[],text,text)', 'execute')
  and not has_function_privilege('authenticated', 'public.cms_update_editorial_content(uuid,uuid,text,text,text,uuid,uuid,text,text,text,text[],text,text)', 'execute'),
  'authenticated não pode executar as RPCs'
);

update pg_temp.r301_test_context context
set sponsored_id = public.cms_create_editorial_content(
  context.tenant_a,
  context.sponsored_slug,
  'Conteúdo patrocinado transacional',
  'Linha fina válida para conteúdo patrocinado fictício.',
  'Texto fictício suficientemente longo para validar a criação transacional de conteúdo, revisão, mídia e metadados editoriais.',
  context.category_id,
  context.platform_author_id,
  'fallback',
  'Composição abstrata fictícia sobre educação financeira.',
  'sponsored',
  array[]::text[],
  'Patrocínio fictício para teste',
  null
);

select extensions.ok(
  (select sponsored_id is not null from pg_temp.r301_test_context),
  'criação patrocinada retorna o item'
);
select extensions.is(
  (select item.content_type
   from public.content_items item
   join pg_temp.r301_test_context context on context.sponsored_id = item.id),
  'sponsored'::text,
  'criação patrocinada atualiza content_type'
);
select extensions.ok(
  (select revision.body_json ? 'demo_media'
     and revision.body_json ? 'content'
   from public.content_revisions revision
   join pg_temp.r301_test_context context on context.sponsored_id = revision.content_item_id
   where revision.revision_number = 1),
  'merge editorial preserva mídia e corpo estruturado'
);
select extensions.ok(
  (select revision.body_json ->> 'editorial_type' = 'sponsored'
     and revision.body_json -> 'key_topics' = '[]'::jsonb
     and revision.sponsorship_label = 'Patrocínio fictício para teste'
     and revision.correction_note is null
   from public.content_revisions revision
   join pg_temp.r301_test_context context on context.sponsored_id = revision.content_item_id
   where revision.revision_number = 1),
  'metadados patrocinados pertencem à revisão inicial'
);
select extensions.is(
  (select count(*)::integer
   from public.content_revisions revision
   join pg_temp.r301_test_context context on context.sponsored_id = revision.content_item_id),
  1,
  'criação produz uma única revisão'
);

update pg_temp.r301_test_context context
set correction_revision_id = public.cms_update_editorial_content(
  context.tenant_a,
  context.sponsored_id,
  'Conteúdo corrigido transacionalmente',
  'Linha fina válida após a correção editorial.',
  'Texto fictício suficientemente longo para validar nova revisão, remoção do patrocínio e registro da nota de correção.',
  context.category_id,
  context.platform_author_id,
  'none',
  '',
  'correction',
  array[]::text[],
  null,
  'A linha fina foi corrigida para maior clareza.'
);

select extensions.ok(
  (select correction_revision_id is not null from pg_temp.r301_test_context),
  'atualização retorna a nova revisão'
);
select extensions.ok(
  (select revision.revision_number = 2
     and revision.body_json ->> 'editorial_type' = 'correction'
     and revision.body_json ? 'demo_media'
     and revision.body_json ? 'content'
     and revision.sponsorship_label is null
     and revision.correction_note = 'A linha fina foi corrigida para maior clareza.'
   from public.content_revisions revision
   join pg_temp.r301_test_context context on context.correction_revision_id = revision.id),
  'correção cria revisão 2, preserva JSON e limpa patrocínio'
);
select extensions.is(
  (select item.content_type
   from public.content_items item
   join pg_temp.r301_test_context context on context.sponsored_id = item.id),
  'article'::text,
  'correção restaura content_type para article'
);
select extensions.is(
  (select count(*)::integer
   from public.content_revisions revision
   join pg_temp.r301_test_context context on context.sponsored_id = revision.content_item_id),
  2,
  'edição produz exatamente duas revisões'
);

update pg_temp.r301_test_context context
set explainer_id = public.cms_create_editorial_content(
  context.tenant_a,
  context.explainer_slug,
  'Explicador transacional de demonstração',
  'Linha fina válida para o explicador fictício.',
  'Texto fictício suficientemente longo para validar tópicos-chave persistidos junto da primeira revisão do conteúdo explicador.',
  context.category_id,
  context.platform_author_id,
  'none',
  '',
  'explainer',
  array['orçamento', 'planejamento'],
  null,
  null
);

select extensions.ok(
  (select revision.body_json ->> 'editorial_type' = 'explainer'
     and revision.body_json -> 'key_topics' = '["orçamento", "planejamento"]'::jsonb
   from public.content_revisions revision
   join pg_temp.r301_test_context context on context.explainer_id = revision.content_item_id
   where revision.revision_number = 1),
  'explicador persiste tópicos-chave na mesma revisão'
);
select extensions.ok(
  pg_temp.r301_invalid_metadata_rejected()
  and not exists (
    select 1 from public.content_items item
    join pg_temp.r301_test_context context on context.invalid_slug = item.canonical_slug
    where item.owner_tenant_id = context.tenant_a
  ),
  'metadados inválidos são recusados sem item parcial'
);
select extensions.ok(
  pg_temp.r301_duplicate_rejected()
  and (select count(*) = 1
       from public.content_items item
       join pg_temp.r301_test_context context on context.sponsored_slug = item.canonical_slug
       where item.owner_tenant_id = context.tenant_a),
  'retry com a mesma chave não duplica o item'
);
select extensions.ok(
  pg_temp.r301_cross_tenant_author_rejected()
  and not exists (
    select 1 from public.content_items item
    join pg_temp.r301_test_context context on context.cross_tenant_slug = item.canonical_slug
    where item.owner_tenant_id = context.tenant_a
  ),
  'autoria privada de outro tenant é recusada sem escrita'
);
select extensions.ok(
  pg_temp.r301_cross_tenant_update_rejected()
  and (select count(*) = 2
       from public.content_revisions revision
       join pg_temp.r301_test_context context on context.sponsored_id = revision.content_item_id),
  'outro tenant não cria revisão no conteúdo'
);
select extensions.ok(
  pg_temp.r301_post_create_failure_rolled_back()
  and not exists (
    select 1 from public.content_items item
    join pg_temp.r301_test_context context on context.forced_failure_slug = item.canonical_slug
    where item.owner_tenant_id = context.tenant_a
  ),
  'falha posterior à criação reverte item e dependências'
);

select * from extensions.finish();

rollback;
