# Status do MVP-0

Atualizado em: 24/07/2026.

## Estado

- documentação de produto: concluída;
- recorte MVP-0: concluído;
- auditoria independente da documentação: aprovada, sem bloqueios P0/P1;
- aplicação: não iniciada;
- Git: pasta sem repositório/remoto;
- GitHub: conta `rafastos-io` autenticada;
- Supabase: um projeto inativo encontrado, não selecionado;
- Vercel: conector não disponível; CLI instalada, mas sessão/token inválido;
- próxima tarefa executável: `T001`.

## Bloqueios externos

1. Confirmar criação/destino do repositório GitHub.
2. Escolher o projeto Supabase existente ou criar outro.
3. Autenticar novamente a Vercel antes do deploy.

## Última auditoria

O verificador independente identificou e as especificações passaram a cobrir:

- gate demo em vez de autenticação real;
- conteúdo fictício não indexável;
- Supabase com acesso server-side e RLS;
- Vercel como alvo;
- seed persistente e idempotente;
- API/RSS comercial fora do MVP-0;
- loop executor/verificador.

## Próxima ação do executor

Executar `T001` após o usuário iniciar a sessão de implementação com `PROMPT-INICIAL-CODEX.md`.
