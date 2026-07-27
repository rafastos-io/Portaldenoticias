create table public.demo_portal_settings (
  setting_key text primary key
    default 'public-home'
    check (setting_key = 'public-home'),
  default_tenant_id uuid not null
    references public.tenants(id) on delete restrict,
  revision bigint not null default 1 check (revision > 0),
  updated_by text not null default 'demo-operator'
    check (updated_by = 'demo-operator'),
  updated_at timestamptz not null default now(),
  is_demo boolean not null default true check (is_demo)
);

alter table public.demo_portal_settings enable row level security;
alter table public.demo_portal_settings force row level security;

create policy direct_client_access_denied
on public.demo_portal_settings
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

revoke all privileges on public.demo_portal_settings
  from public, anon, authenticated, service_role;
grant select, update on public.demo_portal_settings
  to service_role;

insert into public.demo_portal_settings (
  setting_key,
  default_tenant_id,
  revision,
  updated_by,
  is_demo
)
select
  'public-home',
  tenant.id,
  1,
  'demo-operator',
  true
from public.tenants tenant
where tenant.id = '00000000-0000-4000-8000-000000000002'
  and tenant.kind = 'demo'
  and tenant.status = 'demo'
  and tenant.is_demo
on conflict (setting_key) do nothing;

create function public.cms_set_default_demo_tenant(
  p_tenant_id uuid,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_tenant_id uuid;
  current_revision bigint;
  next_revision bigint;
  previous_tenant_name text;
  selected_tenant_name text;
begin
  if p_tenant_id is null or p_expected_revision is null then
    raise exception 'tenant and expected revision are required';
  end if;

  select tenant.display_name
  into selected_tenant_name
  from public.tenants tenant
  where tenant.id = p_tenant_id
    and tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo;

  if selected_tenant_name is null then
    raise exception 'demo tenant unavailable';
  end if;

  select setting.default_tenant_id, setting.revision
  into current_tenant_id, current_revision
  from public.demo_portal_settings setting
  where setting.setting_key = 'public-home'
    and setting.is_demo
  for update;

  if current_revision is null then
    raise exception 'default demo portal configuration unavailable';
  end if;

  if current_revision <> p_expected_revision then
    raise exception 'default demo portal revision conflict'
      using errcode = '40001';
  end if;

  if current_tenant_id = p_tenant_id then
    return current_revision;
  end if;

  select tenant.display_name
  into previous_tenant_name
  from public.tenants tenant
  where tenant.id = current_tenant_id;

  update public.demo_portal_settings
  set
    default_tenant_id = p_tenant_id,
    revision = revision + 1,
    updated_by = 'demo-operator',
    updated_at = now()
  where setting_key = 'public-home'
    and revision = current_revision
  returning revision into next_revision;

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
    'portal.default_changed',
    'tenant',
    p_tenant_id,
    jsonb_build_object(
      'default_tenant_id', current_tenant_id,
      'revision', current_revision
    ),
    jsonb_build_object(
      'default_tenant_id', p_tenant_id,
      'revision', next_revision
    ),
    format(
      'Portal padrão alterado de %s para %s.',
      coalesce(previous_tenant_name, current_tenant_id::text),
      selected_tenant_name
    ),
    true
  );

  return next_revision;
end;
$$;

revoke all on function public.cms_set_default_demo_tenant(uuid, bigint)
  from public, anon, authenticated;
grant execute on function public.cms_set_default_demo_tenant(uuid, bigint)
  to service_role;

comment on table public.demo_portal_settings is
  'Singleton server-only that selects the default public demo tenant.';
comment on function public.cms_set_default_demo_tenant(uuid, bigint) is
  'Atomically changes the default demo portal tenant with optimistic concurrency and audit.';

create or replace function private.reset_demo_catalog(confirmation text)
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
    or exists (select 1 from public.authors where not is_demo)
    or exists (select 1 from public.categories where not is_demo)
    or exists (select 1 from public.tags where not is_demo)
    or exists (select 1 from public.content_items where not is_demo)
    or exists (select 1 from public.content_revisions where not is_demo)
    or exists (select 1 from public.media_assets where not is_demo)
    or exists (select 1 from public.distributions where not is_demo)
    or exists (select 1 from public.placements where not is_demo)
    or exists (select 1 from public.themes where not is_demo)
    or exists (select 1 from public.theme_versions where not is_demo)
    or exists (select 1 from public.audit_events where not is_demo)
    or exists (select 1 from public.demo_portal_settings where not is_demo)
  then
    raise exception 'demo reset refused because non-demo data exists';
  end if;

  truncate table public.tenants cascade;
end;
$$;

revoke all on function private.reset_demo_catalog(text)
  from public, anon, authenticated, service_role;
