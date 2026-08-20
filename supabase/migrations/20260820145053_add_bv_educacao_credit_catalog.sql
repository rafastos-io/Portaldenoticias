-- Catálogo autorizado de educação financeira para a BV Educação e o padrão de crédito.
-- Os 18 textos vieram dos arquivos fornecidos em BV/. Os três vídeos são
-- referências externas: somente metadados e links são persistidos.

create or replace function private.apply_bv_educacao_credit_catalog()
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
    raise exception 'BV Educação não está disponível para receber o catálogo';
  end if;

  create temporary table if not exists bv_credit_targets (
    id uuid primary key,
    slug text not null unique
  ) on commit drop;
  truncate table pg_temp.bv_credit_targets;

  insert into pg_temp.bv_credit_targets (id, slug)
  select tenant.id, tenant.slug
  from public.tenants tenant
  join public.themes theme on theme.tenant_id = tenant.id
  join public.theme_versions version on version.id = theme.published_version_id
  where tenant.kind = 'demo'
    and tenant.status = 'demo'
    and tenant.is_demo = true
    and tenant.archived_at is null
    and version.components_json ->> 'site_model' = 'financial-services-credit';

  select count(*) into credit_target_count from pg_temp.bv_credit_targets;
  if credit_target_count < 2
     or not exists (select 1 from pg_temp.bv_credit_targets where id = bv_tenant_id) then
    raise exception 'Padrão de crédito incompleto: esperados BV Educação e ao menos mais um tenant ativo';
  end if;

  insert into public.categories (
    id, owner_tenant_id, name, slug, description, status, is_demo
  )
  values
    (md5('bv-credit:category:indicadores')::uuid, platform_id, 'Indicadores', 'indicadores', 'Inflação, juros e indicadores que ajudam a interpretar a economia.', 'active', true),
    (md5('bv-credit:category:investimentos')::uuid, platform_id, 'Investimentos', 'investimentos', 'Produtos, mercados, riscos e decisões para quem quer investir melhor.', 'active', true),
    (md5('bv-credit:category:alerta-de-golpes')::uuid, platform_id, 'Alerta de golpes', 'alerta-de-golpes', 'Prevenção, resposta e comportamento seguro diante de fraudes financeiras.', 'active', true),
    (md5('bv-credit:category:programando-o-futuro')::uuid, platform_id, 'Programando o futuro', 'programando-o-futuro', 'Planejamento financeiro para projetos, viagens e escolhas de longo prazo.', 'active', true),
    (md5('bv-credit:category:isso-ou-aquilo')::uuid, platform_id, 'Isso ou aquilo', 'isso-ou-aquilo', 'Comparações práticas para escolher entre alternativas financeiras.', 'active', true),
    (md5('bv-credit:category:saia-das-dividas')::uuid, platform_id, 'Saia das dívidas', 'saia-das-dividas', 'Informação para reconhecer, organizar e superar o endividamento.', 'active', true),
    (md5('bv-credit:category:alivio-no-orcamento')::uuid, platform_id, 'Alívio no orçamento', 'alivio-no-orcamento', 'Hábitos e decisões que ajudam a reduzir despesas e equilibrar o mês.', 'active', true),
    (md5('bv-credit:category:guias')::uuid, platform_id, 'Guias', 'guias', 'Conteúdos passo a passo para decisões financeiras do cotidiano.', 'active', true),
    (md5('bv-credit:category:dicas-valiosas')::uuid, platform_id, 'Dicas valiosas', 'dicas-valiosas', 'Orientações rápidas para cuidar do dinheiro e do orçamento.', 'active', true),
    (md5('bv-credit:category:glossario')::uuid, platform_id, 'Glossário', 'glossario', 'Conceitos essenciais de economia, crédito e finanças em linguagem clara.', 'active', true)
  on conflict (owner_tenant_id, slug) do update set
    name = excluded.name,
    description = excluded.description,
    status = 'active',
    is_demo = true,
    updated_at = now();

  create temporary table if not exists bv_credit_articles (
    ordinal integer primary key,
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
    source_url text not null,
    source_published_at timestamptz,
    external_only boolean not null,
    image_file text not null,
    image_alt text not null,
    source_image_credit text
  ) on commit drop;
  truncate table pg_temp.bv_credit_articles;

  insert into pg_temp.bv_credit_articles values
    (1, 'BV-001', 'indicadores', 'voce-sabe-o-que-e-inflacao-e-quais-sao-os-principais-indices', 'Você sabe o que é inflação e quais são os principais índices?', 'Você pode não entender nada de economia, mas com certeza já ouvia falar em inflação e já sentiu o impacto dela no seu bolso.', 'Você pode não entender nada de economia, mas com certeza já ouvia falar em inflação e já sentiu o impacto dela no seu bolso. No Brasil, o índice oficial usado pelo governo Federal é o Índice Nacional de Preços ao Consumidor Amplo (IPCA), que tem o objetivo de medir a inflação a partir de um conjunto de produtos e serviços comercializados no varejo, referentes ao consumo pessoal das famílias, cujo rendimento varia entre 1 e 40 salários-mínimos, qualquer que seja a fonte de rendimentos. Esse índice é utilizado pelo Banco Central (BC) para fazer política monetária, instrumento que busca controlar a inflação.

O QUE É INFLAÇÃO

De acordo com o BC, inflação é o aumento dos preços de bens e serviços. Ela implica diminuição do poder de compra da moeda. A inflação é medida pelos índices de preços. O Brasil tem vários índices de preços. O IPCA é o índice utilizado no sistema de metas para a inflação.

A inflação pode ter várias causas, que podem ser agrupadas em: pressões de demanda; pressões de custos; inércia inflacionária; e expectativas de inflação.

A inflação gera incertezas importantes na economia, desestimulando o investimento e, assim, prejudicando o crescimento econômico. Os preços relativos ficam distorcidos, gerando várias ineficiências na economia. As pessoas e as empresas perdem noção dos preços relativos e, assim, fica difícil avaliar se algo está barato ou caro.

A inflação afeta particularmente as camadas menos favorecidas da população, pois essas têm menos acesso a instrumentos financeiros para se defender da inflação.

META DE INFLAÇÃO

É uma taxa definida pelo Banco Central, e funciona como âncora de expectativas sobre a inflação futura. O objetivo é mostrar o rumo que a economia está seguindo, permitindo que, em caso de desvios desta meta, a autoridade monetária possa corrigir o rumo ao longo do tempo. Esse movimento recebe o nome de política monetária, que são os instrumentos usados pelo BC para tentar impedir que a inflação suba além do estabelecido.

De acordo com o BC, manter a taxa de inflação baixa, estável e previsível é a melhor contribuição que a política monetária pode fazer para o crescimento econômico sustentável e a melhora nas condições de vida da população.

O crescimento de uma economia depende de uma série de fatores sobre os quais os bancos centrais não têm controle, como aumento da produtividade. Entretanto, inflação alta, instável ou imprevisível prejudica o crescimento econômico. Assim como inflação alta não é bom, deflação, ou inflação negativa também não. Preços em queda podem ser prejudiciais para o bom funcionamento da economia. Isso porque, pode levar ao prejuízo de empresas, que compraram por um determinado valor e tiveram que vender por menos do que foi investido. As famílias e as empresas poderão adiar suas decisões de consumo e investimento se houver a perspectiva de que os preços serão mais baixos amanhã, deprimindo a atividade econômica.

A meta para a inflação e o índice de preços utilizado são definidos pelo Conselho Monetário Nacional (CMN) e cabe ao BC adotar as medidas necessárias para alcançá-la. O CMN também define um intervalo de tolerância ao redor da meta de inflação, que funciona como uma referência para a caracterização de seu cumprimento ou não.

A taxa básica de juros (Selic), que influencia os juros cobrados nos empréstimos, financiamentos e aplicações financeiras, é o principal instrumento de política monetária utilizado pelo BC para controlar a inflação. Ou seja, quando a inflação começa a subir, o banco eleva a taxa, consequentemente, os juros dos financiamentos, empréstimos e cartões de crédito ficam mais caros, e isso desestimula o consumo. O mesmo acontece quando a Selic cai, as taxas ficam mais baratas e as pessoas se sentem mais confortáveis para comprar e as empresas para investir.

Para o bom andamento da economia é necessário que a inflação fique dentro dos parâmetros estabelecidos pela autoridade monetária. A partir deste ano, o BC passou a adotar a meta de inflação contínua, com base no IPCA acumulada em 12 meses. Com isso, o centro da meta foi estipulado em 3%, com tolerância de 1,5 ponto porcentual para mais ou para menos. Se o IPCA ficar fora desse intervalo por seis meses consecutivos, o Banco Central terá perdido o controle da meta. Para que isso não ocorra, ele usa a taxa básica de juros (Selic) para conduzir a inflação para o seu objetivo.

Além do IPCA, existem outros índices de inflação como:

- INPC
- IGP-M
- IGP-DI
- IPC-Fipe

INPC

O Índice Nacional de Preços ao Consumidor (INPC) tem o objetivo da correção do poder de compra dos salários, através da mensuração das variações de preços da cesta de consumo da população assalariada com mais baixo rendimento. Esta faixa de renda foi criada com o objetivo de garantir uma cobertura populacional de 50% das famílias cuja pessoa de referência é assalariada e pertencente às áreas urbanas de cobertura.

IGP-M

O Índice Geral de Preços – Mercado (IGP-M) é calculado mensalmente pelo Instituto Brasileiro de Economia da Fundação Getúlio Vargas (FGV IBRE), ele é amplamente utilizado para medir a variação de preços em diversos setores da economia. Esse índice tem como objetivo oferecer uma visão abrangente sobre o comportamento dos preços, acompanhando diferentes etapas do processo produtivo e atividades econômicas.

Além de ser uma referência para a economia nacional, o IGP-M se destaca por sua aplicação prática em reajustes contratuais, especialmente em tarifas públicas, contratos de aluguel e serviços essenciais.

O cálculo do IGP-M leva em conta a variação de preços em diferentes áreas da economia, combinando os seguintes índices:

- Índice de Preços ao Produtor Amplo (IPA): Representa 60% do índice total e reflete a produção de bens agropecuários e industriais, nas transações comerciais em nível de produtor.
- Índice de Preços ao Consumidor (IPC): Equivale a 30% e mede as variações de preços nos setores varejistas e serviços de consumo, que impactam o consumidor final.
- Índice Nacional de Custo da Construção (INCC): Corresponde a 10% e monitora os custos da construção civil, incluindo materiais e mão de obra especializada.

A média ponderada desses índices resulta no valor final do IGP-M, garantindo uma análise precisa da inflação em diferentes setores.

IGP-DI

O Índice Geral de Preços - Disponibilidade Interna (IGP-DI), calculado pelo Instituto Brasileiro de Economia (IBRE) da Fundação Getúlio Vargas (FGV), é um indicador do movimento de preços que serve às comunidades econômicas nacional e internacional como termômetro de inflação no Brasil. Ele também é usado como referência para correções de preços e valores contratuais. Esse índice é composto pela média do Índice de Preços ao Produtos Amplo (IPA), 60%; do Índice de Preços ao Consumidor (IPC), 30% e do Índice Nacional de Custo da Construção (INCC), 10%.

IPC-FIPE

O índice de Preços ao Consumidor (IPC) do Município de São Paulo, da Fundação Instituto de Pesquisas Econômicas (Fipe), é o mais tradicional indicador da evolução do custo de vida das famílias paulistanas e um dos mais antigos do Brasil. Ele estima as variações do custo de vida das famílias com renda familiar entre 1 e 10 salários-mínimos.



Palavras-chave: dinheiro, economia, inflação, juros', '[{"type":"paragraph","text":"Você pode não entender nada de economia, mas com certeza já ouvia falar em inflação e já sentiu o impacto dela no seu bolso. No Brasil, o índice oficial usado pelo governo Federal é o Índice Nacional de Preços ao Consumidor Amplo (IPCA), que tem o objetivo de medir a inflação a partir de um conjunto de produtos e serviços comercializados no varejo, referentes ao consumo pessoal das famílias, cujo rendimento varia entre 1 e 40 salários-mínimos, qualquer que seja a fonte de rendimentos. Esse índice é utilizado pelo Banco Central (BC) para fazer política monetária, instrumento que busca controlar a inflação."},{"type":"heading","text":"O QUE É INFLAÇÃO"},{"type":"paragraph","text":"De acordo com o BC, inflação é o aumento dos preços de bens e serviços. Ela implica diminuição do poder de compra da moeda. A inflação é medida pelos índices de preços. O Brasil tem vários índices de preços. O IPCA é o índice utilizado no sistema de metas para a inflação."},{"type":"paragraph","text":"A inflação pode ter várias causas, que podem ser agrupadas em: pressões de demanda; pressões de custos; inércia inflacionária; e expectativas de inflação."},{"type":"paragraph","text":"A inflação gera incertezas importantes na economia, desestimulando o investimento e, assim, prejudicando o crescimento econômico. Os preços relativos ficam distorcidos, gerando várias ineficiências na economia. As pessoas e as empresas perdem noção dos preços relativos e, assim, fica difícil avaliar se algo está barato ou caro."},{"type":"paragraph","text":"A inflação afeta particularmente as camadas menos favorecidas da população, pois essas têm menos acesso a instrumentos financeiros para se defender da inflação."},{"type":"heading","text":"META DE INFLAÇÃO"},{"type":"paragraph","text":"É uma taxa definida pelo Banco Central, e funciona como âncora de expectativas sobre a inflação futura. O objetivo é mostrar o rumo que a economia está seguindo, permitindo que, em caso de desvios desta meta, a autoridade monetária possa corrigir o rumo ao longo do tempo. Esse movimento recebe o nome de política monetária, que são os instrumentos usados pelo BC para tentar impedir que a inflação suba além do estabelecido."},{"type":"paragraph","text":"De acordo com o BC, manter a taxa de inflação baixa, estável e previsível é a melhor contribuição que a política monetária pode fazer para o crescimento econômico sustentável e a melhora nas condições de vida da população."},{"type":"paragraph","text":"O crescimento de uma economia depende de uma série de fatores sobre os quais os bancos centrais não têm controle, como aumento da produtividade. Entretanto, inflação alta, instável ou imprevisível prejudica o crescimento econômico. Assim como inflação alta não é bom, deflação, ou inflação negativa também não. Preços em queda podem ser prejudiciais para o bom funcionamento da economia. Isso porque, pode levar ao prejuízo de empresas, que compraram por um determinado valor e tiveram que vender por menos do que foi investido. As famílias e as empresas poderão adiar suas decisões de consumo e investimento se houver a perspectiva de que os preços serão mais baixos amanhã, deprimindo a atividade econômica."},{"type":"paragraph","text":"A meta para a inflação e o índice de preços utilizado são definidos pelo Conselho Monetário Nacional (CMN) e cabe ao BC adotar as medidas necessárias para alcançá-la. O CMN também define um intervalo de tolerância ao redor da meta de inflação, que funciona como uma referência para a caracterização de seu cumprimento ou não."},{"type":"paragraph","text":"A taxa básica de juros (Selic), que influencia os juros cobrados nos empréstimos, financiamentos e aplicações financeiras, é o principal instrumento de política monetária utilizado pelo BC para controlar a inflação. Ou seja, quando a inflação começa a subir, o banco eleva a taxa, consequentemente, os juros dos financiamentos, empréstimos e cartões de crédito ficam mais caros, e isso desestimula o consumo. O mesmo acontece quando a Selic cai, as taxas ficam mais baratas e as pessoas se sentem mais confortáveis para comprar e as empresas para investir."},{"type":"paragraph","text":"Para o bom andamento da economia é necessário que a inflação fique dentro dos parâmetros estabelecidos pela autoridade monetária. A partir deste ano, o BC passou a adotar a meta de inflação contínua, com base no IPCA acumulada em 12 meses. Com isso, o centro da meta foi estipulado em 3%, com tolerância de 1,5 ponto porcentual para mais ou para menos. Se o IPCA ficar fora desse intervalo por seis meses consecutivos, o Banco Central terá perdido o controle da meta. Para que isso não ocorra, ele usa a taxa básica de juros (Selic) para conduzir a inflação para o seu objetivo."},{"type":"paragraph","text":"Além do IPCA, existem outros índices de inflação como:"},{"type":"paragraph","text":"- INPC - IGP-M - IGP-DI - IPC-Fipe"},{"type":"heading","text":"INPC"},{"type":"paragraph","text":"O Índice Nacional de Preços ao Consumidor (INPC) tem o objetivo da correção do poder de compra dos salários, através da mensuração das variações de preços da cesta de consumo da população assalariada com mais baixo rendimento. Esta faixa de renda foi criada com o objetivo de garantir uma cobertura populacional de 50% das famílias cuja pessoa de referência é assalariada e pertencente às áreas urbanas de cobertura."},{"type":"heading","text":"IGP-M"},{"type":"paragraph","text":"O Índice Geral de Preços – Mercado (IGP-M) é calculado mensalmente pelo Instituto Brasileiro de Economia da Fundação Getúlio Vargas (FGV IBRE), ele é amplamente utilizado para medir a variação de preços em diversos setores da economia. Esse índice tem como objetivo oferecer uma visão abrangente sobre o comportamento dos preços, acompanhando diferentes etapas do processo produtivo e atividades econômicas."},{"type":"paragraph","text":"Além de ser uma referência para a economia nacional, o IGP-M se destaca por sua aplicação prática em reajustes contratuais, especialmente em tarifas públicas, contratos de aluguel e serviços essenciais."},{"type":"paragraph","text":"O cálculo do IGP-M leva em conta a variação de preços em diferentes áreas da economia, combinando os seguintes índices:"},{"type":"paragraph","text":"- Índice de Preços ao Produtor Amplo (IPA): Representa 60% do índice total e reflete a produção de bens agropecuários e industriais, nas transações comerciais em nível de produtor. - Índice de Preços ao Consumidor (IPC): Equivale a 30% e mede as variações de preços nos setores varejistas e serviços de consumo, que impactam o consumidor final. - Índice Nacional de Custo da Construção (INCC): Corresponde a 10% e monitora os custos da construção civil, incluindo materiais e mão de obra especializada."},{"type":"paragraph","text":"A média ponderada desses índices resulta no valor final do IGP-M, garantindo uma análise precisa da inflação em diferentes setores."},{"type":"heading","text":"IGP-DI"},{"type":"paragraph","text":"O Índice Geral de Preços - Disponibilidade Interna (IGP-DI), calculado pelo Instituto Brasileiro de Economia (IBRE) da Fundação Getúlio Vargas (FGV), é um indicador do movimento de preços que serve às comunidades econômicas nacional e internacional como termômetro de inflação no Brasil. Ele também é usado como referência para correções de preços e valores contratuais. Esse índice é composto pela média do Índice de Preços ao Produtos Amplo (IPA), 60%; do Índice de Preços ao Consumidor (IPC), 30% e do Índice Nacional de Custo da Construção (INCC), 10%."},{"type":"heading","text":"IPC-FIPE"},{"type":"paragraph","text":"O índice de Preços ao Consumidor (IPC) do Município de São Paulo, da Fundação Instituto de Pesquisas Econômicas (Fipe), é o mais tradicional indicador da evolução do custo de vida das famílias paulistanas e um dos mais antigos do Brasil. Ele estima as variações do custo de vida das famílias com renda familiar entre 1 e 10 salários-mínimos."},{"type":"paragraph","text":"Palavras-chave: dinheiro, economia, inflação, juros"}]'::jsonb, 'alessandra-taraborelli', 'Alessandra Taraborelli', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/voce-sabe-o-que-e-inflacao-e-quais-sao-os-principais-indices.html', '2025-04-07T10:33:00-03:00'::timestamptz, false, 'economia-saude.webp', 'O indicador de inflação oficial no Brasil é o IPCA, usado pelo Banco Central para calibrar a taxa de juros', 'Adobe Stock'),
    (2, 'BV-002', 'indicadores', 'dia-de-copom-o-que-e-selic-e-como-funciona-a-decisao-de-juros', 'Dia de Copom: o que é Selic e como funciona a decisão de juros', 'Você já deve ter ouvido falar de taxa de juros e seu impacto para a economia.', 'Você já deve ter ouvido falar de taxa de juros e seu impacto para a economia. Mas quem decide a taxa de juros e para que ela serve? O que tem a ver taxa Selic com inflação. Para começo de conversa, qualquer decisão de mudança na taxa básica de juros de um país tem fortes repercussões no custo do crédito, preço dos alimentos e dos serviços, na taxa de câmbio, decisões de investimentos e nos rendimentos das aplicações financeiras.

O principal instrumento de política monetária utilizado pelo Banco Central é calibrar a taxa de juros (Selic) para o controle da inflação. Para entender um pouco mais sobre essa mecânica de juros e inflação, acompanhe abaixo:

O QUE É O COPOM?

Por que o Copom, sigla sempre tão comentada pelos economistas, é tão importante? O Comitê de Política Monetária (Copom) é o órgão do Banco Central responsável por definir os rumos da política monetária do país. Seu atual presidente, Gabriel Galípolo, conta com o apoio de um grupo integrado por oito membros, que respondem por diferentes áreas do órgão, para definir a cada 45 dias a taxa básica de juros da economia, a Selic (Sistema Especial de Liquidação e de Custódia).

São oito reuniões por ano, que normalmente ocorrem em dois dias seguidos. Seu calendário sempre é divulgado até o mês de junho do ano anterior. Durante os encontros, os diretores do BC e o presidente do órgão são municiados com dados técnicos que tratam da evolução e perspectivas da economia brasileira e mundial. Com isso, o grupo tem em mãos informações suficientes para embasar sua decisão.

CENÁRIO MACRO E INFLAÇÃO

As decisões do Copom são tomadas visando com que a inflação oficial (medida pelo IPCA) situe-se em linha com a meta definida pelo Conselho Monetário Nacional (CMN) - que por sua vez é composto pelo presidente do Banco Central e os ministros da Fazenda e do Planejamento.

Para que a política monetária atinja seus objetivos de maneira eficiente, o BC precisa se comunicar de forma clara e transparente. Além do comunicado e da ata da reunião, o Banco Central publica, a cada trimestre, o Relatório de Política Monetária (denominado Relatório de Inflação entre 1999 e 2024), que analisa a evolução recente e as perspectivas da economia, com ênfase nas perspectivas para a inflação.

A escolha pela alta ou o corte da taxa de juros é tomada com base na avaliação do cenário macroeconômico e os principais riscos a ele associados. Todos os membros do Copom presentes na reunião votam e seus votos são divulgados. As atas das reuniões são publicadas no prazo de até quatro dias úteis.

Uma vez definida a taxa Selic, o BC atua diariamente por meio de operações de mercado aberto – comprando e vendendo títulos públicos federais – para assim manter a taxa de juros próxima ao valor definido na reunião do Copom.

PARA QUE SERVE A SELIC?

Trata-se da taxa média cobrada em negociações com títulos emitidos pelo Tesouro Nacional, registradas diariamente no Sistema Especial de Liquidação e de Custódia (Selic). Ela é o principal instrumento de política monetária para controlar a inflação.

A Selic influencia outras taxas de juros do país, sendo a referência para taxas de crédito, financiamento e remuneração de aplicações financeiras, por exemplo.

Em momentos de alta da inflação, o BC tende a elevar a taxa Selic para esfriar a economia e reduzir a demanda, o que, consequentemente, contribui para conter o aumento de preços. Um aumento na Selic torna o crédito mais caro para as empresas e consumidores, reduzindo o consumo e investimentos. Ou seja, desacelera a economia, favorecendo a queda na inflação.

Já a redução da Selic tem o efeito contrário, estimula o consumo e investimentos das empresas através do crédito mais barato, o que pode elevar o nível de emprego. Por outro lado, isso também pode ter uma repercussão negativa para o risco de inflação já que o aumento de renda disponível da população pode elevar os preços.

No chamado ciclo econômico, há muitas variáveis a se observar, dentro e fora do País. Mas isso é tema para outra conversa.



Palavras-chave: BC, Copom, Selic, inflação', '[{"type":"paragraph","text":"Você já deve ter ouvido falar de taxa de juros e seu impacto para a economia. Mas quem decide a taxa de juros e para que ela serve? O que tem a ver taxa Selic com inflação. Para começo de conversa, qualquer decisão de mudança na taxa básica de juros de um país tem fortes repercussões no custo do crédito, preço dos alimentos e dos serviços, na taxa de câmbio, decisões de investimentos e nos rendimentos das aplicações financeiras."},{"type":"paragraph","text":"O principal instrumento de política monetária utilizado pelo Banco Central é calibrar a taxa de juros (Selic) para o controle da inflação. Para entender um pouco mais sobre essa mecânica de juros e inflação, acompanhe abaixo:"},{"type":"heading","text":"O QUE É O COPOM?"},{"type":"paragraph","text":"Por que o Copom, sigla sempre tão comentada pelos economistas, é tão importante? O Comitê de Política Monetária (Copom) é o órgão do Banco Central responsável por definir os rumos da política monetária do país. Seu atual presidente, Gabriel Galípolo, conta com o apoio de um grupo integrado por oito membros, que respondem por diferentes áreas do órgão, para definir a cada 45 dias a taxa básica de juros da economia, a Selic (Sistema Especial de Liquidação e de Custódia)."},{"type":"paragraph","text":"São oito reuniões por ano, que normalmente ocorrem em dois dias seguidos. Seu calendário sempre é divulgado até o mês de junho do ano anterior. Durante os encontros, os diretores do BC e o presidente do órgão são municiados com dados técnicos que tratam da evolução e perspectivas da economia brasileira e mundial. Com isso, o grupo tem em mãos informações suficientes para embasar sua decisão."},{"type":"heading","text":"CENÁRIO MACRO E INFLAÇÃO"},{"type":"paragraph","text":"As decisões do Copom são tomadas visando com que a inflação oficial (medida pelo IPCA) situe-se em linha com a meta definida pelo Conselho Monetário Nacional (CMN) - que por sua vez é composto pelo presidente do Banco Central e os ministros da Fazenda e do Planejamento."},{"type":"paragraph","text":"Para que a política monetária atinja seus objetivos de maneira eficiente, o BC precisa se comunicar de forma clara e transparente. Além do comunicado e da ata da reunião, o Banco Central publica, a cada trimestre, o Relatório de Política Monetária (denominado Relatório de Inflação entre 1999 e 2024), que analisa a evolução recente e as perspectivas da economia, com ênfase nas perspectivas para a inflação."},{"type":"paragraph","text":"A escolha pela alta ou o corte da taxa de juros é tomada com base na avaliação do cenário macroeconômico e os principais riscos a ele associados. Todos os membros do Copom presentes na reunião votam e seus votos são divulgados. As atas das reuniões são publicadas no prazo de até quatro dias úteis."},{"type":"paragraph","text":"Uma vez definida a taxa Selic, o BC atua diariamente por meio de operações de mercado aberto – comprando e vendendo títulos públicos federais – para assim manter a taxa de juros próxima ao valor definido na reunião do Copom."},{"type":"heading","text":"PARA QUE SERVE A SELIC?"},{"type":"paragraph","text":"Trata-se da taxa média cobrada em negociações com títulos emitidos pelo Tesouro Nacional, registradas diariamente no Sistema Especial de Liquidação e de Custódia (Selic). Ela é o principal instrumento de política monetária para controlar a inflação."},{"type":"paragraph","text":"A Selic influencia outras taxas de juros do país, sendo a referência para taxas de crédito, financiamento e remuneração de aplicações financeiras, por exemplo."},{"type":"paragraph","text":"Em momentos de alta da inflação, o BC tende a elevar a taxa Selic para esfriar a economia e reduzir a demanda, o que, consequentemente, contribui para conter o aumento de preços. Um aumento na Selic torna o crédito mais caro para as empresas e consumidores, reduzindo o consumo e investimentos. Ou seja, desacelera a economia, favorecendo a queda na inflação."},{"type":"paragraph","text":"Já a redução da Selic tem o efeito contrário, estimula o consumo e investimentos das empresas através do crédito mais barato, o que pode elevar o nível de emprego. Por outro lado, isso também pode ter uma repercussão negativa para o risco de inflação já que o aumento de renda disponível da população pode elevar os preços."},{"type":"paragraph","text":"No chamado ciclo econômico, há muitas variáveis a se observar, dentro e fora do País. Mas isso é tema para outra conversa."},{"type":"paragraph","text":"Palavras-chave: BC, Copom, Selic, inflação"}]'::jsonb, 'fabiana-holtz', 'Fabiana Holtz', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/dia-de-copom-o-que-e-selic-e-como-funciona-a-decisao-de-juros.html', '2025-05-06T14:35:00-03:00'::timestamptz, false, 'economia-saude.webp', 'Entenda como funciona a decisão de juros e para que serve a taxa Selic', 'Divulgação Banco Central'),
    (3, 'BV-003', 'investimentos', 'como-investir-no-agronegocio-sem-ser-um-fazendeiro', 'Como investir no agronegócio sem ser um fazendeiro', 'Mercado de capitais oferece diversas opções para quem quer se expor ao agronegócio, setor que gera a maior fatia do PIB brasileiro', 'Investir no agro não é algo exclusivo para fazendeiros e produtores rurais. Você, como investidor pessoa física, também pode aplicar recursos em produtos voltados para o desenvolvimento do agronegócio e colher os frutos da produção brasileira.

O agronegócio é considerado o motor da economia brasileira , e não é para menos. Em 2022, esse setor foi responsável por 24,8% do Produto Interno Bruto (PIB) do País, de acordo com dados do Centro de Estudos Avançados em Economia Aplicada (Cepea).

A seguir, conheça algumas formas de aplicar em agronegócio.

Letra de Crédito do Agronegócio (LCA)

As Letras de Crédito do Agronegócio (LCAs) são títulos emitidos por bancos para financiar operações de crédito para o setor agrícola. Geralmente são títulos pós-fixados e atrelados à taxa de Depósito Interfinanceiro (DI), que por sua vez costuma seguir a própria taxa básica de juros da economia (Selic). Nesse caso, eles pagariam, na data de vencimento, uma remuneração baseada em um porcentual do CDI.

Também existem LCA prefixados, com um rendimento já conhecido no dia do aporte, ou híbridos, com rendimento da inflação (IPCA) mais uma taxa fixa.

Os LCAs são tidos como títulos de baixo risco e com a vantagem de isenção de Imposto de Renda (IR), já que são considerados pelo governo como estratégicos, por financiar a atividade do agronegócio.

O estoque desses títulos cresceu 49% no Brasil, saindo de R$ 283,77 bilhões registrados em julho de 2022 para R$ 423,88 bilhões neste ano, de acordo com o Ministério da Agricultura e Pecuária (MAPA).

Certificado de Recebíveis do Agronegócio (CRA)

Os Certificados de Recebíveis do Agronegócio (CRAs) são títulos securitizados de renda fixa. Securitização é a transformação de créditos a receber em títulos que podem ser comprados por investidores no mercado. Neste caso, um produtor rural transforma o pagamento que tem a receber dos compradores de suas futuras safras em títulos negociáveis no mercado. Com isso, ele adianta o recebimento que teria e eleva seu fluxo de caixa. Em troca, paga uma taxa de juros ao investidor que comprou os CRAs. Assim como o LCA, o CRA é isento de IR.

- Leia também: CRIs e CRAs: conheça esse títulos de renda fixa isentos de IR

Em julho deste ano, segundo o MAPA, o estoque total de CRAs aumentou 28% na base anual, para R$ 110,89 bilhões.

Fundo de Investimento nas Cadeias Produtivas Agroindustriais (Fiagro)

Os Fiagros são fundos que captam recursos para investir em ativos ligados ao agronegócio. Eles foram criados em 2021, por meio da Lei nº 14.130 , com o objetivo de facilitar o acesso do agronegócio a recursos do mercado financeiro.

Em julho, o patrimônio dos Fiagros aumentou 170% na comparação anual segundo o MAPA, passando atingindo R$ 15,4 bilhões.

Os Fiagros listados para negociação na B3 são divididos em três tipos:

Fiagro de Direitos Creditórios (Fiagro-FIDC)

Investe em direitos creditórios da indústria agropecuária, assim como o CRA. A diferença é que os FIDCs são fundos de renda variável, cujos recursos são administrados por um gestor, que poderá comprar ou vender direitos creditórios de acordo com as oportunidades de mercado.

Fiagro Imobiliário (Fiagro-FII)

Investe em propriedades imobiliárias agrícolas, obtendo ganhos com a valorização desses ativos;

Fiagro de Participações (Fiagro-FIP)

Investe na participação em empresas do setor agropecuário, sejam elas de capital aberto ou fechado. Os FIPs normalmente são veículos de investimento de fundos de Private Equity ou Venture Capital, que focam seus investimentos em empresas que estão em fase de desenvolvimento.

Ações do setor de agronegócio na bolsa

O investidor que prefere se expor ao agronegócio por meio da renda variável encontra várias ações listadas na B3, incluindo produtoras de grãos, proteínas, maquinário e insumos agrícolas, além de silos e armazenagem de grãos. Há também outras empresas que lidam indiretamente com o agronegócio para sustentar suas atividades principais, como é o caso da indústria de papel e celulose e indústria da moda.

A BB Asset oferece o fundo de índice (ETF) AGRI11, que tem como mandato seguir o desempenho do Índice Agronegócio B3 (IAGRO), composto por empresas expostas ao agronegócio.

Atualmente, as cinco principais ações do IAGRO em termos de participação são JBS ON (JBSS3), Suzano ON (SUZB3), Klabin Unit (KLBN11), Cosan ON (CSAN3) e Ambev ON (ABEV3).

Acompanhe as atualizações do setor agro no InvesTalk', '[{"type":"paragraph","text":"Investir no agro não é algo exclusivo para fazendeiros e produtores rurais. Você, como investidor pessoa física, também pode aplicar recursos em produtos voltados para o desenvolvimento do agronegócio e colher os frutos da produção brasileira."},{"type":"paragraph","text":"O agronegócio é considerado o motor da economia brasileira , e não é para menos. Em 2022, esse setor foi responsável por 24,8% do Produto Interno Bruto (PIB) do País, de acordo com dados do Centro de Estudos Avançados em Economia Aplicada (Cepea)."},{"type":"paragraph","text":"A seguir, conheça algumas formas de aplicar em agronegócio."},{"type":"paragraph","text":"Letra de Crédito do Agronegócio (LCA)"},{"type":"paragraph","text":"As Letras de Crédito do Agronegócio (LCAs) são títulos emitidos por bancos para financiar operações de crédito para o setor agrícola. Geralmente são títulos pós-fixados e atrelados à taxa de Depósito Interfinanceiro (DI), que por sua vez costuma seguir a própria taxa básica de juros da economia (Selic). Nesse caso, eles pagariam, na data de vencimento, uma remuneração baseada em um porcentual do CDI."},{"type":"paragraph","text":"Também existem LCA prefixados, com um rendimento já conhecido no dia do aporte, ou híbridos, com rendimento da inflação (IPCA) mais uma taxa fixa."},{"type":"paragraph","text":"Os LCAs são tidos como títulos de baixo risco e com a vantagem de isenção de Imposto de Renda (IR), já que são considerados pelo governo como estratégicos, por financiar a atividade do agronegócio."},{"type":"paragraph","text":"O estoque desses títulos cresceu 49% no Brasil, saindo de R$ 283,77 bilhões registrados em julho de 2022 para R$ 423,88 bilhões neste ano, de acordo com o Ministério da Agricultura e Pecuária (MAPA)."},{"type":"paragraph","text":"Certificado de Recebíveis do Agronegócio (CRA)"},{"type":"paragraph","text":"Os Certificados de Recebíveis do Agronegócio (CRAs) são títulos securitizados de renda fixa. Securitização é a transformação de créditos a receber em títulos que podem ser comprados por investidores no mercado. Neste caso, um produtor rural transforma o pagamento que tem a receber dos compradores de suas futuras safras em títulos negociáveis no mercado. Com isso, ele adianta o recebimento que teria e eleva seu fluxo de caixa. Em troca, paga uma taxa de juros ao investidor que comprou os CRAs. Assim como o LCA, o CRA é isento de IR."},{"type":"paragraph","text":"- Leia também: CRIs e CRAs: conheça esse títulos de renda fixa isentos de IR"},{"type":"paragraph","text":"Em julho deste ano, segundo o MAPA, o estoque total de CRAs aumentou 28% na base anual, para R$ 110,89 bilhões."},{"type":"paragraph","text":"Fundo de Investimento nas Cadeias Produtivas Agroindustriais (Fiagro)"},{"type":"paragraph","text":"Os Fiagros são fundos que captam recursos para investir em ativos ligados ao agronegócio. Eles foram criados em 2021, por meio da Lei nº 14.130 , com o objetivo de facilitar o acesso do agronegócio a recursos do mercado financeiro."},{"type":"paragraph","text":"Em julho, o patrimônio dos Fiagros aumentou 170% na comparação anual segundo o MAPA, passando atingindo R$ 15,4 bilhões."},{"type":"paragraph","text":"Os Fiagros listados para negociação na B3 são divididos em três tipos:"},{"type":"paragraph","text":"Fiagro de Direitos Creditórios (Fiagro-FIDC)"},{"type":"paragraph","text":"Investe em direitos creditórios da indústria agropecuária, assim como o CRA. A diferença é que os FIDCs são fundos de renda variável, cujos recursos são administrados por um gestor, que poderá comprar ou vender direitos creditórios de acordo com as oportunidades de mercado."},{"type":"paragraph","text":"Fiagro Imobiliário (Fiagro-FII)"},{"type":"paragraph","text":"Investe em propriedades imobiliárias agrícolas, obtendo ganhos com a valorização desses ativos;"},{"type":"paragraph","text":"Fiagro de Participações (Fiagro-FIP)"},{"type":"paragraph","text":"Investe na participação em empresas do setor agropecuário, sejam elas de capital aberto ou fechado. Os FIPs normalmente são veículos de investimento de fundos de Private Equity ou Venture Capital, que focam seus investimentos em empresas que estão em fase de desenvolvimento."},{"type":"paragraph","text":"Ações do setor de agronegócio na bolsa"},{"type":"paragraph","text":"O investidor que prefere se expor ao agronegócio por meio da renda variável encontra várias ações listadas na B3, incluindo produtoras de grãos, proteínas, maquinário e insumos agrícolas, além de silos e armazenagem de grãos. Há também outras empresas que lidam indiretamente com o agronegócio para sustentar suas atividades principais, como é o caso da indústria de papel e celulose e indústria da moda."},{"type":"paragraph","text":"A BB Asset oferece o fundo de índice (ETF) AGRI11, que tem como mandato seguir o desempenho do Índice Agronegócio B3 (IAGRO), composto por empresas expostas ao agronegócio."},{"type":"paragraph","text":"Atualmente, as cinco principais ações do IAGRO em termos de participação são JBS ON (JBSS3), Suzano ON (SUZB3), Klabin Unit (KLBN11), Cosan ON (CSAN3) e Ambev ON (ABEV3)."},{"type":"paragraph","text":"Acompanhe as atualizações do setor agro no InvesTalk"}]'::jsonb, 'gustavo-boldrini', 'Gustavo Boldrini', 'InvesTalk - Banco do Brasil', 'https://investalk.bb.com.br/noticias/quero-aprender/como-investir-no-agronegocio-sem-ser-um-fazendeiro', '2023-11-01T12:03:00-03:00'::timestamptz, false, 'fundos-investimento.webp', 'Imagem editorial relacionada a investimentos.', null),
    (4, 'BV-004', 'investimentos', 'o-que-sao-precatorios-e-como-investir-em-ativos-judiciais', 'O que são precatórios e como investir em ativos judiciais', 'Investimento "100% brasileiro", precatório é considerado um investimento híbrido com baixo risco, mas também baixa liquidez', 'Investir em dívidas do governo não significa apenas aportar recursos no Tesouro Direto . Existe também a possibilidade de obter rendimentos comprando dívidas referentes às indenizações que o governo tem que pagar a cidadãos ou empresas, os chamados precatórios.

Em fevereiro, o governo federal desembolsou R$ 30,1 bilhões para pagar os precatórios referentes a este ano , que estavam previstos no Orçamento de 2024 aprovado no fim do ano passado. O pagamento foi antecipado pela União, que abriu crédito suplementar de R$ 10,7 bilhões para isso.

Os precatórios são uma "jabuticaba", no jargão popular, algo que só tem no Brasil. Em outros países, geralmente os entes públicos são obrigados a desembolsar na hora os pagamentos que devem em ações judiciais. Aqui, o mecanismo de precatório existe para preservar o caixa dos entes federativos e garantir que os pagamentos sejam feitos de forma escalonada.

O que são precatórios?

Numa definição simplificada, os precatórios são valores referentes a ações judiciais que o governo deve para pessoas físicas ou empresas. Geralmente são indenizações que se originam de ações na Justiça movidas por cidadãos ou pessoas jurídicas contra a União ou Estados e municípios.

O precatório só é emitido quando há trânsito em julgado de uma ação, ou seja, quando todos os recursos já foram esgotados. E aí essa obrigação entra em uma fila de pagamentos, que pode levar meses ou anos. Também vai depender do tipo da despesa e do ente que está devendo . Mas fato é que, quem tem precatórios, geralmente, precisa de paciência até receber o valor.

Trata-se de "uma ordem que o judiciário expede para o poder público ali envolvido na ação judicial para que ele pague determinado valor àquela pessoa/empresa que teve sucesso na ação", explica José Arnaldo da Fonseca, especialista em Direito Civil e Tributário e sócio do Godke Advogados.

Leia também: O que é recuperação judicial e qual o impacto nas ações

Como funciona o investimento em precatórios?

Como costuma demorar bastante tempo para ocorrer o pagamento do precatório pelo governo, nesse ínterim é que entra a possibilidade do investimento. Sabe aquele ditado popular que diz que "mais vale um passarinho na mão do que dois voando"? É essa a ideia.

Imagine que você venceu tem a receber um precatório, fruto de algum processo na Justiça. A data de pagamento dessa quantia é incerta, já que ele entrará em uma fila que pode durar anos. Caso precise logo do dinheiro, você pode negociar o direito desse precatório com algum investidor, que normalmente oferece um valor menor em troca para te pagar, em troca do risco, e ele é quem fica com a titularidade do ativo.

O investidor, neste caso, comprará o precatório, passará a ser titular dele e terá como desafio administrar a paciência até que o governo faça o pagamento. Mas é aqui que entra o principal diferencial deste tipo de investimento: além do deságio pago em relação ao valor de face do precatório, existe uma correção deste pagamento pela taxa básica de juros, a Selic .

- Caso você seja o investidor interessado, existem alguns caminhos, a seguir.

Onde achar precatórios para investir

Há basicamente duas formas de investir em precatórios, direta ou indiretamente. Há Fundos de Investimento em Direitos Creditórios (FIDC) com exposição a precatórios e ativos judiciais na carteira. Para saber quais os tipos e avaliar os riscos, é preciso que o investidor analise bem as informações daquele fundo.

Vale entender também: Conservador, moderado, arrojado ou agressivo? Descubra seu perfil de investidor

É também possível ter o precatório diretamente em mãos, via empresas especializadas na negociação de ativos judiciais ou com escritórios de advocacia. Nesse caso, deve-se assinar um contrato em cartório que ateste a venda daquele precatório e o direito ao recebimento do dinheiro quando o ente federativo fizer o pagamento.

"Isso deve ser cercado de cuidados, deve haver uma verificação da efetiva existência do precatório, do efetivo direito daquele credor, de inexistência, às vezes, de terceiros que já tiveram ou já compraram aquele crédito, e por aí vai", comenta o advogado José Arnaldo da Fonseca, do Godke Advogados.

"Se você pensa em entrar nesse mercado, é fundamental entender seu fornecedor, se ele analisou o ativo, como a fila de pagamentos funciona, qual é o modelo preditivo utilizado para saber o prazo de pagamento", diz Valter Police, planejador financeiro e gerente da Droom Planner, que é especializada em ativos judiciais.

Uma novidade neste meio dos ativos judiciais é a tokenização . Como geralmente as dívidas são de um valor alto, pode ser difícil para pessoas físicas sem tanto poder aquisitivo terem acesso a este mercado. Com a tokenização, esses precatórios são fracionados em diversas partes, e sua titularidade é transferida para o comprador por meio de uma rede blockchain, como a Ethereum, por exemplo. "A rede blockchain funciona como uma espécie de cartório virtual, só que mais barata e mais fácil, além de ser bem segura", diz Valter Police.

Qual é o nível de risco do investimento em precatórios?

O precatório pode ser considerado um título híbrido, já que tem rentabilidade atrelada à taxa Selic mais o deságio pago ao vendedor daquela dívida estatal. Como tem valor estipulado, o risco de oscilação do preço é praticamente nulo. Também o risco de crédito de um precatório é baixo, segundo os especialistas. Isso porque o emissor daquela dívida é um ente federativo, que tem a obrigatoriedade de cumprir com aquele pagamento.

O maior risco é o de liquidez , uma vez que o pagamento dependerá da fila de desembolsos da União, do Estado ou do município. Com isso, pode-se dizer que o investidor que coloca seu dinheiro em precatórios está trocando o risco de crédito por um risco de liquidez.

E como saber se esse risco é maior ou menor? "Depende do ente público do qual virá o dinheiro, ou seja, se ele é federal, estadual ou municipal. Dependendo de como procede em cada um dos entes, haverá uma demora maior", diz o advogado José Arnaldo da Fonseca.

De acordo com o especialista, o poder público federal costuma pagar os precatórios em dia, apesar da Proposta de Emenda à Constituição (PEC) criada pelo governo do ex-presidente Jair Bolsonaro, em 2021, que criou um parcelamento para o pagamento dessas dívidas. No fim do ano passado, o Supremo Tribunal Federal (STF) derrubou as alterações promovidas no regime do pagamento de precatórios, e desde então o ritmo tem se normalizado na esfera da União. Já nos planos estadual e municipal, há casos de bastante atraso, podendo levar anos para pagar, segundo Fonseca.', '[{"type":"paragraph","text":"Investir em dívidas do governo não significa apenas aportar recursos no Tesouro Direto . Existe também a possibilidade de obter rendimentos comprando dívidas referentes às indenizações que o governo tem que pagar a cidadãos ou empresas, os chamados precatórios."},{"type":"paragraph","text":"Em fevereiro, o governo federal desembolsou R$ 30,1 bilhões para pagar os precatórios referentes a este ano , que estavam previstos no Orçamento de 2024 aprovado no fim do ano passado. O pagamento foi antecipado pela União, que abriu crédito suplementar de R$ 10,7 bilhões para isso."},{"type":"paragraph","text":"Os precatórios são uma \"jabuticaba\", no jargão popular, algo que só tem no Brasil. Em outros países, geralmente os entes públicos são obrigados a desembolsar na hora os pagamentos que devem em ações judiciais. Aqui, o mecanismo de precatório existe para preservar o caixa dos entes federativos e garantir que os pagamentos sejam feitos de forma escalonada."},{"type":"paragraph","text":"O que são precatórios?"},{"type":"paragraph","text":"Numa definição simplificada, os precatórios são valores referentes a ações judiciais que o governo deve para pessoas físicas ou empresas. Geralmente são indenizações que se originam de ações na Justiça movidas por cidadãos ou pessoas jurídicas contra a União ou Estados e municípios."},{"type":"paragraph","text":"O precatório só é emitido quando há trânsito em julgado de uma ação, ou seja, quando todos os recursos já foram esgotados. E aí essa obrigação entra em uma fila de pagamentos, que pode levar meses ou anos. Também vai depender do tipo da despesa e do ente que está devendo . Mas fato é que, quem tem precatórios, geralmente, precisa de paciência até receber o valor."},{"type":"paragraph","text":"Trata-se de \"uma ordem que o judiciário expede para o poder público ali envolvido na ação judicial para que ele pague determinado valor àquela pessoa/empresa que teve sucesso na ação\", explica José Arnaldo da Fonseca, especialista em Direito Civil e Tributário e sócio do Godke Advogados."},{"type":"paragraph","text":"Leia também: O que é recuperação judicial e qual o impacto nas ações"},{"type":"paragraph","text":"Como funciona o investimento em precatórios?"},{"type":"paragraph","text":"Como costuma demorar bastante tempo para ocorrer o pagamento do precatório pelo governo, nesse ínterim é que entra a possibilidade do investimento. Sabe aquele ditado popular que diz que \"mais vale um passarinho na mão do que dois voando\"? É essa a ideia."},{"type":"paragraph","text":"Imagine que você venceu tem a receber um precatório, fruto de algum processo na Justiça. A data de pagamento dessa quantia é incerta, já que ele entrará em uma fila que pode durar anos. Caso precise logo do dinheiro, você pode negociar o direito desse precatório com algum investidor, que normalmente oferece um valor menor em troca para te pagar, em troca do risco, e ele é quem fica com a titularidade do ativo."},{"type":"paragraph","text":"O investidor, neste caso, comprará o precatório, passará a ser titular dele e terá como desafio administrar a paciência até que o governo faça o pagamento. Mas é aqui que entra o principal diferencial deste tipo de investimento: além do deságio pago em relação ao valor de face do precatório, existe uma correção deste pagamento pela taxa básica de juros, a Selic ."},{"type":"paragraph","text":"- Caso você seja o investidor interessado, existem alguns caminhos, a seguir."},{"type":"paragraph","text":"Onde achar precatórios para investir"},{"type":"paragraph","text":"Há basicamente duas formas de investir em precatórios, direta ou indiretamente. Há Fundos de Investimento em Direitos Creditórios (FIDC) com exposição a precatórios e ativos judiciais na carteira. Para saber quais os tipos e avaliar os riscos, é preciso que o investidor analise bem as informações daquele fundo."},{"type":"paragraph","text":"Vale entender também: Conservador, moderado, arrojado ou agressivo? Descubra seu perfil de investidor"},{"type":"paragraph","text":"É também possível ter o precatório diretamente em mãos, via empresas especializadas na negociação de ativos judiciais ou com escritórios de advocacia. Nesse caso, deve-se assinar um contrato em cartório que ateste a venda daquele precatório e o direito ao recebimento do dinheiro quando o ente federativo fizer o pagamento."},{"type":"paragraph","text":"\"Isso deve ser cercado de cuidados, deve haver uma verificação da efetiva existência do precatório, do efetivo direito daquele credor, de inexistência, às vezes, de terceiros que já tiveram ou já compraram aquele crédito, e por aí vai\", comenta o advogado José Arnaldo da Fonseca, do Godke Advogados."},{"type":"paragraph","text":"\"Se você pensa em entrar nesse mercado, é fundamental entender seu fornecedor, se ele analisou o ativo, como a fila de pagamentos funciona, qual é o modelo preditivo utilizado para saber o prazo de pagamento\", diz Valter Police, planejador financeiro e gerente da Droom Planner, que é especializada em ativos judiciais."},{"type":"paragraph","text":"Uma novidade neste meio dos ativos judiciais é a tokenização . Como geralmente as dívidas são de um valor alto, pode ser difícil para pessoas físicas sem tanto poder aquisitivo terem acesso a este mercado. Com a tokenização, esses precatórios são fracionados em diversas partes, e sua titularidade é transferida para o comprador por meio de uma rede blockchain, como a Ethereum, por exemplo. \"A rede blockchain funciona como uma espécie de cartório virtual, só que mais barata e mais fácil, além de ser bem segura\", diz Valter Police."},{"type":"paragraph","text":"Qual é o nível de risco do investimento em precatórios?"},{"type":"paragraph","text":"O precatório pode ser considerado um título híbrido, já que tem rentabilidade atrelada à taxa Selic mais o deságio pago ao vendedor daquela dívida estatal. Como tem valor estipulado, o risco de oscilação do preço é praticamente nulo. Também o risco de crédito de um precatório é baixo, segundo os especialistas. Isso porque o emissor daquela dívida é um ente federativo, que tem a obrigatoriedade de cumprir com aquele pagamento."},{"type":"paragraph","text":"O maior risco é o de liquidez , uma vez que o pagamento dependerá da fila de desembolsos da União, do Estado ou do município. Com isso, pode-se dizer que o investidor que coloca seu dinheiro em precatórios está trocando o risco de crédito por um risco de liquidez."},{"type":"paragraph","text":"E como saber se esse risco é maior ou menor? \"Depende do ente público do qual virá o dinheiro, ou seja, se ele é federal, estadual ou municipal. Dependendo de como procede em cada um dos entes, haverá uma demora maior\", diz o advogado José Arnaldo da Fonseca."},{"type":"paragraph","text":"De acordo com o especialista, o poder público federal costuma pagar os precatórios em dia, apesar da Proposta de Emenda à Constituição (PEC) criada pelo governo do ex-presidente Jair Bolsonaro, em 2021, que criou um parcelamento para o pagamento dessas dívidas. No fim do ano passado, o Supremo Tribunal Federal (STF) derrubou as alterações promovidas no regime do pagamento de precatórios, e desde então o ritmo tem se normalizado na esfera da União. Já nos planos estadual e municipal, há casos de bastante atraso, podendo levar anos para pagar, segundo Fonseca."}]'::jsonb, 'gustavo-boldrini', 'Gustavo Boldrini', 'InvesTalk - Banco do Brasil', 'https://investalk.bb.com.br/noticias/mercado/o-que-sao-precatorios-e-como-investir-em-ativos-judiciais', '2024-09-26T15:10:00-03:00'::timestamptz, false, 'fundos-investimento.webp', 'Imagem editorial relacionada a investimentos.', null),
    (5, 'BV-005', 'investimentos', 'cade-o-gringo-saida-do-investidor-estrangeiro-da-bolsa', 'Cadê o gringo? Entenda a saída recente do investidor estrangeiro da Bolsa', 'A euforia do investidor gringo com a Bolsa brasileira, que levou o Ibovespa a sucessivos recordes em abril, arrefeceu ao longo dos últimos dois meses, levantando uma dúvida no mercado: será que acabou o interesse do capital estrangeiro por ativos domésticos?', 'A euforia do investidor gringo com a Bolsa brasileira, que levou o Ibovespa a sucessivos recordes em abril, arrefeceu ao longo dos últimos dois meses, levantando uma dúvida no mercado: será que acabou o interesse do capital estrangeiro por ativos domésticos?

Maio foi o primeiro mês do ano em que a Bolsa local registrou saldo negativo de investimentos estrangeiros - ou seja, mais vendas do que compras de ações: foram retirados R$ 14,9 bilhões, segundo dados da B3 . Em junho, até o pregão da última sexta-feira (19), os gringos retiraram um saldo líquido de R$ 4,373 bilhões do mercado brasileiro de ações.

Como a Bolsa brasileira tem forte dependência do fluxo de investimento externo, o Ibovespa tem refletido esse menor apetite dos estrangeiros . Somente em maio, o índice de referência da Bolsa caiu mais de 7%, marcando a desvalorização mensal mais acentuada desde fevereiro de 2023. Este mês, até o fechamento desta segunda-feira (22), a queda acumulada do Ibovespa era de mais de 2% .

Afinal, o gringo perdeu de vez o interesse pelo Brasil ou se trata de um movimento puramente técnico?

A debandada os gringos

A saída de recursos do investidor estrangeiro do País segue um movimento inverso ao observado entre março e abril, primeiros meses da guerra entre os Estados Unidos e o Irã. Na ocasião, a cautela em relação às ações nas bolsas de Nova York, diante das incertezas causadas pelo conflito, levou investidores a buscarem mercados emergentes, como o Brasil. Agora, a situação se inverteu.

"Temos visto a saída de parte do investidor estrangeiro que havia entrado com mais força em setores como financeiro, commodities e elétricas, com retorno para tecnologia. É um movimento mais fluido, de entrada e saída. Por isso, é provável que este movimento de saída esteja se aproximando do fim", avalia Gustavo Trotta, especialista e sócio da Valor Investimentos.

A volta da euforia do investidor global com ativos de tecnologia marcou os últimos dois meses, em meio a mais um balanço positivo da gigante Nvidia e a abertura de capital da SpaceX - levando os índices S&P 500 e Nasdaq a novos recordes.

"O que vemos agora, principalmente do lado do estrangeiro, é que parte daquele grande fluxo que entrou [na Bolsa brasileira] já teve uma saída relevante. Esse é o movimento do que chamamos de smart money , que vem voltando para empresas de tecnologia e inteligência artificial, saindo de emergentes e de commodities", aponta Rodrigo Moliterno, head de renda variável e sócio da Veedha Investimentos.

Quais são as perspectivas para a Bolsa brasileira?

Segundo Moliterno, a questão dos juros nos Estados Unidos é determinante para o futuro desse fluxo de recursos estrangeiros e, consequentemente, para a Bolsa.

Afinal, se por um lado o cessar-fogo entre EUA e Irã pode trazer alívio,** ainda há um cenário de inflação incerto na maior economia do mundo, o que pode levar o Federal Reserve (Fed, o banco central americano) a subir os juros ainda neste ano**. E essa indefinição os EUA acaba afetando também as perspectivas para taxa de juros brasileira (Selic) .

"O mercado tenta entender melhor qual deve ser a trajetória dos juros no exterior, algo que impacta significativamente o resto do mundo, e, ao mesmo tempo, avaliar se aqui também será possível manter uma trajetória de queda, a depender do cenário lá fora e da evolução da inflação, do emprego e de outros indicadores. A tendência é de acomodação", afirma o especialista da Veedha Investimentos.

Para Gustavo Trotta, da Valor Investimentos, o mercado pode voltar a observar oportunidades de alocação em ativos que estejam descontados na Bolsa brasileira após as quedas recentes.

No entanto, ele lembra que "o entusiasmo pode ser menor do que no começo do ano", devido a fatores domésticos que trazem incertezas, especialmente as eleições.

Invista agora com app

Baixe o app Investimentos BB pra investir com praticidade e segurança', '[{"type":"paragraph","text":"A euforia do investidor gringo com a Bolsa brasileira, que levou o Ibovespa a sucessivos recordes em abril, arrefeceu ao longo dos últimos dois meses, levantando uma dúvida no mercado: será que acabou o interesse do capital estrangeiro por ativos domésticos?"},{"type":"paragraph","text":"Maio foi o primeiro mês do ano em que a Bolsa local registrou saldo negativo de investimentos estrangeiros - ou seja, mais vendas do que compras de ações: foram retirados R$ 14,9 bilhões, segundo dados da B3 . Em junho, até o pregão da última sexta-feira (19), os gringos retiraram um saldo líquido de R$ 4,373 bilhões do mercado brasileiro de ações."},{"type":"paragraph","text":"Como a Bolsa brasileira tem forte dependência do fluxo de investimento externo, o Ibovespa tem refletido esse menor apetite dos estrangeiros . Somente em maio, o índice de referência da Bolsa caiu mais de 7%, marcando a desvalorização mensal mais acentuada desde fevereiro de 2023. Este mês, até o fechamento desta segunda-feira (22), a queda acumulada do Ibovespa era de mais de 2% ."},{"type":"paragraph","text":"Afinal, o gringo perdeu de vez o interesse pelo Brasil ou se trata de um movimento puramente técnico?"},{"type":"paragraph","text":"A debandada os gringos"},{"type":"paragraph","text":"A saída de recursos do investidor estrangeiro do País segue um movimento inverso ao observado entre março e abril, primeiros meses da guerra entre os Estados Unidos e o Irã. Na ocasião, a cautela em relação às ações nas bolsas de Nova York, diante das incertezas causadas pelo conflito, levou investidores a buscarem mercados emergentes, como o Brasil. Agora, a situação se inverteu."},{"type":"paragraph","text":"\"Temos visto a saída de parte do investidor estrangeiro que havia entrado com mais força em setores como financeiro, commodities e elétricas, com retorno para tecnologia. É um movimento mais fluido, de entrada e saída. Por isso, é provável que este movimento de saída esteja se aproximando do fim\", avalia Gustavo Trotta, especialista e sócio da Valor Investimentos."},{"type":"paragraph","text":"A volta da euforia do investidor global com ativos de tecnologia marcou os últimos dois meses, em meio a mais um balanço positivo da gigante Nvidia e a abertura de capital da SpaceX - levando os índices S&P 500 e Nasdaq a novos recordes."},{"type":"paragraph","text":"\"O que vemos agora, principalmente do lado do estrangeiro, é que parte daquele grande fluxo que entrou [na Bolsa brasileira] já teve uma saída relevante. Esse é o movimento do que chamamos de smart money , que vem voltando para empresas de tecnologia e inteligência artificial, saindo de emergentes e de commodities\", aponta Rodrigo Moliterno, head de renda variável e sócio da Veedha Investimentos."},{"type":"paragraph","text":"Quais são as perspectivas para a Bolsa brasileira?"},{"type":"paragraph","text":"Segundo Moliterno, a questão dos juros nos Estados Unidos é determinante para o futuro desse fluxo de recursos estrangeiros e, consequentemente, para a Bolsa."},{"type":"paragraph","text":"Afinal, se por um lado o cessar-fogo entre EUA e Irã pode trazer alívio,** ainda há um cenário de inflação incerto na maior economia do mundo, o que pode levar o Federal Reserve (Fed, o banco central americano) a subir os juros ainda neste ano**. E essa indefinição os EUA acaba afetando também as perspectivas para taxa de juros brasileira (Selic) ."},{"type":"paragraph","text":"\"O mercado tenta entender melhor qual deve ser a trajetória dos juros no exterior, algo que impacta significativamente o resto do mundo, e, ao mesmo tempo, avaliar se aqui também será possível manter uma trajetória de queda, a depender do cenário lá fora e da evolução da inflação, do emprego e de outros indicadores. A tendência é de acomodação\", afirma o especialista da Veedha Investimentos."},{"type":"paragraph","text":"Para Gustavo Trotta, da Valor Investimentos, o mercado pode voltar a observar oportunidades de alocação em ativos que estejam descontados na Bolsa brasileira após as quedas recentes."},{"type":"paragraph","text":"No entanto, ele lembra que \"o entusiasmo pode ser menor do que no começo do ano\", devido a fatores domésticos que trazem incertezas, especialmente as eleições."},{"type":"paragraph","text":"Invista agora com app"},{"type":"paragraph","text":"Baixe o app Investimentos BB pra investir com praticidade e segurança"}]'::jsonb, 'gustavo-boldrini', 'Gustavo Boldrini', 'InvesTalk - Banco do Brasil', 'https://investalk.bb.com.br/noticias/mercado/cade-o-gringo-entenda-a-saida-recente-do-investidor-estrangeiro-da-bolsa', '2026-06-23T15:27:00-03:00'::timestamptz, false, 'fundos-investimento.webp', 'Imagem editorial relacionada a investimentos.', null),
    (6, 'BV-006', 'alerta-de-golpes', 'caiu-em-um-golpe-na-internet-guia-certbr', 'Caiu em um golpe na internet? Novo guia oficial ensina o que fazer', 'São Paulo - Se você já transferiu dinheiro, repassou dados pessoais ou acessou um link suspeito e depois percebeu que era uma fraude, agir com rapidez é fundamental para evitar que os golpistas façam novas vítimas e ampliem seus danos.', 'São Paulo - Se você já transferiu dinheiro, repassou dados pessoais ou acessou um link suspeito e depois percebeu que era uma fraude, agir com rapidez é fundamental para evitar que os golpistas façam novas vítimas e ampliem seus danos. Para ajudar e orientar a população diante dessas situações, o Centro de Estudos, Resposta e Tratamento de Incidentes de Segurança no Brasil (CERT.br), do Núcleo de Informação e Coordenação do Ponto BR (NIC.br), lançou um novo material intitulado "Golpes: Caiu? Veja o que Fazer".

O QUE CONTÉM O NOVO MATERIAL?

O material atua como um manual de emergência, listando passos essenciais que, se executados de forma estratégica logo após o golpe, aumentam as chances da vítima de reduzir prejuízos financeiros e proteger sua privacidade. O guia destaca que a própria tecnologia, usada pelos criminosos, também possui mecanismos para conter danos.

As principais orientações do material incluem:

- Interromper o contato: não ceder a ameaças ou pedidos e bloquear os golpistas em todas as plataformas imediatamente;

- Guardar evidências: salvar prints, links, mensagens, perfis e comprovantes, que servirão como provas essenciais para reembolsos, estornos e processos na Justiça ou defesa do consumidor;

- Contestar transações rapidamente: acionar o Mecanismo Especial de Devolução (MED) do banco em casos de Pix ou entrar em contato com a operadora em caso de fraudes no cartão de crédito;

- Registrar Boletim de Ocorrência (BO): formalizar o crime na polícia anexando as evidências, um processo que muitas vezes pode ser feito de forma online;

- Monitorar a vida financeira: acompanhar contas, faturas e consultar o Registrato do Banco Central regularmente para identificar possíveis empréstimos, chaves Pix ou contas indevidas atreladas ao seu CPF;

- Trocar senhas: alterar credenciais comprometidas em serviços na Internet e habilitar a verificação em duas etapas para criar uma camada extra de proteção.

A publicação é o terceiro fascículo de uma série focada em fraudes e complementa os guias anteriores, "Golpes: Não se Deixe Enganar" e "Golpes: Evite Fraudes", que tinham o objetivo de ensinar o usuário a identificar golpes e entender as táticas de engenharia social dos criminosos.

Em conjunto com o novo documento, o projeto Cidadão na Rede também lançou dois vídeos curtos em animação focados em ensinar, de forma simples e visual, como contestar golpes envolvendo Pix e cartão de crédito.

COMO ACESSAR O CONTEÚDO?

O acesso ao fascículo e aos materiais em vídeo é totalmente gratuito. Para ler as orientações do guia "Golpes: Caiu? Veja o que Fazer" na íntegra, acesse: https://cartilha.cert.br/fasciculos/#golpes-o-que-fazer

Para assistir aos novos vídeos animados do Cidadão na Rede com dicas de contestação, acesse: https://cidadaonarede.nic.br/pt/videos/



Palavras-chave: CERT.br, fraude, Golpes digitais, guia, tecnologia', '[{"type":"paragraph","text":"São Paulo - Se você já transferiu dinheiro, repassou dados pessoais ou acessou um link suspeito e depois percebeu que era uma fraude, agir com rapidez é fundamental para evitar que os golpistas façam novas vítimas e ampliem seus danos. Para ajudar e orientar a população diante dessas situações, o Centro de Estudos, Resposta e Tratamento de Incidentes de Segurança no Brasil (CERT.br), do Núcleo de Informação e Coordenação do Ponto BR (NIC.br), lançou um novo material intitulado \"Golpes: Caiu? Veja o que Fazer\"."},{"type":"heading","text":"O QUE CONTÉM O NOVO MATERIAL?"},{"type":"paragraph","text":"O material atua como um manual de emergência, listando passos essenciais que, se executados de forma estratégica logo após o golpe, aumentam as chances da vítima de reduzir prejuízos financeiros e proteger sua privacidade. O guia destaca que a própria tecnologia, usada pelos criminosos, também possui mecanismos para conter danos."},{"type":"paragraph","text":"As principais orientações do material incluem:"},{"type":"paragraph","text":"- Interromper o contato: não ceder a ameaças ou pedidos e bloquear os golpistas em todas as plataformas imediatamente;"},{"type":"paragraph","text":"- Guardar evidências: salvar prints, links, mensagens, perfis e comprovantes, que servirão como provas essenciais para reembolsos, estornos e processos na Justiça ou defesa do consumidor;"},{"type":"paragraph","text":"- Contestar transações rapidamente: acionar o Mecanismo Especial de Devolução (MED) do banco em casos de Pix ou entrar em contato com a operadora em caso de fraudes no cartão de crédito;"},{"type":"paragraph","text":"- Registrar Boletim de Ocorrência (BO): formalizar o crime na polícia anexando as evidências, um processo que muitas vezes pode ser feito de forma online;"},{"type":"paragraph","text":"- Monitorar a vida financeira: acompanhar contas, faturas e consultar o Registrato do Banco Central regularmente para identificar possíveis empréstimos, chaves Pix ou contas indevidas atreladas ao seu CPF;"},{"type":"paragraph","text":"- Trocar senhas: alterar credenciais comprometidas em serviços na Internet e habilitar a verificação em duas etapas para criar uma camada extra de proteção."},{"type":"paragraph","text":"A publicação é o terceiro fascículo de uma série focada em fraudes e complementa os guias anteriores, \"Golpes: Não se Deixe Enganar\" e \"Golpes: Evite Fraudes\", que tinham o objetivo de ensinar o usuário a identificar golpes e entender as táticas de engenharia social dos criminosos."},{"type":"paragraph","text":"Em conjunto com o novo documento, o projeto Cidadão na Rede também lançou dois vídeos curtos em animação focados em ensinar, de forma simples e visual, como contestar golpes envolvendo Pix e cartão de crédito."},{"type":"heading","text":"COMO ACESSAR O CONTEÚDO?"},{"type":"paragraph","text":"O acesso ao fascículo e aos materiais em vídeo é totalmente gratuito. Para ler as orientações do guia \"Golpes: Caiu? Veja o que Fazer\" na íntegra, acesse: https://cartilha.cert.br/fasciculos/#golpes-o-que-fazer"},{"type":"paragraph","text":"Para assistir aos novos vídeos animados do Cidadão na Rede com dicas de contestação, acesse: https://cidadaonarede.nic.br/pt/videos/"},{"type":"paragraph","text":"Palavras-chave: CERT.br, fraude, Golpes digitais, guia, tecnologia"}]'::jsonb, 'emanuele-almeida', 'Emanuele Almeida', 'Viva - Tecnologia', 'https://viva.com.br/tecnologia/caiu-em-um-golpe-na-internet-novo-guia-do-certbr-ensina-o-que-fazer.html', '2026-05-28T11:14:00-03:00'::timestamptz, false, 'seguranca-fraudes.webp', 'Material atua como um manual de emergência, listando passos essenciais que, se executados de forma estratégica logo após o golpe', 'Reprodução/Nic.Br'),
    (7, 'BV-007', 'alerta-de-golpes', 'fomo-financeiro-pressao-das-redes-sociais', 'FOMO financeiro: como a pressão das redes sociais faz você investir errado', 'Dados da última edição do FInfluence , pesquisa organizada pela Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais (Anbima) em parceria com o Instituto Brasileiro de Pesquisa e Análise de Dados (IBPAD), mostram que, em pouco mais de…', 'Dados da última edição do FInfluence , pesquisa organizada pela Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais (Anbima) em parceria com o Instituto Brasileiro de Pesquisa e Análise de Dados (IBPAD), mostram que, em pouco mais de cinco anos, a audiência dos influenciadores digitais que tratam de temas relacionados às finanças saltou de 74 milhões para 310,7 milhões de seguidores, ou mais de 300% .

O estudo, cujo foco é o monitoramento de pessoas que falam de dinheiro no Brasil e abastecem redes sociais como YouTube, X, Instagram e Facebook, indicou que, no segundo semestre de 2025, foram publicados 468 mil conteúdos relacionados ao assunto nessas plataformas , quase o triplo do volume registrado em 2020, quando cerca de 160 mil posts foram mapeados.

Mas será que essa enxurrada de memes, stories, lives e afins não pode levar os menos avisados a embarcarem na ideia de que estão ficando para trás? Ou mesmo com aquela sensação recorrente de que todos à sua volta estão enriquecendo menos você?

Especialistas acreditam que sim e avaliam que o tal "medo de estar perdendo algo" (FOMO, na sigla em inglês), disseminado por meio das redes sociais, pode ampliar um comportamento impulsivo por parte dos investidores . Isso se daria, especialmente, entre os mais jovens, ao seguir, absorver e aplicar um conteúdo que, nem sempre, faz sentido para a sua realidade financeira.

Mais ansiosos e impulsivos

A educadora financeira Carol Stange acredita que as redes sociais estão criando uma geração de investidores mais ansiosos . Isso porque elas foram projetadas para maximizar engajamento, e conteúdo que provoca reação emocional forte, como inveja, urgência ou euforia, tem melhor desempenho nos algoritmos.

"No campo dos investimentos, isso se traduz em uma exposição sistemática a ganhos extraordinários e conquistas financeiras. O investidor médio, especialmente o mais jovem , acaba calibrando suas expectativas por exceções, não pela média", avalia.

Mas esse FOMO pode influenciar decisões financeiras ruins, tanto em investimentos quanto no consumo?

"O FOMO financeiro opera em duas frentes. Nos investimentos, ele empurra as pessoas a entrarem em posições depois que o movimento já aconteceu, exatamente o momento de maior risco. A lógica emocional é a de que todo mundo está ganhando com isso e não posso ficar de fora", explica Stange, segundo a qual, no consumo, a dinâmica é parecida, mas com consequências imediatas no orçamento.

"A comparação com o estilo de vida alheio, como viagens, restaurantes e produtos, cria uma pressão difusa, mas constante, para gastar além do planejado. O que muda é que o prejuízo aqui não precisa de volatilidade para acontecer, pois aparece no extrato no mês seguinte", acredita.

Em ambos os casos, a educadora financeira diz que a decisão não parte de uma necessidade real ou de uma análise racional, mas sim de um desconforto emocional.

Para Mônica Costa, fundadora da Negrana Finanças, as redes sociais podem influenciar decisões ruins relacionadas ao dinheiro porque mexem com uma sensação mais profunda . "Geram aquela sensação de que todo mundo está avançando, está se dando bem, e conseguindo fechar o mês no azul. Todo mundo está prosperando, menos eu", diz.

Ela reforça, entretanto, a contrariedade dessa máxima. "Quando a gente olha para os números, vê o volume de pessoas endividadas e com problemas financeiros no País, só que quem vai para esse ambiente das redes sociais, não vê essa realidade e acaba acreditando que é a única pessoa que não conseguiu resolver essa questão", explica Costa.

Dinheiro fácil? Será?

Mas seria possível listar os erros mais comuns cometidos por pessoas que investem após verem conteúdos indicando a possibilidade de "dinheiro fácil" no TikTok, Instagram ou YouTube ?

Para Mônica Costa, o erro mais grave e mais comum é justamente quando se acredita que o investimento pode ser visto como um atalho para a resolução de problemas financeiros que são urgentes.

"É importante que a gente tenha sempre muita nitidez de que o investimento é um processo de médio e de longo prazo para que se possa obter um resultado que seja saudável e satisfatório", reforça.

Carol Stange concorda e avalia que o primeiro erro é entrar em uma modalidade de investimento que foi indicada sem conhecer e entender aquele ativo . "A pessoa compra uma criptomoeda, uma ação específica ou um produto estruturado porque viu alguém mostrando o extrato, sem compreender o que está comprando, qual é o risco envolvido e em que cenário aquilo pode dar errado. Sem essa base, qualquer turbulência, por menor que seja, vira motivo para sair correndo", diz.

Ela lembra que o segundo erro é ignorar o próprio perfil e horizonte de tempo. "Conteúdo de redes sociais raramente contextualiza. Aquele resultado foi obtido em quanto tempo? Com quanto de capital? Com qual exposição a risco? Uma estratégia que funciona para alguém com reserva consolidada, alta tolerância a volatilidade e horizonte de dez anos pode ser desastrosa para quem tem o dinheiro do aluguel aplicado", lembra.

Para Stange, quem investe por influência tende a colocar uma parcela desproporcional do patrimônio em uma única aposta, justamente porque acredita que ela é "certa". " A diversificação , que é o principal mecanismo de proteção em qualquer carteira, é vista como cautela desnecessária. Até o dia em que não é", ressalta.

Fique longe das comparações

A educadora financeira acredita que há sinais muitos claros indicando que uma pessoa está sendo guiada mais pela comparação nas redes sociais do que pelo próprio planejamento financeiro.

"O primeiro é a instabilidade da carteira porque aquela pessoa troca de ativos com frequência, sempre migrando para o que está sendo comentado no momento, sem uma tese de saída definida para o que abandona. O segundo é a dissonância entre o que investe e o que conhece. Ela própria não consegue explicar o funcionamento do ativo com suas palavras".

Mônica Costa lembra que um indicativo importante nesse sentido é quando a pessoa começa a tomar decisões financeiras, olhando mais para a vida do outro do que para a própria realidade . "É a bendita comparação".

"Então ela compra, parcela, ou investe porque viu alguém fazendo, porque parece que todo mundo está vivendo melhor. A gente volta para a síndrome do FOMO. Vou fazer porque todo mundo faz. Ela tem a impressão de que todo mundo ganha mais, viaja mais, vive melhor do que ela. Então, tá enriquecendo mais rápido.

Para a educadora financeira, a ansiedade ao ver a conquista de outras pessoas ou pressa para mudar de vida sem ter clareza do próprio orçamento são inimigas nessa hora. "O alerta que a gente precisa deixar é o de que decisão financeira não pode nunca vir carregada de ansiedade, de vergonha ou de urgência", completa.

Invista agora com app

Baixe o app Investimentos BB pra investir com praticidade e segurança', '[{"type":"paragraph","text":"Dados da última edição do FInfluence , pesquisa organizada pela Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais (Anbima) em parceria com o Instituto Brasileiro de Pesquisa e Análise de Dados (IBPAD), mostram que, em pouco mais de cinco anos, a audiência dos influenciadores digitais que tratam de temas relacionados às finanças saltou de 74 milhões para 310,7 milhões de seguidores, ou mais de 300% ."},{"type":"paragraph","text":"O estudo, cujo foco é o monitoramento de pessoas que falam de dinheiro no Brasil e abastecem redes sociais como YouTube, X, Instagram e Facebook, indicou que, no segundo semestre de 2025, foram publicados 468 mil conteúdos relacionados ao assunto nessas plataformas , quase o triplo do volume registrado em 2020, quando cerca de 160 mil posts foram mapeados."},{"type":"paragraph","text":"Mas será que essa enxurrada de memes, stories, lives e afins não pode levar os menos avisados a embarcarem na ideia de que estão ficando para trás? Ou mesmo com aquela sensação recorrente de que todos à sua volta estão enriquecendo menos você?"},{"type":"paragraph","text":"Especialistas acreditam que sim e avaliam que o tal \"medo de estar perdendo algo\" (FOMO, na sigla em inglês), disseminado por meio das redes sociais, pode ampliar um comportamento impulsivo por parte dos investidores . Isso se daria, especialmente, entre os mais jovens, ao seguir, absorver e aplicar um conteúdo que, nem sempre, faz sentido para a sua realidade financeira."},{"type":"paragraph","text":"Mais ansiosos e impulsivos"},{"type":"paragraph","text":"A educadora financeira Carol Stange acredita que as redes sociais estão criando uma geração de investidores mais ansiosos . Isso porque elas foram projetadas para maximizar engajamento, e conteúdo que provoca reação emocional forte, como inveja, urgência ou euforia, tem melhor desempenho nos algoritmos."},{"type":"paragraph","text":"\"No campo dos investimentos, isso se traduz em uma exposição sistemática a ganhos extraordinários e conquistas financeiras. O investidor médio, especialmente o mais jovem , acaba calibrando suas expectativas por exceções, não pela média\", avalia."},{"type":"paragraph","text":"Mas esse FOMO pode influenciar decisões financeiras ruins, tanto em investimentos quanto no consumo?"},{"type":"paragraph","text":"\"O FOMO financeiro opera em duas frentes. Nos investimentos, ele empurra as pessoas a entrarem em posições depois que o movimento já aconteceu, exatamente o momento de maior risco. A lógica emocional é a de que todo mundo está ganhando com isso e não posso ficar de fora\", explica Stange, segundo a qual, no consumo, a dinâmica é parecida, mas com consequências imediatas no orçamento."},{"type":"paragraph","text":"\"A comparação com o estilo de vida alheio, como viagens, restaurantes e produtos, cria uma pressão difusa, mas constante, para gastar além do planejado. O que muda é que o prejuízo aqui não precisa de volatilidade para acontecer, pois aparece no extrato no mês seguinte\", acredita."},{"type":"paragraph","text":"Em ambos os casos, a educadora financeira diz que a decisão não parte de uma necessidade real ou de uma análise racional, mas sim de um desconforto emocional."},{"type":"paragraph","text":"Para Mônica Costa, fundadora da Negrana Finanças, as redes sociais podem influenciar decisões ruins relacionadas ao dinheiro porque mexem com uma sensação mais profunda . \"Geram aquela sensação de que todo mundo está avançando, está se dando bem, e conseguindo fechar o mês no azul. Todo mundo está prosperando, menos eu\", diz."},{"type":"paragraph","text":"Ela reforça, entretanto, a contrariedade dessa máxima. \"Quando a gente olha para os números, vê o volume de pessoas endividadas e com problemas financeiros no País, só que quem vai para esse ambiente das redes sociais, não vê essa realidade e acaba acreditando que é a única pessoa que não conseguiu resolver essa questão\", explica Costa."},{"type":"paragraph","text":"Dinheiro fácil? Será?"},{"type":"paragraph","text":"Mas seria possível listar os erros mais comuns cometidos por pessoas que investem após verem conteúdos indicando a possibilidade de \"dinheiro fácil\" no TikTok, Instagram ou YouTube ?"},{"type":"paragraph","text":"Para Mônica Costa, o erro mais grave e mais comum é justamente quando se acredita que o investimento pode ser visto como um atalho para a resolução de problemas financeiros que são urgentes."},{"type":"paragraph","text":"\"É importante que a gente tenha sempre muita nitidez de que o investimento é um processo de médio e de longo prazo para que se possa obter um resultado que seja saudável e satisfatório\", reforça."},{"type":"paragraph","text":"Carol Stange concorda e avalia que o primeiro erro é entrar em uma modalidade de investimento que foi indicada sem conhecer e entender aquele ativo . \"A pessoa compra uma criptomoeda, uma ação específica ou um produto estruturado porque viu alguém mostrando o extrato, sem compreender o que está comprando, qual é o risco envolvido e em que cenário aquilo pode dar errado. Sem essa base, qualquer turbulência, por menor que seja, vira motivo para sair correndo\", diz."},{"type":"paragraph","text":"Ela lembra que o segundo erro é ignorar o próprio perfil e horizonte de tempo. \"Conteúdo de redes sociais raramente contextualiza. Aquele resultado foi obtido em quanto tempo? Com quanto de capital? Com qual exposição a risco? Uma estratégia que funciona para alguém com reserva consolidada, alta tolerância a volatilidade e horizonte de dez anos pode ser desastrosa para quem tem o dinheiro do aluguel aplicado\", lembra."},{"type":"paragraph","text":"Para Stange, quem investe por influência tende a colocar uma parcela desproporcional do patrimônio em uma única aposta, justamente porque acredita que ela é \"certa\". \" A diversificação , que é o principal mecanismo de proteção em qualquer carteira, é vista como cautela desnecessária. Até o dia em que não é\", ressalta."},{"type":"paragraph","text":"Fique longe das comparações"},{"type":"paragraph","text":"A educadora financeira acredita que há sinais muitos claros indicando que uma pessoa está sendo guiada mais pela comparação nas redes sociais do que pelo próprio planejamento financeiro."},{"type":"paragraph","text":"\"O primeiro é a instabilidade da carteira porque aquela pessoa troca de ativos com frequência, sempre migrando para o que está sendo comentado no momento, sem uma tese de saída definida para o que abandona. O segundo é a dissonância entre o que investe e o que conhece. Ela própria não consegue explicar o funcionamento do ativo com suas palavras\"."},{"type":"paragraph","text":"Mônica Costa lembra que um indicativo importante nesse sentido é quando a pessoa começa a tomar decisões financeiras, olhando mais para a vida do outro do que para a própria realidade . \"É a bendita comparação\"."},{"type":"paragraph","text":"\"Então ela compra, parcela, ou investe porque viu alguém fazendo, porque parece que todo mundo está vivendo melhor. A gente volta para a síndrome do FOMO. Vou fazer porque todo mundo faz. Ela tem a impressão de que todo mundo ganha mais, viaja mais, vive melhor do que ela. Então, tá enriquecendo mais rápido."},{"type":"paragraph","text":"Para a educadora financeira, a ansiedade ao ver a conquista de outras pessoas ou pressa para mudar de vida sem ter clareza do próprio orçamento são inimigas nessa hora. \"O alerta que a gente precisa deixar é o de que decisão financeira não pode nunca vir carregada de ansiedade, de vergonha ou de urgência\", completa."},{"type":"paragraph","text":"Invista agora com app"},{"type":"paragraph","text":"Baixe o app Investimentos BB pra investir com praticidade e segurança"}]'::jsonb, 'patricia-queiroz', 'Patrícia Queiroz', 'InvesTalk - Banco do Brasil', 'https://investalk.bb.com.br/noticias/economia/fomo-financeiro-como-a-pressao-das-redes-sociais-faz-voce-investir-errado', '2026-05-19T15:36:00-03:00'::timestamptz, false, 'seguranca-fraudes.webp', 'Imagem editorial relacionada a alerta de golpes.', null),
    (8, 'BV-008', 'programando-o-futuro', 'ferias-de-janeiro-planejamento-financeiro', 'Férias de janeiro: veja como se planejar financeiramente e evitar dívidas', 'São Paulo, 03/08/2026- As férias proporcionam para muita gente oportunidades de renovar as energias, descansar e, se possível, fazer aquela viagem bacana e guardar boas recordações em família.', 'São Paulo, 03/08/2026- As férias proporcionam para muita gente oportunidades de renovar as energias, descansar e, se possível, fazer aquela viagem bacana e guardar boas recordações em família.

O recesso escolar de julho acabou de acontecer e se não deu para aproveitar o período como gostaria, que tal começar a organizar o de janeiro do ano que vem? Para isso, é crucial fazer um bom planejamento para que a temporada caiba no seu orçamento e seja prazerosa.

Com a definição de estratégias, você não é pego de surpresa com dívidas na volta à rotina. Mas por onde começar? Especialistas dão o caminho a seguir:

Liquidez e previsibilidade

O planejamento deve começar pelo bolso e não pelo destino da viagem, com a definição do teto de gastos, afirma Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais.

"Ele requer liquidez e previsibilidade, para que as férias não virem uma dor de cabeça financeira. Organizar as finanças antes delas não só evita dívidas, mas também garante uma experiência mais tranquila e prazerosa", enfatiza.

De acordo com profissionais da área, quem planeja as férias tem até 40% menos chances de enfrentar problemas financeiros ao voltar à rotina.

Como planejar as férias?

Para Mariana Brandileone, sócia fundadora da Alocc, as férias devem ser tratadas como um objetivo, e não um gasto inesperado. "Quando a viagem é planejada, ela deixa de competir com outras prioridades e passa a fazer parte de um projeto de vida", diz.

Para ela, o passo inicial é estabelecer um orçamento total antes de fazer as reservas. Com o valor da viagem e considerando todos os gastos envolvidos, como alimentação, transporte, passeios, seguro e compras, a pessoa evita depender do crédito para financiar as férias.

Patzlaff concorda com Mariana e orienta que o ponto de partida é começar com uma espécie de Raio-X financeiro. Posteriormente, analisar a renda e definir com clareza quanto você consegue poupar todos os meses até dezembro, sem comprometer as contas essenciais e a reserva de emergência.

Segundo o planejador financeiro, a conta que vai definir se o momento comporta uma viagem em um estilo mais luxuoso ou um roteiro mais econômico, é o quanto a pessoa consegue poupar nesses meses que antecedem janeiro.

Por exemplo: se a pessoa consegue guardar R$ 400 por mês ao longo desses cinco meses restantes, tenha certeza que o seu orçamento real para as férias é de R$ 2 mil.

Por outro lado, se a pessoa consegue poupar R$ 800 por mês entre agosto e dezembro, isso lhe dará R$ 4 mil mais algum rendimento, se esse montante mensal for aplicado em um investimento com liquidez.

"Com esse orçamento real definido, você passa a procurar destinos, passagens e hospedagens que caibam nesse limite", acrescenta Patzlaff.

Ele ainda recomenda, caso seja possível, reservar uma margem extra no valor da viagem, cerca de 10% a 15% do custo total, para o caso de algum imprevisto. "Se não houver imprevistos, esse recurso pode se tornar o primeiro aporte para as férias do ano seguinte", orienta.

Onde investir para as férias?

A partir do momento que o valor mensal a ser poupado para as férias é definido, o próximo passo é proteger esse dinheiro, ou seja, aplicar em investimentos conservadores, com liquidez diária, resgate imediato e sem perdas, caso a pessoa precise antecipar o pagamento de uma passagem ou um hotel.

Patzlaff cita como algumas opções de investimento o Tesouro Selic, os CDBs de bancos sólidos que paguem no mínimo 100% do CDI, ou Fundos DI com taxa de administração zero ou até mesmo as caixinhas/cofrinhos dos bancos.

Viagens nacionais e internacionais

Para Patzlaff, a estrutura de um planejamento independe se o destino é nacional ou internacional. O importante é poupar todo mês e não gastar mais do que se tem.

Em uma viagem nacional, explica, o vilão é a inflação e a alta demanda da temporada. "A estratégia é usar o dinheiro que você já tem ou consegue antecipar para travar os preços o quanto antes. Comprar passagens nacionais com meses de antecedência protege seu poder de compra dos reajustes sazonais", diz.

Com o cenário atual da taxa básica de juros (Selic) alta, de 14,25%, a pessoa pode deixar o restante do dinheiro rendendo até o dia da viagem.

Já para viagens internacionais, o maior obstáculo é a variação do dólar. "Como a moeda americana oscila com frequência, não dá para contar com a sorte e tentar adivinhar se a divisa estará barata ou não em janeiro, enfatiza o especialista.

Muitas pessoas deixam para comprar os dólares na véspera da viagem, e para não correr riscos, Mariana, da Alocc, afirma que o melhor é fazer aportes periódicos em um fundo cambial referenciado em dólar, reduzindo o risco de ser surpreendido por uma alta da cotação justamente próximo à data da viagem.

"Essa abordagem traz mais previsibilidade ao orçamento e evita que a variação do câmbio comprometa o planejamento financeiro", diz.

Além disso, manter uma reserva pequena é prudente caso surjam imprevistos para que as despesas de última hora não comprometam o orçamento.

Importância do planejamento

Para Mariana, da Alocc, o maior benefício não é apenas evitar dívidas, mas preservar a tranquilidade antes, durante e depois da viagem.

"O patrimônio deve ser visto como um instrumento para proporcionar qualidade de vida, segurança e a realização de projetos pessoais. Viajar faz parte desses objetivos e, quando existe planejamento, é possível aproveitar a experiência com tranquilidade, sem comprometer metas financeiras importantes, como a formação de patrimônio, a aposentadoria ou a reserva para emergências", defende.

No mesmo sentido, Patzlaff explica que o viajante que deixa para resolver tudo em cima da hora, em dezembro, por exemplo, paga grande parte da viagem no cartão de crédito e, sem teto de gastos definido, consome por impulso.

"No retorno à rotina, em fevereiro, ele se depara com a fatura do cartão somada às despesas clássicas de início de ano, como IPVA, IPTU e matrículas escolares. O orçamento aperta, ele não consegue pagar a fatura integral e cai no rotativo do cartão. O estresse dessa ressaca financeira destrói instantaneamente toda a paz mental e o descanso que as férias deveriam proporcionar", completa.

Já o viajante que planeja, assimila a importância da antecipação e começa a se organizar agora. "Ele estipula metas mensais de investir até o final do ano. Mais do que apenas guardar, ele aloca esse dinheiro em ativos de renda fixa com liquidez diária, aproveitando a taxa de juros alta. O valor do rendimento pode ser um jantar ou um passeio de barco que não estava nos planos iniciais", avalia.

Fazer uma organização financeira é importante porque "não é sobre se privar, mas sobre garantir a sua liberdade e o retorno real do seu investimento que, nas férias, é o seu descanso e bem-estar", completa.', '[{"type":"paragraph","text":"São Paulo, 03/08/2026- As férias proporcionam para muita gente oportunidades de renovar as energias, descansar e, se possível, fazer aquela viagem bacana e guardar boas recordações em família."},{"type":"paragraph","text":"O recesso escolar de julho acabou de acontecer e se não deu para aproveitar o período como gostaria, que tal começar a organizar o de janeiro do ano que vem? Para isso, é crucial fazer um bom planejamento para que a temporada caiba no seu orçamento e seja prazerosa."},{"type":"paragraph","text":"Com a definição de estratégias, você não é pego de surpresa com dívidas na volta à rotina. Mas por onde começar? Especialistas dão o caminho a seguir:"},{"type":"paragraph","text":"Liquidez e previsibilidade"},{"type":"paragraph","text":"O planejamento deve começar pelo bolso e não pelo destino da viagem, com a definição do teto de gastos, afirma Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais."},{"type":"paragraph","text":"\"Ele requer liquidez e previsibilidade, para que as férias não virem uma dor de cabeça financeira. Organizar as finanças antes delas não só evita dívidas, mas também garante uma experiência mais tranquila e prazerosa\", enfatiza."},{"type":"paragraph","text":"De acordo com profissionais da área, quem planeja as férias tem até 40% menos chances de enfrentar problemas financeiros ao voltar à rotina."},{"type":"paragraph","text":"Como planejar as férias?"},{"type":"paragraph","text":"Para Mariana Brandileone, sócia fundadora da Alocc, as férias devem ser tratadas como um objetivo, e não um gasto inesperado. \"Quando a viagem é planejada, ela deixa de competir com outras prioridades e passa a fazer parte de um projeto de vida\", diz."},{"type":"paragraph","text":"Para ela, o passo inicial é estabelecer um orçamento total antes de fazer as reservas. Com o valor da viagem e considerando todos os gastos envolvidos, como alimentação, transporte, passeios, seguro e compras, a pessoa evita depender do crédito para financiar as férias."},{"type":"paragraph","text":"Patzlaff concorda com Mariana e orienta que o ponto de partida é começar com uma espécie de Raio-X financeiro. Posteriormente, analisar a renda e definir com clareza quanto você consegue poupar todos os meses até dezembro, sem comprometer as contas essenciais e a reserva de emergência."},{"type":"paragraph","text":"Segundo o planejador financeiro, a conta que vai definir se o momento comporta uma viagem em um estilo mais luxuoso ou um roteiro mais econômico, é o quanto a pessoa consegue poupar nesses meses que antecedem janeiro."},{"type":"paragraph","text":"Por exemplo: se a pessoa consegue guardar R$ 400 por mês ao longo desses cinco meses restantes, tenha certeza que o seu orçamento real para as férias é de R$ 2 mil."},{"type":"paragraph","text":"Por outro lado, se a pessoa consegue poupar R$ 800 por mês entre agosto e dezembro, isso lhe dará R$ 4 mil mais algum rendimento, se esse montante mensal for aplicado em um investimento com liquidez."},{"type":"paragraph","text":"\"Com esse orçamento real definido, você passa a procurar destinos, passagens e hospedagens que caibam nesse limite\", acrescenta Patzlaff."},{"type":"paragraph","text":"Ele ainda recomenda, caso seja possível, reservar uma margem extra no valor da viagem, cerca de 10% a 15% do custo total, para o caso de algum imprevisto. \"Se não houver imprevistos, esse recurso pode se tornar o primeiro aporte para as férias do ano seguinte\", orienta."},{"type":"paragraph","text":"Onde investir para as férias?"},{"type":"paragraph","text":"A partir do momento que o valor mensal a ser poupado para as férias é definido, o próximo passo é proteger esse dinheiro, ou seja, aplicar em investimentos conservadores, com liquidez diária, resgate imediato e sem perdas, caso a pessoa precise antecipar o pagamento de uma passagem ou um hotel."},{"type":"paragraph","text":"Patzlaff cita como algumas opções de investimento o Tesouro Selic, os CDBs de bancos sólidos que paguem no mínimo 100% do CDI, ou Fundos DI com taxa de administração zero ou até mesmo as caixinhas/cofrinhos dos bancos."},{"type":"paragraph","text":"Viagens nacionais e internacionais"},{"type":"paragraph","text":"Para Patzlaff, a estrutura de um planejamento independe se o destino é nacional ou internacional. O importante é poupar todo mês e não gastar mais do que se tem."},{"type":"paragraph","text":"Em uma viagem nacional, explica, o vilão é a inflação e a alta demanda da temporada. \"A estratégia é usar o dinheiro que você já tem ou consegue antecipar para travar os preços o quanto antes. Comprar passagens nacionais com meses de antecedência protege seu poder de compra dos reajustes sazonais\", diz."},{"type":"paragraph","text":"Com o cenário atual da taxa básica de juros (Selic) alta, de 14,25%, a pessoa pode deixar o restante do dinheiro rendendo até o dia da viagem."},{"type":"paragraph","text":"Já para viagens internacionais, o maior obstáculo é a variação do dólar. \"Como a moeda americana oscila com frequência, não dá para contar com a sorte e tentar adivinhar se a divisa estará barata ou não em janeiro, enfatiza o especialista."},{"type":"paragraph","text":"Muitas pessoas deixam para comprar os dólares na véspera da viagem, e para não correr riscos, Mariana, da Alocc, afirma que o melhor é fazer aportes periódicos em um fundo cambial referenciado em dólar, reduzindo o risco de ser surpreendido por uma alta da cotação justamente próximo à data da viagem."},{"type":"paragraph","text":"\"Essa abordagem traz mais previsibilidade ao orçamento e evita que a variação do câmbio comprometa o planejamento financeiro\", diz."},{"type":"paragraph","text":"Além disso, manter uma reserva pequena é prudente caso surjam imprevistos para que as despesas de última hora não comprometam o orçamento."},{"type":"paragraph","text":"Importância do planejamento"},{"type":"paragraph","text":"Para Mariana, da Alocc, o maior benefício não é apenas evitar dívidas, mas preservar a tranquilidade antes, durante e depois da viagem."},{"type":"paragraph","text":"\"O patrimônio deve ser visto como um instrumento para proporcionar qualidade de vida, segurança e a realização de projetos pessoais. Viajar faz parte desses objetivos e, quando existe planejamento, é possível aproveitar a experiência com tranquilidade, sem comprometer metas financeiras importantes, como a formação de patrimônio, a aposentadoria ou a reserva para emergências\", defende."},{"type":"paragraph","text":"No mesmo sentido, Patzlaff explica que o viajante que deixa para resolver tudo em cima da hora, em dezembro, por exemplo, paga grande parte da viagem no cartão de crédito e, sem teto de gastos definido, consome por impulso."},{"type":"paragraph","text":"\"No retorno à rotina, em fevereiro, ele se depara com a fatura do cartão somada às despesas clássicas de início de ano, como IPVA, IPTU e matrículas escolares. O orçamento aperta, ele não consegue pagar a fatura integral e cai no rotativo do cartão. O estresse dessa ressaca financeira destrói instantaneamente toda a paz mental e o descanso que as férias deveriam proporcionar\", completa."},{"type":"paragraph","text":"Já o viajante que planeja, assimila a importância da antecipação e começa a se organizar agora. \"Ele estipula metas mensais de investir até o final do ano. Mais do que apenas guardar, ele aloca esse dinheiro em ativos de renda fixa com liquidez diária, aproveitando a taxa de juros alta. O valor do rendimento pode ser um jantar ou um passeio de barco que não estava nos planos iniciais\", avalia."},{"type":"paragraph","text":"Fazer uma organização financeira é importante porque \"não é sobre se privar, mas sobre garantir a sua liberdade e o retorno real do seu investimento que, nas férias, é o seu descanso e bem-estar\", completa."}]'::jsonb, 'soraia-budaibes-especial-para-broadcast', 'Soraia Budaibes, especial para Broadcast', 'InvesTalk - Banco do Brasil', 'https://investalk.bb.com.br/noticias/mercado/ferias-de-janeiro-veja-como-se-planejar-financeiramente-e-evitar-dividas', '2026-08-03T11:55:00-03:00'::timestamptz, false, 'planejamento-financeiro.webp', 'Imagem editorial relacionada a programando o futuro.', null),
    (9, 'BV-009', 'programando-o-futuro', 'guia-financeiro-planejar-ferias-sem-estourar-orcamento', 'Guia financeiro ajuda a planejar suas próximas férias sem estourar o orçamento', 'São Paulo - Sempre que uma férias acaba bate aquele sentimento de quero mais.', 'São Paulo - Sempre que uma férias acaba bate aquele sentimento de quero mais. Se durante o período de descanso também deu para fazer uma viagem, voltar a rotina diária fica ainda mais difícil. Mas, você pode minimizar este sentimento já pensando nas próximas férias. Para isso, é sempre bom começar pelo planejamento, afinal, viajar é uma experiência enriquecedora, mas, sem o devido planejamento financeiro, o sonho pode se transformar em um enorme pesadelo de dívidas e frustrações.

Para esclarecer as principais dúvidas sobre como preparar o bolso para desembarcar no próximo destino em família, o educador financeiro Thiago Godoy, sócio cofundador da Bem Educação e CEO da Papai Financeiro, reuniu algumas dicas essenciais para quem quer viajar daqui a 12 meses sem comprometer o orçamento.

O primeiro passo para transformar a intenção em realidade, segundo o educador financeiro, envolve definir três pilares fundamentais: para onde ir, quando ir e quanto gastar. A partir da definição do destino e da data, torna-se viável calcular a meta mensal de economia.

Outro ponto importante é a organização por meio de uma planilha de custos essenciais. Em vez de estimativas genéricas, o viajante deve categorizar gastos com passagens, hospedagem, alimentação, transporte, passeios, seguro-viagem e compras. Além disso, a recomendação é adicionar uma margem de segurança de 10% sobre o valor total estimado para cobrir eventuais imprevistos ou oscilações de preços.

Ao planejar em grupo ou com crianças, vale notar que nem todas as despesas sobem na mesma proporção. Gastos individuais como passagens aéreas, ingressos e alimentação, crescem conforme o número de integrantes (lembrando que crianças a partir de determinada idade pagam valor integral em diversos serviços). Por outro lado, itens como hospedagem, aluguel de carro e transporte por aplicativo oferecem ganho de escala, pois o custo fixo é dividido entre os ocupantes.

QUANTO E ONDE INVESTIR O DINHEIRO

A conta básica para quem planeja viajar em um ano é simples: soma-se a estimativa total, já com o adicional de 10% e divide-se o montante por 12. O segredo para atingir a meta no dia a dia é automatizar a disciplina, assim que a renda entra na conta, o valor estipulado deve ser reservado imediatamente, em vez de esperar pelo que sobrar ao final do mês. Outra opção para evitar gastos desnecessários é cancelar assinaturas em desuso, reduzir compras por impulso e controlar excessos com delivery, pequenos ajustes cotidianos que abrem espaço no orçamento.

Quanto aos investimentos, Thiago ressalta que o destino do dinheiro depende do prazo:

- Para viagens em curto prazo - 1 ano: A prioridade é a liquidez e a segurança. Opções como o Tesouro Selic e CDBs de liquidez diária são as mais indicadas, pois permitem o resgate a qualquer momento sem perda de rentabilidade.

- Para viagens em médio e longo prazo - 2 a 3 anos: Títulos pré-fixados ou atrelados à inflação (Tesouro IPCA), com vencimento anterior à data do embarque, costumam entregar um retorno médio superior.

PASSAGENS AÉREAS E A ARMADILHA DAS MILHAS

O tempo de antecedência na pesquisa de passagens faz toda a diferença no valor final do bilhete:

- Voos nacionais: O período ideal para monitorar e comprar fica entre 3 e 6 meses antes da data.

- Voos internacionais: A janela de acompanhamento deve ser mais ampla, variando de 6 a 12 meses antes da viagem, aproveitando o momento em que as companhias liberam os assentos e surgem promoções.

Sobre os programas de fidelidade, as milhas continuam sendo aliadas válidas, desde que façam parte da rotina natural de consumo. O erro recorrente é acelerar gastos desnecessários apenas para acumular pontos. A estratégia mais vantajosa consiste em concentrar as viagens em uma mesma companhia ou acumular pontos em programas de fidelidade por meio de compras de itens essenciais que já seriam adquiridos.

VIAGENS INTERNACIONAIS

A preparação para destinos internacionais exige cuidados extras com documentação, vistos e, sobretudo, com a moeda local. A clássica compra de dinheiro em espécie vem perdendo espaço para soluções mais modernas e econômicas.

Atualmente, o uso de contas digitais internacionais e cartões de débito em moeda estrangeira se consolidam como a opção mais prática e barata, amplamente aceita nos Estados Unidos e na Europa Ocidental. Essa modalidade evita as altas taxas de IOF e a volatilidade do dólar praticadas pelos cartões de crédito emitidos no Brasil. Para quem prefere comprar a moeda aos poucos, a estratégia pode ser diluída ao longo dos 12 meses de planejamento.

PÓS-VIAGEM SEM DORES DE CABEÇA

Toda a despesa do passeio deve sair exclusivamente do fundo reservado para a viagem, preservando o orçamento mensal e a estabilidade financeira da família. Evitar o uso do cartão de crédito convencional e fugir do parcelamento de gastos ocorridos durante a estadia são medidas essenciais.

"Estabelecer um limite diário de gastos e cumpri-lo rigorosamente garante que o retorno para casa seja marcado apenas por boas memórias, e não por uma fatura acumulada e um início de ano no vermelho", conclui.



Palavras-chave: estilo de vida, financeiro, férias, guia, planejamento de viagem, viagem', '[{"type":"paragraph","text":"São Paulo - Sempre que uma férias acaba bate aquele sentimento de quero mais. Se durante o período de descanso também deu para fazer uma viagem, voltar a rotina diária fica ainda mais difícil. Mas, você pode minimizar este sentimento já pensando nas próximas férias. Para isso, é sempre bom começar pelo planejamento, afinal, viajar é uma experiência enriquecedora, mas, sem o devido planejamento financeiro, o sonho pode se transformar em um enorme pesadelo de dívidas e frustrações."},{"type":"paragraph","text":"Para esclarecer as principais dúvidas sobre como preparar o bolso para desembarcar no próximo destino em família, o educador financeiro Thiago Godoy, sócio cofundador da Bem Educação e CEO da Papai Financeiro, reuniu algumas dicas essenciais para quem quer viajar daqui a 12 meses sem comprometer o orçamento."},{"type":"paragraph","text":"O primeiro passo para transformar a intenção em realidade, segundo o educador financeiro, envolve definir três pilares fundamentais: para onde ir, quando ir e quanto gastar. A partir da definição do destino e da data, torna-se viável calcular a meta mensal de economia."},{"type":"paragraph","text":"Outro ponto importante é a organização por meio de uma planilha de custos essenciais. Em vez de estimativas genéricas, o viajante deve categorizar gastos com passagens, hospedagem, alimentação, transporte, passeios, seguro-viagem e compras. Além disso, a recomendação é adicionar uma margem de segurança de 10% sobre o valor total estimado para cobrir eventuais imprevistos ou oscilações de preços."},{"type":"paragraph","text":"Ao planejar em grupo ou com crianças, vale notar que nem todas as despesas sobem na mesma proporção. Gastos individuais como passagens aéreas, ingressos e alimentação, crescem conforme o número de integrantes (lembrando que crianças a partir de determinada idade pagam valor integral em diversos serviços). Por outro lado, itens como hospedagem, aluguel de carro e transporte por aplicativo oferecem ganho de escala, pois o custo fixo é dividido entre os ocupantes."},{"type":"heading","text":"QUANTO E ONDE INVESTIR O DINHEIRO"},{"type":"paragraph","text":"A conta básica para quem planeja viajar em um ano é simples: soma-se a estimativa total, já com o adicional de 10% e divide-se o montante por 12. O segredo para atingir a meta no dia a dia é automatizar a disciplina, assim que a renda entra na conta, o valor estipulado deve ser reservado imediatamente, em vez de esperar pelo que sobrar ao final do mês. Outra opção para evitar gastos desnecessários é cancelar assinaturas em desuso, reduzir compras por impulso e controlar excessos com delivery, pequenos ajustes cotidianos que abrem espaço no orçamento."},{"type":"paragraph","text":"Quanto aos investimentos, Thiago ressalta que o destino do dinheiro depende do prazo:"},{"type":"paragraph","text":"- Para viagens em curto prazo - 1 ano: A prioridade é a liquidez e a segurança. Opções como o Tesouro Selic e CDBs de liquidez diária são as mais indicadas, pois permitem o resgate a qualquer momento sem perda de rentabilidade."},{"type":"paragraph","text":"- Para viagens em médio e longo prazo - 2 a 3 anos: Títulos pré-fixados ou atrelados à inflação (Tesouro IPCA), com vencimento anterior à data do embarque, costumam entregar um retorno médio superior."},{"type":"heading","text":"PASSAGENS AÉREAS E A ARMADILHA DAS MILHAS"},{"type":"paragraph","text":"O tempo de antecedência na pesquisa de passagens faz toda a diferença no valor final do bilhete:"},{"type":"paragraph","text":"- Voos nacionais: O período ideal para monitorar e comprar fica entre 3 e 6 meses antes da data."},{"type":"paragraph","text":"- Voos internacionais: A janela de acompanhamento deve ser mais ampla, variando de 6 a 12 meses antes da viagem, aproveitando o momento em que as companhias liberam os assentos e surgem promoções."},{"type":"paragraph","text":"Sobre os programas de fidelidade, as milhas continuam sendo aliadas válidas, desde que façam parte da rotina natural de consumo. O erro recorrente é acelerar gastos desnecessários apenas para acumular pontos. A estratégia mais vantajosa consiste em concentrar as viagens em uma mesma companhia ou acumular pontos em programas de fidelidade por meio de compras de itens essenciais que já seriam adquiridos."},{"type":"heading","text":"VIAGENS INTERNACIONAIS"},{"type":"paragraph","text":"A preparação para destinos internacionais exige cuidados extras com documentação, vistos e, sobretudo, com a moeda local. A clássica compra de dinheiro em espécie vem perdendo espaço para soluções mais modernas e econômicas."},{"type":"paragraph","text":"Atualmente, o uso de contas digitais internacionais e cartões de débito em moeda estrangeira se consolidam como a opção mais prática e barata, amplamente aceita nos Estados Unidos e na Europa Ocidental. Essa modalidade evita as altas taxas de IOF e a volatilidade do dólar praticadas pelos cartões de crédito emitidos no Brasil. Para quem prefere comprar a moeda aos poucos, a estratégia pode ser diluída ao longo dos 12 meses de planejamento."},{"type":"heading","text":"PÓS-VIAGEM SEM DORES DE CABEÇA"},{"type":"paragraph","text":"Toda a despesa do passeio deve sair exclusivamente do fundo reservado para a viagem, preservando o orçamento mensal e a estabilidade financeira da família. Evitar o uso do cartão de crédito convencional e fugir do parcelamento de gastos ocorridos durante a estadia são medidas essenciais."},{"type":"paragraph","text":"\"Estabelecer um limite diário de gastos e cumpri-lo rigorosamente garante que o retorno para casa seja marcado apenas por boas memórias, e não por uma fatura acumulada e um início de ano no vermelho\", conclui."},{"type":"paragraph","text":"Palavras-chave: estilo de vida, financeiro, férias, guia, planejamento de viagem, viagem"}]'::jsonb, 'alessandra-taraborelli', 'Alessandra Taraborelli', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/guia-financeiro-ajuda-a-planejar-suas-proximas-ferias-sem-estourar-o-orcamento.html', '2026-08-16T18:02:00-03:00'::timestamptz, false, 'planejamento-financeiro.webp', 'O educador financeiro, Thiago Godoy, sugere uma organização por meio de planilha de custos essenciais', 'Divulgação'),
    (10, 'BV-010', 'isso-ou-aquilo', 'milhas-ou-cashback-qual-vale-mais-a-pena', 'Milhas ou cashback: qual vale mais a pena para você? Veja como escolher', 'São Paulo - Entre descontos nas compras do mercado e vantagens proporcionadas por clubes de fidelidade, muitos ainda se dividem entre milhas e cashback (que significa ''dinheiro de volta'' em tradução livre).', 'São Paulo - Entre descontos nas compras do mercado e vantagens proporcionadas por clubes de fidelidade, muitos ainda se dividem entre milhas e cashback (que significa ''dinheiro de volta'' em tradução livre). A vontade é conseguir aproveitar o melhor dos dois mundos. De acordo com Rodrigo Góes, especialista em milhas aéreas, autor de "O mapa para acumular 1 milhão de milhas" e "Educação financeira em milhas: Como transformar milhas em economia real e realizar seus sonhos", a decisão entre um e outro depende muito das promoções e do seu perfil.

Quando falamos do universo de milhas, o cashback representa o reembolso recebido pelo cliente ao utilizar o seu cartão de crédito, mas o cashback em milhas representa o retorno em milhas após a compra de algum produto ou serviço.

"É possível receber tanto em cashback quanto em milhas nas compras bonificadas", explica Góes, que considera o sistema de milhas mais recompensador.

Para explicar como avaliar qual dos dois sistemas faz mais sentido o especialista conta com um exemplo prático:

"Eu vou comprar um produto de R$ 1.000, por exemplo. Se for aproveitar uma promoção com um cashback de 2% do valor da compra sei que aqui o meu ganho real para consumo no mesmo estabelecimento será de R$ 20. Imagine a mesma compra através da estratégia de milha e vamos supor que o seu programa de milhagem atrelado ao cartão esteja com uma promoção que oferece cinco pontos para cada real gasto. Aqui você vai ganhar 5 mil pontos que podem virar 10.000 milhas. Essas 10 mil milhas são equivalentes a cerca de R$ 150".

Nesse caso específico, claramente valeria mais a pena fazer essa operação com milhas em vez de consumir esse cashback em descontos oferecidos em novas compras. Agora, supondo que o cashback não seja de 0,5% a 2%, mas de 20%. Nesse caso, o seu retorno em uma compra de R$ 1.000 será de R$ 200 em uma nova compra. Ou seja, aqui usar o cashback compensaria, ensina o especialista.

QUAL É O SEU PERFIL?

A matemática desse jogo envolve entender o retorno envolvido em cada uma das operações e saber converter o valor do milheiro (mil milhas) em reais. A escolha entre esses dois sistemas, explica Góes, está diretamente conectada ao seu perfil - quanto você gasta, como você gasta, quanto você viaja e qual a sua disposição para aprender a usar esse sistema de forma estratégica.

Para algumas pessoas, o cashback é sem dúvida a melhor opção, por sua praticidade e porque elas não viajam o suficiente para justificar o acumulo de milhas. No entanto, se você tem um perfil de viajante escolher cashback significa deixar de ganhar milhares de reais em viagens ao longo do ano.

A vantagem das milhas, observa Góes, está na liberdade de poder vender esse ''crédito'' para embolsar essa grana e fazer o que você quiser ou trocar por outras coisas que valem mais do que se você fosse vender esses pontos. Elas funcionam como uma moeda virtual que podemos usar para viajar, pagar hotel, entre outras coisas.

CUIDADO COM OS ERROS DE PRINCIPIANTE

Na fúria de querer acumular pontos, alguns iniciantes chegam a comprar coisas sem necessidade, apenas porque está na promoção. Erro clássico, aponta Góes. Outro engano básico é transferir os pontos que tem na conta sem bonificação nenhuma apenas para emitir uma passagem o mais rápido possível. Muitos ainda não se deram conta, mas as milhas são um direito seu e ao deixá-las expirar você está jogando dinheiro fora.



Palavras-chave: cashback, dinheiro, economia, milhas, sistema', '[{"type":"paragraph","text":"São Paulo - Entre descontos nas compras do mercado e vantagens proporcionadas por clubes de fidelidade, muitos ainda se dividem entre milhas e cashback (que significa ''dinheiro de volta'' em tradução livre). A vontade é conseguir aproveitar o melhor dos dois mundos. De acordo com Rodrigo Góes, especialista em milhas aéreas, autor de \"O mapa para acumular 1 milhão de milhas\" e \"Educação financeira em milhas: Como transformar milhas em economia real e realizar seus sonhos\", a decisão entre um e outro depende muito das promoções e do seu perfil."},{"type":"paragraph","text":"Quando falamos do universo de milhas, o cashback representa o reembolso recebido pelo cliente ao utilizar o seu cartão de crédito, mas o cashback em milhas representa o retorno em milhas após a compra de algum produto ou serviço."},{"type":"paragraph","text":"\"É possível receber tanto em cashback quanto em milhas nas compras bonificadas\", explica Góes, que considera o sistema de milhas mais recompensador."},{"type":"paragraph","text":"Para explicar como avaliar qual dos dois sistemas faz mais sentido o especialista conta com um exemplo prático:"},{"type":"paragraph","text":"\"Eu vou comprar um produto de R$ 1.000, por exemplo. Se for aproveitar uma promoção com um cashback de 2% do valor da compra sei que aqui o meu ganho real para consumo no mesmo estabelecimento será de R$ 20. Imagine a mesma compra através da estratégia de milha e vamos supor que o seu programa de milhagem atrelado ao cartão esteja com uma promoção que oferece cinco pontos para cada real gasto. Aqui você vai ganhar 5 mil pontos que podem virar 10.000 milhas. Essas 10 mil milhas são equivalentes a cerca de R$ 150\"."},{"type":"paragraph","text":"Nesse caso específico, claramente valeria mais a pena fazer essa operação com milhas em vez de consumir esse cashback em descontos oferecidos em novas compras. Agora, supondo que o cashback não seja de 0,5% a 2%, mas de 20%. Nesse caso, o seu retorno em uma compra de R$ 1.000 será de R$ 200 em uma nova compra. Ou seja, aqui usar o cashback compensaria, ensina o especialista."},{"type":"heading","text":"QUAL É O SEU PERFIL?"},{"type":"paragraph","text":"A matemática desse jogo envolve entender o retorno envolvido em cada uma das operações e saber converter o valor do milheiro (mil milhas) em reais. A escolha entre esses dois sistemas, explica Góes, está diretamente conectada ao seu perfil - quanto você gasta, como você gasta, quanto você viaja e qual a sua disposição para aprender a usar esse sistema de forma estratégica."},{"type":"paragraph","text":"Para algumas pessoas, o cashback é sem dúvida a melhor opção, por sua praticidade e porque elas não viajam o suficiente para justificar o acumulo de milhas. No entanto, se você tem um perfil de viajante escolher cashback significa deixar de ganhar milhares de reais em viagens ao longo do ano."},{"type":"paragraph","text":"A vantagem das milhas, observa Góes, está na liberdade de poder vender esse ''crédito'' para embolsar essa grana e fazer o que você quiser ou trocar por outras coisas que valem mais do que se você fosse vender esses pontos. Elas funcionam como uma moeda virtual que podemos usar para viajar, pagar hotel, entre outras coisas."},{"type":"heading","text":"CUIDADO COM OS ERROS DE PRINCIPIANTE"},{"type":"paragraph","text":"Na fúria de querer acumular pontos, alguns iniciantes chegam a comprar coisas sem necessidade, apenas porque está na promoção. Erro clássico, aponta Góes. Outro engano básico é transferir os pontos que tem na conta sem bonificação nenhuma apenas para emitir uma passagem o mais rápido possível. Muitos ainda não se deram conta, mas as milhas são um direito seu e ao deixá-las expirar você está jogando dinheiro fora."},{"type":"paragraph","text":"Palavras-chave: cashback, dinheiro, economia, milhas, sistema"}]'::jsonb, 'fabiana-holtz', 'Fabiana Holtz', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/milhas-ou-cashback-qual-vale-mais-a-pena-para-voce-veja-como-escolher.html', '2026-08-09T12:33:00-03:00'::timestamptz, false, 'meios-pagamento.webp', 'Sistema tem particularidades que podem ajudar a realizar aquela viagem mais cedo do que você imagina', 'Envato'),
    (11, 'BV-011', 'saia-das-dividas', 'bc-superendividamento-cresce-no-brasil', 'BC: superendividamento cresce no Brasil devido a crédito fácil e falta de educação financeira', 'Brasília, 13/04/2026 - O Banco Central classificou o superendividamento como um problema crescente no Brasil em relatório publicado nesta segunda-feira.', 'Brasília, 13/04/2026 - O Banco Central classificou o superendividamento como um problema crescente no Brasil em relatório publicado nesta segunda-feira. Para a autoridade monetária, a facilidade de acesso ao crédito, sem uma oferta responsável e adequada ao perfil do cliente por parte das instituições, sem a devida proteção ao consumidor e sem a devida educação financeira, leva muitos brasileiros a contrair dívidas que não conseguem pagar.

"O cartão de crédito é frequentemente apontado como um dos principais vilões do superendividamento devido às altas taxas de juros e à facilidade de uso, que muitas vezes leva ao consumo desenfreado", emenda o BC. As avaliações constam no Relatório de Cidadania Financeira de 2025.

O documento menciona, com base em dados da Serasa Experian, que em dezembro de 2024 havia mais de 73 milhões de brasileiros com dívidas negativadas. Entre elas, as dívidas com o cartão de crédito representavam 27,4% e as demais dívidas financeiras cerca de 18% do total.

Com base em dados do Sistema de Informações de Créditos (SCR), o relatório também destaca que, no fim de 2024, cerca de 130 milhões de pessoas tinham exposição ao crédito no País, com 117 milhões de pessoas com carteira ativa.

Segundo o relatório, o acesso ao crédito é mensurado a partir da contagem de pessoas que possuem limite disponível em alguma instituição financeira, ou seja, ainda que não esteja sendo usado, todas essas pessoas possuem um acesso garantido a um produto de crédito. Já o uso do crédito é mensurado pelo saldo positivo em alguma das modalidades de crédito do Sistema Financeiro Nacional (SFN), seja empréstimos, financiamentos, cartões ou cheque especial.

O documento ressalta que ambos os números apresentaram aumento nos últimos anos. Entre as pessoas com relacionamento bancário, o conjunto de pessoas com limite de crédito passou de 61% para 74% entre 2020 e 2024. No mesmo intervalo, o porcentual de pessoas com carteira ativa de crédito subiu de 54% para 67%.



Contato da fonte: imprensa@bb.com.br', '[{"type":"paragraph","text":"Brasília, 13/04/2026 - O Banco Central classificou o superendividamento como um problema crescente no Brasil em relatório publicado nesta segunda-feira. Para a autoridade monetária, a facilidade de acesso ao crédito, sem uma oferta responsável e adequada ao perfil do cliente por parte das instituições, sem a devida proteção ao consumidor e sem a devida educação financeira, leva muitos brasileiros a contrair dívidas que não conseguem pagar."},{"type":"paragraph","text":"\"O cartão de crédito é frequentemente apontado como um dos principais vilões do superendividamento devido às altas taxas de juros e à facilidade de uso, que muitas vezes leva ao consumo desenfreado\", emenda o BC. As avaliações constam no Relatório de Cidadania Financeira de 2025."},{"type":"paragraph","text":"O documento menciona, com base em dados da Serasa Experian, que em dezembro de 2024 havia mais de 73 milhões de brasileiros com dívidas negativadas. Entre elas, as dívidas com o cartão de crédito representavam 27,4% e as demais dívidas financeiras cerca de 18% do total."},{"type":"paragraph","text":"Com base em dados do Sistema de Informações de Créditos (SCR), o relatório também destaca que, no fim de 2024, cerca de 130 milhões de pessoas tinham exposição ao crédito no País, com 117 milhões de pessoas com carteira ativa."},{"type":"paragraph","text":"Segundo o relatório, o acesso ao crédito é mensurado a partir da contagem de pessoas que possuem limite disponível em alguma instituição financeira, ou seja, ainda que não esteja sendo usado, todas essas pessoas possuem um acesso garantido a um produto de crédito. Já o uso do crédito é mensurado pelo saldo positivo em alguma das modalidades de crédito do Sistema Financeiro Nacional (SFN), seja empréstimos, financiamentos, cartões ou cheque especial."},{"type":"paragraph","text":"O documento ressalta que ambos os números apresentaram aumento nos últimos anos. Entre as pessoas com relacionamento bancário, o conjunto de pessoas com limite de crédito passou de 61% para 74% entre 2020 e 2024. No mesmo intervalo, o porcentual de pessoas com carteira ativa de crédito subiu de 54% para 67%."},{"type":"paragraph","text":"Contato da fonte: imprensa@bb.com.br"}]'::jsonb, 'marianna-gualter-broadcast-noticias', 'Marianna Gualter / Broadcast Notícias', 'InvesTalk - Banco do Brasil (Radar de mercado)', 'https://investalk.bb.com.br/radar/bc-superendividamento-cresce-no-brasil-devido-a-credito-facil-e-falta-de-educacao-financeira', '2026-04-13T14:20:00-03:00'::timestamptz, false, 'credito-pessoal.webp', 'Imagem editorial relacionada a saia das dívidas.', null),
    (12, 'BV-012', 'saia-das-dividas', 'bets-maiores-vilas-do-endividamento', 'Bets já são as maiores vilãs do endividamento no Brasil, mostra estudo', 'O Brasil terminou fevereiro com um número recorde de 81,7 milhões de CPFs negativados, afirmou nesta terça-feira a economista-chefe do Serasa Experian, Camila Abdelmalak em entrevista à Broadcast .', 'O Brasil terminou fevereiro com um número recorde de 81,7 milhões de CPFs negativados, afirmou nesta terça-feira a economista-chefe do Serasa Experian, Camila Abdelmalak em entrevista à Broadcast . E há indícios de que exista uma nova vilã nesse cenário de endividamento da população: as apostas online, ou bets.

Um estudo do Instituto Brasileiro de Executivos de Varejo (Ibevar), em parceria com a FIA Business School, mostra que houve uma mudança estrutural no perfil das pressões financeiras sofridas pelos brasileiros entre dezembro de 2011 e dezembro de 2025, com as bets superando o crédito e os juros como item de maior impacto no endividamento das famílias.

A pesquisa teve como base dados do , do Instituto de Pesquisa Econômica Aplicada (Ipea) e métricas de interesse capturadas nas redes sociais.

Após a aplicação de cálculos e modelos econométricos, concluiu-se que o coeficiente associado às apostas (0,2255) superou com ampla margem o peso do crédito sobre a renda (0,0440) e dos juros ao consumidor (0,0709) no cenário da inadimplência.

"Ao longo do período analisado, observou-se uma leve tendência de desaceleração no crescimento do endividamento. No entanto, após a entrada das apostas esportivas - legalizadas em 2018 e amplamente difundidas a partir de 2019, antes da regulamentação definitiva em 2023 - a dinâmica da dívida ganha novo impulso", aponta Claudio Felisoni, presidente do Ibevar e professor da FIA Business School.

Leia também:

Aposta esportiva não é investimento: entenda o porquê

Tendência internacional

O estudo confirma algo já observado em pesquisas realizadas nos Estados Unidos, onde a Suprema Corte liberou o mercado de bets em 2018. De acordo com o Ibevar, estudos americanos apontam que a legalização provocou aumento rápido e persistente no volume apostado, redução da poupança e queda nos investimentos.

E os efeitos negativos se concentram, principalmente, em famílias mais vulneráveis financeiramente, levando a um aumento nas dívidas de cartão de crédito e uso de cheque especial. No Brasil, os dados indicam fenômeno semelhante, na avaliação do Ibevar.

"A conclusão do estudo é clara: o crescimento acelerado do mercado de bets não é apenas uma questão regulatória ou tributária - trata-se de um fator macroeconômico com potencial de ampliar a vulnerabilidade financeira e pressionar o endividamento doméstico no médio e longo prazos", comenta Felisoni.

Invista agora com app

Baixe o app Investimentos BB pra investir com praticidade e segurança', '[{"type":"paragraph","text":"O Brasil terminou fevereiro com um número recorde de 81,7 milhões de CPFs negativados, afirmou nesta terça-feira a economista-chefe do Serasa Experian, Camila Abdelmalak em entrevista à Broadcast . E há indícios de que exista uma nova vilã nesse cenário de endividamento da população: as apostas online, ou bets."},{"type":"paragraph","text":"Um estudo do Instituto Brasileiro de Executivos de Varejo (Ibevar), em parceria com a FIA Business School, mostra que houve uma mudança estrutural no perfil das pressões financeiras sofridas pelos brasileiros entre dezembro de 2011 e dezembro de 2025, com as bets superando o crédito e os juros como item de maior impacto no endividamento das famílias."},{"type":"paragraph","text":"A pesquisa teve como base dados do , do Instituto de Pesquisa Econômica Aplicada (Ipea) e métricas de interesse capturadas nas redes sociais."},{"type":"paragraph","text":"Após a aplicação de cálculos e modelos econométricos, concluiu-se que o coeficiente associado às apostas (0,2255) superou com ampla margem o peso do crédito sobre a renda (0,0440) e dos juros ao consumidor (0,0709) no cenário da inadimplência."},{"type":"paragraph","text":"\"Ao longo do período analisado, observou-se uma leve tendência de desaceleração no crescimento do endividamento. No entanto, após a entrada das apostas esportivas - legalizadas em 2018 e amplamente difundidas a partir de 2019, antes da regulamentação definitiva em 2023 - a dinâmica da dívida ganha novo impulso\", aponta Claudio Felisoni, presidente do Ibevar e professor da FIA Business School."},{"type":"paragraph","text":"Leia também:"},{"type":"paragraph","text":"Aposta esportiva não é investimento: entenda o porquê"},{"type":"paragraph","text":"Tendência internacional"},{"type":"paragraph","text":"O estudo confirma algo já observado em pesquisas realizadas nos Estados Unidos, onde a Suprema Corte liberou o mercado de bets em 2018. De acordo com o Ibevar, estudos americanos apontam que a legalização provocou aumento rápido e persistente no volume apostado, redução da poupança e queda nos investimentos."},{"type":"paragraph","text":"E os efeitos negativos se concentram, principalmente, em famílias mais vulneráveis financeiramente, levando a um aumento nas dívidas de cartão de crédito e uso de cheque especial. No Brasil, os dados indicam fenômeno semelhante, na avaliação do Ibevar."},{"type":"paragraph","text":"\"A conclusão do estudo é clara: o crescimento acelerado do mercado de bets não é apenas uma questão regulatória ou tributária - trata-se de um fator macroeconômico com potencial de ampliar a vulnerabilidade financeira e pressionar o endividamento doméstico no médio e longo prazos\", comenta Felisoni."},{"type":"paragraph","text":"Invista agora com app"},{"type":"paragraph","text":"Baixe o app Investimentos BB pra investir com praticidade e segurança"}]'::jsonb, 'gustavo-boldrini', 'Gustavo Boldrini', 'InvesTalk - Banco do Brasil', 'https://investalk.bb.com.br/noticias/economia/bets-ja-sao-as-maiores-vilas-do-endividamento-no-brasil-mostra-estudo', '2026-03-24T13:41:00-03:00'::timestamptz, false, 'credito-pessoal.webp', 'Imagem editorial relacionada a saia das dívidas.', null),
    (13, 'BV-013', 'alivio-no-orcamento', 'porcentual-seguro-para-gastar-com-casa-carro-e-cartao', 'Sua renda aguenta? Veja o porcentual ''seguro'' para gastar com casa, carro e cartão', 'São Paulo, 11/08/2026 - O porcentual de famílias brasileiras endividadas bateu - de novo - mais um recorde, para 82% em julho, segundo dados da Pesquisa de Endividamento e Inadimplência do Consumidor, organizada pela Confederação Nacional do Comércio de…', 'São Paulo, 11/08/2026 - O porcentual de famílias brasileiras endividadas bateu - de novo - mais um recorde, para 82% em julho, segundo dados da Pesquisa de Endividamento e Inadimplência do Consumidor, organizada pela Confederação Nacional do Comércio de Bens, Serviços e Turismo (CNC). Isso significa que cerca de 4 em cada 5 lares do País possuem algum compromisso financeiro a vencer.

Se a sua ideia é fugir das dívidas, já parou para pensar quanto da sua renda líquida mensal pode ser destinado para pagar, por exemplo, a prestação de um financiamento de carro ou imóvel, a fatura do cartão de crédito e até o valor do aluguel?

Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais, recomenda a adoção do método 50/30/20, que divide a renda mensal em três grandes grupos com o objetivo de organizar os recursos de uma maneira mais simples.

A regra funciona assim: a maior parte da renda, ou 50%, pode ser direcionada aos gastos fixos, como o valor do aluguel e até parte da parcela de um imóvel.

Já 30% poderia ser reservados para pagamento do cartão de crédito e da manutenção do carro. Restariam 20% para investimentos, pensando na sua liberdade financeira e futuro.

"O ideal seria que o total das parcelas, incluindo cartão, financiamento e imóvel não ultrapassassem 30% do total da sua renda. Com isso, o espaço para o lazer e os investimentos mais consistentes ficaria garantido", afirma.

Vale conferir

Para Paula Sauer, planejadora financeira e professora de Economia da ESPM, o método 50/30/20 funciona apenas na teoria. Ela trabalha com porcentuais de até 25% a 30% destinados à prestação da moradia, incluindo o aluguel ou prestação de um imóvel, condomínio e IPTU.

Segundo a Pesquisa de Orçamentos Familiares do Instituto Brasileiro de Geografia e Estatística (IBGE), nas famílias de menor renda, somente a habitação já consome quase 40% dos recursos regulares.

"Isso ajuda a explicar por que muitas delas encontram dificuldade para acomodar novas prestações sem comprometer outras despesas essenciais", diz Paula.

Para o financiamento do veículo, a reserva seria até 15% da renda líquida, e para a fatura ou parcelas do cartão de crédito, até 10% a 15%. "O mercado costuma aprovar operações para financiamento de veículo, mas do ponto de vista de planejamento financeiro, acima disso, o carro começa a competir com despesas essenciais, como alimentação, saúde e educação", avalia a especialista.

Renda e gastos

Para a planejadora financeira e professora de Economia da ESPM, a recomendação para quem ganha R$ 3.000 é gastar entre R$ 300-R$ 450 com fatura de cartão porque esse meio de pagamento "tem o crédito mais caro do mercado mesmo parcelado ''sem juros'', ele reduz a renda disponível no mês seguinte", explica.

Em relação ao financiamento de carro, o gasto deve ser de até R$ 450, e para moradia, que inclui aluguel ou financiamento de imóvel, a faixa ideal de gasto seria entre R$ 750-900.

Se uma pessoa tem um gasto com aluguel (moradia) de R$ 800, parcela do veículo de R$ 400 e com fatura de cartão de crédito R$ 350, o comprometimento total dela é de R$ 1.550 ou 52% da renda líquida.

"Apesar de 52% parecerem alto, note que moradia é de 27% e dívidas de crédito de 25%, ainda dentro de uma zona administrável".

Já o planejador Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais, recomenda que a pessoa que tem uma renda líquida de R$ 3000, os gastos com aluguel, alimentação e transporte somem R$ 1.500, R$ 900 em lazer com a família e R$ 600 para investir e poder parar de trabalhar sem depender só do INSS.

Para uma pessoa com uma renda de R$ 9.000 reais, ela deve se limitar a gastos fixos de R$4.500, sendo para lazer R$ 2.700 e reservas R$ 1.800.

"Esse equilíbrio pode vir com controle de gastos ou rendas extras, o que permite que a pessoa viva, curta e possa viver bem quando quiser parar de trabalhar", completa Patzlaff.

Na visão de Paula Sauer, planejadora financeira e professora de Economia da ESPM, se a renda mensal for de R$ 9.000, o gasto com fatura de cartão de crédito deve ser entre R$ 900-R$ 1.350, com o financiamento de carro até R$ 1.350 e moradia entre R$ 2.250-R$2.700.

Paula explica que se a pessoa tem um gasto de R$ 2.400 com moradia, R$ 1.200 para financiamento de carro e R$ 1.000 com fatura de cartão, ela tem um comprometimento de R$ 4.600 ou 51% da renda.

"Famílias de renda mais alta podem comprometer uma parcela maior da renda sem necessariamente entrar em risco, porque sobra um valor absoluto maior para poupança e emergência", diz.

Passou da linha

Em caso de a pessoa ultrapassar os 30% da renda com dívidas ou mesmo qualquer imprevisto como uma consulta médica, conserto de carro, o risco sobe porque ela não vai conseguir pagar o valor total da fatura do cartão de crédito, e o comportamento típico é pagar apenas o mínimo do cartão.

Com isso, a pessoa vai sofrer com os juros altos do rotativo do cartão e do cheque especial e a dívida pode dobrar de tamanho, explicam os especialistas.

Para Paula, quando a pessoa "usa o limite do cartão como complemento de renda; parcela a fatura (crédito rotativo); atrasa contas essenciais e usa um crédito para pagar outro, é um sinal de alerta".

Em um cenário de uma pessoa com uma renda de R$ 3.000, sendo que paga em R$ 1.000 de aluguel, R$ 800 na prestação do carro e R$ 700 na fatura do cartão R$ 700, já tem R$ 2.500 comprometidos com dívidas ou 83% da renda, e restam apenas R$ 500 para alimentação, transporte saúde e imprevistos.

"Isso gera um quadro de estresse" porque vai faltar caixa, e a pessoa terá de recorrer ao rotativo do cartão explica Paula.

Se a pessoa deixa R$ 500 no rotativo e a taxa é de 12% ao mês, em 12 meses a dívida vira aproximadamente quase R$ 2.000.

Nesse contexto, o crédito fica comprometido porque a pessoa vai enfrentar aperto no orçamento, redução de limite do cartão de crédito, dificuldade de conseguir financiamento imobiliário, nas próximas operações os juros devem ser mais altos e a probabilidade de inadimplência aumenta, afirma Paula.

Dados recentes do Banco Central mostram que o rotativo do cartão continua entre as modalidades mais caras do sistema financeiro, o que explica por que o cartão merece um limite muito menor que o imóvel, completa a planejadora financeira e professora de Economia da ESPM.

Reserva de emergência

Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais, afirma que o ideal é não assumir uma prestação longa sem contar com uma reserva de emergência, ou seja, equivalente a seis meses do seu custo de vida fixo.

"Caso aconteça algum imprevisto, perda de emprego ou a renda cair, a pessoa tem uma reserva para pagar os boletos sem entrar no cheque especial".

"O limite do seu cartão não é um complemento da sua renda. Use o cartão com inteligência, para conseguir benefícios a mais, como milhas e pontos, mas tendo a certeza que você terá o dinheiro na conta para pagar quando a fatura fechar", conclui.PP', '[{"type":"paragraph","text":"São Paulo, 11/08/2026 - O porcentual de famílias brasileiras endividadas bateu - de novo - mais um recorde, para 82% em julho, segundo dados da Pesquisa de Endividamento e Inadimplência do Consumidor, organizada pela Confederação Nacional do Comércio de Bens, Serviços e Turismo (CNC). Isso significa que cerca de 4 em cada 5 lares do País possuem algum compromisso financeiro a vencer."},{"type":"paragraph","text":"Se a sua ideia é fugir das dívidas, já parou para pensar quanto da sua renda líquida mensal pode ser destinado para pagar, por exemplo, a prestação de um financiamento de carro ou imóvel, a fatura do cartão de crédito e até o valor do aluguel?"},{"type":"paragraph","text":"Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais, recomenda a adoção do método 50/30/20, que divide a renda mensal em três grandes grupos com o objetivo de organizar os recursos de uma maneira mais simples."},{"type":"paragraph","text":"A regra funciona assim: a maior parte da renda, ou 50%, pode ser direcionada aos gastos fixos, como o valor do aluguel e até parte da parcela de um imóvel."},{"type":"paragraph","text":"Já 30% poderia ser reservados para pagamento do cartão de crédito e da manutenção do carro. Restariam 20% para investimentos, pensando na sua liberdade financeira e futuro."},{"type":"paragraph","text":"\"O ideal seria que o total das parcelas, incluindo cartão, financiamento e imóvel não ultrapassassem 30% do total da sua renda. Com isso, o espaço para o lazer e os investimentos mais consistentes ficaria garantido\", afirma."},{"type":"paragraph","text":"Vale conferir"},{"type":"paragraph","text":"Para Paula Sauer, planejadora financeira e professora de Economia da ESPM, o método 50/30/20 funciona apenas na teoria. Ela trabalha com porcentuais de até 25% a 30% destinados à prestação da moradia, incluindo o aluguel ou prestação de um imóvel, condomínio e IPTU."},{"type":"paragraph","text":"Segundo a Pesquisa de Orçamentos Familiares do Instituto Brasileiro de Geografia e Estatística (IBGE), nas famílias de menor renda, somente a habitação já consome quase 40% dos recursos regulares."},{"type":"paragraph","text":"\"Isso ajuda a explicar por que muitas delas encontram dificuldade para acomodar novas prestações sem comprometer outras despesas essenciais\", diz Paula."},{"type":"paragraph","text":"Para o financiamento do veículo, a reserva seria até 15% da renda líquida, e para a fatura ou parcelas do cartão de crédito, até 10% a 15%. \"O mercado costuma aprovar operações para financiamento de veículo, mas do ponto de vista de planejamento financeiro, acima disso, o carro começa a competir com despesas essenciais, como alimentação, saúde e educação\", avalia a especialista."},{"type":"paragraph","text":"Renda e gastos"},{"type":"paragraph","text":"Para a planejadora financeira e professora de Economia da ESPM, a recomendação para quem ganha R$ 3.000 é gastar entre R$ 300-R$ 450 com fatura de cartão porque esse meio de pagamento \"tem o crédito mais caro do mercado mesmo parcelado ''sem juros'', ele reduz a renda disponível no mês seguinte\", explica."},{"type":"paragraph","text":"Em relação ao financiamento de carro, o gasto deve ser de até R$ 450, e para moradia, que inclui aluguel ou financiamento de imóvel, a faixa ideal de gasto seria entre R$ 750-900."},{"type":"paragraph","text":"Se uma pessoa tem um gasto com aluguel (moradia) de R$ 800, parcela do veículo de R$ 400 e com fatura de cartão de crédito R$ 350, o comprometimento total dela é de R$ 1.550 ou 52% da renda líquida."},{"type":"paragraph","text":"\"Apesar de 52% parecerem alto, note que moradia é de 27% e dívidas de crédito de 25%, ainda dentro de uma zona administrável\"."},{"type":"paragraph","text":"Já o planejador Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais, recomenda que a pessoa que tem uma renda líquida de R$ 3000, os gastos com aluguel, alimentação e transporte somem R$ 1.500, R$ 900 em lazer com a família e R$ 600 para investir e poder parar de trabalhar sem depender só do INSS."},{"type":"paragraph","text":"Para uma pessoa com uma renda de R$ 9.000 reais, ela deve se limitar a gastos fixos de R$4.500, sendo para lazer R$ 2.700 e reservas R$ 1.800."},{"type":"paragraph","text":"\"Esse equilíbrio pode vir com controle de gastos ou rendas extras, o que permite que a pessoa viva, curta e possa viver bem quando quiser parar de trabalhar\", completa Patzlaff."},{"type":"paragraph","text":"Na visão de Paula Sauer, planejadora financeira e professora de Economia da ESPM, se a renda mensal for de R$ 9.000, o gasto com fatura de cartão de crédito deve ser entre R$ 900-R$ 1.350, com o financiamento de carro até R$ 1.350 e moradia entre R$ 2.250-R$2.700."},{"type":"paragraph","text":"Paula explica que se a pessoa tem um gasto de R$ 2.400 com moradia, R$ 1.200 para financiamento de carro e R$ 1.000 com fatura de cartão, ela tem um comprometimento de R$ 4.600 ou 51% da renda."},{"type":"paragraph","text":"\"Famílias de renda mais alta podem comprometer uma parcela maior da renda sem necessariamente entrar em risco, porque sobra um valor absoluto maior para poupança e emergência\", diz."},{"type":"paragraph","text":"Passou da linha"},{"type":"paragraph","text":"Em caso de a pessoa ultrapassar os 30% da renda com dívidas ou mesmo qualquer imprevisto como uma consulta médica, conserto de carro, o risco sobe porque ela não vai conseguir pagar o valor total da fatura do cartão de crédito, e o comportamento típico é pagar apenas o mínimo do cartão."},{"type":"paragraph","text":"Com isso, a pessoa vai sofrer com os juros altos do rotativo do cartão e do cheque especial e a dívida pode dobrar de tamanho, explicam os especialistas."},{"type":"paragraph","text":"Para Paula, quando a pessoa \"usa o limite do cartão como complemento de renda; parcela a fatura (crédito rotativo); atrasa contas essenciais e usa um crédito para pagar outro, é um sinal de alerta\"."},{"type":"paragraph","text":"Em um cenário de uma pessoa com uma renda de R$ 3.000, sendo que paga em R$ 1.000 de aluguel, R$ 800 na prestação do carro e R$ 700 na fatura do cartão R$ 700, já tem R$ 2.500 comprometidos com dívidas ou 83% da renda, e restam apenas R$ 500 para alimentação, transporte saúde e imprevistos."},{"type":"paragraph","text":"\"Isso gera um quadro de estresse\" porque vai faltar caixa, e a pessoa terá de recorrer ao rotativo do cartão explica Paula."},{"type":"paragraph","text":"Se a pessoa deixa R$ 500 no rotativo e a taxa é de 12% ao mês, em 12 meses a dívida vira aproximadamente quase R$ 2.000."},{"type":"paragraph","text":"Nesse contexto, o crédito fica comprometido porque a pessoa vai enfrentar aperto no orçamento, redução de limite do cartão de crédito, dificuldade de conseguir financiamento imobiliário, nas próximas operações os juros devem ser mais altos e a probabilidade de inadimplência aumenta, afirma Paula."},{"type":"paragraph","text":"Dados recentes do Banco Central mostram que o rotativo do cartão continua entre as modalidades mais caras do sistema financeiro, o que explica por que o cartão merece um limite muito menor que o imóvel, completa a planejadora financeira e professora de Economia da ESPM."},{"type":"paragraph","text":"Reserva de emergência"},{"type":"paragraph","text":"Jeff Patzlaff, planejador financeiro e especialista em finanças pessoais, afirma que o ideal é não assumir uma prestação longa sem contar com uma reserva de emergência, ou seja, equivalente a seis meses do seu custo de vida fixo."},{"type":"paragraph","text":"\"Caso aconteça algum imprevisto, perda de emprego ou a renda cair, a pessoa tem uma reserva para pagar os boletos sem entrar no cheque especial\"."},{"type":"paragraph","text":"\"O limite do seu cartão não é um complemento da sua renda. Use o cartão com inteligência, para conseguir benefícios a mais, como milhas e pontos, mas tendo a certeza que você terá o dinheiro na conta para pagar quando a fatura fechar\", conclui.PP"}]'::jsonb, 'soraia-budaibes-especial-para-a-broadcast', 'Soraia Budaibes, especial para a Broadcast', 'InvesTalk - Banco do Brasil', 'https://investalk.bb.com.br/noticias/economia/sua-renda-aguenta-veja-o-porcentual-seguro-para-gastar-com-casa-carro-e-cartao', '2026-08-11T13:42:00-03:00'::timestamptz, false, 'financas-comportamentais.webp', 'Imagem editorial relacionada a alívio no orçamento.', null),
    (14, 'BV-014', 'alivio-no-orcamento', 'precos-nos-supermercados-vao-cair-apos-queda-nos-juros', 'Preços nos supermercados vão cair após queda nos juros? Entenda', 'São Paulo - O Banco Central (BC) anunciou na noite de ontem mais uma redução no juro básico, a Selic, para 14% ao ano, dando continuidade ao ciclo de cortes iniciado em março pelo Comitê de Política Monetária (Copom).', 'São Paulo - O Banco Central (BC) anunciou na noite de ontem mais uma redução no juro básico, a Selic, para 14% ao ano, dando continuidade ao ciclo de cortes iniciado em março pelo Comitê de Política Monetária (Copom). O movimento pode demorar um pouco para apresentar impactos nas compras do supermercado, por exemplo. Mas tem muito mais peso na vida financeira do brasileiro do que se imagina. Seu alcance vai das taxas no financiamento, do empréstimo, aplicações financeiras ao limite da conta ou cartão de crédito.

"Temos alguns instrumentos que o Banco Central utiliza para controlar a inflação. A taxa de juros é um deles. Quando temos um juro mais baixo a população tende a comprar mais, especialmente itens que tem um financiamento mais longo, como carro, casa", explica a educadora financeira Izabel Rocha, formada em economia e com mestrado em finanças comportamentais.

Rocha observa que os efeitos dessa redução dos juros devem se apresentar de fato em um prazo mais longo. "Temos também um outro componente externo que é a questão do conflito dos EUA com o Irã, que tem um impacto direto nos preços do petróleo. E quando a gente fala em supermercado, por exemplo, estamos falando de custos de logística e consequentemente de combustível".

Ou seja, a queda na taxa Selic vai influenciar na redução de alguns preços, mas no médio e longo prazos. Com esse cenário externo mais turbulento, no entanto, talvez ainda demore um pouco mais para sentir os impactos desse corte.

QUEDA GRADUAL

Desde março, os juros já caíram 1%, em meio às incertezas relacionadas aos impactos da guerra no Irã sobre a cadeia global de suprimentos, os preços de commodities (como petróleo) e a própria inflação. Na ocasião, a Selic seguia por 10 meses conseguidos no maior nível em quase duas décadas, a 15% ao ano.

Para Marcos Freitas, analista macroeconômico da AF Invest, não houve grandes surpresas no anúncio do Copom. "A decisão ficou dentro do esperado. O comunicado também foi bastante semelhante ao da reunião anterior. Houve alguma revisão nas projeções de inflação para períodos mais curtos, mas com pouca influência sobre a condução da política monetária", afirmou.

RENDA FIXA AINDA VALE A PENA?

Nesse contexto, a renda fixa ainda se apresenta como um investimento interessante, pontua Rocha. É claro, acrescenta ela, com a inflação recuando é preciso olhar também como esse cenário afeta os juros futuros. "Temos de começar a olhar para 2027 e pensar em outras alternativas com boa rentabilidade. Se a Selic continuar caindo dessa forma talvez o juro chegue a 13% até o final do ano", observa.

Segundo Thiago Aor, diretor financeiro da Cora, o corte reforça que o BC segue priorizando a estabilização das expectativas e a consolidação do processo de queda da inflação, mesmo diante de um cenário externo ainda instável, marcado pelo conflito no Oriente Médio e pelas incertezas em torno do tarifaço americano.

E AS PEQUENAS E MÉDIAS EMPRESAS?

Para pequenas e médias empresas, o efeito imediato tende a ser limitado, avalia o diretor financeiro da Cora. O custo do crédito segue elevado, o que mantém pressão sobre capital de giro e decisões de investimento. "Na prática, a maioria das PMEs ainda deve priorizar a gestão de caixa em vez da expansão", afirma Aor.

A tendência é que os efeitos mais relevantes sobre crédito e atividade apareçam de forma progressiva, à medida que o ciclo de cortes avance e o cenário externo ganhe mais estabilidade, acreditam os economistas.



Palavras-chave: BC, dinheiro, juros, Selic, supermercado, consumo, inflação, Varejo', '[{"type":"paragraph","text":"São Paulo - O Banco Central (BC) anunciou na noite de ontem mais uma redução no juro básico, a Selic, para 14% ao ano, dando continuidade ao ciclo de cortes iniciado em março pelo Comitê de Política Monetária (Copom). O movimento pode demorar um pouco para apresentar impactos nas compras do supermercado, por exemplo. Mas tem muito mais peso na vida financeira do brasileiro do que se imagina. Seu alcance vai das taxas no financiamento, do empréstimo, aplicações financeiras ao limite da conta ou cartão de crédito."},{"type":"paragraph","text":"\"Temos alguns instrumentos que o Banco Central utiliza para controlar a inflação. A taxa de juros é um deles. Quando temos um juro mais baixo a população tende a comprar mais, especialmente itens que tem um financiamento mais longo, como carro, casa\", explica a educadora financeira Izabel Rocha, formada em economia e com mestrado em finanças comportamentais."},{"type":"paragraph","text":"Rocha observa que os efeitos dessa redução dos juros devem se apresentar de fato em um prazo mais longo. \"Temos também um outro componente externo que é a questão do conflito dos EUA com o Irã, que tem um impacto direto nos preços do petróleo. E quando a gente fala em supermercado, por exemplo, estamos falando de custos de logística e consequentemente de combustível\"."},{"type":"paragraph","text":"Ou seja, a queda na taxa Selic vai influenciar na redução de alguns preços, mas no médio e longo prazos. Com esse cenário externo mais turbulento, no entanto, talvez ainda demore um pouco mais para sentir os impactos desse corte."},{"type":"heading","text":"QUEDA GRADUAL"},{"type":"paragraph","text":"Desde março, os juros já caíram 1%, em meio às incertezas relacionadas aos impactos da guerra no Irã sobre a cadeia global de suprimentos, os preços de commodities (como petróleo) e a própria inflação. Na ocasião, a Selic seguia por 10 meses conseguidos no maior nível em quase duas décadas, a 15% ao ano."},{"type":"paragraph","text":"Para Marcos Freitas, analista macroeconômico da AF Invest, não houve grandes surpresas no anúncio do Copom. \"A decisão ficou dentro do esperado. O comunicado também foi bastante semelhante ao da reunião anterior. Houve alguma revisão nas projeções de inflação para períodos mais curtos, mas com pouca influência sobre a condução da política monetária\", afirmou."},{"type":"heading","text":"RENDA FIXA AINDA VALE A PENA?"},{"type":"paragraph","text":"Nesse contexto, a renda fixa ainda se apresenta como um investimento interessante, pontua Rocha. É claro, acrescenta ela, com a inflação recuando é preciso olhar também como esse cenário afeta os juros futuros. \"Temos de começar a olhar para 2027 e pensar em outras alternativas com boa rentabilidade. Se a Selic continuar caindo dessa forma talvez o juro chegue a 13% até o final do ano\", observa."},{"type":"paragraph","text":"Segundo Thiago Aor, diretor financeiro da Cora, o corte reforça que o BC segue priorizando a estabilização das expectativas e a consolidação do processo de queda da inflação, mesmo diante de um cenário externo ainda instável, marcado pelo conflito no Oriente Médio e pelas incertezas em torno do tarifaço americano."},{"type":"heading","text":"E AS PEQUENAS E MÉDIAS EMPRESAS?"},{"type":"paragraph","text":"Para pequenas e médias empresas, o efeito imediato tende a ser limitado, avalia o diretor financeiro da Cora. O custo do crédito segue elevado, o que mantém pressão sobre capital de giro e decisões de investimento. \"Na prática, a maioria das PMEs ainda deve priorizar a gestão de caixa em vez da expansão\", afirma Aor."},{"type":"paragraph","text":"A tendência é que os efeitos mais relevantes sobre crédito e atividade apareçam de forma progressiva, à medida que o ciclo de cortes avance e o cenário externo ganhe mais estabilidade, acreditam os economistas."},{"type":"paragraph","text":"Palavras-chave: BC, dinheiro, juros, Selic, supermercado, consumo, inflação, Varejo"}]'::jsonb, 'fabiana-holtz', 'Fabiana Holtz', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/precos-nos-supermercados-vao-cair-apos-queda-nos-juros-entenda.html', '2026-08-06T12:26:00-03:00'::timestamptz, false, 'financas-comportamentais.webp', 'Queda nos juros deve demorar um pouco para ser sentida nas compras do supermercado', 'Envato'),
    (15, 'BV-015', 'alivio-no-orcamento', 'como-economizar-energia-no-inverno', 'Como economizar energia no inverno? Saiba o que mais aumenta o consumo', 'São Paulo - O inverno é uma das épocas do ano em que o consumo de energia elétrica nas residências costuma aumentar, principalmente devido ao uso mais frequente do chuveiro elétrico e de aquecedores.', 'São Paulo - O inverno é uma das épocas do ano em que o consumo de energia elétrica nas residências costuma aumentar, principalmente devido ao uso mais frequente do chuveiro elétrico e de aquecedores. Segundo a Enel, distribuidora de energia em São Paulo, banhos mais longos e o chuveiro com a chave na posição "inverno" elevam o consumo de eletricidade, o que pode pesar na conta de luz. Além disso, o uso prolongado de aquecedores também contribui para o aumento dos gastos com energia.

Mudanças de hábito ajudam a reduzir o valor da conta de luz sem comprometer o conforto durante os dias frios. Confira a seguir:

GELADEIRA AUMENTA O CONSUMO

Abrir a geladeira várias vezes sem necessidade ou deixar a porta aberta por muito tempo eleva o gasto de energia. No inverno, não é preciso reduzir demais a temperatura do aparelho, já que o ambiente já está mais frio naturalmente. Outras recomendações incluem manter as borrachas de vedação em bom estado, evitar colocar alimentos quentes na geladeira e verificar se a temperatura está ajustada de acordo com as orientações do fabricante.

BANHO MAIS CURTO AJUDA A ECONOMIZAR

Reduzir o tempo de banho é uma das formas mais eficazes de economizar energia no inverno. Desligar o chuveiro ao se ensaboar e evitar a potência máxima quando não for necessário também reduz o consumo. De acordo com a Aneel, poucos minutos a menos no banho, quando viram hábito da família, já resultam em queda perceptível no consumo mensal de eletricidade.

LUZ NATURAL REDUZ USO DE LÂMPADAS

Mesmo com dias mais curtos, aproveitar a luz natural continua sendo uma alternativa ao uso de lâmpadas. Manter cortinas e janelas abertas durante o dia ajuda a diminuir o consumo de energia elétrica. Dessa forma, organizar os ambientes da casa para aproveitar melhor essa iluminação é um hábito simples que gera economia ao longo de todo o inverno.

USO CONSCIENTE DE AQUECEDORES ELÉTRICOS

Aquecedores elétricos devem ficar ligados apenas pelo tempo necessário, em ambientes fechados, sem permanecer ligados continuamente. Antes de comprar um aquecedor, é possível verificar a Etiqueta Nacional de Conservação de Energia (Ence), do Inmetro, que identifica os modelos mais eficientes. O Inmetro destaca que aparelhos com melhor classificação energética consomem menos eletricidade ao longo da vida útil.

APARELHOS EM STAND-BY

Os eletrônicos ligados em modo de espera continuam gastando eletricidade, mesmo consumindo menos que o chuveiro elétrico. É importante desligar da tomada televisores, computadores, videogames e carregadores fora de uso para ajudar a evitar desperdício. Também vale substituir lâmpadas incandescentes ou fluorescentes por modelos de LED também reduz o consumo. Segundo o Inmetro, as lâmpadas de LED têm maior eficiência energética e vida útil mais longa que as tecnologias antigas.

DICAS PARA ECONOMIZAR ENERGIA NO INVERNO

- Reduzir o tempo de banho;
- Usar o chuveiro na temperatura adequada;
- Desligar aquecedores quando o ambiente já estiver aquecido;
- Evitar abrir a geladeira repetidamente;
- Retirar aparelhos da tomada quando não estiverem em uso;
- Trocar lâmpadas por modelos de LED;
- Priorizar equipamentos com melhor classificação de eficiência energética.



Palavras-chave: consumo, conta de luz, dinheiro, economia, energia, aquecedor, eficiência energética, inverno', '[{"type":"paragraph","text":"São Paulo - O inverno é uma das épocas do ano em que o consumo de energia elétrica nas residências costuma aumentar, principalmente devido ao uso mais frequente do chuveiro elétrico e de aquecedores. Segundo a Enel, distribuidora de energia em São Paulo, banhos mais longos e o chuveiro com a chave na posição \"inverno\" elevam o consumo de eletricidade, o que pode pesar na conta de luz. Além disso, o uso prolongado de aquecedores também contribui para o aumento dos gastos com energia."},{"type":"paragraph","text":"Mudanças de hábito ajudam a reduzir o valor da conta de luz sem comprometer o conforto durante os dias frios. Confira a seguir:"},{"type":"heading","text":"GELADEIRA AUMENTA O CONSUMO"},{"type":"paragraph","text":"Abrir a geladeira várias vezes sem necessidade ou deixar a porta aberta por muito tempo eleva o gasto de energia. No inverno, não é preciso reduzir demais a temperatura do aparelho, já que o ambiente já está mais frio naturalmente. Outras recomendações incluem manter as borrachas de vedação em bom estado, evitar colocar alimentos quentes na geladeira e verificar se a temperatura está ajustada de acordo com as orientações do fabricante."},{"type":"heading","text":"BANHO MAIS CURTO AJUDA A ECONOMIZAR"},{"type":"paragraph","text":"Reduzir o tempo de banho é uma das formas mais eficazes de economizar energia no inverno. Desligar o chuveiro ao se ensaboar e evitar a potência máxima quando não for necessário também reduz o consumo. De acordo com a Aneel, poucos minutos a menos no banho, quando viram hábito da família, já resultam em queda perceptível no consumo mensal de eletricidade."},{"type":"heading","text":"LUZ NATURAL REDUZ USO DE LÂMPADAS"},{"type":"paragraph","text":"Mesmo com dias mais curtos, aproveitar a luz natural continua sendo uma alternativa ao uso de lâmpadas. Manter cortinas e janelas abertas durante o dia ajuda a diminuir o consumo de energia elétrica. Dessa forma, organizar os ambientes da casa para aproveitar melhor essa iluminação é um hábito simples que gera economia ao longo de todo o inverno."},{"type":"heading","text":"USO CONSCIENTE DE AQUECEDORES ELÉTRICOS"},{"type":"paragraph","text":"Aquecedores elétricos devem ficar ligados apenas pelo tempo necessário, em ambientes fechados, sem permanecer ligados continuamente. Antes de comprar um aquecedor, é possível verificar a Etiqueta Nacional de Conservação de Energia (Ence), do Inmetro, que identifica os modelos mais eficientes. O Inmetro destaca que aparelhos com melhor classificação energética consomem menos eletricidade ao longo da vida útil."},{"type":"heading","text":"APARELHOS EM STAND-BY"},{"type":"paragraph","text":"Os eletrônicos ligados em modo de espera continuam gastando eletricidade, mesmo consumindo menos que o chuveiro elétrico. É importante desligar da tomada televisores, computadores, videogames e carregadores fora de uso para ajudar a evitar desperdício. Também vale substituir lâmpadas incandescentes ou fluorescentes por modelos de LED também reduz o consumo. Segundo o Inmetro, as lâmpadas de LED têm maior eficiência energética e vida útil mais longa que as tecnologias antigas."},{"type":"heading","text":"DICAS PARA ECONOMIZAR ENERGIA NO INVERNO"},{"type":"paragraph","text":"- Reduzir o tempo de banho; - Usar o chuveiro na temperatura adequada; - Desligar aquecedores quando o ambiente já estiver aquecido; - Evitar abrir a geladeira repetidamente; - Retirar aparelhos da tomada quando não estiverem em uso; - Trocar lâmpadas por modelos de LED; - Priorizar equipamentos com melhor classificação de eficiência energética."},{"type":"paragraph","text":"Palavras-chave: consumo, conta de luz, dinheiro, economia, energia, aquecedor, eficiência energética, inverno"}]'::jsonb, 'alexandre-barreto', 'Alexandre Barreto', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/como-economizar-energia-no-inverno-saiba-o-que-mais-aumenta-o-consumo.html', '2026-08-02T16:30:00-03:00'::timestamptz, false, 'financas-comportamentais.webp', 'Mudanças de hábito ajudam a reduzir o valor da conta de luz durante o inverno', 'Pexels'),
    (16, 'BV-016', 'alivio-no-orcamento', 'caminho-das-milhas-como-funcionam-os-programas', 'Caminho das Milhas: entenda como funcionam os programas e viaje muito mais', 'São Paulo - O seu cartão de crédito vai acumulando pontos que poderiam ser convertidos em milhas aéreas e o seu celular é constantemente bombardeado com propaganda de programas e clubes de milhagem, porém você nunca teve coragem de desbravar essa trilha?', 'São Paulo - O seu cartão de crédito vai acumulando pontos que poderiam ser convertidos em milhas aéreas e o seu celular é constantemente bombardeado com propaganda de programas e clubes de milhagem, porém você nunca teve coragem de desbravar essa trilha? Fique tranquilo caro leitor, pois o VIVA preparou aqui um pequeno guia para iniciantes. E o nosso ''instrutor de voo'' convocado para essa missão é Rodrigo Góes, especialista em milhas, autor de "O mapa para acumular 1 milhão de milhas" e "Educação financeira em milhas: Como transformar milhas em economia real e realizar seus sonhos".

Segundo Góes para começar a entender como funciona e o que move esse sistema primeiramente é preciso identificar a diferença entre milhas e pontos no seu dia a dia e como eles estão conectados.

"Milha aérea é uma pontuação que a gente utiliza como forma de benefício dentro dos programas de fidelidade das companhias aéreas como Latam, Gol e Azul. Já os pontos, por si só, são o que a gente acumula dentro de programas de fidelidade que não são das companhias aéreas (exemplo, bancos, redes de hotelaria, supermercados, lojas de departamento, e em muitos casos também podem ser convertidos em cash back, história para um outro momento)", explica Góes.

Em resumo: quando eu quero utilizar meus pontos para viajar, me hospedar ou até mesmo para vender e fazer uma renda extra, aqueles pontos que eu tenho no banco podem ser transferidos para um programa de fidelidade de companhia aérea. Nesse momento eles viram milhas.

E COMO FUNCIONA ESSA TROCA?

A companhia aérea normalmente é dona de um programa de fidelidade. Por vezes se trata de uma única empresa, outras vezes de empresas distintas que fazem parte de um mesmo grupo. Essa pontuação que vai se acumulando no seu cartão de alguma maneira é vendida para os parceiros.

Se o programa de fidelidade do seu banco for afiliado a um programa de fidelidade de companhia aérea, explica Góes, aquele banco vai pagar um valor por milha para essa companhia aérea e da mesma forma, ele consegue fornecer isso para os clientes dele. É uma forma de fidelizar o cliente dentro desse ecossistema que vai do ponto a milha. "Para o consumidor final, muitas vezes sim, é de graça, pois é baseado na sua fidelidade perante aquele banco ou aquela companhia aérea", afirma.

MILHAS É PRA QUALQUER FAIXA DE RENDA?

Segundo Góes, o mundo das milhas é para qualquer pessoa. Ele diz, inclusive, que fala sempre sobre isso em seus cursos. Hoje é possível encontrar mais de 10 formas de acúmulo de pontos, acrescenta ele. "Já tem até cartão de crédito disponível que acumula milhas para as pessoas que ganham um salário mínimo". A realidade é que algumas pessoas conseguem acumular em uma velocidade maior, outras em uma velocidade menor. Entretanto, quem tem um gasto menor, se usar uma boa estratégia consegue muitas vezes acumular mais rápido.

Sai na frente quem está atento as ''compras bonificadas'' que estão embutidas na compra do mercado, da farmácia, da loja de vestuário, material esportivo, eletrônico, eletrodoméstico. Quando você compra em sites parceiros em geral é "presenteado" com milhas extras apenas por dar preferência àquela parceria. Ou seja, ganha só por comprar naquele site algo que já compraria normalmente.

O SEGREDO DAS ''COMPRAS BONIFICADAS''

As grandes marcas têm parcerias tanto com os programas de pontos de bancos, quanto com os das companhias aéreas, onde você consegue ganhar de três a cinco pontos por real gasto. É preciso acompanhar as promoções, afirma Góes, que podem chegar a oferecer 15 milhas ou até 20 milhas por real gasto. Fazendo as contas é visível a vantagem em relação ao cartão de crédito.

"E se você paga com o cartão, ganha duas vezes. Você ganha pelas compras bonificadas e pelo gasto no cartão de crédito. Essa é uma forma, inclusive, que possibilita acumular milhas com gasto daquele amigo ou parente que te pede ajuda para fazer uma compra. E é muito simples: você faz a compra através da loja parceira atrelada ao seu cadastro, ele efetua o pagamento, mas o acúmulo de milhas é creditado para o seu CPF. Caso seja uma pessoa da sua confiança, você ainda pode usar o seu cartão de crédito para efetuar a compra e também acumular pontos nele. Essa é uma segunda forma de acumular milhas."

MILHAS NO UBER?

Outra forma interessante de acumular milhas é no uso de transporte por aplicativo. Através do Uber, por exemplo, Góes conta que há de três formas de ganhar mais milhas. "Você consegue comprar crédito para usar o Uber no site da Smiles se você é cliente do programa de fidelidade da Gol, e assim você também ganha milhas com isso". Para usufruir dessa vantagem basta vincular a sua conta do Uber para automaticamente transformar em pontos suas corridas. "Com isso você ainda ganha as milhas do cartão de crédito ao comprar esses créditos em uma corrida por aplicativo".

"Então a pessoa que não tem o conhecimento, no máximo vai seguir acumulando pelo cartão. Quem tem o conhecimento do sistema em uma única corrida consegue acumular de três formas."

CLUBES DE MILHAGENS

O clube é uma forma de acumular milhas, mas nas palavras de Góes deve ser visto como um "acúmulo de investimento". Isso porque nesse caso é necessário assinar e pagar uma mensalidade por esse serviço. Se for em promoção vale a pena, garante ele.

Alguns incentivos dados pelos clubes vão da transferência de pontos com o máximo de bônus, resgate de passagens aéreas com tabela diferenciada a recompensa ao comprar em sites parceiros e milhas qualificáveis.

PRINCIPAIS ERROS DOS INICIANTES

Acumular apenas via cartão - Na avaliação do especialista o problema aqui é que assim você deixa de acumular milhas por outros meios.

Deixar expirar as milhas - Ele recorda que essas 10 mil milhas ou 20 mil milhas que você deixou expirar podem valer de R$ 200 a R$ 400 ou oportunidades de viajar de graça através dessas milhas. "Esse é um erro muito comum, ignorar os prazos para uso das milhas", lamenta.

Momento certo para a transferência bonificada - Existe a hora certa para fazer isso, ensina Góes, e esse momento é quando há uma promoção para transferência. "Elas acontecem o tempo inteiro. Praticamente toda semana tem promoção e elas chegam a dar 100%, 115% de bônus", diz o especialista.

Preste atenção na validade - O consumidor precisa ficar atento a validade ao transferir do programa de banco para o programa de fidelidade de companhia aérea. Isso porque esses pontos que estavam para expirar, já passam a ter uma nova validade, que vai de 6 meses até 20 anos, a depender do programa de fidelidade.

Na prática, o consumidor ganha um fôlego para aqueles pontos que foram convertidos em milhas. Se o prazo das suas milhas está próximo de expirar o ideal é que você os utilize, seja na emissão de uma passagem aérea, em uma reserva de hotel, aluguel de carro ou até vendendo a parte que está para expirar e embolsando uma grana.



Palavras-chave: dinheiro, guia, milhas, viagem, cartão de crédito, cartão de débito, companhias aéreas, turismo', '[{"type":"paragraph","text":"São Paulo - O seu cartão de crédito vai acumulando pontos que poderiam ser convertidos em milhas aéreas e o seu celular é constantemente bombardeado com propaganda de programas e clubes de milhagem, porém você nunca teve coragem de desbravar essa trilha? Fique tranquilo caro leitor, pois o VIVA preparou aqui um pequeno guia para iniciantes. E o nosso ''instrutor de voo'' convocado para essa missão é Rodrigo Góes, especialista em milhas, autor de \"O mapa para acumular 1 milhão de milhas\" e \"Educação financeira em milhas: Como transformar milhas em economia real e realizar seus sonhos\"."},{"type":"paragraph","text":"Segundo Góes para começar a entender como funciona e o que move esse sistema primeiramente é preciso identificar a diferença entre milhas e pontos no seu dia a dia e como eles estão conectados."},{"type":"paragraph","text":"\"Milha aérea é uma pontuação que a gente utiliza como forma de benefício dentro dos programas de fidelidade das companhias aéreas como Latam, Gol e Azul. Já os pontos, por si só, são o que a gente acumula dentro de programas de fidelidade que não são das companhias aéreas (exemplo, bancos, redes de hotelaria, supermercados, lojas de departamento, e em muitos casos também podem ser convertidos em cash back, história para um outro momento)\", explica Góes."},{"type":"paragraph","text":"Em resumo: quando eu quero utilizar meus pontos para viajar, me hospedar ou até mesmo para vender e fazer uma renda extra, aqueles pontos que eu tenho no banco podem ser transferidos para um programa de fidelidade de companhia aérea. Nesse momento eles viram milhas."},{"type":"heading","text":"E COMO FUNCIONA ESSA TROCA?"},{"type":"paragraph","text":"A companhia aérea normalmente é dona de um programa de fidelidade. Por vezes se trata de uma única empresa, outras vezes de empresas distintas que fazem parte de um mesmo grupo. Essa pontuação que vai se acumulando no seu cartão de alguma maneira é vendida para os parceiros."},{"type":"paragraph","text":"Se o programa de fidelidade do seu banco for afiliado a um programa de fidelidade de companhia aérea, explica Góes, aquele banco vai pagar um valor por milha para essa companhia aérea e da mesma forma, ele consegue fornecer isso para os clientes dele. É uma forma de fidelizar o cliente dentro desse ecossistema que vai do ponto a milha. \"Para o consumidor final, muitas vezes sim, é de graça, pois é baseado na sua fidelidade perante aquele banco ou aquela companhia aérea\", afirma."},{"type":"heading","text":"MILHAS É PRA QUALQUER FAIXA DE RENDA?"},{"type":"paragraph","text":"Segundo Góes, o mundo das milhas é para qualquer pessoa. Ele diz, inclusive, que fala sempre sobre isso em seus cursos. Hoje é possível encontrar mais de 10 formas de acúmulo de pontos, acrescenta ele. \"Já tem até cartão de crédito disponível que acumula milhas para as pessoas que ganham um salário mínimo\". A realidade é que algumas pessoas conseguem acumular em uma velocidade maior, outras em uma velocidade menor. Entretanto, quem tem um gasto menor, se usar uma boa estratégia consegue muitas vezes acumular mais rápido."},{"type":"paragraph","text":"Sai na frente quem está atento as ''compras bonificadas'' que estão embutidas na compra do mercado, da farmácia, da loja de vestuário, material esportivo, eletrônico, eletrodoméstico. Quando você compra em sites parceiros em geral é \"presenteado\" com milhas extras apenas por dar preferência àquela parceria. Ou seja, ganha só por comprar naquele site algo que já compraria normalmente."},{"type":"heading","text":"O SEGREDO DAS ''COMPRAS BONIFICADAS''"},{"type":"paragraph","text":"As grandes marcas têm parcerias tanto com os programas de pontos de bancos, quanto com os das companhias aéreas, onde você consegue ganhar de três a cinco pontos por real gasto. É preciso acompanhar as promoções, afirma Góes, que podem chegar a oferecer 15 milhas ou até 20 milhas por real gasto. Fazendo as contas é visível a vantagem em relação ao cartão de crédito."},{"type":"paragraph","text":"\"E se você paga com o cartão, ganha duas vezes. Você ganha pelas compras bonificadas e pelo gasto no cartão de crédito. Essa é uma forma, inclusive, que possibilita acumular milhas com gasto daquele amigo ou parente que te pede ajuda para fazer uma compra. E é muito simples: você faz a compra através da loja parceira atrelada ao seu cadastro, ele efetua o pagamento, mas o acúmulo de milhas é creditado para o seu CPF. Caso seja uma pessoa da sua confiança, você ainda pode usar o seu cartão de crédito para efetuar a compra e também acumular pontos nele. Essa é uma segunda forma de acumular milhas.\""},{"type":"heading","text":"MILHAS NO UBER?"},{"type":"paragraph","text":"Outra forma interessante de acumular milhas é no uso de transporte por aplicativo. Através do Uber, por exemplo, Góes conta que há de três formas de ganhar mais milhas. \"Você consegue comprar crédito para usar o Uber no site da Smiles se você é cliente do programa de fidelidade da Gol, e assim você também ganha milhas com isso\". Para usufruir dessa vantagem basta vincular a sua conta do Uber para automaticamente transformar em pontos suas corridas. \"Com isso você ainda ganha as milhas do cartão de crédito ao comprar esses créditos em uma corrida por aplicativo\"."},{"type":"paragraph","text":"\"Então a pessoa que não tem o conhecimento, no máximo vai seguir acumulando pelo cartão. Quem tem o conhecimento do sistema em uma única corrida consegue acumular de três formas.\""},{"type":"heading","text":"CLUBES DE MILHAGENS"},{"type":"paragraph","text":"O clube é uma forma de acumular milhas, mas nas palavras de Góes deve ser visto como um \"acúmulo de investimento\". Isso porque nesse caso é necessário assinar e pagar uma mensalidade por esse serviço. Se for em promoção vale a pena, garante ele."},{"type":"paragraph","text":"Alguns incentivos dados pelos clubes vão da transferência de pontos com o máximo de bônus, resgate de passagens aéreas com tabela diferenciada a recompensa ao comprar em sites parceiros e milhas qualificáveis."},{"type":"heading","text":"PRINCIPAIS ERROS DOS INICIANTES"},{"type":"paragraph","text":"Acumular apenas via cartão - Na avaliação do especialista o problema aqui é que assim você deixa de acumular milhas por outros meios."},{"type":"paragraph","text":"Deixar expirar as milhas - Ele recorda que essas 10 mil milhas ou 20 mil milhas que você deixou expirar podem valer de R$ 200 a R$ 400 ou oportunidades de viajar de graça através dessas milhas. \"Esse é um erro muito comum, ignorar os prazos para uso das milhas\", lamenta."},{"type":"paragraph","text":"Momento certo para a transferência bonificada - Existe a hora certa para fazer isso, ensina Góes, e esse momento é quando há uma promoção para transferência. \"Elas acontecem o tempo inteiro. Praticamente toda semana tem promoção e elas chegam a dar 100%, 115% de bônus\", diz o especialista."},{"type":"paragraph","text":"Preste atenção na validade - O consumidor precisa ficar atento a validade ao transferir do programa de banco para o programa de fidelidade de companhia aérea. Isso porque esses pontos que estavam para expirar, já passam a ter uma nova validade, que vai de 6 meses até 20 anos, a depender do programa de fidelidade."},{"type":"paragraph","text":"Na prática, o consumidor ganha um fôlego para aqueles pontos que foram convertidos em milhas. Se o prazo das suas milhas está próximo de expirar o ideal é que você os utilize, seja na emissão de uma passagem aérea, em uma reserva de hotel, aluguel de carro ou até vendendo a parte que está para expirar e embolsando uma grana."},{"type":"paragraph","text":"Palavras-chave: dinheiro, guia, milhas, viagem, cartão de crédito, cartão de débito, companhias aéreas, turismo"}]'::jsonb, 'fabiana-holtz', 'Fabiana Holtz', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/caminho-das-milhas-entenda-como-funcionam-os-programas-e-viaje-muito-mais.html', '2026-08-02T14:30:00-03:00'::timestamptz, false, 'financas-comportamentais.webp', 'Saber a diferença entre pontos e milhas é o primeiro passo para dominar o sistema', 'Envato'),
    (17, 'BV-017', 'guias', 'como-declarar-imposto-de-renda-2026', 'Imposto de Renda 2026 - Faça sua declaração como um especialista', 'OBSERVAÇÃO: Esta é uma página-guia (hub) do InvesTalk com atalhos para os diversos temas da declaração do Imposto de Renda 2026.', 'OBSERVAÇÃO: Esta é uma página-guia (hub) do InvesTalk com atalhos para os
diversos temas da declaração do Imposto de Renda 2026. A página reúne
cards com os seguintes tópicos:

COMO DECLARAR NO IR:

- Ações e ETFs
- Fundos Imobiliários
- Títulos de crédito privado
- Fundos de investimento
- Previdência Privada
- Poupança, LCI e LCA
- CDB e Tesouro Direto
- Criptomoedas
- Mais sobre o IR



Conteúdo extraído da página hub em 20/08/2026.
Para o texto completo de cada tópico, acesse o link original.', '[{"type":"paragraph","text":"OBSERVAÇÃO: Esta é uma página-guia (hub) do InvesTalk com atalhos para os diversos temas da declaração do Imposto de Renda 2026. A página reúne cards com os seguintes tópicos:"},{"type":"heading","text":"COMO DECLARAR NO IR:"},{"type":"paragraph","text":"- Ações e ETFs - Fundos Imobiliários - Títulos de crédito privado - Fundos de investimento - Previdência Privada - Poupança, LCI e LCA - CDB e Tesouro Direto - Criptomoedas - Mais sobre o IR"},{"type":"paragraph","text":"Conteúdo extraído da página hub em 20/08/2026. Para o texto completo de cada tópico, acesse o link original."}]'::jsonb, 'investalk', 'InvesTalk', 'InvesTalk - Banco do Brasil (Guia especial)', 'https://investalk.bb.com.br/como-declarar-imposto-de-renda', null, false, 'planejamento-financeiro.webp', 'Imagem editorial relacionada a guias.', null),
    (18, 'BV-018', 'guias', 'guia-do-credito-consignado', 'Guia do crédito consignado: como contratar e escapar dos juros altos', 'São Paulo - O crédito consignado pode ser uma alternativa para quem precisa reorganizar as finanças ou trocar uma dívida com juros altos e considerada cara, como cartão de crédito e cheque especial, por uma mais barata.', 'São Paulo - O crédito consignado pode ser uma alternativa para quem precisa reorganizar as finanças ou trocar uma dívida com juros altos e considerada cara, como cartão de crédito e cheque especial, por uma mais barata.

Esse tipo de empréstimo com desconto em folha está disponível para aposentados e beneficiários do INSS, servidores públicos, trabalhadores com carteira assinada e motoristas de aplicativo. Esse tipo de empréstimo, no entanto, tem suas limitações: os valores disponíveis são atrelados ao seu rendimento mensal e, por isso, são menores do que outros empréstimos. Outra questão a ser considerada é que o parcelamento pode se estender por anos, comprometendo parte importante do salário.

A seguir, conheça os prós e contras desse tipo de empréstimo e as novas regras do mercado antes de contratar o crédito consignado.

O QUE É E POR QUE É MAIS BARATO?

O crédito consignado (ou empréstimo com desconto em folha) é uma modalidade onde as parcelas são descontadas automaticamente todo mês diretamente do salário, pensão ou benefício do contratante, antes mesmo de o valor líquido ser depositado em sua conta.

Por garantir ao banco que o valor será pago com o salário, ou seja, por apresentar baixo risco de inadimplência, essa modalidade oferece taxas de juros significativamente menores quando comparadas com o cartão de crédito tradicional, empréstimos pessoais ou cheque especial.

Basicamente, os bancos ofereciam duas opções: o empréstimo consignado convencional (onde você recebe o dinheiro e paga parcelas fixas) e o cartão de crédito consignado (usado para compras no comércio). Esse cartão de crédito, no entanto, deixará de ser oferecido nos próximos meses.

QUEM PODE CONTRATAR?

- Trabalhadores com carteira assinada (CLT) no setor privado ou público.
- Aposentados do INSS.
- Servidores públicos.
- Desde julho de 2025, a modalidade foi expandida para motoristas e entregadores de aplicativo, desde que haja um convênio entre a plataforma parceira e uma instituição financeira.

APOSENTADOS DO INSS

Aposentados do INSS podem contratar o crédito consignado diretamente com bancos autorizados, com parcelas fixas descontadas no benefício, taxa de juros de 1,86% ao mês e prazo de até 108 meses (9 anos) para pagar. A contratação exige desbloqueio do benefício no app Meu INSS.

O valor do empréstimo é determinado pela margem consignável, isto é, o limite percentual do salário ou benefício que pode ser comprometido mensalmente com o pagamento da dívida. Atualmente, o aposentado ou beneficiário pode comprometer até 40% do rendimento mensal com o pagamento do empréstimo.

TRABALHADORES CLT

Quem trabalha no setor privado e tem carteira assinada não depende mais de que a empresa tenha acordo com algum banco e pode contratar o crédito consignado pelo celular, em diferentes instituições financeiras. O pedido deve ser feito por meio do app Carteira de Trabalho Digital, disponível para Android e iOS.

Assim como acontece com aposentados e beneficiários do INSS, o valor máximo do empréstimo depende da margem consignável. Quem tem carteira assinada pode comprometer até 35% da renda com as parcelas do consignado. Os juros são de cerca de 3% ao mês e os prazos costumam ser mais curtos, variando de 12 a 48 meses.

COMO USAR O FGTS

Quem tem carteira assinada pode ainda reduzir os juros se usar até 10% do saldo do FGTS e 100% da multa rescisória como garantia do crédito. O governo e os bancos atualmente debatem a liberação de até 100% do saldo do FGTS como garantia no futuro.

Justamente por isso é preciso ter cuidado com esse crédito: se você não ofereceu o FGTS como garantia, a lei proíbe que o banco desconte o valor total da sua dívida das verbas rescisórias e apenas a parcela do mês do desligamento pode ser descontada. O restante da dívida passa a ser cobrado diretamente de você por outros meios, como o envio de boletos.

SERVIDORES FEDERAIS

O crédito consignado para servidor público federal oferece taxas de juros reduzidas, de 1,80% ao mês, e prazos ainda mais alongados que os disponíveis para pensionistas do INSS, de até 120 meses (10 anos), também com parcelas descontadas diretamente no contracheque. Atualmente, a margem consignável total é de até 40% (sendo 35% para empréstimo e 5% para cartão), conforme novas regras de 2026. A contratação é exclusiva para ativos, aposentados e pensionistas.

A margem consignável pode ser consultada no Portal do Servidor. Em seguida, é recomendável pesquisar instituições financeiras conveniadas ao órgão no qual o servidor trabalha e comparar as taxas oferecidas. Depois, realiza-se uma simulação para definir o valor das parcelas e o prazo de pagamento mais adequado. A solicitação pode ser feita em agências físicas ou por meio de plataformas digitais, como sites e aplicativos, o que torna o processo mais prático.

Os bancos são obrigados a informar o Custo Efetivo Total (CET) do empréstimo, que inclui juros, taxas e encargos. Isso permite saber o valor final pago antes de contratar. Após a análise de crédito e da margem disponível, o contrato é formalizado, muitas vezes de forma digital, e o valor é liberado na conta.

TRABALHADORES POR APLICATIVO

Motoristas de aplicativo podem contratar empréstimo consignado com desconto direto no repasse dos ganhos (receitas das corridas), oferecendo juros mais baixos (média de 3,5% ao mês) e parcelas descontadas automaticamente, limitadas a 30% da renda. A concessão dependerá da existência de convênio entre a plataforma a qual o trabalhador está ligado e instituições de crédito.

COMO CONTRATAR PELO CELULAR

Se você é aposentado:

1. Acesse o app ou site Meu INSS e solicite o desbloqueio para empréstimo, caso seu benefício seja novo.
2. Verifique a margem consignável: consulte no extrato do Meu INSS o valor disponível.
3. Procure uma instituição financeira (física ou digital) de sua preferência para simular taxas e parcelas.
4. Documentação: geralmente, são necessários RG, CPF e comprovante de residência atualizado.
5. A contratação é concluída com assinatura eletrônica ou física, com o valor creditado diretamente na conta em que recebe o benefício.

Se você tem carteira assinada:

1. Baixe o app Carteira de Trabalho Digital.
2. Faça login com sua conta Gov.br.
3. Vá no ícone de empréstimos ou selecione "Crédito do Trabalhador".
4. Informe o valor desejado, o número de parcelas e autorize o compartilhamento de dados.
5. Em até 24 horas, você receberá propostas de diversos bancos para comparar.

NOVAS REGRAS E PROTEÇÕES

Para evitar que o trabalhador seja pego de surpresa por "taxas invisíveis", o governo endureceu as regras contra práticas abusivas.

- Custo Efetivo Total (CET) Limitado: o custo total do empréstimo não pode ser mais do que 1% superior à taxa de juros. Por exemplo, se o banco te ofereceu juros de 1,5% ao mês, o seu custo real (CET) não pode passar de 2,5% ao mês.

- Fim das taxas de abertura de crédito: os bancos só estão autorizados a cobrar quatro coisas na operação: juros, encargos de multa/mora, impostos e o seguro prestamista (este último apenas se você expressamente concordar).

COMO BLOQUEAR OFERTAS

Se você não tem interesse em contratar crédito e quer evitar propostas indesejadas (ou tentativas de fraudes), pode bloquear o acesso aos seus dados.

- Aposentados e beneficiários do INSS: acesse o app Meu INSS (com Gov.br), pesquise por "Bloquear/Desbloquear Benefício para Empréstimo", selecione o benefício e faça o reconhecimento facial.

- Trabalhadores com carteira assinada: no app Carteira de Trabalho Digital, vá em "Empréstimos", clique no ícone de engrenagem e alterne a chave para "Bloqueado". O bloqueio é imediato.

QUAIS CUIDADOS TOMAR

Com a oferta crescente de crédito no mercado, aposentados e pensionistas devem estar atentos a uma série de recomendações antes de contratar qualquer tipo de empréstimo. Entre os principais alertas, está a orientação para não realizar qualquer pagamento adiantado com a promessa de liberação do crédito — prática que pode indicar tentativa de golpe.

Outro ponto fundamental é pesquisar e comparar as taxas de juros e as condições oferecidas por diferentes instituições financeiras. Mais do que observar apenas a taxa anunciada, é importante verificar o Custo Efetivo Total (CET), indicador que reúne todos os encargos da operação e apresenta, em percentual, o custo real do empréstimo.

Também é essencial confirmar se o banco está autorizado a funcionar pelo Banco Central e se possui convênio com a fonte pagadora do benefício. No caso de empréstimos consignados para aposentados e pensionistas do INSS, por exemplo, a instituição precisa estar devidamente conveniada ao INSS para oferecer essa modalidade.

Segundo o Banco Central, nunca se deve assinar contratos ou propostas em branco, nem aceitar a intermediação de terceiros que prometem acelerar a liberação do crédito. Além disso, é fundamental não compartilhar cartão de débito ou crédito e senha bancária com outras pessoas, evitando riscos de fraude.

Outro aspecto que merece atenção é o impacto financeiro do empréstimo, já que as parcelas são descontadas diretamente do salário ou benefício, comprometendo parte da renda mensal e podendo afetar o orçamento pessoal e familiar no futuro.

Por fim, quem deseja transferir o contrato para outro banco em busca de condições mais vantajosas deve buscar informações detalhadas sobre a portabilidade de crédito e ler atentamente as regras antes de concluir a operação.



Palavras-chave: CLT, aposentados, crédito consignado, dívidas, endividamento, finanças pessoais, motoristas de app, servidores públicos', '[{"type":"paragraph","text":"São Paulo - O crédito consignado pode ser uma alternativa para quem precisa reorganizar as finanças ou trocar uma dívida com juros altos e considerada cara, como cartão de crédito e cheque especial, por uma mais barata."},{"type":"paragraph","text":"Esse tipo de empréstimo com desconto em folha está disponível para aposentados e beneficiários do INSS, servidores públicos, trabalhadores com carteira assinada e motoristas de aplicativo. Esse tipo de empréstimo, no entanto, tem suas limitações: os valores disponíveis são atrelados ao seu rendimento mensal e, por isso, são menores do que outros empréstimos. Outra questão a ser considerada é que o parcelamento pode se estender por anos, comprometendo parte importante do salário."},{"type":"paragraph","text":"A seguir, conheça os prós e contras desse tipo de empréstimo e as novas regras do mercado antes de contratar o crédito consignado."},{"type":"heading","text":"O QUE É E POR QUE É MAIS BARATO?"},{"type":"paragraph","text":"O crédito consignado (ou empréstimo com desconto em folha) é uma modalidade onde as parcelas são descontadas automaticamente todo mês diretamente do salário, pensão ou benefício do contratante, antes mesmo de o valor líquido ser depositado em sua conta."},{"type":"paragraph","text":"Por garantir ao banco que o valor será pago com o salário, ou seja, por apresentar baixo risco de inadimplência, essa modalidade oferece taxas de juros significativamente menores quando comparadas com o cartão de crédito tradicional, empréstimos pessoais ou cheque especial."},{"type":"paragraph","text":"Basicamente, os bancos ofereciam duas opções: o empréstimo consignado convencional (onde você recebe o dinheiro e paga parcelas fixas) e o cartão de crédito consignado (usado para compras no comércio). Esse cartão de crédito, no entanto, deixará de ser oferecido nos próximos meses."},{"type":"heading","text":"QUEM PODE CONTRATAR?"},{"type":"paragraph","text":"- Trabalhadores com carteira assinada (CLT) no setor privado ou público. - Aposentados do INSS. - Servidores públicos. - Desde julho de 2025, a modalidade foi expandida para motoristas e entregadores de aplicativo, desde que haja um convênio entre a plataforma parceira e uma instituição financeira."},{"type":"heading","text":"APOSENTADOS DO INSS"},{"type":"paragraph","text":"Aposentados do INSS podem contratar o crédito consignado diretamente com bancos autorizados, com parcelas fixas descontadas no benefício, taxa de juros de 1,86% ao mês e prazo de até 108 meses (9 anos) para pagar. A contratação exige desbloqueio do benefício no app Meu INSS."},{"type":"paragraph","text":"O valor do empréstimo é determinado pela margem consignável, isto é, o limite percentual do salário ou benefício que pode ser comprometido mensalmente com o pagamento da dívida. Atualmente, o aposentado ou beneficiário pode comprometer até 40% do rendimento mensal com o pagamento do empréstimo."},{"type":"heading","text":"TRABALHADORES CLT"},{"type":"paragraph","text":"Quem trabalha no setor privado e tem carteira assinada não depende mais de que a empresa tenha acordo com algum banco e pode contratar o crédito consignado pelo celular, em diferentes instituições financeiras. O pedido deve ser feito por meio do app Carteira de Trabalho Digital, disponível para Android e iOS."},{"type":"paragraph","text":"Assim como acontece com aposentados e beneficiários do INSS, o valor máximo do empréstimo depende da margem consignável. Quem tem carteira assinada pode comprometer até 35% da renda com as parcelas do consignado. Os juros são de cerca de 3% ao mês e os prazos costumam ser mais curtos, variando de 12 a 48 meses."},{"type":"heading","text":"COMO USAR O FGTS"},{"type":"paragraph","text":"Quem tem carteira assinada pode ainda reduzir os juros se usar até 10% do saldo do FGTS e 100% da multa rescisória como garantia do crédito. O governo e os bancos atualmente debatem a liberação de até 100% do saldo do FGTS como garantia no futuro."},{"type":"paragraph","text":"Justamente por isso é preciso ter cuidado com esse crédito: se você não ofereceu o FGTS como garantia, a lei proíbe que o banco desconte o valor total da sua dívida das verbas rescisórias e apenas a parcela do mês do desligamento pode ser descontada. O restante da dívida passa a ser cobrado diretamente de você por outros meios, como o envio de boletos."},{"type":"heading","text":"SERVIDORES FEDERAIS"},{"type":"paragraph","text":"O crédito consignado para servidor público federal oferece taxas de juros reduzidas, de 1,80% ao mês, e prazos ainda mais alongados que os disponíveis para pensionistas do INSS, de até 120 meses (10 anos), também com parcelas descontadas diretamente no contracheque. Atualmente, a margem consignável total é de até 40% (sendo 35% para empréstimo e 5% para cartão), conforme novas regras de 2026. A contratação é exclusiva para ativos, aposentados e pensionistas."},{"type":"paragraph","text":"A margem consignável pode ser consultada no Portal do Servidor. Em seguida, é recomendável pesquisar instituições financeiras conveniadas ao órgão no qual o servidor trabalha e comparar as taxas oferecidas. Depois, realiza-se uma simulação para definir o valor das parcelas e o prazo de pagamento mais adequado. A solicitação pode ser feita em agências físicas ou por meio de plataformas digitais, como sites e aplicativos, o que torna o processo mais prático."},{"type":"paragraph","text":"Os bancos são obrigados a informar o Custo Efetivo Total (CET) do empréstimo, que inclui juros, taxas e encargos. Isso permite saber o valor final pago antes de contratar. Após a análise de crédito e da margem disponível, o contrato é formalizado, muitas vezes de forma digital, e o valor é liberado na conta."},{"type":"heading","text":"TRABALHADORES POR APLICATIVO"},{"type":"paragraph","text":"Motoristas de aplicativo podem contratar empréstimo consignado com desconto direto no repasse dos ganhos (receitas das corridas), oferecendo juros mais baixos (média de 3,5% ao mês) e parcelas descontadas automaticamente, limitadas a 30% da renda. A concessão dependerá da existência de convênio entre a plataforma a qual o trabalhador está ligado e instituições de crédito."},{"type":"heading","text":"COMO CONTRATAR PELO CELULAR"},{"type":"paragraph","text":"Se você é aposentado:"},{"type":"paragraph","text":"1. Acesse o app ou site Meu INSS e solicite o desbloqueio para empréstimo, caso seu benefício seja novo. 2. Verifique a margem consignável: consulte no extrato do Meu INSS o valor disponível. 3. Procure uma instituição financeira (física ou digital) de sua preferência para simular taxas e parcelas. 4. Documentação: geralmente, são necessários RG, CPF e comprovante de residência atualizado. 5. A contratação é concluída com assinatura eletrônica ou física, com o valor creditado diretamente na conta em que recebe o benefício."},{"type":"paragraph","text":"Se você tem carteira assinada:"},{"type":"paragraph","text":"1. Baixe o app Carteira de Trabalho Digital. 2. Faça login com sua conta Gov.br. 3. Vá no ícone de empréstimos ou selecione \"Crédito do Trabalhador\". 4. Informe o valor desejado, o número de parcelas e autorize o compartilhamento de dados. 5. Em até 24 horas, você receberá propostas de diversos bancos para comparar."},{"type":"heading","text":"NOVAS REGRAS E PROTEÇÕES"},{"type":"paragraph","text":"Para evitar que o trabalhador seja pego de surpresa por \"taxas invisíveis\", o governo endureceu as regras contra práticas abusivas."},{"type":"paragraph","text":"- Custo Efetivo Total (CET) Limitado: o custo total do empréstimo não pode ser mais do que 1% superior à taxa de juros. Por exemplo, se o banco te ofereceu juros de 1,5% ao mês, o seu custo real (CET) não pode passar de 2,5% ao mês."},{"type":"paragraph","text":"- Fim das taxas de abertura de crédito: os bancos só estão autorizados a cobrar quatro coisas na operação: juros, encargos de multa/mora, impostos e o seguro prestamista (este último apenas se você expressamente concordar)."},{"type":"heading","text":"COMO BLOQUEAR OFERTAS"},{"type":"paragraph","text":"Se você não tem interesse em contratar crédito e quer evitar propostas indesejadas (ou tentativas de fraudes), pode bloquear o acesso aos seus dados."},{"type":"paragraph","text":"- Aposentados e beneficiários do INSS: acesse o app Meu INSS (com Gov.br), pesquise por \"Bloquear/Desbloquear Benefício para Empréstimo\", selecione o benefício e faça o reconhecimento facial."},{"type":"paragraph","text":"- Trabalhadores com carteira assinada: no app Carteira de Trabalho Digital, vá em \"Empréstimos\", clique no ícone de engrenagem e alterne a chave para \"Bloqueado\". O bloqueio é imediato."},{"type":"heading","text":"QUAIS CUIDADOS TOMAR"},{"type":"paragraph","text":"Com a oferta crescente de crédito no mercado, aposentados e pensionistas devem estar atentos a uma série de recomendações antes de contratar qualquer tipo de empréstimo. Entre os principais alertas, está a orientação para não realizar qualquer pagamento adiantado com a promessa de liberação do crédito — prática que pode indicar tentativa de golpe."},{"type":"paragraph","text":"Outro ponto fundamental é pesquisar e comparar as taxas de juros e as condições oferecidas por diferentes instituições financeiras. Mais do que observar apenas a taxa anunciada, é importante verificar o Custo Efetivo Total (CET), indicador que reúne todos os encargos da operação e apresenta, em percentual, o custo real do empréstimo."},{"type":"paragraph","text":"Também é essencial confirmar se o banco está autorizado a funcionar pelo Banco Central e se possui convênio com a fonte pagadora do benefício. No caso de empréstimos consignados para aposentados e pensionistas do INSS, por exemplo, a instituição precisa estar devidamente conveniada ao INSS para oferecer essa modalidade."},{"type":"paragraph","text":"Segundo o Banco Central, nunca se deve assinar contratos ou propostas em branco, nem aceitar a intermediação de terceiros que prometem acelerar a liberação do crédito. Além disso, é fundamental não compartilhar cartão de débito ou crédito e senha bancária com outras pessoas, evitando riscos de fraude."},{"type":"paragraph","text":"Outro aspecto que merece atenção é o impacto financeiro do empréstimo, já que as parcelas são descontadas diretamente do salário ou benefício, comprometendo parte da renda mensal e podendo afetar o orçamento pessoal e familiar no futuro."},{"type":"paragraph","text":"Por fim, quem deseja transferir o contrato para outro banco em busca de condições mais vantajosas deve buscar informações detalhadas sobre a portabilidade de crédito e ler atentamente as regras antes de concluir a operação."},{"type":"paragraph","text":"Palavras-chave: CLT, aposentados, crédito consignado, dívidas, endividamento, finanças pessoais, motoristas de app, servidores públicos"}]'::jsonb, 'pedro-marques', 'Pedro Marques', 'Viva - Dinheiro', 'https://viva.com.br/dinheiro/guia-do-credito-consignado-como-contratar-e-escapar-dos-juros-altos.html', '2026-05-13T08:00:00-03:00'::timestamptz, false, 'planejamento-financeiro.webp', 'Crédito consignado pode ser vantajoso para reorganizar as finanças', 'Adobe Stock'),
    (19, 'BV-019', 'guias', 'viva-responde-imposto-de-renda-2026', 'VIVA Responde: João Yanase esclarece dúvidas sobre o Imposto de Renda 2026', 'Vídeo do VIVA Notícias responde dúvidas sobre a declaração do Imposto de Renda 2026.', '', '[]'::jsonb, 'viva-noticias', 'VIVA Notícias', 'VIVA Notícias — YouTube', 'https://www.youtube.com/watch?v=3wGLOIGLfQ4&t=22s', null, true, 'planejamento-financeiro.webp', 'Vídeo externo sobre o Imposto de Renda 2026.', null),
    (20, 'BV-020', 'dicas-valiosas', 'proteger-orcamento-reajuste-planos-saude', 'Como proteger o seu orçamento do reajuste dos planos de saúde', 'Vídeo curto do VIVA Notícias com orientações para organizar o impacto do reajuste no orçamento.', '', '[]'::jsonb, 'viva-noticias', 'VIVA Notícias', 'VIVA Notícias — YouTube', 'https://www.youtube.com/shorts/RTJBD8L_4_o', null, true, 'financas-comportamentais.webp', 'Vídeo externo sobre orçamento e planos de saúde.', null),
    (21, 'BV-021', 'dicas-valiosas', 'album-copa-ensina-dinheiro-criancas', 'O que o álbum da Copa pode ensinar sobre dinheiro para crianças', 'Vídeo curto do VIVA Notícias usa o álbum da Copa para conversar sobre educação financeira infantil.', '', '[]'::jsonb, 'viva-noticias', 'VIVA Notícias', 'VIVA Notícias — YouTube', 'https://www.youtube.com/shorts/XbWGxObCANY', null, true, 'financas-comportamentais.webp', 'Vídeo externo sobre educação financeira para crianças.', null);

  if (select count(*) from pg_temp.bv_credit_articles) <> 21 then
    raise exception 'Catálogo BV incompleto: esperados 21 conteúdos';
  end if;

  insert into public.authors (
    id, owner_tenant_id, slug, display_name, bio, specialties, status, is_demo
  )
  select distinct on (article.author_slug)
    md5('bv-credit:author:' || article.author_slug)::uuid,
    platform_id,
    article.author_slug,
    article.author_name,
    'Autoria informada no material autorizado para a validação BV Educação.',
    array['educação financeira']::text[],
    'active',
    true
  from pg_temp.bv_credit_articles article
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
    md5('bv-credit:item:' || article.code)::uuid,
    platform_id,
    article.slug,
    'article',
    'published',
    'catalog',
    coalesce(article.source_published_at, timestamptz '2026-08-20 12:00:00-03'),
    coalesce(article.source_published_at, timestamptz '2026-08-20 12:00:00-03'),
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.bv_credit_articles article
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
    md5('bv-credit:revision:' || article.code)::uuid,
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
        'authorization_reference', 'CLIENTE-VALIDACAO-BV-2026-08-20',
        'source_image_credit', article.source_image_credit
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
    nullif(article.subtitle, ''),
    'not_required',
    case
      when article.body_text = '' then 0
      else cardinality(regexp_split_to_array(trim(article.body_text), '\s+'))
    end,
    'demo-operator',
    'demo-operator',
    timestamptz '2026-08-20 12:00:00-03',
    case
      when article.external_only then 'Referência externa autorizada para o catálogo; mídia e corpo não foram copiados.'
      else 'Conteúdo fornecido e autorizado para validação; texto e procedência preservados.'
    end,
    true
  from pg_temp.bv_credit_articles article
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
  from pg_temp.bv_credit_articles article
  join public.content_items selected_item
    on selected_item.owner_tenant_id = platform_id
   and selected_item.canonical_slug = article.slug
  join public.content_revisions revision
    on revision.content_item_id = selected_item.id
   and revision.revision_number = 1
  where item.id = selected_item.id;

  delete from public.content_revision_authors link
  using pg_temp.bv_credit_articles article,
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
  from pg_temp.bv_credit_articles article
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
  using pg_temp.bv_credit_articles article,
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
  from pg_temp.bv_credit_articles article
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
    md5('bv-credit:distribution:' || article.code || ':' || target.slug)::uuid,
    item.id,
    target.id,
    'active',
    item.first_published_at,
    array['portal']::text[],
    'authorized-real',
    'CLIENTE-VALIDACAO-BV-2026-08-20',
    not article.external_only,
    not article.external_only,
    'demo-operator',
    'demo-operator',
    true
  from pg_temp.bv_credit_articles article
  join public.content_items item
    on item.owner_tenant_id = platform_id
   and item.canonical_slug = article.slug
  cross join pg_temp.bv_credit_targets target
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
    navigation_json = jsonb_build_array('Início', 'Indicadores', 'Investimentos', 'Alerta de golpes', 'Programando o futuro', 'Isso ou aquilo', 'Saia das dívidas', 'Alívio no orçamento', 'Guias', 'Dicas valiosas', 'Glossário'),
    change_summary = 'Navegação atualizada com o catálogo BV Educação para o padrão de crédito.'
  from public.themes theme
  join pg_temp.bv_credit_targets target on target.id = theme.tenant_id
  where version.id = theme.published_version_id;

  update public.tenants tenant
  set
    settings_json = tenant.settings_json || jsonb_build_object(
      'content_policy', 'authorized-real-validation',
      'catalog_reference', 'CLIENTE-VALIDACAO-BV-2026-08-20'
    ),
    updated_at = now()
  from pg_temp.bv_credit_targets target
  where tenant.id = target.id;

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id,
    after_json, reason, is_demo
  )
  select
    md5('bv-credit:audit:catalog-published:' || target.slug)::uuid,
    target.id,
    'demo-operator',
    'content.catalog_published',
    'tenant',
    target.id,
    jsonb_build_object(
      'authorized_real_items', 21,
      'external_only_items', 3,
      'categories', 10,
      'catalog_reference', 'CLIENTE-VALIDACAO-BV-2026-08-20'
    ),
    'Catálogo BV Educação autorizado e compartilhado por referência com o padrão de crédito.',
    true
  from pg_temp.bv_credit_targets target
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.apply_bv_educacao_credit_catalog()
from public, anon, authenticated, service_role;

comment on function private.apply_bv_educacao_credit_catalog() is
  'Restaura de forma idempotente o catálogo BV Educação e suas distribuições no padrão de crédito.';

select private.apply_bv_educacao_credit_catalog();
