# Maleabilidade de marcas e personalização

## Princípio

White-label significa combinar configurações seguras, não liberar edição
arbitrária. A plataforma deve produzir marcas convincentes a partir da mesma
base de componentes, sem fork, rebuild ou CSS enviado pelo operador.

## Modelo de configuração

Cada experiência resulta de cinco camadas:

1. design system base;
2. preset de segmento;
3. identidade do tenant;
4. módulos e variantes aprovados;
5. conteúdo e placements daquele tenant.

Conteúdo canônico não pertence ao tema. Tema não altera autoria, corpo,
correção ou licenciamento.

O preset de segmento passa a ser um modelo de site estrutural com ID próprio,
acima da marca. Os quatro contratos aprovados estão em
`docs/22-arquitetura-visual-modelos-de-segmento.md`.

## Cadastro de marca demo

### Criar do zero controlado

Campos:

- nome da marca;
- slug sugerido e validado;
- modelo de segmento aprovado;
- slogan;
- wordmark textual ou logo em Storage;
- paleta semântica;
- tipografia aprovada;
- composição estrutural derivada do modelo;
- módulos habilitados;
- co-branding obrigatório;
- coleção editorial inicial.

### Duplicar demo

O operador escolhe uma marca de origem e informa:

- novo nome;
- novo slug;
- modelo de segmento mantido ou trocado;
- copiar tema;
- copiar placements;
- copiar apenas referências de distribuição;
- nunca duplicar o corpo canônico das matérias.

O resultado sempre nasce como `kind=demo`, `status=demo` e `is_demo=true`.

## Workbench de identidade

O editor deve oferecer:

- seletor e campo hexadecimal sincronizados;
- presets de cor por segmento;
- preview instantâneo antes de salvar;
- alternância 390/768/1440;
- home, editoria e matéria;
- estado patrocinado;
- estado sem imagem;
- desfazer mudanças não salvas;
- restaurar preset;
- aviso de alterações pendentes;
- validação client-side para orientação e server-side como autoridade.

No Ciclo 2, salvar atualiza somente a versão vigente. Histórico e rollback
continuam fora do escopo.

## Tokens configuráveis

### Marca

- nome;
- slogan;
- logo claro;
- logo escuro;
- favicon;
- co-branding;
- texto institucional curto.

### Cores

- primária;
- secundária;
- acento;
- página;
- card;
- superfície inversa;
- texto principal;
- texto secundário;
- link;
- borda;
- foco;
- patrocinado.

### Tipografia

- família de título;
- família de corpo;
- escala;
- peso de títulos;
- densidade de leitura.

### Forma e layout

- raio;
- sombra;
- densidade;
- largura máxima;
- largura da coluna de leitura.

## Variantes aprovadas

As variantes abaixo passam a ser primitives internas dos modelos. Na interface
principal, o operador escolhe um modelo coerente; não combina livremente header,
hero e card de segmentos diferentes.

| Área | Variante | Diferença estrutural obrigatória |
|---|---|---|
| Header | masthead editorial | marca à esquerda, CTA e editorias em faixa |
| Header | marca centralizada | marca central, navegação abaixo, sem CTA lateral |
| Header | mínimo científico | marca compacta, navegação reduzida e metadados |
| Hero | editorial dividido | texto e mídia em colunas equilibradas |
| Hero | grade de destaques | uma manchete principal e 2–4 secundárias |
| Hero | científico/data-led | destaque compacto, contexto e metadados |
| Card | imagem no topo | mídia, editoria, título, autor/data |
| Card | horizontal compacto | thumb lateral, alta densidade |
| Card | orientado a contexto | título, resumo, tags e metadados sem depender de imagem |

Uma variante não pode ser considerada entregue se mudar apenas cor,
alinhamento ou borda.

## Módulos opcionais

- últimas notícias;
- destaques por editoria;
- explicadores;
- branded fictício;
- coleção/dossiê;
- CTA institucional demonstrativo;
- bloco de dados futuro apenas visual, sem dados reais.

O aviso demo, labels legais/editoriais e co-branding contratual não podem ser
desabilitados.

## Validações

- slug único;
- nenhum fallback silencioso para outro tenant;
- assets com prefixo do tenant;
- MIME, tamanho, dimensões, alt, crédito e direito;
- nenhuma URL `data:` ou script;
- allowlist de fontes e variantes;
- contraste AA nas combinações realmente renderizadas;
- foco visível independente da paleta;
- zoom 200%;
- nenhuma secret no payload do navegador;
- tema inválido nunca substitui silenciosamente o tema de outro tenant.

## Critérios de aceite

- criar uma quarta marca demo sem editar código;
- duplicar uma marca sem duplicar matérias;
- visualizar mudanças antes de salvar;
- alternar as três viewports;
- persistir e recarregar o tema;
- trocar tenant sem rebuild;
- demonstrar três composições visualmente distintas;
- rejeitar token, fonte, variante ou asset não aprovado;
- registrar evento de auditoria com tenant, ator e alvo.
