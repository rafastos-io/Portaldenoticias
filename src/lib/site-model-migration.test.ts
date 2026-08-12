import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260727184629_add_site_models.sql",
    import.meta.url,
  ),
  "utf8",
);
const seed = readFileSync(
  new URL("../../supabase/seed.sql", import.meta.url),
  "utf8",
);

const siteModels = [
  "financial-services-credit",
  "investments-asset-management",
  "insurance-pension",
  "health-pharma",
];

describe("site model database contract", () => {
  it("allows the versioned site-model schema without accepting arbitrary versions", () => {
    expect(migration).toContain(
      "drop constraint theme_versions_schema_version_check",
    );
    expect(migration).toContain("check (schema_version in (1, 2))");
  });

  it("validates all approved IDs in invoker RPCs", () => {
    for (const siteModel of siteModels) {
      expect(migration).toContain(siteModel);
    }
    expect(migration).toMatch(
      /create function public\.cms_save_theme_v2[\s\S]+security invoker/,
    );
    expect(migration).toMatch(
      /create function public\.cms_create_demo_tenant_v2[\s\S]+security invoker/,
    );
    expect(migration).toContain("raise exception 'unapproved site model'");
    expect(migration).toContain("site model composition mismatch");
  });

  it("keeps both RPCs server-only", () => {
    expect(migration).toContain(
      "from public, anon, authenticated;\ngrant execute on function public.cms_save_theme_v2",
    );
    expect(migration).toContain(
      "from public, anon, authenticated;\ngrant execute on function public.cms_create_demo_tenant_v2",
    );
    expect(migration).toContain("to service_role;");
  });

  it("seeds four models and reuses canonical content by distribution reference", () => {
    for (const siteModel of siteModels) {
      expect(seed).toContain(`"site_model":"${siteModel}"`);
    }
    expect(seed).toContain("'credito-demo-orbita'");
    expect(seed).toContain(
      "from public.distributions source\nwhere source.tenant_id",
    );
  });

  it("backfills the complete coherent composition for every legacy tenant", () => {
    expect(migration).toMatch(
      /when '00000000-0000-4000-8000-000000000002'::uuid then[\s\S]+?'hero', 'split-editorial'[\s\S]+?'card', 'data-led'[\s\S]+?'site_model', 'investments-asset-management'/,
    );
    expect(migration).toMatch(
      /when '00000000-0000-4000-8000-000000000003'::uuid then[\s\S]+?'card', 'compact-horizontal'[\s\S]+?'site_model', 'insurance-pension'/,
    );
    expect(migration).toMatch(
      /when '00000000-0000-4000-8000-000000000004'::uuid then[\s\S]+?'hero', 'science-feature'[\s\S]+?'site_model', 'health-pharma'/,
    );
  });
});
