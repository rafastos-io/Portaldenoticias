# Arquitetura visual dos modelos de segmento

Data: 27/07/2026.

## Decisão

A experiência pública passa a ter uma camada estrutural explícita acima da
marca:

```text
design system base
  -> modelo de site do segmento
    -> identidade da marca/tenant
      -> conteúdo e placements
```

O modelo de site define a linguagem editorial, a hierarquia, a densidade, a
composição das páginas e o comportamento dos módulos. A marca define nome,
logo, slogan, cores, tipografia aprovada e pequenos ajustes de densidade.

Trocar a marca não cria outra aplicação. Trocar o modelo não cria um fork. A
mesma aplicação resolve o tenant, carrega o modelo escolhido e combina suas
regras com os tokens daquela marca.

## Resultado comercial esperado

Uma pessoa que veja as quatro homes sem logo e em escala de cinza ainda deve
reconhecer quatro produtos editoriais diferentes.

Os quatro modelos aprovados são:

| ID estável | Segmento | Promessa visual |
|---|---|---|
| `financial-services-credit` | Serviços financeiros e crédito | clareza, utilidade e decisão prática |
| `investments-asset-management` | Investimentos e gestão de recursos | inteligência, profundidade e leitura de cenário |
| `insurance-pension` | Seguros e previdência | proteção, planejamento e fases da vida |
| `health-pharma` | Saúde e indústria farmacêutica | evidência, precisão e inovação científica |

## Escopo desta rodada

Incluído:

- shell público;
- header, navegação e footer;
- home;
- página de editoria;
- página de matéria;
- hierarquia, grade, ritmo, densidade, formato de mídia e cards;
- seletor do modelo no cadastro/edição de marca;
- preview do modelo com a identidade do tenant;
- compatibilidade com os tenants demonstrativos existentes.

Não incluído:

- novas matérias, editorias, tags ou taxonomias;
- revisão da matriz editorial;
- dashboards ou ferramentas financeiras reais;
- recomendação médica ou financeira;
- page builder;
- CSS, JavaScript ou HTML arbitrário;
- uma aplicação, banco ou deploy por marca;
- API comercial, autenticação real ou integrações novas.

O arquivo `matriz_editorial_portais.md` é referência de contexto. Seus temas e
categorias serão tratados em outra rodada.

## Benchmark de linguagem visual

As referências abaixo orientam padrões, não autorizam cópia de identidade,
layout, código, marca ou conteúdo.

### Serviços financeiros e crédito

- [NerdWallet](https://www.nerdwallet.com/) combina uma tarefa central direta,
  atalhos por necessidade, comparações, orientação e notícias.
- Sinal aproveitável: o leitor chega para resolver uma decisão concreta; a
  navegação deve privilegiar verbos, necessidades e utilidade.

### Investimentos e gestão

- [J.P. Morgan Asset Management — Insights](https://am.jpmorgan.com/us/en/asset-management/adv/insights/)
  combina filtros temáticos, conteúdo em alta frequência, autoria, data,
  guias e recursos de análise.
- Sinal aproveitável: o leitor quer construir uma visão de cenário e espera
  densidade, recência, metadados e autoridade.

### Seguros e previdência

- [Prudential — Financial Education](https://www.prudential.com/financial-education)
  organiza a experiência por objetivos, proteção, acontecimentos de vida e
  planejamento.
- [Swiss Re Institute](https://www.swissre.com/institute/) mostra como risco,
  pesquisa e impacto podem conviver em uma experiência institucional.
- Sinal aproveitável: o assunto deve ser humano e orientado a jornadas, sem
  explorar medo, urgência artificial ou imagens de vulnerabilidade.

### Saúde e indústria farmacêutica

- [Roche — Stories](https://www.roche.com/stories) separa ciência, pacientes,
  parcerias e sociedade, usando grandes áreas de respiro, filtros e imagens
  com forte direção editorial.
- Sinal aproveitável: confiança nasce de clareza, procedência, organização de
  evidências e uma relação responsável entre ciência e pessoas.

## Eixos obrigatórios de diferenciação

Cor e fonte não contam como diferença estrutural. Cada modelo deve divergir em
ao menos seis dos oito eixos:

| Eixo | Crédito | Investimentos | Seguros | Saúde/farma |
|---|---|---|---|---|
| Entrada da home | tarefa/necessidade | leitura de cenário | fase da vida | descoberta/evidência |
| Densidade | média | alta | média-baixa | média |
| Hero | utilitário dividido | manchete + rail analítico | narrativa acolhedora | briefing científico |
| Cards | serviços e explicadores | lista densa e dados | jornadas e guias | contexto e metadados |
| Imagem | cotidiano financeiro | executivos, economia e abstrações | pessoas e relações | pesquisa, tecnologia e cuidado |
| Forma | modular, raio moderado | linhas, pouco raio | superfícies suaves | grade precisa |
| Navegação | necessidades | classes/temas/insights | objetivos e fases | ciência/inovação/regulação |
| Ritmo | ação rápida | varredura contínua | leitura guiada | leitura investigativa |

## Modelo 1 — Serviços financeiros e crédito

### Intenção

Fazer o leitor sentir que consegue entender uma opção, comparar caminhos e
seguir para a próxima decisão com segurança.

### Assinatura visual

- aparência de central editorial de serviços;
- densidade média e leitura muito escaneável;
- tipografia sans de alta legibilidade;
- superfícies claras com blocos modulares;
- cantos moderados, ícones aprovados e estados de interação explícitos;
- fotografia de vida cotidiana, comércio, trabalho e uso de serviços;
- evitar estética de “terminal de bolsa”.

### Header e navegação

- barra superior compacta com marca, busca visual e atalho institucional;
- navegação por necessidades: Crédito, Empresas, Moradia, Pagamentos,
  Segurança e Planejamento;
- no mobile, menu explícito; não depender de uma faixa horizontal sem sinal.

### Home

1. hero dividido entre matéria principal e painel de atalhos editoriais;
2. trilha “Entenda antes de decidir” com explicadores;
3. grade de temas de serviço;
4. alerta editorial de segurança/fraudes quando houver placement;
5. lista de últimas notícias;
6. bloco transversal de longevidade e inclusão 50+.

### Cards

- card de atalho curto;
- card de explicador com resumo e tempo de leitura;
- card horizontal de notícia;
- alerta de segurança com tratamento semântico próprio;
- mídia em `4:3` ou `16:10`, sem dominar a página.

### Editorias e matérias

- editoria começa com definição curta do tema e grade de subtemas;
- matéria mantém coluna de leitura confortável e box lateral ou inline de
  contexto;
- chamadas para outras leituras usam linguagem informativa, não comercial.

### Teste de identidade

Sem cor e sem logo, o painel de atalhos, a organização por necessidade e os
cards utilitários ainda precisam distinguir este modelo.

## Modelo 2 — Investimentos e gestão de recursos

### Intenção

Transmitir capacidade de interpretar cenário, conectar variáveis e apoiar
decisões informadas sem parecer recomendação individual de investimento.

### Assinatura visual

- aparência de publicação premium de inteligência de mercado;
- maior densidade entre os quatro modelos;
- títulos editoriais fortes combinados com sans para dados e metadados;
- linhas, divisórias e alinhamentos precisos;
- pouco raio e pouca sombra;
- contraste entre superfícies claras e blocos inversos;
- fotografia econômica, corporativa e abstrata, além de gráficos somente
  quando houver fonte e dado válidos.

### Header e navegação

- masthead editorial horizontal;
- faixa de mercado é contextual e secundária, nunca o único elemento que
  diferencia o modelo;
- navegação por classes e perspectivas: Mercados, Renda Fixa, Renda Variável,
  Fundos, Alternativos, Patrimônio e Longevidade.

### Home

1. hero assimétrico com manchete principal e rail de três insights;
2. faixa curta de cenário/mercados com fonte e data;
3. lista densa “Análises recentes”;
4. dossiê ou guia de longo prazo;
5. grade de classes de ativos;
6. bloco de planejamento patrimonial e sucessório.

### Cards

- linha de análise com autor, data e tema;
- card de relatório/guia;
- card de cenário com resumo mais longo;
- item numerado ou data-led;
- imagens com proporções panorâmicas ou retratos editoriais controlados.

### Editorias e matérias

- editoria funciona como índice de pesquisa, com filtros visuais e alta
  densidade;
- matéria exibe categoria, autoria, data e nota de contexto antes do corpo;
- boxes de “Pontos-chave” e “O que está em jogo” podem ser renderizados apenas
  quando os dados já existirem no conteúdo.

### Teste de identidade

Sem cor, o rail analítico, as divisórias, a densidade e a hierarquia de
metadados devem lembrar uma publicação de inteligência, não um banco de varejo.

## Modelo 3 — Seguros e previdência

### Intenção

Comunicar proteção e planejamento de forma humana, clara e contínua ao longo da
vida, sem usar medo como mecanismo de conversão.

### Assinatura visual

- aparência de guia editorial de proteção e longevidade;
- maior respiro e ritmo mais calmo;
- tipografia humana, títulos acolhedores e textos confortáveis;
- superfícies suaves, raio maior e divisórias discretas;
- fotografia de pessoas reais, famílias diversas, trabalho, cuidado e
  autonomia;
- evitar clichês de escudo, mãos protegendo objetos ou idosos fragilizados.

### Header e navegação

- marca com presença central ou ampla;
- navegação por objetivos: Proteger renda, Planejar aposentadoria, Cuidar da
  saúde, Família e sucessão, Empresas e Longevidade;
- CTA institucional discreto pode existir, sem competir com a leitura.

### Home

1. hero narrativo com imagem humana e chamada principal;
2. trilha visual de fases/objetivos de vida;
3. explicadores em cards amplos;
4. bloco de prevenção e autonomia;
5. histórias e análises;
6. guia de planejamento sucessório e patrimonial.

### Cards

- card de jornada ou objetivo;
- card de explicador com linguagem simples;
- card editorial com imagem horizontal;
- lista “Próximos passos de leitura”;
- metadados visíveis, mas menos dominantes do que em investimentos.

### Editorias e matérias

- editoria abre com perguntas que o leitor pode reconhecer;
- matéria usa coluna ampla, intertítulos claros e boxes de definição;
- navegação relacionada segue objetivos e fases da vida.

### Teste de identidade

Sem cor, a trilha de fases da vida, as superfícies suaves e o ritmo mais
acolhedor devem separar este modelo dos outros três.

## Modelo 4 — Saúde e indústria farmacêutica

### Intenção

Dar clareza a ciência, pesquisa, regulação e inovação, preservando precisão,
procedência e legibilidade para públicos de negócio.

### Assinatura visual

- aparência de briefing científico contemporâneo;
- grade modular precisa e bastante espaço negativo;
- tipografia sans ou combinação editorial de alta legibilidade;
- bordas finas, chips semânticos e metadados estruturados;
- imagens de pesquisa, tecnologia médica, equipes e pessoas com tratamento
  documental;
- evitar cruz médica genérica, DNA decorativo sem contexto ou estética de
  ficção científica.

### Header e navegação

- masthead mínimo e técnico;
- navegação por campos: Indústria farmacêutica, Biotecnologia, Pesquisa,
  Inovação médica, Saúde digital, Regulação e Longevidade;
- utilidades e metadados nunca podem parecer alegação clínica.

### Home

1. hero de briefing com matéria principal, imagem e faixa de contexto;
2. grade “Pesquisa e inovação”;
3. lista de atualizações regulatórias;
4. cards de ciência explicada;
5. bloco de economia e financiamento da saúde;
6. dossiê de longevidade e envelhecimento saudável.

### Cards

- card orientado a contexto, com tema, resumo e metadados;
- card de pesquisa/explicador;
- card de atualização regulatória;
- card visual de inovação;
- chips indicam tipo editorial, nunca eficácia ou estágio clínico inventado.

### Editorias e matérias

- editoria começa com escopo e filtros visuais por campo;
- matéria reforça autoria, data, correção e fontes quando disponíveis;
- boxes de evidência só aparecem com dado editorial estruturado;
- nenhum componente deve inferir estudo, resultado clínico ou instituição.

### Teste de identidade

Sem cor, a grade de briefing, os metadados estruturados e o espaço negativo
devem diferenciar este modelo de investimentos.

## Conteúdos transversais sem homogeneizar os modelos

Longevidade, tecnologia/IA e planejamento financeiro atravessam os quatro
segmentos. A pauta pode ser compartilhada, mas sua apresentação respeita o
modelo:

| Tema | Crédito | Investimentos | Seguros | Saúde/farma |
|---|---|---|---|---|
| Longevidade | inclusão e acesso | renda e patrimônio | proteção por fases | prevenção e envelhecimento |
| Tecnologia/IA | análise, atendimento e fraude | pesquisa e alocação | risco e sinistros | diagnóstico, dados e pesquisa |
| Planejamento | orçamento e crédito | acumulação e sucessão | renda, proteção e herança | custo e financiamento da saúde |

Uma mesma matéria canônica pode receber headline, placement e tratamento
visual adequados ao tenant sem duplicar o corpo.

## Contrato técnico recomendado

### Identificador do modelo

O ID do modelo deve ser uma allowlist versionada em código:

```ts
type SiteModelId =
  | "financial-services-credit"
  | "investments-asset-management"
  | "insurance-pension"
  | "health-pharma";
```

### Persistência

No recorte atual, persistir o ID em `theme_versions.components_json.site_model`
é suficiente. Não criar uma tabela ou serviço novo sem necessidade.

Exemplo:

```json
{
  "site_model": "insurance-pension",
  "schema_version": 2
}
```

O servidor valida o ID antes de renderizar. Valor ausente pode usar uma
migração de compatibilidade explícita; valor inválido falha fechado. Nunca usar
o modelo de outro tenant como fallback.

### Registro de modelos

Cada modelo possui um descritor único:

```ts
type SiteModelDefinition = {
  id: SiteModelId;
  label: string;
  description: string;
  composition: {
    header: string;
    home: string;
    category: string;
    article: string;
    footer: string;
  };
  defaults: {
    density: string;
    radius: string;
    imageTreatment: string;
    headingScale: string;
  };
};
```

O descritor determina composições aprovadas. O operador não mistura livremente
header, hero e card de modelos diferentes nesta rodada.

### Compatibilidade inicial

Mapeamento recomendado:

| Tenant demonstrativo | Modelo |
|---|---|
| Banco Demo Horizonte | `investments-asset-management` |
| Seguros Demo Atlas | `insurance-pension` |
| Healthtech Demo Lúmen | `health-pharma` |
| nova quarta marca demo | `financial-services-credit` |

A quarta marca pode reutilizar referências de distribuição existentes. Não
criar ou duplicar matérias para demonstrá-la.

## Componentização

Compartilhar:

- resolução de tenant e tema;
- contratos de conteúdo;
- links, imagem, metadados e labels;
- primitives de container, seção, card e lista;
- estados vazio, erro, loading e sem imagem;
- acessibilidade e tokens seguros.

Variar por modelo:

- ordem e proporção das regiões;
- header e navegação;
- composição do hero;
- densidade e tipos de cards;
- tratamento de editorias;
- estrutura de matéria;
- footer;
- ritmo, forma e tratamento de mídia.

Não criar quatro árvores de rotas nem quatro cópias de componentes completos.
Preferir composições pequenas e nomeadas sobre condicionais extensos em um
único arquivo.

## Guardrails visuais

- WCAG AA nas combinações renderizadas;
- foco visível independente da paleta;
- zoom de 200%;
- `prefers-reduced-motion`;
- um `h1` por página;
- nenhum conteúdo essencial escondido por animação;
- nenhuma rolagem horizontal global;
- mobile com menu ou indicação explícita de navegação;
- imagens fictícias, próprias ou licenciadas, com alt e crédito;
- nenhum texto de interface que sugira aconselhamento individual;
- nenhum dado, gráfico ou indicador inventado para preencher layout.

## Critérios de aceite visual

1. Os quatro modelos usam a mesma aplicação e o mesmo conteúdo canônico.
2. A marca escolhe um modelo por ID aprovado.
3. A troca acontece sem rebuild.
4. Home, editoria e matéria respeitam o modelo.
5. As quatro homes continuam distinguíveis em escala de cinza e sem logo.
6. Cor, fonte ou alinhamento isolados não contam como distinção.
7. O modelo persiste e recarrega no preview e no portal.
8. Tenant inválido ou modelo inválido falha fechado.
9. Não há matéria nova nem alteração de taxonomia nesta rodada.
