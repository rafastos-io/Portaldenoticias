import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl || databaseUrl.includes("replace-with")) {
  console.log("DATABASE_URL não configurada ou contendo dados fictícios. Usando apenas fallbacks de código e seed.");
  process.exit(0);
}

const parsedDatabaseUrl = new URL(databaseUrl);
const isLocalDatabase = ["127.0.0.1", "localhost"].includes(parsedDatabaseUrl.hostname);

const sql = postgres(databaseUrl, {
  max: 1,
  ssl: isLocalDatabase ? false : "require",
});

try {
  await sql`
    insert into public.tenants (
      id, slug, display_name, kind, status, settings_json, is_demo
    )
    values (
      '00000000-0000-4000-8000-000000000007',
      'bv-educacao',
      'BV Educação',
      'demo',
      'demo',
      '{"slogan":"Educação financeira e soluções de crédito para todas as fases da vida","segment":"serviços financeiros/crédito","fallback_image":"/images/editorial-hero-demo.png"}'::jsonb,
      true
    )
    on conflict (id) do update set
      slug = excluded.slug,
      display_name = excluded.display_name,
      kind = excluded.kind,
      status = excluded.status,
      settings_json = excluded.settings_json,
      is_demo = excluded.is_demo,
      updated_at = now();
  `;

  const themeResult = await sql`
    select cms_save_theme_v2(
      p_tenant_id => '00000000-0000-4000-8000-000000000007'::uuid,
      p_brand_name => 'BV Educação',
      p_slogan => 'Educação financeira e soluções de crédito para todas as fases da vida',
      p_site_model => 'financial-services-credit',
      p_font => 'sans-geometrica',
      p_primary => '#002B49',
      p_secondary => '#0099DA',
      p_accent => '#00BAF2',
      p_background => '#F4F6F8',
      p_text_color => '#101828',
      p_header => 'masthead-clean',
      p_hero => 'featured-grid',
      p_card => 'image-top'
    ) as version_id;
  `;

  console.log("Tenant e tema 'BV Educação' salvos no banco com sucesso. ID da versão:", themeResult[0]?.version_id);
} catch (error) {
  console.warn("Aviso ao conectar ao banco remota/localmente:", error.message);
} finally {
  await sql.end();
}
