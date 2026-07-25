create function private.enforce_revision_author_scope()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.content_revisions revision
    join public.content_items item
      on item.id = revision.content_item_id
    join public.authors author
      on author.id = new.author_id
    left join public.tenants author_owner
      on author_owner.id = author.owner_tenant_id
    where revision.id = new.content_revision_id
      and (
        author.owner_tenant_id = item.owner_tenant_id
        or author_owner.kind = 'platform'
      )
  ) then
    raise exception 'author unavailable for content tenant';
  end if;

  return new;
end;
$$;

create function private.enforce_revision_category_scope()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.content_revisions revision
    join public.content_items item
      on item.id = revision.content_item_id
    join public.categories category
      on category.id = new.category_id
    left join public.tenants category_owner
      on category_owner.id = category.owner_tenant_id
    where revision.id = new.content_revision_id
      and (
        category.owner_tenant_id = item.owner_tenant_id
        or category_owner.kind = 'platform'
      )
  ) then
    raise exception 'category unavailable for content tenant';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_revision_author_scope()
  from public, anon, authenticated;
revoke all on function private.enforce_revision_category_scope()
  from public, anon, authenticated;
grant execute on function private.enforce_revision_author_scope()
  to service_role;
grant execute on function private.enforce_revision_category_scope()
  to service_role;

create trigger content_revision_author_tenant_scope
before insert or update of content_revision_id, author_id
on public.content_revision_authors
for each row execute function private.enforce_revision_author_scope();

create trigger content_revision_category_tenant_scope
before insert or update of content_revision_id, category_id
on public.content_revision_categories
for each row execute function private.enforce_revision_category_scope();

comment on function private.enforce_revision_author_scope() is
  'Prevents privileged CMS writes from linking authors across tenant boundaries.';
comment on function private.enforce_revision_category_scope() is
  'Prevents privileged CMS writes from linking categories across tenant boundaries.';
