begin;

set transaction read only;
set local statement_timeout = '30s';
set local lock_timeout = '2s';
set local application_name = 'r303-migration-history-audit';

with published_themes as (
  select
    tenant.slug,
    version.components_json
  from public.tenants tenant
  join public.themes theme
    on theme.tenant_id = tenant.id
   and theme.published_version_id is not null
  join public.theme_versions version
    on version.id = theme.published_version_id
  where tenant.status = 'demo'
    and tenant.is_demo
),
theme_contract as (
  select
    count(*) filter (
      where components_json ->> 'site_model' not in (
        'financial-services-credit',
        'investments-asset-management',
        'insurance-pension',
        'health-pharma'
      )
      or components_json ->> 'site_model' is null
    ) as invalid_models,
    count(*) filter (
      where (components_json ->> 'site_model', components_json ->> 'header', components_json ->> 'hero', components_json ->> 'card') not in (
        ('financial-services-credit', 'masthead-clean', 'featured-grid', 'image-top'),
        ('investments-asset-management', 'masthead-clean', 'split-editorial', 'data-led'),
        ('insurance-pension', 'brand-centered', 'featured-grid', 'compact-horizontal'),
        ('health-pharma', 'masthead-minimal', 'science-feature', 'data-led')
      )
    ) as composition_mismatches
  from published_themes
),
catalog_contract as (
  select
    count(distinct revision.body_json ->> 'seed_code') filter (
      where revision.body_json ->> 'seed_code' ~ '^MVP-(CR|IN|SE|SA)-[0-9]{3}$'
    ) as expanded_catalog_codes,
    count(distinct revision.body_json ->> 'seed_code') filter (
      where revision.body_json ->> 'seed_code' ~ '^BRS-[A-Z]+-[0-9]{3}$'
    ) as broadcast_saude_codes,
    count(distinct revision.body_json ->> 'seed_code') filter (
      where revision.body_json ->> 'seed_code' ~ '^BV-[0-9]{3}$'
    ) as bv_codes
  from public.content_revisions revision
),
placement_seed (tenant_slug, slot_key, rank, seed_code) as (
  values
    ('banco-demo-horizonte', 'home.hero', 0, 'MVP-IN-010'),
    ('seguros-demo-atlas', 'home.hero', 0, 'MVP-SE-006'),
    ('seguros-demo-atlas', 'home.secondary', 0, 'MVP-SE-003'),
    ('seguros-demo-atlas', 'home.secondary', 1, 'MVP-SE-008'),
    ('healthtech-demo-lumen', 'home.hero', 0, 'MVP-SA-008'),
    ('healthtech-demo-lumen', 'home.secondary', 0, 'MVP-SA-006'),
    ('healthtech-demo-lumen', 'home.secondary', 1, 'MVP-SA-010')
),
available_placement_seed as (
  select placement_seed.*
  from placement_seed
  join public.tenants tenant on tenant.slug = placement_seed.tenant_slug
),
placement_contract as (
  select
    count(*) as expected_placements,
    count(*) filter (
      where exists (
        select 1
        from public.placements placement
        join public.tenants tenant on tenant.id = placement.tenant_id
        join public.content_items item on item.id = placement.content_item_id
        join public.content_revisions revision
          on revision.id = item.current_published_revision_id
        where tenant.slug = available_placement_seed.tenant_slug
          and placement.slot_key = available_placement_seed.slot_key
          and placement.rank = available_placement_seed.rank
          and revision.body_json ->> 'seed_code' = available_placement_seed.seed_code
      )
    ) as corrected_placements
  from available_placement_seed
),
function_contract as (
  select
    to_regprocedure(
      'public.cms_resolve_site_model_components(text)'
    ) is not null as resolver_exists,
    to_regprocedure(
      'public.cms_save_theme_v2(uuid,text,text,text,text,text,text,text,text,text,text,text,text)'
    ) is not null as save_theme_v2_exists,
    to_regprocedure(
      'public.cms_save_theme_v3(uuid,text,text,text,text,text,text,text,text,text)'
    ) is not null as save_theme_v3_exists,
    to_regprocedure(
      'public.cms_create_demo_tenant_v2(uuid,text,text,text,text)'
    ) is not null as create_tenant_v2_exists,
    position(
      'update public.audit_events' in lower(
        pg_get_functiondef(
          to_regprocedure(
            'public.cms_save_theme_v2(uuid,text,text,text,text,text,text,text,text,text,text,text,text)'
          )
        )
      )
    ) = 0 as save_theme_is_append_only_safe,
    not has_function_privilege(
      'anon',
      'public.cms_resolve_site_model_components(text)',
      'execute'
    ) as resolver_denies_anon,
    has_function_privilege(
      'service_role',
      'public.cms_resolve_site_model_components(text)',
      'execute'
    ) as resolver_allows_server
),
model_registry_contract as (
  select count(*) filter (
    where public.cms_resolve_site_model_components(model.id) = model.components
  ) as resolved_models
  from (
    values
      ('financial-services-credit', '{"header":"masthead-clean","hero":"featured-grid","card":"image-top","site_model":"financial-services-credit"}'::jsonb),
      ('investments-asset-management', '{"header":"masthead-clean","hero":"split-editorial","card":"data-led","site_model":"investments-asset-management"}'::jsonb),
      ('insurance-pension', '{"header":"brand-centered","hero":"featured-grid","card":"compact-horizontal","site_model":"insurance-pension"}'::jsonb),
      ('health-pharma', '{"header":"masthead-minimal","hero":"science-feature","card":"data-led","site_model":"health-pharma"}'::jsonb)
  ) as model(id, components)
),
history_contract as (
  select jsonb_object_agg(version, name order by version) as divergent_rows
  from supabase_migrations.schema_migrations
  where version in (
    '20260727184629',
    '20260727194548',
    '20260727224132',
    '20260727230435',
    '20260727230600',
    '20260727230654',
    '20260801120000',
    '20260812124308',
    '20260812135243',
    '20260820145053',
    '20260901011057'
  )
)
select jsonb_build_object(
  'status', case
    when theme_contract.invalid_models = 0
      and theme_contract.composition_mismatches = 0
      and catalog_contract.expanded_catalog_codes = 40
      and catalog_contract.broadcast_saude_codes = 17
      and catalog_contract.bv_codes >= 21
      and placement_contract.corrected_placements = placement_contract.expected_placements
      and function_contract.save_theme_v2_exists
      and function_contract.save_theme_v3_exists
      and function_contract.create_tenant_v2_exists
      and function_contract.save_theme_is_append_only_safe
      and function_contract.resolver_exists
      and function_contract.resolver_denies_anon
      and function_contract.resolver_allows_server
      and model_registry_contract.resolved_models = 4
      and exists (
        select 1
        from public.categories category
        where category.owner_tenant_id = '00000000-0000-4000-8000-000000000001'::uuid
          and category.slug = 'ti'
          and category.name = 'Tecnologia e Inovação'
      )
      and exists (
        select 1
        from public.content_revisions revision
        where revision.body_json ->> 'seed_code' = 'BRS-ANA-002'
      )
    then 'PASS'
    else 'FAIL'
  end,
  'invalid_models', theme_contract.invalid_models,
  'composition_mismatches', theme_contract.composition_mismatches,
  'expanded_catalog_codes', catalog_contract.expanded_catalog_codes,
  'expected_placements', placement_contract.expected_placements,
  'corrected_placements', placement_contract.corrected_placements,
  'save_theme_v2_exists', function_contract.save_theme_v2_exists,
  'save_theme_v3_exists', function_contract.save_theme_v3_exists,
  'create_tenant_v2_exists', function_contract.create_tenant_v2_exists,
  'save_theme_is_append_only_safe', function_contract.save_theme_is_append_only_safe,
  'resolver_exists', function_contract.resolver_exists,
  'resolver_denies_anon', function_contract.resolver_denies_anon,
  'resolver_allows_server', function_contract.resolver_allows_server,
  'resolved_models', model_registry_contract.resolved_models,
  'technology_label_applied', exists (
    select 1
    from public.categories category
    where category.owner_tenant_id = '00000000-0000-4000-8000-000000000001'::uuid
      and category.slug = 'ti'
      and category.name = 'Tecnologia e Inovação'
  ),
  'broadcast_saude_codes', catalog_contract.broadcast_saude_codes,
  'weight_loss_analysis_applied', exists (
    select 1
    from public.content_revisions revision
    where revision.body_json ->> 'seed_code' = 'BRS-ANA-002'
  ),
  'bv_codes', catalog_contract.bv_codes,
  'history_rows', history_contract.divergent_rows
) as r303_migration_history_audit
from theme_contract
cross join catalog_contract
cross join placement_contract
cross join function_contract
cross join model_registry_contract
cross join history_contract;

rollback;
