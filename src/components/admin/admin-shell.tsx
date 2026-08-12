import type { ReactNode } from "react";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import {
  AdminBrandLink,
  AdminTenantControls,
} from "@/components/admin/admin-tenant-controls";
import type { TenantMutationState } from "@/components/admin/tenant-mutation-form";
import { DemoNotice } from "@/components/demo-notice";
import type { AdminTenant } from "@/lib/admin/tenant-context";

type AdminShellProps = {
  children: ReactNode;
  defaultPortalSetting: {
    defaultTenantId: string;
    revision: number;
  } | null;
  fallbackTenantId?: string;
  logoutAction: () => Promise<void>;
  setDefaultDemoPortalAction: (
    state: TenantMutationState,
    formData: FormData,
  ) => Promise<TenantMutationState>;
  switchTenantAction: (formData: FormData) => Promise<void>;
  tenants: AdminTenant[];
};

export function AdminShell({
  children,
  defaultPortalSetting,
  fallbackTenantId,
  logoutAction,
  setDefaultDemoPortalAction,
  switchTenantAction,
  tenants,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f5f3] text-slate-950">
      <a className="skip-link" href="#admin-main">
        Pular para o conteúdo
      </a>
      <DemoNotice admin compact />
      <div className="min-h-[calc(100vh-33px)] lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="border-b border-slate-200 bg-[#13211f] text-white lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
            <AdminBrandLink
              fallbackTenantId={fallbackTenantId}
              tenants={tenants}
            />
          </div>
          <AdminNavigation
            fallbackTenantId={fallbackTenantId}
            tenants={tenants}
          />
        </aside>
        <div className="min-w-0">
          <header className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end">
              <AdminTenantControls
                defaultPortalSetting={defaultPortalSetting}
                fallbackTenantId={fallbackTenantId}
                setDefaultDemoPortalAction={setDefaultDemoPortalAction}
                switchTenantAction={switchTenantAction}
                tenants={tenants}
              />
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                <span className="hidden text-sm text-slate-500 sm:inline">
                  demo-operator
                </span>
                <form action={logoutAction}>
                  <button
                    className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-50"
                    type="submit"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
