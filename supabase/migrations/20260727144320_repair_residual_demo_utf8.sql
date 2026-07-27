create function private.repair_residual_demo_utf8(input text)
returns text
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  result text := input;
begin
  result := replace(result, 'ã¡', 'á');
  result := replace(result, 'ã ', 'à');
  result := replace(result, 'ã¢', 'â');
  result := replace(result, 'ã£', 'ã');
  result := replace(result, 'ã§', 'ç');
  result := replace(result, 'ã©', 'é');
  result := replace(result, 'ãª', 'ê');
  result := replace(result, 'ã­', 'í');
  result := replace(result, 'ã³', 'ó');
  result := replace(result, 'ã´', 'ô');
  result := replace(result, 'ãµ', 'õ');
  result := replace(result, 'ãº', 'ú');

  return result;
end
$$;

update public.content_revisions
set
  title = private.repair_residual_demo_utf8(title),
  subtitle = private.repair_residual_demo_utf8(subtitle),
  body_text = private.repair_residual_demo_utf8(body_text),
  body_json = private.repair_residual_demo_utf8(body_json::text)::jsonb,
  seo_title = private.repair_residual_demo_utf8(seo_title),
  seo_description = private.repair_residual_demo_utf8(seo_description),
  correction_note = private.repair_residual_demo_utf8(correction_note),
  sponsorship_label = private.repair_residual_demo_utf8(sponsorship_label),
  change_summary = private.repair_residual_demo_utf8(change_summary)
where is_demo
  and (
    title ~ 'ã[¡ ¢£§©ª­³´µº]'
    or subtitle ~ 'ã[¡ ¢£§©ª­³´µº]'
    or body_text ~ 'ã[¡ ¢£§©ª­³´µº]'
    or body_json::text ~ 'ã[¡ ¢£§©ª­³´µº]'
    or coalesce(seo_title, '') ~ 'ã[¡ ¢£§©ª­³´µº]'
    or coalesce(seo_description, '') ~ 'ã[¡ ¢£§©ª­³´µº]'
    or coalesce(correction_note, '') ~ 'ã[¡ ¢£§©ª­³´µº]'
    or coalesce(sponsorship_label, '') ~ 'ã[¡ ¢£§©ª­³´µº]'
    or change_summary ~ 'ã[¡ ¢£§©ª­³´µº]'
  );

drop function private.repair_residual_demo_utf8(text);
