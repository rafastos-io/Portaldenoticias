begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_name text not null check (length(trim(display_name)) between 2 and 120),
  legal_name text,
  kind text not null check (kind in ('platform', 'client', 'demo', 'sandbox')),
  status text not null check (status in ('demo', 'trial', 'active', 'suspended', 'archived')),
  default_locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  settings_json jsonb not null default '{}'::jsonb check (jsonb_typeof(settings_json) = 'object'),
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  owner_tenant_id uuid references public.tenants(id) on delete restrict,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_name text not null,
  bio text not null default '',
  credentials text[] not null default '{}',
  specialties text[] not null default '{}',
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (owner_tenant_id, slug)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_tenant_id uuid references public.tenants(id) on delete restrict,
  parent_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  seo_json jsonb not null default '{}'::jsonb check (jsonb_typeof(seo_json) = 'object'),
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (owner_tenant_id, slug)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_tenant_id uuid references public.tenants(id) on delete restrict,
  name text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (owner_tenant_id, slug)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_tenant_id uuid not null references public.tenants(id) on delete restrict,
  bucket_id text not null default 'demo-media' check (bucket_id = 'demo-media'),
  storage_key text not null unique,
  mime_type text not null check (mime_type in ('image/avif', 'image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint check (size_bytes is null or size_bytes between 1 and 8388608),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  alt_text text not null,
  caption text not null default '',
  credit text not null default 'Imagem fictícia de demonstração',
  rights_basis text not null default 'demo-original',
  license_expires_at timestamptz,
  status text not null default 'ready' check (status in ('pending', 'ready', 'failed', 'archived')),
  metadata_json jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata_json) = 'object'),
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_key like owner_tenant_id::text || '/%')
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  owner_tenant_id uuid not null references public.tenants(id) on delete restrict,
  canonical_slug text not null check (canonical_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  content_type text not null default 'article' check (content_type in ('article', 'sponsored')),
  workflow_status text not null default 'draft'
    check (workflow_status in ('draft', 'in_review', 'approved', 'scheduled', 'published', 'paused', 'archived')),
  visibility text not null default 'catalog' check (visibility in ('catalog', 'private', 'platform_only')),
  current_published_revision_id uuid,
  first_published_at timestamptz,
  last_published_at timestamptz,
  scheduled_at timestamptz,
  paused_at timestamptz,
  archived_at timestamptz,
  embargo_until timestamptz,
  created_by text not null default 'demo-operator',
  updated_by text not null default 'demo-operator',
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_tenant_id, canonical_slug),
  unique (id, owner_tenant_id)
);

create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  title text not null check (length(trim(title)) between 5 and 180),
  subtitle text not null default '',
  slug_snapshot text not null check (slug_snapshot ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  body_json jsonb not null default '{"type":"doc","content":[]}'::jsonb check (jsonb_typeof(body_json) = 'object'),
  body_text text not null,
  seo_title text,
  seo_description text,
  correction_note text,
  sponsorship_label text,
  medical_review_status text not null default 'not_required'
    check (medical_review_status in ('not_required', 'pending', 'reviewed')),
  word_count integer not null default 0 check (word_count >= 0),
  created_by text not null default 'demo-operator',
  approved_by text,
  approved_at timestamptz,
  change_summary text not null default '',
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  unique (content_item_id, revision_number),
  unique (content_item_id, id)
);

alter table public.content_items
  add constraint content_items_published_revision_belongs_to_item
  foreign key (id, current_published_revision_id)
  references public.content_revisions(content_item_id, id)
  deferrable initially deferred;

create table public.content_revision_authors (
  content_revision_id uuid not null references public.content_revisions(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete restrict,
  byline_order smallint not null default 1 check (byline_order > 0),
  primary key (content_revision_id, author_id)
);

create table public.content_revision_categories (
  content_revision_id uuid not null references public.content_revisions(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (content_revision_id, category_id)
);

create unique index content_revision_one_primary_category
  on public.content_revision_categories(content_revision_id)
  where is_primary;

create table public.content_revision_tags (
  content_revision_id uuid not null references public.content_revisions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  primary key (content_revision_id, tag_id)
);

create table public.distributions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'active', 'paused', 'expired', 'revoked')),
  starts_at timestamptz,
  ends_at timestamptz,
  channels text[] not null default array['portal']::text[]
    check (channels <@ array['portal', 'api', 'rss']::text[] and cardinality(channels) > 0),
  headline_override text,
  subtitle_override text,
  slug_override text check (slug_override is null or slug_override ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category_override_id uuid references public.categories(id) on delete restrict,
  rights_code text not null default 'demo',
  contract_reference text,
  allow_full_body boolean not null default true,
  allow_media boolean not null default true,
  created_by text not null default 'demo-operator',
  approved_by text,
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, tenant_id),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.placements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slot_key text not null check (slot_key ~ '^[a-z0-9]+(?:[.-][a-z0-9]+)*$'),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  rank integer not null default 0 check (rank >= 0),
  presentation_variant text not null default 'standard'
    check (presentation_variant in ('hero', 'featured', 'standard', 'compact')),
  eyebrow_override text,
  image_override_id uuid references public.media_assets(id) on delete set null,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'expired')),
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slot_key, rank),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_version_id uuid,
  draft_version_id uuid,
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id),
  unique (id, tenant_id)
);

create table public.theme_versions (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references public.themes(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  schema_version integer not null default 1 check (schema_version = 1),
  tokens_json jsonb not null check (jsonb_typeof(tokens_json) = 'object'),
  components_json jsonb not null default '{}'::jsonb check (jsonb_typeof(components_json) = 'object'),
  navigation_json jsonb not null default '[]'::jsonb check (jsonb_typeof(navigation_json) = 'array'),
  brand_json jsonb not null default '{}'::jsonb check (jsonb_typeof(brand_json) = 'object'),
  created_by text not null default 'demo-operator',
  published_by text,
  published_at timestamptz,
  change_summary text not null default '',
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  unique (theme_id, version_number),
  unique (theme_id, id)
);

alter table public.themes
  add constraint themes_published_version_belongs_to_theme
  foreign key (id, published_version_id)
  references public.theme_versions(theme_id, id)
  deferrable initially deferred,
  add constraint themes_draft_version_belongs_to_theme
  foreign key (id, draft_version_id)
  references public.theme_versions(theme_id, id)
  deferrable initially deferred;

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  actor_id text not null check (actor_id = 'demo-operator'),
  action text not null,
  target_type text not null,
  target_id uuid,
  request_id text,
  ip_hash text,
  user_agent_summary text,
  before_json jsonb,
  after_json jsonb,
  reason text,
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  check (before_json is null or jsonb_typeof(before_json) = 'object'),
  check (after_json is null or jsonb_typeof(after_json) = 'object')
);

create index content_items_tenant_workflow_published_idx
  on public.content_items(owner_tenant_id, workflow_status, last_published_at desc);
create index content_revisions_item_revision_idx
  on public.content_revisions(content_item_id, revision_number desc);
create index distributions_tenant_status_window_idx
  on public.distributions(tenant_id, status, starts_at, ends_at);
create index placements_tenant_slot_window_rank_idx
  on public.placements(tenant_id, slot_key, starts_at, ends_at, rank);
create index audit_events_tenant_created_idx
  on public.audit_events(tenant_id, created_at desc);
create index media_assets_owner_idx on public.media_assets(owner_tenant_id);
create index authors_owner_idx on public.authors(owner_tenant_id);
create index categories_owner_idx on public.categories(owner_tenant_id);
create index tags_owner_idx on public.tags(owner_tenant_id);

create function private.prevent_audit_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'audit_events is append-only';
end;
$$;

revoke all on function private.prevent_audit_event_mutation() from public, anon, authenticated;
grant execute on function private.prevent_audit_event_mutation() to service_role;

create trigger audit_events_append_only
before update or delete on public.audit_events
for each row execute function private.prevent_audit_event_mutation();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'demo-media',
  'demo-media',
  false,
  8388608,
  array['image/avif', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create function private.validate_demo_media_tenant_prefix()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  path_tenant_id uuid;
begin
  if new.bucket_id <> 'demo-media' then
    return new;
  end if;

  begin
    path_tenant_id := split_part(new.name, '/', 1)::uuid;
  exception
    when invalid_text_representation then
      raise exception 'demo-media objects require a tenant UUID prefix';
  end;

  if split_part(new.name, '/', 2) = '' then
    raise exception 'demo-media objects require a filename after the tenant prefix';
  end if;

  if not exists (
    select 1 from public.tenants where id = path_tenant_id
  ) then
    raise exception 'demo-media tenant prefix does not exist';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_demo_media_tenant_prefix() from public, anon, authenticated;
grant execute on function private.validate_demo_media_tenant_prefix() to service_role, supabase_storage_admin;

create trigger demo_media_tenant_prefix
before insert or update of bucket_id, name on storage.objects
for each row execute function private.validate_demo_media_tenant_prefix();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tenants',
    'authors',
    'categories',
    'tags',
    'media_assets',
    'content_items',
    'content_revisions',
    'content_revision_authors',
    'content_revision_categories',
    'content_revision_tags',
    'distributions',
    'placements',
    'themes',
    'theme_versions',
    'audit_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format(
      'create policy direct_client_access_denied on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
      table_name
    );
  end loop;
end;
$$;

drop policy if exists demo_media_direct_client_access_denied on storage.objects;
create policy demo_media_direct_client_access_denied
on storage.objects
as restrictive
for all
to anon, authenticated
using (bucket_id <> 'demo-media')
with check (bucket_id <> 'demo-media');

drop policy if exists demo_media_bucket_direct_client_access_denied on storage.buckets;
create policy demo_media_bucket_direct_client_access_denied
on storage.buckets
as restrictive
for all
to anon, authenticated
using (id <> 'demo-media')
with check (id <> 'demo-media');

grant usage on schema public to anon, authenticated, service_role;
revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

revoke select, insert, update, delete on storage.objects from anon, authenticated;
revoke select, insert, update, delete on storage.buckets from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to service_role;

comment on schema public is
  'MVP-0 demo data. Access only from the Next.js server with a Supabase secret key.';
comment on table public.tenants is
  'Multi-tenant root. All MVP-0 records are fictitious and marked is_demo.';
comment on table public.audit_events is
  'Append-only demo audit trail; never store passwords, raw tokens or full article bodies.';
comment on column public.media_assets.storage_key is
  'Private Storage key formatted as <tenant_uuid>/<filename>.';

commit;
