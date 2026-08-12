create or replace function public.cms_set_content_status(
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
  paused_distribution_ids uuid[] := array[]::uuid[];
  paused_placement_ids uuid[] := array[]::uuid[];
  has_pause_snapshot boolean := false;
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
      and (
        revision.body_json #>> '{demo_media,mode}' = 'none'
        or (
          revision.body_json #>> '{demo_media,mode}' = 'fallback'
          and length(trim(coalesce(
            revision.body_json #>> '{demo_media,alt}',
            ''
          ))) >= 12
        )
      )
  ) then
    raise exception 'publication checklist incomplete';
  end if;

  if p_status = 'paused' then
    select coalesce(array_agg(id order by id), array[]::uuid[])
    into paused_distribution_ids
    from public.distributions
    where content_item_id = p_content_id
      and status = 'active';

    select coalesce(array_agg(id order by id), array[]::uuid[])
    into paused_placement_ids
    from public.placements
    where content_item_id = p_content_id
      and status = 'active';
  elsif previous_status = 'paused' then
    select
      coalesce(array(
        select jsonb_array_elements_text(
          event.before_json -> 'paused_distribution_ids'
        )::uuid
      ), array[]::uuid[]),
      coalesce(array(
        select jsonb_array_elements_text(
          event.before_json -> 'paused_placement_ids'
        )::uuid
      ), array[]::uuid[]),
      true
    into paused_distribution_ids, paused_placement_ids, has_pause_snapshot
    from public.audit_events event
    where event.tenant_id = p_tenant_id
      and event.target_id = p_content_id
      and event.action = 'content.paused'
      and event.before_json ? 'paused_distribution_ids'
      and event.before_json ? 'paused_placement_ids'
    order by event.created_at desc
    limit 1;

    if not coalesce(has_pause_snapshot, false) then
      select coalesce(array_agg(id order by id), array[]::uuid[])
      into paused_distribution_ids
      from public.distributions
      where content_item_id = p_content_id
        and tenant_id = p_tenant_id
        and status = 'paused';

      select coalesce(array_agg(id order by id), array[]::uuid[])
      into paused_placement_ids
      from public.placements
      where content_item_id = p_content_id
        and tenant_id = p_tenant_id
        and status = 'paused';
    end if;
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

  if previous_status = 'draft' then
    update public.distributions
    set
      status = 'active',
      starts_at = coalesce(starts_at, now()),
      approved_by = 'demo-operator',
      updated_at = now()
    where content_item_id = p_content_id
      and tenant_id = p_tenant_id
      and status = 'draft';
  elsif p_status = 'paused' then
    update public.distributions
    set status = 'paused', updated_at = now()
    where id = any(paused_distribution_ids)
      and status = 'active';

    update public.placements
    set status = 'paused', updated_at = now()
    where id = any(paused_placement_ids)
      and status = 'active';
  else
    update public.distributions
    set status = 'active', updated_at = now()
    where id = any(paused_distribution_ids)
      and status = 'paused';

    update public.placements
    set status = 'active', updated_at = now()
    where id = any(paused_placement_ids)
      and status = 'paused';
  end if;

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
    jsonb_build_object(
      'status', previous_status,
      'paused_distribution_ids', to_jsonb(paused_distribution_ids),
      'paused_placement_ids', to_jsonb(paused_placement_ids)
    ),
    jsonb_build_object('status', p_status),
    nullif(trim(coalesce(p_reason, '')), ''),
    true
  );

  return p_status;
end;
$$;

comment on function public.cms_set_content_status(uuid, uuid, text, text) is
  'Canonical workflow transition preserving per-destination authorization states through pause/resume snapshots.';
