import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260824011021_add_bv_credit_journey_and_expert_categories.sql",
    import.meta.url,
  ),
  "utf8",
);
const seed = readFileSync(
  new URL("../../supabase/seed.sql", import.meta.url),
  "utf8",
);
const scopeCorrection = readFileSync(
  new URL(
    "../../supabase/migrations/20260824013903_restrict_bv_credit_additions_to_bv_tenant.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("expansão da pauta BV Educação", () => {
  it("cadastra sete etapas ordenadas e três vídeos em duas categorias", () => {
    expect(new Set(migration.match(/'BV-JC-\d{3}'/g)).size).toBe(7);
    expect(new Set(migration.match(/'BV-ER-\d{3}'/g)).size).toBe(3);
    expect(migration).toContain("'Jornada de crédito BV'");
    expect(migration).toContain("'Especialista responde'");
    expect(migration).toContain("'placeholder-awaiting-copy'");
    expect(migration.match(/https:\/\/www\.youtube\.com\/watch\?v=/g)).toHaveLength(3);
  });

  it("preserva conteúdo canônico, isola o tenant BV e mantém os direitos", () => {
    expect(migration).toContain(
      "version.components_json ->> 'site_model' = 'financial-services-credit'",
    );
    expect(migration).toContain(
      "cross join pg_temp.bv_credit_addition_targets target",
    );
    expect(scopeCorrection).toContain("tenant.id <> bv_tenant_id");
    expect(scopeCorrection).toContain("delete from public.distributions");
    expect(scopeCorrection).toContain("content.catalog_scope_corrected");
    expect(migration).toContain("CLIENTE-VALIDACAO-BV-2026-08-23");
    expect(migration).toContain("not article.external_only");
  });

  it("permanece restaurável e sem mojibake", () => {
    expect(seed).toContain(
      "select private.apply_bv_credit_journey_and_expert_categories();",
    );
    expect(seed).toContain(
      "select private.restrict_bv_credit_additions_to_bv_tenant();",
    );
    expect(migration).not.toMatch(/Ã(?:§|£|­|©|µ|º|¡|ª|³|´|¢| )/);
    expect(migration).not.toContain("â€");
    expect(scopeCorrection).not.toMatch(/Ã(?:§|£|­|©|µ|º|¡|ª|³|´|¢| )/);
  });
});
