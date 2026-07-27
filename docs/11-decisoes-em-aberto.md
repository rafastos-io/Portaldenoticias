# Decisões em aberto

## Como usar

Responder primeiro os itens P0. Cada decisão aceita deve virar uma atualização nos documentos afetados e, quando técnica/estrutural, um ADR em `docs/adr/`.

## P0 - bloqueiam o início correto

### D01 - Nome e relação de marca

Pergunta: o produto será uma vertical oficial Broadcast, uma marca “powered by Broadcast” ou um projeto inicialmente independente?

Recomendação: definir uma marca provisória autorizada e regras de co-branding antes do design.

Impacta: domínio, logo, contratos, rodapé, demos e tom editorial.

### D02 - Público prioritário do portal principal

Pergunta: profissionais de investimento, executivos do setor de saúde, público 50+ ou audiência ampla?

Recomendação: priorizar decisores de negócios/finanças e profissionais do setor; escrever de forma acessível sem virar portal de orientação clínica.

Impacta: pauta, profundidade, home, SEO e métricas.

### D03 - Produto comercial a validar primeiro

Opções:

- portal white-label;
- feed/API;
- hub temático patrocinado;
- pacote combinado.

Decidido para o MVP-0: portal white-label + CMS + central de identidade. Feed/API comercial será validado depois; haverá apenas rota JSON demo.

### D04 - Origem do conteúdo

Decidido para o MVP-0: todo conteúdo será fictício e persistido como seed demonstrativo. Nenhum texto, imagem ou dado real será ingerido.

Para o produto real, permanece a pergunta: redação própria, Agência Estado/Broadcast, parceiros, curadoria licenciada ou combinação?

É obrigatório definir direitos de:

- texto;
- imagem;
- republicação;
- adaptação de título;
- API/RSS;
- território;
- duração.

### D05 - Governança editorial de saúde

Perguntas:

- quem aprova?
- quais temas exigem revisão médica?
- qual SLA de breaking news?
- qual política de correção/retirada?
- como tratar estudos e press releases?

### D06 - Tenants do MVP

Pergunta: quais três perfis reais devem orientar as demos?

Decidido:

1. banco/gestora;
2. seguradora/previdência;
3. healthtech/farma.

Usar apenas marcas fictícias claramente demonstrativas.

### D07 - Canonical e SEO de conteúdo sindicado

Pergunta: qual domínio será canônico quando a mesma matéria estiver no portal principal e no cliente?

Opções dependem de exclusividade, contrato e estratégia de audiência. Não deixar o sistema decidir implicitamente.

### D08 - Política de pausa/retirada

Pergunta: o que a URL pública retorna quando uma matéria é pausada ou retirada?

Recomendação:

- pausa temporária: página neutra/404 e remoção de listagens;
- retirada permanente: 410 ou nota editorial conforme o caso;
- API: tombstone sempre que já distribuída.

Validar com editorial, SEO e jurídico.

### D09 - Acesso do cliente ao admin

Pergunta: cliente apenas vê preview/relatório ou edita marca e curadoria?

Decidido para o MVP-0: não há acesso de cliente. Existe apenas um gate de ADM demonstrativo com `USER / User123`.

### D10 - Hospedagem e fornecedores

Decidido parcialmente:

- aplicação: Vercel;
- banco e storage: Supabase;
- autenticação: não usar no MVP-0;
- gate demo por variável de ambiente e cookie assinado;
- região preferencial do Supabase: São Paulo quando disponível.

Ainda decidir observabilidade e o projeto Supabase definitivo.

## P1 - definem detalhes do produto

### D11 - Idiomas e países

Recomendação: pt-BR no MVP, schema preparado para locale sem implementar tradução.

### D12 - Newsletter

Pergunta: apenas CTA/captura ou envio completo?

Recomendação: CTA e integração futura; envio fora do P0.

### D13 - Métricas compartilhadas com cliente

Definir quais dados podem ser exibidos:

- acessos do preview;
- consumo API;
- visualizações;
- cliques;
- desempenho editorial.

### D14 - Branded content

Definir:

- label;
- aprovação;
- separação editorial/comercial;
- medição;
- expiração;
- co-branding.

### D15 - Publicidade

Pergunta: haverá inventário de anúncios no portal/hubs?

Recomendação: fora do MVP, preservando slots futuros apenas se houver caso comercial.

### D16 - Upload de fontes

Recomendação: biblioteca aprovada no MVP; upload somente por superadmin com comprovação de licença.

### D17 - API: corpo completo ou resumo

Deve ser configurável por contrato/distribuição, não uma decisão global.

### D18 - Sandbox de API

Recomendação: usar o próprio tenant demo com credencial de escopo e conteúdo fictício.

### D19 - Aprovação de tema

Pergunta: comercial pode publicar tema ou apenas salvar demo?

Recomendação: comercial publica preview de demo; produção exige admin do tenant.

### D20 - Analytics e cookies

Escolher solução e base legal antes de inserir scripts.

## P2 - observar demanda

- widgets incorporáveis;
- XML/CSV/FTP;
- webhooks;
- SSO;
- newsletters automatizadas;
- conteúdo multimídia;
- tradução;
- data products;
- alertas em tempo real;
- paywall;
- aplicativos;
- IA assistiva.

## Registro de respostas

| ID | Decisão | Responsável | Data | Status |
|---|---|---|---|---|
| D01 | A definir | Negócio/Marca | - | Aberta |
| D02 | A definir | Editorial/Negócio | - | Aberta |
| D03 | White-label + CMS; API comercial depois | Comercial/Produto | 24/07/2026 | Decidida MVP-0 |
| D04 | Conteúdo 100% fictício no MVP-0; origem real depois | Editorial/Jurídico | 24/07/2026 | Decidida MVP-0 |
| D05 | A definir | Editorial/Jurídico | - | Aberta |
| D06 | Três segmentos com marcas fictícias | Comercial/Produto | 24/07/2026 | Decidida MVP-0 |
| D07 | A definir | Growth/Editorial/Jurídico | - | Aberta |
| D08 | A definir | Editorial/SEO/Jurídico | - | Aberta |
| D09 | Apenas ADM demo com USER/User123 | Produto/Comercial | 24/07/2026 | Decidida MVP-0 |
| D10 | Vercel + Supabase; projeto ainda a escolher | Tecnologia/Segurança | 24/07/2026 | Parcial |
| D21 | Criar e duplicar tenants apenas demonstrativos por preset no Ciclo 2 | Produto/Comercial | 26/07/2026 | Decidida Ciclo 2 |
| D22 | Logo e mídia fictícia no Storage isolado por tenant no Ciclo 2 | Produto/Tecnologia | 26/07/2026 | Decidida Ciclo 2 |
| D23 | Templates editoriais demonstrativos padrão, explicador/análise, patrocinado, correção e sem mídia no Ciclo 2 | Editorial/Produto | 26/07/2026 | Decidida Ciclo 2 |
| D24 | Edição de distribuição e overrides apenas para canal portal demo no Ciclo 2 | Editorial/Produto | 26/07/2026 | Decidida Ciclo 2 |
| D25 | Cotações de referência podem aparecer no portal com API pública sem chave, cache server-side, fonte/data explícitas e fallback; não são tempo real nem recomendação financeira | Produto/Editorial/Tecnologia | 27/07/2026 | Decidida Ciclo 2 |
| D26 | O aviso público em faixa foi removido do portal a pedido do responsável; `noindex`, dados demo, rótulos editoriais e o aviso permanente do ADM continuam preservados | Produto/Comercial | 27/07/2026 | Decidida Ciclo 2 |
| D27 | A faixa pode usar no MVP-0 as ações PETR4, VALE3, ITUB4 e MGLU3 disponíveis no modo público de teste da brapi; qualquer ampliação exige token server-only, cache e nova decisão explícita | Produto/Editorial/Tecnologia | 27/07/2026 | Decidida Ciclo 2 |
