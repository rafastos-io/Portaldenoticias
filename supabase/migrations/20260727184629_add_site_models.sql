alter table public.theme_versions
  drop constraint theme_versions_schema_version_check;

alter table public.theme_versions
  add constraint theme_versions_schema_version_check
  check (schema_version in (1, 2));

create function public.cms_save_theme_v2(
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
  saved_version_id uuid;
  expected_header text;
  expected_hero text;
  expected_card text;
begin
  case p_site_model
    when 'financial-services-credit' then
      expected_header := 'masthead-clean';
      expected_hero := 'featured-grid';
      expected_card := 'image-top';
    when 'investments-asset-management' then
      expected_header := 'masthead-clean';
      expected_hero := 'split-editorial';
      expected_card := 'data-led';
    when 'insurance-pension' then
      expected_header := 'brand-centered';
      expected_hero := 'featured-grid';
      expected_card := 'compact-horizontal';
    when 'health-pharma' then
      expected_header := 'masthead-minimal';
      expected_hero := 'science-feature';
      expected_card := 'data-led';
    else
      raise exception 'unapproved site model';
  end case;

  if p_header <> expected_header
    or p_hero <> expected_hero
    or p_card <> expected_card
  then
    raise exception 'site model composition mismatch';
  end if;

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
    p_header,
    p_hero,
    p_card
  );

  update public.theme_versions version
  set
    components_json = version.components_json
      || jsonb_build_object('site_model', p_site_model),
    schema_version = greatest(version.schema_version, 2)
  where version.id = saved_version_id
    and exists (
      select 1
      from public.themes theme
      where theme.id = version.theme_id
        and theme.tenant_id = p_tenant_id
        and theme.published_version_id = version.id
    );

  update public.audit_events event
  set after_json = jsonb_set(
    event.after_json,
    '{components}',
    coalesce(event.after_json -> 'components', '{}'::jsonb)
      || jsonb_build_object('site_model', p_site_model),
    true
  )
  where event.id = (
    select candidate.id
    from public.audit_events candidate
    where candidate.tenant_id = p_tenant_id
      and candidate.action = 'theme.updated'
      and candidate.target_type = 'theme_version'
      and candidate.target_id = saved_version_id
    order by candidate.created_at desc, candidate.id desc
    limit 1
  );

  return saved_version_id;
end;
$$;

create function public.cms_create_demo_tenant_v2(
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
  if p_site_model not in (
    'financial-services-credit',
    'investments-asset-management',
    'insurance-pension',
    'health-pharma'
  ) then
    raise exception 'unapproved site model';
  end if;

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

  next_components := case p_site_model
    when 'financial-services-credit' then
      jsonb_build_object(
        'header', 'masthead-clean',
        'hero', 'featured-grid',
        'card', 'image-top',
        'site_model', p_site_model
      )
    when 'investments-asset-management' then
      jsonb_build_object(
        'header', 'masthead-clean',
        'hero', 'split-editorial',
        'card', 'data-led',
        'site_model', p_site_model
      )
    when 'insurance-pension' then
      jsonb_build_object(
        'header', 'brand-centered',
        'hero', 'featured-grid',
        'card', 'compact-horizontal',
        'site_model', p_site_model
      )
    when 'health-pharma' then
      jsonb_build_object(
        'header', 'masthead-minimal',
        'hero', 'science-feature',
        'card', 'data-led',
        'site_model', p_site_model
      )
  end;

  update public.theme_versions
  set
    components_json = next_components,
    schema_version = greatest(schema_version, 2),
    change_summary =
      'Identidade criada a partir de preset e modelo de segmento aprovado.'
  where theme_id = new_theme_id
    and id = new_version_id;

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

update public.theme_versions version
set
  components_json = case theme.tenant_id
    when '00000000-0000-4000-8000-000000000002'::uuid then
      jsonb_build_object(
        'header', 'masthead-clean',
        'hero', 'split-editorial',
        'card', 'data-led',
        'site_model', 'investments-asset-management'
      )
    when '00000000-0000-4000-8000-000000000003'::uuid then
      jsonb_build_object(
        'header', 'brand-centered',
        'hero', 'featured-grid',
        'card', 'compact-horizontal',
        'site_model', 'insurance-pension'
      )
    when '00000000-0000-4000-8000-000000000004'::uuid then
      jsonb_build_object(
        'header', 'masthead-minimal',
        'hero', 'science-feature',
        'card', 'data-led',
        'site_model', 'health-pharma'
      )
    else version.components_json
  end,
  schema_version = greatest(version.schema_version, 2)
from public.themes theme
where theme.id = version.theme_id
  and theme.tenant_id in (
    '00000000-0000-4000-8000-000000000002'::uuid,
    '00000000-0000-4000-8000-000000000003'::uuid,
    '00000000-0000-4000-8000-000000000004'::uuid
  );

do $$
declare
  created_tenant_id uuid;
begin
  if exists (
    select 1
    from public.tenants
    where id = '00000000-0000-4000-8000-000000000002'::uuid
      and kind = 'demo'
      and status = 'demo'
      and is_demo
  )
  and not exists (
    select 1
    from public.tenants
    where slug = 'credito-demo-orbita'
  ) then
    created_tenant_id := public.cms_create_demo_tenant_v2(
      '00000000-0000-4000-8000-000000000002'::uuid,
      'Crédito Demo Órbita',
      'credito-demo-orbita',
      'Clareza para decidir o próximo passo',
      'financial-services-credit'
    );
  end if;
end;
$$;

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

comment on function public.cms_save_theme_v2(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text
) is
  'Persiste tokens, marca e um modelo de site aprovado sem aceitar composição livre.';

comment on function public.cms_create_demo_tenant_v2(
  uuid, text, text, text, text
) is
  'Cria tenant demonstrativo por referência e aplica um modelo de segmento aprovado sem duplicar conteúdo.';
