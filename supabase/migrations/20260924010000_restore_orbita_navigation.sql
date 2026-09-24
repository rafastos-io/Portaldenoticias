-- Crédito Demo Órbita volta a ter navegação própria.
-- A migration 20260820145053 gravou o menu do catálogo BV em todos os tenants
-- do modelo de crédito. Desde 363a16e a navegação publicada funciona como
-- allowlist, o que faria o Órbita exibir apenas editorias do BV. Decisão do
-- responsável em 24/09/2026: o Órbita mantém suas próprias editorias.
--
-- Não remove nem pausa distribuições: as matérias BV compartilhadas continuam
-- no banco, mas deixam de ser exibidas porque suas editorias saem do menu.
-- Atenção: reexecutar private.apply_bv_educacao_credit_catalog() sobrescreve
-- este menu de novo; nesse caso, reexecutar private.restore_orbita_navigation().

create or replace function private.restore_orbita_navigation()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_version_id uuid;
  v_before jsonb;
  v_after constant jsonb := jsonb_build_array(
    'Início',
    'Crédito para Pessoa Física',
    'Crédito para Empresas',
    'Crédito Imobiliário & Home Equity',
    'Open Finance',
    'Meios de Pagamento',
    'Fintechs & Novos Serviços',
    'IA & Tecnologia Financeira',
    'Segurança & Fraudes',
    'Educação & Planejamento Financeiro',
    'Finanças Comportamentais',
    'Serviços Financeiros 50+'
  );
begin
  select tenant.id, version.id, version.navigation_json
  into v_tenant_id, v_version_id, v_before
  from public.tenants tenant
  join public.themes theme on theme.tenant_id = tenant.id
  join public.theme_versions version on version.id = theme.published_version_id
  where tenant.slug = 'credito-demo-orbita'
    and tenant.kind = 'demo'
    and tenant.is_demo
  for update of version;

  if v_version_id is null then
    raise exception 'Crédito Demo Órbita indisponível';
  end if;

  if v_before = v_after then
    return;
  end if;

  update public.theme_versions
  set
    navigation_json = v_after,
    change_summary = 'Navegação própria do Órbita restaurada; editorias do catálogo BV fora do menu.'
  where id = v_version_id;

  insert into public.audit_events (
    tenant_id, actor_id, action, target_type, target_id, before_json,
    after_json, reason, is_demo
  )
  values (
    v_tenant_id,
    'demo-operator',
    'theme.updated',
    'theme_version',
    v_version_id,
    jsonb_build_object('navigation', v_before),
    jsonb_build_object('navigation', v_after),
    'Órbita volta a ter editorias próprias (decisão do responsável em 24/09/2026).',
    true
  );
end;
$$;

revoke all on function private.restore_orbita_navigation()
from public, anon, authenticated, service_role;

comment on function private.restore_orbita_navigation() is
  'Restaura de forma idempotente a navegação própria do Crédito Demo Órbita.';

select private.restore_orbita_navigation();
