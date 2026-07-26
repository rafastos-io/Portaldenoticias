# Matriz de QA do ciclo de melhoria

## Regra

Uma tarefa com interface ou deploy não pode ser concluída apenas com lint,
tipos, teste unitário ou screenshot. É obrigatório verificar o fluxo real.

## Ambientes

| Ambiente | Uso | Gate |
|---|---|---|
| Local | implementação e testes rápidos | checks + browser |
| Preview Vercel | integração e revisão independente | smoke completo |
| Production demo | pitch/handoff | smoke + auditoria final |

O domínio público atual é
`https://portaldenoticias-five.vercel.app`.
URLs geradas de deployment podem exigir Vercel Authentication e não devem ser
entregues como link público de pitch.

## Smoke de login

Executar nesta ordem:

1. abrir `/admin/login`;
2. confirmar aviso de demonstração;
3. enviar credencial inválida;
4. confirmar ausência de sessão;
5. enviar `USER / User123`;
6. confirmar redirect para `/admin`;
7. confirmar `/api/admin/session` com `demo=true`;
8. recarregar `/admin`;
9. abrir Conteúdo, Identidades e Auditoria;
10. fazer logout;
11. confirmar novo bloqueio e sessão 401.

Em Production, confirmar cookie:

- `HttpOnly`;
- `Secure`;
- `SameSite=Strict`;
- `Path=/`;
- expiração definida.

## Matriz pública

Para cada tenant:

- Banco Demo Horizonte;
- Seguros Demo Atlas;
- Healthtech Demo Lúmen;
- quarta marca criada no ciclo.

Validar:

| Superfície | 390 px | 768 px | 1440 px |
|---|---:|---:|---:|
| Home | obrigatório | obrigatório | obrigatório |
| Editoria | obrigatório | amostra | obrigatório |
| Matéria padrão | obrigatório | amostra | obrigatório |
| Patrocinada | obrigatório | - | obrigatório |
| Correção | obrigatório | - | obrigatório |
| Sem imagem | obrigatório | - | obrigatório |

Critérios:

- sem overflow da página;
- navegação horizontal indicada quando existir;
- um `h1`;
- foco visível;
- zoom 200%;
- alt e crédito;
- demo e patrocinado visíveis;
- conteúdo pausado ausente;
- `noindex, nofollow`;
- título, marca e tema do tenant correto.

## Matriz administrativa

### Conteúdo

- vazio, carregando, erro e sucesso;
- criar, editar, publicar, pausar, retomar;
- template padrão, explicador, patrocinado, correção, sem imagem;
- filtros;
- erro preserva formulário;
- ação dupla bloqueada.

### Identidade

- preset;
- preview não salvo;
- 390/768/1440;
- contraste aprovado/reprovado;
- variante inválida recusada;
- salvar e recarregar;
- quarta marca sem rebuild.

### Distribuição

- um, dois e três destinos;
- overrides;
- revogação isolada;
- pausa/retomada;
- tentativa A → B recusada;
- auditoria por tenant.

## Segurança e dados

- secret scan em arquivos rastreados e bundle;
- nenhuma chave `sb_secret_` no navegador;
- RLS/grants preservados;
- advisor de segurança Supabase sem alertas;
- queries recebem tenant explícito;
- origem externa não cria sessão;
- cookie adulterado expira;
- reset recusado em Production;
- conteúdo real/terceiro: zero.

## Performance e estabilidade

- build Vercel aprovado;
- nenhuma exceção de runtime no smoke;
- hero e conteúdo essencial visíveis mesmo com movimento reduzido;
- imagens sem layout shift relevante;
- nenhuma dependência nova sem justificativa;
- avisos de índice não justificam remoção antes de dados de uso.

## Evidência mínima por tarefa

Registrar em `STATUS.md`:

- tarefa e commit;
- ambiente/URL;
- comandos e resultado;
- passos de browser;
- screenshots desktop/mobile quando houver UI;
- teste negativo de tenant quando houver dados;
- achados P0/P1/P2;
- correções e reverificação;
- limitações restantes.

## Severidade

- `P0`: bloqueia segurança, isolamento, login, fluxo principal ou pitch;
- `P1`: falha relevante de usabilidade, acessibilidade, consistência ou escopo;
- `P2`: melhoria não bloqueante e dívida controlada.

Produção não é promovida com P0/P1 aberto.
