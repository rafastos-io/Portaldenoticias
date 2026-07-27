import { cookies } from "next/headers";
import type { ReactNode } from "react";

import {
  logoutAction,
  setDefaultDemoPortalAction,
  switchTenantAction,
} from "@/app/admin/(protected)/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_TENANT_COOKIE,
  resolveAdminTenant,
  type AdminTenant,
} from "@/lib/admin/tenant-context";
import { requireDemoSession } from "@/lib/demo-auth/server";
import { listAdminTenants } from "@/lib/supabase/content-repository";
import {
  getDefaultDemoPortalSetting,
  type DefaultDemoPortalSetting,
} from "@/lib/supabase/demo-settings-repository";

export const dynamic = "force-dynamic";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  await requireDemoSession();
  let tenants: AdminTenant[] = [];
  let fallbackTenantId: string | undefined;
  let defaultPortalSetting: DefaultDemoPortalSetting | null = null;

  try {
    tenants = await listAdminTenants();
    const cookieStore = await cookies();
    const resolution = resolveAdminTenant(
      tenants,
      undefined,
      cookieStore.get(ADMIN_TENANT_COOKIE)?.value,
    );
    fallbackTenantId = resolution.ok ? resolution.tenant.id : undefined;
  } catch {
    tenants = [];
  }

  try {
    const setting = await getDefaultDemoPortalSetting();
    defaultPortalSetting =
      setting &&
      tenants.some((tenant) => tenant.id === setting.defaultTenantId)
        ? setting
        : null;
  } catch {
    defaultPortalSetting = null;
  }

  return (
    <AdminShell
      defaultPortalSetting={defaultPortalSetting}
      fallbackTenantId={fallbackTenantId}
      logoutAction={logoutAction}
      setDefaultDemoPortalAction={setDefaultDemoPortalAction}
      switchTenantAction={switchTenantAction}
      tenants={tenants}
    >
      {children}
    </AdminShell>
  );
}
