import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260824021722_restrict_bv_catalog_and_restore_home.sql",
    import.meta.url,
  ),
  "utf8",
);
const seed = readFileSync(
  new URL("../../supabase/seed.sql", import.meta.url),
  "utf8",
);
const portalRepository = readFileSync(
  new URL("./supabase/portal-repository.ts", import.meta.url),
  "utf8",
);

describe("escopo editorial do BV Educação", () => {
  it("remove somente distribuições herdadas dos quatro tenants legados", () => {
    expect(migration).toContain("distribution.contract_reference is null");
    expect(migration).toContain("delete from public.distributions");
    expect(migration).toContain("delete from public.placements");
    for (const slug of [
      "abrafarma",
      "banco-demo-horizonte",
      "credito-demo-orbita",
      "seguros-demo-atlas",
    ]) {
      expect(migration).toContain(`'${slug}'`);
    }
  });

  it("restaura navegação e placements com conteúdo autorizado do BV", () => {
    for (const category of [
      "Indicadores",
      "Investimentos",
      "Alerta de golpes",
      "Programando o futuro",
      "Isso ou aquilo",
      "Saia das dívidas",
      "Alívio no orçamento",
      "Guias",
      "Dicas valiosas",
      "Jornada de crédito BV",
      "Especialista responde",
      "Glossário",
    ]) {
      expect(migration).toContain(`'${category}'`);
    }
    expect(migration).toContain("('home.hero', 0, 'BV-013'");
    expect(migration).toContain("('home.secondary', 0, 'BV-006'");
    expect(migration).toContain("('home.secondary', 1, 'BV-017'");
    expect(migration).toContain("CLIENTE-VALIDACAO-BV-2026-08-20");
    expect(portalRepository).toContain("contract_reference");
    expect(portalRepository).toContain("allowedReferences.has");
  });

  it("permanece privada, auditável, restaurável e sem mojibake", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain(
      "from public, anon, authenticated, service_role",
    );
    expect(migration).toContain("content.catalog_scope_corrected");
    expect(seed).toContain(
      "select private.restrict_bv_catalog_and_restore_home();",
    );
    expect(migration).not.toMatch(/Ã(?:§|£|­|©|µ|º|¡|ª|³|´|¢| )/);
  });
});
