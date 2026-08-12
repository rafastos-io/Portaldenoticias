create or replace function private.apply_technology_and_innovation_category_label()
returns void
language plpgsql
set search_path = ''
as $$
declare
  platform_id constant uuid := '00000000-0000-4000-8000-000000000001';
begin
  update public.categories as category
  set
    name = 'Tecnologia e Inovação',
    description = 'Tecnologia, inteligência artificial e inovação digital em saúde.',
    updated_at = now()
  where category.owner_tenant_id = platform_id
    and category.slug = 'ti';

  update public.theme_versions as version
  set navigation_json = (
    select coalesce(
      jsonb_agg(
        to_jsonb(
          case
            when entry.value = 'TI' then 'Tecnologia e Inovação'
            else entry.value
          end
        )
        order by entry.ordinality
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements_text(version.navigation_json)
      with ordinality as entry(value, ordinality)
  )
  where version.theme_id in (
    select theme.id
    from public.themes as theme
    join public.tenants as tenant on tenant.id = theme.tenant_id
    where tenant.slug in ('abrafarma', 'broadcast-saude')
  )
    and version.navigation_json ? 'TI';

  update public.themes as theme
  set updated_at = now()
  from public.tenants as tenant
  where tenant.id = theme.tenant_id
    and tenant.slug in ('abrafarma', 'broadcast-saude');

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id,
    before_json, after_json, reason, is_demo
  )
  select
    md5('broadcast-saude:audit:technology-innovation:' || tenant.slug)::uuid,
    tenant.id,
    'demo-operator',
    'theme.updated',
    'theme_version',
    version.id,
    jsonb_build_object('name', 'TI', 'slug', 'ti'),
    jsonb_build_object('name', 'Tecnologia e Inovação', 'slug', 'ti'),
    'Editoria renomeada sem alterar o slug público existente.',
    true
  from public.tenants as tenant
  join public.themes as theme on theme.tenant_id = tenant.id
  join public.theme_versions as version
    on version.theme_id = theme.id
   and version.id = theme.published_version_id
  where tenant.slug in ('abrafarma', 'broadcast-saude')
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.apply_technology_and_innovation_category_label()
from public, anon, authenticated, service_role;

comment on function private.apply_technology_and_innovation_category_label() is
  'Mantém o rótulo Tecnologia e Inovação para a editoria de slug ti.';

select private.apply_technology_and_innovation_category_label();
