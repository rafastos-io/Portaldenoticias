-- Corrige cms_save_theme_v2: a versão anterior fazia UPDATE em public.audit_events
-- para enriquecer o log com o site_model, mas a tabela é append-only (trigger
-- audit_events_append_only, BEFORE UPDATE OR DELETE). Isso fazia QUALQUER
-- alteração de identidade (inclusive só o nome da marca) falhar com o erro
-- "audit_events is append-only".
--
-- O site_model já é persistido em theme_versions.components_json (update abaixo),
-- que é o que a renderização usa. O enriquecimento do audit era apenas cosmético,
-- então é removido. A função base public.cms_save_theme continua registrando o
-- evento theme.updated normalmente via INSERT.
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

  return saved_version_id;
end;
$$;

comment on function public.cms_save_theme_v2(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text
) is
  'Salva a identidade com modelo de site e persiste o site_model em theme_versions.components_json. Não altera audit_events (append-only); o evento theme.updated é registrado por cms_save_theme.';
