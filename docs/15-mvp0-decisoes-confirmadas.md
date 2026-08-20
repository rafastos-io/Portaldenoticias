# MVP-0 - decisões confirmadas

Data: 24/07/2026.

## Objetivo

Criar rapidamente uma demonstração convincente do portal editorial white-label e de sua operação administrativa.

## Stack

- Next.js App Router;
- React e TypeScript;
- Tailwind CSS;
- Supabase Postgres;
- Supabase Storage;
- Vercel;
- pnpm;
- GitHub.

## Dados

- tudo fictício;
- nenhuma ingestão externa;
- nenhuma marca real de prospect;
- seed versionado e idempotente;
- `is_demo = true`;
- conteúdo em pt-BR;
- não inventar estudos clínicos atribuídos a instituições reais;
- não indexar o portal enquanto o conteúdo for demonstrativo.

### Emenda da etapa de validação — 09/08/2026

A decisão histórica de catálogo integralmente fictício continua válida para o
seed original do MVP-0, mas foi parcialmente superada para o ecossistema de
saúde. A cliente autorizou formalmente o uso das matérias reais fornecidas no
briefing e no DOCX, com estas condições:

- texto, título e sentido devem ser preservados;
- ajustes permitidos são apenas mecânicos, como separar autoria do corpo;
- campos ausentes podem ser inferidos com cautela e procedência registrada;
- referências externas sem licença de reprodução mantêm somente título,
  autoria/data disponíveis e link para a íntegra;
- o ambiente continua marcado como validação e `noindex` até nova decisão;
- o contrato operacional está detalhado em
  `docs/24-validacao-broadcast-saude-conteudo-real.md`.

### Emenda de marca da validação — 20/08/2026

O responsável autorizou o cadastro da marca `BV Educação` para validação do
portal white-label. A autorização limita-se à identidade da demonstração:

- o logo usa material fornecido para esta validação, com referência ao banco
  de imagens oficial do banco BV;
- o asset fica no Storage privado e isolado do tenant;
- crédito e base de uso `authorized-brand-validation` são obrigatórios;
- o cadastro não autoriza copiar matérias, campanhas ou interfaces do banco;
- o ambiente permanece `kind/status=demo`, `is_demo=true` e `noindex`.

## Marcas fictícias

### Banco Demo Horizonte

- segmento: banco/gestora;
- direção: confiança, patrimônio e análise;
- paleta inicial: azul profundo, azul-claro e dourado discreto;
- pauta: previdência, economia prateada e planejamento.

### Seguros Demo Atlas

- segmento: seguros/previdência;
- direção: proteção, clareza e longevidade;
- paleta inicial: verde-petróleo, areia e coral moderado;
- pauta: prevenção, seguros, cuidados e patrimônio.

### Healthtech Demo Lúmen

- segmento: healthtech/biotecnologia;
- direção: ciência, inovação e precisão;
- paleta inicial: violeta, ciano e cinza frio;
- pauta: biotecnologia, IA em saúde e inovação médica.

Os nomes contêm “Demo” de propósito. Antes de apresentação externa, revisar disponibilidade e substituir por nomes aprovados.

## Conteúdo seed

Entregar pelo menos:

- 24 matérias fictícias;
- 6 editorias;
- 5 autores fictícios;
- 12 tags;
- 3 matérias patrocinadas identificadas;
- 1 matéria pausada;
- 1 draft com `scheduled_at` preenchido apenas para demonstrar o layout futuro;
- 1 com nota de correção;
- 1 sem imagem para testar fallback;
- placements diferentes por tenant.

## Gate do ADM

Credenciais padrão:

```text
Usuário: USER
Senha: User123
```

Implementação:

- valores vêm de `DEMO_ADMIN_USER` e `DEMO_ADMIN_PASSWORD`;
- `DEMO_SESSION_SECRET` assina o cookie;
- comparação no servidor;
- cookie `HttpOnly`, `SameSite=Strict`, `Secure` na Vercel;
- logout;
- `/admin` protegido no servidor;
- aviso permanente de demonstração.

Não implementar:

- Supabase Auth;
- cadastro;
- recuperação;
- múltiplos usuários;
- papéis;
- MFA.

## Supabase

- acesso ao banco apenas pelo servidor Next.js;
- secret/service role nunca usa prefixo `NEXT_PUBLIC_`;
- RLS habilitado em tabelas expostas;
- escrita direta por `anon` bloqueada;
- migrations e seed no repositório;
- Storage com buckets e políticas aplicadas por migration e testadas;
- projeto definitivo: `Portaldenoticias` (`yhatwpxsxntlorfgxpdl`), região `us-east-2`.

O projeto foi criado e escolhido explicitamente pelo responsável em 25/07/2026. O projeto anterior `rafastos-io's Project` permanece inativo e fora do escopo.

## Vercel

- `main` será produção;
- branches e pull requests serão preview;
- variáveis configuradas nos ambientes Preview e Production;
- build deve passar localmente antes do push;
- o repositório será importável pelo dashboard da Vercel.

## Não faz parte do MVP-0

- autenticação real;
- cliente dentro do ADM;
- API comercial;
- RSS autenticado;
- webhooks;
- newsletter;
- dados reais;
- branded content real;
- IA editorial;
- pagamentos;
- app nativo;
- domínio customizado automatizado.

## Critério de conclusão

Uma pessoa consegue:

1. entrar em `/admin/login`;
2. cadastrar, editar, pausar e publicar matéria;
3. trocar o tenant ativo;
4. editar identidade;
5. visualizar home e matéria em desktop/mobile;
6. persistir mudanças no Supabase;
7. abrir três portais visualmente distintos;
8. ver uma rota JSON demo;
9. publicar na Vercel sem erro.
