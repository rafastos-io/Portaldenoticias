# Auditoria estrutural — baseline de 31/08/2026

## Escopo e estado preservado

- branch: `codex/revisao-estrutural-nova-frente`;
- base: `363a16e` (`main`, um commit à frente de `origin/main`);
- arquivos do usuário preservados: `BV/` e diretórios não rastreados em
  `artifacts/`;
- sem mutação de Supabase, Vercel ou Production;
- protocolo adotado: `docs/25-protocolo-revisao-estrutural.md`.

## Baseline automatizada

| Check | Resultado |
|---|---|
| `pnpm audit:structure` | executado; 2 órfãos, 4 arquivos com 400+ linhas, 3 pontos de código com slug de tenant |
| `pnpm lint` | aprovado, zero warning |
| `pnpm typecheck` | aprovado |
| `pnpm typecheck:strict` | aprovado com `noUnusedLocals` e `noUnusedParameters` |
| `pnpm test` | 35 arquivos, 170 testes aprovados |
| `pnpm build` | aprovado; todas as rotas geradas sem erro |

Os checks atuais não cobrem atomicidade do cadastro editorial nem comprovam
que o preview da identidade corresponde ao portal real.

## Resumo

- P0 confirmado: zero;
- P1: sete;
- P2: seis;
- código morto confirmado por grafo estático: dois componentes;
- bloqueio para implementar o quinto modelo com segurança: direção visual ainda
  não decidida e três P1 de arquitetura de apresentação abertos.

## Achados P1

### A01 — metadados editoriais são gravados fora da transação principal

Classe: incorreto / atalho.

Evidência:

- `createAdminContent` e `updateAdminContent` chamam uma RPC transacional e,
  depois do commit, executam `applyEditorialMetadata`;
- `applyEditorialMetadata` substitui `body_json` por um objeto contendo apenas
  `editorial_type` e `key_topics`, podendo eliminar `demo_media`, origem e
  outros metadados da revisão;
- o update de `content_items.content_type` para patrocinado ignora o resultado.

Impacto: uma falha intermediária deixa matéria/revisão criada sem os metadados
prometidos; retry pode gerar nova revisão; variantes com mídia podem perder a
descrição persistida da mídia.

Correção mínima: criar RPC versionada única para conteúdo + mídia + metadados,
fazer merge explícito do JSON e testar rollback, retry e erro de update.

Situação nesta branch: correção local implementada pela migration
`20260831110000_make_editorial_metadata_atomic.sql` e pelo repository, com
testes locais. Permanece em `VERIFY` até execução transacional remota,
advisors e revisão independente; a migration não foi aplicada externamente.

### A02 — o “Preview ao vivo” é uma implementação paralela

Classe: incorreto / inútil.

Evidência: `IdentityWorkbench` renderiza `LivePortalPreview`,
`PreviewHome`, `PreviewCategory` e `PreviewArticle` com conteúdo estático e
regras próprias. Ele não usa `SiteModelHome`, `SiteModelCategory`,
`SiteModelArticle`, `PublicHeader` e `PublicShell`.

Impacto: o operador pode aprovar uma combinação que não representa a página
salva. Um quinto modelo exigiria implementar e manter duas interfaces.

Correção mínima: extrair renderer compartilhado e dados de preview tipados;
preview e portal devem divergir somente na origem dos dados, não nos
componentes de apresentação.

### A03 — composição possui duas fontes de verdade

Classe: inútil / atalho.

Evidência: `site_model` escolhe os componentes reais, mas o trio legado
`header/hero/card` continua obrigatório em `ThemeValues`, no parser e nas RPCs.
O trio é usado principalmente pelo preview paralelo e precisa permanecer
sincronizado com `site_model`.

Impacto: uma nova composição estrutural exige editar TypeScript e SQL em vários
pontos, mesmo quando os valores legados não representam a interface nova.

Correção mínima: planejar schema v3 em que `site_model` seja a fonte estrutural
e o trio legado seja somente compatibilidade de leitura com data de retirada.

### A04 — allowlist de modelos está duplicada e espalhada

Classe: dívida arquitetural.

Evidência: um novo ID exige hoje editar pelo menos:

- `site-models.ts`;
- três registros em `components/public/models/index.tsx`;
- mapas e condicionais em `public-header.tsx`;
- CSS global;
- `theme-form.ts`;
- as RPCs `cms_save_theme_v2` e `cms_create_demo_tenant_v2` em migration.

Impacto: alto risco de aceitar o modelo em uma camada e recusá-lo ou renderizar
incorretamente em outra.

Correção mínima: registro único de runtime com componentes e metadados, mais
teste de paridade com a allowlist SQL versionada.

### A05 — exceções de marca estão no shell compartilhado

Classe: atalho.

Evidência: `PublicShell` e `getPublicBrandCopy` testam diretamente o slug
`bv-educacao` para decidir links e textos.

Impacto: contradiz o requisito de criar marcas sem editar código e incentiva
novos `if` por cliente na nova frente.

Correção mínima: mover posicionamento, tópicos e links institucionais para
configuração validada do tema/tenant, com defaults por modelo.

### A06 — variantes editoriais registradas no status não estão operáveis

Classe: documentação incorreta / implementação incompleta.

Evidência: a seção “Reforma do cadastro editorial” em `STATUS.md` descreve
quatro variantes e campos condicionais, mas `parseEditorialForm` sempre retorna
`editorialType: "standard"`, `keyTopics: []`, `sponsorshipLabel: null` e
`correctionNote: null`. A UI atual não possui controles desses campos.

Impacto: a documentação transmite uma capacidade que o operador não consegue
usar e testes diretos do repository não provam o fluxo real do formulário.

Correção mínima: manter C220/R301 separados; concluir parser, UI, recuperação
de erro e teste de browser somente depois da RPC atômica estar aplicada e
validada.

### A07 — cobertura não protege três modelos nem o workbench real

Classe: dívida de verificação.

Evidência:

- somente `financial-credit-model.tsx` possui teste focado, limitado à ordem de
  matérias;
- investimentos, seguros e saúde não possuem teste de render/comportamento;
- `identity-workbench.tsx` tem 763 linhas e não possui teste dedicado;
- testes de qualidade de migrations verificam strings, mas não substituem
  execução transacional — uma migration de C257 precisou de correção posterior
  por vazamento de distribuição.

Impacto: 166 testes verdes dão uma sensação de cobertura maior do que a prova
real oferecida para a arquitetura visual e multi-tenant.

Correção mínima: testes de contrato por todos os modelos, parser/registro,
preview real e negativos transacionais de tenant.

## Achados P2

### A08 — fallback de marca por slug ainda existe no runtime

Classe: atalho.

`portal-repository.ts` mantém mapas de identidade e tema para cinco tenants e a
home os usa quando a consulta falha. O fallback não entrega matérias, mas pode
mostrar uma marca codificada apesar de o estado persistido estar ausente ou
inválido. O comportamento também é diferente em home, editoria e matéria.

Decisão proposta: erro genérico consistente em produção e fallback apenas em
fixture/teste explicitamente habilitado; slogan obrigatório no tenant.

### A09 — dois componentes públicos estão órfãos

Classe: morto.

- `src/components/public/story-list.tsx`;
- `src/components/public/category-spotlights.tsx`.

O grafo parte das 15 entradas do App Router e não encontrou caminho de
produção até esses arquivos. Confirmar ausência de import dinâmico e remover
em diff isolado.

### A10 — quatro módulos concentram responsabilidades demais

Classe: dívida controlável.

- `identity-workbench.tsx`: 763 linhas;
- página principal do Admin: 693 linhas;
- `portal-repository.ts`: 635 linhas;
- `content-repository.ts`: 629 linhas.

Extrair por responsabilidade somente depois de congelar comportamento com
testes; tamanho isolado não autoriza reescrita.

### A11 — variável de Storage documentada, mas ignorada

Classe: inútil / documentação incorreta.

`.env.example` declara `SUPABASE_STORAGE_BUCKET`, enquanto código e schema
fixam `demo-media`. Ou a variável deve ser removida da documentação, ou o
contrato inteiro deve passar a aceitá-la; apenas ler a env no código violaria o
constraint atual do banco.

### A12 — tratamento de indisponibilidade é inconsistente

Classe: dívida de comportamento.

A home captura qualquer erro e pode renderizar shell de fallback; editoria e
matéria deixam o erro subir para o boundary global. O `catch` da home também
perde a causa, reduzindo observabilidade.

### A13 — fila e status contêm conclusão obsoleta

Classe: documentação incorreta.

O fim de `TASKS.md` e `STATUS.md` ainda declara `C213` como próxima tarefa,
embora as seções mais recentes e a tabela marquem `C213` como concluída. Além
disso, `C220` está `BLOCKED` com dependência já concluída, sem registrar outro
bloqueio.

## Decisão sobre a nova frente

Não foi inventado um quinto ID ou uma linguagem visual sem briefing. Essa
escolha alteraria produto e arquitetura além do que está confirmado.

Antes da implementação, decidir:

1. público e segmento da nova frente;
2. promessa editorial e tarefa principal do leitor;
3. nome e ID estável do modelo;
4. seis eixos estruturais que o diferenciam dos quatro atuais;
5. tenant/tema que servirá de validação e direitos de marca/assets;
6. módulos e dados que existem de verdade, sem preencher layout com invenção.

A tarefa do quinto modelo fica bloqueada por essa decisão e pelos achados A02,
A03 e A04. O restante da revisão pode avançar sem essa definição.

## Ordem recomendada

1. A01 — atomicidade editorial;
2. A02 — preview real compartilhado;
3. A03/A04 — simplificar e centralizar o contrato de modelos;
4. A05/A08 — retirar decisões por slug do shell;
5. A06/A07 — alinhar capacidade real e cobertura de contrato;
6. A09/A10/A11/A12/A13 — limpeza e reconciliação;
7. aprovar briefing e implementar o quinto modelo;
8. executar matriz local, Preview e auditoria antes de solicitar Production.
