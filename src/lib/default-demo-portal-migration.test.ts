import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260727012034_add_default_demo_portal.sql",
    import.meta.url,
  ),
  "utf8",
);
const seed = readFileSync(
  new URL("../../supabase/seed.sql", import.meta.url),
  "utf8",
);
const indexMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260727012319_index_default_demo_portal_tenant.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("default demo portal database contract", () => {
  it("keeps the singleton server-only with forced RLS and minimum grants", () => {
    expect(migration).toContain(
      "alter table public.demo_portal_settings force row level security",
    );
    expect(migration).toContain(
      "grant select, update on public.demo_portal_settings",
    );
    expect(migration).toContain(
      "from public, anon, authenticated, service_role",
    );
    expect(migration).not.toContain(
      "grant select, insert, update, delete on public.demo_portal_settings",
    );
    expect(migration).toContain(
      "from public, anon, authenticated",
    );
  });

  it("protects the RPC with invoker privileges and optimistic concurrency", () => {
    expect(migration).toMatch(
      /create function public\.cms_set_default_demo_tenant[\s\S]+security invoker/,
    );
    expect(migration).toContain("for update;");
    expect(migration).toContain("errcode = '40001'");
    expect(migration).toContain("'portal.default_changed'");
    expect(migration).toContain(
      "grant execute on function public.cms_set_default_demo_tenant(uuid, bigint)",
    );
  });

  it("initializes only a missing singleton in the idempotent seed", () => {
    expect(seed).toMatch(
      /insert into public\.demo_portal_settings[\s\S]+on conflict \(setting_key\) do nothing;/,
    );
  });

  it("indexes the tenant foreign key used to resolve the public default", () => {
    expect(indexMigration).toContain(
      "on public.demo_portal_settings (default_tenant_id)",
    );
  });
});
