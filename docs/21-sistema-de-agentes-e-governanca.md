# Sistema de agentes e governança

## Objetivo

Fazer os agentes avançarem com autonomia, evidência e decisões consistentes,
sem criar trabalho paralelo conflitante ou declarar pronto cedo demais.

## Papéis

### Líder/orquestrador

- lê o estado real;
- seleciona uma única fatia vertical;
- define arquivos, critérios e riscos;
- delega apenas subtarefas independentes;
- integra a entrega;
- atualiza fila e status.

### Executor

- implementa somente a fatia atribuída;
- preserva mudanças existentes;
- escreve testes;
- roda checks proporcionais;
- entrega diff e evidências;
- não muda escopo silenciosamente.

### Verificador independente

Na primeira passagem, não edita.

- revisa diff e critérios;
- reproduz o fluxo;
- procura regressões;
- classifica P0/P1/P2;
- cita arquivo/linha/evidência;
- aprova somente sem P0/P1.

### Auditor adversarial

Usado em login, multi-tenant, publicação, mídia e deploy.

- tenta origem externa;
- tenta item de outro tenant;
- tenta valor de tema fora da allowlist;
- tenta conteúdo pausado;
- procura secrets e dados reais;
- verifica Preview e Production.

## Regra de posse

- uma tarefa tem um líder;
- dois agentes não editam o mesmo conjunto de arquivos ao mesmo tempo;
- subtarefa deve ser concreta, limitada e independente;
- leitura/auditoria pode ocorrer em paralelo;
- a integração e a decisão final pertencem ao líder;
- qualquer conflito para a fila e exige reconciliação antes de continuar.

## Pacote de início da tarefa

O líder fornece:

- ID e prioridade;
- resultado do usuário;
- critérios de aceite;
- dependências concluídas;
- arquivos/áreas prováveis;
- riscos de tenant, segurança e escopo;
- checks obrigatórios;
- evidência esperada.

Sem esse pacote, o agente não começa a implementação.

## Pacote de entrega

O executor devolve:

- resumo do resultado;
- arquivos alterados;
- decisões e hipóteses;
- testes criados;
- checks executados;
- evidência de browser;
- riscos/limitações;
- proposta de próxima tarefa.

“Código pronto” sem evidência não é entrega.

## Loop assertivo

1. Ler `AGENTS.md`, `TASKS.md`, `STATUS.md` e os docs do ciclo.
2. Comparar documentação com Git, Vercel e Supabase reais.
3. Corrigir estado obsoleto antes de escolher trabalho.
4. Retomar primeiro a única tarefa `IN_PROGRESS` ou `VERIFY`.
5. Sem tarefa ativa, selecionar o P0 `READY` de menor número: primeiro a fila
   histórica `T...`, depois a fila do ciclo `C...`; sem P0, o P1 pronto de
   maior impacto.
6. Marcar `IN_PROGRESS` e declarar resultado/aceite.
7. Implementar uma fatia vertical completa.
8. Rodar teste focado durante a implementação.
9. Rodar lint, tipos, testes e build antes de verificar.
10. Verificar fluxo real local.
11. Publicar Preview quando a tarefa envolver integração/deploy.
12. Marcar `VERIFY`.
13. Acionar verificador independente.
14. Corrigir todos os P0/P1.
15. Repetir até três ciclos.
16. Executar auditor adversarial quando aplicável.
17. Registrar evidências em `STATUS.md`.
18. Marcar `DONE`, desbloquear dependências e puxar a próxima tarefa.

Tarefas que compartilham componentes de tema/portal, como `C212` e `C213`,
não devem ser implementadas em paralelo.

## Orçamento de tentativas

Após três falhas do mesmo tipo:

- parar a repetição;
- registrar hipótese, evidência e tentativas;
- mudar a estratégia;
- puxar trabalho independente;
- marcar `BLOCKED` apenas quando existir impedimento externo real.

## Guardrails

- segurança e isolamento vencem velocidade;
- `docs/15`, escopo do ciclo e `TASKS.md` vencem ideias amplas;
- dados continuam fictícios fora das exceções reais formalmente autorizadas e
  documentadas; nenhuma fonte nova pode ser inferida como licenciada;
- nenhuma mutação externa fora da autorização do usuário;
- migrations novas exigem advisor depois do DDL;
- Production exige Preview aprovado;
- nenhuma dependência nova sem necessidade demonstrável;
- não corrigir P2 ampliando o escopo em várias semanas;
- não apagar histórico de decisões para “limpar” a documentação.

## Prompt do verificador

```text
Você é o verificador independente da tarefa {ID}. Na primeira passagem, não
edite arquivos. Leia AGENTS.md, TASKS.md, STATUS.md, os documentos do Ciclo 2 e
o diff da tarefa. Reproduza o resultado do usuário e valide cada critério de
aceite. Verifique escopo, tenant, origem/cookie quando houver autenticação,
dados fictícios, noindex, acessibilidade, 390/768/1440, estados de
erro/vazio/carregando, testes, build e deploy aplicável. Classifique achados em
P0/P1/P2. Para cada achado, informe evidência, arquivo/linha, impacto e correção
mínima. Aprove somente quando não houver P0/P1.
```

## Prompt do auditor adversarial

```text
Você é o auditor adversarial da tarefa {ID}. Não implemente na primeira
passagem. Tente quebrar o isolamento e o fluxo principal usando entradas
inválidas, tenant divergente, origem externa, sessão ausente/adulterada, tema
fora da allowlist, conteúdo pausado e rotas diretas. Procure secrets no cliente,
dados reais e fallback silencioso. Verifique local, Preview e Production quando
aplicável. Entregue P0/P1/P2 com passos de reprodução e evidências. Não aprove
por inferência: prove o fluxo.
```
