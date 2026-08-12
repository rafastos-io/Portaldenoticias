create or replace function private.align_broadcast_saude_briefing_order()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.placements (
    id, tenant_id, slot_key, content_item_id, starts_at, rank,
    presentation_variant, eyebrow_override, status, is_demo
  )
  select
    md5('broadcast-saude:placement:' || target.slug || ':secondary:' || placement.rank)::uuid,
    target.id,
    'home.secondary',
    item.id,
    item.first_published_at,
    placement.rank,
    placement.variant,
    placement.eyebrow,
    'active',
    true
  from (
    values
      (0, 'biomm-lucro-liquido-1tri26', 'featured', 'Empresas'),
      (1, 'novo-nordisk-eleva-projecao-wegovy-comprimido', 'standard', 'Empresas'),
      (2, 'novartis-compra-myricx-bio', 'standard', 'M&A')
  ) as placement(rank, canonical_slug, variant, eyebrow)
  join public.content_items item
    on item.owner_tenant_id = '00000000-0000-4000-8000-000000000004'
   and item.canonical_slug = placement.canonical_slug
   and item.workflow_status = 'published'
  join public.tenants target
    on target.id in (
      '00000000-0000-4000-8000-000000000004'::uuid,
      '00000000-0000-4000-8000-000000000006'::uuid
    )
  on conflict (tenant_id, slot_key, rank) do update set
    content_item_id = excluded.content_item_id,
    starts_at = excluded.starts_at,
    ends_at = null,
    presentation_variant = excluded.presentation_variant,
    eyebrow_override = excluded.eyebrow_override,
    status = 'active',
    is_demo = true,
    updated_at = now();
$$;

revoke all on function private.align_broadcast_saude_briefing_order()
from public, anon, authenticated, service_role;

comment on function private.align_broadcast_saude_briefing_order() is
  'Mantém os três destaques de saúde na ordem editorial definida pelo briefing.';

select private.align_broadcast_saude_briefing_order();
