# ADR 0003 - Vercel, Supabase e gate demonstrativo

Status: aceito para o MVP-0.

## Contexto

O objetivo atual é validar rapidamente o portal white-label e o fluxo operacional com dados fictícios. Autenticação real, filas e API comercial aumentariam o prazo sem melhorar a demonstração inicial.

## Decisão

- Next.js hospedado na Vercel.
- Supabase Postgres e Storage.
- Acesso ao Supabase pelo servidor.
- RLS em tabelas de schemas expostos.
- Mutações administrativas nunca executadas diretamente pelo browser.
- Gate do ADM com credenciais em variáveis de ambiente e cookie assinado.
- Todo conteúdo marcado como demonstração e não indexável.

## Consequências

Positivas:

- implementação rápida;
- deploy e preview simples;
- persistência real para testar CRUD;
- caminho claro para evoluir.

Negativas:

- login compartilhado sem identidade individual;
- auditoria usa ator fixo `demo-operator`;
- service role no servidor ignora RLS e exige escopo de tenant no código;
- ambiente não pode receber dados reais.

## Condição de saída

Antes de usar conteúdo real ou conceder acesso a clientes:

- substituir gate por autenticação real;
- implementar usuários e papéis;
- revisar RLS com identidades;
- rotacionar segredos;
- revisar logs, retenção e contratos;
- habilitar SEO apenas para conteúdo aprovado.
