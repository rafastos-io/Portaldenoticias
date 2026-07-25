# Experiência e arquitetura da informação

## Princípio

Existem duas experiências distintas:

- portal público, orientado a leitura e descoberta;
- console interno, orientado a operação e controle.

Elas compartilham conteúdo e design system, mas não a mesma navegação.

## Mapa do portal público

```text
/
/ultimas
/editoria/[slug]
/materia/[slug]
/autor/[slug]
/tag/[slug]
/busca?q=
/sobre
/contato
/politica-de-privacidade
/termos-de-uso
```

O prefixo `/materia/` pode ser removido na estratégia final de URL. Manter redirects e IDs internos estáveis.

## Home

Ordem recomendada:

1. cabeçalho e navegação;
2. hero principal;
3. destaques secundários;
4. últimas notícias;
5. blocos das editorias prioritárias;
6. explicador/dossiê;
7. branded content identificado;
8. CTA de newsletter ou contato;
9. rodapé institucional e co-branding.

O tenant controla módulos e ordem dentro dos limites do preset.

### Mobile

- uma coluna principal;
- manchete hero sem corte excessivo;
- navegação em menu acessível;
- últimas notícias próximas do topo;
- cards com alvo de toque adequado;
- sem carrossel obrigatório;
- branded identificado antes do título;
- imagens com proporção estável.

### Desktop

- hierarquia editorial mais densa;
- até três níveis de destaque visível;
- linhas de texto com comprimento controlado;
- módulos alinhados em grid;
- espaço publicitário apenas se o modelo comercial aprovar.

## Página de editoria

- nome e descrição curta;
- destaque opcional;
- lista cronológica;
- filtros somente se houver volume real;
- paginação preparada para indexação futura;
- metadados próprios;
- estado vazio útil em demos.

## Página de matéria

Ordem:

1. label de editoria/tipo/patrocínio;
2. título;
3. linha fina;
4. autoria;
5. publicação e atualização;
6. compartilhamento;
7. imagem, legenda e crédito;
8. corpo;
9. fontes/metodologia quando aplicável;
10. nota de correção;
11. tags;
12. autor;
13. relacionadas;
14. co-branding/disclaimer.

### Regras de leitura

- coluna de texto entre aproximadamente 65 e 78 caracteres;
- corpo nunca menor que 16 px;
- intertítulos claros;
- links distinguíveis sem depender apenas de cor;
- tabelas com scroll ou reflow;
- notas e fontes legíveis;
- publicidade não pode parecer conteúdo editorial.

## Busca

Resultados mostram:

- título;
- linha fina curta;
- editoria;
- data;
- tipo;
- imagem opcional.

Estados:

- consulta vazia;
- digitando;
- sem resultado, com sugestões;
- erro;
- resultados paginados.

Busca respeita distribuição e não revela título de item não licenciado.

## Página de autor

- nome;
- foto;
- bio;
- credenciais e especialidades;
- transparência/conflito quando aplicável;
- matérias publicadas;
- contato somente se público.

## Preview comercial

Deve parecer o portal final, com diferenças controladas:

- `noindex`;
- `nofollow`;
- fora de sitemap e RSS discovery;
- aviso visível de conteúdo e marca fictícios;
- banner discreto “demonstração” se a política exigir;
- sem formulário real ou coleta de lead não aprovada;
- conteúdo demonstrativo sinalizado internamente;
- link expirado apresenta tela neutra, sem revelar o tenant.

## Mapa do console interno

```text
/admin
/admin/conteudo
/admin/conteudo/novo
/admin/conteudo/[id]
/admin/revisoes
/admin/agenda
/admin/curadoria
/admin/distribuicao
/admin/identidades
/admin/identidades/[id]
/admin/clientes
/admin/clientes/[id]
/admin/midia
/admin/usuarios
/admin/integracoes
/admin/auditoria
/admin/configuracoes
```

## Dashboard por papel

### Editorial

- rascunhos;
- aguardando revisão;
- agenda de hoje;
- publicações com falha;
- correções pendentes;
- mídia vencendo.

### Comercial

- demos recentes;
- previews ativos/expirando;
- último acesso do preview;
- criar demonstração;
- converter para trial.

### Admin

- tenants ativos/suspensos;
- falhas de jobs;
- uso de API;
- credenciais vencendo;
- eventos de segurança.

## Responsividade do admin

O portal precisa ser excelente no celular. O admin precisa ser utilizável no celular para ações urgentes, mas edição longa e central de identidade podem priorizar tablet/desktop.

No celular, suportar:

- ver agenda;
- aprovar/devolver;
- pausar/retomar;
- checar preview;
- revogar link;
- responder a falha.

Não prometer no MVP uma experiência completa de construção de tema em tela pequena.

## Padrões de interação

- ações primárias consistentes;
- confirmação descreve impacto e tenant;
- ações destrutivas exigem motivo quando aplicável;
- toast não é o único lugar de uma mensagem importante;
- formulários preservam dados após erro;
- atalhos de teclado opcionais e visíveis;
- breadcrumbs em níveis profundos;
- tenant atual sempre visível no admin;
- demos têm tratamento visual distinto para reduzir erro.

## SEO

Enquanto todo o conteúdo for fictício, SEO fica deliberadamente desativado: `noindex, nofollow`, sem sitemap público, sem RSS discovery e sem submissão a buscadores. Os itens abaixo entram quando houver conteúdo real aprovado.

- title e description por tenant;
- canonical decidido por contrato;
- Open Graph e social image;
- `NewsArticle`/`Article` estruturado;
- `datePublished` e `dateModified`;
- autor e publisher;
- sitemap por tenant;
- RSS discovery;
- redirects gerenciados;
- `noindex` para admin, staging e preview;
- política para conteúdo sindicado.

Conteúdo distribuído em vários domínios exige decisão explícita sobre canonical e exclusividade.

## Acessibilidade

Meta: WCAG 2.2 AA aplicável.

- landmarks;
- skip link;
- heading hierarchy;
- foco visível;
- teclado;
- labels e mensagens de erro;
- contraste;
- touch targets;
- texto alternativo;
- reduced motion;
- sem autoplay;
- zoom e reflow;
- aviso de links externos quando necessário.

## Performance percebida

- skeleton apenas quando útil;
- reservar espaço de imagem;
- fontes limitadas;
- priorizar hero;
- lazy-load abaixo da dobra;
- evitar hidratação de componentes estáticos;
- cache por versão;
- paginação em listas extensas.

## Conteúdo vazio de demonstração

Não usar lorem ipsum. Preparar uma biblioteca fictícia coerente com:

- inovação médica;
- previdência e seguros;
- economia prateada;
- saúde corporativa;
- biotecnologia;
- regulação;
- prevenção.

Manchetes devem ser plausíveis, mas não afirmar resultados médicos inventados como fatos reais. Usar marcadores de demonstração e fontes fictícias claramente identificadas no ambiente interno.
