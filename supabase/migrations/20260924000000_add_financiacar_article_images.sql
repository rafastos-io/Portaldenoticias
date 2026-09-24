-- FinanciaCar: associa as 28 imagens editoriais às matérias demonstrativas.
-- Imagens geradas por IA (ChatGPT) a partir de docs/31-financiacar-prompts-imagens.md
-- e fornecidas pelo responsável em 23/09/2026; arquivos estáticos em
-- public/images/editorial/financiacar/. Altera somente revisões do tenant
-- financiacar, identificadas pelo mesmo UUID determinístico do catálogo.

create or replace function private.apply_financiacar_article_images()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id constant uuid := '00000000-0000-4000-8000-000000000008';
  v_updated integer;
begin
  create temporary table if not exists financiacar_images (
    code text primary key,
    alt text not null
  ) on commit drop;
  truncate table pg_temp.financiacar_images;

  insert into pg_temp.financiacar_images (code, alt) values
    ('FC-001', 'Casal em uma concessionária compara simulações de parcelas em um tablet, com um carro prata ao fundo.'),
    ('FC-002', 'Mãos seguram um celular com gráfico de barras, ao lado de chave de carro, calculadora e miniatura de carro.'),
    ('FC-003', 'Carro compacto para diante de uma rua que se divide em três faixas com setas pintadas no asfalto, ao entardecer.'),
    ('FC-004', 'Mulher em um escritório claro consulta o celular e documentos, com uma miniatura de carro sobre a mesa.'),
    ('FC-005', 'Pátio de concessionária com carros seminovos alinhados ao pôr do sol.'),
    ('FC-006', 'Feirão de carros em pavilhão coberto com bandeirolas azuis, visitantes e um vendedor atendendo uma família.'),
    ('FC-007', 'Homem no sofá de casa navega em um aplicativo de anúncios de carros no celular, com luz de fim de tarde.'),
    ('FC-008', 'Motorista com as duas mãos no volante dirige em uma avenida com trânsito moderado, visto de dentro do carro.'),
    ('FC-009', 'Mecânico de uniforme azul inspeciona o motor de um carro com o capô aberto em uma oficina iluminada.'),
    ('FC-010', 'Pessoa calibra o pneu de um carro com manômetro digital em um posto de combustível.'),
    ('FC-011', 'Compacto vermelho dos anos 1980 estacionado em rua de paralelepípedos de uma cidade histórica ao entardecer.'),
    ('FC-012', 'Garagem de colecionador com carros clássicos, alguns parcialmente cobertos por capas de tecido.'),
    ('FC-013', 'Leilão em galpão: carro clássico sob holofotes no palco e público erguendo placas numeradas de lance.'),
    ('FC-014', 'Avenida com corredor de ônibus e ciclofaixa vermelha, com ônibus articulado e ciclistas em movimento.'),
    ('FC-015', 'Motorista ao lado do carro estacionado em rua arborizada usa o celular perto de uma placa de estacionamento.'),
    ('FC-016', 'Trânsito intenso em avenida de grande cidade ao anoitecer, com filas de faróis vistas do alto.'),
    ('FC-017', 'Carro com bagageiro no teto percorre rodovia sinuosa entre serras verdes e uma represa.'),
    ('FC-018', 'Carros passam sob um pórtico de pedágio sem cancelas em uma rodovia de várias faixas.'),
    ('FC-019', 'Família faz uma pausa na estrada: mãe e filho sentados junto ao porta-malas aberto e pai se alongando.'),
    ('FC-020', 'Painel de instrumentos de um carro com uma luz de alerta amarela acesa, visto por trás do volante.'),
    ('FC-021', 'Mesa azul com calculadora, cofrinho, chave, miniatura de pneu, carrinho e anotações de gastos com o carro.'),
    ('FC-022', 'Mecânico despeja óleo novo no motor de um carro usando um funil, em oficina limpa.'),
    ('FC-023', 'Família posa ao lado de um sedã antigo em frente de casa, com uma criança sorrindo na janela traseira.'),
    ('FC-024', 'Dois carros lado a lado em estúdio branco, um modelo antigo e um moderno, mostrando a evolução do desenho.'),
    ('FC-025', 'Homem sorridente de cerca de 60 anos pole o capô de um carro antigo azul restaurado na própria garagem.'),
    ('FC-026', 'Carros de corrida de turismo disputam posição ao sair de uma curva em um autódromo.'),
    ('FC-027', 'Criança de capacete pilota um kart em uma curva de kartódromo.'),
    ('FC-028', 'Close de um disco de freio incandescente soltando fagulhas em um carro de corrida.');

  update public.content_revisions revision
  set body_json = jsonb_set(
    revision.body_json,
    '{demo_media}',
    jsonb_build_object(
      'mode', 'fallback',
      'fallback_path', '/images/editorial/financiacar/' || lower(image.code) || '.webp',
      'alt', image.alt,
      'credit', 'Imagem gerada por IA para demonstração.',
      'rights_basis', 'demo-ai-generated'
    )
  )
  from pg_temp.financiacar_images image
  join public.content_items item
    on item.id = md5('financiacar:item:' || image.code)::uuid
   and item.owner_tenant_id = v_tenant_id
  where revision.id = md5('financiacar:revision:' || image.code)::uuid
    and revision.content_item_id = item.id;

  get diagnostics v_updated = row_count;
  if v_updated <> 28 then
    raise exception 'Imagens FinanciaCar: esperadas 28 revisões, atualizadas %', v_updated;
  end if;

  insert into public.audit_events (
    id, tenant_id, actor_id, action, target_type, target_id, after_json,
    reason, is_demo
  )
  values (
    md5('financiacar:audit:article-images')::uuid,
    v_tenant_id,
    'demo-operator',
    'content.media_selected',
    'tenant',
    v_tenant_id,
    jsonb_build_object(
      'items', 28,
      'rights_basis', 'demo-ai-generated',
      'path_prefix', '/images/editorial/financiacar/'
    ),
    'Imagens geradas por IA associadas às matérias demonstrativas do FinanciaCar.',
    true
  )
  on conflict (id) do nothing;
end;
$$;

revoke all on function private.apply_financiacar_article_images()
from public, anon, authenticated, service_role;

comment on function private.apply_financiacar_article_images() is
  'Associa de forma idempotente as imagens demonstrativas às 28 matérias do FinanciaCar.';

select private.apply_financiacar_article_images();
