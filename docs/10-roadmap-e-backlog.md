# Roadmap e backlog

## Estratégia

Construir por fatias verticais demonstráveis. A primeira fatia deve provar:

`matéria -> revisão -> distribuição -> portal temático -> preview`.

Evitar fazer todo o banco, depois todo o admin e só então ver uma página.

O quadro operacional oficial está em `TASKS.md`. Este documento preserva a visão de roadmap.

## Fase 0 - decisões e fundação

Saídas:

- decisões P0 respondidas;
- ADRs iniciais;
- stack e hospedagem;
- design direction escolhida;
- schema inicial;
- gate demonstrativo do ADM;
- política de conteúdo demo;
- ambientes e CI.

Gate: equipe consegue explicar o que é conteúdo canônico, distribuição, placement e tema sem ambiguidades.

## Fase 1 - primeira fatia editorial

Entregar:

- login visual com credencial demo;
- cookie assinado e guard server-side;
- tenant editorial;
- matéria/revisão mínima;
- editor estruturado;
- publicação manual;
- home e matéria com tema base;
- seed realista;
- auditoria mínima.

Gate: conteúdo criado no admin aparece no portal e pode ser corrigido com histórico.

## Fase 2 - multi-tenant e white-label

Entregar:

- resolução por tenant;
- tema com tokens;
- assets de marca;
- três presets;
- preview desktop/mobile;
- versão e rollback;
- link de demo;
- isolamento testado.

Gate: comercial monta e compartilha três demos sem alteração de código ou deploy.

## Fase 3 - workflow e curadoria

Entregar:

- revisão/aprovação;
- agendamento;
- pausa/retomada;
- agenda;
- placements;
- distribuição por tenant;
- notificações operacionais.

Gate: redação opera um ciclo completo e publisher controla o que cada tenant recebe.

## Fase 4 - API/RSS e piloto

Fica fora do MVP-0 e começa após validação comercial.

Entregar:

- credenciais;
- API v1;
- consulta incremental;
- tombstones;
- RSS;
- rate limit;
- documentação;
- métricas de uso;
- hardening e runbooks.

Gate: um consumidor de teste sincroniza publicação, correção e retirada sem acesso indevido.

## Fase 5 - estabilização

Entregar:

- acessibilidade;
- performance;
- SEO;
- recuperação de falhas;
- backup/restore;
- observabilidade;
- revisão jurídica/editorial;
- correções do piloto.

Gate: critérios de aceite de `docs/01-escopo-mvp.md` atendidos.

## Épicos P0

### E01 - Tenancy e acesso

- `TEN-001` criar tenant e estados;
- `TEN-002` resolver tenant por host/preview;
- `TEN-003` gate demo do ADM;
- `TEN-004` cookie assinado e logout;
- `TEN-005` aviso de modo demonstração;
- `TEN-006` suspensão;
- `TEN-007` testes de isolamento.

### E02 - Conteúdo e revisão

- `CNT-001` criar matéria;
- `CNT-002` autosave;
- `CNT-003` editor rico seguro;
- `CNT-004` mídia e direitos;
- `CNT-005` autoria/taxonomia/fontes;
- `CNT-006` preview;
- `CNT-007` enviar/devolver/aprovar;
- `CNT-008` publicar/agendar;
- `CNT-009` pausar/retomar/arquivar;
- `CNT-010` correções e versões;
- `CNT-011` busca/filtros/admin.

### E03 - Portal

- `WEB-001` home;
- `WEB-002` editoria;
- `WEB-003` matéria;
- `WEB-004` autor;
- `WEB-005` busca;
- `WEB-006` navegação/rodapé;
- `WEB-007` noindex/no sitemap no modo demo; SEO real pós-MVP-0;
- `WEB-008` acessibilidade;
- `WEB-009` responsividade;
- `WEB-010` estados de indisponibilidade.

### E04 - Identidade

- `THM-001` schema de tokens;
- `THM-002` biblioteca de assets;
- `THM-003` editor de marca;
- `THM-004` cores/contraste;
- `THM-005` fontes aprovadas;
- `THM-006` variantes;
- `THM-007` preview de viewports;
- `THM-008` publicar versão;
- `THM-009` rollback;
- `THM-010` presets e seeds.

### E05 - Curadoria e distribuição

- `DST-001` autorizar conteúdo por tenant;
- `DST-002` janela/canais/direitos;
- `DST-003` overrides;
- `DST-004` slots/placements;
- `DST-005` fallback;
- `DST-006` expiração;
- `DST-007` invalidação de cache.

### E06 - Preview comercial

- `DMO-001` criar/duplicar demo;
- `DMO-002` selecionar coleção;
- `DMO-003` gerar link;
- `DMO-004` expirar/revogar;
- `DMO-005` senha opcional;
- `DMO-006` converter para trial;
- `DMO-007` analytics agregado.

### E07 - API e feed

Pós-MVP-0, exceto uma rota JSON claramente demonstrativa.

- `API-001` credenciais;
- `API-002` content list/detail;
- `API-003` categories/authors;
- `API-004` cursor;
- `API-005` changes/tombstones;
- `API-006` RSS;
- `API-007` rate limit;
- `API-008` uso agregado;
- `API-009` documentação.

### E08 - Plataforma

- `OPS-001` migrations;
- `OPS-002` storage;
- `OPS-003` fila;
- `OPS-004` scheduler idempotente;
- `OPS-005` logs/erros;
- `OPS-006` auditoria;
- `OPS-007` backup/restore;
- `OPS-008` segurança de headers/uploads;
- `OPS-009` CI/CD;
- `OPS-010` runbooks.

## Sequência técnica recomendada

1. schema mínimo e contexto de tenant;
2. gate demonstrativo do ADM;
3. conteúdo + uma página pública;
4. revisions/workflow;
5. distribuição + tenant secundário;
6. tokens + tema;
7. preview;
8. placements;
9. agendamento/worker;
10. rota JSON demo;
11. hardening.

## Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| White-label virar page builder | atraso e bugs | presets + tokens + variantes |
| Duplicar conteúdo por cliente | correções inconsistentes | separar item, distribuição e placement |
| Vazamento entre tenants | crítico | contexto explícito, testes e defesa no banco |
| Conteúdo de saúde impreciso | reputacional/legal | fontes, checklist, revisão e correção |
| Escopo copiar toda Broadcast | inviável | três produtos fechados do MVP |
| Integração de cliente dominar roadmap | alto | API v1 estável e sandbox |
| Tema quebrar acessibilidade | alto | validação e fallbacks |
| Demos usarem marcas sem autorização | legal/comercial | identidades fictícias ou autorização formal |
| Imagem sem direito no feed | legal | direito separado do texto |
| Publicação agendada falhar | editorial | jobs idempotentes, alertas e retry |

## Critérios para adiar uma história

Adiar quando:

- não prova a tese comercial;
- existe alternativa manual segura;
- exige novo fornecedor sem necessidade;
- amplia superfície de segurança;
- depende de decisão de negócio não tomada;
- não tem usuário e resultado claros.

## Pós-MVP orientado por sinais

- newsletters: quando houver lista e operação;
- widgets: quando clientes pedirem incorporação parcial;
- XML/FTP: quando contrato justificar;
- tradução: quando houver cliente/mercado;
- app: quando dados mostrarem recorrência mobile;
- busca dedicada: quando FTS não atingir metas;
- IA: quando houver tarefa repetitiva mensurável e governança;
- dados/indicadores: quando fontes e licenças estiverem definidas.
