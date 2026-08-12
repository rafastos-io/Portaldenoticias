# Plano do sprint de modelos visuais

Data: 27/07/2026.

## Objetivo

Produzir quatro experiências públicas estruturalmente diferentes, uma para cada
segmento comercial, mantendo uma única aplicação, o mesmo conteúdo canônico e
o menor custo de execução e verificação compatível com a segurança do projeto.

O contrato visual está em
`docs/22-arquitetura-visual-modelos-de-segmento.md`.

## Princípio operacional

Este é um sprint de produção visual. Auditoria não acontece a cada pequeno
passo.

- um executor mantém a posse dos componentes públicos compartilhados;
- testes focados acompanham mudanças de contrato;
- revisão visual acontece depois que os quatro modelos estiverem navegáveis;
- lint, tipos, suíte e build completos rodam uma vez no gate final;
- um único verificador independente faz a passagem final;
- auditor adversarial só é necessário se houver mudança em tenant, persistência
  ou allowlist;
- P2 visual não reinicia o ciclo se não afetar pitch, acessibilidade ou fluxo;
- no máximo uma correção/reverificação final para P0/P1.

## Sequência do sprint

### Etapa 0 — reconciliar a tarefa ativa

Antes de começar:

1. ler `TASKS.md`, `STATUS.md` e o diff;
2. se `C211` ainda estiver em `VERIFY`, fechar somente os critérios pendentes;
3. não repetir auditorias já aprovadas;
4. promover `C212` para `READY` quando `C211` estiver realmente concluída.

Saída: fila coerente e uma única tarefa visual ativa.

### Etapa 1 — contrato do modelo

Implementar:

- `SiteModelId` com quatro valores;
- registro tipado dos quatro modelos;
- parser server-side da allowlist;
- persistência em `components_json.site_model`;
- mapeamento explícito dos três tenants existentes;
- falha fechada para ID ausente após migração ou ID inválido;
- teste unitário do resolvedor e do isolamento por tenant.

Não implementar UI sofisticada nesta etapa.

Saída: qualquer página pública recebe um modelo válido e estável.

### Etapa 2 — composições públicas

Construir os quatro modelos sobre primitives compartilhadas.

Ordem:

1. shell, header e navegação;
2. composição da home;
3. famílias de cards;
4. editoria;
5. matéria;
6. footer e comportamento mobile.

Evitar um único componente com dezenas de ternários. Extrair composições
nomeadas e pequenas.

Saída: os quatro modelos navegáveis com o catálogo atual.

### Etapa 3 — marca sob o modelo

No cadastro/edição de identidade:

- substituir a escolha visual baseada em “tenant preset” por escolha explícita
  de modelo de segmento;
- apresentar quatro opções com nome, descrição e miniatura/preview real;
- manter nome, slogan, logo, cores e tipografia como camada da marca;
- salvar o modelo junto à versão vigente do tema;
- permitir trocar o modelo no preview antes de salvar;
- registrar auditoria no salvamento;
- criar a quarta marca demo do segmento de serviços financeiros e crédito sem
  duplicar matéria.

Os antigos seletores independentes de header, hero e card podem ser mantidos
internamente para compatibilidade, mas não devem permitir combinações incoerentes
na interface principal.

Saída: o operador escolhe “segmento/modelo” primeiro e personaliza a marca
depois.

### Etapa 4 — acabamento de alto impacto

Ajustar somente o que afeta o pitch:

- primeira dobra;
- ritmo e proporções;
- navegação mobile;
- recorte das imagens;
- legibilidade;
- distinção em escala de cinza;
- home, editoria e matéria;
- estados sem imagem e catálogo vazio.

Não criar conteúdo para preencher buracos. Usar o catálogo atual e fallbacks
aprovados.

### Etapa 5 — gate compacto

#### Testes automatizados

- parser aceita quatro IDs e recusa desconhecidos;
- tenant A não recebe o modelo de B;
- tema legado migra pelo mapeamento explícito;
- modelo persiste e recarrega;
- um `h1`, links de tenant e `noindex` preservados;
- lint, typecheck, testes e build.

#### Browser

Matriz mínima:

- quatro homes em 390 px;
- quatro homes em 1440 px;
- uma editoria e uma matéria por modelo, alternando 390/1440;
- navegação mobile, foco, zoom 200%, sem overflow;
- modelo inválido e tenant inválido falham fechado.

Para reduzir artefatos, produzir:

1. uma prancha comparativa desktop com as quatro homes;
2. uma prancha comparativa mobile com as quatro homes;
3. uma prancha de amostras de editoria/matéria;
4. um resumo dos checks.

Não gerar um relatório extenso por microcomponente.

#### Revisão final

Um único verificador independente:

- compara resultado com `docs/22`;
- classifica somente P0/P1/P2 acionáveis;
- não reabre decisões de produto já documentadas;
- aprova quando não houver P0/P1.

Auditoria adversarial curta somente para:

- modelo fora da allowlist;
- troca de tenant;
- persistência do modelo;
- fallback cruzado.

## Orçamento de agentes e tokens

- agente líder/executor: implementação integral;
- subagentes: nenhum por padrão;
- verificador independente: um, apenas no gate final;
- auditor adversarial: o mesmo verificador pode executar quatro negativos
  focados depois da revisão visual;
- não delegar pesquisa, leitura da documentação ou revisão por modelo;
- não repetir build completo após cada composição;
- não capturar dezenas de screenshots semelhantes.

## Arquivos prováveis

Contrato e resolução:

- `src/lib/admin/theme-form.ts`;
- `src/lib/supabase/theme-repository.ts`;
- `src/lib/supabase/portal-repository.ts`;
- novo registro em `src/lib/presentation/`;
- migration/RPC apenas se necessária para persistir `site_model`.

Portal:

- `src/components/public/public-shell.tsx`;
- `src/components/public/public-header.tsx`;
- `src/components/public/story-list.tsx`;
- `src/components/public/category-spotlights.tsx`;
- novos componentes de composição em `src/components/public/models/`;
- `src/app/page.tsx`;
- `src/app/editoria/[slug]/page.tsx`;
- `src/app/materia/[slug]/page.tsx`;
- `src/app/globals.css`.

ADM:

- `src/app/admin/(protected)/identidade/`;
- componentes e actions do workbench;
- testes do formulário e do repository.

Não editar migrations, CMS editorial ou distribuição se a mudança não for
necessária ao modelo visual.

## Critérios de pronto

- quatro IDs de modelo persistidos e validados;
- quatro silhuetas públicas distintas;
- escolha do modelo no fluxo de marca;
- quarta marca demo sem nova matéria;
- troca de modelo sem rebuild;
- home, editoria e matéria responsivas;
- matriz compacta de browser aprovada;
- checks completos aprovados uma vez;
- zero P0/P1;
- `TASKS.md` e `STATUS.md` atualizados com evidência curta.

## Critérios de parada

Parar e registrar decisão, sem ampliar silenciosamente, se:

- o modelo exigir taxonomia ou campo editorial novo;
- a persistência exigir uma entidade mais complexa que o ID no tema;
- faltar direito de uso de um asset;
- a mudança tocar autenticação, API comercial ou conteúdo real;
- houver conflito com alterações do usuário;
- Production exigir autorização ainda não concedida.

## Depois deste sprint

A segunda rodada pode usar a matriz editorial para:

- rever categorias e navegação por segmento;
- criar coleções e placements próprios;
- planejar pautas transversais;
- ajustar o catálogo por modelo.

Essas atividades não fazem parte do sprint visual.
