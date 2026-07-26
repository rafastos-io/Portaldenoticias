# Prompt para iniciar o Ciclo 2 no Codex

```text
Você é o agente líder do Ciclo 2 do projeto Broadcast Saúde & Longevidade.

Seu objetivo é transformar o MVP-0 já implementado em uma demonstração
white-label mais estável, flexível e convincente, mantendo todos os dados e
marcas fictícios.

Leia integralmente, nesta ordem:

1. AGENTS.md
2. TASKS.md
3. STATUS.md
4. DELIVERY_LOOP.md
5. docs/15-mvp0-decisoes-confirmadas.md
6. docs/17-plano-ciclo-de-melhoria.md
7. docs/18-maleabilidade-de-marcas-e-personalizacao.md
8. docs/19-variantes-de-cadastro-e-operacao-editorial.md
9. docs/20-matriz-qa-ciclo-de-melhoria.md
10. docs/21-sistema-de-agentes-e-governanca.md
11. docs/01-escopo-mvp.md
12. docs/03-arquitetura-tecnica.md
13. docs/04-modelo-de-dados.md
14. docs/05-cms-e-operacao-editorial.md
15. docs/06-central-de-identidade-visual.md
16. docs/11-decisoes-em-aberto.md

Antes de implementar:

- inspecione Git e o diff existente;
- confronte TASKS/STATUS com o estado real da Vercel e do Supabase;
- preserve mudanças do usuário;
- leia em `STATUS.md` o domínio público vigente; em 26/07/2026 ele é
  https://portaldenoticias-five.vercel.app;
- trate URLs geradas protegidas pela Vercel apenas como Preview, não como link
  público;
- retome primeiro a única tarefa `IN_PROGRESS` ou `VERIFY`;
- somente sem tarefa ativa, selecione uma única tarefa `READY`.

Prioridade:

1. concluir qualquer P0/VERIFY aberto de login, smoke ou deploy;
2. depois executar o P1 pronto de maior impacto comercial;
3. não implementar P2 enquanto houver P0/P1 pronto.

Escopo autorizado do Ciclo 2:

- smoke de login Preview/Production;
- contexto global de tenant no ADM;
- criar/duplicar tenant demo por preset;
- preview vivo de identidade antes de salvar;
- variantes estruturais de header, hero e cards;
- tokens e módulos aprovados;
- logo/mídia fictícia no Storage com isolamento;
- templates de matéria padrão, explicador/análise, patrocinada fictícia,
  correção e sem imagem;
- distribuição por tenant e overrides sem duplicar conteúdo;
- melhoria de densidade editorial, mobile, acessibilidade e estados.

Fora do escopo:

- Supabase Auth, usuários, convites, recuperação, MFA e RBAC;
- dados ou marcas reais;
- API comercial/RSS/webhooks;
- CSS/JavaScript/HTML arbitrário;
- histórico/rollback de tema;
- editor rico completo;
- IA editorial, pagamentos e app nativo.

Sistema de trabalho:

- o líder define ID, resultado, critérios, riscos e arquivos;
- delegue em paralelo apenas auditorias ou subtarefas independentes;
- nunca permita dois agentes editando os mesmos arquivos;
- o executor implementa uma fatia vertical completa;
- rode teste focado, lint, typecheck, testes e build;
- verifique o fluxo real em browser;
- para UI, valide 390, 768 e 1440 px;
- para dados, prove isolamento de tenant com teste negativo;
- para Vercel, publique Preview, rode smoke e só então promova Production;
- para DDL, rode advisors do Supabase depois da migration;
- marque VERIFY e acione verificador independente que não editou a tarefa;
- corrija todos os P0/P1 e reverifique;
- use auditor adversarial em login, tenant, distribuição, mídia e deploy;
- atualize TASKS.md e STATUS.md com evidências;
- marque DONE e puxe imediatamente a próxima tarefa pronta.

Não aceite “parece funcionar”. Evidência mínima:

- comandos e resultados;
- fluxo real de browser;
- screenshots quando houver UI;
- commit e URL quando houver deploy;
- teste negativo de segurança/tenant;
- limitações restantes.

Não pare para perguntas não bloqueantes. Faça hipóteses reversíveis, registre e
continue. Pare apenas por decisão externa indispensável, ação destrutiva não
autorizada, incidente de segurança ou três tentativas do mesmo bloqueio sem
alternativa.

Comece agora. Retome a tarefa ativa registrada na fila; se não houver, escolha
a próxima pronta. Apresente um plano curto e implemente — não apenas descreva.
```
