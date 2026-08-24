-- Remove do BV Educação distribuições herdadas de tenants demonstrativos que
-- não pertencem aos briefings autorizados e recompõe a curadoria da home com
-- conteúdo BV. O conteúdo canônico dos tenants de origem permanece intacto.

create or replace function private.restrict_bv_catalog_and_restore_home()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  bv_tenant_id uuid;
  removed_distribution_count integer;
begin
  select tenant.id into bv_tenant_id
  from public.tenants tenant
  where tenant.slug = 'bv-educacao'
    and tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo = true
    and tenant.archived_at is null;

  if bv_tenant_id is null then
    raise exception 'Tenant BV indisponível para restringir o catálogo';
  end if;

  create temporary table if not exists bv_legacy_distributions (
    distribution_id uuid primary key,
    content_item_id uuid not null
  ) on commit drop;
  truncate table pg_temp.bv_legacy_distributions;

  insert into pg_temp.bv_legacy_distributions (
    distribution_id, content_item_id
  )
  select distribution.id, distribution.content_item_id
  from public.distributions distribution
  join public.content_items item on item.id = distribution.content_item_id
  join public.tenants owner on owner.id = item.owner_tenant_id
  where distribution.tenant_id = bv_tenant_id
    and distribution.contract_reference is null
    and owner.slug in (
      'abrafarma',
      'banco-demo-horizonte',
      'credito-demo-orbita',
      'seguros-demo-atlas'
    );

  select count(*) into removed_distribution_count
  from pg_temp.bv_legacy_distributions;

  delete from public.placements placement
  using pg_temp.bv_legacy_distributions legacy
  where placement.tenant_id = bv_tenant_id
    and placement.content_item_id = legacy.content_item_id;

  delete from public.distributions distribution
  using pg_temp.bv_legacy_distributions legacy
  where distribution.id = legacy.distribution_id;

  update public.theme_versions version
  set
    navigation_json = jsonb_build_array(
      'Início',
      'Indicadores',
      'Investimentos',
      'Alerta de golpes',
      'Programando o futuro',
      'Isso ou aquilo',
      'Saia das dívidas',
      'Alívio no orçamento',
      'Guias',
      'Dicas valiosas',
      'Jornada de crédito BV',
      'Especialista responde',
      'Glossário'
    ),
    change_summary = 'Catálogo BV restrito aos briefings autorizados e home recorrigida.'
  from public.themes theme
  where theme.tenant_id = bv_tenant_id
    and version.id = theme.published_version_id;

  insert into public.placements (
    id, tenant_id, slot_key, content_item_id, starts_at, rank,
    presentation_variant, eyebrow_override, status, is_demo
  )
  select
    md5('bv-educacao:authorized-placement:' || curated.slot_key || ':' || curated.rank)::uuid,
    bv_tenant_id,
    curated.slot_key,
    item.id,
    item.first_published_at,
    curated.rank,
    curated.presentation_variant,
    curated.eyebrow_override,
    'active',
    true
  from (
    values
      ('home.hero', 0, 'BV-013', 'hero', 'ORÇAMENTO'),
      ('home.secondary', 0, 'BV-006', 'featured', 'SEGURANÇA'),
      ('home.secondary', 1, 'BV-017', 'featured', 'GUIAS')
  ) as curated(
    slot_key, rank, seed_code, presentation_variant, eyebrow_override
  )
  join public.content_revisions revision
    on revision.body_json ->> 'seed_code' = curated.seed_code
  join public.content_items item
    on item.id = revision.content_item_id
   and item.current_published_revision_id = revision.id
  join public.distributions distribution
    on distribution.content_item_id = item.id
   and distribution.tenant_id = bv_tenant_id
   and distribution.status = 'active'
   and distribution.contract_reference = 'CLIENTE-VALIDACAO-BV-2026-08-20'
  on conflict (tenant_id, slot_key, rank) do update set
    content_item_id = excluded.content_item_id,
    starts_at = excluded.starts_at,
    ends_at = null,
    presentation_variant = excluded.presentation_variant,
    eyebrow_override = excluded.eyebrow_override,
    image_override_id = null,
    status = 'active',
    is_demo = true,
    updated_at = now();

  update public.tenants tenant
  set
    settings_json = tenant.settings_json || jsonb_build_object(
      'catalog_scope', 'bv-authorized-only',
      'catalog_references', jsonb_build_array(
        'CLIENTE-VALIDACAO-BV-2026-08-20',
        'CLIENTE-VALIDACAO-BV-2026-08-23'
      )
    ),
    updated_at = now()
  where tenant.id = bv_tenant_id;

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  values (
    md5('bv-educacao:catalog-scope-corrected:2026-08-23')::uuid,
    bv_tenant_id,
    'demo-operator',
    'content.catalog_scope_corrected',
    'tenant',
    bv_tenant_id,
    jsonb_build_object(
      'removed_distributions', removed_distribution_count,
      'approved_content_items', 31,
      'approved_categories_with_content', 11,
      'approved_empty_categories', 1,
      'home_placements', jsonb_build_array('BV-013', 'BV-006', 'BV-017'),
      'catalog_references', jsonb_build_array(
        'CLIENTE-VALIDACAO-BV-2026-08-20',
        'CLIENTE-VALIDACAO-BV-2026-08-23'
      )
    ),
    'Distribuições legadas removidas do BV Educação; conteúdo canônico de origem preservado.',
    true
  )
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.restrict_bv_catalog_and_restore_home()
from public, anon, authenticated, service_role;

comment on function private.restrict_bv_catalog_and_restore_home() is
  'Remove distribuições legadas do BV Educação e restaura a home com conteúdo autorizado.';

select private.restrict_bv_catalog_and_restore_home();
