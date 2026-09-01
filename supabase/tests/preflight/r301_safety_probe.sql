-- Read-only safety probe for the R301 transactional production preflight.
-- This query does not acquire application-table locks and does not mutate data.

with target_relations as (
  select relation.oid, namespace.nspname as schema_name, relation.relname as table_name
  from pg_class relation
  join pg_namespace namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and relation.relname in (
      'content_items',
      'content_revisions',
      'content_revision_authors',
      'content_revision_categories',
      'distributions',
      'audit_events'
    )
),
target_triggers as (
  select
    trigger.tgname as trigger_name,
    target.schema_name,
    target.table_name,
    trigger.tgenabled,
    trigger.tgisinternal,
    procedure.proname as function_name,
    pg_get_triggerdef(trigger.oid, true) as trigger_definition,
    pg_get_functiondef(procedure.oid) as function_definition
  from target_relations target
  join pg_trigger trigger on trigger.tgrelid = target.oid
  join pg_proc procedure on procedure.oid = trigger.tgfoid
),
event_triggers as (
  select
    event.evtname as trigger_name,
    event.evtevent as event_name,
    event.evtenabled as enabled,
    procedure.proname as function_name,
    pg_get_functiondef(procedure.oid) as function_definition
  from pg_event_trigger event
  join pg_proc procedure on procedure.oid = event.evtfoid
),
base_functions as (
  select procedure.oid, procedure.proname, pg_get_functiondef(procedure.oid) as function_definition
  from pg_proc procedure
  where procedure.oid in (
    to_regprocedure('public.cms_create_content(uuid,text,text,text,text,uuid,uuid)'),
    to_regprocedure('public.cms_update_content(uuid,uuid,text,text,text,uuid,uuid)'),
    to_regprocedure('public.cms_create_content_with_media(uuid,text,text,text,text,uuid,uuid,text,text)'),
    to_regprocedure('public.cms_update_content_with_media(uuid,uuid,text,text,text,uuid,uuid,text,text)')
  )
),
activity as (
  select
    count(*) filter (where state = 'active' and pid <> pg_backend_pid()) as other_active_sessions,
    count(*) filter (where state = 'idle in transaction') as idle_in_transaction_sessions,
    count(*) filter (where wait_event_type = 'Lock') as sessions_waiting_on_locks,
    coalesce(
      max(extract(epoch from (clock_timestamp() - query_start)))
        filter (where state = 'active' and pid <> pg_backend_pid()),
      0
    )::integer as oldest_other_active_seconds
  from pg_stat_activity
  where datname = current_database()
),
lock_state as (
  select count(*) filter (where not granted) as ungranted_locks
  from pg_locks
  where database = (select oid from pg_database where datname = current_database())
),
fixtures as (
  select jsonb_build_object(
    'tenant_a', count(*) filter (
      where tenant.slug = 'credito-demo-orbita'
        and tenant.kind = 'demo'
        and tenant.status = 'demo'
    ),
    'tenant_b', count(*) filter (
      where tenant.slug = 'banco-demo-horizonte'
        and tenant.kind = 'demo'
        and tenant.status = 'demo'
    ),
    'platform_active_categories', (
      select count(*)
      from public.categories category
      join public.tenants owner on owner.id = category.owner_tenant_id
      where owner.kind = 'platform' and category.status = 'active'
    ),
    'platform_active_authors', (
      select count(*)
      from public.authors author
      join public.tenants owner on owner.id = author.owner_tenant_id
      where owner.kind = 'platform' and author.status = 'active'
    ),
    'tenant_b_active_authors', (
      select count(*)
      from public.authors author
      join public.tenants owner on owner.id = author.owner_tenant_id
      where owner.slug = 'banco-demo-horizonte' and author.status = 'active'
    )
  ) as availability
  from public.tenants tenant
)
select jsonb_pretty(jsonb_build_object(
  'database', jsonb_build_object(
    'name', current_database(),
    'server_version', current_setting('server_version'),
    'read_only', current_setting('transaction_read_only')::boolean
  ),
  'activity', (select to_jsonb(activity) from activity),
  'locks', (select to_jsonb(lock_state) from lock_state),
  'fixtures', (select availability from fixtures),
  'required_functions_present', jsonb_build_object(
    'cms_create_content', to_regprocedure('public.cms_create_content(uuid,text,text,text,text,uuid,uuid)') is not null,
    'cms_update_content', to_regprocedure('public.cms_update_content(uuid,uuid,text,text,text,uuid,uuid)') is not null,
    'cms_create_content_with_media', to_regprocedure('public.cms_create_content_with_media(uuid,text,text,text,text,uuid,uuid,text,text)') is not null,
    'cms_update_content_with_media', to_regprocedure('public.cms_update_content_with_media(uuid,uuid,text,text,text,uuid,uuid,text,text)') is not null
  ),
  'table_triggers', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', format('%I.%I', schema_name, table_name),
      'name', trigger_name,
      'enabled', tgenabled,
      'internal', tgisinternal,
      'function', function_name,
      'external_effect_candidate', lower(function_definition) like any (array[
        '%http_%', '%http.%', '%net.%', '%dblink%', '%lo_import%', '%lo_export%',
        '%aws_%', '%supabase_functions%', '%pg_notify%', '%notify(%'
      ])
    ) order by table_name, trigger_name)
    from target_triggers
  ), '[]'::jsonb),
  'event_triggers', coalesce((
    select jsonb_agg(jsonb_build_object(
      'name', trigger_name,
      'event', event_name,
      'enabled', enabled,
      'function', function_name,
      'external_effect_candidate', lower(function_definition) like any (array[
        '%http_%', '%http.%', '%net.%', '%dblink%', '%lo_import%', '%lo_export%',
        '%aws_%', '%supabase_functions%', '%pg_notify%', '%notify(%'
      ])
    ) order by trigger_name)
    from event_triggers
  ), '[]'::jsonb),
  'base_function_external_effect_candidates', coalesce((
    select jsonb_agg(proname order by proname) filter (
      where lower(function_definition) like any (array[
        '%http_%', '%http.%', '%net.%', '%dblink%', '%lo_import%', '%lo_export%',
        '%aws_%', '%supabase_functions%', '%pg_notify%', '%notify(%'
      ])
    )
    from base_functions
  ), '[]'::jsonb)
)) as r301_safety_probe;
