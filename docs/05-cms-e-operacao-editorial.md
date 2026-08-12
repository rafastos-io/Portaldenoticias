# CMS e operação editorial

## Recorte do MVP-0

Implementar primeiro apenas `draft`, `published` e `paused`, com criação, edição, publicação, pausa e retomada. Revisão em múltiplas etapas, aprovação, breaking news e agendamento automatizado permanecem documentados como evolução posterior.

## Objetivo

Dar velocidade à redação sem perder governança. O CMS deve ser opinativo: facilitar o caminho correto e tornar ações arriscadas explícitas.

## Estrutura do admin

Navegação sugerida:

1. Visão geral.
2. Conteúdo.
3. Agenda.
4. Revisões.
5. Curadoria.
6. Distribuição.
7. Identidades.
8. Clientes.
9. Mídia.
10. Auditoria.
11. Configurações.

Itens aparecem conforme capacidade.

No MVP-0 não existem telas de usuários, recuperação, convites ou API comercial. O topo do ADM exibe permanentemente o aviso de modo demonstração.

## Lista de conteúdo

Colunas padrão:

- status;
- título;
- tipo;
- editoria;
- autor;
- última atualização;
- publicação/agendamento;
- número de tenants;
- alertas.

Filtros:

- status;
- autor;
- editoria/tag;
- tipo;
- tenant de destino;
- intervalo de data;
- com pendência;
- sponsored;
- revisão médica;
- direito de mídia vencendo.

Ações em lote devem ser limitadas e exigir confirmação contextual. Nunca oferecer exclusão em lote de conteúdo publicado.

## Editor de matéria

### Coluna principal

- título;
- linha fina;
- corpo estruturado;
- embeds aprovados;
- intertítulos;
- citações;
- links;
- box de contexto;
- galeria futura.

### Painel lateral

- status;
- autoria;
- editoria e tags;
- imagem principal;
- SEO;
- fontes;
- revisão médica;
- branded content;
- distribuição;
- agendamento;
- checklist.

### Autosave e concorrência

- autosave a cada mudança estabilizada;
- indicador “salvo às…”;
- `version` otimista no registro;
- detectar outra sessão editando;
- conflito não sobrescreve silenciosamente;
- recuperação de rascunho local opcional.

## Documento rico

Armazenar JSON estruturado validado. Renderizar HTML sanitizado no servidor.

Nós iniciais permitidos:

- paragraph;
- heading níveis 2 e 3;
- bullet/ordered list;
- blockquote;
- link;
- bold/italic;
- image reference;
- pull quote;
- fact box;
- data source note;
- divider.

Não permitir no MVP:

- script;
- iframe livre;
- estilos inline;
- HTML cru;
- cores e fontes arbitrárias dentro da matéria.

## Checklist editorial

### Obrigatório para toda publicação

- título e linha fina;
- corpo;
- autor;
- editoria;
- data e timezone;
- imagem ou exceção justificada;
- crédito e direito da imagem;
- texto alternativo;
- SEO description;
- pelo menos uma fonte ou justificativa;
- revisão de links;
- definição de distribuição.

### Saúde e ciência

- distinguir associação de causalidade;
- informar natureza do estudo quando aplicável;
- indicar tamanho/limitação relevante;
- preferir fonte primária;
- separar alegação de empresa de conclusão independente;
- revisão médica marcada quando exigida pela política;
- evitar promessa de cura ou linguagem sensacionalista.

### Branded content

- patrocinador;
- rótulo público inequívoco;
- responsável comercial;
- janela de campanha;
- aprovação necessária;
- separação visual editorial;
- conflito de interesse.

## Workflow

O fluxo completo abaixo é o alvo pós-MVP-0.

### Draft

Editável. Não distribuído. Preview interno.

### In review

Congela uma versão para revisão. Mudanças relevantes criam nova revisão ou devolvem a draft.

### Approved

Pronto para publicar/agendar. Aprovação registra pessoa, horário e versão.

### Scheduled

Job idempotente publicará a versão aprovada. Mudança no conteúdo cancela ou exige novo agendamento.

### Published

Versão pública imutável. Uma correção cria revisão.

### Paused

Retirada temporária. Exige motivo, autor e política de URL. Não apaga.

### Archived

Fim permanente de exibição ativa. Mantém registro e, quando aplicável, tombstone/redirect.

## Breaking news

Capacidade especial:

- somente usuários autorizados;
- publicação direta com justificativa;
- checklist reduzido visível;
- revisão obrigatória após publicação em SLA definido;
- alerta no dashboard enquanto pendente.

Não transformar exceção em fluxo padrão.

## Correções

Classificação sugerida:

- `minor`: ortografia/forma, sem nota pública;
- `material`: altera entendimento, com nota;
- `legal`: orientação jurídica, acesso restrito e trilha reforçada;
- `withdrawal`: retirada, com motivo público conforme política.

Uma correção material deve:

- registrar antes/depois;
- atualizar `dateModified`;
- disparar atualização do feed;
- invalidar caches;
- preservar URL;
- exibir nota objetiva.

## Pausa e despublicação

Ao pausar:

- remover de placements;
- remover de listagens, busca, sitemap, RSS e responses normais da API;
- emitir tombstone na API incremental se o cliente já teve acesso;
- impedir cache antigo;
- registrar motivo;
- decidir resposta da URL: 404 temporário, 410 permanente ou página editorial.

Essa política precisa ser aprovada em `docs/11-decisoes-em-aberto.md`.

## Distribuição editorial

O painel de uma matéria mostra:

- tenants elegíveis;
- canais;
- início/fim;
- nível de conteúdo: headline, resumo ou corpo completo;
- direito de mídia;
- override de chamada;
- status e alerta de conflito.

Publicar conteúdo canônico não deve autorizar automaticamente todos os clientes.

## Curadoria de home

Modelo por slots:

- hero principal;
- destaques secundários;
- últimas notícias;
- bloco por editoria;
- coleção/dossiê;
- branded;
- newsletter/CTA.

Cada slot aceita tipos e variantes conhecidas. Drag-and-drop é opcional; botões mover acima/abaixo são mais acessíveis e suficientes no MVP.

Regras:

- placement só exibe conteúdo distribuído;
- início/fim programável;
- fallback automático para últimas notícias;
- preview antes de publicar;
- alerta para matéria pausada ou vencendo.

## Agenda

Visões:

- dia;
- semana;
- lista.

Exibe:

- publicações;
- expirações;
- fim de distribuição;
- vencimento de mídia;
- fim de preview;
- campanhas branded.

## Auditoria útil

Eventos:

- criação;
- envio/devolução/aprovação;
- publicação;
- pausa/retomada/arquivo;
- correção;
- mudança de distribuição;
- mudança de destaque;
- criação/revogação de preview;
- publicação/rollback de tema;
- geração/revogação de credencial;
- mudança de acesso.

O painel deve responder: quem, o quê, quando, em qual tenant e por quê.

## Notificações do MVP

Dentro do produto:

- matéria devolvida;
- item aguardando aprovação;
- job de publicação falhou;
- direito de imagem próximo do fim;
- preview expirando;
- chave próxima do vencimento.

E-mail apenas para eventos importantes. Evitar ruído.

## Importação

P1:

- CSV cria rascunhos, nunca publica;
- relatório por linha;
- deduplicação por `external_id`;
- imagens remotas passam por validação;
- fonte/origem registrada;
- usuário confirma antes de iniciar lote.

RSS e automação de clipping ficam após validação do fluxo manual.
