create function private.repair_demo_utf8(input text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(input, 'Ã§', 'ç'),
                        'Ã£', 'ã'
                      ),
                      'Ã­', 'í'
                    ),
                    'Ã©', 'é'
                  ),
                  'Ãµ', 'õ'
                ),
                'Ãº', 'ú'
              ),
              'Ã¡', 'á'
            ),
            'Ãª', 'ê'
          ),
          'Ã³', 'ó'
        ),
        'Ã´', 'ô'
      ),
      'Ã¢', 'â'
    ),
    'Ã ', 'à'
  )
$$;

update public.tenants
set
  display_name = private.repair_demo_utf8(display_name),
  legal_name = private.repair_demo_utf8(legal_name)
where is_demo;

update public.authors
set
  display_name = private.repair_demo_utf8(display_name),
  bio = private.repair_demo_utf8(bio),
  credentials = array(
    select private.repair_demo_utf8(value)
    from unnest(credentials) as value
  ),
  specialties = array(
    select private.repair_demo_utf8(value)
    from unnest(specialties) as value
  )
where is_demo;

update public.categories
set
  name = private.repair_demo_utf8(name),
  description = private.repair_demo_utf8(description)
where is_demo;

update public.tags
set name = private.repair_demo_utf8(name)
where is_demo;

update public.content_revisions
set
  title = private.repair_demo_utf8(title),
  subtitle = private.repair_demo_utf8(subtitle),
  body_text = private.repair_demo_utf8(body_text),
  body_json = jsonb_set(
    jsonb_set(
      jsonb_set(
        body_json,
        '{content}',
        coalesce(
          (
            select jsonb_agg(
              case
                when node ? 'text' then jsonb_set(
                  node,
                  '{text}',
                  to_jsonb(private.repair_demo_utf8(node ->> 'text'))
                )
                else node
              end
            )
            from jsonb_array_elements(
              coalesce(body_json -> 'content', '[]'::jsonb)
            ) as node
          ),
          '[]'::jsonb
        ),
        true
      ),
      '{demo_media,alt}',
      coalesce(
        to_jsonb(private.repair_demo_utf8(body_json #>> '{demo_media,alt}')),
        'null'::jsonb
      ),
      false
    ),
    '{demo_media,reason}',
    coalesce(
      to_jsonb(private.repair_demo_utf8(body_json #>> '{demo_media,reason}')),
      'null'::jsonb
    ),
    false
  ),
  seo_title = private.repair_demo_utf8(seo_title),
  seo_description = private.repair_demo_utf8(seo_description),
  correction_note = private.repair_demo_utf8(correction_note),
  sponsorship_label = private.repair_demo_utf8(sponsorship_label),
  change_summary = private.repair_demo_utf8(change_summary)
where is_demo;

update public.distributions
set
  headline_override = private.repair_demo_utf8(headline_override),
  subtitle_override = private.repair_demo_utf8(subtitle_override)
where is_demo;

update public.placements
set eyebrow_override = private.repair_demo_utf8(eyebrow_override)
where is_demo;

update public.themes
set name = private.repair_demo_utf8(name)
where is_demo;

update public.theme_versions
set
  navigation_json = coalesce(
    (
      select jsonb_agg(to_jsonb(private.repair_demo_utf8(value)))
      from jsonb_array_elements_text(navigation_json) as value
    ),
    '[]'::jsonb
  ),
  brand_json = jsonb_set(
    jsonb_set(
      brand_json,
      '{display_name}',
      to_jsonb(private.repair_demo_utf8(brand_json ->> 'display_name')),
      true
    ),
    '{slogan}',
    to_jsonb(private.repair_demo_utf8(brand_json ->> 'slogan')),
    true
  ),
  change_summary = private.repair_demo_utf8(change_summary)
where is_demo;

drop function private.repair_demo_utf8(text);
