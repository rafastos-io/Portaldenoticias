begin;

-- Expansão editorial do MVP: 10 matérias por vertical, com mídia exclusiva por
-- revisão e distribuição cruzada sem duplicar o conteúdo canônico.

with platform as (
  select id
  from public.tenants
  where slug = 'broadcast-saude-longevidade'
    and kind = 'platform'
    and is_demo = true
),
author_seed (slug, display_name, bio, specialties) as (
  values
    (
      'joana-neri',
      'Joana Neri',
      'Perfil fictício criado para demonstrar a cobertura de crédito, consumo e educação financeira.',
      array['crédito', 'educação financeira']
    ),
    (
      'rafael-paiva',
      'Rafael Paiva',
      'Perfil fictício criado para demonstrar a cobertura de empresas, fintechs e meios de pagamento.',
      array['empresas', 'fintechs', 'pagamentos']
    ),
    (
      'elisa-monte',
      'Elisa Monte',
      'Perfil fictício criado para demonstrar a cobertura de mercados, alocação e comportamento financeiro.',
      array['investimentos', 'diversificação']
    ),
    (
      'tomas-linhares',
      'Tomás Linhares',
      'Perfil fictício criado para demonstrar a cobertura de patrimônio, sucessão e longevidade financeira.',
      array['patrimônio', 'sucessão']
    ),
    (
      'bia-campos',
      'Bia Campos',
      'Perfil fictício criado para demonstrar a cobertura de seguros, proteção de renda e novos modelos.',
      array['seguros', 'proteção de renda']
    ),
    (
      'andre-faria',
      'André Faria',
      'Perfil fictício criado para demonstrar a cobertura de previdência, longevidade e continuidade empresarial.',
      array['previdência', 'longevidade']
    ),
    (
      'nina-bastos',
      'Nina Bastos',
      'Perfil fictício criado para demonstrar a cobertura de indústria farmacêutica, biotecnologia e pesquisa.',
      array['indústria farmacêutica', 'biotecnologia']
    ),
    (
      'miguel-arantes',
      'Miguel Arantes',
      'Perfil fictício criado para demonstrar a cobertura de saúde digital, inovação e economia da saúde.',
      array['saúde digital', 'economia da saúde']
    )
)
insert into public.authors (
  id,
  owner_tenant_id,
  slug,
  display_name,
  bio,
  specialties,
  status,
  is_demo
)
select
  md5('editorial-author:' || author_seed.slug)::uuid,
  platform.id,
  author_seed.slug,
  author_seed.display_name,
  author_seed.bio,
  author_seed.specialties,
  'active',
  true
from author_seed
cross join platform
on conflict (owner_tenant_id, slug) do update set
  display_name = excluded.display_name,
  bio = excluded.bio,
  specialties = excluded.specialties,
  status = 'active',
  is_demo = true,
  updated_at = now();

create temporary table editorial_articles (
  ordinal integer primary key,
  code text not null unique,
  tenant_slug text not null,
  slug text not null,
  title text not null,
  subtitle text not null,
  category_slug text not null,
  category_name text not null,
  category_description text not null,
  author_slug text not null,
  tag_slugs jsonb not null,
  cross_tenant_slugs jsonb not null,
  image_file text not null,
  image_alt text not null,
  eyebrow text not null,
  paragraphs jsonb not null
) on commit drop;

insert into editorial_articles
select *
from jsonb_to_recordset(
  $catalog$
  [
    {
      "ordinal": 1,
      "code": "MVP-CR-001",
      "tenant_slug": "credito-demo-orbita",
      "slug": "credito-pessoal-custo-total-parcela",
      "title": "Crédito pessoal: o custo total importa mais que a parcela que cabe hoje",
      "subtitle": "Taxas, prazo e flexibilidade ajudam a comparar propostas sem transformar uma prestação baixa em falsa economia.",
      "category_slug": "credito-pessoa-fisica",
      "category_name": "Crédito para Pessoa Física",
      "category_description": "Decisões de crédito, custo total, renegociação e uso consciente para pessoas.",
      "author_slug": "joana-neri",
      "tag_slugs": ["credito", "planejamento-financeiro"],
      "cross_tenant_slugs": [],
      "image_file": "credito-pessoal.webp",
      "image_alt": "Jovem profissional compara opções de crédito com um consultor em uma mesa de coworking.",
      "eyebrow": "Crédito pessoal",
      "paragraphs": [
        "A parcela que cabe no mês é apenas uma parte da decisão. Prazo, taxa efetiva, tarifas e possibilidade de antecipar pagamentos determinam quanto o crédito realmente custará ao longo do contrato.",
        "Uma comparação útil coloca propostas no mesmo horizonte de tempo e pergunta o que acontece se a renda variar. Essa leitura evita escolher uma prestação menor que apenas empurra custo para meses adicionais.",
        "Também importa entender a finalidade do recurso. Uma despesa emergencial, uma reorganização de dívidas e um projeto planejado pedem margens de segurança e calendários diferentes.",
        "O cenário é fictício e tem finalidade editorial. O conteúdo organiza perguntas para uma decisão informada, sem recomendar produto, instituição ou contratação individual."
      ]
    },
    {
      "ordinal": 31,
      "code": "MVP-SA-001",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "industria-farmaceutica-qualidade-dados-eficiencia",
      "title": "Indústria farmacêutica aproxima qualidade, dados e eficiência operacional",
      "subtitle": "Rastreabilidade e processo ganham prioridade antes de qualquer promessa de escala.",
      "category_slug": "industria-farmaceutica",
      "category_name": "Indústria Farmacêutica",
      "category_description": "Produção, qualidade, operações, regulação e estratégia na indústria farmacêutica.",
      "author_slug": "nina-bastos",
      "tag_slugs": ["saude", "tecnologia-e-ia"],
      "cross_tenant_slugs": [],
      "image_file": "industria-farmaceutica.webp",
      "image_alt": "Profissional de controle de qualidade acompanha uma linha farmacêutica.",
      "eyebrow": "Indústria farma",
      "paragraphs": [
        "Escalar uma operação farmacêutica exige repetir processos dentro de limites definidos e registrar cada desvio. Eficiência não pode reduzir a capacidade de investigar o que saiu do esperado.",
        "Dados de produção ajudam a antecipar manutenção e localizar variações, mas dependem de instrumentos calibrados e contexto. Um painel não substitui conhecimento do processo.",
        "Qualidade, engenharia e suprimentos precisam compartilhar prioridades desde o planejamento. Mudanças pequenas em matéria-prima ou equipamento podem repercutir em várias etapas.",
        "A fábrica, os profissionais e os produtos são fictícios. A matéria não descreve medicamento, lote ou resultado de uma empresa real."
      ]
    },
    {
      "ordinal": 32,
      "code": "MVP-SA-002",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "biotecnologia-hipoteses-programas-seletivos",
      "title": "Biotecnologia transforma boas hipóteses em programas de pesquisa mais seletivos",
      "subtitle": "Critérios de continuidade ajudam equipes a aprender cedo e abandonar caminhos frágeis.",
      "category_slug": "biotecnologia",
      "category_name": "Biotecnologia",
      "category_description": "Pesquisa translacional, plataformas biológicas, desenvolvimento e estratégia científica.",
      "author_slug": "nina-bastos",
      "tag_slugs": ["saude", "tecnologia-e-ia"],
      "cross_tenant_slugs": [],
      "image_file": "biotecnologia.webp",
      "image_alt": "Equipe diversa prepara amostras em um laboratório de biotecnologia.",
      "eyebrow": "Biotecnologia",
      "paragraphs": [
        "Uma hipótese promissora precisa atravessar testes que aumentam evidência e reduzem incerteza. Avançar tudo ao mesmo tempo consome recursos e dificulta identificar o que realmente funciona.",
        "Programas mais seletivos definem sinais de continuidade antes do experimento. Um resultado negativo pode economizar tempo quando responde claramente à pergunta planejada.",
        "Integração entre laboratório, dados e desenvolvimento evita que uma descoberta fique desconectada da forma de produzir e medir. A estratégia científica começa antes da escala.",
        "A pesquisa e o laboratório são fictícios. O texto não anuncia descoberta, tratamento ou validação clínica."
      ]
    },
    {
      "ordinal": 33,
      "code": "MVP-SA-003",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "inovacao-medica-clinica-engenharia",
      "title": "Inovação médica avança quando clínica e engenharia trabalham desde o início",
      "subtitle": "Necessidade real, usabilidade e segurança precisam orientar o protótipo antes da tecnologia.",
      "category_slug": "inovacao-medica",
      "category_name": "Inovação Médica",
      "category_description": "Dispositivos, engenharia clínica, desenho de solução e avaliação de tecnologia.",
      "author_slug": "nina-bastos",
      "tag_slugs": ["saude", "tecnologia-e-ia"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "inovacao-medica.webp",
      "image_alt": "Médica e engenheira testam um modelo anatômico em uma bancada.",
      "eyebrow": "Inovação",
      "paragraphs": [
        "Um dispositivo pode ser tecnicamente elegante e ainda falhar na rotina. Espaço, esterilização, treinamento e tempo disponível fazem parte do problema desde o primeiro desenho.",
        "Equipes clínicas ajudam a definir necessidade e riscos, enquanto engenharia transforma requisitos em protótipos testáveis. A conversa reduz retrabalho e soluções sem uso claro.",
        "Testes iniciais observam tarefas e erros possíveis antes de qualquer avaliação clínica. Documentar decisões cria uma trilha para segurança e regulação.",
        "O dispositivo, as profissionais e a instituição são fictícios. A pauta não apresenta tecnologia aprovada nem orientação médica."
      ]
    },
    {
      "ordinal": 34,
      "code": "MVP-SA-004",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "pesquisa-clinica-consentimento-participacao-diversa",
      "title": "Pesquisa clínica depende de consentimento compreensível e participação diversa",
      "subtitle": "Informação, escuta e acesso determinam quem consegue participar de um estudo.",
      "category_slug": "pesquisa-clinica",
      "category_name": "Pesquisa Clínica",
      "category_description": "Desenho de estudos, participação, consentimento, operação e transparência.",
      "author_slug": "nina-bastos",
      "tag_slugs": ["saude", "prevencao"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "pesquisa-clinica.webp",
      "image_alt": "Coordenadora conversa com voluntários adultos de idades diversas.",
      "eyebrow": "Pesquisa clínica",
      "paragraphs": [
        "Consentimento não é apenas uma assinatura. A pessoa precisa compreender objetivo, procedimentos, alternativas, riscos e a liberdade de sair sem prejuízo.",
        "Horário, transporte, linguagem e critérios de inclusão influenciam quem consegue participar. Amostras pouco diversas limitam a interpretação e a aplicação dos resultados.",
        "Equipes de pesquisa devem abrir canais para dúvidas durante todo o estudo. Devolver informações gerais e explicar mudanças fortalece confiança sem prometer benefício individual.",
        "O estudo, os voluntários e a instituição são fictícios. Não há recrutamento, intervenção ou recomendação clínica nesta matéria."
      ]
    },
    {
      "ordinal": 35,
      "code": "MVP-SA-005",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "medicina-precisao-decisao-contextual",
      "title": "Medicina de precisão troca promessa ampla por decisão contextual",
      "subtitle": "Biomarcadores ganham valor quando finalidade, evidência e limites são explicados.",
      "category_slug": "medicina-precisao",
      "category_name": "Medicina de Precisão",
      "category_description": "Biomarcadores, dados, estratificação e contexto em decisões de saúde.",
      "author_slug": "nina-bastos",
      "tag_slugs": ["saude", "tecnologia-e-ia"],
      "cross_tenant_slugs": [],
      "image_file": "medicina-precisao.webp",
      "image_alt": "Médica conversa com uma adulta diante de padrões biológicos abstratos.",
      "eyebrow": "Precisão",
      "paragraphs": [
        "Medicina de precisão não significa resposta perfeita para cada pessoa. Significa usar características relevantes para reduzir incerteza em uma decisão específica.",
        "Um biomarcador precisa demonstrar qualidade de medição e utilidade no contexto de uso. Relações observadas em pesquisa não viram automaticamente indicação clínica.",
        "A conversa deve incluir o que o dado não explica e como outras informações entram na decisão. Privacidade e acesso também determinam quem pode se beneficiar.",
        "As pessoas, os dados e o cenário são fictícios. A matéria não oferece teste, diagnóstico, prognóstico ou tratamento."
      ]
    },
    {
      "ordinal": 36,
      "code": "MVP-SA-006",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "saude-digital-teleconsulta-jornada-cuidado",
      "title": "Saúde digital amadurece ao integrar teleconsulta à jornada de cuidado",
      "subtitle": "Conveniência só produz continuidade quando informação e próximos passos atravessam os canais.",
      "category_slug": "saude-digital-telemedicina",
      "category_name": "Saúde Digital & Telemedicina",
      "category_description": "Telemedicina, plataformas, interoperabilidade e experiência digital em saúde.",
      "author_slug": "miguel-arantes",
      "tag_slugs": ["saude", "tecnologia-e-ia"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "saude-digital.webp",
      "image_alt": "Médica realiza uma teleconsulta em um consultório simples.",
      "eyebrow": "Saúde digital",
      "paragraphs": [
        "A teleconsulta reduz deslocamento e amplia possibilidades de acompanhamento, mas não resolve sozinha uma jornada fragmentada. Encaminhamentos, exames e retornos precisam manter o contexto.",
        "A escolha do canal deve considerar necessidade clínica, preferência e acesso da pessoa. Situações que exigem exame físico precisam de transição clara para atendimento presencial.",
        "Privacidade, identificação e registro fazem parte da experiência. Interfaces simples ajudam, mas suporte acessível continua necessário quando conexão ou tecnologia falham.",
        "A médica, a paciente e o serviço são fictícios. O conteúdo não substitui avaliação profissional nem representa plataforma de telemedicina."
      ]
    },
    {
      "ordinal": 37,
      "code": "MVP-SA-007",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "prevencao-fora-consultorio-rotina",
      "title": "Prevenção ganha espaço fora do consultório e dentro da rotina",
      "subtitle": "Ambiente, tempo e vínculos sociais ajudam hábitos a durar mais que uma campanha.",
      "category_slug": "prevencao-qualidade-vida",
      "category_name": "Prevenção & Qualidade de Vida",
      "category_description": "Hábitos, ambientes, mobilidade, bem-estar e prevenção ao longo da vida.",
      "author_slug": "miguel-arantes",
      "tag_slugs": ["prevencao", "longevidade"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "prevencao-qualidade-vida.webp",
      "image_alt": "Grupo de jovens adultos conversa ao lado de bicicletas em um parque.",
      "eyebrow": "Prevenção",
      "paragraphs": [
        "Recomendações de saúde competem com trabalho, transporte, renda e responsabilidades de cuidado. Um hábito se torna possível quando encontra espaço real na rotina.",
        "Ambientes seguros para caminhar ou pedalar e grupos de convivência reduzem a dependência de motivação individual. A prevenção também é uma questão de acesso.",
        "Metas pequenas e adaptáveis facilitam continuidade, sem transformar bem-estar em desempenho. Diferentes idades e condições pedem percursos distintos.",
        "As pessoas e a iniciativa são fictícias. A matéria não prescreve exercício e não substitui orientação de um profissional de saúde."
      ]
    },
    {
      "ordinal": 38,
      "code": "MVP-SA-008",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "ia-saude-segunda-leitura",
      "title": "IA em saúde avança como segunda leitura, não como decisão isolada",
      "subtitle": "Modelos podem priorizar achados quando deixam incerteza e limites visíveis para a equipe.",
      "category_slug": "ia-saude",
      "category_name": "IA em Saúde",
      "category_description": "Modelos, dados, validação, supervisão clínica e uso responsável de IA.",
      "author_slug": "miguel-arantes",
      "tag_slugs": ["tecnologia-e-ia", "saude"],
      "cross_tenant_slugs": ["seguros-demo-atlas", "credito-demo-orbita"],
      "image_file": "ia-saude.webp",
      "image_alt": "Equipe clínica revisa uma imagem médica abstrata em conjunto.",
      "eyebrow": "IA em saúde",
      "paragraphs": [
        "Sistemas de apoio podem destacar exames que merecem atenção ou oferecer uma segunda leitura. O valor depende de como a recomendação entra no fluxo e de quem mantém a decisão final.",
        "Desempenho médio não garante segurança em todos os grupos ou equipamentos. Validação local e acompanhamento contínuo identificam diferenças que um estudo inicial pode não revelar.",
        "A interface precisa mostrar incerteza e permitir revisão, não apenas um resultado binário. Equipes também devem registrar discordâncias para melhorar governança e aprendizado.",
        "As imagens, os casos e o sistema são fictícios. A matéria não oferece diagnóstico e não descreve dispositivo médico aprovado."
      ]
    },
    {
      "ordinal": 39,
      "code": "MVP-SA-009",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "economia-saude-escolhas-acesso",
      "title": "Economia da saúde traduz escolhas clínicas em capacidade de acesso",
      "subtitle": "Custo, benefício e equidade precisam aparecer juntos quando recursos são limitados.",
      "category_slug": "economia-financiamento-saude",
      "category_name": "Economia & Financiamento da Saúde",
      "category_description": "Avaliação econômica, acesso, financiamento, eficiência e equidade em saúde.",
      "author_slug": "miguel-arantes",
      "tag_slugs": ["saude", "planejamento-financeiro"],
      "cross_tenant_slugs": ["banco-demo-horizonte", "seguros-demo-atlas"],
      "image_file": "economia-saude.webp",
      "image_alt": "Equipe de economia da saúde debate fluxos diante de um quadro branco.",
      "eyebrow": "Economia da saúde",
      "paragraphs": [
        "Escolhas em saúde afetam pessoas diferentes e competem por orçamento, profissionais e infraestrutura. Avaliação econômica organiza comparações sem reduzir a decisão a um preço.",
        "Benefício clínico, qualidade de vida, capacidade de implementação e impacto no acesso precisam ser lidos em conjunto. Um resultado eficiente em um cenário pode não caber em outro.",
        "Equidade pergunta quem recebe o benefício e quem permanece de fora. Transparência sobre premissas permite que gestores e sociedade discutam prioridades.",
        "Os dados, a equipe e as decisões são fictícios. A pauta explica uma disciplina e não avalia tecnologia, política ou orçamento real."
      ]
    },
    {
      "ordinal": 40,
      "code": "MVP-SA-010",
      "tenant_slug": "healthtech-demo-lumen",
      "slug": "envelhecimento-saudavel-forca-mobilidade",
      "title": "Envelhecimento saudável amplia a agenda de força, mobilidade e convivência",
      "subtitle": "Autonomia é construída ao longo da vida e não começa apenas quando surge uma limitação.",
      "category_slug": "longevidade-envelhecimento-saudavel",
      "category_name": "Longevidade & Envelhecimento Saudável",
      "category_description": "Autonomia, capacidade funcional, convivência e saúde ao longo da vida.",
      "author_slug": "miguel-arantes",
      "tag_slugs": ["longevidade", "prevencao"],
      "cross_tenant_slugs": ["seguros-demo-atlas", "banco-demo-horizonte"],
      "image_file": "envelhecimento-saudavel.webp",
      "image_alt": "Grupo multigeracional pratica exercícios leves de força em um parque.",
      "eyebrow": "Longevidade",
      "paragraphs": [
        "Envelhecer com autonomia envolve força, equilíbrio, mobilidade, vínculos e acesso a ambientes seguros. Essas capacidades são construídas em várias fases da vida.",
        "Programas multigeracionais podem ampliar convivência e reduzir a ideia de que atividade pertence a uma idade específica. Adaptação permite participação com ritmos diferentes.",
        "Saúde funcional também depende de moradia, transporte e rede de apoio. O cuidado deixa de olhar apenas doença e passa a observar o que a pessoa consegue e deseja fazer.",
        "As pessoas e o programa são fictícios. A matéria não prescreve atividade física e recomenda avaliação profissional quando houver condição de saúde ou limitação."
      ]
    },
    {
      "ordinal": 21,
      "code": "MVP-SE-001",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "previdencia-privada-outras-reservas",
      "title": "Previdência privada ganha sentido quando conversa com outras reservas",
      "subtitle": "Benefício fiscal, liquidez e renda futura precisam ser avaliados como partes do mesmo plano.",
      "category_slug": "previdencia-privada",
      "category_name": "Previdência Privada",
      "category_description": "Acumulação, renda, tributação e uso da previdência em planejamento de longo prazo.",
      "author_slug": "andre-faria",
      "tag_slugs": ["previdencia", "planejamento-financeiro"],
      "cross_tenant_slugs": ["banco-demo-horizonte"],
      "image_file": "previdencia-privada.webp",
      "image_alt": "Casal compara cenários de previdência com uma especialista.",
      "eyebrow": "Previdência",
      "paragraphs": [
        "A previdência pode apoiar acumulação e organização de renda, mas não precisa concentrar todos os objetivos. Reserva de emergência e projetos intermediários pedem acesso e regras diferentes.",
        "Regime tributário, taxas, portabilidade e opções de recebimento alteram o resultado. A escolha deve considerar horizonte e forma de uso, não apenas o incentivo de entrada.",
        "Revisões periódicas acompanham mudanças de carreira, família e renda. Um plano útil continua coerente quando a vida muda e permite ajustes sem apagar o histórico.",
        "O casal, a especialista e os planos são fictícios. O texto não recomenda fundo, seguradora, regime tributário ou contratação."
      ]
    },
    {
      "ordinal": 22,
      "code": "MVP-SE-002",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "seguro-vida-familias-renda",
      "title": "Seguro de vida acompanha famílias que mudam de forma e de renda",
      "subtitle": "Coberturas precisam ser revistas quando responsabilidades, dependentes e trabalho se transformam.",
      "category_slug": "seguro-vida",
      "category_name": "Seguro de Vida",
      "category_description": "Proteção familiar, dependentes, renda e revisão de coberturas ao longo da vida.",
      "author_slug": "bia-campos",
      "tag_slugs": ["seguros", "longevidade"],
      "cross_tenant_slugs": [],
      "image_file": "seguro-vida.webp",
      "image_alt": "Jovens pais conversam em casa enquanto um bebê dorme ao fundo.",
      "eyebrow": "Vida",
      "paragraphs": [
        "A necessidade de proteção muda com filhos, dívidas, renda e pessoas que dependem do trabalho de cuidado. Uma cobertura definida anos antes pode deixar de refletir a estrutura atual da família.",
        "O cálculo não olha apenas despesas imediatas. Tempo para reorganização, educação, moradia e continuidade de renda ajudam a dimensionar o período de adaptação.",
        "Beneficiários e documentos também precisam ser revisados. Informação acessível reduz demora e conflito justamente quando a família enfrenta uma situação difícil.",
        "A família e as coberturas são fictícias. A matéria não oferece produto e não substitui avaliação contratual ou financeira individual."
      ]
    },
    {
      "ordinal": 23,
      "code": "MVP-SE-003",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "seguro-saude-coordenacao-cuidado",
      "title": "Seguro saúde avança da autorização para a coordenação do cuidado",
      "subtitle": "Navegação, informação e continuidade ganham espaço ao lado da rede credenciada.",
      "category_slug": "seguro-saude",
      "category_name": "Seguro Saúde",
      "category_description": "Cobertura assistencial, navegação, coordenação e experiência em jornadas de saúde.",
      "author_slug": "bia-campos",
      "tag_slugs": ["seguros", "saude"],
      "cross_tenant_slugs": ["healthtech-demo-lumen"],
      "image_file": "seguro-saude.webp",
      "image_alt": "Coordenadora explica uma jornada de cuidado a um adulto em uma clínica.",
      "eyebrow": "Saúde",
      "paragraphs": [
        "Uma rede ampla não garante que a pessoa saiba onde começar ou como continuar o cuidado. Coordenação conecta orientação, histórico e próximos passos sem substituir a decisão clínica.",
        "A experiência melhora quando canais compartilham contexto com consentimento e evitam que o beneficiário repita as mesmas informações. Transições entre serviços merecem atenção especial.",
        "Indicadores precisam observar acesso, continuidade e segurança, não apenas volume de utilização. A transparência ajuda a identificar filas e barreiras de navegação.",
        "O seguro, a clínica e os personagens são fictícios. O texto não oferece cobertura nem orientação clínica individual."
      ]
    },
    {
      "ordinal": 24,
      "code": "MVP-SE-004",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "seguros-empresariais-continuidade-operacional",
      "title": "Pequenas empresas tratam seguro como parte da continuidade operacional",
      "subtitle": "Equipamentos, fornecedores e tempo parado ajudam a definir o que realmente precisa ser protegido.",
      "category_slug": "seguros-empresariais",
      "category_name": "Seguros Empresariais",
      "category_description": "Riscos operacionais, patrimônio, responsabilidade e continuidade de pequenos negócios.",
      "author_slug": "bia-campos",
      "tag_slugs": ["seguros", "empresas"],
      "cross_tenant_slugs": ["credito-demo-orbita"],
      "image_file": "seguros-empresariais.webp",
      "image_alt": "Proprietária de padaria inspeciona equipamentos com uma consultora de riscos.",
      "eyebrow": "Empresas",
      "paragraphs": [
        "Para uma pequena empresa, o impacto de um incidente vai além do bem danificado. Tempo de interrupção, perda de estoque e compromisso com clientes podem pressionar o caixa rapidamente.",
        "Mapear processos críticos ajuda a escolher limites e coberturas coerentes. O inventário também revela medidas de prevenção que reduzem a chance ou a gravidade de uma perda.",
        "Franquias, exclusões e exigências de manutenção precisam ser compreendidas antes do sinistro. O contrato deve conversar com a operação real, não com uma descrição genérica do setor.",
        "A padaria, a consultora e o seguro são fictícios. A pauta não substitui inspeção, assessoria jurídica ou proposta adequada ao negócio."
      ]
    },
    {
      "ordinal": 25,
      "code": "MVP-SE-005",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "seguro-cyber-plano-resposta",
      "title": "Seguro cyber sai da apólice e entra no plano de resposta",
      "subtitle": "Cobertura, prevenção e comunicação precisam funcionar juntas quando um incidente acontece.",
      "category_slug": "seguro-cyber",
      "category_name": "Seguro Cyber",
      "category_description": "Risco digital, resposta a incidentes, continuidade e proteção de dados.",
      "author_slug": "bia-campos",
      "tag_slugs": ["seguros", "seguranca-financeira"],
      "cross_tenant_slugs": ["credito-demo-orbita"],
      "image_file": "seguro-cyber.webp",
      "image_alt": "Equipe de uma pequena empresa responde a uma simulação de incidente digital.",
      "eyebrow": "Cyber",
      "paragraphs": [
        "Uma apólice cyber não substitui controles básicos, inventário de sistemas e treinamento. Ela funciona melhor quando responsabilidades e canais de acionamento já estão definidos.",
        "Durante o incidente, decisões técnicas, jurídicas e de comunicação acontecem ao mesmo tempo. Uma simulação revela dependências e lacunas antes que a pressão seja real.",
        "Escopo de serviços, prazos de notificação e fornecedores autorizados precisam ser conhecidos. A resposta atrasada pode ampliar dano e dificultar a cobertura.",
        "A empresa e o incidente são fictícios. O conteúdo não descreve ameaça ativa nem oferece seguro ou consultoria de segurança."
      ]
    },
    {
      "ordinal": 26,
      "code": "MVP-SE-006",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "novos-seguros-trabalho-movel-renda-variavel",
      "title": "Novos seguros tentam acompanhar trabalho móvel e renda variável",
      "subtitle": "Coberturas mais flexíveis precisam continuar claras sobre preço, acionamento e limites.",
      "category_slug": "novos-modelos-seguro",
      "category_name": "Novos Modelos de Seguro",
      "category_description": "Seguros sob demanda, coberturas flexíveis, plataformas e novas jornadas.",
      "author_slug": "bia-campos",
      "tag_slugs": ["seguros", "tecnologia-e-ia"],
      "cross_tenant_slugs": ["credito-demo-orbita"],
      "image_file": "novos-modelos-seguro.webp",
      "image_alt": "Entregadora de bicicleta conversa com uma especialista em um café.",
      "eyebrow": "Novos modelos",
      "paragraphs": [
        "Trabalho por demanda e deslocamento constante criam riscos que não seguem o horário tradicional. Produtos flexíveis tentam ativar proteção por período, atividade ou uso.",
        "A conveniência não pode esconder quando a cobertura começa, termina ou deixa de valer. A pessoa precisa entender o custo acumulado e o processo de acionamento.",
        "Dados de localização e atividade também exigem consentimento proporcional. Personalização não justifica coletar informações além da finalidade declarada.",
        "A trabalhadora, a plataforma e a cobertura são fictícias. A matéria não representa vínculo trabalhista nem oferta de seguro."
      ]
    },
    {
      "ordinal": 27,
      "code": "MVP-SE-007",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "protecao-renda-profissionais-independentes",
      "title": "Proteção de renda ajuda profissionais independentes a planejar interrupções",
      "subtitle": "Reserva, cobertura e continuidade de clientes precisam ser vistas como uma única estratégia.",
      "category_slug": "protecao-renda-patrimonio",
      "category_name": "Proteção de Renda & Patrimônio",
      "category_description": "Continuidade de renda, patrimônio e proteção para profissionais e famílias.",
      "author_slug": "bia-campos",
      "tag_slugs": ["seguros", "planejamento-financeiro"],
      "cross_tenant_slugs": ["banco-demo-horizonte"],
      "image_file": "protecao-renda-patrimonio.webp",
      "image_alt": "Arquiteta trabalha em seu estúdio doméstico com maquete e notebook.",
      "eyebrow": "Renda",
      "paragraphs": [
        "Quem trabalha por conta própria costuma concentrar geração de receita e execução na mesma pessoa. Uma interrupção pode afetar renda, prazo de entrega e relação com clientes.",
        "Reserva líquida cobre necessidades imediatas, enquanto seguros podem apoiar eventos específicos. O desenho precisa considerar carência, franquia e tempo real de recuperação.",
        "Documentar projetos, acessos e contatos também aumenta continuidade. Proteção financeira funciona melhor quando a operação consegue ser retomada ou transferida.",
        "A arquiteta e sua atividade são fictícias. O conteúdo não recomenda cobertura e não substitui análise de renda ou contrato."
      ]
    },
    {
      "ordinal": 28,
      "code": "MVP-SE-008",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "ia-seguros-triagem-decisao-explicavel",
      "title": "IA em seguros acelera triagem, mas decisão precisa continuar explicável",
      "subtitle": "Automação pode priorizar casos sem transformar uma recomendação em veredito.",
      "category_slug": "ia-seguros",
      "category_name": "IA & Tecnologia em Seguros",
      "category_description": "Automação, sinistros, subscrição, explicabilidade e supervisão humana.",
      "author_slug": "bia-campos",
      "tag_slugs": ["tecnologia-e-ia", "seguros"],
      "cross_tenant_slugs": ["credito-demo-orbita", "healthtech-demo-lumen"],
      "image_file": "ia-seguros.webp",
      "image_alt": "Equipe de sinistros revisa uma recomendação automatizada em conjunto.",
      "eyebrow": "IA & seguros",
      "paragraphs": [
        "Sistemas podem classificar documentos, localizar inconsistências e encaminhar casos simples. O benefício diminui quando a equipe não consegue explicar por que um processo foi sinalizado.",
        "Erros de dados e situações raras exigem revisão humana com acesso ao contexto. A automação deve destacar incerteza, não escondê-la.",
        "Monitoramento acompanha diferenças entre perfis, tempo de resposta e reversões. Uma boa governança também registra quem aprovou a decisão final.",
        "Os casos, a equipe e o sistema são fictícios. A pauta discute governança tecnológica e não representa análise de sinistro real."
      ]
    },
    {
      "ordinal": 29,
      "code": "MVP-SE-009",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "sucessao-empresarial-governanca-familia",
      "title": "Sucessão empresarial combina governança, patrimônio e relações familiares",
      "subtitle": "Continuidade depende de papéis claros, formação de lideranças e acordos antes da transição.",
      "category_slug": "sucessao-seguros",
      "category_name": "Planejamento Sucessório",
      "category_description": "Continuidade empresarial, acordos familiares, proteção e transição de liderança.",
      "author_slug": "andre-faria",
      "tag_slugs": ["planejamento-sucessorio", "seguros"],
      "cross_tenant_slugs": ["banco-demo-horizonte"],
      "image_file": "sucessao-empresarial.webp",
      "image_alt": "Família empresária de três gerações conversa com uma mediadora.",
      "eyebrow": "Sucessão",
      "paragraphs": [
        "Transferir liderança e propriedade são movimentos relacionados, mas não idênticos. Uma pessoa pode estar preparada para gerir sem ser a única beneficiária do patrimônio.",
        "Critérios de entrada, decisão e remuneração reduzem ambiguidade entre família e empresa. A formação de sucessores precisa de tempo e experiências reais.",
        "Seguros e reservas podem oferecer liquidez durante a transição, mas não substituem governança. O plano deve integrar instrumentos jurídicos, financeiros e operacionais.",
        "A empresa e a família são fictícias. A matéria não substitui assessoria societária, sucessória, tributária ou de seguros."
      ]
    },
    {
      "ordinal": 30,
      "code": "MVP-SE-010",
      "tenant_slug": "seguros-demo-atlas",
      "slug": "seguros-longevidade-autonomia-novos-ciclos",
      "title": "Longevidade leva seguros a olhar também para autonomia e novos ciclos",
      "subtitle": "Proteção deixa de ser apenas resposta à perda e passa a acompanhar projetos em diferentes fases.",
      "category_slug": "seguros-longevidade",
      "category_name": "Seguros & Longevidade",
      "category_description": "Autonomia, novos projetos, proteção e serviços para vidas mais longas.",
      "author_slug": "andre-faria",
      "tag_slugs": ["longevidade", "seguros"],
      "cross_tenant_slugs": ["healthtech-demo-lumen"],
      "image_file": "seguros-longevidade.webp",
      "image_alt": "Artista de 62 anos conversa com uma colega em um estúdio de cerâmica.",
      "eyebrow": "Longevidade",
      "paragraphs": [
        "Vidas mais longas incluem trabalho, aprendizagem, viagens e negócios em idades diversas. A proteção precisa acompanhar atividades reais em vez de presumir uma fase passiva.",
        "Serviços de assistência, renda e cuidado podem apoiar autonomia quando são escolhidos com clareza. O valor depende de acesso simples e limites compreensíveis.",
        "Revisões periódicas permitem ajustar beneficiários, coberturas e prioridades. A idade isolada explica menos que rotina, rede de apoio e patrimônio.",
        "As artistas e os serviços são fictícios. A pauta não oferece cobertura e evita promessas de saúde, renda ou assistência."
      ]
    },
    {
      "ordinal": 11,
      "code": "MVP-IN-001",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "renda-fixa-prazo-liquidez",
      "title": "Renda fixa volta ao centro da conversa sobre prazo e liquidez",
      "subtitle": "A taxa anunciada só faz sentido quando vencimento, risco e acesso ao dinheiro entram na comparação.",
      "category_slug": "renda-fixa",
      "category_name": "Renda Fixa",
      "category_description": "Juros, crédito, inflação, liquidez e instrumentos de renda fixa.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["investimentos", "diversificacao"],
      "cross_tenant_slugs": [],
      "image_file": "renda-fixa.webp",
      "image_alt": "Analista compara cenários de prazo e juros em gráficos impressos.",
      "eyebrow": "Renda fixa",
      "paragraphs": [
        "Renda fixa reúne instrumentos com comportamentos diferentes. Prazo, emissor, indexador e possibilidade de resgate mudam o papel de cada título dentro de uma carteira.",
        "Uma taxa mais alta pode compensar menor liquidez ou maior risco de crédito. Comparar apenas o percentual divulgado apaga as condições necessárias para chegar ao retorno esperado.",
        "Objetivos próximos pedem previsibilidade de acesso ao dinheiro, enquanto horizontes longos toleram outros vencimentos. A função do recurso deve vir antes da escolha do instrumento.",
        "Os exemplos são fictícios e não constituem recomendação de investimento. Rentabilidade, risco e tributação precisam ser avaliados no contexto individual."
      ]
    },
    {
      "ordinal": 12,
      "code": "MVP-IN-002",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "renda-variavel-processo-conviccao",
      "title": "Renda variável pede processo antes de convicção",
      "subtitle": "Entender a empresa, o preço e o próprio horizonte reduz decisões movidas apenas pelo ruído do mercado.",
      "category_slug": "renda-variavel",
      "category_name": "Renda Variável",
      "category_description": "Empresas, mercado acionário, risco e construção de processo de análise.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["investimentos", "diversificacao"],
      "cross_tenant_slugs": [],
      "image_file": "renda-variavel.webp",
      "image_alt": "Jovem investidora aprende a analisar empresas ao lado de uma mentora.",
      "eyebrow": "Renda variável",
      "paragraphs": [
        "Comprar uma participação em uma empresa é diferente de acompanhar apenas a oscilação diária do preço. Receita, capacidade de execução, endividamento e governança ajudam a formar uma tese verificável.",
        "A tese também precisa declarar o que poderia torná-la errada. Sem critérios de revisão, convicção pode virar uma justificativa para ignorar informação nova.",
        "Tamanho da posição e horizonte protegem a carteira de uma ideia concentrada demais. O processo não elimina perdas, mas torna a decisão menos dependente de impulso.",
        "A investidora, a mentora e as empresas são fictícias. A pauta é educacional e não indica compra ou venda de ativos."
      ]
    },
    {
      "ordinal": 13,
      "code": "MVP-IN-003",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "fundos-alem-desempenho-recente",
      "title": "Fundos de investimento: o que observar além do desempenho recente",
      "subtitle": "Mandato, equipe, risco e custos ajudam a entender como um resultado foi produzido.",
      "category_slug": "fundos-investimento",
      "category_name": "Fundos de Investimento",
      "category_description": "Gestão profissional, mandatos, custos, governança e avaliação de fundos.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["investimentos", "diversificacao"],
      "cross_tenant_slugs": [],
      "image_file": "fundos-investimento.webp",
      "image_alt": "Comitê diverso debate uma alocação em sala de reunião.",
      "eyebrow": "Fundos",
      "paragraphs": [
        "O retorno de um fundo mostra o que aconteceu, mas não explica sozinho como a carteira chegou até ali. Mandato, limites de risco e fontes de resultado ajudam a interpretar o histórico.",
        "Mudanças na equipe ou no tamanho do patrimônio podem alterar a execução da estratégia. A consistência do processo importa tanto quanto um período de destaque.",
        "Taxas e liquidez também reduzem ou condicionam o resultado disponível para o investidor. A comparação deve considerar produtos com objetivos e riscos semelhantes.",
        "O fundo e o comitê são fictícios. Desempenho passado não garante resultados e o texto não recomenda qualquer veículo de investimento."
      ]
    },
    {
      "ordinal": 14,
      "code": "MVP-IN-004",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "investimentos-internacionais-funcao-carteira",
      "title": "Investir fora do país começa pela função na carteira, não pelo destino",
      "subtitle": "Moeda, setores e ciclos diferentes podem diversificar, mas também criam novas camadas de risco.",
      "category_slug": "investimentos-internacionais",
      "category_name": "Investimentos Internacionais",
      "category_description": "Diversificação geográfica, moedas, mercados e estruturas de acesso internacional.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["investimentos", "diversificacao"],
      "cross_tenant_slugs": [],
      "image_file": "investimentos-internacionais.webp",
      "image_alt": "Empreendedora conversa por vídeo com parceiros enquanto consulta um mapa.",
      "eyebrow": "Internacional",
      "paragraphs": [
        "A exposição internacional pode reduzir dependência de um único país e ampliar o acesso a setores pouco representados localmente. O benefício depende do que já existe na carteira.",
        "Variação cambial, custos, tributação e regras de cada veículo alteram o resultado. Uma boa decisão separa o retorno do ativo do movimento da moeda.",
        "Também é útil definir como a posição será acompanhada e rebalanceada. Diversificar não significa abandonar critérios de liquidez e concentração.",
        "Os mercados e personagens desta pauta são demonstrativos. O conteúdo não recomenda jurisdição, moeda, fundo ou ativo específico."
      ]
    },
    {
      "ordinal": 15,
      "code": "MVP-IN-005",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "ativos-alternativos-opcoes-riscos",
      "title": "Ativos alternativos ampliam opções e também o trabalho de entender riscos",
      "subtitle": "Infraestrutura, energia e outros projetos exigem leitura de prazo, governança e saída.",
      "category_slug": "investimentos-alternativos",
      "category_name": "Investimentos Alternativos",
      "category_description": "Infraestrutura, ativos reais, crédito estruturado e outras estratégias alternativas.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["investimentos", "diversificacao"],
      "cross_tenant_slugs": [],
      "image_file": "investimentos-alternativos.webp",
      "image_alt": "Duas profissionais inspecionam painéis solares no telhado de um galpão.",
      "eyebrow": "Alternativos",
      "paragraphs": [
        "Projetos de infraestrutura e ativos reais aproximam o investimento de uma operação concreta. Essa visibilidade não torna o fluxo de receita simples ou garantido.",
        "Construção, regulação, contraparte e manutenção podem mudar o cronograma. A avaliação precisa testar atrasos e custos maiores que o cenário base.",
        "Liquidez costuma ser menor e a saída pode depender de um mercado específico. Por isso, o tamanho da posição deve conversar com outras necessidades da carteira.",
        "O projeto de energia é fictício e ilustra critérios de análise. A matéria não oferece participação, retorno ou recomendação de investimento."
      ]
    },
    {
      "ordinal": 16,
      "code": "MVP-IN-006",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "diversificacao-riscos-realmente-diferentes",
      "title": "Diversificação funciona quando riscos diferentes são realmente diferentes",
      "subtitle": "Muitos ativos não bastam se todos respondem ao mesmo choque econômico.",
      "category_slug": "risco-diversificacao",
      "category_name": "Risco & Diversificação",
      "category_description": "Construção de carteira, correlação, concentração e gestão de cenários.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["diversificacao", "investimentos"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "risco-diversificacao.webp",
      "image_alt": "Profissional organiza blocos coloridos para visualizar uma carteira diversificada.",
      "eyebrow": "Diversificação",
      "paragraphs": [
        "Uma carteira pode ter dezenas de posições e continuar concentrada. Empresas do mesmo setor, títulos do mesmo emissor ou ativos sensíveis ao mesmo juro carregam riscos parecidos.",
        "Diversificação útil pergunta o que tende a acontecer em cenários de inflação, recessão, choque cambial ou necessidade de liquidez. A relação entre as posições importa mais que a contagem.",
        "O desenho também precisa ser compreensível e revisável. Complexidade sem função aumenta o trabalho de acompanhamento sem necessariamente reduzir risco.",
        "Os blocos representam uma simulação fictícia. O conteúdo explica um conceito e não propõe alocação ou percentual para uma carteira real."
      ]
    },
    {
      "ordinal": 17,
      "code": "MVP-IN-007",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "financas-comportamentais-decisoes-impulso",
      "title": "Finanças comportamentais ajudam a reconhecer decisões tomadas no impulso",
      "subtitle": "Regras simples criam uma pausa entre a emoção do mercado e a ação na carteira.",
      "category_slug": "financas-comportamentais",
      "category_name": "Finanças Comportamentais",
      "category_description": "Comportamento, vieses, hábitos de decisão e disciplina em investimentos.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["investimentos", "planejamento-financeiro"],
      "cross_tenant_slugs": ["credito-demo-orbita"],
      "image_file": "financas-comportamentais.webp",
      "image_alt": "Profissional faz uma pausa reflexiva antes de decidir pelo celular.",
      "eyebrow": "Comportamento",
      "paragraphs": [
        "Medo de ficar de fora, aversão a perdas e excesso de confiança aparecem em investidores experientes e iniciantes. Reconhecer o viés não significa conseguir eliminá-lo no momento de tensão.",
        "Uma política escrita de aporte, limite e rebalanceamento reduz decisões improvisadas. A pausa também permite conferir se a notícia realmente altera o objetivo de longo prazo.",
        "Registrar a razão de uma decisão cria material para revisão posterior. O aprendizado vem de comparar a expectativa com o resultado, e não apenas de celebrar acertos.",
        "A situação é fictícia e não descreve recomendação de mercado. Cada investimento envolve risco e deve respeitar objetivos e capacidade de perda."
      ]
    },
    {
      "ordinal": 18,
      "code": "MVP-IN-008",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "tecnologia-investimentos-responsabilidade",
      "title": "Tecnologia amplia capacidade de análise sem terceirizar responsabilidade",
      "subtitle": "Dados e modelos ajudam a encontrar padrões, mas decisão e governança continuam humanas.",
      "category_slug": "tecnologia-investimentos",
      "category_name": "Tecnologia em Investimentos",
      "category_description": "Dados, automação, modelos quantitativos e governança tecnológica em investimentos.",
      "author_slug": "elisa-monte",
      "tag_slugs": ["tecnologia-e-ia", "investimentos"],
      "cross_tenant_slugs": ["credito-demo-orbita"],
      "image_file": "tecnologia-investimentos.webp",
      "image_alt": "Equipe quantitativa revisa dados em vários monitores.",
      "eyebrow": "Tecnologia",
      "paragraphs": [
        "Sistemas quantitativos conseguem acompanhar universos maiores e executar regras com consistência. O modelo, porém, reflete escolhas sobre dados, horizonte e risco aceitável.",
        "Testes históricos podem favorecer relações que não se repetem. Custos, liquidez e mudanças de regime precisam aparecer antes que um resultado de laboratório vire processo.",
        "Supervisão humana inclui aprovar limites, monitorar desvios e interromper a estratégia quando premissas deixam de valer. Automação responsável torna essas decisões auditáveis.",
        "A equipe e os sistemas são fictícios. A pauta trata de governança e não descreve algoritmo, retorno ou serviço de investimento real."
      ]
    },
    {
      "ordinal": 19,
      "code": "MVP-IN-009",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "planejamento-sucessorio-antes-transferencia",
      "title": "Planejamento sucessório começa muito antes da transferência de patrimônio",
      "subtitle": "Governança, informação e acordos familiares reduzem decisões concentradas em um único evento.",
      "category_slug": "planejamento-patrimonial-sucessorio",
      "category_name": "Planejamento Patrimonial & Sucessório",
      "category_description": "Governança familiar, organização patrimonial, continuidade e sucessão.",
      "author_slug": "tomas-linhares",
      "tag_slugs": ["planejamento-sucessorio", "longevidade"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "planejamento-sucessorio.webp",
      "image_alt": "Família de três gerações conversa com uma assessora ao redor de uma mesa.",
      "eyebrow": "Sucessão",
      "paragraphs": [
        "Sucessão não é apenas decidir quem recebe cada ativo. É garantir que informações, responsabilidades e critérios de decisão continuem disponíveis quando pessoas e papéis mudarem.",
        "Conversas antecipadas ajudam a revelar expectativas diferentes entre familiares. Acordos claros não eliminam conflito, mas oferecem um processo para tratar divergências.",
        "Empresas, imóveis, seguros e investimentos têm regras próprias. A coordenação entre instrumentos evita soluções isoladas que se contradizem.",
        "A família e o patrimônio são fictícios. Questões sucessórias exigem análise jurídica, tributária e financeira adequada a cada caso."
      ]
    },
    {
      "ordinal": 20,
      "code": "MVP-IN-010",
      "tenant_slug": "banco-demo-horizonte",
      "slug": "investir-vida-longa-carreira-projetos",
      "title": "Investir para uma vida longa conecta reserva, carreira e novos projetos",
      "subtitle": "O horizonte financeiro se amplia quando trabalho e aprendizagem continuam mudando depois dos 40.",
      "category_slug": "investimentos-longevidade",
      "category_name": "Investimentos para Longevidade",
      "category_description": "Reservas, renda, transições de carreira e projetos em horizontes de vida mais longos.",
      "author_slug": "tomas-linhares",
      "tag_slugs": ["longevidade", "investimentos"],
      "cross_tenant_slugs": ["seguros-demo-atlas", "healthtech-demo-lumen"],
      "image_file": "investimentos-longevidade.webp",
      "image_alt": "Marceneiro de 45 anos planeja novos projetos em seu ateliê.",
      "eyebrow": "Longevidade",
      "paragraphs": [
        "Uma vida profissional mais longa pode incluir pausas, requalificação e períodos de renda variável. O planejamento precisa financiar transições, não apenas uma data final de aposentadoria.",
        "Reservas com funções diferentes ajudam a separar emergência, aprendizado e horizonte de longo prazo. Essa arquitetura reduz a chance de vender um ativo inadequado para pagar um projeto próximo.",
        "Capital humano também faz parte da equação. Tempo, saúde e capacidade de aprender influenciam a renda futura e merecem espaço ao lado da carteira financeira.",
        "O profissional e seus planos são fictícios. O conteúdo organiza horizontes de decisão e não recomenda produto ou estratégia de investimento."
      ]
    },
    {
      "ordinal": 2,
      "code": "MVP-CR-002",
      "tenant_slug": "credito-demo-orbita",
      "slug": "credito-empresas-fluxo-caixa",
      "title": "Crédito para empresas começa no desenho do fluxo de caixa",
      "subtitle": "Capital de giro, prazo de recebimento e investimento precisam aparecer na mesma fotografia financeira.",
      "category_slug": "credito-empresas",
      "category_name": "Crédito para Empresas",
      "category_description": "Capital de giro, investimento produtivo e decisões de financiamento para negócios.",
      "author_slug": "rafael-paiva",
      "tag_slugs": ["credito", "empresas"],
      "cross_tenant_slugs": [],
      "image_file": "credito-empresas.webp",
      "image_alt": "Proprietária de uma pequena fábrica revisa documentos e um tablet com seu sócio.",
      "eyebrow": "Empresas",
      "paragraphs": [
        "Antes de buscar crédito, uma empresa precisa separar falta pontual de caixa, expansão e descasamento entre pagamento e recebimento. Misturar os três problemas pode produzir uma dívida com prazo incompatível.",
        "O fluxo projetado deve incluir meses fracos, manutenção e atrasos realistas. Uma operação que parece confortável no cenário médio pode se tornar rígida quando vendas ou custos saem do plano.",
        "Garantias, carência e condições de amortização merecem a mesma atenção que a taxa. Para um investimento produtivo, o calendário de geração de receita precisa conversar com o início dos pagamentos.",
        "Os negócios e números desta pauta são demonstrativos. A matéria não substitui análise contábil, jurídica ou financeira específica para cada empresa."
      ]
    },
    {
      "ordinal": 3,
      "code": "MVP-CR-003",
      "tenant_slug": "credito-demo-orbita",
      "slug": "home-equity-reforma-risco-patrimonial",
      "title": "Home equity entra na conversa sobre reforma sem apagar o risco patrimonial",
      "subtitle": "Usar um imóvel como garantia reduz custos em alguns cenários, mas amplia a importância do planejamento.",
      "category_slug": "credito-imobiliario",
      "category_name": "Crédito Imobiliário & Home Equity",
      "category_description": "Moradia, garantia imobiliária, reforma e decisões patrimoniais de longo prazo.",
      "author_slug": "joana-neri",
      "tag_slugs": ["credito", "moradia"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "credito-imobiliario.webp",
      "image_alt": "Casal analisa uma planta de reforma e amostras de materiais em seu apartamento.",
      "eyebrow": "Moradia",
      "paragraphs": [
        "Crédito com garantia imobiliária costuma entrar na pauta por oferecer prazo longo e custo menor que linhas sem garantia. Essa vantagem não elimina o fato de que um bem central da família está vinculado ao contrato.",
        "Uma reforma pode melhorar acessibilidade, eficiência e uso futuro da casa, mas orçamento e cronograma precisam prever imprevistos. O valor captado não deve depender de uma estimativa otimista da obra.",
        "A decisão fica mais robusta quando compara outras fontes, mantém reserva fora do projeto e considera mudanças de renda ou moradia. Proteção patrimonial começa pela capacidade de sustentar o compromisso.",
        "O exemplo é inteiramente fictício e não recomenda operação de crédito. Condições, riscos e garantias devem ser avaliados no contrato e no contexto de cada família."
      ]
    },
    {
      "ordinal": 4,
      "code": "MVP-CR-004",
      "tenant_slug": "credito-demo-orbita",
      "slug": "fintechs-entrada-confianca-linguagem-clara",
      "title": "Fintechs redesenham a entrada, mas confiança ainda depende de linguagem clara",
      "subtitle": "Uma jornada rápida só é inclusiva quando deixa preço, consentimento e suporte fáceis de encontrar.",
      "category_slug": "fintechs-novos-servicos",
      "category_name": "Fintechs & Novos Serviços",
      "category_description": "Modelos digitais, desenho de serviço, inclusão e confiança em finanças.",
      "author_slug": "rafael-paiva",
      "tag_slugs": ["credito", "tecnologia-e-ia"],
      "cross_tenant_slugs": ["banco-demo-horizonte"],
      "image_file": "fintechs-novos-servicos.webp",
      "image_alt": "Equipe jovem e diversa testa protótipos de uma jornada financeira digital.",
      "eyebrow": "Fintechs",
      "paragraphs": [
        "Abrir uma conta ou pedir uma análise em poucos minutos mudou a expectativa sobre serviços financeiros. A mesma velocidade pode esconder etapas importantes quando preço, compartilhamento de dados ou canais de ajuda aparecem tarde.",
        "Times de produto mais maduros testam a jornada com pessoas de repertórios diferentes. O objetivo não é apenas reduzir cliques, mas garantir que uma decisão possa ser compreendida e revista.",
        "Atendimento humano continua relevante em exceções, contestação e situações de vulnerabilidade. Uma experiência digital confiável deixa claro quando a automação decide e como pedir uma segunda análise.",
        "A empresa e os protótipos descritos são fictícios. A pauta discute princípios de desenho de serviço e não avalia plataformas existentes."
      ]
    },
    {
      "ordinal": 5,
      "code": "MVP-CR-005",
      "tenant_slug": "credito-demo-orbita",
      "slug": "open-finance-consentimento-controle",
      "title": "Open Finance dá mais controle quando consentimento deixa de ser letra miúda",
      "subtitle": "Permissão, finalidade e prazo precisam ser compreendidos antes de qualquer promessa de conveniência.",
      "category_slug": "open-finance",
      "category_name": "Open Finance",
      "category_description": "Compartilhamento de dados, consentimento, portabilidade e novos serviços.",
      "author_slug": "rafael-paiva",
      "tag_slugs": ["tecnologia-e-ia", "seguranca-financeira"],
      "cross_tenant_slugs": ["banco-demo-horizonte"],
      "image_file": "open-finance.webp",
      "image_alt": "Profissional revisa permissões financeiras no celular ao lado de uma consultora.",
      "eyebrow": "Open Finance",
      "paragraphs": [
        "Compartilhar dados pode reduzir retrabalho e permitir ofertas mais ajustadas ao contexto, mas o benefício só existe quando a pessoa sabe quais informações seguem para qual empresa.",
        "Consentimentos úteis informam finalidade, duração e forma de cancelamento em linguagem direta. A revisão periódica é parte da experiência, não um recurso escondido nas configurações.",
        "Empresas também precisam limitar o uso ao que foi autorizado e registrar decisões automatizadas. Segurança não termina na transmissão dos dados; inclui governança durante todo o ciclo.",
        "O serviço desta matéria é fictício. O texto não solicita compartilhamento de informações e não representa orientação sobre uma plataforma financeira real."
      ]
    },
    {
      "ordinal": 6,
      "code": "MVP-CR-006",
      "tenant_slug": "credito-demo-orbita",
      "slug": "pagamentos-aproximacao-pequenos-negocios",
      "title": "Pagamentos por aproximação mudam a rotina de pequenos negócios",
      "subtitle": "Velocidade no balcão vem acompanhada de novas perguntas sobre conciliação, custo e contestação.",
      "category_slug": "meios-pagamento",
      "category_name": "Meios de Pagamento",
      "category_description": "Pagamentos digitais, experiência no varejo, custos e segurança operacional.",
      "author_slug": "rafael-paiva",
      "tag_slugs": ["pagamentos", "empresas"],
      "cross_tenant_slugs": [],
      "image_file": "meios-pagamento.webp",
      "image_alt": "Jovem comerciante recebe um pagamento por aproximação em uma loja de bairro.",
      "eyebrow": "Pagamentos",
      "paragraphs": [
        "A aproximação reduziu o tempo de uma venda e tornou o celular parte da infraestrutura de muitos comércios. Para o negócio, a experiência só fecha quando a transação também aparece de forma clara na conciliação.",
        "Taxas diferentes por modalidade, antecipação e prazo de recebimento afetam a margem. Uma solução simples no balcão pode exigir disciplina diária no controle financeiro.",
        "Contestação e fraude pedem processos que preservem evidências sem travar o atendimento. Treinamento curto, limites adequados e canais de suporte fazem parte do produto.",
        "A loja e as soluções citadas são fictícias. A matéria descreve mudanças operacionais e não promove adquirente, carteira ou meio de pagamento específico."
      ]
    },
    {
      "ordinal": 7,
      "code": "MVP-CR-007",
      "tenant_slug": "credito-demo-orbita",
      "slug": "fraude-digital-seguranca-geracoes",
      "title": "Fraude digital exige segurança que funcione para diferentes gerações",
      "subtitle": "Alertas claros e recuperação acessível protegem mais do que mensagens baseadas apenas em medo.",
      "category_slug": "seguranca-fraudes",
      "category_name": "Segurança & Fraudes",
      "category_description": "Prevenção a golpes, autenticação, contestação e desenho seguro de jornadas.",
      "author_slug": "joana-neri",
      "tag_slugs": ["seguranca-financeira", "tecnologia-e-ia"],
      "cross_tenant_slugs": ["seguros-demo-atlas"],
      "image_file": "seguranca-fraudes.webp",
      "image_alt": "Mãe e filha adultas conversam sobre alertas de segurança no celular.",
      "eyebrow": "Segurança",
      "paragraphs": [
        "Golpes digitais exploram pressa, autoridade e mudanças de rotina, não uma suposta incapacidade de determinada idade. Por isso, comunicação de segurança precisa respeitar repertórios diferentes sem infantilizar.",
        "Alertas eficazes explicam a ação suspeita, oferecem um caminho seguro e evitam links ambíguos. A pessoa deve conseguir interromper uma transação ou pedir ajuda sem percorrer várias telas.",
        "Depois do incidente, recuperação e contestação são tão importantes quanto prevenção. Processos claros reduzem dano, ajudam a identificar padrões e restabelecem confiança.",
        "As pessoas e situações apresentadas são fictícias. Nunca compartilhe senhas ou códigos e procure os canais oficiais da instituição em caso de dúvida."
      ]
    },
    {
      "ordinal": 8,
      "code": "MVP-CR-008",
      "tenant_slug": "credito-demo-orbita",
      "slug": "ia-credito-revisao-humana-vieses",
      "title": "IA no crédito avança com revisão humana e teste de vieses",
      "subtitle": "Modelos mais rápidos precisam continuar explicáveis, monitorados e abertos à contestação.",
      "category_slug": "ia-servicos-financeiros",
      "category_name": "IA & Tecnologia Financeira",
      "category_description": "Automação, dados, explicabilidade e supervisão humana em serviços financeiros.",
      "author_slug": "rafael-paiva",
      "tag_slugs": ["tecnologia-e-ia", "credito"],
      "cross_tenant_slugs": ["banco-demo-horizonte", "seguros-demo-atlas"],
      "image_file": "ia-credito.webp",
      "image_alt": "Equipe diversa de analistas revisa critérios de um modelo de crédito.",
      "eyebrow": "IA & crédito",
      "paragraphs": [
        "Modelos automatizados conseguem processar sinais em escala e reduzir tempo de resposta. O ganho operacional não transforma a saída do sistema em uma verdade neutra.",
        "Qualidade dos dados, definição do objetivo e mudanças no comportamento do público alteram o resultado. Testes precisam comparar grupos, acompanhar deriva e investigar recusas fora do padrão.",
        "Revisão humana tem valor quando dispõe de contexto e autoridade para mudar a decisão. Também é necessário explicar ao solicitante quais fatores pesaram e como contestar um erro.",
        "O modelo e a instituição são fictícios. A pauta discute governança de tecnologia e não descreve critérios usados por empresas reais."
      ]
    },
    {
      "ordinal": 9,
      "code": "MVP-CR-009",
      "tenant_slug": "credito-demo-orbita",
      "slug": "planejamento-financeiro-prioridades-reais",
      "title": "Planejamento financeiro ganha força quando começa por prioridades reais",
      "subtitle": "Organizar o mês, proteger imprevistos e abrir espaço para projetos é mais útil que perseguir uma planilha perfeita.",
      "category_slug": "educacao-planejamento-financeiro",
      "category_name": "Educação & Planejamento Financeiro",
      "category_description": "Organização financeira, objetivos, decisões de consumo e construção de autonomia.",
      "author_slug": "joana-neri",
      "tag_slugs": ["planejamento-financeiro", "longevidade"],
      "cross_tenant_slugs": ["banco-demo-horizonte", "seguros-demo-atlas"],
      "image_file": "planejamento-financeiro.webp",
      "image_alt": "Casal organiza prioridades financeiras na cozinha enquanto uma criança desenha ao fundo.",
      "eyebrow": "Planejamento",
      "paragraphs": [
        "Um plano sustentável começa pela rotina que já existe: renda, compromissos, cuidado e desejos da família. A primeira meta não precisa ser sofisticada; precisa caber no cotidiano.",
        "Separar despesas previsíveis de imprevistos ajuda a decidir o tamanho de uma reserva e o ritmo dos projetos. O plano pode mudar sem ser considerado um fracasso.",
        "Conversas regulares distribuem informação entre as pessoas da casa e reduzem decisões tomadas sob pressão. Clareza compartilhada é uma forma de proteção financeira.",
        "A família e os valores são fictícios. O conteúdo oferece uma estrutura de conversa e não substitui orientação financeira individual."
      ]
    },
    {
      "ordinal": 10,
      "code": "MVP-CR-010",
      "tenant_slug": "credito-demo-orbita",
      "slug": "servicos-financeiros-50-mais-autonomia",
      "title": "Serviços 50+ migram do atendimento assistido para experiências autônomas",
      "subtitle": "Acessibilidade, confiança e escolha de canal importam mais que interfaces simplificadas por estereótipo.",
      "category_slug": "servicos-financeiros-50-mais",
      "category_name": "Serviços Financeiros 50+",
      "category_description": "Autonomia, acessibilidade e novas necessidades financeiras em vidas mais longas.",
      "author_slug": "joana-neri",
      "tag_slugs": ["longevidade", "tecnologia-e-ia"],
      "cross_tenant_slugs": ["seguros-demo-atlas", "healthtech-demo-lumen"],
      "image_file": "servicos-50-mais.webp",
      "image_alt": "Mulher ativa de 61 anos usa um tablet com uma atendente em uma biblioteca comunitária.",
      "eyebrow": "50+",
      "paragraphs": [
        "Consumidores acima de 50 anos não formam um grupo único e não precisam ser tratados como iniciantes digitais. Experiência, renda, visão, mobilidade e preferência de canal variam amplamente.",
        "Bons serviços permitem aumentar contraste e texto, rever uma ação e falar com alguém quando necessário. Essas escolhas melhoram a experiência para todas as idades.",
        "A autonomia também depende de segurança sem condescendência. Confirmações claras e recuperação acessível ajudam a pessoa a decidir com confiança.",
        "As pessoas e o serviço desta pauta são fictícios. A matéria observa princípios de inclusão e não representa uma solução financeira existente."
      ]
    }
  ]
  $catalog$::jsonb
) as article (
  ordinal integer,
  code text,
  tenant_slug text,
  slug text,
  title text,
  subtitle text,
  category_slug text,
  category_name text,
  category_description text,
  author_slug text,
  tag_slugs jsonb,
  cross_tenant_slugs jsonb,
  image_file text,
  image_alt text,
  eyebrow text,
  paragraphs jsonb
);

do $$
declare
  article_count integer;
  image_count integer;
  tenant_count integer;
  invalid_verticals integer;
  invalid_paragraphs integer;
begin
  select count(*), count(distinct image_file)
  into article_count, image_count
  from editorial_articles;

  select count(*)
  into tenant_count
  from public.tenants
  where slug in (
    'banco-demo-horizonte',
    'credito-demo-orbita',
    'healthtech-demo-lumen',
    'seguros-demo-atlas'
  )
    and kind = 'demo'
    and status = 'demo'
    and is_demo = true;

  select count(*)
  into invalid_verticals
  from (
    select tenant_slug
    from editorial_articles
    group by tenant_slug
    having count(*) <> 10
  ) invalid;

  select count(*)
  into invalid_paragraphs
  from editorial_articles
  where jsonb_typeof(paragraphs) <> 'array'
    or jsonb_array_length(paragraphs) <> 4;

  if article_count <> 40
    or image_count <> 40
    or tenant_count <> 4
    or invalid_verticals <> 0
    or invalid_paragraphs <> 0
  then
    raise exception
      'Catálogo editorial inválido: artigos %, imagens %, tenants %, verticais inválidas %, matérias sem quatro parágrafos %.',
      article_count,
      image_count,
      tenant_count,
      invalid_verticals,
      invalid_paragraphs;
  end if;
end;
$$;

with platform as (
  select id
  from public.tenants
  where slug = 'broadcast-saude-longevidade'
    and kind = 'platform'
    and is_demo = true
)
insert into public.categories (
  id,
  owner_tenant_id,
  name,
  slug,
  description,
  seo_json,
  status,
  is_demo
)
select distinct
  md5('editorial-category:' || article.category_slug)::uuid,
  platform.id,
  article.category_name,
  article.category_slug,
  article.category_description,
  jsonb_build_object(
    'title', article.category_name,
    'description', article.category_description
  ),
  'active',
  true
from editorial_articles article
cross join platform
on conflict (owner_tenant_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  seo_json = excluded.seo_json,
  status = 'active',
  is_demo = true,
  updated_at = now();

with platform as (
  select id
  from public.tenants
  where slug = 'broadcast-saude-longevidade'
    and kind = 'platform'
    and is_demo = true
),
tag_seed (slug, name) as (
  values
    ('credito', 'Crédito'),
    ('diversificacao', 'Diversificação'),
    ('empresas', 'Empresas'),
    ('investimentos', 'Investimentos'),
    ('longevidade', 'Longevidade'),
    ('moradia', 'Moradia'),
    ('pagamentos', 'Pagamentos'),
    ('planejamento-financeiro', 'Planejamento financeiro'),
    ('planejamento-sucessorio', 'Planejamento sucessório'),
    ('prevencao', 'Prevenção'),
    ('previdencia', 'Previdência'),
    ('saude', 'Saúde'),
    ('seguranca-financeira', 'Segurança financeira'),
    ('seguros', 'Seguros'),
    ('tecnologia-e-ia', 'Tecnologia e IA')
)
insert into public.tags (
  id,
  owner_tenant_id,
  name,
  slug,
  status,
  is_demo
)
select
  md5('editorial-tag:' || tag_seed.slug)::uuid,
  platform.id,
  tag_seed.name,
  tag_seed.slug,
  'active',
  true
from tag_seed
cross join platform
on conflict (owner_tenant_id, slug) do update set
  name = excluded.name,
  status = 'active',
  is_demo = true,
  updated_at = now();

insert into public.content_items (
  id,
  owner_tenant_id,
  canonical_slug,
  content_type,
  workflow_status,
  visibility,
  first_published_at,
  last_published_at,
  created_by,
  updated_by,
  is_demo
)
select
  md5('editorial-2026-07:item:' || article.code)::uuid,
  tenant.id,
  article.slug,
  'article',
  'published',
  'catalog',
  timestamptz '2026-07-27 15:00:00-03'
    - ((article.ordinal - 1) * interval '3 hours'),
  timestamptz '2026-07-27 15:00:00-03'
    - ((article.ordinal - 1) * interval '3 hours'),
  'demo-operator',
  'demo-operator',
  true
from editorial_articles article
join public.tenants tenant
  on tenant.slug = article.tenant_slug
 and tenant.kind = 'demo'
 and tenant.status = 'demo'
 and tenant.is_demo = true
on conflict (owner_tenant_id, canonical_slug) do update set
  content_type = 'article',
  workflow_status = 'published',
  visibility = 'catalog',
  last_published_at = excluded.last_published_at,
  paused_at = null,
  archived_at = null,
  updated_by = 'demo-operator',
  is_demo = true,
  updated_at = now();

insert into public.content_revisions (
  id,
  content_item_id,
  revision_number,
  title,
  subtitle,
  slug_snapshot,
  body_json,
  body_text,
  seo_title,
  seo_description,
  medical_review_status,
  word_count,
  created_by,
  approved_by,
  approved_at,
  change_summary,
  is_demo
)
select
  md5('editorial-2026-07:revision:' || article.code)::uuid,
  item.id,
  1,
  article.title,
  article.subtitle,
  article.slug,
  jsonb_build_object(
    'type', 'doc',
    'seed_code', article.code,
    'editorial_matrix', 'matriz-editorial-portais-v1',
    'demo_media', jsonb_build_object(
      'mode', 'fallback',
      'fallback_path', '/images/editorial/2026-07/' || article.image_file,
      'alt', article.image_alt,
      'credit', 'Imagem editorial fictícia gerada para demonstração.',
      'rights_basis', 'demo-original'
    ),
    'content', body.content_json
  ),
  body.body_text,
  article.title,
  article.subtitle,
  'not_required',
  array_length(regexp_split_to_array(trim(body.body_text), '\s+'), 1),
  'demo-operator',
  'demo-operator',
  timestamptz '2026-07-27 15:00:00-03',
  'Expansão editorial do MVP com texto, classificação e imagem exclusivos.',
  true
from editorial_articles article
join public.tenants tenant
  on tenant.slug = article.tenant_slug
join public.content_items item
  on item.owner_tenant_id = tenant.id
 and item.canonical_slug = article.slug
cross join lateral (
  select
    jsonb_agg(
      jsonb_build_object('type', 'paragraph', 'text', paragraph.value)
      order by paragraph.ordinality
    ) as content_json,
    string_agg(paragraph.value, E'\n\n' order by paragraph.ordinality) as body_text
  from jsonb_array_elements_text(article.paragraphs)
    with ordinality as paragraph(value, ordinality)
) body
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
  updated_at = now()
from editorial_articles article
join public.tenants tenant
  on tenant.slug = article.tenant_slug
join public.content_items selected_item
  on selected_item.owner_tenant_id = tenant.id
 and selected_item.canonical_slug = article.slug
join public.content_revisions revision
  on revision.content_item_id = selected_item.id
 and revision.revision_number = 1
where item.id = selected_item.id;

delete from public.content_revision_authors link
using editorial_articles article,
      public.tenants tenant,
      public.content_items item,
      public.content_revisions revision
where tenant.slug = article.tenant_slug
  and item.owner_tenant_id = tenant.id
  and item.canonical_slug = article.slug
  and revision.content_item_id = item.id
  and revision.revision_number = 1
  and link.content_revision_id = revision.id;

with platform as (
  select id
  from public.tenants
  where slug = 'broadcast-saude-longevidade'
    and kind = 'platform'
    and is_demo = true
)
insert into public.content_revision_authors (
  content_revision_id,
  author_id,
  byline_order
)
select
  revision.id,
  author.id,
  1
from editorial_articles article
join public.tenants tenant
  on tenant.slug = article.tenant_slug
join public.content_items item
  on item.owner_tenant_id = tenant.id
 and item.canonical_slug = article.slug
join public.content_revisions revision
  on revision.content_item_id = item.id
 and revision.revision_number = 1
cross join platform
join public.authors author
  on author.owner_tenant_id = platform.id
 and author.slug = article.author_slug
on conflict (content_revision_id, author_id) do update set
  byline_order = excluded.byline_order;

delete from public.content_revision_categories link
using editorial_articles article,
      public.tenants tenant,
      public.content_items item,
      public.content_revisions revision
where tenant.slug = article.tenant_slug
  and item.owner_tenant_id = tenant.id
  and item.canonical_slug = article.slug
  and revision.content_item_id = item.id
  and revision.revision_number = 1
  and link.content_revision_id = revision.id;

with platform as (
  select id
  from public.tenants
  where slug = 'broadcast-saude-longevidade'
    and kind = 'platform'
    and is_demo = true
)
insert into public.content_revision_categories (
  content_revision_id,
  category_id,
  is_primary
)
select
  revision.id,
  category.id,
  true
from editorial_articles article
join public.tenants tenant
  on tenant.slug = article.tenant_slug
join public.content_items item
  on item.owner_tenant_id = tenant.id
 and item.canonical_slug = article.slug
join public.content_revisions revision
  on revision.content_item_id = item.id
 and revision.revision_number = 1
cross join platform
join public.categories category
  on category.owner_tenant_id = platform.id
 and category.slug = article.category_slug
on conflict (content_revision_id, category_id) do update set
  is_primary = true;

delete from public.content_revision_tags link
using editorial_articles article,
      public.tenants tenant,
      public.content_items item,
      public.content_revisions revision
where tenant.slug = article.tenant_slug
  and item.owner_tenant_id = tenant.id
  and item.canonical_slug = article.slug
  and revision.content_item_id = item.id
  and revision.revision_number = 1
  and link.content_revision_id = revision.id;

with platform as (
  select id
  from public.tenants
  where slug = 'broadcast-saude-longevidade'
    and kind = 'platform'
    and is_demo = true
)
insert into public.content_revision_tags (
  content_revision_id,
  tag_id
)
select
  revision.id,
  tag.id
from editorial_articles article
join public.tenants tenant
  on tenant.slug = article.tenant_slug
join public.content_items item
  on item.owner_tenant_id = tenant.id
 and item.canonical_slug = article.slug
join public.content_revisions revision
  on revision.content_item_id = item.id
 and revision.revision_number = 1
cross join lateral jsonb_array_elements_text(article.tag_slugs) tag_slug(value)
cross join platform
join public.tags tag
  on tag.owner_tenant_id = platform.id
 and tag.slug = tag_slug.value
on conflict (content_revision_id, tag_id) do nothing;

insert into public.distributions (
  id,
  content_item_id,
  tenant_id,
  status,
  starts_at,
  channels,
  rights_code,
  contract_reference,
  allow_full_body,
  allow_media,
  created_by,
  approved_by,
  is_demo
)
select
  md5(
    'editorial-2026-07:distribution:'
    || article.code
    || ':'
    || target.slug
  )::uuid,
  item.id,
  target.id,
  'active',
  item.last_published_at,
  array['portal']::text[],
  case
    when target.slug = article.tenant_slug then 'demo-owner'
    else 'demo-cross'
  end,
  'MVP-EDITORIAL-2026-07',
  true,
  true,
  'demo-operator',
  'demo-operator',
  true
from editorial_articles article
join public.tenants owner
  on owner.slug = article.tenant_slug
join public.content_items item
  on item.owner_tenant_id = owner.id
 and item.canonical_slug = article.slug
cross join lateral (
  select article.tenant_slug as slug
  union
  select cross_slug.value
  from jsonb_array_elements_text(article.cross_tenant_slugs) cross_slug(value)
) destinations
join public.tenants target
  on target.slug = destinations.slug
 and target.kind = 'demo'
 and target.status = 'demo'
 and target.is_demo = true
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

with placement_seed (
  tenant_slug,
  slot_key,
  rank,
  code,
  presentation_variant,
  eyebrow_override
) as (
  values
    ('credito-demo-orbita', 'home.hero', 0, 'MVP-CR-005', 'hero', 'Open Finance'),
    ('credito-demo-orbita', 'home.secondary', 0, 'MVP-CR-002', 'featured', 'Empresas'),
    ('credito-demo-orbita', 'home.secondary', 1, 'MVP-CR-007', 'standard', 'Segurança'),
    ('banco-demo-horizonte', 'home.hero', 0, 'MVP-IN-020', 'hero', 'Vida longa'),
    ('banco-demo-horizonte', 'home.secondary', 0, 'MVP-IN-001', 'featured', 'Renda fixa'),
    ('banco-demo-horizonte', 'home.secondary', 1, 'MVP-IN-008', 'standard', 'Tecnologia'),
    ('seguros-demo-atlas', 'home.hero', 0, 'MVP-SE-026', 'hero', 'Novos modelos'),
    ('seguros-demo-atlas', 'home.secondary', 0, 'MVP-SE-023', 'compact', 'Saúde'),
    ('seguros-demo-atlas', 'home.secondary', 1, 'MVP-SE-028', 'compact', 'Inteligência artificial'),
    ('healthtech-demo-lumen', 'home.hero', 0, 'MVP-SA-038', 'hero', 'Inteligência artificial'),
    ('healthtech-demo-lumen', 'home.secondary', 0, 'MVP-SA-036', 'featured', 'Saúde digital'),
    ('healthtech-demo-lumen', 'home.secondary', 1, 'MVP-SA-040', 'standard', 'Longevidade')
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
    || placement.tenant_slug
    || ':'
    || placement.slot_key
    || ':'
    || placement.rank
  )::uuid,
  tenant.id,
  placement.slot_key,
  item.id,
  item.last_published_at,
  placement.rank,
  placement.presentation_variant,
  placement.eyebrow_override,
  'active',
  true
from placement_seed placement
join editorial_articles article
  on article.code = placement.code
join public.tenants owner
  on owner.slug = article.tenant_slug
join public.content_items item
  on item.owner_tenant_id = owner.id
 and item.canonical_slug = article.slug
join public.tenants tenant
  on tenant.slug = placement.tenant_slug
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
    ('banco-demo-horizonte', 'MVP-IN-020'),
    ('seguros-demo-atlas', 'MVP-SE-026'),
    ('healthtech-demo-lumen', 'MVP-SA-038')
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
join editorial_articles article
  on article.code = audit.hero_code
join public.tenants owner
  on owner.slug = article.tenant_slug
join public.content_items item
  on item.owner_tenant_id = owner.id
 and item.canonical_slug = article.slug
on conflict (id) do nothing;

commit;
