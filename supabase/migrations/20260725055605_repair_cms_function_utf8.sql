create function private.repair_cms_utf8(input text)
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

do $$
declare
  function_definition text;
  function_signature regprocedure;
begin
  foreach function_signature in array array[
    'public.cms_create_content(uuid,text,text,text,text,uuid,uuid)'::regprocedure,
    'public.cms_update_content(uuid,uuid,text,text,text,uuid,uuid)'::regprocedure
  ]
  loop
    select pg_get_functiondef(function_signature) into function_definition;
    execute private.repair_cms_utf8(function_definition);
  end loop;
end;
$$;

update public.content_revisions
set
  body_json = private.repair_cms_utf8(body_json::text)::jsonb,
  change_summary = private.repair_cms_utf8(change_summary)
where is_demo
  and (
    body_json::text like '%Ã%'
    or change_summary like '%Ã%'
  );

alter table public.audit_events disable trigger audit_events_append_only;

update public.audit_events
set reason = private.repair_cms_utf8(reason)
where is_demo and reason like '%Ã%';

alter table public.audit_events enable trigger audit_events_append_only;

drop function private.repair_cms_utf8(text);
