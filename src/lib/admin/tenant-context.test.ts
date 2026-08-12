import { describe, expect, it } from "vitest";

import {
  assessTenantMutationContext,
  resolveAdminTenant,
  safeAdminReturnPath,
  type AdminTenant,
} from "./tenant-context";

const tenants: AdminTenant[] = [
  {
    display_name: "Horizonte",
    id: "00000000-0000-4000-8000-000000000002",
    slug: "horizonte",
  },
  {
    display_name: "Aurora",
    id: "00000000-0000-4000-8000-000000000003",
    slug: "aurora",
  },
];

describe("admin tenant context", () => {
  it("prefers a validated query over a validated cookie", () => {
    expect(resolveAdminTenant(tenants, tenants[1].id, tenants[0].id)).toEqual({
      ok: true,
      tenant: tenants[1],
    });
  });

  it("fails closed for an invalid query or persisted cookie", () => {
    expect(resolveAdminTenant(tenants, "tampered", tenants[0].id)).toEqual({
      ok: false,
      reason: "invalid-query",
    });
    expect(resolveAdminTenant(tenants, undefined, "stale")).toEqual({
      ok: false,
      reason: "invalid-cookie",
    });
  });

  it("requires confirmation before an A to B mutation can proceed", () => {
    const firstAttempt = assessTenantMutationContext({
      activeCookieTenantId: tenants[1].id,
      allowedTenantIds: tenants.map((tenant) => tenant.id),
      contextTenantId: tenants[0].id,
      targetTenantId: tenants[0].id,
    });
    expect(firstAttempt).toEqual({
      kind: "confirmation",
      ok: false,
      tenantId: tenants[0].id,
    });

    expect(
      assessTenantMutationContext({
        activeCookieTenantId: tenants[1].id,
        allowedTenantIds: tenants.map((tenant) => tenant.id),
        confirmedTenantId: tenants[0].id,
        contextTenantId: tenants[0].id,
        targetTenantId: tenants[0].id,
      }),
    ).toEqual({ ok: true });
  });

  it("denies a tampered target and an unknown cookie", () => {
    expect(
      assessTenantMutationContext({
        activeCookieTenantId: tenants[0].id,
        allowedTenantIds: tenants.map((tenant) => tenant.id),
        contextTenantId: tenants[0].id,
        targetTenantId: tenants[1].id,
      }),
    ).toEqual({ kind: "denied", ok: false });
    expect(
      assessTenantMutationContext({
        activeCookieTenantId: "unknown",
        allowedTenantIds: tenants.map((tenant) => tenant.id),
        contextTenantId: tenants[0].id,
        targetTenantId: tenants[0].id,
      }),
    ).toEqual({ kind: "denied", ok: false });
  });

  it("allowlists the selector return path and only keeps page filters", () => {
    expect(safeAdminReturnPath("/admin?status=paused&edit=secret")).toBe(
      "/admin?status=paused",
    );
    expect(
      safeAdminReturnPath("https://evil.example/admin/identidade"),
    ).toBe("/admin/identidade");
    expect(safeAdminReturnPath("/api/demo/content")).toBe("/admin");
  });
});
