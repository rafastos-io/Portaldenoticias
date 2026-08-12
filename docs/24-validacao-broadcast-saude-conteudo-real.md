# Validação Broadcast Saúde e conteúdo real autorizado

## Decisão

Em 09/08/2026, a cliente autorizou a passagem do ecossistema de saúde para uma
etapa de validação com exemplos reais. O catálogo histórico continua no banco,
mas deixa de ser a seleção publicada das marcas de saúde.

## Marcas e roteamento

- `abrafarma`: preserva o tenant e a identidade já existentes, passa a ser o
  portal padrão;
- `broadcast-saude`: nova marca, com tema próprio e modelo `health-pharma`;
- ambas recebem as mesmas matérias canônicas por distribuição, sem duplicação;
- a matéria `ia-saude-segunda-leitura` permanece publicada como hero;
- as demais matérias anteriores do setor ficam em rascunho, sem exclusão.

## Editorias promovidas

1. Empresas
2. M&A
3. RelGov
4. Investimentos
5. Regulação
6. Pesquisa
7. Tecnologia e Inovação
8. Análise
9. Radar da Imprensa

A matéria de inteligência artificial preservada foi reclassificada como
`Tecnologia e Inovação` (slug estável `ti`) para que a navegação use apenas
a nova taxonomia sem quebrar URLs existentes.

## Contrato editorial

- Títulos e textos fornecidos devem ser preservados, sem reescrita ou mudança
  de sentido.
- São permitidos apenas ajustes mecânicos, como espaços e separação de autoria.
- Campos ausentes podem ser inferidos com cautela, deixando essa origem
  registrada em `body_json.editorial_origin`.
- O catálogo contém 17 pautas únicas: as 16 pautas iniciais e a análise
  `revolucao-canetas-emagrecedoras`, autorizada em 12/08/2026. A matéria da
  Bayer, repetida no DOCX, é consolidada em um único conteúdo canônico.
- Quatorze pautas possuem o trecho integral autorizado fornecido.
- Três pautas da Viva são `external_only`: não armazenam corpo reproduzido e
  encaminham o leitor à fonte original.
- O ambiente continua com `is_demo = true` por restrição estrutural do MVP e
  permanece `noindex`; isso descreve o ambiente, não a natureza factual do
  conteúdo.

## Procedência persistida

Cada pauta real usa `editorial_origin.kind = authorized-real` e registra, quando
disponível:

- `source_label`;
- `source_url` HTTPS;
- `source_published_at`;
- `external_only`;
- `briefing_order`;
- `authorization_reference`.

As distribuições usam `rights_code = authorized-real`. O catálogo inicial usa a
referência contratual `CLIENTE-VALIDACAO-2026-08-09`; a nova análise usa
`CLIENTE-VALIDACAO-2026-08-12`.

## Ticker setorial

O ticker de saúde usa símbolos B3 verificados:

| Empresa | Símbolo |
| --- | --- |
| Rede D’Or | RDOR3 |
| Fleury | FLRY3 |
| Hapvida | HAPV3 |
| Mater Dei | MATD3 |
| Dasa | DASA3 |
| Oncoclínicas | ONCO3 |
| Qualicorp | QUAL3 |
| BradSaúde | SAUD3 |
| OdontoPrev | ODPV3 → SAUD3, integrada à BradSaúde |

As cotações vêm da brapi somente quando `BRAPI_API_TOKEN` está configurado no
servidor. Sem token, a interface exibe os símbolos e informa que a cotação está
indisponível; preços estáticos ou inventados são proibidos.

## Critérios de QA

- 18 conteúdos ativos por marca: 17 reais autorizados e o hero de IA preservado;
- nove editorias reais presentes nas duas marcas;
- uma única matéria da Bayer;
- três referências externas sem corpo copiado;
- textos críticos comparados ao material de origem em UTF-8;
- fallback do ticker sem preço fictício;
- validação desktop e mobile, isolamento de tenant, lint, tipos, testes e build.
