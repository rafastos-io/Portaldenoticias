# Plano do ciclo de melhoria

Data de abertura: 26/07/2026.

## Objetivo

Evoluir o MVP-0 de uma demonstração funcional para uma demonstração comercial
mais convincente, flexível e verificável, sem antecipar autenticação real, API
comercial ou um page builder irrestrito.

O ciclo precisa melhorar seis capacidades:

1. estabilidade do ambiente publicado;
2. qualidade editorial e densidade jornalística;
3. cadastro e operação de conteúdo;
4. criação e personalização de marcas;
5. modelos de site estruturalmente distintos por segmento;
6. capacidade dos agentes de entregar e auditar fatias completas.

## Diagnóstico de partida

### P0 — estabilização

- o login publicado recusava a própria origem com
  `Não foi possível validar a origem da solicitação`;
- a causa está na diferença entre o alias público, o host encaminhado e o URL
  gerado pela Vercel;
- não existia smoke test obrigatório após o deploy;
- `TASKS.md` e `STATUS.md` ainda descreviam a Vercel como bloqueada;
- o domínio `portaldenoticias.vercel.app` aponta para um projeto antigo e não
  deve ser usado no pitch;
- o domínio público atual do MVP é
  `https://portaldenoticias-five.vercel.app`.

### P1 — produto

- novas marcas ainda dependem de slugs e fallbacks codificados;
- as variantes de header, hero e card mudam menos do que seus nomes prometem;
- a identidade só pode ser avaliada depois de salvar;
- o CMS não expõe de forma clara patrocinado, correção, explicador e exceção
  sem imagem;
- distribuição e overrides existem no banco, mas não têm operação completa no
  ADM;
- cada tela administrativa mantém seu próprio seletor de tenant;
- a home precisa ganhar densidade jornalística e mídia variada para o pitch.

### Estado técnico

- o Supabase não possui alertas de segurança ativos;
- os avisos de performance são apenas índices ainda não usados em um catálogo
  pequeno e demonstrativo;
- lint, tipos e testes estavam aprovados no início desta auditoria;
- dados e marcas permanecem 100% fictícios.

## Contrato de escopo do Ciclo 2

### Incluído

- correção e smoke de login em Preview e Production;
- contexto global de tenant no ADM;
- criação e duplicação de tenant demo por preset;
- workbench de identidade com preview antes de salvar;
- logo, paleta, tipografia, densidade, variantes e módulos aprovados;
- quatro modelos visuais estruturalmente distintos, definidos em `docs/22`;
- variantes de cadastro editorial demonstrativas;
- distribuição por tenant e overrides de chamada;
- melhoria da home, navegação mobile, estados e acessibilidade;
- matriz de QA automatizada e manual.

### Continua fora

- Supabase Auth, convites, recuperação, MFA e RBAC;
- clientes reais acessando o ADM;
- API comercial, RSS autenticado, webhooks e SLA;
- CSS, JavaScript ou HTML arbitrário;
- histórico e rollback de tema;
- editor rico completo;
- dados, estudos, organizações ou marcas reais;
- IA editorial;
- cobrança, paywall e app nativo.

Qualquer tentativa de incluir esses itens deve virar proposta em
`docs/11-decisoes-em-aberto.md`, sem implementação silenciosa.

## Ondas de entrega

### Onda 0 — recuperar confiança

- corrigir login;
- validar cookie e logout no domínio público;
- automatizar o smoke publicado;
- registrar URLs, commit e deploy;
- fechar `T013` e `T014`.

### Onda 1 — operação com contexto

- tenant ativo único no ADM;
- seletor persistente entre Conteúdo, Identidades e Auditoria;
- confirmação em ação de alto impacto para outro tenant;
- mensagens de sucesso e erro que preservam o formulário.

### Onda 2 — laboratório de marcas

- criar ou duplicar tenant demo;
- escolher um dos quatro modelos de segmento;
- editar marca e paleta com preview instantâneo;
- aplicar a composição estrutural coerente daquele modelo;
- salvar apenas valores aprovados;
- publicar a versão vigente sem histórico/rollback.

### Onda 3 — laboratório editorial

- criar por template;
- cadastrar matéria padrão, explicador/análise, patrocinada fictícia e
  correção;
- duplicar como rascunho sem duplicar conteúdo publicado;
- configurar destinos e overrides;
- comprovar pausa e retomada por tenant.

### Onda 4 — qualidade do pitch

- home mais densa;
- imagens fictícias variadas, com alt e crédito;
- metadados editoriais visíveis;
- navegação mobile explícita;
- quatro modelos visualmente distintos em 390 px e 1440 px;
- auditoria final adversarial.

## Métricas do ciclo

- login publicado: 100% do smoke aprovado;
- tempo para criar uma demo a partir de preset: até 5 minutos;
- troca de tenant: sem reconstrução ou alteração de código;
- modelos: diferença estrutural visível, não apenas cor/alinhamento;
- vazamento entre tenants: zero;
- contraste: todos os pares essenciais em WCAG AA;
- erros P0/P1 abertos ao promover produção: zero;
- dados reais no ambiente demo: zero;
- tarefas concluídas sem evidência de browser/checks: zero.

## Definição de pronto

O ciclo termina quando uma pessoa consegue:

1. abrir o domínio correto e entrar no ADM;
2. selecionar ou criar uma marca demo;
3. escolher um dos quatro modelos de segmento;
4. personalizar a marca e visualizar antes de salvar;
5. criar uma matéria por variante;
6. distribuir a mesma matéria para mais de um tenant com chamadas distintas;
7. verificar portal, editoria e matéria em desktop/mobile;
8. pausar e retomar sem vazamento;
9. repetir o fluxo por smoke automatizado;
10. apresentar evidências e auditoria sem P0/P1.
