create function private.reset_demo_catalog(confirmation text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  environment_name text := current_setting(
    'app.broadcast_environment',
    true
  );
begin
  if environment_name is null
    or environment_name not in ('local', 'demo')
    or confirmation <> 'RESET MVP0 DEMO'
  then
    raise exception 'demo reset refused outside an explicitly confirmed local/demo environment';
  end if;

  if exists (select 1 from public.tenants where not is_demo)
    or exists (select 1 from public.content_items where not is_demo)
    or exists (select 1 from public.content_revisions where not is_demo)
    or exists (select 1 from public.media_assets where not is_demo)
    or exists (select 1 from public.distributions where not is_demo)
    or exists (select 1 from public.placements where not is_demo)
    or exists (select 1 from public.themes where not is_demo)
    or exists (select 1 from public.theme_versions where not is_demo)
    or exists (select 1 from public.audit_events where not is_demo)
  then
    raise exception 'demo reset refused because non-demo data exists';
  end if;

  truncate table public.tenants cascade;
end;
$$;

revoke all on function private.reset_demo_catalog(text)
  from public, anon, authenticated, service_role;

comment on function private.reset_demo_catalog(text) is
  'Destructive demo-only reset. Requires app.broadcast_environment=local|demo and exact confirmation.';
