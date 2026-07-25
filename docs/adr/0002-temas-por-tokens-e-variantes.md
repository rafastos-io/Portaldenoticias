# ADR 0002 - Temas por tokens e variantes

Status: proposto.

## Contexto

A central de identidade precisa ser flexível para vendas, mas CSS/JavaScript livre por cliente aumenta risco de segurança, acessibilidade, suporte e regressão.

## Decisão

Representar identidade como schema versionado contendo marca, tokens semânticos, variantes aprovadas, navegação e presets de layout. Publicações de tema são snapshots imutáveis com rollback.

## Consequências positivas

- preview e produção usam o mesmo runtime;
- temas são validáveis;
- acessibilidade pode ser bloqueada antes da publicação;
- atualizações do design system propagam de forma controlada;
- não há fork por cliente.

## Consequências negativas

- liberdade menor que um page builder;
- novos pedidos podem exigir criar uma variante;
- migrações de schema de tema precisam ser planejadas.

## Gatilhos para reavaliar

- clientes pedirem composição muito diferente;
- biblioteca de variantes crescer sem governança;
- contratos exigirem componentes próprios;
- existir equipe dedicada a extensões isoladas e seguras.
