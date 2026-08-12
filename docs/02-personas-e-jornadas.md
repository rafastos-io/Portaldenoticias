# Personas e jornadas

O documento descreve o produto-alvo. No MVP-0 existe apenas um operador interno compartilhado, identificado na auditoria como `demo-operator`. Papéis, convites e acessos de clientes são pós-MVP-0.

## Personas primárias

### Editora ou editor

Objetivo: publicar conteúdo confiável com rapidez.

Necessidades:

- rascunho automático;
- campos claros e checklist;
- preview fiel;
- agendamento;
- busca e filtros eficientes;
- correção sem apagar histórico.

Riscos:

- publicar no cliente errado;
- usar fonte ou imagem sem direito;
- perder alterações;
- confundir pausa com exclusão.

### Revisora ou revisor

Objetivo: garantir qualidade, precisão e conformidade antes da publicação.

Necessidades:

- comparar versões;
- comentar ou devolver;
- visualizar fontes e conflitos;
- checar conteúdo patrocinado;
- aprovar com registro.

### Publisher ou chefe de redação

Objetivo: controlar pauta, prioridade e distribuição.

Necessidades:

- agenda editorial;
- fila de revisão;
- destaques por tenant;
- publicação emergencial;
- visão do que está programado, ativo ou vencendo.

### Operador comercial

Objetivo: montar rapidamente uma experiência convincente para um prospect.

Necessidades:

- duplicar preset;
- aplicar marca;
- escolher conteúdo;
- preview por dispositivo;
- link seguro com validade;
- indicador visível de ambiente de demonstração apenas quando apropriado.

### Administrador da plataforma

Objetivo: manter usuários, clientes, permissões, domínios e operação.

Necessidades:

- visão global;
- auditoria;
- suspensão imediata;
- rotação de chaves;
- diagnóstico sem acessar conteúdo privado desnecessariamente.

### Gestor do cliente

Objetivo: revisar a experiência e acompanhar o conteúdo contratado.

No MVP:

- acesso opcional e somente leitura ao preview;
- não edita conteúdo canônico;
- pode validar marca por fluxo externo ou conta limitada, conforme decisão comercial.

### Leitora ou leitor

Objetivo: entender uma notícia e sua relevância com confiança.

Necessidades:

- hierarquia clara;
- data de publicação e atualização;
- autoria;
- fontes e contexto;
- distinção de conteúdo patrocinado;
- boa leitura no celular;
- busca e navegação relacionadas.

### Sistema consumidor da API

Objetivo: sincronizar conteúdo licenciado com previsibilidade.

Necessidades:

- contrato estável;
- identificadores idempotentes;
- paginação;
- consulta incremental;
- sinalização de correção/remoção;
- limites e erros documentados.

## Matriz simplificada de papéis

| Capacidade | Superadmin | Admin tenant | Editor | Revisor | Publisher | Comercial | Cliente leitura |
|---|---:|---:|---:|---:|---:|---:|---:|
| Gerir tenants | Sim | Não | Não | Não | Não | Criar demo | Não |
| Gerir usuários do tenant | Sim | Sim | Não | Não | Não | Não | Não |
| Criar/editar matéria | Sim | Opcional | Sim | Sim | Sim | Não | Não |
| Aprovar matéria | Sim | Opcional | Não | Sim | Sim | Não | Não |
| Publicar/pausar | Sim | Opcional | Não | Não | Sim | Não | Não |
| Configurar distribuição | Sim | Opcional | Não | Não | Sim | Selecionar em demo | Não |
| Editar tema | Sim | Sim | Não | Não | Não | Demo | Não |
| Publicar tema | Sim | Sim | Não | Não | Não | Não | Não |
| Criar/revogar preview | Sim | Sim | Não | Não | Não | Sim | Não |
| Ver preview | Sim | Sim | Sim | Sim | Sim | Sim | Sim |
| Gerir API keys | Sim | Sim | Não | Não | Não | Não | Não |
| Ver auditoria | Sim | Escopo próprio | Não | Não | Limitado | Não | Não |

Permissões finais devem ser capacidades, não condicionais espalhadas pelo front-end.

## Jornadas críticas

### Jornada A - publicar uma notícia

1. Editor cria matéria e escolhe o tipo.
2. Sistema salva rascunho automaticamente.
3. Editor preenche título, linha fina, corpo, autoria, editoria, fontes e mídia.
4. Checklist aponta pendências.
5. Editor envia para revisão.
6. Revisor aprova ou devolve com comentário.
7. Publisher define publicação imediata ou agendada.
8. Sistema publica a versão aprovada.
9. Distribuições elegíveis passam a expor a matéria.
10. Auditoria e eventos são registrados.

Exceção: breaking news pode usar um fluxo de publicação urgente com justificativa e revisão posterior.

### Jornada B - corrigir uma matéria publicada

1. Editor abre a versão publicada e inicia correção.
2. Sistema cria nova revisão sem alterar imediatamente o público.
3. Editor registra o motivo e a materialidade.
4. Revisor/publisher aprova.
5. Nova versão substitui a anterior.
6. Página atualiza `dateModified`.
7. API retorna a matéria em `updated_since`.
8. Nota de correção aparece quando a mudança for material.

### Jornada C - pausar conteúdo

1. Publisher escolhe pausar.
2. Sistema exige motivo e duração opcional.
3. Conteúdo sai de home, busca, editorias, RSS e API.
4. URL pública segue a política escolhida: indisponível temporariamente ou página explicativa.
5. Retomada restaura a distribuição sem perder histórico.

Pausa não é exclusão e não apaga versões.

### Jornada D - criar demo para um prospect

1. Comercial cria tenant do tipo `demo`.
2. Seleciona preset de segmento.
3. Informa nome, logo, paleta e domínio fictício.
4. Ajusta componentes aprovados.
5. Escolhe coleção de matérias e destaques.
6. Confere desktop e mobile.
7. Sistema valida contraste e assets.
8. Comercial gera link com validade e senha opcional.
9. Prospect acessa experiência somente leitura.
10. Comercial revoga o link ou converte o tenant em trial.

### Jornada E - ativar feed/API

1. Admin define contrato editorial do tenant.
2. Seleciona editorias, tipos e janela.
3. Gera credencial com escopo mínimo.
4. Cliente consulta documentação e ambiente de teste.
5. Consome lote inicial.
6. Passa a usar `updated_since`.
7. Admin acompanha erros, volume e última utilização.
8. Credencial pode ser rotacionada sem trocar o tenant.

## Estados que toda interface deve tratar

- carregando;
- vazio;
- sem resultado;
- erro recuperável;
- erro de permissão;
- conteúdo agendado;
- conteúdo pausado;
- conteúdo expirado;
- preview expirado;
- tema com alterações não publicadas;
- conexão instável;
- conflito de edição.
