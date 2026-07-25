create function public.cms_create_content_with_media(
  p_tenant_id uuid,
  p_slug text,
  p_title text,
  p_subtitle text,
  p_body_text text,
  p_category_id uuid,
  p_author_id uuid,
  p_image_mode text,
  p_image_alt text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  content_id uuid;
begin
  if p_image_mode not in ('fallback', 'none')
    or (
      p_image_mode = 'fallback'
      and length(trim(coalesce(p_image_alt, ''))) not between 12 and 220
    )
  then
    raise exception 'invalid main image';
  end if;

  content_id := public.cms_create_content(
    p_tenant_id,
    p_slug,
    p_title,
    p_subtitle,
    p_body_text,
    p_category_id,
    p_author_id
  );

  update public.content_revisions
  set body_json = jsonb_set(
    body_json,
    '{demo_media}',
    case
      when p_image_mode = 'none' then jsonb_build_object(
        'mode', 'none',
        'fallback_path', null,
        'alt', null,
        'reason', 'Exceção sem imagem selecionada no CMS demonstrativo.'
      )
      else jsonb_build_object(
        'mode', 'fallback',
        'fallback_path', '/images/editorial-hero-demo.png',
        'alt', trim(p_image_alt)
      )
    end,
    true
  )
  where content_item_id = content_id
    and revision_number = 1;

  insert into public.audit_events (
    tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  values (
    p_tenant_id,
    'demo-operator',
    'content.media_selected',
    'content_item',
    content_id,
    jsonb_build_object(
      'image_mode', p_image_mode,
      'image_alt', nullif(trim(coalesce(p_image_alt, '')), '')
    ),
    'Imagem principal definida no CMS demonstrativo.',
    true
  );

  return content_id;
end;
$$;

create function public.cms_update_content_with_media(
  p_tenant_id uuid,
  p_content_id uuid,
  p_title text,
  p_subtitle text,
  p_body_text text,
  p_category_id uuid,
  p_author_id uuid,
  p_image_mode text,
  p_image_alt text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  revision_id uuid;
begin
  if p_image_mode not in ('fallback', 'none')
    or (
      p_image_mode = 'fallback'
      and length(trim(coalesce(p_image_alt, ''))) not between 12 and 220
    )
  then
    raise exception 'invalid main image';
  end if;

  revision_id := public.cms_update_content(
    p_tenant_id,
    p_content_id,
    p_title,
    p_subtitle,
    p_body_text,
    p_category_id,
    p_author_id
  );

  update public.content_revisions
  set body_json = jsonb_set(
    body_json,
    '{demo_media}',
    case
      when p_image_mode = 'none' then jsonb_build_object(
        'mode', 'none',
        'fallback_path', null,
        'alt', null,
        'reason', 'Exceção sem imagem selecionada no CMS demonstrativo.'
      )
      else jsonb_build_object(
        'mode', 'fallback',
        'fallback_path', '/images/editorial-hero-demo.png',
        'alt', trim(p_image_alt)
      )
    end,
    true
  )
  where id = revision_id
    and content_item_id = p_content_id;

  insert into public.audit_events (
    tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  values (
    p_tenant_id,
    'demo-operator',
    'content.media_selected',
    'content_item',
    p_content_id,
    jsonb_build_object(
      'image_mode', p_image_mode,
      'image_alt', nullif(trim(coalesce(p_image_alt, '')), '')
    ),
    'Imagem principal atualizada no CMS demonstrativo.',
    true
  );

  return revision_id;
end;
$$;

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
  where content_item_id = p_content_id;

  update public.placements
  set
    status = case when p_status = 'paused' then 'paused' else 'active' end,
    updated_at = now()
  where content_item_id = p_content_id;

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

revoke all on function public.cms_create_content_with_media(
  uuid, text, text, text, text, uuid, uuid, text, text
) from public, anon, authenticated;
revoke all on function public.cms_update_content_with_media(
  uuid, uuid, text, text, text, uuid, uuid, text, text
) from public, anon, authenticated;

grant execute on function public.cms_create_content_with_media(
  uuid, text, text, text, text, uuid, uuid, text, text
) to service_role;
grant execute on function public.cms_update_content_with_media(
  uuid, uuid, text, text, text, uuid, uuid, text, text
) to service_role;

comment on function public.cms_create_content_with_media(
  uuid, text, text, text, text, uuid, uuid, text, text
) is 'Transactional CMS create use case with constrained demo media selection.';
comment on function public.cms_update_content_with_media(
  uuid, uuid, text, text, text, uuid, uuid, text, text
) is 'Transactional CMS edit use case with constrained demo media selection.';
comment on function public.cms_set_content_status(uuid, uuid, text, text) is
  'Canonical publish/pause/resume use case; pause propagates to every distribution and placement.';
