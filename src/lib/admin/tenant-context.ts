export const ADMIN_TENANT_COOKIE = "broadcast_admin_tenant";
export const DEFAULT_ADMIN_TENANT_ID =
  "00000000-0000-4000-8000-000000000002";

export type AdminTenant = {
  display_name: string;
  id: string;
  slug: string;
};

export type AdminTenantResolution =
  | { ok: true; tenant: AdminTenant }
  | {
      ok: false;
      reason: "invalid-cookie" | "invalid-query" | "no-tenants";
    };

export function resolveAdminTenant(
  tenants: AdminTenant[],
  requestedTenantId?: string,
  cookieTenantId?: string,
): AdminTenantResolution {
  if (tenants.length === 0) {
    return { ok: false, reason: "no-tenants" };
  }

  if (requestedTenantId !== undefined) {
    const requested = tenants.find(
      (tenant) => tenant.id === requestedTenantId,
    );
    return requested
      ? { ok: true, tenant: requested }
      : { ok: false, reason: "invalid-query" };
  }

  if (cookieTenantId !== undefined) {
    const persisted = tenants.find((tenant) => tenant.id === cookieTenantId);
    return persisted
      ? { ok: true, tenant: persisted }
      : { ok: false, reason: "invalid-cookie" };
  }

  return {
    ok: true,
    tenant:
      tenants.find((tenant) => tenant.id === DEFAULT_ADMIN_TENANT_ID) ??
      tenants[0],
  };
}

export type TenantMutationAssessment =
  | { ok: true }
  | {
      ok: false;
      kind: "confirmation";
      tenantId: string;
    }
  | {
      ok: false;
      kind: "denied";
    };

export function assessTenantMutationContext(input: {
  activeCookieTenantId?: string;
  allowedTenantIds: string[];
  confirmedTenantId?: string;
  contextTenantId?: string;
  targetTenantId?: string;
}): TenantMutationAssessment {
  const {
    activeCookieTenantId,
    allowedTenantIds,
    confirmedTenantId,
    contextTenantId,
    targetTenantId,
  } = input;

  if (
    !targetTenantId ||
    !contextTenantId ||
    contextTenantId !== targetTenantId ||
    !allowedTenantIds.includes(targetTenantId)
  ) {
    return { kind: "denied", ok: false };
  }

  if (activeCookieTenantId === undefined) {
    return { ok: true };
  }

  if (!allowedTenantIds.includes(activeCookieTenantId)) {
    return { kind: "denied", ok: false };
  }

  if (activeCookieTenantId === targetTenantId) {
    return { ok: true };
  }

  if (confirmedTenantId === targetTenantId) {
    return { ok: true };
  }

  return {
    kind: "confirmation",
    ok: false,
    tenantId: targetTenantId,
  };
}

export function adminHref(
  pathname: "/admin" | "/admin/auditoria" | "/admin/identidade",
  tenantId: string,
  hash = "",
) {
  const params = new URLSearchParams({ tenant: tenantId });
  return `${pathname}?${params.toString()}${hash}`;
}

export function safeAdminReturnPath(rawValue: FormDataEntryValue | null) {
  const raw = typeof rawValue === "string" ? rawValue : "";
  let parsed: URL;

  try {
    parsed = new URL(raw, "https://broadcast.local");
  } catch {
    return "/admin";
  }

  const pathname = parsed.pathname;
  if (
    pathname !== "/admin" &&
    pathname !== "/admin/identidade" &&
    pathname !== "/admin/auditoria"
  ) {
    return "/admin";
  }

  const params = new URLSearchParams();
  if (pathname === "/admin") {
    const status = parsed.searchParams.get("status");
    if (
      status === "draft" ||
      status === "published" ||
      status === "paused"
    ) {
      params.set("status", status);
    }
  }
  if (pathname === "/admin/auditoria") {
    const action = parsed.searchParams.get("action");
    if (action) params.set("action", action);
  }

  const query = params.size > 0 ? `?${params.toString()}` : "";
  return `${pathname}${query}`;
}
