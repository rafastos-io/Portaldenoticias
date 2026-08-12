create function public.cms_save_theme(
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
  next_brand := jsonb_build_object(
    'display_name', trim(p_brand_name),
    'slogan', trim(p_slogan),
    'logo_mode', 'wordmark'
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

revoke all on function public.cms_save_theme(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.cms_save_theme(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) to service_role;

comment on function public.cms_save_theme(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) is 'Updates the current demo theme using only approved structured values and records an audit event.';
