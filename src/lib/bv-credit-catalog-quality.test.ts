import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260820145053_add_bv_educacao_credit_catalog.sql",
    import.meta.url,
  ),
  "utf8",
);
const seed = readFileSync(
  new URL("../../supabase/seed.sql", import.meta.url),
  "utf8",
);

describe("catálogo autorizado da BV Educação", () => {
  it("mantém 21 conteúdos canônicos e dez categorias editoriais", () => {
    const codes = new Set(migration.match(/'BV-\d{3}'/g));
    const categories = [
      "Indicadores",
      "Investimentos",
      "Alerta de golpes",
      "Programando o futuro",
      "Isso ou aquilo",
      "Saia das dívidas",
      "Alívio no orçamento",
      "Guias",
      "Dicas valiosas",
      "Glossário",
    ];

    expect(codes.size).toBe(21);
    for (const category of categories) expect(migration).toContain(category);
  });

  it("distribui por modelo de crédito sem duplicar o corpo por tenant", () => {
    expect(migration).toContain(
      "version.components_json ->> 'site_model' = 'financial-services-credit'",
    );
    expect(migration).toContain("cross join pg_temp.bv_credit_targets target");
    expect(migration).toContain("owner_tenant_id = platform_id");
    expect(migration).not.toContain("insert into public.content_items (\n    id, tenant_id");
  });

  it("registra autorização e mantém os três vídeos como referências externas", () => {
    expect(migration).toContain("CLIENTE-VALIDACAO-BV-2026-08-20");
    expect(migration).toContain("'kind', 'authorized-real'");
    expect(migration.match(/https:\/\/www\.youtube\.com\//g)).toHaveLength(3);
    expect(migration).toContain("when article.external_only then jsonb_build_object");
    expect(migration).toContain("not article.external_only");
  });

  it("permanece restaurável pelo seed e preserva UTF-8", () => {
    expect(seed).toContain(
      "select private.apply_bv_educacao_credit_catalog();",
    );
    expect(migration).not.toMatch(/Ã(?:§|£|­|©|µ|º|¡|ª|³|´|¢| )/);
    expect(migration).not.toContain("â€");
  });
});
