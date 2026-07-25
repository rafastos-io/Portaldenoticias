# Loop de entrega e verificação

## Objetivo

Manter o Codex avançando por pequenas fatias verificadas, registrando estado para que outra sessão retome sem perder contexto.

## Papéis

### Executor

- escolhe a próxima tarefa;
- implementa;
- executa checks;
- corrige;
- atualiza documentação e fila.

### Verificador independente

Subagente que não implementou a tarefa e, na primeira passagem, não edita arquivos.

Audita:

- diff e escopo;
- critérios de aceite;
- segurança;
- tenant;
- dados fictícios;
- desktop/mobile;
- acessibilidade;
- testes e build;
- regressões.

## Ciclo obrigatório

1. Ler `AGENTS.md`, `TASKS.md` e `STATUS.md`.
2. Selecionar o P0 `READY` de menor número e marcar `IN_PROGRESS`.
3. Escrever plano curto e critérios.
4. Implementar uma única fatia vertical.
5. Executar lint, typecheck, testes e build aplicáveis.
6. Abrir a aplicação e verificar o fluxo real.
7. Capturar desktop e mobile quando houver UI.
8. Marcar a tarefa como `VERIFY`.
9. Criar subagente verificador independente.
10. O verificador entrega achados P0/P1/P2 com evidências.
11. Executor corrige P0 e P1.
12. Repetir verificação, no máximo três ciclos.
13. Registrar checks, screenshots e limitações em `STATUS.md`.
14. Marcar `DONE`.
15. Desbloquear dependências.
16. Selecionar imediatamente a próxima tarefa P0 `READY`.

## Prompt do verificador

```text
Você é o verificador independente desta entrega. Não edite arquivos na primeira passagem. Leia AGENTS.md, TASKS.md, STATUS.md e o diff da tarefa atual. Valide cada critério de aceite, isolamento por tenant, segurança do gate demo, ausência de dados reais, noindex das demos, responsividade em 390 px e 1440 px, acessibilidade, estados de erro/vazio, testes e build. Classifique achados em P0 bloqueante, P1 importante e P2 melhoria. Cite arquivos, linhas e evidências. Se não houver achados P0/P1, declare a tarefa aprovada.
```

## Regra de três tentativas

Se o mesmo bloqueio persistir por três ciclos:

- não repetir cegamente;
- registrar causa e tentativas em `STATUS.md`;
- marcar tarefa `BLOCKED`;
- puxar outra tarefa independente, se existir;
- pedir ajuda apenas quando nenhuma tarefa útil puder avançar.

## Quando parar

- fila P0 vazia;
- todas as tarefas restantes dependem de credencial/decisão externa;
- ação destrutiva ou publicação não autorizada;
- incidente de segurança;
- três tentativas sem alternativa;
- usuário interrompe.

## Persistência do loop

O loop não executa sozinho fora de uma sessão ativa do Codex. `TASKS.md` e `STATUS.md` são a memória entre sessões.
