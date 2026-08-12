create function public.cms_create_content(
  p_tenant_id uuid,
  p_slug text,
  p_title text,
  p_subtitle text,
  p_body_text text,
  p_category_id uuid,
  p_author_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  content_id uuid := gen_random_uuid();
  revision_id uuid := gen_random_uuid();
begin
  if not exists (
    select 1 from public.tenants
    where id = p_tenant_id and kind = 'demo' and status = 'demo'
  ) then
    raise exception 'tenant unavailable';
  end if;

  if p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or length(trim(p_title)) < 5
    or length(trim(p_subtitle)) < 10
    or length(trim(p_body_text)) < 80
  then
    raise exception 'invalid editorial fields';
  end if;

  if not exists (select 1 from public.categories where id = p_category_id and status = 'active')
    or not exists (select 1 from public.authors where id = p_author_id and status = 'active')
  then
    raise exception 'invalid author or category';
  end if;

  insert into public.content_items (
    id, owner_tenant_id, canonical_slug, content_type,
    workflow_status, visibility, created_by, updated_by, is_demo
  )
  values (
    content_id, p_tenant_id, p_slug, 'article',
    'draft', 'catalog', 'demo-operator', 'demo-operator', true
  );

  insert into public.content_revisions (
    id, content_item_id, revision_number, title, subtitle,
    slug_snapshot, body_json, body_text, seo_title, seo_description,
    word_count, created_by, change_summary, is_demo
  )
  values (
    revision_id,
    content_id,
    1,
    trim(p_title),
    trim(p_subtitle),
    p_slug,
    jsonb_build_object(
      'type', 'doc',
      'demo_media', jsonb_build_object(
        'mode', 'fallback',
        'fallback_path', '/images/editorial-hero-demo.png',
        'alt', 'Composição abstrata fictícia sobre saúde e longevidade.'
      ),
      'content', jsonb_build_array(
        jsonb_build_object('type', 'paragraph', 'text', trim(p_body_text))
      )
    ),
    trim(p_body_text),
    trim(p_title),
    trim(p_subtitle),
    cardinality(regexp_split_to_array(trim(p_body_text), '\s+')),
    'demo-operator',
    'Rascunho criado no CMS demonstrativo.',
    true
  );

  insert into public.content_revision_authors (
    content_revision_id, author_id, byline_order
  ) values (revision_id, p_author_id, 1);

  insert into public.content_revision_categories (
    content_revision_id, category_id, is_primary
  ) values (revision_id, p_category_id, true);

  insert into public.distributions (
    content_item_id, tenant_id, status, channels, rights_code,
    contract_reference, created_by, is_demo
  )
  values (
    content_id, p_tenant_id, 'draft', array['portal'], 'demo',
    'CMS-DEMO', 'demo-operator', true
  );

  insert into public.audit_events (
    tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  values (
    p_tenant_id,
    'demo-operator',
    'content.created',
    'content_item',
    content_id,
    jsonb_build_object('title', trim(p_title), 'status', 'draft'),
    'Criação pelo CMS demonstrativo.',
    true
  );

  return content_id;
end;
$$;

create function public.cms_update_content(
  p_tenant_id uuid,
  p_content_id uuid,
  p_title text,
  p_subtitle text,
  p_body_text text,
  p_category_id uuid,
  p_author_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_title text;
  current_status text;
  item_slug text;
  next_revision integer;
  revision_id uuid := gen_random_uuid();
begin
  select
    revision.title,
    item.workflow_status,
    item.canonical_slug,
    coalesce(max_revision.maximum, 0) + 1
  into previous_title, current_status, item_slug, next_revision
  from public.content_items item
  left join public.content_revisions revision
    on revision.id = item.current_published_revision_id
  cross join lateral (
    select max(existing.revision_number) as maximum
    from public.content_revisions existing
    where existing.content_item_id = item.id
  ) max_revision
  where item.id = p_content_id
    and item.owner_tenant_id = p_tenant_id
    and item.workflow_status in ('draft', 'published', 'paused')
  group by revision.title, item.workflow_status, item.canonical_slug, max_revision.maximum;

  if current_status is null then
    raise exception 'content unavailable for tenant';
  end if;

  if length(trim(p_title)) < 5
    or length(trim(p_subtitle)) < 10
    or length(trim(p_body_text)) < 80
  then
    raise exception 'invalid editorial fields';
  end if;

  if not exists (select 1 from public.categories where id = p_category_id and status = 'active')
    or not exists (select 1 from public.authors where id = p_author_id and status = 'active')
  then
    raise exception 'invalid author or category';
  end if;

  if previous_title is null then
    select title into previous_title
    from public.content_revisions
    where content_item_id = p_content_id
    order by revision_number desc
    limit 1;
  end if;

  insert into public.content_revisions (
    id, content_item_id, revision_number, title, subtitle,
    slug_snapshot, body_json, body_text, seo_title, seo_description,
    word_count, created_by, approved_by, approved_at,
    change_summary, is_demo
  )
  values (
    revision_id,
    p_content_id,
    next_revision,
    trim(p_title),
    trim(p_subtitle),
    item_slug,
    jsonb_build_object(
      'type', 'doc',
      'demo_media', jsonb_build_object(
        'mode', 'fallback',
        'fallback_path', '/images/editorial-hero-demo.png',
        'alt', 'Composição abstrata fictícia sobre saúde e longevidade.'
      ),
      'content', jsonb_build_array(
        jsonb_build_object('type', 'paragraph', 'text', trim(p_body_text))
      )
    ),
    trim(p_body_text),
    trim(p_title),
    trim(p_subtitle),
    cardinality(regexp_split_to_array(trim(p_body_text), '\s+')),
    'demo-operator',
    case when current_status in ('published', 'paused') then 'demo-operator' else null end,
    case when current_status in ('published', 'paused') then now() else null end,
    'Edição criada no CMS demonstrativo.',
    true
  );

  insert into public.content_revision_authors (
    content_revision_id, author_id, byline_order
  ) values (revision_id, p_author_id, 1);

  insert into public.content_revision_categories (
    content_revision_id, category_id, is_primary
  ) values (revision_id, p_category_id, true);

  update public.content_items
  set
    current_published_revision_id = case
      when current_status in ('published', 'paused') then revision_id
      else current_published_revision_id
    end,
    updated_by = 'demo-operator',
    updated_at = now()
  where id = p_content_id and owner_tenant_id = p_tenant_id;

  insert into public.audit_events (
    tenant_id, actor_id, action, target_type, target_id,
    before_json, after_json, reason, is_demo
  )
  values (
    p_tenant_id,
    'demo-operator',
    'content.edited',
    'content_item',
    p_content_id,
    jsonb_build_object('title', previous_title, 'status', current_status),
    jsonb_build_object('title', trim(p_title), 'status', current_status),
    'Edição pelo CMS demonstrativo.',
    true
  );

  return revision_id;
end;
$$;

create function public.cms_set_content_status(
  p_tenant_id uuid,
  p_content_id uuid,
  p_status text,
  p_reason text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_status text;
  action_name text;
begin
  select workflow_status into previous_status
  from public.content_items
  where id = p_content_id
    and owner_tenant_id = p_tenant_id
    and workflow_status in ('draft', 'published', 'paused')
  for update;

  if previous_status is null then
    raise exception 'content unavailable for tenant';
  end if;

  if not (
    (previous_status = 'draft' and p_status = 'published')
    or (previous_status = 'published' and p_status = 'paused')
    or (previous_status = 'paused' and p_status = 'published')
  ) then
    raise exception 'invalid editorial transition';
  end if;

  if p_status = 'paused' and length(trim(coalesce(p_reason, ''))) < 8 then
    raise exception 'pause reason is required';
  end if;

  if previous_status = 'draft' and not exists (
    select 1 from public.content_revisions revision
    join public.content_revision_authors author_link
      on author_link.content_revision_id = revision.id
    join public.content_revision_categories category_link
      on category_link.content_revision_id = revision.id and category_link.is_primary
    where revision.content_item_id = p_content_id
      and length(trim(revision.title)) >= 5
      and length(trim(revision.subtitle)) >= 10
      and length(trim(revision.body_text)) >= 80
  ) then
    raise exception 'publication checklist incomplete';
  end if;

  update public.content_items
  set
    workflow_status = p_status,
    current_published_revision_id = case
      when previous_status = 'draft' then (
        select id from public.content_revisions
        where content_item_id = p_content_id
        order by revision_number desc
        limit 1
      )
      else current_published_revision_id
    end,
    first_published_at = case
      when p_status = 'published' then coalesce(first_published_at, now())
      else first_published_at
    end,
    last_published_at = case when p_status = 'published' then now() else last_published_at end,
    paused_at = case when p_status = 'paused' then now() else null end,
    updated_by = 'demo-operator',
    updated_at = now()
  where id = p_content_id and owner_tenant_id = p_tenant_id;

  update public.distributions
  set
    status = case when p_status = 'paused' then 'paused' else 'active' end,
    starts_at = case when p_status = 'published' then coalesce(starts_at, now()) else starts_at end,
    approved_by = case when p_status = 'published' then 'demo-operator' else approved_by end,
    updated_at = now()
  where content_item_id = p_content_id and tenant_id = p_tenant_id;

  update public.placements
  set
    status = case when p_status = 'paused' then 'paused' else 'active' end,
    updated_at = now()
  where content_item_id = p_content_id and tenant_id = p_tenant_id;

  action_name := case
    when p_status = 'paused' then 'content.paused'
    when previous_status = 'paused' then 'content.resumed'
    else 'content.published'
  end;

  insert into public.audit_events (
    tenant_id, actor_id, action, target_type, target_id,
    before_json, after_json, reason, is_demo
  )
  values (
    p_tenant_id,
    'demo-operator',
    action_name,
    'content_item',
    p_content_id,
    jsonb_build_object('status', previous_status),
    jsonb_build_object('status', p_status),
    nullif(trim(coalesce(p_reason, '')), ''),
    true
  );

  return p_status;
end;
$$;

revoke all on function public.cms_create_content(uuid, text, text, text, text, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.cms_update_content(uuid, uuid, text, text, text, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.cms_set_content_status(uuid, uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.cms_create_content(uuid, text, text, text, text, uuid, uuid)
  to service_role;
grant execute on function public.cms_update_content(uuid, uuid, text, text, text, uuid, uuid)
  to service_role;
grant execute on function public.cms_set_content_status(uuid, uuid, text, text)
  to service_role;

comment on function public.cms_create_content(uuid, text, text, text, text, uuid, uuid) is
  'Server-only transactional CMS create use case for the demo gate.';
comment on function public.cms_update_content(uuid, uuid, text, text, text, uuid, uuid) is
  'Server-only transactional CMS edit use case with mandatory tenant scope.';
comment on function public.cms_set_content_status(uuid, uuid, text, text) is
  'Server-only transactional publish/pause/resume use case with audit event.';
