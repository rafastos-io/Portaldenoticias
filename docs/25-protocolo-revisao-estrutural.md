# Protocolo de revisão estrutural

Data de adoção: 31/08/2026.

## Objetivo

Recuperar confiança técnica antes de ampliar o produto. O protocolo separa
quatro perguntas que não podem ser respondidas apenas por uma suíte verde:

1. o comportamento está correto e seguro?
2. o código existente ainda é necessário?
3. a implementação segue o contrato arquitetural documentado?
4. a próxima frente pode entrar sem aumentar acoplamento ou mascarar falhas?

O protocolo vale para código, migrations, configuração, documentação e
evidências de deploy. Ele não autoriza produção, DDL remoto ou remoção de dados.

## Regra de precedência

1. segurança, isolamento de tenant e integridade de dados;
2. comportamento observado no código, banco e navegador;
3. ADRs e decisões confirmadas;
4. documentação operacional;
5. intenção histórica registrada em commits ou status.

Quando código e documentação divergirem, registrar a divergência como achado.
Não alterar a documentação para fazer a divergência desaparecer antes de
provar qual comportamento é correto.

## Classificação dos achados

| Classe | Definição | Exemplo |
|---|---|---|
| Incorreto | Pode produzir resultado errado, perda, vazamento ou estado parcial | mutação dividida em duas transações |
| Morto | Não é alcançado por nenhuma entrada suportada | componente sem import de produção |
| Inútil | É alcançável, mas duplica uma fonte de verdade sem benefício atual | configuração legada mantida apenas por um preview paralelo |
| Atalho | Resolveu uma entrega pontual, mas mascara falha ou transfere risco | fallback codificado por slug quando o banco falha |
| Dívida controlada | Limitação conhecida, testada e sem impacto P0/P1 | arquivo grande com fronteira clara e cobertura adequada |

Severidade:

- `P0`: risco de segurança, isolamento, perda de dados ou fluxo principal;
- `P1`: comportamento inconsistente, falsa evidência, regressão relevante ou
  bloqueio seguro da nova frente;
- `P2`: manutenção, duplicação ou limpeza sem impacto imediato no usuário;
- `P3`: melhoria oportunista sem benefício mensurável no ciclo atual.

## Fase 0 — preservar e reconciliar

1. trabalhar em branch própria criada a partir do estado real;
2. registrar `git status --short --branch` e o SHA de origem;
3. não apagar arquivos não rastreados nem misturá-los ao escopo;
4. ler `AGENTS.md`, `TASKS.md`, `STATUS.md`, decisões, ADRs e docs do ciclo;
5. apontar tarefas e declarações obsoletas antes de escolher correções;
6. congelar novas funcionalidades enquanto houver P0 ou P1 que invalide sua
   verificação.

## Fase 1 — baseline automatizada

Executar, nesta ordem:

```text
pnpm audit:structure
pnpm lint
pnpm typecheck
pnpm typecheck:strict
pnpm test
pnpm build
```

O comando `audit:structure` é heurístico. Um candidato só pode ser removido
depois de confirmar entradas do Next.js, imports dinâmicos, scripts e uso
externo. Lint, tipos, testes e build aprovados provam apenas os contratos que
estão cobertos.

## Fase 2 — revisão por invariantes

### Tenant e segurança

- toda leitura e mutação recebe tenant explícito e validado no servidor;
- nenhum fallback usa dados, tema ou conteúdo de outro tenant;
- Server Actions revalidam sessão e contexto;
- secrets não aparecem em cliente, relatório ou Git;
- mídia valida prefixo, direito, MIME, dimensão, tamanho e proprietário;
- negativos A → B fazem parte da evidência.

### Integridade e transações

- uma ação do usuário com um único resultado de negócio usa uma transação;
- erro não deixa conteúdo, revisão, distribuição ou auditoria pela metade;
- nenhum resultado de `insert`, `update`, `delete`, RPC ou Storage é ignorado;
- retry não duplica conteúdo nem revisão;
- atualização de JSON faz merge consciente ou substituição explicitamente
  testada; metadados preexistentes não somem por acidente.

### Arquitetura de apresentação

- `site_model` é a fonte de verdade da composição estrutural;
- marca, conteúdo e placements continuam camadas separadas;
- preview e portal usam o mesmo renderer e o mesmo parser de tema;
- diferenças por cliente vêm de dados persistidos, não de `if` por slug;
- um novo modelo entra por registro tipado único e falha fechado;
- nenhum modelo cria árvore de rotas, cópia integral de página ou CSS livre.

### Código morto e complexidade

- confirmar cada arquivo órfão antes de remover;
- arquivos com 400+ linhas recebem justificativa ou plano de extração;
- helpers, aliases e compatibilidade legada precisam de consumidor e data de
  retirada;
- duplicação de allowlist entre TypeScript e SQL recebe teste de paridade;
- supressões de lint/tipos exigem justificativa local.

### Produto e interface

- estados real, vazio, erro, sem permissão e pausado são exercitados;
- UI é verificada em 390, 768 e 1440 px, teclado e zoom de 200%;
- preview não pode ser uma simulação mais simples do que o portal;
- texto, marca, conteúdo e navegação correspondem ao tenant ativo;
- uma captura só vale como evidência depois de hidratação e animação estabilizadas.

## Fase 3 — correção em fatias

Cada achado corrigido vira uma tarefa com:

- resultado para o usuário;
- classe e severidade;
- causa e evidência reproduzível;
- arquivos e invariantes afetados;
- teste que falha antes da correção;
- correção mínima, sem refatoração paralela;
- checks focados e gate completo proporcional;
- risco residual e decisão de rollback.

Não misturar remoção de código morto, mudança de schema, redesign e correção de
segurança no mesmo diff.

## Gate para um novo modelo visual

Um quinto modelo só entra quando:

1. a direção informa público/segmento, promessa visual, nome e ID estável;
2. o modelo difere em pelo menos seis dos oito eixos de `docs/22`;
3. preview e portal compartilham o renderer real;
4. a fonte de verdade `site_model` não depende do trio legado
   `header/hero/card` para criar uma composição nova;
5. allowlists TypeScript e SQL são atualizadas por uma migration compatível;
6. nenhum `if` por novo slug é adicionado ao shell compartilhado;
7. home, editoria e matéria cobrem estados com/sem imagem e catálogo vazio;
8. parser aceita o novo ID e rejeita valor desconhecido;
9. persistência e troca de tenant são provadas sem rebuild;
10. matriz 390/768/1440, acessibilidade, lint, tipos, testes e build passa;
11. não existe P0/P1 estrutural aberto capaz de invalidar essa prova;
12. Preview é aprovado antes de qualquer pedido separado de Production.

## Registro mínimo de evidência

```text
ID / data / branch / SHA base
resultado esperado
invariantes afetados
comandos e resultados
passos de reprodução
arquivos e linhas
P0 / P1 / P2 / P3
correção ou decisão de manter
teste negativo
limitações restantes
```

## Critério de encerramento da revisão

A revisão termina quando:

- P0 é zero;
- todo P1 está corrigido ou bloqueado por decisão externa explícita;
- código morto confirmado foi removido em diff separado;
- documentação descreve o estado atual, não apenas o histórico;
- o caminho de extensão do próximo modelo está testado;
- a nova frente possui contrato visual aprovado e tarefa executável.
