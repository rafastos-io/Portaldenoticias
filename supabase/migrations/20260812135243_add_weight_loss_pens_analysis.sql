create or replace function private.apply_weight_loss_pens_analysis()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  abrafarma_id constant uuid := '00000000-0000-4000-8000-000000000004';
  broadcast_saude_id constant uuid := '00000000-0000-4000-8000-000000000006';
  platform_id constant uuid := '00000000-0000-4000-8000-000000000001';
  item_id constant uuid := md5('broadcast-saude:item:BRS-ANA-002')::uuid;
  revision_id constant uuid := md5('broadcast-saude:revision:BRS-ANA-002')::uuid;
  analysis_category_id uuid;
  author_id uuid;
  published_at constant timestamptz := timestamptz '2026-08-12 10:52:43-03';
  analysis_title constant text := 'A revolução das canetas emagrecedoras';
  analysis_subtitle constant text := 'Medicamentos para obesidade avançam sobre consumo, alimentação e benefícios corporativos — e podem crescer no Brasil acima da média mundial.';
  analysis_body constant text := E'O mercado de canetas emagrecedoras deve explodir no Brasil nos próximos quatro anos e superar de longe a taxa de crescimento da venda do medicamento no mundo. A alta incidência de obesidade na população, somada ao forte culto do brasileiro ao corpo, além da queda de preços do remédio por conta da quebra das patentes, vão turbinar as vendas.\n\nEstilo de vida\n\nNo comportamento e estilo de vida, com a disseminação global das canetas emagrecedoras e a tendência de maior consumo de proteína, o preço da matéria-prima do whey protein disparou. Nos últimos 12 meses, a alta é de 105%, com a tonelada do concentrado de whey com 80% de teor proteico (WPC 80) atingindo € 22 mil (cerca de R$ 128 mil) na União Europeia nas duas primeiras semanas de maio — não há um dado consolidado para o Brasil, pois há poucos fabricantes no País —, de acordo com a rede de serviços financeiros StoneX.\n\nBenefício corporativo\n\nDepois de começar a mudar os hábitos de compra dos brasileiros e pressionar a indústria de alimentos e os supermercados, as canetas emagrecedoras estão chegando aos departamentos de Recursos Humanos (RH) das empresas. O medicamento de alto valor unitário, usado para tratar obesidade, começa a constar na lista de benefícios concedidos aos funcionários por algumas companhias.';
begin
  if not exists (
    select 1 from public.tenants
    where id = abrafarma_id and status = 'demo' and is_demo
  ) or not exists (
    select 1 from public.tenants
    where id = broadcast_saude_id and status = 'demo' and is_demo
  ) then
    raise exception 'health tenants unavailable';
  end if;

  select id into analysis_category_id
  from public.categories
  where owner_tenant_id = platform_id and slug = 'analise' and status = 'active';

  if analysis_category_id is null then
    raise exception 'analysis category unavailable';
  end if;

  insert into public.authors (
    id, owner_tenant_id, slug, display_name, bio, specialties, status, is_demo
  ) values (
    md5('broadcast-saude:author:redacao-broadcast-saude')::uuid,
    platform_id,
    'redacao-broadcast-saude',
    'Broadcast Saúde',
    'Análises editoriais fornecidas e autorizadas para a validação da plataforma.',
    array['saúde', 'análise', 'negócios'],
    'active',
    true
  )
  on conflict (owner_tenant_id, slug) do update set
    display_name = excluded.display_name,
    bio = excluded.bio,
    specialties = excluded.specialties,
    status = 'active',
    is_demo = true,
    updated_at = now()
  returning id into author_id;

  insert into public.content_items (
    id, owner_tenant_id, canonical_slug, content_type, workflow_status,
    visibility, first_published_at, last_published_at, created_by, updated_by,
    is_demo
  ) values (
    item_id,
    abrafarma_id,
    'revolucao-canetas-emagrecedoras',
    'article',
    'published',
    'catalog',
    published_at,
    published_at,
    'demo-operator',
    'demo-operator',
    true
  )
  on conflict (owner_tenant_id, canonical_slug) do update set
    content_type = 'article',
    workflow_status = 'published',
    visibility = 'catalog',
    scheduled_at = null,
    paused_at = null,
    archived_at = null,
    updated_by = 'demo-operator',
    updated_at = now(),
    is_demo = true;

  insert into public.content_revisions (
    id, content_item_id, revision_number, title, subtitle, slug_snapshot,
    body_json, body_text, seo_title, seo_description, medical_review_status,
    word_count, created_by, approved_by, approved_at, change_summary, is_demo
  ) values (
    revision_id,
    item_id,
    1,
    analysis_title,
    analysis_subtitle,
    'revolucao-canetas-emagrecedoras',
    jsonb_build_object(
      'type', 'doc',
      'seed_code', 'BRS-ANA-002',
      'editorial_origin', jsonb_build_object(
        'kind', 'authorized-real',
        'source_label', 'Material editorial fornecido',
        'source_published_at', published_at,
        'external_only', false,
        'briefing_order', 17,
        'authorization_reference', 'cliente-validacao-2026-08-12'
      ),
      'demo_media', jsonb_build_object(
        'mode', 'fallback',
        'fallback_path', '/images/editorial/2026-07/inovacao-medica.webp',
        'alt', 'Composição editorial sobre inovação farmacêutica e medicamentos.',
        'credit', 'Imagem editorial do acervo da plataforma.',
        'rights_basis', 'owned-platform-asset'
      ),
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'text', 'O mercado de canetas emagrecedoras deve explodir no Brasil nos próximos quatro anos e superar de longe a taxa de crescimento da venda do medicamento no mundo. A alta incidência de obesidade na população, somada ao forte culto do brasileiro ao corpo, além da queda de preços do remédio por conta da quebra das patentes, vão turbinar as vendas.'
        ),
        jsonb_build_object('type', 'heading', 'level', 2, 'text', 'Estilo de vida'),
        jsonb_build_object(
          'type', 'paragraph',
          'text', 'No comportamento e estilo de vida, com a disseminação global das canetas emagrecedoras e a tendência de maior consumo de proteína, o preço da matéria-prima do whey protein disparou. Nos últimos 12 meses, a alta é de 105%, com a tonelada do concentrado de whey com 80% de teor proteico (WPC 80) atingindo € 22 mil (cerca de R$ 128 mil) na União Europeia nas duas primeiras semanas de maio — não há um dado consolidado para o Brasil, pois há poucos fabricantes no País —, de acordo com a rede de serviços financeiros StoneX.'
        ),
        jsonb_build_object('type', 'heading', 'level', 2, 'text', 'Benefício corporativo'),
        jsonb_build_object(
          'type', 'paragraph',
          'text', 'Depois de começar a mudar os hábitos de compra dos brasileiros e pressionar a indústria de alimentos e os supermercados, as canetas emagrecedoras estão chegando aos departamentos de Recursos Humanos (RH) das empresas. O medicamento de alto valor unitário, usado para tratar obesidade, começa a constar na lista de benefícios concedidos aos funcionários por algumas companhias.'
        )
      )
    ),
    analysis_body,
    analysis_title,
    analysis_subtitle,
    'not_required',
    cardinality(regexp_split_to_array(trim(analysis_body), '\s+')),
    'demo-operator',
    'demo-operator',
    published_at,
    'Nova análise autorizada pelo cliente e adicionada sem substituir pautas existentes.',
    true
  )
  on conflict (content_item_id, revision_number) do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    body_json = excluded.body_json,
    body_text = excluded.body_text,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    word_count = excluded.word_count,
    approved_by = excluded.approved_by,
    approved_at = excluded.approved_at,
    change_summary = excluded.change_summary,
    is_demo = true;

  update public.content_items
  set
    current_published_revision_id = revision_id,
    workflow_status = 'published',
    updated_by = 'demo-operator',
    updated_at = now()
  where id = item_id and owner_tenant_id = abrafarma_id;

  insert into public.content_revision_authors (
    content_revision_id, author_id, byline_order
  ) values (revision_id, author_id, 1)
  on conflict (content_revision_id, author_id) do update set byline_order = 1;

  insert into public.content_revision_categories (
    content_revision_id, category_id, is_primary
  ) values (revision_id, analysis_category_id, true)
  on conflict (content_revision_id, category_id) do update set is_primary = true;

  insert into public.distributions (
    id, content_item_id, tenant_id, status, starts_at, channels, rights_code,
    contract_reference, allow_full_body, allow_media, created_by, approved_by,
    is_demo
  )
  select
    md5('broadcast-saude:distribution:BRS-ANA-002:' || target.slug)::uuid,
    item_id,
    target.id,
    'active',
    published_at,
    array['portal']::text[],
    'authorized-real',
    'CLIENTE-VALIDACAO-2026-08-12',
    true,
    true,
    'demo-operator',
    'demo-operator',
    true
  from public.tenants target
  where target.id in (abrafarma_id, broadcast_saude_id)
  on conflict (content_item_id, tenant_id) do update set
    status = 'active',
    starts_at = excluded.starts_at,
    ends_at = null,
    channels = array['portal']::text[],
    rights_code = excluded.rights_code,
    contract_reference = excluded.contract_reference,
    allow_full_body = true,
    allow_media = true,
    approved_by = 'demo-operator',
    is_demo = true,
    updated_at = now();

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id,
    before_json, after_json, reason, is_demo
  )
  select
    md5('broadcast-saude:audit:BRS-ANA-002:' || target.slug)::uuid,
    target.id,
    'demo-operator',
    'content.created',
    'content_item',
    item_id,
    '{}'::jsonb,
    jsonb_build_object(
      'title', analysis_title,
      'category', 'analise',
      'distribution_status', 'active'
    ),
    'Nova análise sobre canetas emagrecedoras autorizada pelo cliente em 12/08/2026.',
    true
  from public.tenants target
  where target.id in (abrafarma_id, broadcast_saude_id)
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.apply_weight_loss_pens_analysis()
from public, anon, authenticated, service_role;

comment on function private.apply_weight_loss_pens_analysis() is
  'Restaura de forma idempotente a análise autorizada sobre canetas emagrecedoras sem substituir pautas existentes.';

select private.apply_weight_loss_pens_analysis();
