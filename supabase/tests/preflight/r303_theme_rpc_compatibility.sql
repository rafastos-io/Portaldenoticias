begin;

set local statement_timeout = '30s';
set local lock_timeout = '2s';
set local application_name = 'r303-theme-rpc-compatibility';

do $$
declare
  selected record;
  saved_v2 uuid;
  saved_v3 uuid;
begin
  select
    tenant.id as tenant_id,
    version.id as version_id,
    version.tokens_json,
    version.components_json,
    version.brand_json
  into selected
  from public.tenants tenant
  join public.themes theme
    on theme.tenant_id = tenant.id
   and theme.status = 'published'
   and theme.is_demo
  join public.theme_versions version
    on version.theme_id = theme.id
   and version.id = theme.published_version_id
   and version.is_demo
  where tenant.status = 'demo'
    and tenant.is_demo
    and version.components_json ->> 'site_model' is not null
  order by tenant.created_at, tenant.id
  limit 1;

  if selected.version_id is null then
    raise exception 'no published demo theme available for compatibility test';
  end if;

  saved_v2 := public.cms_save_theme_v2(
    selected.tenant_id,
    selected.brand_json ->> 'display_name',
    selected.brand_json ->> 'slogan',
    selected.tokens_json ->> 'primary',
    selected.tokens_json ->> 'secondary',
    selected.tokens_json ->> 'accent',
    selected.tokens_json ->> 'background',
    selected.tokens_json ->> 'text',
    selected.tokens_json ->> 'font',
    selected.components_json ->> 'header',
    selected.components_json ->> 'hero',
    selected.components_json ->> 'card',
    selected.components_json ->> 'site_model'
  );

  saved_v3 := public.cms_save_theme_v3(
    selected.tenant_id,
    selected.brand_json ->> 'display_name',
    selected.brand_json ->> 'slogan',
    selected.tokens_json ->> 'primary',
    selected.tokens_json ->> 'secondary',
    selected.tokens_json ->> 'accent',
    selected.tokens_json ->> 'background',
    selected.tokens_json ->> 'text',
    selected.tokens_json ->> 'font',
    selected.components_json ->> 'site_model'
  );

  if saved_v2 is distinct from selected.version_id
    or saved_v3 is distinct from selected.version_id
  then
    raise exception 'theme RPC returned an unexpected version';
  end if;
end;
$$;

select jsonb_build_object(
  'status', 'PASS',
  'legacy_v2', 'executed',
  'canonical_v3', 'executed',
  'persistence', 'ROLLBACK'
) as r303_theme_rpc_compatibility;

rollback;
