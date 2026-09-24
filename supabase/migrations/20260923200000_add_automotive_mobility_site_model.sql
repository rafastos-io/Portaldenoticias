-- D34: fifth visual model `automotive-mobility` (Mobilidade e automotivo).
-- Only the canonical allowlist changes. Existing IDs keep the same derived
-- composition; the legacy header/hero/card trio remains read-only until R311.

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
    when 'automotive-mobility' then
      return jsonb_build_object(
        'header', 'masthead-clean',
        'hero', 'featured-grid',
        'card', 'image-top',
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
