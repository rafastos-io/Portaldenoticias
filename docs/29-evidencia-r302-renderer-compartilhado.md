# Evidência R302 — renderer compartilhado no preview

Data: 31/08/2026
Branch: `codex/revisao-estrutural-nova-frente`

## Objetivo e limite operacional

O R302 elimina a possibilidade de o ADM aprovar um layout diferente daquele
que o portal efetivamente renderiza. A entrega foi executada somente na branch
local: não houve escrita no Supabase, deploy, promoção de Preview ou alteração
de Production.

## Arquitetura resultante

`PublicPortalRenderer` é a fronteira comum para as três superfícies editoriais:

1. a home pública entrega hero, stories e cotações ao renderer;
2. a editoria pública entrega nome e lista filtrada ao mesmo renderer;
3. a matéria pública entrega a story ao mesmo renderer;
4. o preview administrativo monta fixtures tipadas e entrega os mesmos props.

O `PublicShell`, o cabeçalho, o rodapé e os componentes
`SiteModelHome/Category/Article` continuam sendo os componentes reais do portal.
Não existe mais JSX alternativo para imitar cabeçalho, hero, cards ou matéria.

## Viewport real e alterações pendentes

Uma simples caixa com largura reduzida não aciona media queries de viewport. Por
isso, o preview passou a usar um iframe same-origin com 390, 768 ou 1440 px de
largura real. A rota `/admin/portal-preview` revalida a sessão demo no servidor
e não carrega o shell do ADM.

O formulário envia somente um contrato versionado contendo página, tenant e
tema pendente. O receptor aceita a mensagem apenas quando a origin coincide com
a aplicação e `event.source` é a janela pai. Logo, trocar nome, slogan, paleta,
tipografia, modelo ou logo continua aparecendo antes de salvar, sem tocar o
banco.

Separar a moldura do iframe da superfície renderizada também evita incluir os
quatro modelos no bundle principal do formulário; eles são carregados na rota
isolada que efetivamente os utiliza.

## Estados cobertos

- fixture padrão com os três contrastes exigidos em pelo menos 4,5:1;
- story sem imagem misturada ao catálogo demonstrativo;
- modelo desconhecido rejeitado antes de acessar o registro React;
- iframe sem payload apresenta carregamento explícito;
- mensagem inválida apresenta erro explícito;
- rota do iframe sem sessão redireciona para o login.

## Evidência automatizada

### Contrato e regressão

- `public-renderer-parity.test.ts` verifica que as três rotas públicas usam
  `PublicPortalRenderer`, que o preview também o usa e que os quatro componentes
  paralelos não voltam ao workbench;
- `portal-preview.test.ts` cobre mensagem válida, modelo inválido, fixture sem
  imagem, contraste e ordem do gate de sessão;
- TypeScript estrito valida a união discriminada de home, editoria e matéria.

### Navegador local

`scripts/verify-r302-preview.mjs` autentica no ADM, altera o nome da marca sem
salvar e atravessa:

| Página | 390 px | 768 px | 1440 px |
|---|---:|---:|---:|
| Home | aprovado | aprovado | aprovado |
| Editoria | aprovado | aprovado | aprovado |
| Matéria | aprovado | aprovado | aprovado |

Em cada combinação o teste confirma a largura física do iframe, o nome pendente,
o heading da superfície pública e ausência do overlay de erro do Next. A coleta
de `pageerror` e console terminou vazia.

O smoke administrativo separado aprovou 13 passos: login inválido, sessão 401,
Origin externa recusada, login válido, sessão 200, cookie adulterado recusado,
restabelecimento, reload, navegação entre Conteúdo/Identidades/Auditoria,
logout e novo bloqueio.

## Gate final

- lint: aprovado;
- tipos e tipos estritos: aprovados;
- testes: aprovados;
- build de produção com a nova rota autenticada: aprovado;
- `git diff --check`: aprovado;
- banco e ambientes remotos: não alterados.

## Próxima ação

R303 pode começar. Ele deve reconciliar primeiro o histórico de migrations e,
depois, centralizar definição, componentes e allowlist de `site_model`. R304,
R305 e o quinto modelo permanecem bloqueados pela sequência registrada em
`TASKS.md`.
