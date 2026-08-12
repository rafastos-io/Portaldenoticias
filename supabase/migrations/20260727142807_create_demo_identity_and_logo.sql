create function public.cms_create_demo_tenant(
  p_source_tenant_id uuid,
  p_display_name text,
  p_slug text,
  p_slogan text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_tenant_id uuid := gen_random_uuid();
  new_theme_id uuid := gen_random_uuid();
  new_version_id uuid := gen_random_uuid();
  source_theme record;
begin
  if length(trim(coalesce(p_display_name, ''))) not between 2 and 120
    or length(trim(coalesce(p_slogan, ''))) not between 2 and 160
    or coalesce(p_slug, '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'invalid demo tenant identity';
  end if;

  select
    theme.name,
    version.tokens_json,
    version.components_json,
    version.navigation_json,
    version.brand_json
  into source_theme
  from public.tenants tenant
  join public.themes theme
    on theme.tenant_id = tenant.id
    and theme.status = 'published'
    and theme.is_demo
  join public.theme_versions version
    on version.theme_id = theme.id
    and version.id = theme.published_version_id
    and version.is_demo
  where tenant.id = p_source_tenant_id
    and tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo;

  if not found then
    raise exception 'source demo tenant unavailable';
  end if;

  insert into public.tenants (
    id,
    slug,
    display_name,
    kind,
    status,
    default_locale,
    timezone,
    settings_json,
    is_demo
  )
  values (
    new_tenant_id,
    p_slug,
    trim(p_display_name),
    'demo',
    'demo',
    'pt-BR',
    'America/Sao_Paulo',
    jsonb_build_object(
      'slogan', trim(p_slogan),
      'source_tenant_id', p_source_tenant_id,
      'created_from_preset', true
    ),
    true
  );

  insert into public.themes (
    id,
    tenant_id,
    name,
    status,
    is_demo
  )
  values (
    new_theme_id,
    new_tenant_id,
    trim(p_display_name) || ' editorial',
    'published',
    true
  );

  insert into public.theme_versions (
    id,
    theme_id,
    version_number,
    schema_version,
    tokens_json,
    components_json,
    navigation_json,
    brand_json,
    created_by,
    published_by,
    published_at,
    change_summary,
    is_demo
  )
  values (
    new_version_id,
    new_theme_id,
    1,
    1,
    source_theme.tokens_json,
    source_theme.components_json,
    source_theme.navigation_json,
    (source_theme.brand_json - 'display_name' - 'slogan')
      || jsonb_build_object(
        'display_name', trim(p_display_name),
        'slogan', trim(p_slogan),
        'logo_mode', 'wordmark'
      ),
    'demo-operator',
    'demo-operator',
    now(),
    'Identidade criada a partir de preset demonstrativo.',
    true
  );

  update public.themes
  set
    published_version_id = new_version_id,
    updated_at = now()
  where id = new_theme_id
    and tenant_id = new_tenant_id;

  insert into public.distributions (
    content_item_id,
    tenant_id,
    status,
    starts_at,
    ends_at,
    channels,
    headline_override,
    subtitle_override,
    category_override_id,
    rights_code,
    allow_full_body,
    allow_media,
    created_by,
    approved_by,
    is_demo
  )
  select
    source.content_item_id,
    new_tenant_id,
    source.status,
    source.starts_at,
    source.ends_at,
    array['portal']::text[],
    source.headline_override,
    source.subtitle_override,
    source.category_override_id,
    'demo',
    source.allow_full_body,
    source.allow_media,
    'demo-operator',
    'demo-operator',
    true
  from public.distributions source
  where source.tenant_id = p_source_tenant_id
    and source.status in ('active', 'paused')
    and source.is_demo
    and 'portal' = any(source.channels);

  insert into public.placements (
    tenant_id,
    slot_key,
    content_item_id,
    starts_at,
    ends_at,
    rank,
    presentation_variant,
    eyebrow_override,
    status,
    is_demo
  )
  select
    new_tenant_id,
    source.slot_key,
    source.content_item_id,
    source.starts_at,
    source.ends_at,
    source.rank,
    source.presentation_variant,
    source.eyebrow_override,
    source.status,
    true
  from public.placements source
  where source.tenant_id = p_source_tenant_id
    and source.is_demo;

  insert into public.audit_events (
    tenant_id,
    actor_id,
    action,
    target_type,
    target_id,
    after_json,
    reason,
    is_demo
  )
  values (
    new_tenant_id,
    'demo-operator',
    'tenant.demo_created',
    'tenant',
    new_tenant_id,
    jsonb_build_object(
      'display_name', trim(p_display_name),
      'slug', p_slug,
      'source_tenant_id', p_source_tenant_id
    ),
    'Nova identidade demonstrativa criada a partir de preset.',
    true
  );

  return new_tenant_id;
end;
$$;

revoke all on function public.cms_create_demo_tenant(uuid, text, text, text)
from public, anon, authenticated;
grant execute on function public.cms_create_demo_tenant(uuid, text, text, text)
to service_role;

create function public.cms_set_theme_logo(
  p_tenant_id uuid,
  p_media_asset_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_version_id uuid;
  selected_brand jsonb;
  selected_asset public.media_assets%rowtype;
  next_brand jsonb;
begin
  select asset.*
  into selected_asset
  from public.media_assets asset
  where asset.id = p_media_asset_id
    and asset.owner_tenant_id = p_tenant_id
    and asset.status = 'ready'
    and asset.is_demo;

  if selected_asset.id is null then
    raise exception 'tenant logo asset unavailable';
  end if;

  select version.id, version.brand_json
  into selected_version_id, selected_brand
  from public.themes theme
  join public.theme_versions version
    on version.theme_id = theme.id
    and version.id = theme.published_version_id
    and version.is_demo
  join public.tenants tenant
    on tenant.id = theme.tenant_id
    and tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo
  where theme.tenant_id = p_tenant_id
    and theme.status = 'published'
    and theme.is_demo
  for update of theme, version;

  if selected_version_id is null then
    raise exception 'published theme unavailable for tenant';
  end if;

  next_brand := selected_brand || jsonb_build_object(
    'logo_mode', 'asset',
    'logo_asset_id', selected_asset.id,
    'logo_alt', selected_asset.alt_text
  );

  update public.theme_versions
  set
    brand_json = next_brand,
    published_by = 'demo-operator',
    published_at = now(),
    change_summary = 'Logo demonstrativo atualizado.'
  where id = selected_version_id;

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
    p_tenant_id,
    'demo-operator',
    'theme.logo_updated',
    'theme_version',
    selected_version_id,
    jsonb_build_object('logo_asset_id', selected_brand -> 'logo_asset_id'),
    jsonb_build_object('logo_asset_id', selected_asset.id),
    'Logo demonstrativo salvo no Storage isolado do tenant.',
    true
  );

  return selected_version_id;
end;
$$;

revoke all on function public.cms_set_theme_logo(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.cms_set_theme_logo(uuid, uuid)
to service_role;

create or replace function public.cms_save_theme(
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
  p_card text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_theme_id uuid;
  selected_version_id uuid;
  previous_tokens jsonb;
  previous_components jsonb;
  previous_brand jsonb;
  next_tokens jsonb;
  next_components jsonb;
  next_brand jsonb;
begin
  if not exists (
    select 1
    from public.tenants
    where id = p_tenant_id
      and kind = 'demo'
      and status = 'demo'
      and is_demo
  ) then
    raise exception 'demo tenant unavailable';
  end if;

  if length(trim(coalesce(p_brand_name, ''))) not between 2 and 120
    or length(trim(coalesce(p_slogan, ''))) not between 2 and 160
  then
    raise exception 'invalid brand copy';
  end if;

  if coalesce(p_primary, '') !~ '^#[0-9A-Fa-f]{6}$'
    or coalesce(p_secondary, '') !~ '^#[0-9A-Fa-f]{6}$'
    or coalesce(p_accent, '') !~ '^#[0-9A-Fa-f]{6}$'
    or coalesce(p_background, '') !~ '^#[0-9A-Fa-f]{6}$'
    or coalesce(p_text_color, '') !~ '^#[0-9A-Fa-f]{6}$'
  then
    raise exception 'invalid theme color';
  end if;

  if p_font not in ('sans-editorial', 'sans-humana', 'sans-geometrica')
    or p_header not in ('masthead-clean', 'brand-centered', 'masthead-minimal')
    or p_hero not in ('split-editorial', 'featured-grid', 'science-feature')
    or p_card not in ('image-top', 'compact-horizontal', 'data-led')
  then
    raise exception 'unapproved theme variant';
  end if;

  select
    theme.id,
    theme.published_version_id,
    version.tokens_json,
    version.components_json,
    version.brand_json
  into
    selected_theme_id,
    selected_version_id,
    previous_tokens,
    previous_components,
    previous_brand
  from public.themes theme
  join public.theme_versions version
    on version.theme_id = theme.id
    and version.id = theme.published_version_id
  where theme.tenant_id = p_tenant_id
    and theme.status = 'published'
    and theme.is_demo
    and version.is_demo
  for update of theme, version;

  if selected_version_id is null then
    raise exception 'published theme unavailable for tenant';
  end if;

  next_tokens := jsonb_build_object(
    'primary', upper(p_primary),
    'secondary', upper(p_secondary),
    'accent', upper(p_accent),
    'background', upper(p_background),
    'text', upper(p_text_color),
    'font', p_font
  );
  next_components := jsonb_build_object(
    'header', p_header,
    'hero', p_hero,
    'card', p_card
  );
  next_brand := (previous_brand - 'display_name' - 'slogan')
    || jsonb_build_object(
      'display_name', trim(p_brand_name),
      'slogan', trim(p_slogan)
    );

  update public.theme_versions
  set
    tokens_json = next_tokens,
    components_json = next_components,
    brand_json = next_brand,
    created_by = 'demo-operator',
    published_by = 'demo-operator',
    published_at = now(),
    change_summary = 'Identidade demonstrativa atualizada pela Central de Identidade.'
  where theme_id = selected_theme_id
    and id = selected_version_id;

  update public.themes
  set updated_at = now()
  where id = selected_theme_id
    and tenant_id = p_tenant_id;

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
    p_tenant_id,
    'demo-operator',
    'theme.updated',
    'theme_version',
    selected_version_id,
    jsonb_build_object(
      'tokens', previous_tokens,
      'components', previous_components,
      'brand', previous_brand
    ),
    jsonb_build_object(
      'tokens', next_tokens,
      'components', next_components,
      'brand', next_brand
    ),
    'Identidade atual salva na central white-label demonstrativa.',
    true
  );

  return selected_version_id;
end;
$$;

comment on function public.cms_create_demo_tenant(uuid, text, text, text) is
  'Creates a demo tenant by copying a safe preset theme and content references without duplicating canonical content.';
comment on function public.cms_set_theme_logo(uuid, uuid) is
  'Assigns a ready tenant-owned demo media asset as the current theme logo.';
