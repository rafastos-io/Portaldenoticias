create or replace function private.apply_broadcast_saude_catalog()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  abrafarma_id constant uuid := '00000000-0000-4000-8000-000000000004';
  broadcast_saude_id constant uuid := '00000000-0000-4000-8000-000000000006';
  platform_id constant uuid := '00000000-0000-4000-8000-000000000001';
  previous_default_id uuid;
  previous_default_revision bigint;
begin
  update public.tenants
  set
    slug = 'abrafarma',
    display_name = 'Abrafarma',
    settings_json = jsonb_build_object(
      'slogan', 'Aqui você fica por dentro da saúde',
      'segment', 'saúde e indústria farmacêutica',
      'fallback_image', '/images/editorial/2026-07/industria-farmaceutica.webp',
      'content_policy', 'authorized-real-validation'
    ),
    updated_at = now(),
    archived_at = null
  where id = abrafarma_id;

  if not found then
    raise exception 'Abrafarma source tenant is unavailable';
  end if;

  insert into public.tenants (
    id, slug, display_name, kind, status, settings_json, is_demo
  )
  values (
    broadcast_saude_id,
    'broadcast-saude',
    'Broadcast Saúde',
    'demo',
    'demo',
    jsonb_build_object(
      'slogan', 'Informação estratégica para o setor de saúde',
      'segment', 'saúde e indústria farmacêutica',
      'fallback_image', '/images/editorial/2026-07/saude-digital.webp',
      'content_policy', 'authorized-real-validation'
    ),
    true
  )
  on conflict (id) do update set
    slug = excluded.slug,
    display_name = excluded.display_name,
    kind = excluded.kind,
    status = excluded.status,
    settings_json = excluded.settings_json,
    is_demo = true,
    updated_at = now(),
    archived_at = null;

  insert into public.categories (
    id, owner_tenant_id, name, slug, description, status, is_demo
  )
  values
    (md5('broadcast-saude:category:empresas')::uuid, platform_id, 'Empresas', 'empresas', 'Resultados, estratégia e movimentações empresariais do setor de saúde.', 'active', true),
    (md5('broadcast-saude:category:m-a')::uuid, platform_id, 'M&A', 'm-a', 'Fusões, aquisições e reorganizações societárias em saúde.', 'active', true),
    (md5('broadcast-saude:category:relgov')::uuid, platform_id, 'RelGov', 'relgov', 'Relações governamentais e políticas públicas com impacto no setor.', 'active', true),
    (md5('broadcast-saude:category:investimentos')::uuid, platform_id, 'Investimentos', 'investimentos', 'Financiamentos, expansão produtiva e alocação de capital em saúde.', 'active', true),
    (md5('broadcast-saude:category:regulacao')::uuid, platform_id, 'Regulação', 'regulacao', 'Decisões regulatórias e seus efeitos sobre empresas e pacientes.', 'active', true),
    (md5('broadcast-saude:category:pesquisa')::uuid, platform_id, 'Pesquisa', 'pesquisa', 'Pesquisa científica, ensaios e novas frentes terapêuticas.', 'active', true),
    (md5('broadcast-saude:category:ti')::uuid, platform_id, 'TI', 'ti', 'Tecnologia, inteligência artificial e infraestrutura digital em saúde.', 'active', true),
    (md5('broadcast-saude:category:analise')::uuid, platform_id, 'Análise', 'analise', 'Leituras estruturais e econômicas sobre o setor de saúde.', 'active', true),
    (md5('broadcast-saude:category:radar-da-imprensa')::uuid, platform_id, 'Radar da Imprensa', 'radar-da-imprensa', 'Seleção de notícias e movimentos acompanhados pela imprensa.', 'active', true)
  on conflict (owner_tenant_id, slug) do update set
    name = excluded.name,
    description = excluded.description,
    status = 'active',
    is_demo = true,
    updated_at = now();

  insert into public.authors (
    id, owner_tenant_id, slug, display_name, bio, specialties, status, is_demo
  )
  values
    (md5('broadcast-saude:author:wilian-miron')::uuid, platform_id, 'wilian-miron', 'Wilian Miron', 'Autoria informada no material editorial autorizado para validação.', array['saúde', 'empresas'], 'active', true),
    (md5('broadcast-saude:author:isabella-pugliese-vellani')::uuid, platform_id, 'isabella-pugliese-vellani', 'Isabella Pugliese Vellani*', 'Autoria informada no material editorial autorizado para validação.', array['saúde', 'empresas'], 'active', true),
    (md5('broadcast-saude:author:sergio-caldas')::uuid, platform_id, 'sergio-caldas', 'Sergio Caldas*', 'Autoria informada no material editorial autorizado para validação.', array['saúde', 'M&A'], 'active', true),
    (md5('broadcast-saude:author:redacao-ae-news')::uuid, platform_id, 'redacao-ae-news', 'AE NEWS', 'Crédito editorial informado no material autorizado para validação.', array['saúde'], 'active', true),
    (md5('broadcast-saude:author:denise-luna')::uuid, platform_id, 'denise-luna', 'Denise Luna', 'Autoria informada no material editorial autorizado para validação.', array['saúde', 'investimentos'], 'active', true),
    (md5('broadcast-saude:author:bianca-bibiano')::uuid, platform_id, 'bianca-bibiano', 'Bianca Bibiano', 'Autoria indicada na fonte externa referenciada pelo briefing.', array['pesquisa'], 'active', true),
    (md5('broadcast-saude:author:redacao-viva')::uuid, platform_id, 'redacao-viva', 'Viva', 'Fonte externa indicada pelo briefing editorial.', array['pesquisa'], 'active', true),
    (md5('broadcast-saude:author:joyce-canele')::uuid, platform_id, 'joyce-canele', 'Joyce Canele', 'Autoria indicada na fonte externa referenciada pelo briefing.', array['pesquisa'], 'active', true),
    (md5('broadcast-saude:author:financial-times')::uuid, platform_id, 'financial-times', 'Financial Times', 'Fonte creditada no Radar da Imprensa.', array['empresas', 'M&A'], 'active', true)
  on conflict (owner_tenant_id, slug) do update set
    display_name = excluded.display_name,
    bio = excluded.bio,
    specialties = excluded.specialties,
    status = 'active',
    is_demo = true,
    updated_at = now();

  update public.themes
  set name = 'Abrafarma editorial', status = 'published', updated_at = now()
  where tenant_id = abrafarma_id;

  update public.theme_versions version
  set
    schema_version = 2,
    components_json = jsonb_build_object(
      'header', 'masthead-minimal',
      'hero', 'science-feature',
      'card', 'data-led',
      'site_model', 'health-pharma'
    ),
    navigation_json = jsonb_build_array(
      'Início', 'Empresas', 'M&A', 'RelGov', 'Investimentos', 'Regulação',
      'Pesquisa', 'TI', 'Análise', 'Radar da Imprensa'
    ),
    brand_json = jsonb_build_object(
      'display_name', 'Abrafarma',
      'slogan', 'Aqui você fica por dentro da saúde',
      'logo_mode', 'wordmark'
    ),
    change_summary = 'Identidade Abrafarma preservada e editorias reais de saúde adotadas.'
  from public.themes theme
  where theme.tenant_id = abrafarma_id
    and version.theme_id = theme.id
    and version.id = theme.published_version_id;

  insert into public.themes (id, tenant_id, name, status, is_demo)
  values (
    '60000000-0000-4000-8000-000000000006',
    broadcast_saude_id,
    'Broadcast Saúde editorial',
    'published',
    true
  )
  on conflict (id) do update set
    tenant_id = excluded.tenant_id,
    name = excluded.name,
    status = 'published',
    is_demo = true,
    updated_at = now();

  insert into public.theme_versions (
    id, theme_id, version_number, schema_version, tokens_json,
    components_json, navigation_json, brand_json, created_by,
    published_by, published_at, change_summary, is_demo
  )
  values (
    '61000000-0000-4000-8000-000000000006',
    '60000000-0000-4000-8000-000000000006',
    1,
    2,
    '{"primary":"#0B4A5A","secondary":"#1F7A8C","accent":"#D9912B","background":"#F7F9F8","text":"#15272C","font":"sans-editorial"}',
    '{"header":"masthead-minimal","hero":"science-feature","card":"data-led","site_model":"health-pharma"}',
    '["Início","Empresas","M&A","RelGov","Investimentos","Regulação","Pesquisa","TI","Análise","Radar da Imprensa"]',
    '{"display_name":"Broadcast Saúde","slogan":"Informação estratégica para o setor de saúde","logo_mode":"wordmark"}',
    'demo-operator',
    'demo-operator',
    timestamptz '2026-08-09 12:00:00-03',
    'Nova marca de validação derivada do ecossistema editorial de saúde.',
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
    published_version_id = '61000000-0000-4000-8000-000000000006',
    draft_version_id = '61000000-0000-4000-8000-000000000006',
    status = 'published',
    updated_at = now()
  where id = '60000000-0000-4000-8000-000000000006';

  create temporary table if not exists broadcast_saude_articles (
    ordinal integer primary key,
    code text not null unique,
    category_slug text not null,
    slug text not null unique,
    title text not null,
    subtitle text not null,
    body_text text not null,
    author_slug text not null,
    source_label text not null,
    source_url text,
    source_published_at timestamptz,
    external_only boolean not null,
    image_file text not null,
    image_alt text not null
  ) on commit drop;

  truncate table pg_temp.broadcast_saude_articles;

  insert into pg_temp.broadcast_saude_articles values
    (1, 'BRS-EMP-001', 'empresas', 'biomm-lucro-liquido-1tri26', 'BIOMM TEM LUCRO LÍQUIDO DE R$ 9,7 MI NO 1TRI26, REVERTENDO PREJUÍZO DE R$ 11,7 MI NO 1TRI25', 'São Paulo, 15/05/2026 - A farmacêutica Biomm registrou lucro líquido de R$ 9,7 milhões no primeiro trimestre de 2026, revertendo prejuízo de R$ 11,7 milhões observado um ano antes.', 'São Paulo, 15/05/2026 - A farmacêutica Biomm registrou lucro líquido de R$ 9,7 milhões no primeiro trimestre de 2026, revertendo prejuízo de R$ 11,7 milhões observado um ano antes.', 'wilian-miron', 'AE NEWS', null, timestamptz '2026-05-15 18:40:06-03', false, 'industria-farmaceutica.webp', 'Linha de produção da indústria farmacêutica.'),
    (2, 'BRS-EMP-002', 'empresas', 'novo-nordisk-eleva-projecao-wegovy-comprimido', 'NOVO NORDISK ELEVA PROJEÇÃO APÓS LANÇAMENTO BEM-SUCEDIDO DO WEGOVY EM COMPRIMIDO', 'São Paulo, 06/05/2026 - A Novo Nordisk, farmacêutica dinamarquesa, elevou sua previsão de vendas para o ano todo devido à crescente demanda por seu novo comprimido para perda de peso.', 'São Paulo, 06/05/2026 - A Novo Nordisk, farmacêutica dinamarquesa, elevou sua previsão de vendas para o ano todo devido à crescente demanda por seu novo comprimido para perda de peso. Segundo a empresa, o total de prescrições do Wegovy em comprimido atingiu cerca de 1,3 milhão no primeiro trimestre e já supera a casa de 2 milhões desde o lançamento.', 'isabella-pugliese-vellani', 'AE NEWS', null, timestamptz '2026-05-06 10:48:49-03', false, 'industria-farmaceutica.webp', 'Instalação contemporânea da indústria farmacêutica.'),
    (3, 'BRS-MA-001', 'm-a', 'novartis-compra-myricx-bio', 'NOVARTIS ACERTA COMPRA DA MYRICX BIO POR ATÉ US$ 1,5 BILHÃO; AÇÃO CAI EM ZURIQUE', 'São Paulo, 06/07/2026 - A Novartis acertou a compra da Myricx Bio por até US$ 1,5 bilhão, em uma movimentação para reforçar seu portfólio diante da forte concorrência do setor por medicamentos oncológicos.', 'São Paulo, 06/07/2026 - A Novartis acertou a compra da Myricx Bio por até US$ 1,5 bilhão, em uma movimentação para reforçar seu portfólio diante da forte concorrência do setor por medicamentos oncológicos.', 'sergio-caldas', 'AE NEWS', null, timestamptz '2026-07-06 08:28:45-03', false, 'economia-saude.webp', 'Composição editorial sobre economia e empresas de saúde.'),
    (4, 'BRS-MA-002', 'm-a', 'gsk-compra-nuvalent-oncologia', 'GSK ACERTA COMPRA DA NUVALENT POR US$ 10,6 BILHÕES PARA AMPLIAR PRESENÇA EM ONCOLOGIA', 'Londres, 09/06/2026 - A GSK informou que fechou um acordo para comprar a desenvolvedora de medicamentos contra o câncer Nuvalent por US$ 10,6 bilhões, reforçando a estratégia da farmacêutica britânica de expandir sua atuação em oncologia.', 'Londres, 09/06/2026 - A GSK informou que fechou um acordo para comprar a desenvolvedora de medicamentos contra o câncer Nuvalent por US$ 10,6 bilhões, reforçando a estratégia da farmacêutica britânica de expandir sua atuação em oncologia.', 'redacao-ae-news', 'AE NEWS', null, timestamptz '2026-06-09 06:05:03-03', false, 'industria-farmaceutica.webp', 'Ambiente de pesquisa e produção farmacêutica.'),
    (5, 'BRS-MA-003', 'm-a', 'bayer-vende-fatia-contraceptivos-apollo', 'BAYER VENDE FATIA DE 3 BILHÕES DE EUROS EM NEGÓCIO DE CONTRACEPTIVOS PARA A APOLLO', 'São Paulo, 10/07/2026 - A Bayer anunciou nesta sexta-feira um acordo para vender à gestora de ativos Apollo uma participação minoritária em seu negócio de contraceptivos reversíveis de longa duração, em operação avaliada em 3 bilhões de euros.', 'São Paulo, 10/07/2026 - A Bayer anunciou nesta sexta-feira um acordo para vender à gestora de ativos Apollo uma participação minoritária em seu negócio de contraceptivos reversíveis de longa duração, em operação avaliada em 3 bilhões de euros.', 'sergio-caldas', 'AE NEWS', null, timestamptz '2026-07-10 08:40:34-03', false, 'industria-farmaceutica.webp', 'Detalhe de operação industrial farmacêutica.'),
    (6, 'BRS-RELGOV-001', 'relgov', 'casa-branca-acordos-farmaceuticas-economia', 'AP/CASA BRANCA: ACORDOS COM FARMACÊUTICAS PODEM ECONOMIZAR US$ 529 BILHÕES NOS EUA EM 10 ANOS', 'Washington, 05/05/2026 - Economistas da Casa Branca estimam que os acordos fechados pelo governo Donald Trump com empresas farmacêuticas para reduzir alguns preços de medicamentos prescritos nos EUA ao que cobram em outros países poderiam economizar US$ 529 bilhões nos próximos 10 anos.', 'Washington, 05/05/2026 - Economistas da Casa Branca estimam que os acordos fechados pelo governo Donald Trump com empresas farmacêuticas para reduzir alguns preços de medicamentos prescritos nos EUA ao que cobram em outros países poderiam economizar US$ 529 bilhões nos próximos 10 anos.', 'redacao-ae-news', 'AE NEWS', null, timestamptz '2026-05-05 11:58:10-03', false, 'economia-saude.webp', 'Composição editorial sobre políticas públicas e economia da saúde.'),
    (7, 'BRS-INV-001', 'investimentos', 'bndes-aprova-115-mi-blanver', 'BNDES APROVA R$ 115 MI PARA BLANVER EXPANDIR PRODUÇÃO DE MEDICAMENTOS SÓLIDOS', 'Rio, 15/07/2026 - O Banco Nacional de Desenvolvimento Econômico e Social (BNDES) aprovou R$ 115 milhões para a Blanver Farmoquímica e Farmacêutica modernizar e ampliar a produção de medicamentos sólidos em sua unidade industrial de Taboão da Serra, na Grande São Paulo.', 'Rio, 15/07/2026 - O Banco Nacional de Desenvolvimento Econômico e Social (BNDES) aprovou R$ 115 milhões para a Blanver Farmoquímica e Farmacêutica modernizar e ampliar a produção de medicamentos sólidos em sua unidade industrial de Taboão da Serra, na Grande São Paulo. O financiamento foi concedido no âmbito do Plano Brasil Soberano.', 'denise-luna', 'AE NEWS', null, timestamptz '2026-07-15 11:50:51-03', false, 'industria-farmaceutica.webp', 'Estrutura industrial para produção de medicamentos.'),
    (8, 'BRS-REG-001', 'regulacao', 'anvisa-registra-caneta-ozivy', 'ANVISA REGISTRA CANETA EMAGRECEDORA OZIVY, E EMS QUER VENDER 1 MILHÃO DE UNIDADES EM UM ANO', 'São Paulo, 26/05/2026 - Após a Agência Nacional de Vigilância Sanitária (Anvisa) aprovar na manhã de hoje, 26, o registro da caneta emagrecedora Ozivy, primeira concorrente do Ozempic produzida no País, a farmacêutica EMS quer direcionar esforços para lançar o medicamento no mercado nos próximos 30 dias.', 'São Paulo, 26/05/2026 - Após a Agência Nacional de Vigilância Sanitária (Anvisa) aprovar na manhã de hoje, 26, o registro da caneta emagrecedora Ozivy, primeira concorrente do Ozempic produzida no País, a farmacêutica EMS quer direcionar esforços para lançar o medicamento no mercado nos próximos 30 dias.', 'wilian-miron', 'AE NEWS', null, timestamptz '2026-05-26 12:22:42-03', false, 'inovacao-medica.webp', 'Composição editorial sobre inovação médica e regulação.'),
    (9, 'BRS-REG-002', 'regulacao', 'cristalia-testes-remedio-overdose-intoxicacoes', 'ESTADÃO: LABORATÓRIO ANUNCIA TESTES DE REMÉDIO QUE PODERIA REVERTER OVERDOSE E INTOXICAÇÕES', 'São Paulo, 30/07/2026 - A farmacêutica brasileira Cristália anunciou nesta quinta-feira, 30, que entrará com um pedido na Agência Nacional de Vigilância Sanitária (Anvisa) para realizar testes clínicos (em humanos) de uma nova terapia em desenvolvimento para tratar quadros de overdose e intoxicação aguda por substâncias como a cocaína.', 'São Paulo, 30/07/2026 - A farmacêutica brasileira Cristália anunciou nesta quinta-feira, 30, que entrará com um pedido na Agência Nacional de Vigilância Sanitária (Anvisa) para realizar testes clínicos (em humanos) de uma nova terapia em desenvolvimento para tratar quadros de overdose e intoxicação aguda por substâncias como a cocaína. Hoje, não existe tratamento específico para reverter esse tipo de condição.', 'redacao-ae-news', 'AE NEWS', null, timestamptz '2026-07-30 22:33:41-03', false, 'pesquisa-clinica.webp', 'Equipe acompanha uma etapa de pesquisa clínica.'),
    (10, 'BRS-PES-001', 'pesquisa', 'cientistas-brasileiros-vacina-universal-malaria', 'Cientistas brasileiros avançam na criação de vacina universal para malária', '', '', 'bianca-bibiano', 'Viva', 'https://viva.com.br/saude-e-bem-estar/cientistas-avancam-na-criacao-de-vacina-universal-contra-a-malaria.html', timestamptz '2026-07-02 10:30:00-03', true, 'biotecnologia.webp', 'Pesquisadores trabalham em laboratório de biotecnologia.'),
    (11, 'BRS-PES-002', 'pesquisa', 'cientistas-editam-genes-embrioes-evitar-doencas', 'Cientistas usam nova técnica para editar genes de embriões e evitar doenças', '', '', 'redacao-viva', 'Viva', 'https://viva.com.br/saude-e-bem-estar/cientistas-usam-nova-tecnica-para-editar-genes-de-embrioes-e-evitar-doencas.html', null, true, 'medicina-precisao.webp', 'Visual editorial sobre genética e medicina de precisão.'),
    (12, 'BRS-PES-003', 'pesquisa', 'maior-estudo-remedios-alzheimer-controversia', 'MAIOR ESTUDO SOBRE REMÉDIOS PARA ALZHEIMER CAUSA CONTROVÉRSIA NA COMUNIDADE CIENTÍFICA', 'São Paulo, 06/05/2026 - Não há, atualmente, medicamentos capazes de curar o Alzheimer, responsável por mais da metade dos casos de demência e cuja incidência tem aumentado à medida que a população mundial envelhece.', 'São Paulo, 06/05/2026 - Não há, atualmente, medicamentos capazes de curar o Alzheimer, responsável por mais da metade dos casos de demência e cuja incidência tem aumentado à medida que a população mundial envelhece. Mas, no último ano, foram aprovados os primeiros remédios de uma categoria chamada de antiamiloides. Essas drogas são as primeiras a modificar o curso biológico da doença, retardando sua progressão. Um estudo recém-publicado sobre esses medicamentos, porém, causou polêmica na comunidade científica, dividindo a opinião de especialistas.', 'redacao-ae-news', 'AE NEWS', null, timestamptz '2026-05-06 22:33:44-03', false, 'pesquisa-clinica.webp', 'Pesquisa clínica representada em ambiente científico.'),
    (13, 'BRS-PES-004', 'pesquisa', 'nova-estrategia-frear-avanco-alzheimer', 'Estudo revela nova estratégia que pode frear o avanço do Alzheimer', '', '', 'joyce-canele', 'Viva', 'https://viva.com.br/saude-e-bem-estar/estudo-revela-nova-estrategia-que-pode-frear-o-avanco-do-alzheimer.html', timestamptz '2025-11-30 11:29:00-03', true, 'medicina-precisao.webp', 'Composição editorial sobre pesquisa em doenças neurodegenerativas.'),
    (14, 'BRS-TI-001', 'ti', 'afya-crescimento-tecnologia-servicos-saude', 'AFYA VÊ ESPAÇO PARA CRESCIMENTO EM TECNOLOGIA E SERVIÇOS PARA SAÚDE', 'São Paulo, 25/05/2026 - A Afya quer ampliar sua atuação para além do ensino médico e acelerar o crescimento de um ambiente digital voltado à rotina dos profissionais de saúde.', 'São Paulo, 25/05/2026 - A Afya quer ampliar sua atuação para além do ensino médico e acelerar o crescimento de um ambiente digital voltado à rotina dos profissionais de saúde. A estratégia combina plataformas de educação continuada, softwares para consultórios, suporte à decisão clínica e ferramentas de inteligência artificial (IA), em uma frente que a companhia vê como uma das principais avenidas de expansão nos próximos anos.', 'wilian-miron', 'AE NEWS', null, timestamptz '2026-05-25 13:25:00-03', false, 'saude-digital.webp', 'Profissional acompanha soluções digitais aplicadas à saúde.'),
    (15, 'BRS-ANA-001', 'analise', 'btg-setor-saude-transicao-estrutural', 'BTG PACTUAL: SETOR DE SAÚDE PASSA POR MOMENTO DE TRANSIÇÃO ESTRUTURAL', 'São Paulo, 29/04/2026 - O setor de saúde no Brasil vive um momento de transição estrutural em que será necessário equilibrar acesso, custos e inovação, avalia o BTG Pactual.', 'São Paulo, 29/04/2026 - O setor de saúde no Brasil vive um momento de transição estrutural em que será necessário equilibrar acesso, custos e inovação, avalia o BTG Pactual. Segundo o banco, a discussão entre executivos, reguladores e especialistas aponta que o modelo atual enfrenta pressões relevantes, como aumento de custos, judicialização e limitações regulatórias, exigindo mudanças mais profundas para garantir sustentabilidade no longo prazo.', 'wilian-miron', 'AE NEWS', null, timestamptz '2026-04-29 11:11:27-03', false, 'economia-saude.webp', 'Composição editorial sobre economia e sustentabilidade do setor de saúde.'),
    (16, 'BRS-RAD-001', 'radar-da-imprensa', 'radar-astrazeneca-bristol-fusao', 'RADAR DA IMPRENSA: ASTRAZENECA E BRISTOL NEGOCIAM FUSÃO QUE PODE CRIAR GIGANTE DE US$ 400 BI', 'Financial Times - A gigante farmacêutica britânica AstraZeneca estuda uma fusão com sua concorrente americana Bristol Myers Squibb, em uma operação que avaliaria a empresa resultante em cerca de US$ 400 bilhões.', 'Financial Times - A gigante farmacêutica britânica AstraZeneca estuda uma fusão com sua concorrente americana Bristol Myers Squibb, em uma operação que avaliaria a empresa resultante em cerca de US$ 400 bilhões. Ainda não está claro se o negócio será concretizado, mas as empresas vêm discutindo uma fusão nos últimos meses, segundo fontes. A fusão seria uma das maiores da história. Procuradas, a AstraZeneca e a Bristol Myers Squibb não comentaram.', 'financial-times', 'Financial Times', null, timestamptz '2026-08-02 17:10:54-03', false, 'industria-farmaceutica.webp', 'Composição editorial sobre empresas globais da indústria farmacêutica.');

  update public.distributions distribution
  set
    status = 'draft',
    approved_by = null,
    updated_at = now()
  where distribution.tenant_id = abrafarma_id
    and distribution.content_item_id <> (
      select item.id
      from public.content_items item
      where item.owner_tenant_id = abrafarma_id
        and item.canonical_slug = 'ia-saude-segunda-leitura'
    );

  update public.content_items item
  set
    workflow_status = 'draft',
    scheduled_at = null,
    paused_at = null,
    updated_by = 'demo-operator',
    updated_at = now()
  where item.owner_tenant_id = abrafarma_id
    and item.canonical_slug <> 'ia-saude-segunda-leitura'
    and not exists (
      select 1
      from pg_temp.broadcast_saude_articles article
      where article.slug = item.canonical_slug
    );

  insert into public.content_items (
    id, owner_tenant_id, canonical_slug, content_type, workflow_status,
    visibility, first_published_at, last_published_at, created_by, updated_by,
    is_demo
  )
  select
    md5('broadcast-saude:item:' || article.code)::uuid,
    abrafarma_id,
    article.slug,
    'article',
    'published',
    'catalog',
    coalesce(article.source_published_at, timestamptz '2026-08-09 12:00:00-03'),
    coalesce(article.source_published_at, timestamptz '2026-08-09 12:00:00-03'),
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.broadcast_saude_articles article
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
    md5('broadcast-saude:revision:' || article.code)::uuid,
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
        'source_published_at', article.source_published_at,
        'external_only', article.external_only,
        'briefing_order', article.ordinal,
        'authorization_reference', 'cliente-validacao-2026-08-09'
      )),
      'demo_media', jsonb_build_object(
        'mode', 'fallback',
        'fallback_path', '/images/editorial/2026-07/' || article.image_file,
        'alt', article.image_alt,
        'credit', 'Imagem editorial do acervo da plataforma.',
        'rights_basis', 'owned-platform-asset'
      ),
      'content', case
        when article.external_only then '[]'::jsonb
        else jsonb_build_array(jsonb_build_object('type', 'paragraph', 'text', article.body_text))
      end
    ),
    article.body_text,
    article.title,
    nullif(article.subtitle, ''),
    'not_required',
    case
      when article.body_text = '' then 0
      else cardinality(regexp_split_to_array(trim(article.body_text), '\s+'))
    end,
    'demo-operator',
    'demo-operator',
    timestamptz '2026-08-09 12:00:00-03',
    'Conteúdo real autorizado para validação; texto preservado conforme o briefing.',
    true
  from pg_temp.broadcast_saude_articles article
  join public.content_items item
    on item.owner_tenant_id = abrafarma_id
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
  from pg_temp.broadcast_saude_articles article
  join public.content_items selected_item
    on selected_item.owner_tenant_id = abrafarma_id
   and selected_item.canonical_slug = article.slug
  join public.content_revisions revision
    on revision.content_item_id = selected_item.id
   and revision.revision_number = 1
  where item.id = selected_item.id;

  delete from public.content_revision_authors link
  using pg_temp.broadcast_saude_articles article,
        public.content_items item,
        public.content_revisions revision
  where item.owner_tenant_id = abrafarma_id
    and item.canonical_slug = article.slug
    and revision.content_item_id = item.id
    and revision.revision_number = 1
    and link.content_revision_id = revision.id;

  insert into public.content_revision_authors (
    content_revision_id, author_id, byline_order
  )
  select
    revision.id,
    author.id,
    1
  from pg_temp.broadcast_saude_articles article
  join public.content_items item
    on item.owner_tenant_id = abrafarma_id
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
  using pg_temp.broadcast_saude_articles article,
        public.content_items item,
        public.content_revisions revision
  where item.owner_tenant_id = abrafarma_id
    and item.canonical_slug = article.slug
    and revision.content_item_id = item.id
    and revision.revision_number = 1
    and link.content_revision_id = revision.id;

  insert into public.content_revision_categories (
    content_revision_id, category_id, is_primary
  )
  select
    revision.id,
    category.id,
    true
  from pg_temp.broadcast_saude_articles article
  join public.content_items item
    on item.owner_tenant_id = abrafarma_id
   and item.canonical_slug = article.slug
  join public.content_revisions revision
    on revision.content_item_id = item.id
   and revision.revision_number = 1
  join public.categories category
    on category.owner_tenant_id = platform_id
   and category.slug = article.category_slug
  on conflict (content_revision_id, category_id) do update set
    is_primary = true;

  delete from public.content_revision_categories link
  using public.content_items item
  where item.owner_tenant_id = abrafarma_id
    and item.canonical_slug = 'ia-saude-segunda-leitura'
    and link.content_revision_id = item.current_published_revision_id;

  insert into public.content_revision_categories (
    content_revision_id, category_id, is_primary
  )
  select
    item.current_published_revision_id,
    category.id,
    true
  from public.content_items item
  join public.categories category
    on category.owner_tenant_id = platform_id
   and category.slug = 'ti'
  where item.owner_tenant_id = abrafarma_id
    and item.canonical_slug = 'ia-saude-segunda-leitura'
    and item.current_published_revision_id is not null
  on conflict (content_revision_id, category_id) do update set
    is_primary = true;

  insert into public.distributions (
    id, content_item_id, tenant_id, status, starts_at, channels, rights_code,
    contract_reference, allow_full_body, allow_media, created_by, approved_by,
    is_demo
  )
  select
    md5('broadcast-saude:distribution:' || article.code || ':' || target.slug)::uuid,
    item.id,
    target.id,
    'active',
    item.first_published_at,
    array['portal']::text[],
    'authorized-real',
    'CLIENTE-VALIDACAO-2026-08-09',
    not article.external_only,
    true,
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.broadcast_saude_articles article
  join public.content_items item
    on item.owner_tenant_id = abrafarma_id
   and item.canonical_slug = article.slug
  join public.tenants target
    on target.id in (abrafarma_id, broadcast_saude_id)
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
    allow_media = true,
    approved_by = 'demo-operator',
    is_demo = true,
    updated_at = now();

  insert into public.distributions (
    id, content_item_id, tenant_id, status, starts_at, channels, rights_code,
    contract_reference, allow_full_body, allow_media, created_by, approved_by,
    is_demo
  )
  select
    md5('broadcast-saude:distribution:retained-ai:' || target.slug)::uuid,
    item.id,
    target.id,
    'active',
    item.first_published_at,
    array['portal']::text[],
    case when target.id = abrafarma_id then 'demo-owner' else 'demo-cross' end,
    'BROADCAST-SAUDE-RETAINED-AI',
    true,
    true,
    'demo-operator',
    'demo-operator',
    true
  from public.content_items item
  join public.tenants target
    on target.id in (abrafarma_id, broadcast_saude_id)
  where item.owner_tenant_id = abrafarma_id
    and item.canonical_slug = 'ia-saude-segunda-leitura'
  on conflict (content_item_id, tenant_id) do update set
    status = 'active',
    ends_at = null,
    channels = array['portal']::text[],
    approved_by = 'demo-operator',
    updated_at = now();

  insert into public.placements (
    id, tenant_id, slot_key, content_item_id, starts_at, rank,
    presentation_variant, eyebrow_override, status, is_demo
  )
  select
    md5('broadcast-saude:placement:' || target.slug || ':hero')::uuid,
    target.id,
    'home.hero',
    item.id,
    item.first_published_at,
    0,
    'hero',
    'Inteligência artificial',
    'active',
    true
  from public.content_items item
  join public.tenants target
    on target.id in (abrafarma_id, broadcast_saude_id)
  where item.owner_tenant_id = abrafarma_id
    and item.canonical_slug = 'ia-saude-segunda-leitura'
  on conflict (tenant_id, slot_key, rank) do update set
    content_item_id = excluded.content_item_id,
    starts_at = excluded.starts_at,
    ends_at = null,
    presentation_variant = 'hero',
    eyebrow_override = excluded.eyebrow_override,
    status = 'active',
    is_demo = true,
    updated_at = now();

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
      (0, 'BRS-EMP-001', 'featured', 'Empresas'),
      (1, 'BRS-EMP-002', 'standard', 'Empresas'),
      (2, 'BRS-MA-001', 'standard', 'M&A')
  ) as placement(rank, code, variant, eyebrow)
  join pg_temp.broadcast_saude_articles article
    on article.code = placement.code
  join public.content_items item
    on item.owner_tenant_id = abrafarma_id
   and item.canonical_slug = article.slug
  join public.tenants target
    on target.id in (abrafarma_id, broadcast_saude_id)
  on conflict (tenant_id, slot_key, rank) do update set
    content_item_id = excluded.content_item_id,
    starts_at = excluded.starts_at,
    ends_at = null,
    presentation_variant = excluded.presentation_variant,
    eyebrow_override = excluded.eyebrow_override,
    status = 'active',
    is_demo = true,
    updated_at = now();

  select default_tenant_id, revision
  into previous_default_id, previous_default_revision
  from public.demo_portal_settings
  where setting_key = 'public-home'
  for update;

  if previous_default_id is distinct from abrafarma_id then
    update public.demo_portal_settings
    set
      default_tenant_id = abrafarma_id,
      revision = revision + 1,
      updated_by = 'demo-operator',
      updated_at = now()
    where setting_key = 'public-home';

    insert into public.audit_events (
      id, tenant_id, actor_id, action, target_type, target_id,
      before_json, after_json, reason, is_demo
    )
    values (
      md5('broadcast-saude:audit:default-abrafarma')::uuid,
      abrafarma_id,
      'demo-operator',
      'portal.default_changed',
      'tenant',
      abrafarma_id,
      jsonb_build_object(
        'default_tenant_id', previous_default_id,
        'revision', previous_default_revision
      ),
      jsonb_build_object(
        'default_tenant_id', abrafarma_id,
        'revision', previous_default_revision + 1
      ),
      'Abrafarma definida como portal padrão da etapa de validação.',
      true
    )
    on conflict (id) do nothing;
  end if;

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  values
    (
      md5('broadcast-saude:audit:tenant-created')::uuid,
      broadcast_saude_id,
      'demo-operator',
      'tenant.created',
      'tenant',
      broadcast_saude_id,
      jsonb_build_object('slug', 'broadcast-saude', 'site_model', 'health-pharma'),
      'Broadcast Saúde cadastrado como nova marca do ecossistema de saúde.',
      true
    ),
    (
      md5('broadcast-saude:audit:catalog-published')::uuid,
      abrafarma_id,
      'demo-operator',
      'content.catalog_published',
      'tenant',
      abrafarma_id,
      jsonb_build_object(
        'authorized_real_items', 16,
        'external_only_items', 3,
        'distributed_tenants', jsonb_build_array('abrafarma', 'broadcast-saude')
      ),
      'Catálogo real autorizado publicado com fidelidade ao briefing e fontes registradas.',
      true
    )
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.apply_broadcast_saude_catalog()
from public, anon, authenticated, service_role;

comment on function private.apply_broadcast_saude_catalog() is
  'Restaura de forma idempotente Abrafarma, Broadcast Saúde e o catálogo real autorizado da validação.';

select private.apply_broadcast_saude_catalog();
