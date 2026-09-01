create or replace function public.cms_create_editorial_content(
  p_tenant_id uuid,
  p_slug text,
  p_title text,
  p_subtitle text,
  p_body_text text,
  p_category_id uuid,
  p_author_id uuid,
  p_image_mode text,
  p_image_alt text,
  p_editorial_type text,
  p_key_topics text[],
  p_sponsorship_label text,
  p_correction_note text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  content_id uuid;
  revision_id uuid;
  affected_rows integer;
  normalized_topics text[] := coalesce(p_key_topics, array[]::text[]);
begin
  if p_editorial_type is null
    or p_editorial_type not in ('standard', 'explainer', 'sponsored', 'correction')
    or cardinality(normalized_topics) > 8
    or exists (
      select 1
      from unnest(normalized_topics) as topic
      where topic is null or length(trim(topic)) not between 2 and 160
    )
    or (
      p_editorial_type = 'explainer'
      and cardinality(normalized_topics) = 0
    )
    or (
      p_editorial_type <> 'explainer'
      and cardinality(normalized_topics) > 0
    )
    or (
      p_editorial_type = 'sponsored'
      and length(trim(coalesce(p_sponsorship_label, ''))) not between 2 and 120
    )
    or (
      p_editorial_type <> 'sponsored'
      and nullif(trim(coalesce(p_sponsorship_label, '')), '') is not null
    )
    or (
      p_editorial_type = 'correction'
      and length(trim(coalesce(p_correction_note, ''))) not between 12 and 500
    )
    or (
      p_editorial_type <> 'correction'
      and nullif(trim(coalesce(p_correction_note, '')), '') is not null
    )
  then
    raise exception 'invalid editorial metadata';
  end if;

  if not exists (
    select 1
    from public.categories category
    left join public.tenants owner on owner.id = category.owner_tenant_id
    where category.id = p_category_id
      and category.status = 'active'
      and (
        category.owner_tenant_id = p_tenant_id
        or owner.kind = 'platform'
      )
  ) or not exists (
    select 1
    from public.authors author
    left join public.tenants owner on owner.id = author.owner_tenant_id
    where author.id = p_author_id
      and author.status = 'active'
      and (
        author.owner_tenant_id = p_tenant_id
        or owner.kind = 'platform'
      )
  )
  then
    raise exception 'invalid author or category scope';
  end if;

  content_id := public.cms_create_content_with_media(
    p_tenant_id,
    p_slug,
    p_title,
    p_subtitle,
    p_body_text,
    p_category_id,
    p_author_id,
    p_image_mode,
    p_image_alt
  );

  select id into revision_id
  from public.content_revisions
  where content_item_id = content_id
    and revision_number = 1;

  if revision_id is null then
    raise exception 'created revision unavailable';
  end if;

  update public.content_revisions
  set
    body_json = jsonb_set(
      jsonb_set(
        body_json,
        '{editorial_type}',
        to_jsonb(p_editorial_type),
        true
      ),
      '{key_topics}',
      to_jsonb(normalized_topics),
      true
    ),
    sponsorship_label = nullif(trim(coalesce(p_sponsorship_label, '')), ''),
    correction_note = nullif(trim(coalesce(p_correction_note, '')), '')
  where id = revision_id
    and content_item_id = content_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'editorial revision metadata was not persisted';
  end if;

  update public.content_items
  set content_type = case
    when p_editorial_type = 'sponsored' then 'sponsored'
    else 'article'
  end
  where id = content_id
    and owner_tenant_id = p_tenant_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'editorial content type was not persisted';
  end if;

  return content_id;
end;
$$;

create or replace function public.cms_update_editorial_content(
  p_tenant_id uuid,
  p_content_id uuid,
  p_title text,
  p_subtitle text,
  p_body_text text,
  p_category_id uuid,
  p_author_id uuid,
  p_image_mode text,
  p_image_alt text,
  p_editorial_type text,
  p_key_topics text[],
  p_sponsorship_label text,
  p_correction_note text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  revision_id uuid;
  affected_rows integer;
  normalized_topics text[] := coalesce(p_key_topics, array[]::text[]);
begin
  if p_editorial_type is null
    or p_editorial_type not in ('standard', 'explainer', 'sponsored', 'correction')
    or cardinality(normalized_topics) > 8
    or exists (
      select 1
      from unnest(normalized_topics) as topic
      where topic is null or length(trim(topic)) not between 2 and 160
    )
    or (
      p_editorial_type = 'explainer'
      and cardinality(normalized_topics) = 0
    )
    or (
      p_editorial_type <> 'explainer'
      and cardinality(normalized_topics) > 0
    )
    or (
      p_editorial_type = 'sponsored'
      and length(trim(coalesce(p_sponsorship_label, ''))) not between 2 and 120
    )
    or (
      p_editorial_type <> 'sponsored'
      and nullif(trim(coalesce(p_sponsorship_label, '')), '') is not null
    )
    or (
      p_editorial_type = 'correction'
      and length(trim(coalesce(p_correction_note, ''))) not between 12 and 500
    )
    or (
      p_editorial_type <> 'correction'
      and nullif(trim(coalesce(p_correction_note, '')), '') is not null
    )
  then
    raise exception 'invalid editorial metadata';
  end if;

  if not exists (
    select 1
    from public.categories category
    left join public.tenants owner on owner.id = category.owner_tenant_id
    where category.id = p_category_id
      and category.status = 'active'
      and (
        category.owner_tenant_id = p_tenant_id
        or owner.kind = 'platform'
      )
  ) or not exists (
    select 1
    from public.authors author
    left join public.tenants owner on owner.id = author.owner_tenant_id
    where author.id = p_author_id
      and author.status = 'active'
      and (
        author.owner_tenant_id = p_tenant_id
        or owner.kind = 'platform'
      )
  )
  then
    raise exception 'invalid author or category scope';
  end if;

  revision_id := public.cms_update_content_with_media(
    p_tenant_id,
    p_content_id,
    p_title,
    p_subtitle,
    p_body_text,
    p_category_id,
    p_author_id,
    p_image_mode,
    p_image_alt
  );

  update public.content_revisions
  set
    body_json = jsonb_set(
      jsonb_set(
        body_json,
        '{editorial_type}',
        to_jsonb(p_editorial_type),
        true
      ),
      '{key_topics}',
      to_jsonb(normalized_topics),
      true
    ),
    sponsorship_label = nullif(trim(coalesce(p_sponsorship_label, '')), ''),
    correction_note = nullif(trim(coalesce(p_correction_note, '')), '')
  where id = revision_id
    and content_item_id = p_content_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'editorial revision metadata was not persisted';
  end if;

  update public.content_items
  set content_type = case
    when p_editorial_type = 'sponsored' then 'sponsored'
    else 'article'
  end
  where id = p_content_id
    and owner_tenant_id = p_tenant_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'editorial content type was not persisted';
  end if;

  return revision_id;
end;
$$;

revoke all on function public.cms_create_editorial_content(
  uuid, text, text, text, text, uuid, uuid, text, text, text, text[], text, text
) from public, anon, authenticated;
revoke all on function public.cms_update_editorial_content(
  uuid, uuid, text, text, text, uuid, uuid, text, text, text, text[], text, text
) from public, anon, authenticated;

grant execute on function public.cms_create_editorial_content(
  uuid, text, text, text, text, uuid, uuid, text, text, text, text[], text, text
) to service_role;
grant execute on function public.cms_update_editorial_content(
  uuid, uuid, text, text, text, uuid, uuid, text, text, text, text[], text, text
) to service_role;

comment on function public.cms_create_editorial_content(
  uuid, text, text, text, text, uuid, uuid, text, text, text, text[], text, text
) is 'Atomic demo CMS create: canonical item, revision, media and constrained editorial metadata.';
comment on function public.cms_update_editorial_content(
  uuid, uuid, text, text, text, uuid, uuid, text, text, text, text[], text, text
) is 'Atomic demo CMS update: revision, media and constrained editorial metadata without replacing body_json.';
