# C203 — baseline visual e funcional de Production

Data da captura: 26/07/2026.

## Ambiente verificado

- URL pública: `https://portaldenoticias-five.vercel.app`
- deployment: `dpl_67pSeiwLcm2bEFR1Zsxd1HmqNpzH`
- commit publicado: `eb050280f593a1a33e68d9f6a2cd75d77304374a`
- viewports: `390 x 844` e `1440 x 900`
- browser real: Chromium/Chrome via Playwright
- smoke C202 aprovado:
  `artifacts/smoke-admin/2026-07-26T16-21-02-071Z-portaldenoticias-five.vercel.app/report.json`

A sessão demonstrativa foi usada apenas em memória. Os campos do login foram
limpos antes das capturas para não registrar credenciais nas evidências.

## Matriz 8/8

| Superfície | 390 x 844 | 1440 x 900 | HTTP | H1 | Aviso demo | Overflow da página |
|---|---|---|---:|---:|---:|---:|
| Home | [PNG](home-390x844.png) | [PNG](home-1440x900.png) | 200 | 1 | presente | não |
| Login | [PNG](login-390x844.png) | [PNG](login-1440x900.png) | 200 | 1 | presente | não |
| Conteúdo | [PNG](conteudo-390x844.png) | [PNG](conteudo-1440x900.png) | 200 | 1 | presente | não |
| Identidades | [PNG](identidades-390x844.png) | [PNG](identidades-1440x900.png) | 200 | 1 | presente | não |

As oito páginas também apresentaram `noindex, nofollow`. Não houve exceção
`pageerror` nem resposta HTTP >= 400 correlacionada às superfícies capturadas.

## Correção da evidência da Home

As duas Homes foram recapturadas porque a evidência original congelou
`hero-rise` durante os delays de 80/140/200 ms. A nova captura usa
`prefers-reduced-motion: reduce` e só ocorre depois de confirmar `h1`,
subtítulo e botão com `opacity: 1`, dimensões positivas, visibilidade normal e
zero animações em execução.

O título está legível nos dois viewports e o contraste final medido é 12,36:1.
Portanto, o P1 anteriormente atribuído ao hero/C212 era um falso positivo de
timing e foi removido. Nenhuma alteração de produto foi necessária.

## Achados

### P0

Nenhum P0 encontrado. Login, sessão, rotas protegidas e logout passaram no
smoke Production, e as oito superfícies responderam 200.

### P1 — previews de Identidades em branco → C211

Nos dois viewports, os quadros `Desktop - 1440 px` e `Mobile - 390 px` aparecem
em branco. Os iframes carregam DOM, mas o `h1` permanece oculto e cada frame
expõe somente 31 caracteres de texto visível. O problema impede avaliar a
identidade salva na própria central white-label.

O console repete `Blocked script execution ... frame is sandboxed and the
'allow-scripts' permission is not set`. O sandbox sem scripts é uma defesa
intencional e não deve ser simplesmente enfraquecido; o defeito é a ausência de
fallback visual sem JavaScript. A correção pertence ao workbench/preview vivo
de `C211`, preservando o sandbox seguro.

### P2 — tabela móvel visualmente truncada → C230

Em `Conteúdo` a 390 px, a página não tem overflow horizontal global, mas a
tabela interna ultrapassa o contêiner visível. Títulos são cortados à direita e
as colunas de status/ações ficam fora da captura, sem indicação visual clara de
que há conteúdo horizontal adicional.

O fluxo continua acessível por rolagem contida, portanto não bloqueia a
baseline. A indicação de rolagem ou apresentação móvel alternativa deve ser
tratada em `C230`.

### P2 — tenant inexistente produz soft 404 → C240

O teste adversarial com tenant inexistente renderiza corretamente a superfície
visual de 404 e não entrega conteúdo de outro tenant, mas a resposta HTTP final
é 200 por causa do streaming do App Router. O estado continua com
`noindex, nofollow`, porém a semântica HTTP pode confundir monitoramento,
integrações e diagnóstico operacional. Destino: matriz final de QA `C240`.

### P2 — navegação editorial móvel sem affordance clara → C230

Na Home a 390 px, a faixa de editorias corta itens à direita. A navegação
horizontal existe, mas a captura não apresenta indicação clara de continuidade
ou rolagem. O conteúdo principal permanece acessível e não há overflow global;
o ajuste de affordance deve acompanhar a navegação mobile de `C230`.

## Isolamento básico aprovado

- os três tenants demonstrativos foram percorridos sem conteúdo estrangeiro;
- a API demonstrativa retornou os catálogos isolados esperados: `10 / 10 / 9`;
- sessão ausente e cookie adulterado retornaram 401;
- acesso anônimo direto a `/admin` foi bloqueado sem expor conteúdo editorial.

## Sinais de console

1. **Identidades — explicado e acionável:** mensagens repetidas de script
   bloqueado pelo sandbox. Elas correspondem diretamente aos previews em branco
   e estão incluídas no P1 de `C211`.
2. **Home/login mobile — intermitente e não correlacionado:** uma execução
   registrou `Failed to load resource: the server responded with a status of
   404`, mas o sinal alternou entre Home e Login nas repetições, sem
   `response >= 400` capturada, sem erro de runtime e sem recurso visual ausente
   identificado. Fica como observação não bloqueante para monitoramento, sem
   abrir P0/P1 por inferência.

## Parecer

Baseline aprovada com zero P0. O P1 restante tem tarefa e dono explícito
(`C211`). Os P2 estão mapeados para `C230` e `C240`. O antigo P1 do hero foi
removido depois da recaptura em estado settled. Nenhuma melhoria foi
implementada nesta tarefa.
