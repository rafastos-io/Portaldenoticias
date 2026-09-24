-- D34: portal demonstrativo FinanciaCar ("um portal do banco BV") no modelo
-- `automotive-mobility`. Tenant novo e isolado: nenhum tenant existente,
-- incluindo `bv-educacao`, é lido ou alterado.
--
-- Conteúdo: 28 matérias FICTÍCIAS e voláteis, de propriedade do próprio tenant,
-- rotuladas como "Conteúdo demonstrativo". Serão despublicadas quando o
-- material editorial real for fornecido e autorizado.
-- Imagens: nenhuma (demo_media.mode = none); o modelo exibe o visual gráfico
-- da marca até o recebimento do pacote de fotos.

create or replace function private.apply_financiacar_demo_portal()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id constant uuid := '00000000-0000-4000-8000-000000000008';
  v_catalog_reference constant text := 'DEMO-FINANCIACAR-2026-09-23';
  v_slogan constant text := 'Um portal do banco BV para quem compra, financia e dirige';
  v_theme_id uuid;
  v_version_id uuid;
begin
  if exists (
    select 1
    from public.tenants tenant
    where tenant.slug = 'financiacar'
      and tenant.id <> v_tenant_id
  ) then
    raise exception 'Slug financiacar já pertence a outro tenant';
  end if;

  insert into public.tenants (
    id, slug, display_name, kind, status, default_locale, timezone,
    settings_json, is_demo
  )
  values (
    v_tenant_id,
    'financiacar',
    'FinanciaCar',
    'demo',
    'demo',
    'pt-BR',
    'America/Sao_Paulo',
    jsonb_build_object(
      'slogan', v_slogan,
      'segment', 'automotivo/mobilidade',
      'parent_brand', 'Banco BV',
      'content_policy', 'demo-fictional-volatile',
      'catalog_reference', v_catalog_reference,
      'catalog_references', jsonb_build_array(v_catalog_reference)
    ),
    true
  )
  on conflict (id) do update set
    slug = excluded.slug,
    display_name = excluded.display_name,
    kind = 'demo',
    status = 'demo',
    settings_json = public.tenants.settings_json || excluded.settings_json,
    is_demo = true,
    updated_at = now();

  select theme.id into v_theme_id
  from public.themes theme
  where theme.tenant_id = v_tenant_id;

  if v_theme_id is null then
    v_theme_id := md5('financiacar:theme')::uuid;
    v_version_id := md5('financiacar:theme-version:1')::uuid;

    insert into public.themes (id, tenant_id, name, status, is_demo)
    values (v_theme_id, v_tenant_id, 'FinanciaCar editorial', 'published', true);

    insert into public.theme_versions (
      id, theme_id, version_number, schema_version, tokens_json,
      components_json, navigation_json, brand_json, created_by, published_by,
      published_at, change_summary, is_demo
    )
    values (
      v_version_id,
      v_theme_id,
      1,
      2,
      jsonb_build_object(
        'primary', '#192A9A',
        'secondary', '#223AD2',
        'accent', '#31C7ED',
        'background', '#FFFFFF',
        'text', '#15191E',
        'font', 'sans-geometrica'
      ),
      public.cms_resolve_site_model_components('automotive-mobility'),
      jsonb_build_array('Início', 'Crédito', 'Concessionárias', 'Evite Acidentes', 'Raridade', 'Ruas e Avenidas', 'Estradas', 'Serviços e Manutenção', 'Ainda terei um carro assim', 'Área do Piloto'),
      jsonb_build_object(
        'display_name', 'FinanciaCar',
        'slogan', v_slogan,
        'logo_mode', 'wordmark'
      ),
      'demo-operator',
      'demo-operator',
      now(),
      'Identidade inicial do portal FinanciaCar.',
      true
    );

    update public.themes
    set published_version_id = v_version_id, updated_at = now()
    where id = v_theme_id
      and tenant_id = v_tenant_id;
  end if;

  -- Identidade gravada pela mesma fronteira usada pela Central de Identidade.
  perform public.cms_save_theme_v3(
    v_tenant_id,
    'FinanciaCar',
    v_slogan,
    '#192A9A',
    '#223AD2',
    '#31C7ED',
    '#FFFFFF',
    '#15191E',
    'sans-geometrica',
    'automotive-mobility'
  );

  update public.theme_versions version
  set navigation_json = jsonb_build_array('Início', 'Crédito', 'Concessionárias', 'Evite Acidentes', 'Raridade', 'Ruas e Avenidas', 'Estradas', 'Serviços e Manutenção', 'Ainda terei um carro assim', 'Área do Piloto')
  from public.themes theme
  where theme.tenant_id = v_tenant_id
    and version.id = theme.published_version_id;

  insert into public.categories (
    id, owner_tenant_id, name, slug, description, status, is_demo
  )
  values
    (md5('financiacar:category:credito')::uuid, v_tenant_id, 'Crédito', 'credito', 'Financiamento, taxas, modalidades e direitos de quem compra um veículo a prazo.', 'active', true),
    (md5('financiacar:category:concessionarias')::uuid, v_tenant_id, 'Concessionárias', 'concessionarias', 'Varejo automotivo, lançamentos, feirões, seminovos e experiência de compra.', 'active', true),
    (md5('financiacar:category:evite-acidentes')::uuid, v_tenant_id, 'Evite Acidentes', 'evite-acidentes', 'Segurança viária, recall, direção defensiva e tecnologias de assistência.', 'active', true),
    (md5('financiacar:category:raridade')::uuid, v_tenant_id, 'Raridade', 'raridade', 'Veículos históricos, incomuns e colecionáveis, restauração e leilões.', 'active', true),
    (md5('financiacar:category:ruas-e-avenidas')::uuid, v_tenant_id, 'Ruas e Avenidas', 'ruas-e-avenidas', 'Mobilidade urbana, trânsito, regras locais e infraestrutura das cidades.', 'active', true),
    (md5('financiacar:category:estradas')::uuid, v_tenant_id, 'Estradas', 'estradas', 'Rodovias, pedágios, concessões, viagens de carro e seus custos.', 'active', true),
    (md5('financiacar:category:servicos-e-manutencao')::uuid, v_tenant_id, 'Serviços e Manutenção', 'servicos-e-manutencao', 'Revisões, peças, custos de propriedade e cuidados com o veículo.', 'active', true),
    (md5('financiacar:category:ainda-terei-um-carro-assim')::uuid, v_tenant_id, 'Ainda terei um carro assim', 'ainda-terei-um-carro-assim', 'Memória, desejo e história automotiva: carros que marcaram gerações.', 'active', true),
    (md5('financiacar:category:area-do-piloto')::uuid, v_tenant_id, 'Área do Piloto', 'area-do-piloto', 'Automobilismo, categorias, pilotos, bastidores e tecnologia das pistas.', 'active', true)
  on conflict (owner_tenant_id, slug) do update set
    name = excluded.name,
    description = excluded.description,
    status = 'active',
    is_demo = true,
    updated_at = now();

  insert into public.authors (
    id, owner_tenant_id, slug, display_name, bio, specialties, status, is_demo
  )
  values (
    md5('financiacar:author:redacao')::uuid,
    v_tenant_id,
    'redacao-financiacar',
    'Redação FinanciaCar',
    'Perfil demonstrativo usado nas matérias fictícias da pré-visualização do portal.',
    array['crédito automotivo', 'mobilidade']::text[],
    'active',
    true
  )
  on conflict (owner_tenant_id, slug) do update set
    display_name = excluded.display_name,
    bio = excluded.bio,
    specialties = excluded.specialties,
    status = 'active',
    is_demo = true,
    updated_at = now();

  create temporary table if not exists financiacar_articles (
    ordinal integer primary key,
    code text not null unique,
    category_slug text not null,
    slug text not null unique,
    title text not null,
    subtitle text not null,
    paragraphs jsonb not null
  ) on commit drop;
  truncate table pg_temp.financiacar_articles;

  insert into pg_temp.financiacar_articles values
    (1, 'FC-001', 'credito', 'entrada-maior-ou-prazo-mais-longo', 'Entrada maior ou prazo mais longo? Entenda como cada escolha afeta a parcela', 'Aumentar a entrada reduz o valor financiado; alongar o prazo alivia a parcela, mas eleva o custo total. Veja como comparar.', jsonb_build_array('Na hora de financiar um veículo, duas decisões pesam mais no bolso: quanto pagar de entrada e em quantos meses dividir o restante. Uma entrada maior diminui o valor financiado e, com ele, os juros cobrados ao longo do contrato. Já um prazo mais longo reduz a parcela mensal, mas faz o consumidor pagar juros por mais tempo.', 'A comparação mais segura é olhar o Custo Efetivo Total (CET), que reúne juros, tarifas, seguros e impostos da operação. Duas propostas com a mesma parcela podem ter custos finais bem diferentes.', 'Antes de assinar, vale simular cenários com entradas e prazos distintos e verificar se a parcela cabe no orçamento sem comprometer outras despesas do mês.')),
    (2, 'FC-002', 'credito', 'quais-fatores-influenciam-a-taxa-de-juros-do-financiamento', 'Quais fatores influenciam a taxa de juros do financiamento de um carro?', 'Histórico de pagamento, renda, valor de entrada e idade do veículo entram na conta das instituições financeiras.', jsonb_build_array('A taxa oferecida em um financiamento de veículo não é igual para todos. As instituições avaliam o risco de cada operação, considerando o histórico de crédito, a renda comprovada e o comprometimento atual do orçamento do cliente.', 'O próprio veículo também pesa: modelos mais novos costumam ter condições diferentes das de usados mais antigos, e uma entrada maior tende a reduzir o risco percebido pela instituição.', 'O cenário econômico completa a equação. Quando a taxa básica de juros sobe, o crédito em geral fica mais caro; quando cai, as condições tendem a melhorar.')),
    (3, 'FC-003', 'credito', 'cdc-leasing-ou-consorcio', 'CDC, leasing ou consórcio: qual modalidade combina com o seu momento?', 'Cada caminho tem prazo, custo e momento de posse diferentes. Entenda as diferenças antes de escolher.', jsonb_build_array('O Crédito Direto ao Consumidor (CDC) é a modalidade mais comum: o comprador leva o veículo na hora e paga parcelas com juros, com o bem alienado à instituição até a quitação.', 'No consórcio não há juros, mas há taxa de administração, e o carro só chega com a contemplação, por sorteio ou lance. O leasing funciona como um arrendamento e hoje é mais usado por empresas.', 'A escolha depende da urgência em ter o veículo, do planejamento financeiro e do custo total de cada alternativa.')),
    (4, 'FC-004', 'credito', 'como-funciona-a-analise-de-credito-para-veiculos', 'Como funciona a análise de crédito para financiar um veículo', 'Entenda quais informações são avaliadas e o que ajuda a aumentar as chances de aprovação.', jsonb_build_array('Ao pedir um financiamento, o consumidor autoriza a instituição a consultar seu histórico em birôs de crédito e a analisar dados como renda, ocupação e dívidas em aberto.', 'Manter contas em dia, atualizar o cadastro e evitar pedir crédito em muitas instituições ao mesmo tempo são atitudes que ajudam a construir um bom histórico.', 'Se o pedido for recusado, o consumidor pode buscar informações sobre os dados utilizados e corrigir eventuais inconsistências no cadastro.')),
    (5, 'FC-005', 'concessionarias', 'seminovos-ganham-espaco-nas-concessionarias', 'Seminovos ganham espaço nas vitrines das concessionárias', 'Redes ampliam o estoque de usados com revisão e garantia, de olho em quem busca preço menor sem abrir mão de procedência.', jsonb_build_array('Com o preço dos zero-quilômetro em patamar elevado, muitas concessionárias passaram a dedicar mais espaço aos seminovos, geralmente vendidos com revisão feita e garantia da loja.', 'Para o comprador, a vantagem está na procedência: histórico de manutenção, laudo cautelar e documentação conferida reduzem o risco de surpresas depois da compra.', 'Ainda assim, vale comparar o preço com tabelas de referência e ler com atenção o que a garantia cobre e por quanto tempo.')),
    (6, 'FC-006', 'concessionarias', 'feirao-de-fim-de-semana-o-que-observar', 'Feirão de fim de semana: o que observar antes de fechar negócio', 'Condições especiais exigem atenção ao preço final, às taxas e aos itens incluídos na oferta.', jsonb_build_array('Feirões reúnem ofertas por tempo limitado e costumam anunciar taxas reduzidas, bônus na troca e brindes. O clima de urgência, porém, pode levar a decisões apressadas.', 'A recomendação é chegar com uma simulação feita, saber quanto pode pagar por mês e pedir por escrito o valor total da operação, incluindo tarifas e seguros opcionais.', 'Se a oferta for realmente vantajosa, ela continuará fazendo sentido depois de uma comparação feita com calma.')),
    (7, 'FC-007', 'concessionarias', 'compra-de-carros-cada-vez-mais-digital', 'Da vitrine ao aplicativo: a compra de carros fica cada vez mais digital', 'Pesquisa, simulação e proposta migram para o celular, e a visita à loja vira a etapa final da jornada.', jsonb_build_array('Boa parte da jornada de compra de um veículo já começa na internet: o consumidor compara modelos, consulta preços de referência e simula o financiamento antes de conversar com um vendedor.', 'Concessionárias e marketplaces vêm integrando essas etapas, permitindo enviar propostas e agendar test-drives online. A visita presencial passa a servir para ver o carro e concluir a negociação.', 'Mesmo no ambiente digital, vale confirmar a identidade da loja, desconfiar de preços muito abaixo do mercado e nunca fazer pagamentos antecipados fora dos canais oficiais.')),
    (8, 'FC-008', 'evite-acidentes', 'direcao-defensiva-habitos-que-reduzem-riscos', 'Direção defensiva: cinco hábitos que reduzem riscos no dia a dia', 'Distância segura, atenção aos pontos cegos e velocidade compatível com a via estão entre as práticas mais eficazes.', jsonb_build_array('Direção defensiva é o conjunto de atitudes que ajudam o motorista a antecipar situações de risco. Manter distância segura do veículo da frente é uma das mais simples e mais eficazes.', 'Outras práticas fazem diferença: checar retrovisores e pontos cegos antes de mudar de faixa, sinalizar manobras com antecedência, respeitar os limites de velocidade e deixar o celular longe ao volante.', 'Cansaço e sono também são fatores de risco. Em viagens longas, planejar paradas regulares faz parte da segurança.')),
    (9, 'FC-009', 'evite-acidentes', 'recall-como-saber-se-seu-carro-foi-convocado', 'Recall: como saber se o seu carro foi convocado', 'Consultar o chassi nos canais da montadora e atender ao chamado é gratuito e evita riscos.', jsonb_build_array('O recall é o chamado feito pelo fabricante quando identifica um defeito que pode comprometer a segurança do veículo. O reparo é gratuito, esteja o carro ou não na garantia.', 'O proprietário pode verificar se o seu veículo foi convocado informando o número do chassi nos canais oficiais da montadora ou em portais públicos de consulta.', 'Quem compra um usado também deve fazer essa checagem: recalls pendentes seguem vinculados ao veículo e precisam ser atendidos.')),
    (10, 'FC-010', 'evite-acidentes', 'pneus-freios-e-iluminacao-checagem-rapida', 'Pneus, freios e iluminação: a checagem que leva poucos minutos', 'Três itens simples de verificar concentram boa parte da segurança do veículo.', jsonb_build_array('Pneus com calibragem correta e sulcos dentro do limite mínimo garantem aderência, principalmente em pista molhada. A pressão deve ser verificada com os pneus frios.', 'Ruídos, vibrações ou pedal de freio mais baixo que o normal são sinais de que o sistema precisa de revisão. Faróis, lanternas e setas devem ser testados regularmente.', 'Uma rotina rápida antes de viagens e a cada abastecimento ajuda a identificar problemas antes que eles se transformem em riscos.')),
    (11, 'FC-011', 'raridade', 'modelo-nacional-completa-40-anos-e-vira-peca-de-colecao', 'O carro que quase ninguém lembra: modelo nacional completa 40 anos e vira peça de coleção', 'Exemplares bem conservados de um compacto dos anos 1980 passam a atrair colecionadores e clubes de antigos.', jsonb_build_array('Lançado em meados dos anos 1980, um compacto de produção nacional que passou despercebido em sua época começa a ganhar status de clássico. Exemplares originais e bem conservados tornaram-se raros.', 'Clubes de proprietários relatam aumento na procura por peças e documentação de época, e encontros de antigos passaram a reservar espaço para o modelo.', 'Para quem pensa em comprar um carro antigo, a recomendação é verificar originalidade, histórico e disponibilidade de peças antes de fechar negócio.')),
    (12, 'FC-012', 'raridade', 'o-que-faz-um-carro-virar-colecionavel', 'O que faz um carro virar colecionável?', 'Originalidade, baixa produção e importância histórica estão entre os critérios que valorizam um veículo antigo.', jsonb_build_array('Nem todo carro antigo é colecionável. O valor costuma depender da combinação entre produção limitada, importância histórica e, principalmente, estado de conservação.', 'Originalidade é decisiva: peças de época, pintura e acabamento fiéis ao projeto de fábrica valem mais do que adaptações modernas. Documentação completa e histórico de proprietários também contam.', 'Certificações de clubes especializados ajudam a comprovar a autenticidade e podem influenciar o valor de mercado.')),
    (13, 'FC-013', 'raridade', 'leiloes-de-classicos-como-funcionam', 'Leilões de clássicos: como funcionam e o que avaliar', 'Vistoria prévia, edital e custos adicionais precisam entrar na conta de quem quer arrematar um antigo.', jsonb_build_array('Leilões são uma das portas de entrada para quem busca veículos raros. Antes de dar um lance, é importante ler o edital, que descreve as condições do lote, as taxas e os prazos de retirada.', 'Sempre que possível, faça a vistoria presencial. Fotos nem sempre mostram corrosão, adaptações ou problemas mecânicos.', 'Além do valor do arremate, considere comissão do leiloeiro, transporte, regularização da documentação e eventual restauração.')),
    (14, 'FC-014', 'ruas-e-avenidas', 'faixas-exclusivas-o-que-muda-para-quem-dirige', 'Faixas exclusivas: como funcionam e o que muda para quem dirige', 'Corredores de ônibus e ciclofaixas reorganizam o espaço urbano e exigem atenção redobrada nos cruzamentos.', jsonb_build_array('Faixas exclusivas priorizam o transporte coletivo e a circulação de bicicletas. Em muitas cidades, trafegar nelas fora dos horários ou situações permitidas é infração de trânsito.', 'Para o motorista, a principal atenção está nas conversões: é preciso observar a sinalização que indica onde é permitido cruzar a faixa para entrar em uma rua ou garagem.', 'Consultar os horários e as regras de cada via evita multas e torna o trânsito mais previsível para todos.')),
    (15, 'FC-015', 'ruas-e-avenidas', 'estacionamento-rotativo-digital-como-usar', 'Estacionamento rotativo digital: como usar sem levar multa', 'Aplicativos substituem talões em várias cidades; saber o tempo máximo e a área de cobrança evita surpresas.', jsonb_build_array('Em muitas cidades, a antiga folha de papel do estacionamento rotativo deu lugar a aplicativos credenciados. A ativação é feita informando a placa e o tempo de permanência.', 'É importante conferir a área e o horário de cobrança, além do tempo máximo permitido em cada vaga. Ultrapassar o limite ou esquecer de ativar pode gerar notificação.', 'Utilize apenas os aplicativos credenciados pela prefeitura e desconfie de cobranças feitas fora dos canais oficiais.')),
    (16, 'FC-016', 'ruas-e-avenidas', 'rodizio-de-veiculos-como-planejar-a-semana', 'Rodízio de veículos: como planejar a semana', 'Consultar dia, horário e perímetro da restrição ajuda a organizar os deslocamentos sem infrações.', jsonb_build_array('O rodízio restringe a circulação de veículos em determinados dias e horários, de acordo com o final da placa, com o objetivo de reduzir congestionamentos e poluição.', 'As regras variam de cidade para cidade. Vale conferir o perímetro da restrição, os horários de vigência e as exceções previstas.', 'Planejar o transporte do dia de rodízio, com transporte público, carona ou trabalho remoto, evita multas e deslocamentos de última hora.')),
    (17, 'FC-017', 'estradas', 'quanto-custa-uma-viagem-de-carro', 'Quanto custa uma viagem de carro? Veja como calcular', 'Combustível, pedágios, alimentação e paradas entram na conta de quem vai pegar a estrada.', jsonb_build_array('Para estimar o custo de uma viagem, comece pela distância total e pelo consumo médio do veículo em estrada. Dividindo a distância pelo consumo e multiplicando pelo preço do combustível, chega-se ao gasto aproximado.', 'Some a esse valor os pedágios do trajeto, as refeições, eventuais pernoites e uma reserva para imprevistos.', 'Revisar o carro antes de sair, com atenção a pneus, óleo, freios e arrefecimento, também é uma forma de evitar despesas maiores no caminho.')),
    (18, 'FC-018', 'estradas', 'pedagio-sem-cancela-como-funciona-o-free-flow', 'Pedágio sem cancela: como funciona o sistema free flow', 'Pórticos leem a placa ou a tag do veículo e a cobrança é feita depois; saber o prazo de pagamento evita multa.', jsonb_build_array('No modelo conhecido como free flow, não há praças de pedágio com cancelas. Pórticos instalados na rodovia identificam o veículo pela placa ou pela tag de pagamento automático.', 'Quem não tem tag precisa quitar a tarifa pelos canais indicados pela concessionária dentro do prazo estabelecido. O não pagamento pode resultar em infração.', 'Antes de viajar, vale verificar se o trajeto possui trechos com esse sistema e quais formas de pagamento são aceitas.')),
    (19, 'FC-019', 'estradas', 'pontos-de-parada-e-descanso-viagem-segura', 'Pontos de parada e descanso: como planejar uma viagem segura', 'Dirigir descansado é tão importante quanto ter o carro revisado. Veja como organizar as paradas.', jsonb_build_array('A fadiga é uma das principais inimigas de quem dirige longas distâncias. A recomendação geral é fazer pausas regulares para descansar, se alimentar e se hidratar.', 'Mapear previamente os pontos de parada, postos e áreas de descanso ajuda a evitar paradas em locais inseguros, especialmente à noite.', 'Se possível, reveze a direção com outro motorista habilitado e evite iniciar a viagem depois de uma noite mal dormida.')),
    (20, 'FC-020', 'servicos-e-manutencao', 'cinco-sinais-de-que-o-carro-precisa-de-revisao', '5 sinais de que o carro precisa passar por uma revisão', 'Luzes no painel, ruídos e mudanças no consumo são avisos que não devem ser ignorados.', jsonb_build_array('O carro costuma dar sinais antes de apresentar um problema maior. Luzes de alerta acesas no painel, ruídos diferentes ao frear ou fazer curvas e vibrações no volante estão entre os mais comuns.', 'Aumento repentino no consumo de combustível, dificuldade na partida e manchas de fluido no chão da garagem também indicam que é hora de procurar uma oficina.', 'Seguir o plano de revisões do manual do proprietário ajuda a identificar desgastes com antecedência e preserva o valor do veículo.')),
    (21, 'FC-021', 'servicos-e-manutencao', 'quanto-custa-manter-um-carro-por-ano', 'Quanto custa manter um carro por ano? Veja quais despesas entram na conta', 'Além da parcela, IPVA, seguro, manutenção, combustível e estacionamento pesam no orçamento.', jsonb_build_array('O custo de ter um carro vai muito além do valor de compra ou da parcela do financiamento. Impostos, licenciamento e seguro formam a base das despesas anuais.', 'A eles se somam combustível, manutenção preventiva, troca de pneus, estacionamento e eventuais multas. A desvalorização do veículo também deve entrar na conta.', 'Montar uma planilha com esses itens antes da compra ajuda a escolher um modelo compatível com o orçamento e evita apertos ao longo do ano.')),
    (22, 'FC-022', 'servicos-e-manutencao', 'troca-de-oleo-quando-fazer', 'Troca de óleo: quando fazer e por que não adiar', 'O intervalo depende do tipo de óleo, do uso do veículo e das recomendações do fabricante.', jsonb_build_array('O óleo lubrifica e protege as peças do motor. Com o tempo, ele perde propriedades e passa a acumular resíduos, o que aumenta o desgaste interno.', 'O intervalo de troca é indicado no manual do proprietário e pode ser menor para quem roda muito no trânsito urbano, em trajetos curtos ou em condições severas.', 'Usar o óleo com a especificação correta e trocar o filtro junto são cuidados simples que prolongam a vida útil do motor.')),
    (23, 'FC-023', 'ainda-terei-um-carro-assim', 'carros-que-marcaram-a-infancia-de-uma-geracao', 'Os carros que marcaram a infância de uma geração', 'Viagens em família, o cheiro do banco e o som do motor: por que alguns modelos ficam na memória.', jsonb_build_array('Todo mundo tem um carro que marcou a infância: aquele em que a família viajava nas férias, o do vizinho que parecia enorme ou o modelo que aparecia em todos os cartazes da época.', 'Para muitos, a lembrança vira desejo na vida adulta. Clubes e encontros de antigos reúnem pessoas que procuram justamente o carro da própria história.', 'Nesta editoria, o portal conta histórias de modelos que atravessaram gerações e de proprietários que realizaram o sonho de ter um deles na garagem.')),
    (24, 'FC-024', 'ainda-terei-um-carro-assim', 'como-um-mesmo-modelo-mudou-ao-longo-das-decadas', 'Da primeira à última geração: como um mesmo modelo mudou ao longo das décadas', 'Segurança, conforto e tecnologia transformaram carros que mantiveram o nome, mas mudaram quase todo o resto.', jsonb_build_array('Alguns modelos atravessam décadas mantendo o mesmo nome. Comparar suas gerações é uma forma de enxergar a evolução da indústria automotiva.', 'Itens hoje considerados básicos, como freios ABS, airbags e direção assistida, já foram opcionais ou nem existiam nas primeiras versões.', 'O desenho também mudou, acompanhando novas exigências de segurança, aerodinâmica e eficiência energética.')),
    (25, 'FC-025', 'ainda-terei-um-carro-assim', 'o-sonho-na-garagem-reencontrar-o-carro-da-juventude', 'O sonho na garagem: histórias de quem reencontrou o carro da juventude', 'Proprietários contam como encontraram, restauraram e hoje cuidam de modelos que marcaram suas vidas.', jsonb_build_array('Reencontrar o carro da juventude é um projeto que costuma levar anos: começa com a busca pelo modelo certo, passa pela restauração e termina, quase sempre, em um novo capítulo de histórias.', 'Os relatos desta seção ilustram o tipo de conteúdo que a editoria pode publicar, com fotos, depoimentos e detalhes de cada restauração.', 'Quem pensa em seguir o mesmo caminho deve considerar custos de restauração, disponibilidade de peças e o espaço necessário para guardar o veículo.')),
    (26, 'FC-026', 'area-do-piloto', 'como-funciona-um-fim-de-semana-de-corrida', 'Treino, classificação e prova: como funciona um fim de semana de corrida', 'Entenda as etapas que definem o grid e o que está em jogo em cada sessão.', jsonb_build_array('Na maioria das categorias do automobilismo, o fim de semana de corrida começa com treinos livres, usados pelas equipes para ajustar o acerto do carro à pista.', 'Em seguida vem a classificação, que define a ordem de largada. Um bom resultado nessa etapa pode ser decisivo em circuitos onde ultrapassar é difícil.', 'Na prova, estratégia de pneus, paradas nos boxes e regularidade contam tanto quanto a velocidade pura.')),
    (27, 'FC-027', 'area-do-piloto', 'do-kart-as-categorias-nacionais', 'Do kart às categorias nacionais: o caminho de um piloto', 'A formação no kartismo ainda é a principal porta de entrada para o automobilismo profissional.', jsonb_build_array('A maior parte dos pilotos profissionais começa no kart, ainda na infância. É ali que aprendem trajetórias, frenagens e disputa roda a roda.', 'O passo seguinte costuma ser as categorias de base, com carros de fórmula ou turismo, antes de chegar às principais competições nacionais e internacionais.', 'Além de talento, a carreira exige preparo físico, estudo técnico e patrocínio para custear cada temporada.')),
    (28, 'FC-028', 'area-do-piloto', 'tecnologias-que-sairam-das-pistas-para-as-ruas', 'Da pista para as ruas: tecnologias que nasceram nas competições', 'Freios mais eficientes, aerodinâmica e sistemas híbridos foram testados no automobilismo antes de chegar aos carros de passeio.', jsonb_build_array('O automobilismo sempre funcionou como laboratório para a indústria. Soluções desenvolvidas para ganhar décimos de segundo na pista acabam, com o tempo, chegando aos carros de rua.', 'Freios a disco, materiais mais leves, estudos de aerodinâmica e sistemas de recuperação de energia estão entre os exemplos dessa transferência de tecnologia.', 'Hoje, as competições também servem de vitrine para motores híbridos e elétricos, acelerando o desenvolvimento de soluções mais eficientes.'));

  if (select count(*) from pg_temp.financiacar_articles) <> 28 then
    raise exception 'Catálogo FinanciaCar incompleto';
  end if;

  insert into public.content_items (
    id, owner_tenant_id, canonical_slug, content_type, workflow_status,
    visibility, first_published_at, last_published_at, created_by, updated_by,
    is_demo
  )
  select
    md5('financiacar:item:' || article.code)::uuid,
    v_tenant_id,
    article.slug,
    'article',
    'published',
    'private',
    timestamptz '2026-09-23 08:00:00-03' - (article.ordinal - 1) * interval '75 minutes',
    timestamptz '2026-09-23 08:00:00-03' - (article.ordinal - 1) * interval '75 minutes',
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.financiacar_articles article
  on conflict (owner_tenant_id, canonical_slug) do update set
    content_type = 'article',
    workflow_status = 'published',
    visibility = 'private',
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
    word_count, sponsorship_label, created_by, approved_by, approved_at,
    change_summary, is_demo
  )
  select
    md5('financiacar:revision:' || article.code)::uuid,
    item.id,
    1,
    article.title,
    article.subtitle,
    article.slug,
    jsonb_build_object(
      'type', 'doc',
      'seed_code', article.code,
      'editorial_origin', jsonb_build_object(
        'kind', 'demo-fictional',
        'catalog_reference', v_catalog_reference,
        'volatile', true,
        'replace_when', 'client-editorial-delivery'
      ),
      'demo_media', jsonb_build_object(
        'mode', 'none',
        'alt', '',
        'credit', 'Sem fotografia: visual gráfico da marca até o recebimento do pacote de imagens.',
        'rights_basis', 'none'
      ),
      'content', (
        select jsonb_agg(
          jsonb_build_object('type', 'paragraph', 'text', paragraph.value)
          order by paragraph.ordinality
        )
        from jsonb_array_elements_text(article.paragraphs)
          with ordinality as paragraph(value, ordinality)
      )
    ),
    (
      select string_agg(paragraph.value, E'\n\n' order by paragraph.ordinality)
      from jsonb_array_elements_text(article.paragraphs)
        with ordinality as paragraph(value, ordinality)
    ),
    article.title,
    article.subtitle,
    'not_required',
    (
      select sum(cardinality(regexp_split_to_array(trim(paragraph.value), '\s+')))::integer
      from jsonb_array_elements_text(article.paragraphs) as paragraph(value)
    ),
    'Conteúdo demonstrativo',
    'demo-operator',
    'demo-operator',
    timestamptz '2026-09-23 08:00:00-03',
    'Matéria fictícia e volátil para a pré-visualização do portal FinanciaCar.',
    true
  from pg_temp.financiacar_articles article
  join public.content_items item
    on item.owner_tenant_id = v_tenant_id
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
    sponsorship_label = excluded.sponsorship_label,
    approved_by = excluded.approved_by,
    approved_at = excluded.approved_at,
    change_summary = excluded.change_summary,
    is_demo = true;

  update public.content_items item
  set
    current_published_revision_id = revision.id,
    workflow_status = 'published',
    updated_at = now()
  from pg_temp.financiacar_articles article
  join public.content_revisions revision
    on revision.id = md5('financiacar:revision:' || article.code)::uuid
  where item.owner_tenant_id = v_tenant_id
    and item.canonical_slug = article.slug
    and revision.content_item_id = item.id;

  insert into public.content_revision_authors (
    content_revision_id, author_id, byline_order
  )
  select
    md5('financiacar:revision:' || article.code)::uuid,
    md5('financiacar:author:redacao')::uuid,
    1
  from pg_temp.financiacar_articles article
  on conflict (content_revision_id, author_id) do update set
    byline_order = excluded.byline_order;

  delete from public.content_revision_categories link
  using pg_temp.financiacar_articles article
  where link.content_revision_id = md5('financiacar:revision:' || article.code)::uuid;

  insert into public.content_revision_categories (
    content_revision_id, category_id, is_primary
  )
  select
    md5('financiacar:revision:' || article.code)::uuid,
    md5('financiacar:category:' || article.category_slug)::uuid,
    true
  from pg_temp.financiacar_articles article;

  insert into public.distributions (
    id, content_item_id, tenant_id, status, starts_at, channels, rights_code,
    contract_reference, allow_full_body, allow_media, created_by, approved_by,
    is_demo
  )
  select
    md5('financiacar:distribution:' || article.code)::uuid,
    item.id,
    v_tenant_id,
    'active',
    item.first_published_at,
    array['portal']::text[],
    'demo',
    v_catalog_reference,
    true,
    true,
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.financiacar_articles article
  join public.content_items item
    on item.owner_tenant_id = v_tenant_id
   and item.canonical_slug = article.slug
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
    allow_full_body = true,
    allow_media = true,
    approved_by = 'demo-operator',
    is_demo = true,
    updated_at = now();

  insert into public.placements (
    id, tenant_id, slot_key, content_item_id, rank, presentation_variant,
    eyebrow_override, status, is_demo
  )
  values (
    md5('financiacar:placement:home.hero:0')::uuid,
    v_tenant_id,
    'home.hero',
    md5('financiacar:item:FC-001')::uuid,
    0,
    'hero',
    'Manchete',
    'active',
    true
  )
  on conflict (tenant_id, slot_key, rank) do update set
    content_item_id = excluded.content_item_id,
    presentation_variant = excluded.presentation_variant,
    eyebrow_override = excluded.eyebrow_override,
    status = 'active',
    updated_at = now();

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id, after_json,
    reason, is_demo
  )
  values (
    md5('financiacar:audit:demo-portal-created')::uuid,
    v_tenant_id,
    'demo-operator',
    'tenant.demo_created',
    'tenant',
    v_tenant_id,
    jsonb_build_object(
      'site_model', 'automotive-mobility',
      'demo_fictional_items', 28,
      'categories', 9,
      'catalog_reference', v_catalog_reference
    ),
    'Portal demonstrativo FinanciaCar criado no quinto modelo visual (D34).',
    true
  )
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.apply_financiacar_demo_portal()
from public, anon, authenticated, service_role;

comment on function private.apply_financiacar_demo_portal() is
  'Cria ou restaura de forma idempotente o tenant demonstrativo FinanciaCar e seu catálogo fictício volátil.';

select private.apply_financiacar_demo_portal();
