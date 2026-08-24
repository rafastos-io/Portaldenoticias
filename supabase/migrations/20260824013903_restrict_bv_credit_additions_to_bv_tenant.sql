-- Corrige o escopo da expansão C257: as duas editorias foram solicitadas
-- especificamente para BV Educação e não devem aparecer em outros tenants que
-- compartilham o mesmo modelo visual de crédito.

create or replace function private.restrict_bv_credit_additions_to_bv_tenant()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  bv_tenant_id uuid;
begin
  select tenant.id into bv_tenant_id
  from public.tenants tenant
  where tenant.slug = 'bv-educacao'
    and tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo = true
    and tenant.archived_at is null;

  if bv_tenant_id is null then
    raise exception 'Tenant BV indisponível para corrigir o escopo da expansão editorial';
  end if;

  create temporary table if not exists bv_credit_addition_out_of_scope (
    id uuid primary key,
    slug text not null unique
  ) on commit drop;
  truncate table pg_temp.bv_credit_addition_out_of_scope;

  insert into pg_temp.bv_credit_addition_out_of_scope (id, slug)
  select distinct tenant.id, tenant.slug
  from public.distributions distribution
  join public.tenants tenant on tenant.id = distribution.tenant_id
  join public.content_items item on item.id = distribution.content_item_id
  join public.content_revisions revision
    on revision.id = item.current_published_revision_id
  where tenant.id <> bv_tenant_id
    and (
      revision.body_json ->> 'seed_code' like 'BV-JC-%'
      or revision.body_json ->> 'seed_code' like 'BV-ER-%'
    );

  delete from public.distributions distribution
  using public.content_items item,
        public.content_revisions revision,
        pg_temp.bv_credit_addition_out_of_scope target
  where distribution.tenant_id = target.id
    and item.id = distribution.content_item_id
    and revision.id = item.current_published_revision_id
    and (
      revision.body_json ->> 'seed_code' like 'BV-JC-%'
      or revision.body_json ->> 'seed_code' like 'BV-ER-%'
    );

  update public.theme_versions version
  set
    navigation_json = coalesce(
      (
        select jsonb_agg(entry.value order by entry.ordinality)
        from jsonb_array_elements(version.navigation_json)
          with ordinality as entry(value, ordinality)
        where entry.value #>> '{}' not in (
          'Jornada de crédito BV',
          'Especialista responde'
        )
      ),
      '[]'::jsonb
    ),
    change_summary = 'Escopo da expansão C257 corrigido; editorias exclusivas do BV Educação.'
  from public.themes theme
  join pg_temp.bv_credit_addition_out_of_scope target
    on target.id = theme.tenant_id
  where version.id = theme.published_version_id;

  update public.tenants tenant
  set
    settings_json = tenant.settings_json - 'credit_journey_reference',
    updated_at = now()
  from pg_temp.bv_credit_addition_out_of_scope target
  where tenant.id = target.id;

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  select
    md5('bv-credit:addition:scope-corrected:' || target.slug)::uuid,
    target.id,
    'demo-operator',
    'content.catalog_scope_corrected',
    'tenant',
    target.id,
    jsonb_build_object(
      'removed_distributions', 10,
      'removed_categories_from_navigation', 2,
      'catalog_reference', 'CLIENTE-VALIDACAO-BV-2026-08-23',
      'authorized_tenant', 'bv-educacao'
    ),
    'Expansão C257 restringida ao tenant BV Educação; conteúdo canônico preservado.',
    true
  from pg_temp.bv_credit_addition_out_of_scope target
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.restrict_bv_credit_additions_to_bv_tenant()
from public, anon, authenticated, service_role;

comment on function private.restrict_bv_credit_additions_to_bv_tenant() is
  'Remove distribuições C257 de tenants não autorizados e preserva o catálogo somente no BV Educação.';

select private.restrict_bv_credit_additions_to_bv_tenant();
