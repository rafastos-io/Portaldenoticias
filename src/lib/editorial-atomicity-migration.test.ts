import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260831110000_make_editorial_metadata_atomic.sql",
  "utf8",
);
const repository = readFileSync(
  "src/lib/supabase/content-repository.ts",
  "utf8",
);

describe("atomicidade do cadastro editorial", () => {
  it("mantém conteúdo, mídia e metadados dentro das RPCs transacionais", () => {
    expect(migration).toContain(
      "create or replace function public.cms_create_editorial_content",
    );
    expect(migration).toContain(
      "create or replace function public.cms_update_editorial_content",
    );
    expect(migration).toContain("public.cms_create_content_with_media(");
    expect(migration).toContain("public.cms_update_content_with_media(");
    expect(migration).toContain("body_json = jsonb_set(");
    expect(migration).toContain("get diagnostics affected_rows = row_count");
    expect(migration).toContain("grant execute on function");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("invalid author or category scope");
    expect(migration).toContain("category.owner_tenant_id = p_tenant_id");
    expect(migration).toContain("author.owner_tenant_id = p_tenant_id");
    expect(migration).toContain("owner.kind = 'platform'");
  });

  it("não mantém um update pós-RPC no repository", () => {
    expect(repository).toContain('rpc("cms_create_editorial_content"');
    expect(repository).toContain('rpc("cms_update_editorial_content"');
    expect(repository).not.toContain("applyEditorialMetadata");
  });
});
