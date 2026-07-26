# Orientações para agentes - Broadcast Saúde & Longevidade

## Missão do repositório

Construir um MVP de uma plataforma editorial B2B multi-tenant para saúde, longevidade e seus impactos econômicos. A plataforma deve:

1. Publicar um portal jornalístico responsivo.
2. Permitir operação editorial rápida e segura.
3. Criar demonstrações white-label para potenciais clientes.
4. Distribuir conteúdo licenciado por portal, feed e API.

Leia primeiro:

- `README.md`
- `docs/15-mvp0-decisoes-confirmadas.md`
- `docs/16-catalogo-ficticio-seed.md`
- `TASKS.md`
- `DELIVERY_LOOP.md`
- `docs/00-visao-do-produto.md`
- `docs/01-escopo-mvp.md`
- `docs/03-arquitetura-tecnica.md`
- `docs/04-modelo-de-dados.md`
- `docs/05-cms-e-operacao-editorial.md`
- `docs/06-central-de-identidade-visual.md`
- `docs/10-roadmap-e-backlog.md`
- `docs/11-decisoes-em-aberto.md`
- `docs/17-plano-ciclo-de-melhoria.md`
- `docs/18-maleabilidade-de-marcas-e-personalizacao.md`
- `docs/19-variantes-de-cadastro-e-operacao-editorial.md`
- `docs/20-matriz-qa-ciclo-de-melhoria.md`
- `docs/21-sistema-de-agentes-e-governanca.md`
- `PROMPT-CICLO-MELHORIA-CODEX.md`

## Estado decidido do MVP-0

- Todos os dados, marcas, autores, organizações, fontes e matérias são fictícios.
- O foco é demonstrar portal white-label, CMS e central de identidade.
- Deploy alvo: Vercel.
- Persistência e mídia: Supabase Postgres + Storage.
- Não usar Supabase Auth no MVP-0.
- O ADM terá um gate demonstrativo com usuário `USER` e senha `User123`, configurados por variáveis de ambiente.
- A validação do gate deve ocorrer no servidor e criar cookie assinado `HttpOnly`.
- Exibir no ADM: `Modo demonstração - autenticação real desativada`.
- Não implementar usuários, convites, recuperação de senha, MFA ou RBAC agora.
- API comercial, feeds licenciados e autenticação de clientes são pós-MVP-0.

## Princípios obrigatórios

- Tratar o produto como multi-tenant desde a primeira migration.
- Separar conteúdo canônico de sua distribuição e apresentação em cada cliente.
- Não duplicar matérias para trocar marca, destaque ou janela de publicação.
- Aplicar `tenant_id` e autorização no servidor; nunca confiar apenas em filtros da interface.
- Manter o conteúdo editorial independente do tema visual.
- Não permitir CSS ou JavaScript arbitrário enviados pelo usuário no MVP.
- No MVP-0, persistir a versão atual da identidade; histórico e rollback são pós-MVP-0.
- Preservar trilha de auditoria para publicação, correções, permissões e alterações de tema.
- Usar dados realistas de saúde e longevidade, mas claramente identificados como demonstração.
- Não usar lorem ipsum nas superfícies principais.
- Construir mobile-first, com acessibilidade e SEO como requisitos de aceite.
- Preferir um monólito modular a microsserviços no MVP.
- Não adicionar dependências ou infraestrutura sem necessidade demonstrável.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` ou secret key no navegador.
- Acesso ao Supabase no MVP-0 deve acontecer no servidor.
- Habilitar RLS em tabelas de schemas expostos, mesmo sem usar Supabase Auth.
- O login fixo é uma exceção temporária e deve ser removido antes de qualquer produção real.

## Limites do MVP

O escopo fechado está em `docs/01-escopo-mvp.md`. Itens marcados como pós-MVP não devem ser implementados silenciosamente. Se forem necessários para uma decisão técnica, registre a proposta em `docs/11-decisoes-em-aberto.md`.

O agente executor deve seguir `DELIVERY_LOOP.md`, atualizar `TASKS.md` e só encerrar quando não houver tarefa P0 pronta ou existir bloqueio externo real.

No Ciclo 2, `docs/17-plano-ciclo-de-melhoria.md` define o recorte promovido.
Os documentos `18` a `21` detalham marcas, cadastro, QA e operação dos
agentes. Eles não autorizam implementar os itens que continuam explicitamente
fora do escopo.

## Qualidade esperada

Antes de concluir uma entrega:

- validar lint, tipos e testes aplicáveis;
- verificar fluxos críticos em desktop e mobile;
- verificar isolamento entre tenants;
- verificar o gate demonstrativo e o isolamento de tenant;
- verificar contraste, foco por teclado e textos alternativos;
- verificar estados vazio, carregando, erro, sem permissão e conteúdo pausado;
- atualizar documentação quando uma decisão mudar.

## Regra de decisão

Quando a documentação divergir:

1. requisitos de segurança e isolamento vencem;
2. `docs/15-mvp0-decisoes-confirmadas.md` e `TASKS.md` definem o MVP-0;
3. `docs/01-escopo-mvp.md` detalha os critérios;
4. ADRs aceitos em `docs/adr/` vencem sugestões anteriores;
5. registrar qualquer hipótese nova antes de implementá-la.
