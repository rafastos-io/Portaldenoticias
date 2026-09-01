-- R303: site_model is the structural source of truth.
-- The legacy header/hero/card arguments remain accepted only by cms_save_theme_v2
-- until R311, no later than 2026-10-31. New callers must use cms_save_theme_v3.

create or replace function public.cms_resolve_site_model_components(
  p_site_model text
)
returns jsonb
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  case p_site_model
    when 'financial-services-credit' then
      return jsonb_build_object(
        'header', 'masthead-clean',
        'hero', 'featured-grid',
        'card', 'image-top',
        'site_model', p_site_model
      );
    when 'investments-asset-management' then
      return jsonb_build_object(
        'header', 'masthead-clean',
        'hero', 'split-editorial',
        'card', 'data-led',
        'site_model', p_site_model
      );
    when 'insurance-pension' then
      return jsonb_build_object(
        'header', 'brand-centered',
        'hero', 'featured-grid',
        'card', 'compact-horizontal',
        'site_model', p_site_model
      );
    when 'health-pharma' then
      return jsonb_build_object(
        'header', 'masthead-minimal',
        'hero', 'science-feature',
        'card', 'data-led',
        'site_model', p_site_model
      );
    else
      raise exception 'unapproved site model';
  end case;
end;
$$;

revoke all on function public.cms_resolve_site_model_components(text)
from public, anon, authenticated;
grant execute on function public.cms_resolve_site_model_components(text)
to service_role;

comment on function public.cms_resolve_site_model_components(text) is
  'Canonical SQL allowlist for site_model and its derived legacy composition. Unknown and null IDs fail closed.';

create or replace function public.cms_save_theme_v3(
  p_tenant_id uuid,
  p_brand_name text,
  p_slogan text,
  p_primary text,
  p_secondary text,
  p_accent text,
  p_background text,
  p_text_color text,
  p_font text,
  p_site_model text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_version_id uuid;
  resolved_components jsonb;
begin
  resolved_components := public.cms_resolve_site_model_components(p_site_model);

  saved_version_id := public.cms_save_theme(
    p_tenant_id,
    p_brand_name,
    p_slogan,
    p_primary,
    p_secondary,
    p_accent,
    p_background,
    p_text_color,
    p_font,
    resolved_components ->> 'header',
    resolved_components ->> 'hero',
    resolved_components ->> 'card'
  );

  update public.theme_versions version
  set
    components_json = resolved_components,
    schema_version = greatest(version.schema_version, 2)
  where version.id = saved_version_id
    and exists (
      select 1
      from public.themes theme
      where theme.id = version.theme_id
        and theme.tenant_id = p_tenant_id
        and theme.published_version_id = version.id
    );

  if not found then
    raise exception 'saved theme unavailable for tenant';
  end if;

  return saved_version_id;
end;
$$;

create or replace function public.cms_save_theme_v2(
  p_tenant_id uuid,
  p_brand_name text,
  p_slogan text,
  p_primary text,
  p_secondary text,
  p_accent text,
  p_background text,
  p_text_color text,
  p_font text,
  p_header text,
  p_hero text,
  p_card text,
  p_site_model text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  resolved_components jsonb;
begin
  resolved_components := public.cms_resolve_site_model_components(p_site_model);

  if p_header is distinct from resolved_components ->> 'header'
    or p_hero is distinct from resolved_components ->> 'hero'
    or p_card is distinct from resolved_components ->> 'card'
  then
    raise exception 'site model composition mismatch';
  end if;

  return public.cms_save_theme_v3(
    p_tenant_id,
    p_brand_name,
    p_slogan,
    p_primary,
    p_secondary,
    p_accent,
    p_background,
    p_text_color,
    p_font,
    p_site_model
  );
end;
$$;

create or replace function public.cms_create_demo_tenant_v2(
  p_source_tenant_id uuid,
  p_display_name text,
  p_slug text,
  p_slogan text,
  p_site_model text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_tenant_id uuid;
  new_theme_id uuid;
  new_version_id uuid;
  previous_components jsonb;
  next_components jsonb;
begin
  next_components := public.cms_resolve_site_model_components(p_site_model);

  new_tenant_id := public.cms_create_demo_tenant(
    p_source_tenant_id,
    p_display_name,
    p_slug,
    p_slogan
  );

  select theme.id, theme.published_version_id, version.components_json
  into new_theme_id, new_version_id, previous_components
  from public.themes theme
  join public.theme_versions version
    on version.theme_id = theme.id
    and version.id = theme.published_version_id
  where theme.tenant_id = new_tenant_id
    and theme.status = 'published'
    and theme.is_demo
    and version.is_demo
  for update of theme, version;

  if new_version_id is null then
    raise exception 'created theme unavailable';
  end if;

  update public.theme_versions
  set
    components_json = next_components,
    schema_version = greatest(schema_version, 2),
    change_summary =
      'Identidade criada a partir de preset e modelo de segmento aprovado.'
  where theme_id = new_theme_id
    and id = new_version_id;

  if not found then
    raise exception 'created theme unavailable';
  end if;

  insert into public.audit_events (
    tenant_id,
    actor_id,
    action,
    target_type,
    target_id,
    before_json,
    after_json,
    reason,
    is_demo
  )
  values (
    new_tenant_id,
    'demo-operator',
    'theme.updated',
    'theme_version',
    new_version_id,
    jsonb_build_object('components', previous_components),
    jsonb_build_object('components', next_components),
    'Modelo de segmento selecionado na criação da identidade.',
    true
  );

  return new_tenant_id;
end;
$$;

revoke all on function public.cms_save_theme_v3(
  uuid, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.cms_save_theme_v3(
  uuid, text, text, text, text, text, text, text, text, text
) to service_role;

revoke all on function public.cms_save_theme_v2(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.cms_save_theme_v2(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text
) to service_role;

revoke all on function public.cms_create_demo_tenant_v2(
  uuid, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.cms_create_demo_tenant_v2(
  uuid, text, text, text, text
) to service_role;

comment on function public.cms_save_theme_v3(
  uuid, text, text, text, text, text, text, text, text, text
) is
  'Saves theme identity from the canonical site_model; legacy component fields are derived by the database.';

comment on function public.cms_save_theme_v2(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text
) is
  'Compatibility wrapper for legacy header/hero/card callers. Remove in R311, no later than 2026-10-31.';

comment on function public.cms_create_demo_tenant_v2(
  uuid, text, text, text, text
) is
  'Creates a demo tenant and resolves its complete composition from the canonical site_model allowlist.';
