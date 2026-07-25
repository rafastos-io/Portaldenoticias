# API e distribuição

## Status no MVP-0

A API comercial descrita neste documento é pós-MVP-0. O primeiro ciclo entrega apenas uma rota JSON demonstrativa, server-side, filtrada por tenant e com `demo: true`. Ela não usa credenciais comerciais, RSS, webhooks, SLA ou promessa de compatibilidade.

## Objetivo

Entregar conteúdo licenciado de forma previsível para portais e sistemas de clientes. A API do MVP é de leitura e não substitui o CMS.

## Princípios

- contrato versionado;
- IDs estáveis;
- autenticação por tenant;
- menor privilégio;
- paginação consistente;
- sincronização incremental;
- correções e remoções explícitas;
- observabilidade sem armazenar payloads desnecessários;
- compatibilidade antes de riqueza de recursos.

## Canais do MVP

### Portal white-label

Renderização hospedada pela plataforma.

### REST API

Integração programática em JSON.

### RSS

Compatibilidade simples com CMS e leitores existentes.

CSV/XML/FTP podem ser adicionados por demanda contratual, mas não são P0.

## Autenticação

Header:

```http
Authorization: Bearer bsl_live_<prefix>_<secret>
```

Armazenamento:

- prefixo visível;
- segredo exibido uma vez;
- hash forte no banco;
- escopos;
- expiração;
- revogação;
- última utilização;
- rate-limit plan.

Escopos iniciais:

- `content:read`;
- `media:read`;
- `feed:read`.

## Endpoints v1

```text
GET /api/v1/content
GET /api/v1/content/{id}
GET /api/v1/categories
GET /api/v1/authors
GET /api/v1/changes
GET /feeds/{tenant}.rss
GET /api/v1/health
```

Endpoint de mídia pode usar URLs assinadas ou CDN pública conforme direito.

## Listagem

Parâmetros:

- `limit` com máximo;
- `cursor`;
- `published_after`;
- `published_before`;
- `updated_since`;
- `category`;
- `content_type`;
- `include=authors,categories,media`;
- `locale`.

Não expor filtro de outro tenant. O tenant vem da credencial.

## Exemplo de resposta

```json
{
  "data": [
    {
      "id": "cnt_01J...",
      "type": "news",
      "status": "published",
      "headline": "Como a longevidade muda o planejamento previdenciário",
      "subtitle": "Instituições revisam produtos e projeções diante de vidas mais longas.",
      "slug": "longevidade-planejamento-previdenciario",
      "body": {
        "format": "html",
        "value": "<p>Conteúdo licenciado e sanitizado...</p>"
      },
      "authors": [
        {
          "id": "aut_01J...",
          "name": "Redação Broadcast Saúde"
        }
      ],
      "categories": [
        {
          "id": "cat_01J...",
          "name": "Previdência e Seguros",
          "slug": "previdencia-e-seguros"
        }
      ],
      "media": {
        "hero": {
          "url": "https://cdn.example/...",
          "width": 1600,
          "height": 900,
          "alt": "Descrição editorial da imagem",
          "caption": "Legenda",
          "credit": "Crédito",
          "expiresAt": null
        }
      },
      "rights": {
        "code": "full_text_web",
        "allowFullBody": true,
        "allowMedia": true,
        "startsAt": "2026-07-24T12:00:00Z",
        "endsAt": null
      },
      "canonicalUrl": "https://cliente.example/noticias/...",
      "sourceCanonicalUrl": "https://origem.example/...",
      "publishedAt": "2026-07-24T12:00:00Z",
      "updatedAt": "2026-07-24T15:30:00Z",
      "correction": null
    }
  ],
  "page": {
    "nextCursor": "opaque_cursor",
    "hasMore": true
  },
  "meta": {
    "apiVersion": "v1",
    "requestId": "req_01J..."
  }
}
```

O campo `body` pode ser omitido ou reduzido conforme contrato.

## Consulta incremental

`GET /api/v1/changes?since=<cursor>`

Retorna eventos ordenados:

- `published`;
- `updated`;
- `paused`;
- `resumed`;
- `expired`;
- `withdrawn`.

Exemplo de remoção:

```json
{
  "sequence": "chg_01J...",
  "event": "withdrawn",
  "contentId": "cnt_01J...",
  "occurredAt": "2026-07-24T18:00:00Z",
  "reasonCode": "editorial_withdrawal"
}
```

O cliente não deve precisar comparar todos os IDs para descobrir remoções.

## Paginação

Usar cursor opaco baseado em ordenação estável, não offset em grandes coleções.

Ordenação padrão:

1. `published_at desc`;
2. `id desc`.

Cursores devem ser assinados/validados e não conter segredos.

## Idempotência e consistência

- `id` nunca muda;
- `updatedAt` muda em correções e metadata relevante;
- a mesma consulta com o mesmo cursor mantém semântica;
- publicação/pausa propaga dentro do SLO;
- eventual consistency deve ser documentada;
- cliente pode reprocessar item pelo ID.

## RSS

Por tenant:

- título, descrição e logo do tenant;
- GUID baseado no ID estável;
- título distribuído;
- resumo;
- URL;
- autor;
- editoria;
- publicação/atualização;
- imagem quando licenciada;
- limite configurado;
- apenas itens ativos.

RSS protegido pode usar token dedicado na URL apenas se não houver suporte melhor do consumidor; preferir credencial/header quando possível.

## Erros

Formato:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Limite temporariamente excedido.",
    "requestId": "req_01J...",
    "retryAfterSeconds": 30
  }
}
```

Códigos principais:

- `invalid_credentials`;
- `credential_expired`;
- `insufficient_scope`;
- `rate_limit_exceeded`;
- `invalid_cursor`;
- `invalid_parameter`;
- `not_found`;
- `content_not_licensed`;
- `temporarily_unavailable`.

Não diferenciar publicamente “existe, mas não é seu” de “não existe” quando isso vazar catálogo.

## Rate limits

Definir por plano:

- requests/minuto;
- burst;
- volume diário;
- tamanho máximo de página.

Headers:

- limite;
- restante;
- reset;
- request ID.

O MVP precisa de proteção e visibilidade, não de billing automático.

## Webhooks - P1

Eventos:

- conteúdo publicado;
- conteúdo atualizado;
- conteúdo pausado/retirado;
- distribuição iniciada/expirada.

Requisitos:

- assinatura HMAC;
- timestamp;
- replay protection;
- retries;
- endpoint testável;
- histórico de entrega;
- payload aponta para o recurso, sem enviar segredo.

## Compatibilidade

Mudança não breaking:

- campo opcional novo;
- novo valor quando clientes toleram unknown;
- endpoint novo.

Mudança breaking:

- remover/renomear campo;
- mudar tipo;
- alterar semântica;
- tornar campo obrigatório.

Publicar changelog e janela de descontinuação antes de v2.

## Documentação para clientes

Entregar:

- quickstart;
- como criar/rotacionar chave;
- referência de endpoints;
- exemplos em curl e JavaScript;
- política de rate limit;
- modelo de sincronização;
- correções e tombstones;
- status page/contato;
- changelog;
- ambiente sandbox.

## Segurança de conteúdo

- URLs de mídia respeitam licença;
- não expor notas internas, fontes confidenciais ou histórico de revisão;
- sanitizar HTML;
- bloquear embeds inseguros;
- aplicar CORS apenas onde necessário;
- redigir logs;
- limitar campos por escopo/contrato.
