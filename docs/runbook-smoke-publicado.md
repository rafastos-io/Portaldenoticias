# Smoke automatizado de Preview e Production

## Objetivo

`scripts/smoke-admin.mjs` automatiza o gate demonstrativo em browser real:
login inválido e válido, sessão 401/200, reload, Conteúdo, Identidades,
Auditoria, logout e novo bloqueio. Os negativos também provam que uma Origin
externa não cria sessão e que um cookie demo adulterado retorna 401 sem remover
cookies da sessão Vercel. Em Production também reprova cookie sem `HttpOnly`,
`Secure`, `SameSite=Strict`, `Path=/` ou expiração.

Qualquer falha retorna código diferente de zero e cria `report.json` e, quando
há página disponível, `failure.png`. O formulário de login é limpo antes da
captura. Trace não é salvo porque pode reter valores digitados ou cookies.

## Execução

As credenciais são lidas de `SMOKE_ADMIN_USER` / `SMOKE_ADMIN_PASSWORD`, com
fallback para `DEMO_ADMIN_USER` / `DEMO_ADMIN_PASSWORD` e para as credenciais
fictícias documentadas do MVP-0. Valores sensíveis nunca são impressos.

```powershell
pnpm smoke:admin -- --base-url http://localhost:3000 --environment local
pnpm smoke:admin -- --base-url https://preview.example.vercel.app --environment preview
pnpm smoke:admin -- --base-url https://portaldenoticias-five.vercel.app --environment production
```

O runner tenta o Chromium instalado pelo Playwright e, se ele não existir,
usa o canal Chrome. Em CI, instale o browser explicitamente com
`pnpm exec playwright install --with-deps chromium`. Um canal específico pode
ser definido por `SMOKE_BROWSER_CHANNEL`.

## Preview protegido

O mecanismo preferido é o Protection Bypass for Automation da Vercel:

```powershell
$env:SMOKE_VERCEL_BYPASS_SECRET='<valor-secreto>'
pnpm smoke:admin -- --base-url https://preview.example.vercel.app --environment preview
```

O bypass é anexado somente a requests cuja origin seja exatamente a origin da
Base URL e somente quando `--environment preview`. Requests cross-origin,
Production e local nunca recebem o header. Redirects não são seguidos pelo
request que recebeu o bypass: o 3xx volta ao browser e cada novo destino é
interceptado e reavaliado sem herdar headers da origem anterior.

Quando o Preview usa uma URL temporária de compartilhamento, forneça-a
somente por `SMOKE_ACCESS_URL`. O runner recusa outra origin, abre essa URL
apenas para estabelecer a sessão Vercel e depois usa a Base URL limpa. Não há
opção de linha de comando para impedir exposição do token na lista de processos.

```powershell
$env:SMOKE_ACCESS_URL='<url-temporaria-completa>'
pnpm smoke:admin -- --base-url https://preview.example.vercel.app --environment preview
```

Não grave bypass, access URL ou senha em arquivos rastreados, logs ou nomes de
artefato.

## Gate de promoção

O gate obrigatório executa, nesta ordem:

1. smoke completo na URL imutável do deployment de Preview;
2. `vercel promote <mesma-url-imutável> --yes`;
3. smoke completo em Production, incluindo a política do cookie.

```powershell
$env:PREVIEW_ACCESS_URL='<url-temporaria-opcional>'
pnpm release:promote -- `
  --preview-url https://preview.example.vercel.app `
  --deployment https://preview.example.vercel.app `
  --production-url https://portaldenoticias-five.vercel.app
```

`--preview-url` e `--deployment` devem ser a mesma URL HTTPS raiz, sem query,
fragmento ou path. IDs `dpl_...` soltos são recusados porque não provam qual URL
foi smocada. `--production-url` é fixado no domínio público vigente
`https://portaldenoticias-five.vercel.app`. O subprocesso de Production limpa
explicitamente bypass e URLs de acesso de Preview antes da reverificação.

`--dry-run` valida somente o smoke de Preview e prova o bloqueio sem executar
promoção ou tocar Production. A promoção real exige Preview aprovado; falha de
Production encerra o gate com código não zero e preserva sua evidência.
