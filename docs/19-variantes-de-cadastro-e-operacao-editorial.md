# Variantes de cadastro e operação editorial

## Objetivo

Dar velocidade ao operador sem misturar conteúdo canônico, distribuição e
apresentação.

## Entradas para criar conteúdo

### Cadastro rápido

Cria rascunho com:

- template;
- título;
- linha fina;
- tenant proprietário;
- autoria;
- editoria;
- imagem/fallback.

Depois abre o editor completo. Nunca publica automaticamente.

### Editor completo

Mantém:

- título;
- linha fina;
- corpo;
- autor;
- editoria;
- tags;
- imagem, alt e crédito;
- tipo editorial;
- campos condicionais;
- destinos;
- overrides;
- checklist.

### Duplicar como rascunho

Permitido para acelerar uma pauta ou formato, com regras:

- novo `content_item`;
- novo slug;
- status `draft`;
- sem data de publicação;
- sem distribuição ativa;
- sem placements;
- prefixo visual “Cópia” até o título ser revisado;
- auditoria de origem da duplicação.

Não usar duplicação para trocar marca ou chamada. Nesses casos, usar
distribuição e overrides.

## Templates do Ciclo 2

### Matéria padrão

Obrigatórios:

- título, linha fina, corpo, autor, editoria;
- imagem ou justificativa;
- alt/crédito quando houver mídia;
- pelo menos um destino.

### Explicador ou análise demonstrativa

Adiciona:

- tipo aprovado;
- box “O que está em jogo”;
- tópicos-chave;
- aviso de conteúdo demonstrativo.

Não cria recomendação médica ou financeira.

### Patrocinada fictícia

Adiciona:

- `sponsorship_label`;
- patrocinador fictício;
- aviso público inequívoco;
- janela demonstrativa;
- separação visual.

Não autoriza branded content real.

### Correção

Adiciona:

- nota pública;
- resumo da alteração;
- data;
- preservação da URL;
- evento de auditoria.

No Ciclo 2, uma correção cria uma nova revisão e troca atomicamente a revisão
publicada do item. A interface completa de histórico, comparação e rollback
continua pós-MVP.

### Sem mídia

Exige:

- justificativa;
- layout próprio sem elemento de imagem;
- preview do estado;
- nenhum alt associado a mídia inexistente.

### Fallback visual aprovado

Usa um asset fictício do catálogo e exige:

- alt;
- crédito;
- direito de uso demonstrativo;
- preview do recorte.

## Distribuição

Após criar o conteúdo canônico, o operador configura:

- tenants de destino;
- canal `portal` no Ciclo 2;
- status;
- início/fim apenas demonstrativos quando suportados;
- headline override;
- subtitle override;
- editoria de destino;
- direito de corpo e mídia.

Regras:

- uma matéria canônica pode ter muitos destinos;
- cada destino possui chamada própria;
- revogar um destino não pausa os demais;
- pausar canonicamente remove todos os destinos ativos fotografados;
- retomar restaura somente os destinos que estavam ativos;
- toda query e mutação recebe tenant explícito;
- toda mudança grava auditoria.

## Contexto global do ADM

O tenant ativo deve:

- aparecer no cabeçalho;
- persistir em Conteúdo, Identidades e Auditoria;
- ser carregado por query/cookie não sensível validado no servidor;
- nunca substituir o `tenant_id` autorizado da mutação;
- gerar confirmação quando a ação afetar outro tenant;
- oferecer link para abrir o portal correspondente.

## Erros e recuperação

- preservar valores digitados em erro de validação;
- associar mensagem ao campo;
- focar o primeiro erro;
- impedir submissão dupla;
- indicar estado pendente;
- mostrar sucesso com próximo passo;
- não usar query string para transportar corpo editorial;
- nunca registrar senha, cookie, secret ou corpo integral em auditoria.

## Filtros e listagem

Filtros do Ciclo 2:

- tenant;
- status;
- tipo;
- editoria;
- autor;
- patrocinado;
- com correção;
- com/sem imagem;
- quantidade de destinos.

A listagem deve exibir:

- status;
- tipo;
- título e linha fina;
- editoria/autor;
- atualização;
- destinos;
- alertas;
- ações disponíveis.

## Critérios de aceite

- criar os cinco casos demonstrativos;
- editar e recarregar sem perder dados;
- distribuir uma matéria para dois tenants;
- alterar chamadas sem duplicar o corpo;
- revogar apenas um destino;
- pausar e retomar preservando destinos;
- filtrar os casos;
- registrar auditoria;
- provar isolamento com teste negativo A → B.
