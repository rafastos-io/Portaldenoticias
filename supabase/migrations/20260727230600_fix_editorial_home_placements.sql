begin;

-- A primeira carga usou a numeração ordinal global nos destaques de três
-- verticais. Os códigos editoriais reiniciam em 001 por vertical; esta migration
-- corrige somente a curadoria e completa a auditoria sem tocar no catálogo.

with placement_seed (
  tenant_slug,
  slot_key,
  rank,
  code,
  presentation_variant,
  eyebrow_override
) as (
  values
    ('banco-demo-horizonte', 'home.hero', 0, 'MVP-IN-010', 'hero', 'Vida longa'),
    ('seguros-demo-atlas', 'home.hero', 0, 'MVP-SE-006', 'hero', 'Novos modelos'),
    ('seguros-demo-atlas', 'home.secondary', 0, 'MVP-SE-003', 'compact', 'Saúde'),
    ('seguros-demo-atlas', 'home.secondary', 1, 'MVP-SE-008', 'compact', 'Inteligência artificial'),
    ('healthtech-demo-lumen', 'home.hero', 0, 'MVP-SA-008', 'hero', 'Inteligência artificial'),
    ('healthtech-demo-lumen', 'home.secondary', 0, 'MVP-SA-006', 'featured', 'Saúde digital'),
    ('healthtech-demo-lumen', 'home.secondary', 1, 'MVP-SA-010', 'standard', 'Longevidade')
),
selected as (
  select
    placement.*,
    tenant.id as tenant_id,
    item.id as content_item_id,
    item.last_published_at
  from placement_seed placement
  join public.tenants tenant
    on tenant.slug = placement.tenant_slug
   and tenant.kind = 'demo'
   and tenant.status = 'demo'
   and tenant.is_demo = true
  join public.content_revisions revision
    on revision.body_json->>'seed_code' = placement.code
   and revision.body_json->>'editorial_matrix' = 'matriz-editorial-portais-v1'
  join public.content_items item
    on item.id = revision.content_item_id
   and item.current_published_revision_id = revision.id
   and item.workflow_status = 'published'
)
insert into public.placements (
  id,
  tenant_id,
  slot_key,
  content_item_id,
  starts_at,
  rank,
  presentation_variant,
  eyebrow_override,
  status,
  is_demo
)
select
  md5(
    'editorial-2026-07:placement:'
    || selected.tenant_slug
    || ':'
    || selected.slot_key
    || ':'
    || selected.rank
  )::uuid,
  selected.tenant_id,
  selected.slot_key,
  selected.content_item_id,
  selected.last_published_at,
  selected.rank,
  selected.presentation_variant,
  selected.eyebrow_override,
  'active',
  true
from selected
on conflict (tenant_id, slot_key, rank) do update set
  content_item_id = excluded.content_item_id,
  starts_at = excluded.starts_at,
  ends_at = null,
  presentation_variant = excluded.presentation_variant,
  eyebrow_override = excluded.eyebrow_override,
  status = 'active',
  is_demo = true,
  updated_at = now();

with audit_seed (tenant_slug, hero_code) as (
  values
    ('credito-demo-orbita', 'MVP-CR-005'),
    ('banco-demo-horizonte', 'MVP-IN-010'),
    ('seguros-demo-atlas', 'MVP-SE-006'),
    ('healthtech-demo-lumen', 'MVP-SA-008')
)
insert into public.audit_events (
  id,
  tenant_id,
  actor_id,
  action,
  target_type,
  target_id,
  after_json,
  reason,
  is_demo
)
select
  md5('editorial-2026-07:audit:' || audit.tenant_slug)::uuid,
  tenant.id,
  'demo-operator',
  'content.catalog_expanded',
  'editorial_batch',
  item.id,
  jsonb_build_object(
    'catalog_version', 'matriz-editorial-portais-v1',
    'canonical_articles_per_vertical', 10,
    'unique_images_per_vertical', 10,
    'hero_code', audit.hero_code
  ),
  'Expansão editorial do MVP com 40 matérias canônicas, imagens exclusivas e crossovers planejados.',
  true
from audit_seed audit
join public.tenants tenant
  on tenant.slug = audit.tenant_slug
join public.content_revisions revision
  on revision.body_json->>'seed_code' = audit.hero_code
 and revision.body_json->>'editorial_matrix' = 'matriz-editorial-portais-v1'
join public.content_items item
  on item.id = revision.content_item_id
 and item.current_published_revision_id = revision.id
on conflict (id) do nothing;

commit;
