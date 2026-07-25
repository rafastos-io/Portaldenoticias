# Visão do produto

## Resumo executivo

Broadcast Saúde & Longevidade será uma plataforma editorial B2B que produz, organiza, personaliza e distribui conteúdo jornalístico sobre saúde, longevidade e economia. Seu diferencial não será apenas a qualidade das matérias, mas a capacidade de transformar uma redação central em vários produtos comerciais sem criar operações paralelas.

O sistema deve permitir que a equipe publique conteúdo uma vez e o entregue em experiências diferentes:

- portal da própria vertical;
- hubs temáticos de clientes;
- portais white-label completos;
- previews comerciais realistas;
- feeds e APIs para integração em portais existentes;
- futuros newsletters, widgets e produtos de dados.

## Problema

Os desafios atuais são simultaneamente editoriais, comerciais e técnicos:

- notícias são voláteis e precisam ser cadastradas, corrigidas, pausadas, agendadas e republicadas com rapidez;
- conteúdo de saúde exige mais rastreabilidade e cuidado do que uma publicação genérica;
- cada cliente potencial deseja visualizar sua própria marca e contexto;
- copiar um portal para cada cliente aumenta custo, inconsistência e risco;
- vender matérias e dados requer controle de licenciamento, janela de distribuição e acesso;
- mobile, SEO, performance e acessibilidade não podem ser remendos posteriores.

## Oportunidade

O aumento da expectativa de vida cria pautas que atravessam:

- medicina preventiva e inovação médica;
- biotecnologia, medicamentos e dispositivos;
- saúde pública, suplementar e corporativa;
- seguros, previdência e gestão de patrimônio;
- consumo 50+ e economia prateada;
- carreira, empresas multigeracionais e produtividade;
- crédito, moradia, mobilidade e cidades;
- impactos fiscais, atuariais e macroeconômicos.

Essa amplitude permite uma cobertura jornalística relevante para o leitor e, ao mesmo tempo, produtos comerciais para instituições financeiras e organizações de saúde.

## Proposta de valor

### Para a redação

Publicar com velocidade, revisão, rastreabilidade e reaproveitamento multicanal.

### Para a área comercial

Criar uma demonstração convincente com a identidade do prospect em minutos, sem abrir um novo projeto técnico.

### Para o cliente

Receber conteúdo especializado em um formato compatível com sua marca, canal e contrato.

### Para o leitor

Acessar jornalismo claro, confiável, útil e transparente sobre saúde, longevidade e seus efeitos econômicos.

## Os três produtos do MVP

### 1. Portal editorial

Experiência pública e responsiva, com home, editorias, busca e página de matéria. Ela se torna indexável apenas quando houver conteúdo real aprovado; o MVP-0 fictício usa `noindex, nofollow`.

### 2. Studio white-label

Central interna para criar clientes, configurar marca, escolher módulos, visualizar desktop/mobile, gerar link de preview e publicar uma versão de tema.

### 3. Distribuição B2B

Feed/API autenticado por cliente, com seleção editorial, metadados, direitos, janela de disponibilidade e observabilidade básica de consumo.

## Recorte MVP-0

Para chegar rapidamente a uma demonstração vendável, o primeiro ciclo implementa integralmente os produtos 1 e 2. O produto 3 será apenas representado por uma rota JSON demonstrativa e pelo modelo de dados; autenticação comercial, credenciais e SLAs ficam para o ciclo seguinte.

Todos os dados do MVP-0 serão fictícios e marcados como demonstração. Nenhum conteúdo clínico, financeiro ou institucional deve parecer uma afirmação real atribuída à Broadcast ou a terceiros.

## Posicionamento

Uma formulação inicial:

> Inteligência jornalística sobre saúde e longevidade, pronta para informar públicos e alimentar produtos digitais.

O produto não deve se posicionar como:

- aconselhamento médico;
- recomendação individual de investimento;
- prontuário ou plataforma assistencial;
- agregador automático sem curadoria;
- construtor genérico de sites.

## Pilares editoriais iniciais

1. Saúde & Mercado Financeiro.
2. Longevidade & Economia.
3. Inovação Médica & Biotecnologia.
4. Previdência, Seguros & Patrimônio.
5. Saúde Pública & Regulação.
6. Trabalho, Carreira & Gerações.
7. Consumo 50+ & Sociedade.

As editorias devem ser configuráveis. A lista acima é uma taxonomia inicial, não código fixo.

## Princípios do produto

### Conteúdo canônico, distribuição variável

Texto, autoria, fontes e correções pertencem à matéria central. Cliente, destaque, chamada, janela e tema pertencem à distribuição.

### Multi-tenant de verdade

Clientes compartilham a plataforma, mas não permissões, segredos, analytics privados ou configurações.

### White-label sem caos

Flexibilidade será dada por tokens, variantes e módulos aprovados, não por CSS arbitrário.

### Preview é um produto comercial

O preview precisa parecer real, ser rápido de preparar, funcionar no celular e ter expiração/revogação.

### Saúde exige procedência

Fonte primária, data, responsável editorial, conflitos de interesse, revisão e histórico de correção devem ser tratáveis como dados.

### Operação antes da automação

No MVP, o fluxo manual deve ser excelente. Importações e IA só entram onde reduzem trabalho sem remover controle humano.

## Hipótese principal

Se a Broadcast conseguir demonstrar e ativar um portal/feed personalizado com baixo esforço operacional, então poderá validar demanda e encurtar o ciclo de vendas antes de investir em integrações, automações e produtos de dados mais complexos.

## Norte de longo prazo

Evoluir de “portal de notícias configurável” para uma infraestrutura vertical de conteúdo e inteligência, capaz de entregar:

- jornalismo em tempo real;
- bases e séries de dados setoriais;
- gráficos e widgets incorporáveis;
- alertas e newsletters;
- curadoria por cliente;
- inteligência sobre tendências;
- distribuição em múltiplos idiomas e mercados.
