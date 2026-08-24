-- Expansão solicitada para a validação BV Educação.
-- Sete títulos da jornada permanecem como placeholders explícitos até o envio
-- do texto definitivo. Os três vídeos persistem somente metadados e links.

create or replace function private.apply_bv_credit_journey_and_expert_categories()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  platform_id constant uuid := '00000000-0000-4000-8000-000000000001';
  bv_tenant_id uuid;
  credit_target_count integer;
begin
  select tenant.id into bv_tenant_id
  from public.tenants tenant
  where tenant.slug = 'bv-educacao'
    and tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo = true
    and tenant.archived_at is null;

  if bv_tenant_id is null then
    raise exception 'BV Educação não está disponível para receber a expansão';
  end if;

  create temporary table if not exists bv_credit_addition_targets (
    id uuid primary key,
    slug text not null unique
  ) on commit drop;
  truncate table pg_temp.bv_credit_addition_targets;

  insert into pg_temp.bv_credit_addition_targets (id, slug)
  select tenant.id, tenant.slug
  from public.tenants tenant
  join public.themes theme on theme.tenant_id = tenant.id
  join public.theme_versions version on version.id = theme.published_version_id
  where tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo = true
    and tenant.archived_at is null
    and version.components_json ->> 'site_model' = 'financial-services-credit';

  select count(*) into credit_target_count
  from pg_temp.bv_credit_addition_targets;

  if credit_target_count < 2
     or not exists (
       select 1
       from pg_temp.bv_credit_addition_targets
       where id = bv_tenant_id
     ) then
    raise exception 'Padrão de crédito incompleto para a expansão BV';
  end if;

  insert into public.categories (
    id, owner_tenant_id, name, slug, description, status, is_demo
  )
  values
    (
      md5('bv-credit:category:jornada-de-credito-bv')::uuid,
      platform_id,
      'Jornada de crédito BV',
      'jornada-de-credito-bv',
      'Uma sequência prática para avaliar, contratar, acompanhar e concluir decisões de crédito.',
      'active',
      true
    ),
    (
      md5('bv-credit:category:especialista-responde')::uuid,
      platform_id,
      'Especialista responde',
      'especialista-responde',
      'Vídeos e podcasts com especialistas respondendo dúvidas sobre economia, crédito e finanças.',
      'active',
      true
    )
  on conflict (owner_tenant_id, slug) do update set
    name = excluded.name,
    description = excluded.description,
    status = 'active',
    is_demo = true,
    updated_at = now();

  create temporary table if not exists bv_credit_additions (
    ordinal integer primary key,
    category_order integer not null,
    code text not null unique,
    category_slug text not null,
    slug text not null unique,
    title text not null,
    subtitle text not null,
    body_text text not null,
    body_blocks jsonb not null,
    author_slug text not null,
    author_name text not null,
    source_label text not null,
    source_url text,
    external_only boolean not null,
    is_placeholder boolean not null,
    image_file text,
    image_alt text not null
  ) on commit drop;
  truncate table pg_temp.bv_credit_additions;

  insert into pg_temp.bv_credit_additions values
    (
      1, 1, 'BV-JC-001', 'jornada-de-credito-bv',
      'o-que-cabe-no-meu-bolso-sem-comprometer-meu-orcamento',
      'O que cabe no meu bolso sem comprometer meu orçamento',
      'Primeira etapa da Jornada de crédito BV. O conteúdo completo será anexado em breve.',
      'Conteúdo em preparação. Esta pauta abre a Jornada de crédito BV com a avaliação do valor que cabe no orçamento. O material completo será anexado assim que a versão editorial for fornecida e aprovada.',
      '[{"type":"paragraph","text":"Conteúdo em preparação. Esta pauta abre a Jornada de crédito BV com a avaliação do valor que cabe no orçamento. O material completo será anexado assim que a versão editorial for fornecida e aprovada."}]'::jsonb,
      'equipe-bv-educacao', 'Equipe BV Educação', 'Briefing BV Educação', null,
      false, true, 'planejamento-financeiro.webp',
      'Pessoa organiza o orçamento antes de iniciar uma jornada de crédito.'
    ),
    (
      2, 2, 'BV-JC-002', 'jornada-de-credito-bv',
      'como-minha-renda-influencia-no-financiamento',
      'Como minha renda influencia no financiamento',
      'Segunda etapa da Jornada de crédito BV. O conteúdo completo será anexado em breve.',
      'Conteúdo em preparação. Esta etapa explicará como a renda participa da análise e do planejamento de um financiamento. O material completo será anexado assim que a versão editorial for fornecida e aprovada.',
      '[{"type":"paragraph","text":"Conteúdo em preparação. Esta etapa explicará como a renda participa da análise e do planejamento de um financiamento. O material completo será anexado assim que a versão editorial for fornecida e aprovada."}]'::jsonb,
      'equipe-bv-educacao', 'Equipe BV Educação', 'Briefing BV Educação', null,
      false, true, 'planejamento-financeiro.webp',
      'Pessoa compara renda e parcelas antes de contratar um financiamento.'
    ),
    (
      3, 3, 'BV-JC-003', 'jornada-de-credito-bv',
      'como-escolher-a-modalidade-que-se-encaixa-no-meu-orcamento',
      'Como escolher a melhor modalidade e a que se encaixa no meu orçamento',
      'Terceira etapa da Jornada de crédito BV. O conteúdo completo será anexado em breve.',
      'Conteúdo em preparação. Esta etapa comparará modalidades de crédito e sua adequação ao orçamento. O material completo será anexado assim que a versão editorial for fornecida e aprovada.',
      '[{"type":"paragraph","text":"Conteúdo em preparação. Esta etapa comparará modalidades de crédito e sua adequação ao orçamento. O material completo será anexado assim que a versão editorial for fornecida e aprovada."}]'::jsonb,
      'equipe-bv-educacao', 'Equipe BV Educação', 'Briefing BV Educação', null,
      false, true, 'planejamento-financeiro.webp',
      'Pessoa compara alternativas de crédito adequadas ao seu orçamento.'
    ),
    (
      4, 4, 'BV-JC-004', 'jornada-de-credito-bv',
      'atrasei-uma-prestacao-o-que-faco',
      'Atrasei uma prestação, o que faço?',
      'Quarta etapa da Jornada de crédito BV. O conteúdo completo será anexado em breve.',
      'Conteúdo em preparação. Esta etapa orientará os primeiros passos após o atraso de uma prestação. O material completo será anexado assim que a versão editorial for fornecida e aprovada.',
      '[{"type":"paragraph","text":"Conteúdo em preparação. Esta etapa orientará os primeiros passos após o atraso de uma prestação. O material completo será anexado assim que a versão editorial for fornecida e aprovada."}]'::jsonb,
      'equipe-bv-educacao', 'Equipe BV Educação', 'Briefing BV Educação', null,
      false, true, 'planejamento-financeiro.webp',
      'Pessoa revisa uma prestação em atraso e organiza os próximos passos.'
    ),
    (
      5, 5, 'BV-JC-005', 'jornada-de-credito-bv',
      'perdi-o-emprego-consigo-pular-parcelas-da-divida',
      'Perdi o emprego, será que consigo pular uma ou duas parcelas da dívida?',
      'Quinta etapa da Jornada de crédito BV. O conteúdo completo será anexado em breve.',
      'Conteúdo em preparação. Esta etapa abordará alternativas diante da perda de renda e da dificuldade temporária para pagar parcelas. O material completo será anexado assim que a versão editorial for fornecida e aprovada.',
      '[{"type":"paragraph","text":"Conteúdo em preparação. Esta etapa abordará alternativas diante da perda de renda e da dificuldade temporária para pagar parcelas. O material completo será anexado assim que a versão editorial for fornecida e aprovada."}]'::jsonb,
      'equipe-bv-educacao', 'Equipe BV Educação', 'Briefing BV Educação', null,
      false, true, 'planejamento-financeiro.webp',
      'Pessoa reorganiza as finanças após uma mudança inesperada de renda.'
    ),
    (
      6, 6, 'BV-JC-006', 'jornada-de-credito-bv',
      'ficou-dificil-e-preciso-renegociar-quais-sao-as-opcoes',
      'Ficou difícil e preciso renegociar, quais são as opções?',
      'Sexta etapa da Jornada de crédito BV. O conteúdo completo será anexado em breve.',
      'Conteúdo em preparação. Esta etapa apresentará caminhos de renegociação quando o pagamento ficar difícil. O material completo será anexado assim que a versão editorial for fornecida e aprovada.',
      '[{"type":"paragraph","text":"Conteúdo em preparação. Esta etapa apresentará caminhos de renegociação quando o pagamento ficar difícil. O material completo será anexado assim que a versão editorial for fornecida e aprovada."}]'::jsonb,
      'equipe-bv-educacao', 'Equipe BV Educação', 'Briefing BV Educação', null,
      false, true, 'planejamento-financeiro.webp',
      'Pessoa analisa opções para renegociar uma dívida.'
    ),
    (
      7, 7, 'BV-JC-007', 'jornada-de-credito-bv',
      'quitei-meu-credito-e-vou-comprar-meu-primeiro-carro',
      'Quitei meu crédito, juntei dinheiro para a entrada e vou comprar meu primeiro carro',
      'Sétima etapa da Jornada de crédito BV. O conteúdo completo será anexado em breve.',
      'Conteúdo em preparação. Esta etapa encerra a jornada com a quitação do crédito, a formação da entrada e o planejamento da compra do primeiro carro. O material completo será anexado assim que a versão editorial for fornecida e aprovada.',
      '[{"type":"paragraph","text":"Conteúdo em preparação. Esta etapa encerra a jornada com a quitação do crédito, a formação da entrada e o planejamento da compra do primeiro carro. O material completo será anexado assim que a versão editorial for fornecida e aprovada."}]'::jsonb,
      'equipe-bv-educacao', 'Equipe BV Educação', 'Briefing BV Educação', null,
      false, true, 'planejamento-financeiro.webp',
      'Pessoa se prepara para comprar o primeiro carro após organizar o crédito.'
    ),
    (
      8, 1, 'BV-ER-001', 'especialista-responde',
      'economia-em-5-minutos-278-novidades-da-inflacao',
      'Economia em 5 Minutos #278 – As últimas novidades da inflação',
      'Vídeo do banco BV apresenta as principais novidades sobre a inflação.',
      '', '[]'::jsonb,
      'banco-bv', 'banco BV', 'banco BV — YouTube',
      'https://www.youtube.com/watch?v=Q1mu0J9j7r4&list=PL1ZW4ym5qfGhBh-e036bS_ynSHZano3Wv&index=150',
      true, false, null, 'Vídeo externo do banco BV sobre as novidades da inflação.'
    ),
    (
      9, 2, 'BV-ER-002', 'especialista-responde',
      'bolsa-de-valores-brasileira-economia-em-5-minutos-277',
      'A bolsa de valores brasileira – Economia em 5min #277 | banco BV',
      'Vídeo do banco BV explica conceitos e movimentos da bolsa de valores brasileira.',
      '', '[]'::jsonb,
      'banco-bv', 'banco BV', 'banco BV — YouTube',
      'https://www.youtube.com/watch?v=-xGwpUrzBGE&list=PL1ZW4ym5qfGhBh-e036bS_ynSHZano3Wv&index=149',
      true, false, null, 'Vídeo externo do banco BV sobre a bolsa de valores brasileira.'
    ),
    (
      10, 3, 'BV-ER-003', 'especialista-responde',
      'taxa-de-juros-brasileira-economia-em-5-minutos-276',
      'A taxa de juros brasileira – Economia em 5min #276 | banco BV',
      'Vídeo do banco BV explica o papel da taxa de juros brasileira na economia.',
      '', '[]'::jsonb,
      'banco-bv', 'banco BV', 'banco BV — YouTube',
      'https://www.youtube.com/watch?v=0o4UolvxSWY&list=PL1ZW4ym5qfGhBh-e036bS_ynSHZano3Wv&index=148',
      true, false, null, 'Vídeo externo do banco BV sobre a taxa de juros brasileira.'
    );

  if (select count(*) from pg_temp.bv_credit_additions) <> 10 then
    raise exception 'Expansão BV incompleta: esperados 10 conteúdos';
  end if;

  insert into public.authors (
    id, owner_tenant_id, slug, display_name, bio, specialties, status, is_demo
  )
  select distinct on (article.author_slug)
    md5('bv-credit:addition:author:' || article.author_slug)::uuid,
    platform_id,
    article.author_slug,
    article.author_name,
    case
      when article.author_slug = 'banco-bv'
        then 'Autoria indicada nos vídeos externos fornecidos para a validação BV Educação.'
      else 'Identificação provisória para pautas cujo conteúdo definitivo ainda será anexado.'
    end,
    array['educação financeira']::text[],
    'active',
    true
  from pg_temp.bv_credit_additions article
  order by article.author_slug, article.ordinal
  on conflict (owner_tenant_id, slug) do update set
    display_name = excluded.display_name,
    bio = excluded.bio,
    specialties = excluded.specialties,
    status = 'active',
    is_demo = true,
    updated_at = now();

  insert into public.content_items (
    id, owner_tenant_id, canonical_slug, content_type, workflow_status,
    visibility, first_published_at, last_published_at, created_by, updated_by,
    is_demo
  )
  select
    md5('bv-credit:addition:item:' || article.code)::uuid,
    platform_id,
    article.slug,
    'article',
    'published',
    'catalog',
    timestamptz '2026-01-15 12:00:00-03'
      - ((article.ordinal - 1) * interval '1 minute'),
    timestamptz '2026-01-15 12:00:00-03'
      - ((article.ordinal - 1) * interval '1 minute'),
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.bv_credit_additions article
  on conflict (owner_tenant_id, canonical_slug) do update set
    content_type = 'article',
    workflow_status = 'published',
    visibility = 'catalog',
    first_published_at = excluded.first_published_at,
    last_published_at = excluded.last_published_at,
    scheduled_at = null,
    paused_at = null,
    archived_at = null,
    updated_by = 'demo-operator',
    is_demo = true,
    updated_at = now();

  insert into public.content_revisions (
    id, content_item_id, revision_number, title, subtitle, slug_snapshot,
    body_json, body_text, seo_title, seo_description, medical_review_status,
    word_count, created_by, approved_by, approved_at, change_summary, is_demo
  )
  select
    md5('bv-credit:addition:revision:' || article.code)::uuid,
    item.id,
    1,
    article.title,
    article.subtitle,
    article.slug,
    jsonb_build_object(
      'type', 'doc',
      'seed_code', article.code,
      'editorial_origin', jsonb_strip_nulls(jsonb_build_object(
        'kind', 'authorized-real',
        'source_label', article.source_label,
        'source_url', article.source_url,
        'external_only', article.external_only,
        'briefing_order', article.category_order,
        'authorization_reference', 'CLIENTE-VALIDACAO-BV-2026-08-23',
        'content_status', case
          when article.is_placeholder then 'placeholder-awaiting-copy'
          else 'external-video'
        end
      )),
      'demo_media', case
        when article.external_only then jsonb_build_object(
          'mode', 'none',
          'alt', article.image_alt,
          'credit', article.source_label,
          'rights_basis', 'external-link-only'
        )
        else jsonb_build_object(
          'mode', 'fallback',
          'fallback_path', '/images/editorial/2026-07/' || article.image_file,
          'alt', article.image_alt,
          'credit', 'Imagem editorial do acervo da plataforma.',
          'rights_basis', 'owned-platform-asset'
        )
      end,
      'content', article.body_blocks
    ),
    article.body_text,
    article.title,
    article.subtitle,
    'not_required',
    case
      when article.body_text = '' then 0
      else cardinality(regexp_split_to_array(trim(article.body_text), '\s+'))
    end,
    'demo-operator',
    'demo-operator',
    timestamptz '2026-08-23 21:00:00-03',
    case
      when article.is_placeholder
        then 'Pauta autorizada como placeholder; conteúdo definitivo ainda não fornecido.'
      else 'Referência externa autorizada; vídeo, thumbnail e transcrição não foram copiados.'
    end,
    true
  from pg_temp.bv_credit_additions article
  join public.content_items item
    on item.owner_tenant_id = platform_id
   and item.canonical_slug = article.slug
  on conflict (content_item_id, revision_number) do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    slug_snapshot = excluded.slug_snapshot,
    body_json = excluded.body_json,
    body_text = excluded.body_text,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    medical_review_status = excluded.medical_review_status,
    word_count = excluded.word_count,
    approved_by = excluded.approved_by,
    approved_at = excluded.approved_at,
    change_summary = excluded.change_summary,
    is_demo = true;

  update public.content_items item
  set
    current_published_revision_id = revision.id,
    workflow_status = 'published',
    updated_at = now()
  from pg_temp.bv_credit_additions article
  join public.content_items selected_item
    on selected_item.owner_tenant_id = platform_id
   and selected_item.canonical_slug = article.slug
  join public.content_revisions revision
    on revision.content_item_id = selected_item.id
   and revision.revision_number = 1
  where item.id = selected_item.id;

  delete from public.content_revision_authors link
  using pg_temp.bv_credit_additions article,
        public.content_items item,
        public.content_revisions revision
  where item.owner_tenant_id = platform_id
    and item.canonical_slug = article.slug
    and revision.content_item_id = item.id
    and revision.revision_number = 1
    and link.content_revision_id = revision.id;

  insert into public.content_revision_authors (
    content_revision_id, author_id, byline_order
  )
  select revision.id, author.id, 1
  from pg_temp.bv_credit_additions article
  join public.content_items item
    on item.owner_tenant_id = platform_id
   and item.canonical_slug = article.slug
  join public.content_revisions revision
    on revision.content_item_id = item.id
   and revision.revision_number = 1
  join public.authors author
    on author.owner_tenant_id = platform_id
   and author.slug = article.author_slug
  on conflict (content_revision_id, author_id) do update set
    byline_order = excluded.byline_order;

  delete from public.content_revision_categories link
  using pg_temp.bv_credit_additions article,
        public.content_items item,
        public.content_revisions revision
  where item.owner_tenant_id = platform_id
    and item.canonical_slug = article.slug
    and revision.content_item_id = item.id
    and revision.revision_number = 1
    and link.content_revision_id = revision.id;

  insert into public.content_revision_categories (
    content_revision_id, category_id, is_primary
  )
  select revision.id, category.id, true
  from pg_temp.bv_credit_additions article
  join public.content_items item
    on item.owner_tenant_id = platform_id
   and item.canonical_slug = article.slug
  join public.content_revisions revision
    on revision.content_item_id = item.id
   and revision.revision_number = 1
  join public.categories category
    on category.owner_tenant_id = platform_id
   and category.slug = article.category_slug
  on conflict (content_revision_id, category_id) do update set
    is_primary = true;

  insert into public.distributions (
    id, content_item_id, tenant_id, status, starts_at, channels, rights_code,
    contract_reference, allow_full_body, allow_media, created_by, approved_by,
    is_demo
  )
  select
    md5('bv-credit:addition:distribution:' || article.code || ':' || target.slug)::uuid,
    item.id,
    target.id,
    'active',
    item.first_published_at,
    array['portal']::text[],
    'authorized-real',
    'CLIENTE-VALIDACAO-BV-2026-08-23',
    not article.external_only,
    not article.external_only,
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.bv_credit_additions article
  join public.content_items item
    on item.owner_tenant_id = platform_id
   and item.canonical_slug = article.slug
  cross join pg_temp.bv_credit_addition_targets target
  on conflict (content_item_id, tenant_id) do update set
    status = 'active',
    starts_at = excluded.starts_at,
    ends_at = null,
    channels = array['portal']::text[],
    headline_override = null,
    subtitle_override = null,
    slug_override = null,
    category_override_id = null,
    rights_code = excluded.rights_code,
    contract_reference = excluded.contract_reference,
    allow_full_body = excluded.allow_full_body,
    allow_media = excluded.allow_media,
    approved_by = 'demo-operator',
    is_demo = true,
    updated_at = now();

  update public.theme_versions version
  set
    navigation_json = jsonb_build_array(
      'Início',
      'Indicadores',
      'Investimentos',
      'Alerta de golpes',
      'Programando o futuro',
      'Isso ou aquilo',
      'Saia das dívidas',
      'Alívio no orçamento',
      'Guias',
      'Dicas valiosas',
      'Jornada de crédito BV',
      'Especialista responde',
      'Glossário'
    ),
    change_summary = 'Navegação de crédito ampliada com jornada e respostas de especialistas.'
  from public.themes theme
  join pg_temp.bv_credit_addition_targets target on target.id = theme.tenant_id
  where version.id = theme.published_version_id;

  update public.tenants tenant
  set
    settings_json = tenant.settings_json || jsonb_build_object(
      'credit_journey_reference', 'CLIENTE-VALIDACAO-BV-2026-08-23'
    ),
    updated_at = now()
  from pg_temp.bv_credit_addition_targets target
  where tenant.id = target.id;

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  select
    md5('bv-credit:addition:audit:' || target.slug)::uuid,
    target.id,
    'demo-operator',
    'content.catalog_expanded',
    'tenant',
    target.id,
    jsonb_build_object(
      'authorized_items', 10,
      'placeholder_items', 7,
      'external_only_items', 3,
      'categories_added', 2,
      'catalog_reference', 'CLIENTE-VALIDACAO-BV-2026-08-23'
    ),
    'Jornada de crédito BV e Especialista responde adicionados ao padrão de crédito.',
    true
  from pg_temp.bv_credit_addition_targets target
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.apply_bv_credit_journey_and_expert_categories()
from public, anon, authenticated, service_role;

comment on function private.apply_bv_credit_journey_and_expert_categories() is
  'Restaura de forma idempotente a jornada de crédito e os vídeos de especialistas do catálogo BV.';

select private.apply_bv_credit_journey_and_expert_categories();
