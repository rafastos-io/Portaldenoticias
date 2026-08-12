# ADR 0001 - Monólito modular multi-tenant

Status: proposto.

## Contexto

O MVP precisa combinar portal, CMS, temas, preview e distribuição com equipe e operação ainda em validação. Microsserviços ou bancos separados por cliente aumentariam o custo antes de existir demanda comprovada.

## Decisão

Usar monólito modular com PostgreSQL compartilhado e isolamento lógico por tenant. Dados privados carregam `tenant_id`; regras críticas são aplicadas no servidor, testadas e, quando viável, reforçadas no banco.

## Consequências positivas

- entrega mais rápida;
- transações simples;
- menor custo operacional;
- reaproveitamento de conteúdo;
- criação de demo sem infraestrutura.

## Consequências negativas

- exige disciplina de escopo em toda query;
- um incidente de aplicação pode afetar mais de um tenant;
- módulos precisam de fronteiras claras para não virar código acoplado.

## Gatilhos para reavaliar

- exigência contratual de isolamento físico;
- escala incompatível com banco compartilhado;
- cadências de deploy independentes;
- carga de API ou mídia que exija serviço especializado.
