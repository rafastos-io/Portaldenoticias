# Design QA — ticker, editorias e rodapé

Data: 27/07/2026  
Estado avaliado: home pública do tenant Banco Demo Horizonte.

## Fonte de verdade

- Ticker de mercado: `C:\Users\rafaa\AppData\Local\Temp\codex-clipboard-19d1dc18-78fd-4ac7-b7ea-c3fa42f03f51.png`
- Organização de editorias: `C:\Users\rafaa\AppData\Local\Temp\codex-clipboard-7573fc65-d4a8-418b-a443-790c03b8d3ff.png`
- As referências orientam densidade e estrutura. Marca, paleta, tipografia, conteúdo e imagens permanecem próprios do portal white-label.

## Evidências da implementação

- Comparação lado a lado: `artifacts/c230-market-categories-footer-2026-07-27/design-comparison.png`
- Desktop, topo: `artifacts/c230-market-categories-footer-2026-07-27/home-desktop-top.png`
- Desktop, editorias: `artifacts/c230-market-categories-footer-2026-07-27/home-desktop-categories.png`
- Desktop, rodapé: `artifacts/c230-market-categories-footer-2026-07-27/home-desktop-footer.png`
- Mobile, topo: `artifacts/c230-market-categories-footer-2026-07-27/home-mobile-top.png`
- Mobile, editorias: `artifacts/c230-market-categories-footer-2026-07-27/home-mobile-categories.png`
- Mobile, rodapé: `artifacts/c230-market-categories-footer-2026-07-27/home-mobile-footer.png`

## Viewports e densidade

- Desktop: 1440 × 1000.
- Mobile: 390 × 844.
- Estado: conteúdo persistido carregado, imagens completas e cotações disponíveis.
- Sem overflow horizontal em ambos os viewports.

## Comparação

### Tipografia, espaçamento e cor

- A hierarquia editorial existente foi preservada: títulos serifados, navegação e metadados em sans.
- O ticker adota a densidade contínua da referência, mas usa os tokens escuros da marca em vez do fundo branco da CNN.
- As editorias usam três colunas, título de seção, matéria dominante e chamadas compactas. Uma única cor de destaque preserva a identidade white-label em vez da codificação multicolorida da referência.
- O rodapé cria uma camada institucional distinta, com respiro, três grupos de navegação e fechamento legal.

### Imagens e conteúdo

- Foram reutilizadas apenas imagens fictícias do catálogo editorial aprovado.
- Não há logos, marcas, textos ou ativos copiados das referências.
- Editorias com menos matérias mantêm a estrutura e oferecem um link explícito “Mais de…”, sem inventar conteúdo.

### Interação e acessibilidade

- O ticker contém 10 ativos antes da cópia necessária ao loop visual.
- A animação é contínua, pausa em foco e hover e é removida com `prefers-reduced-motion`.
- A faixa focável possui nome acessível e descrição de fonte/limitação.
- Imagens renderizadas: zero quebradas; erros de console: zero.
- Navegação, editorias e rodapé permanecem utilizáveis em 390 px.

## Histórico de achados

1. P2 — colunas com pouco conteúdo pareciam incompletas. Corrigido com link de continuidade por editoria.
2. P2 — região focável do ticker não tinha nome específico. Corrigido com `aria-label`.
3. P2 — captura full-page do navegador embutido repetia trechos durante a composição. Evidência descartada e substituída por capturas focadas por viewport.

## Resultado

passed
