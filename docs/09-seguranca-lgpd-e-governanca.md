# Segurança, LGPD e governança

## Aviso

Este documento orienta produto e engenharia. Políticas de privacidade, contratos, direitos autorais, retenção e conteúdo de saúde devem ser validados pelas áreas jurídica, editorial e de segurança.

## Ativos mais sensíveis

- conteúdo ainda sob embargo;
- fontes e notas internas;
- credenciais de API;
- dados de usuários administrativos;
- configurações e analytics de clientes;
- links privados de demonstração;
- ativos com direitos limitados;
- histórico de correções;
- domínios e registros de marca.

## Ameaças prioritárias

1. vazamento entre tenants;
2. publicação indevida ou antecipada;
3. roubo de credencial;
4. preview compartilhado fora do público;
5. injeção por conteúdo rico;
6. upload malicioso;
7. quebra de licença de imagem/texto;
8. alteração de tema para phishing;
9. enumeração de conteúdo não licenciado;
10. perda de trilha de auditoria.

## Controles de acesso

### Exceção temporária do MVP-0

O MVP-0 usa um único gate demonstrativo `USER / User123`, configurado no ambiente e validado no servidor. Não existe identidade individual, RBAC ou Supabase Auth.

Controles mínimos obrigatórios:

- cookie assinado, `HttpOnly`, `SameSite=Strict`;
- `Secure` na Vercel;
- segredo de assinatura forte fora do repositório;
- rate limit simples no login quando viável;
- aviso permanente de demonstração;
- somente dados fictícios;
- nenhuma operação ou informação real;
- nenhuma secret/service role no navegador.

Antes de inserir dados reais, convidar clientes ou chamar o ambiente de produção, substituir o gate por autenticação real e aplicar os controles abaixo.

- autenticação forte;
- MFA para superadmin e publisher recomendado/obrigatório antes de produção;
- sessão curta para ações sensíveis;
- reautenticação para gerar chave ou mudar domínio;
- capabilities no servidor;
- menor privilégio;
- suspensão imediata;
- revisão periódica de memberships;
- conta individual, nunca login compartilhado.

## Isolamento multi-tenant

- contexto de tenant obrigatório;
- queries com escopo;
- testes negativos;
- storage prefixado e autorizado;
- cache com tenant na chave;
- filas carregam tenant e validam novamente;
- logs e métricas segregados;
- exports não misturam tenants;
- domínio não decide autorização administrativa sozinho.

## Segredos

- secret manager por ambiente;
- nunca no repositório;
- API keys com hash;
- preview tokens com hash;
- rotação;
- expiração;
- redaction em logs;
- nenhum segredo em URL, salvo exceção justificada de RSS legado;
- acesso humano mínimo.

## Conteúdo rico e uploads

- allowlist de nós;
- sanitização server-side;
- proteção contra XSS armazenado;
- URLs validadas;
- CSP;
- uploads por URL assinada;
- MIME real e extensão;
- limite de tamanho;
- bloqueio de SVG ativo não confiável;
- malware scan quando disponível;
- derivados gerados em ambiente isolado;
- metadados sensíveis removidos de imagens.

## Ações sensíveis

Exigir confirmação e motivo:

- publicação urgente;
- pausa/retirada;
- mudança de canonical;
- publicação de tema;
- mudança de domínio;
- suspensão de tenant;
- geração/revogação de chave;
- mudança de papel;
- exportação.

Registrar em auditoria append-only.

## LGPD

### Dados pessoais previstos

- usuários administrativos;
- autores;
- especialistas/fontes quando publicáveis;
- contatos de clientes;
- eventos de acesso;
- visitantes apenas se analytics/cookies forem usados.

### Princípios

- finalidade;
- minimização;
- transparência;
- retenção definida;
- segurança;
- acesso restrito;
- base legal documentada;
- processo de titular;
- contratos com operadores.

### Analytics

- preferir dados agregados;
- evitar fingerprinting;
- IP truncado/hash conforme política;
- não registrar conteúdo de formulários;
- consentimento quando necessário;
- distinguir analytics essenciais e marketing.

### Jornalismo

O tratamento jornalístico pode ter regras e exceções específicas, mas isso não elimina obrigações de segurança, precisão, direitos de personalidade e governança. O jurídico deve definir o processo para pedidos de correção, oposição e remoção.

## Governança de conteúdo de saúde

### Transparência

- autoria e atualização;
- fontes;
- natureza do estudo;
- conflitos;
- patrocinador;
- nota de correção;
- disclaimer quando necessário.

### Revisão médica

Definir quais temas exigem revisão por profissional qualificado, por exemplo:

- diagnóstico e tratamento;
- medicamentos;
- risco individual;
- afirmações de eficácia;
- orientação clínica.

Conteúdo de economia da saúde pode exigir revisão editorial especializada, não necessariamente clínica.

### IA

No MVP:

- IA pode apoiar resumo interno, tags ou transcrição apenas com revisão humana e política aprovada;
- IA não publica;
- não enviar conteúdo sob embargo ou dados pessoais a provedor não contratado;
- registrar quando IA participar de etapa relevante;
- checar fontes e direitos;
- não gerar citação inexistente.

## Branded content

- label inequívoco;
- patrocinador visível;
- separação de aprovação editorial e comercial;
- contrato/referência;
- janela;
- proibir alegações médicas não sustentadas;
- não permitir que tema esconda o label;
- analytics separado quando necessário.

## Direitos autorais e mídia

Cada asset deve registrar:

- titular/fornecedor;
- base de uso;
- canais autorizados;
- tenants autorizados;
- território;
- expiração;
- crédito obrigatório.

Distribuir texto não implica automaticamente distribuir imagem.

## Retenção sugerida para decisão

| Dado | Direção inicial |
|---|---|
| Revisões publicadas | longo prazo, conforme política editorial |
| Auditoria sensível | 1 a 5 anos conforme risco/contrato |
| Logs técnicos detalhados | 30 a 90 dias |
| Agregados de API | 12 a 24 meses |
| Preview expirado | metadados mínimos por 90 dias |
| Credencial revogada | hash/prefixo e auditoria conforme retenção |
| Draft abandonado | revisão após 180 dias |
| Dados de convite | excluir após expiração + janela operacional |

Prazos finais dependem de jurídico, segurança e contratos.

## Backups e continuidade

- backup automatizado;
- criptografia em trânsito e repouso;
- restauração testada;
- cópia separada;
- runbook de incidente;
- contatos e responsabilidades;
- registro de perda/indisponibilidade;
- comunicação contratual.

## Observabilidade segura

Logs devem incluir:

- request ID;
- tenant ID;
- actor ID quando aplicável;
- ação;
- status;
- latência;
- erro normalizado.

Logs não devem incluir:

- segredo/token;
- senha;
- corpo editorial completo;
- notas confidenciais;
- dado pessoal desnecessário;
- payload integral de webhook.

## Checklist antes de piloto

- threat modeling;
- teste de isolamento;
- revisão de permissões;
- headers e CSP;
- dependências;
- secret scanning;
- backup/restore;
- rotação de chave;
- revogação de preview;
- incidente simulado de pausa;
- política de correção;
- termos e privacidade;
- contrato de licenciamento;
- revisão de marcas usadas nas demos.
