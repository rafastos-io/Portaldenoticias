# Prompt para o sprint de modelos visuais

```text
Você é o agente executor do sprint visual do projeto Broadcast Saúde &
Longevidade.

Seu objetivo é implementar quatro modelos de site estruturalmente distintos,
um para cada segmento comercial, dentro da aplicação existente:

1. serviços financeiros e crédito;
2. investimentos e gestão de recursos;
3. seguros e previdência;
4. saúde e indústria farmacêutica.

Este sprint é exclusivamente visual e de arquitetura de apresentação. Não crie
matérias, editorias, tags ou taxonomias. A matriz editorial será usada em uma
segunda rodada.

Leia integralmente, nesta ordem:

1. AGENTS.md
2. TASKS.md
3. STATUS.md
4. DELIVERY_LOOP.md
5. docs/22-arquitetura-visual-modelos-de-segmento.md
6. docs/23-plano-sprint-modelos-visuais.md
7. docs/17-plano-ciclo-de-melhoria.md
8. docs/18-maleabilidade-de-marcas-e-personalizacao.md
9. docs/06-central-de-identidade-visual.md
10. docs/20-matriz-qa-ciclo-de-melhoria.md
11. docs/03-arquitetura-tecnica.md
12. docs/04-modelo-de-dados.md
13. docs/11-decisoes-em-aberto.md

Antes de editar:

- inspecione Git, diff e arquivos não rastreados;
- preserve mudanças do usuário;
- reconcilie TASKS e STATUS com o código real;
- se C211 ainda estiver em VERIFY, feche somente o que estiver realmente
  pendente e não repita auditorias aprovadas;
- depois trabalhe em C212 e na parte visual de C213/C230;
- não inicie C220/C221 nem qualquer rodada de conteúdo;
- registre um plano curto e comece a implementar.

Decisão arquitetural obrigatória:

design system base
  -> modelo de site do segmento
    -> marca/tenant
      -> conteúdo e placements

Use uma única aplicação, uma única árvore de rotas e o mesmo conteúdo canônico.
Não duplique o site, não crie forks e não crie um banco por modelo.

IDs permitidos:

- financial-services-credit
- investments-asset-management
- insurance-pension
- health-pharma

Persista o ID validado em `theme_versions.components_json.site_model`, salvo
evidência técnica forte em contrário. Não crie tabela ou dependência nova sem
necessidade demonstrável.

Mapeamento inicial:

- Banco Demo Horizonte -> investments-asset-management
- Seguros Demo Atlas -> insurance-pension
- Healthtech Demo Lúmen -> health-pharma
- nova quarta marca demo -> financial-services-credit

A quarta marca pode reutilizar referências de distribuição. Nunca duplique o
corpo das matérias.

Direção visual:

- crédito: central editorial de serviços; entrada por necessidade; hero
  utilitário, atalhos, explicadores e alertas; densidade média;
- investimentos: publicação premium de inteligência; hero assimétrico com rail,
  listas densas, metadados e divisórias; pouca sombra e pouco raio;
- seguros: guia humano de proteção e longevidade; hero narrativo, fases da vida,
  superfícies suaves e maior respiro; sem comunicação baseada em medo;
- saúde/farma: briefing científico; grade precisa, espaço negativo, contexto,
  pesquisa, regulação e metadados estruturados; sem alegações clínicas
  inventadas.

Cada modelo deve variar estrutura, não apenas cor, fonte ou alinhamento. Home,
editoria e matéria precisam respeitar o modelo. As quatro homes devem continuar
distinguíveis em escala de cinza e sem logo.

Componentização:

- compartilhe resolução de tenant, conteúdo, links, mídia, metadados, estados e
  tokens seguros;
- crie composições pequenas e nomeadas em
  `src/components/public/models/`;
- evite um único componente com muitos ternários;
- não crie quatro cópias completas de header, card ou página;
- o operador escolhe um modelo coerente; não ofereça combinação livre de
  header/hero/card de segmentos diferentes nesta rodada.

Guardrails:

- nenhuma secret no cliente;
- nenhuma consulta sem tenant explícito;
- modelo inválido falha fechado, sem fallback para outro tenant;
- CSS/JS/HTML arbitrário proibido;
- WCAG AA, foco visível, zoom 200% e reduced motion;
- um h1, noindex e links com tenant preservados;
- sem overflow global;
- menu mobile explícito;
- nenhum gráfico, dado ou alegação inventado para preencher layout;
- nenhuma imagem sem direito, alt e crédito.

Forma de trabalho otimizada:

- use um único agente executor; não crie subagentes por padrão;
- rode testes focados durante mudanças de contrato;
- implemente os quatro modelos antes da revisão visual ampla;
- rode lint, typecheck, suíte completa e build uma vez no gate final;
- gere somente três pranchas: quatro homes desktop, quatro homes mobile e
  amostras de editoria/matéria;
- acione um único verificador independente no final;
- faça uma auditoria adversarial curta apenas para allowlist, tenant,
  persistência e fallback;
- corrija P0/P1 e faça no máximo uma reverificação final;
- não gaste o sprint refinando P2 que não afeta pitch, acessibilidade ou fluxo.

Matriz mínima de browser:

- quatro homes em 390 e 1440;
- uma editoria e uma matéria por modelo, alternando 390/1440;
- navegação mobile, teclado, foco, zoom 200%, sem overflow;
- tenant inválido e modelo inválido falham fechado.

Critério de conclusão:

- quatro modelos persistidos e validados;
- quatro silhuetas visualmente distintas;
- modelo selecionável no cadastro/edição da marca;
- quarta marca demo sem nova matéria;
- troca sem rebuild;
- home, editoria e matéria responsivas;
- checks completos aprovados;
- zero P0/P1;
- TASKS.md e STATUS.md atualizados com evidência curta.

Não publique Production sem autorização explícita. Entregue primeiro a
implementação local verificada e, se solicitado, um Preview imutável.

Comece agora. Produza código e evidência; não pare apenas no planejamento.
```
