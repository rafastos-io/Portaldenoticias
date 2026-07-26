# Loop de entrega e verificação

## Objetivo

Avançar por fatias verticais pequenas, verificadas e retomáveis. `TASKS.md` é a
fila; `STATUS.md` contém as evidências; `docs/21-sistema-de-agentes-e-governanca.md`
define os papéis completos.

## Reconciliação obrigatória

Antes de escolher uma tarefa:

1. ler `AGENTS.md`, `TASKS.md`, `STATUS.md` e os documentos do ciclo;
2. inspecionar Git e mudanças existentes;
3. comparar a documentação com Vercel/Supabase reais quando aplicável;
4. corrigir estado obsoleto;
5. se existir uma tarefa `IN_PROGRESS` ou `VERIFY`, retomá-la antes de iniciar
   outra;
6. sem tarefa ativa, selecionar o P0 `READY` de menor número na fila histórica
   `T...` e depois na fila do ciclo `C...`; sem P0, escolher o P1 pronto de
   maior impacto.

## Contrato da tarefa

Antes de editar, registrar:

- ID e resultado para o usuário;
- critérios de aceite;
- dependências;
- riscos de tenant/segurança/escopo;
- arquivos prováveis;
- checks e evidências exigidos.

## Papéis

### Líder

Orquestra, integra, decide e atualiza a fila. Delega apenas subtarefas
independentes e evita sobreposição de arquivos.

### Executor

Implementa uma única fatia vertical, cria testes, roda checks e entrega
evidências. Não amplia escopo silenciosamente.

### Verificador independente

Não edita na primeira passagem. Reproduz o resultado, revisa diff/aceite e
classifica P0/P1/P2.

### Auditor adversarial

Usado em login, tenant, mídia, distribuição e deploy. Tenta quebrar origem,
sessão, allowlists, isolamento e estados pausados.

## Ciclo obrigatório

1. Marcar a tarefa `IN_PROGRESS`.
2. Implementar uma fatia vertical.
3. Rodar testes focados.
4. Rodar lint, typecheck, testes e build.
5. Verificar fluxo local real.
6. Validar 390/768/1440 quando houver UI.
7. Provar isolamento negativo quando houver tenant/dados.
8. Publicar Preview quando houver integração/deploy.
9. Rodar smoke no Preview.
10. Marcar `VERIFY`.
11. Acionar verificador independente.
12. Corrigir todos os P0/P1.
13. Reverificar, no máximo três ciclos.
14. Acionar auditor adversarial quando aplicável.
15. Registrar commit, URL, checks, screenshots e limitações em `STATUS.md`.
16. Promover Production somente após Preview aprovado.
17. Reverificar Production.
18. Marcar `DONE`, desbloquear dependências e puxar a próxima tarefa.

## Gate de evidência

Não aceitar “parece funcionar”. Uma tarefa precisa de:

- comandos/resultados;
- browser real;
- screenshot quando houver UI;
- teste negativo de tenant/segurança quando aplicável;
- commit e URL quando houver deploy;
- auditoria sem P0/P1.

## Regra de três tentativas

Após três falhas iguais:

- parar a repetição;
- registrar hipótese, evidência e tentativas;
- mudar a estratégia;
- puxar trabalho independente;
- marcar `BLOCKED` apenas se houver impedimento externo real.

## Quando parar

- nenhuma tarefa P0/P1 pronta;
- todas dependem de decisão/credencial externa;
- ação destrutiva ou publicação não autorizada;
- incidente de segurança;
- três tentativas sem alternativa;
- usuário interrompe.

O loop não executa fora de uma sessão ativa. A memória permanece em
`TASKS.md` e `STATUS.md`.
