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
set settings_json = jsonb_set(
  jsonb_set(
    settings_json,
    '{slogan}',
    coalesce(
      to_jsonb(private.repair_demo_utf8(settings_json ->> 'slogan')),
      'null'::jsonb
    ),
    false
  ),
  '{segment}',
  coalesce(
    to_jsonb(private.repair_demo_utf8(settings_json ->> 'segment')),
    'null'::jsonb
  ),
  false
)
where is_demo;

drop function private.repair_demo_utf8(text);
