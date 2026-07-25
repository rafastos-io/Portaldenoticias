-- Catálogo integralmente fictício do MVP-0.
-- Este arquivo é idempotente: UUIDs fixos e UPSERT restauram o estado canônico.

insert into public.tenants (
  id, slug, display_name, kind, status, settings_json, is_demo
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'broadcast-saude-longevidade',
    'Broadcast Saúde & Longevidade',
    'platform',
    'demo',
    '{"slogan":"Conteúdo fictício para decisões sobre vidas mais longas","fallback_image":"/images/editorial-hero-demo.png"}',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'banco-demo-horizonte',
    'Banco Demo Horizonte',
    'demo',
    'demo',
    '{"slogan":"Planejamento para vidas mais longas","segment":"banco/gestora","fallback_image":"/images/editorial-hero-demo.png"}',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'seguros-demo-atlas',
    'Seguros Demo Atlas',
    'demo',
    'demo',
    '{"slogan":"Proteção que acompanha cada fase","segment":"seguros/previdência","fallback_image":"/images/editorial-hero-demo.png"}',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    'healthtech-demo-lumen',
    'Healthtech Demo Lúmen',
    'demo',
    'demo',
    '{"slogan":"Ciência para ampliar futuros","segment":"healthtech/biotecnologia","fallback_image":"/images/editorial-hero-demo.png"}',
    true
  )
on conflict (id) do update set
  slug = excluded.slug,
  display_name = excluded.display_name,
  kind = excluded.kind,
  status = excluded.status,
  settings_json = excluded.settings_json,
  is_demo = excluded.is_demo,
  updated_at = now(),
  archived_at = null;

insert into public.authors (
  id, owner_tenant_id, slug, display_name, bio, specialties, is_demo
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'marina-vale',
    'Marina Vale',
    'Perfil fictício criado para demonstrar a cobertura de economia da longevidade.',
    array['economia da longevidade'],
    true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001',
    'caio-nobre',
    'Caio Nobre',
    'Perfil fictício criado para demonstrar a cobertura de seguros e previdência.',
    array['seguros', 'previdência'],
    true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000001',
    'livia-sanches',
    'Lívia Sanches',
    'Perfil fictício criado para demonstrar a cobertura de inovação em saúde.',
    array['inovação em saúde'],
    true
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000001',
    'bruno-teles',
    'Bruno Teles',
    'Perfil fictício criado para demonstrar a cobertura de ciência e biotecnologia.',
    array['ciência', 'biotecnologia'],
    true
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    '00000000-0000-4000-8000-000000000001',
    'helena-prado',
    'Helena Prado',
    'Perfil fictício criado para demonstrar a cobertura de trabalho e sociedade.',
    array['trabalho', 'sociedade'],
    true
  )
on conflict (id) do update set
  owner_tenant_id = excluded.owner_tenant_id,
  slug = excluded.slug,
  display_name = excluded.display_name,
  bio = excluded.bio,
  specialties = excluded.specialties,
  status = 'active',
  is_demo = true,
  updated_at = now();

insert into public.categories (
  id, owner_tenant_id, name, slug, description, is_demo
)
values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Longevidade & Economia', 'longevidade-e-economia', 'Impactos econômicos e sociais de vidas mais longas.', true),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Previdência & Seguros', 'previdencia-e-seguros', 'Proteção e planejamento ao longo da vida.', true),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Inovação Médica', 'inovacao-medica', 'Tecnologias e modelos para organizar o cuidado.', true),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Biotecnologia', 'biotecnologia', 'Pesquisa, desenvolvimento e estratégia de inovação.', true),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'Trabalho & Gerações', 'trabalho-e-geracoes', 'Carreiras, equipes e relações entre gerações.', true),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'Saúde & Regulação', 'saude-e-regulacao', 'Governança, transparência e acesso em saúde.', true)
on conflict (id) do update set
  owner_tenant_id = excluded.owner_tenant_id,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  status = 'active',
  is_demo = true,
  updated_at = now();

insert into public.tags (
  id, owner_tenant_id, name, slug, is_demo
)
values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'economia prateada', 'economia-prateada', true),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'planejamento financeiro', 'planejamento-financeiro', true),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'previdência', 'previdencia', true),
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'seguros', 'seguros', true),
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'prevenção', 'prevencao', true),
  ('30000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'cuidado', 'cuidado', true),
  ('30000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000001', 'IA em saúde', 'ia-em-saude', true),
  ('30000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000001', 'biotecnologia', 'biotecnologia', true),
  ('30000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000001', 'inovação', 'inovacao', true),
  ('30000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'regulação', 'regulacao', true),
  ('30000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'gerações', 'geracoes', true),
  ('30000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'futuro do trabalho', 'futuro-do-trabalho', true)
on conflict (id) do update set
  owner_tenant_id = excluded.owner_tenant_id,
  name = excluded.name,
  slug = excluded.slug,
  status = 'active',
  is_demo = true,
  updated_at = now();

insert into public.themes (
  id, tenant_id, name, status, is_demo
)
values
  ('60000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Horizonte editorial', 'published', true),
  ('60000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', 'Atlas acolhedor', 'published', true),
  ('60000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', 'Lúmen ciência', 'published', true)
on conflict (id) do update set
  tenant_id = excluded.tenant_id,
  name = excluded.name,
  status = excluded.status,
  is_demo = true,
  updated_at = now();

insert into public.theme_versions (
  id, theme_id, version_number, schema_version, tokens_json,
  components_json, navigation_json, brand_json, created_by,
  published_by, published_at, change_summary, is_demo
)
values
  (
    '61000000-0000-4000-8000-000000000002',
    '60000000-0000-4000-8000-000000000002',
    1,
    1,
    '{"primary":"#12324A","secondary":"#2F80A3","accent":"#C7A35A","background":"#F5F7F8","text":"#14232D","font":"sans-editorial"}',
    '{"header":"masthead-clean","hero":"split-editorial","card":"image-top"}',
    '["Início","Longevidade & Economia","Previdência & Seguros","Trabalho & Gerações"]',
    '{"display_name":"Banco Demo Horizonte","slogan":"Planejamento para vidas mais longas","logo_mode":"wordmark"}',
    'demo-operator',
    'demo-operator',
    '2026-07-01T12:00:00Z',
    'Tema fictício inicial do Banco Demo Horizonte.',
    true
  ),
  (
    '61000000-0000-4000-8000-000000000003',
    '60000000-0000-4000-8000-000000000003',
    1,
    1,
    '{"primary":"#174A47","secondary":"#C9B99A","accent":"#D66B5D","background":"#FAF8F3","text":"#18302F","font":"sans-humana"}',
    '{"header":"brand-centered","hero":"featured-grid","card":"compact-horizontal"}',
    '["Início","Previdência & Seguros","Saúde & Regulação","Trabalho & Gerações"]',
    '{"display_name":"Seguros Demo Atlas","slogan":"Proteção que acompanha cada fase","logo_mode":"wordmark"}',
    'demo-operator',
    'demo-operator',
    '2026-07-01T12:00:00Z',
    'Tema fictício inicial da Seguros Demo Atlas.',
    true
  ),
  (
    '61000000-0000-4000-8000-000000000004',
    '60000000-0000-4000-8000-000000000004',
    1,
    1,
    '{"primary":"#4A2E78","secondary":"#20A4B8","accent":"#8ED1C9","background":"#F6F5FA","text":"#222033","font":"sans-geometrica"}',
    '{"header":"masthead-minimal","hero":"science-feature","card":"data-led"}',
    '["Início","Inovação Médica","Biotecnologia","Saúde & Regulação"]',
    '{"display_name":"Healthtech Demo Lúmen","slogan":"Ciência para ampliar futuros","logo_mode":"wordmark"}',
    'demo-operator',
    'demo-operator',
    '2026-07-01T12:00:00Z',
    'Tema fictício inicial da Healthtech Demo Lúmen.',
    true
  )
on conflict (id) do update set
  theme_id = excluded.theme_id,
  version_number = excluded.version_number,
  schema_version = excluded.schema_version,
  tokens_json = excluded.tokens_json,
  components_json = excluded.components_json,
  navigation_json = excluded.navigation_json,
  brand_json = excluded.brand_json,
  published_by = excluded.published_by,
  published_at = excluded.published_at,
  change_summary = excluded.change_summary,
  is_demo = true;

update public.themes
set
  published_version_id = case tenant_id
    when '00000000-0000-4000-8000-000000000002' then '61000000-0000-4000-8000-000000000002'::uuid
    when '00000000-0000-4000-8000-000000000003' then '61000000-0000-4000-8000-000000000003'::uuid
    when '00000000-0000-4000-8000-000000000004' then '61000000-0000-4000-8000-000000000004'::uuid
  end,
  draft_version_id = null,
  updated_at = now()
where tenant_id in (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000004'
);

create temporary table seed_articles (
  ordinal integer primary key,
  seed_code text not null,
  tenant_id uuid not null,
  slug text not null,
  title text not null,
  subtitle text not null,
  angle text not null,
  category_id uuid not null,
  author_id uuid not null,
  tag_a_id uuid not null,
  tag_b_id uuid not null,
  editorial_case text not null
) on commit drop;

insert into seed_articles values
  (1, 'DEMO-001', '00000000-0000-4000-8000-000000000002', 'longevidade-amplia-horizonte-planejamento-financeiro', 'Longevidade amplia o horizonte do planejamento financeiro', 'Cenários de vida mais longa mudam perguntas sobre reserva, renda e proteção patrimonial.', 'Em vez de uma data final, o planejamento passa a considerar transições, pausas e novos projetos ao longo de várias décadas.', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'published'),
  (2, 'DEMO-002', '00000000-0000-4000-8000-000000000002', 'planejamento-em-ciclos-substitui-aposentadoria-unica', 'Planejamento em ciclos substitui a antiga ideia de aposentadoria única', 'Modelo demonstrativo organiza decisões financeiras em diferentes fases da vida adulta.', 'A organização por ciclos ajuda a tornar visíveis necessidades de liquidez, proteção e aprendizado sem sugerir um produto financeiro.', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', 'published'),
  (3, 'DEMO-003', '00000000-0000-4000-8000-000000000002', 'economia-prateada-novas-frentes-servicos-financeiros', 'Economia prateada cria novas frentes para serviços financeiros', 'Produtos fictícios ilustram como instituições podem atender necessidades de consumidores maduros.', 'Autonomia digital, linguagem clara e atendimento híbrido aparecem como capacidades de serviço, não como promessas de retorno.', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000009', 'published'),
  (4, 'DEMO-004', '00000000-0000-4000-8000-000000000002', 'carreiras-mais-longas-estrategias-renda', 'Carreiras mais longas pedem novas estratégias de renda', 'Educação continuada e transições profissionais entram no planejamento de longo prazo.', 'O cenário reúne trabalho por projetos, atualização de competências e períodos de cuidado como partes possíveis de uma mesma trajetória.', '20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000011', 'published'),
  (5, 'DEMO-005', '00000000-0000-4000-8000-000000000002', 'papel-liquidez-plano-diferentes-fases', 'O papel da liquidez em um plano para diferentes fases da vida', 'Explicador demonstra como objetivos de curto e longo prazo podem coexistir.', 'Separar horizontes de decisão permite comparar prioridades sem transformar o conteúdo em recomendação individual.', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', 'published'),
  (6, 'DEMO-006', '00000000-0000-4000-8000-000000000002', 'custos-cuidado-conversas-patrimoniais', 'Custos de cuidado ganham espaço nas conversas patrimoniais', 'Conteúdo fictício mostra por que saúde e patrimônio aparecem no mesmo planejamento.', 'Mapear redes de apoio, moradia e tempo disponível ajuda famílias demonstrativas a enxergar custos que não cabem em uma única planilha.', '20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000002', 'published'),
  (7, 'DEMO-007', '00000000-0000-4000-8000-000000000002', 'moradia-mobilidade-agenda-longevidade', 'Moradia e mobilidade entram na agenda da longevidade', 'Serviços financeiros observam novas necessidades de adaptação e autonomia.', 'Decisões sobre localização, acessibilidade e deslocamento podem mudar com o tempo e exigem coordenação entre diferentes serviços.', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000006', 'published'),
  (8, 'DEMO-008', '00000000-0000-4000-8000-000000000002', 'tres-perguntas-revisar-plano-longo-prazo', 'Três perguntas para revisar um plano de longo prazo', 'Conteúdo patrocinado fictício propõe uma revisão periódica sem recomendar produtos.', 'A peça demonstra como separar objetivo, prazo e capacidade de adaptação em uma conversa comercial claramente identificada.', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', 'sponsored'),
  (9, 'DEMO-009', '00000000-0000-4000-8000-000000000003', 'protecao-por-fases-novos-desenhos-seguro', 'Proteção por fases inspira novos desenhos de seguro', 'Jornada demonstrativa acompanha mudanças de família, trabalho e cuidado.', 'O exercício editorial mostra que coberturas precisam ser explicadas no contexto de eventos de vida e revistas quando o contexto muda.', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000006', 'published'),
  (10, 'DEMO-010', '00000000-0000-4000-8000-000000000003', 'prevencao-autonomia-conversa-protecao', 'Prevenção e autonomia redesenham a conversa sobre proteção', 'Modelo editorial aproxima longevidade, hábitos e planejamento sem orientação clínica.', 'A pauta evita prescrever condutas e concentra-se em como serviços podem apoiar informação, acompanhamento e escolhas conscientes.', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000004', 'published'),
  (11, 'DEMO-011', '00000000-0000-4000-8000-000000000003', 'coordenacao-cuidado-tema-estrategico-seguradoras', 'Coordenação de cuidado vira tema estratégico para seguradoras', 'Cenário fictício explora integração de serviços e experiência do beneficiário.', 'Uma jornada bem coordenada depende de contexto compartilhado, consentimento e pontos claros de contato, sem prometer resultado clínico.', '20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000010', 'published'),
  (12, 'DEMO-012', '00000000-0000-4000-8000-000000000003', 'beneficios-flexiveis-equipes-multigeracionais', 'Benefícios flexíveis ganham relevância em equipes multigeracionais', 'Empresas demonstrativas consideram necessidades diferentes ao longo da carreira.', 'Flexibilidade não significa ausência de regra: critérios transparentes e comunicação acessível ajudam a equilibrar opções e previsibilidade.', '20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000012', 'published'),
  (13, 'DEMO-013', '00000000-0000-4000-8000-000000000003', 'explicar-cobertura-carencia-clareza', 'Como explicar cobertura e carência com mais clareza', 'Design de informação pode tornar jornadas de seguro menos complexas.', 'Exemplos, hierarquia visual e comparação de cenários reduzem ambiguidade sem ocultar condições ou transformar explicação em promessa.', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000010', 'published'),
  (14, 'DEMO-014', '00000000-0000-4000-8000-000000000003', 'cuidadores-radar-servicos-apoio', 'Cuidadores entram no radar de novos serviços de apoio', 'Conteúdo fictício observa tempo, renda e redes de suporte sem prometer assistência.', 'O cuidado produz impactos na rotina de quem recebe e de quem oferece apoio, o que pede linguagem respeitosa e visão de rede.', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000011', 'published'),
  (15, 'DEMO-015', '00000000-0000-4000-8000-000000000003', 'projeto-demo-jornada-integrada-prevencao', 'Projeto demonstrativo testa jornada integrada de prevenção', 'Matéria propositalmente pausada para validar os estados do CMS e do portal.', 'O conteúdo permanece persistido, mas sua distribuição é interrompida para demonstrar o comportamento de pausa e retomada.', '20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000006', 'paused'),
  (16, 'DEMO-016', '00000000-0000-4000-8000-000000000003', 'especial-caminhos-conversar-protecao-familiar', 'Especial: caminhos para conversar sobre proteção familiar', 'Conteúdo patrocinado fictício, claramente rotulado, testa regras de apresentação.', 'A narrativa comercial usa perguntas abertas e indica seu caráter demonstrativo, sem associar a peça a produto ou empresa real.', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000006', 'sponsored'),
  (17, 'DEMO-017', '00000000-0000-4000-8000-000000000004', 'ia-saude-apoio-organizacao-clinica', 'IA em saúde avança como ferramenta de apoio à organização clínica', 'Cenário fictício destaca supervisão humana, qualidade dos dados e limites de uso.', 'A tecnologia é apresentada como suporte a fluxos e revisão, nunca como substituta de decisão profissional ou como dispositivo real.', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000009', 'published'),
  (18, 'DEMO-018', '00000000-0000-4000-8000-000000000004', 'biotecnologia-laboratorio-estrategia-negocios', 'Biotecnologia aproxima laboratório e estratégia de negócios', 'Explicador demonstra etapas de pesquisa sem atribuir descobertas a instituições reais.', 'Hipótese, validação, desenvolvimento e governança aparecem como etapas conectadas, com incerteza explícita em cada decisão.', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000009', 'published'),
  (19, 'DEMO-019', '00000000-0000-4000-8000-000000000004', 'interoperabilidade-peca-central-inovacao-saude', 'Interoperabilidade se torna peça central da inovação em saúde', 'Sistemas demonstrativos precisam trocar informações com segurança e contexto.', 'Padrões técnicos só produzem valor quando identidade, consentimento e significado dos dados acompanham o intercâmbio.', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000010', 'published'),
  (20, 'DEMO-020', '00000000-0000-4000-8000-000000000004', 'regulacao-jornadas-digitais-cuidado', 'Regulação acompanha novas jornadas digitais de cuidado', 'Conteúdo fictício explora transparência, consentimento e responsabilidade.', 'A governança precisa deixar claro quem decide, quais dados circulam e como uma pessoa pode contestar ou retirar permissões.', '20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000009', 'published'),
  (21, 'DEMO-021', '00000000-0000-4000-8000-000000000004', 'biomarcadores-conversa-prevencao', 'Biomarcadores ganham espaço na conversa sobre prevenção', 'Artigo demonstrativo explica o conceito sem diagnóstico ou promessa clínica.', 'Um marcador precisa ser entendido no contexto de sua finalidade, qualidade de medição e limites, e não como resposta isolada.', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000005', 'published'),
  (22, 'DEMO-022', '00000000-0000-4000-8000-000000000004', 'dados-sinteticos-testar-produtos-saude', 'Dados sintéticos ajudam equipes a testar produtos de saúde', 'Nota de correção fictícia valida versionamento e transparência editorial.', 'Conjuntos artificiais podem apoiar testes, mas não eliminam a necessidade de avaliar representatividade, privacidade e limitações.', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000010', 'correction'),
  (23, 'DEMO-023', '00000000-0000-4000-8000-000000000004', 'hipotese-prototipo-solucao-healthtech', 'Da hipótese ao protótipo: como nasce uma solução de healthtech', 'Draft fictício usa scheduled_at apenas para demonstrar o layout futuro, sem automação.', 'O rascunho organiza problema, evidência necessária e critérios de teste antes de propor qualquer implementação.', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000009', 'draft'),
  (24, 'DEMO-024', '00000000-0000-4000-8000-000000000004', 'especial-inovacao-responsavel-produtos-digitais-saude', 'Especial: inovação responsável em produtos digitais de saúde', 'Conteúdo patrocinado fictício testa rótulo, contraste e separação editorial.', 'A peça demonstra como comunicar benefício esperado, incerteza e responsabilidade sem promover uma solução existente.', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000010', 'sponsored');

insert into public.content_items (
  id, owner_tenant_id, canonical_slug, content_type, workflow_status,
  visibility, current_published_revision_id, first_published_at,
  last_published_at, scheduled_at, paused_at, archived_at,
  created_by, updated_by, is_demo
)
select
  ('40000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  tenant_id,
  slug,
  case when editorial_case = 'sponsored' then 'sponsored' else 'article' end,
  case
    when editorial_case = 'draft' then 'draft'
    when editorial_case = 'paused' then 'paused'
    else 'published'
  end,
  'catalog',
  null,
  case when editorial_case = 'draft' then null else '2026-06-01T12:00:00Z'::timestamptz + ((ordinal - 1) * interval '1 day') end,
  case when editorial_case = 'draft' then null else '2026-06-01T12:00:00Z'::timestamptz + ((ordinal - 1) * interval '1 day') end,
  case when editorial_case = 'draft' then '2026-08-15T12:00:00Z'::timestamptz else null end,
  case when editorial_case = 'paused' then '2026-07-10T12:00:00Z'::timestamptz else null end,
  null,
  'demo-operator',
  'demo-operator',
  true
from seed_articles
on conflict (id) do update set
  owner_tenant_id = excluded.owner_tenant_id,
  canonical_slug = excluded.canonical_slug,
  content_type = excluded.content_type,
  workflow_status = excluded.workflow_status,
  visibility = excluded.visibility,
  first_published_at = excluded.first_published_at,
  last_published_at = excluded.last_published_at,
  scheduled_at = excluded.scheduled_at,
  paused_at = excluded.paused_at,
  archived_at = excluded.archived_at,
  updated_by = excluded.updated_by,
  is_demo = true,
  updated_at = now();

with article_copy as (
  select
    article.*,
    article.subtitle || ' Este conteúdo faz parte de um ambiente demonstrativo e não oferece orientação clínica, jurídica ou financeira.' as paragraph_1,
    article.angle || ' O cenário é inteiramente fictício e serve para testar linguagem, hierarquia editorial e navegação.' as paragraph_2,
    'Na prática editorial simulada, a equipe compara alternativas, registra premissas e torna as limitações visíveis antes de publicar. O objetivo é mostrar como uma pauta sobre ' || lower(article.title) || ' pode ser tratada com contexto e responsabilidade.' as paragraph_3,
    'Para o leitor, a principal utilidade é reconhecer as perguntas envolvidas e os diferentes horizontes de decisão. Marcas, pessoas, serviços e situações citados nesta matéria são fictícios e existem apenas para apresentação do produto.' as paragraph_4
  from seed_articles article
),
revision_rows as (
  select
    *,
    paragraph_1 || E'\n\n' || paragraph_2 || E'\n\n' || paragraph_3 || E'\n\n' || paragraph_4 as complete_body
  from article_copy
)
insert into public.content_revisions (
  id, content_item_id, revision_number, title, subtitle, slug_snapshot,
  body_json, body_text, seo_title, seo_description, correction_note,
  sponsorship_label, medical_review_status, word_count, created_by,
  approved_by, approved_at, change_summary, is_demo
)
select
  ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  ('40000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  1,
  title,
  subtitle,
  slug,
  jsonb_build_object(
    'type', 'doc',
    'seed_code', seed_code,
    'demo_media', jsonb_build_object(
      'mode', case when seed_code = 'DEMO-023' then 'none' else 'fallback' end,
      'fallback_path', case when seed_code = 'DEMO-023' then null else '/images/editorial-hero-demo.png' end,
      'alt', case when seed_code = 'DEMO-023' then null else 'Composição abstrata fictícia sobre saúde e longevidade.' end
    ),
    'content', jsonb_build_array(
      jsonb_build_object('type', 'paragraph', 'text', paragraph_1),
      jsonb_build_object('type', 'paragraph', 'text', paragraph_2),
      jsonb_build_object('type', 'paragraph', 'text', paragraph_3),
      jsonb_build_object('type', 'paragraph', 'text', paragraph_4)
    )
  ),
  complete_body,
  title,
  subtitle,
  case when editorial_case = 'correction' then 'Correção fictícia: o texto foi ajustado para explicitar que os dados citados são sintéticos e demonstrativos.' else null end,
  case when editorial_case = 'sponsored' then 'Conteúdo patrocinado fictício' else null end,
  'not_required',
  cardinality(regexp_split_to_array(trim(complete_body), '\s+')),
  'demo-operator',
  case when editorial_case = 'draft' then null else 'demo-operator' end,
  case when editorial_case = 'draft' then null else '2026-06-01T11:00:00Z'::timestamptz + ((ordinal - 1) * interval '1 day') end,
  case
    when editorial_case = 'correction' then 'Versão demonstrativa com nota de correção.'
    when editorial_case = 'draft' then 'Rascunho demonstrativo ainda não aprovado.'
    else 'Versão demonstrativa inicial.'
  end,
  true
from revision_rows
on conflict (id) do update set
  content_item_id = excluded.content_item_id,
  revision_number = excluded.revision_number,
  title = excluded.title,
  subtitle = excluded.subtitle,
  slug_snapshot = excluded.slug_snapshot,
  body_json = excluded.body_json,
  body_text = excluded.body_text,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  correction_note = excluded.correction_note,
  sponsorship_label = excluded.sponsorship_label,
  medical_review_status = excluded.medical_review_status,
  word_count = excluded.word_count,
  approved_by = excluded.approved_by,
  approved_at = excluded.approved_at,
  change_summary = excluded.change_summary,
  is_demo = true;

update public.content_items item
set current_published_revision_id = case
  when article.editorial_case = 'draft' then null
  else ('50000000-0000-4000-8000-' || lpad(article.ordinal::text, 12, '0'))::uuid
end
from seed_articles article
where item.id = ('40000000-0000-4000-8000-' || lpad(article.ordinal::text, 12, '0'))::uuid;

delete from public.content_revision_authors
where content_revision_id in (
  select ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid
  from seed_articles
);
delete from public.content_revision_categories
where content_revision_id in (
  select ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid
  from seed_articles
);
delete from public.content_revision_tags
where content_revision_id in (
  select ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid
  from seed_articles
);

insert into public.content_revision_authors (
  content_revision_id, author_id, byline_order
)
select
  ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  author_id,
  1
from seed_articles;

insert into public.content_revision_categories (
  content_revision_id, category_id, is_primary
)
select
  ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  category_id,
  true
from seed_articles;

insert into public.content_revision_tags (content_revision_id, tag_id)
select
  ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  tag_a_id
from seed_articles
union all
select
  ('50000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  tag_b_id
from seed_articles;

insert into public.distributions (
  id, content_item_id, tenant_id, status, starts_at, ends_at,
  channels, headline_override, subtitle_override, rights_code,
  contract_reference, allow_full_body, allow_media, created_by,
  approved_by, is_demo
)
select
  ('80000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  ('40000000-0000-4000-8000-' || lpad(ordinal::text, 12, '0'))::uuid,
  tenant_id,
  case
    when editorial_case = 'draft' then 'draft'
    when editorial_case = 'paused' then 'paused'
    else 'active'
  end,
  case when editorial_case = 'draft' then null else '2026-06-01T12:00:00Z'::timestamptz + ((ordinal - 1) * interval '1 day') end,
  null,
  array['portal'],
  null,
  null,
  'demo',
  seed_code,
  true,
  true,
  'demo-operator',
  case when editorial_case = 'draft' then null else 'demo-operator' end,
  true
from seed_articles
on conflict (content_item_id, tenant_id) do update set
  status = excluded.status,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  channels = excluded.channels,
  headline_override = excluded.headline_override,
  subtitle_override = excluded.subtitle_override,
  rights_code = excluded.rights_code,
  contract_reference = excluded.contract_reference,
  allow_full_body = excluded.allow_full_body,
  allow_media = excluded.allow_media,
  approved_by = excluded.approved_by,
  is_demo = true,
  updated_at = now();

insert into public.distributions (
  id, content_item_id, tenant_id, status, starts_at, channels,
  headline_override, rights_code, contract_reference, allow_full_body,
  allow_media, created_by, approved_by, is_demo
)
values
  ('81000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'active', '2026-07-01T12:00:00Z', array['portal'], 'Planejamento financeiro para novas etapas da vida', 'demo-cross', 'DEMO-001-ATLAS', true, true, 'demo-operator', 'demo-operator', true),
  ('81000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', 'active', '2026-07-01T12:00:00Z', array['portal'], null, 'demo-cross', 'DEMO-003-ATLAS', true, true, 'demo-operator', 'demo-operator', true),
  ('81000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', 'active', '2026-07-01T12:00:00Z', array['portal'], null, 'demo-cross', 'DEMO-006-ATLAS', true, true, 'demo-operator', 'demo-operator', true),
  ('81000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000000002', 'active', '2026-07-01T12:00:00Z', array['portal'], 'IA em saúde: organização, limites e supervisão', 'demo-cross', 'DEMO-017-HORIZONTE', true, true, 'demo-operator', 'demo-operator', true),
  ('81000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000002', 'active', '2026-07-01T12:00:00Z', array['portal'], null, 'demo-cross', 'DEMO-020-HORIZONTE', true, true, 'demo-operator', 'demo-operator', true),
  ('81000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000004', 'active', '2026-07-01T12:00:00Z', array['portal'], null, 'demo-cross', 'DEMO-010-LUMEN', true, true, 'demo-operator', 'demo-operator', true),
  ('81000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000004', 'active', '2026-07-01T12:00:00Z', array['portal'], null, 'demo-cross', 'DEMO-011-LUMEN', true, true, 'demo-operator', 'demo-operator', true)
on conflict (content_item_id, tenant_id) do update set
  status = excluded.status,
  starts_at = excluded.starts_at,
  channels = excluded.channels,
  headline_override = excluded.headline_override,
  rights_code = excluded.rights_code,
  contract_reference = excluded.contract_reference,
  allow_full_body = excluded.allow_full_body,
  allow_media = excluded.allow_media,
  approved_by = excluded.approved_by,
  is_demo = true,
  updated_at = now();

insert into public.placements (
  id, tenant_id, slot_key, content_item_id, starts_at, rank,
  presentation_variant, eyebrow_override, status, is_demo
)
values
  ('90000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'home.hero', '40000000-0000-4000-8000-000000000001', '2026-07-01T12:00:00Z', 0, 'hero', 'Planejamento', 'active', true),
  ('90000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'home.secondary', '40000000-0000-4000-8000-000000000002', '2026-07-01T12:00:00Z', 0, 'featured', null, 'active', true),
  ('90000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'home.secondary', '40000000-0000-4000-8000-000000000017', '2026-07-01T12:00:00Z', 1, 'standard', 'Inovação', 'active', true),
  ('90000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003', 'home.hero', '40000000-0000-4000-8000-000000000009', '2026-07-01T12:00:00Z', 0, 'hero', 'Proteção', 'active', true),
  ('90000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000003', 'home.secondary', '40000000-0000-4000-8000-000000000010', '2026-07-01T12:00:00Z', 0, 'compact', null, 'active', true),
  ('90000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', 'home.secondary', '40000000-0000-4000-8000-000000000001', '2026-07-01T12:00:00Z', 1, 'compact', 'Planejamento', 'active', true),
  ('90000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000004', 'home.hero', '40000000-0000-4000-8000-000000000017', '2026-07-01T12:00:00Z', 0, 'hero', 'Ciência', 'active', true),
  ('90000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000004', 'home.secondary', '40000000-0000-4000-8000-000000000018', '2026-07-01T12:00:00Z', 0, 'featured', null, 'active', true),
  ('90000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000004', 'home.secondary', '40000000-0000-4000-8000-000000000010', '2026-07-01T12:00:00Z', 1, 'standard', 'Prevenção', 'active', true)
on conflict (tenant_id, slot_key, rank) do update set
  content_item_id = excluded.content_item_id,
  starts_at = excluded.starts_at,
  presentation_variant = excluded.presentation_variant,
  eyebrow_override = excluded.eyebrow_override,
  status = excluded.status,
  is_demo = true,
  updated_at = now();

with audit_tenants (
  tenant_ordinal,
  tenant_id,
  content_item_id
) as (
  values
    (2, '00000000-0000-4000-8000-000000000002'::uuid, '40000000-0000-4000-8000-000000000001'::uuid),
    (3, '00000000-0000-4000-8000-000000000003'::uuid, '40000000-0000-4000-8000-000000000009'::uuid),
    (4, '00000000-0000-4000-8000-000000000004'::uuid, '40000000-0000-4000-8000-000000000017'::uuid)
),
audit_actions (
  action_ordinal,
  action,
  before_json,
  after_json,
  reason
) as (
  values
    (1, 'content.created', null::jsonb, '{"status":"draft"}'::jsonb, 'Evento fictício de criação para demonstrar a trilha editorial.'),
    (2, 'content.edited', '{"revision":1}'::jsonb, '{"revision":2}'::jsonb, 'Evento fictício de edição para demonstrar versionamento.'),
    (3, 'content.published', '{"status":"draft"}'::jsonb, '{"status":"published"}'::jsonb, 'Evento fictício de publicação para demonstrar workflow.'),
    (4, 'content.paused', '{"status":"published"}'::jsonb, '{"status":"paused"}'::jsonb, 'Evento fictício de pausa editorial justificada.'),
    (5, 'content.resumed', '{"status":"paused"}'::jsonb, '{"status":"published"}'::jsonb, 'Evento fictício de retomada após revisão.')
)
insert into public.audit_events (
  id,
  tenant_id,
  actor_id,
  action,
  target_type,
  target_id,
  before_json,
  after_json,
  reason,
  is_demo,
  created_at
)
select
  (
    'a1000000-0000-4000-8000-' ||
    lpad((tenant_ordinal * 100 + action_ordinal)::text, 12, '0')
  )::uuid,
  tenant_id,
  'demo-operator',
  action,
  'content_item',
  content_item_id,
  before_json,
  after_json,
  reason,
  true,
  '2026-07-01T09:00:00Z'::timestamptz
    + ((tenant_ordinal - 2) * interval '1 day')
    + ((action_ordinal - 1) * interval '1 hour')
from audit_tenants
cross join audit_actions
on conflict (id) do nothing;
