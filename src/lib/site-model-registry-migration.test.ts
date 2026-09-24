import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  LEGACY_COMPONENT_COMPATIBILITY,
  SITE_MODEL_IDS,
} from "./presentation/site-models";

// Windows checkouts with core.autocrlf produce CRLF; the contract is newline-agnostic.
const readSql = (url: URL) =>
  readFileSync(url, "utf8").replace(/\r\n/g, "\n");

const migration = readSql(
  new URL(
    "../../supabase/migrations/20260901011057_centralize_site_model_registry.sql",
    import.meta.url,
  ),
);

const migrationsDirectory = new URL(
  "../../supabase/migrations/",
  import.meta.url,
);

// The allowlist may be redefined by later migrations; the newest one wins.
const latestResolverMigration = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readSql(new URL(file, migrationsDirectory)))
  .filter((sql) =>
    sql.includes(
      "create or replace function public.cms_resolve_site_model_components",
    ),
  )
  .at(-1)!;

describe("centralized site model database contract", () => {
  it("keeps the SQL resolver allowlist in exact parity with TypeScript", () => {
    const resolverBody = latestResolverMigration.match(
      /create or replace function public\.cms_resolve_site_model_components[\s\S]+?\n\$\$;/,
    )?.[0];
    expect(resolverBody).toBeDefined();

    const sqlIds = [
      ...(resolverBody?.matchAll(/when '([^']+)' then/g) ?? []),
    ].map((match) => match[1]);
    expect(sqlIds.sort()).toEqual([...SITE_MODEL_IDS].sort());
    expect(new Set(sqlIds).size).toBe(SITE_MODEL_IDS.length);
    expect(resolverBody).toContain("raise exception 'unapproved site model'");
  });

  it("makes v3 the write boundary and retains a time-bounded v2 wrapper", () => {
    expect(migration).toContain("create or replace function public.cms_save_theme_v3");
    expect(migration).toMatch(
      /create or replace function public\.cms_save_theme_v3\([\s\S]+?p_site_model text\n\)/,
    );
    expect(migration).toContain("return public.cms_save_theme_v3(");
    expect(migration).toContain("site model composition mismatch");
    expect(migration).toContain(LEGACY_COMPONENT_COMPATIBILITY.removeAfter);
    expect(migration).toContain(LEGACY_COMPONENT_COMPATIBILITY.removalMilestone);
  });

  it("keeps all public RPCs server-only and fail-closed", () => {
    for (const rpc of [
      "cms_save_theme_v2",
      "cms_save_theme_v3",
      "cms_create_demo_tenant_v2",
    ]) {
      expect(migration).toMatch(
        new RegExp(
          `revoke all on function public\\.${rpc}\\([\\s\\S]+?from public, anon, authenticated;[\\s\\S]+?grant execute on function public\\.${rpc}\\([\\s\\S]+?to service_role;`,
        ),
      );
    }
    expect(migration).toContain(
      "next_components := public.cms_resolve_site_model_components(p_site_model)",
    );
  });
});
