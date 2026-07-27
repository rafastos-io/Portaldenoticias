"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  TenantMutationForm,
  type TenantMutationState,
} from "@/components/admin/tenant-mutation-form";
import type { AdminTenant } from "@/lib/admin/tenant-context";

type AdminTenantControlsProps = {
  defaultPortalSetting: {
    defaultTenantId: string;
    revision: number;
  } | null;
  fallbackTenantId?: string;
  setDefaultDemoPortalAction: (
    state: TenantMutationState,
    formData: FormData,
  ) => Promise<TenantMutationState>;
  switchTenantAction: (formData: FormData) => Promise<void>;
  tenants: AdminTenant[];
};

export function AdminBrandLink({
  fallbackTenantId,
  tenants,
}: {
  fallbackTenantId?: string;
  tenants: AdminTenant[];
}) {
  const activeTenant = useActiveAdminTenant(tenants, fallbackTenantId);

  return (
    <Link
      className="inline-flex items-center gap-3 no-underline"
      href={
        activeTenant
          ? `/admin?tenant=${encodeURIComponent(activeTenant.id)}`
          : "/admin"
      }
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-md bg-white text-sm font-black text-[#13211f]"
      >
        B
      </span>
      <span>
        <span className="block text-sm font-bold">Broadcast</span>
        <span className="block text-xs text-slate-400">
          Studio editorial
        </span>
      </span>
    </Link>
  );
}

function pageReturnPath(pathname: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams();
  if (pathname === "/admin") {
    const status = searchParams.get("status");
    if (status) params.set("status", status);
  }
  if (pathname === "/admin/auditoria") {
    const action = searchParams.get("action");
    if (action) params.set("action", action);
  }
  return `${pathname}${params.size > 0 ? `?${params.toString()}` : ""}`;
}

export function useActiveAdminTenant(
  tenants: AdminTenant[],
  fallbackTenantId?: string,
) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("tenant");
  const activeTenantId = requested ?? fallbackTenantId;
  return tenants.find((tenant) => tenant.id === activeTenantId);
}

export function AdminTenantControls({
  defaultPortalSetting,
  fallbackTenantId,
  setDefaultDemoPortalAction,
  switchTenantAction,
  tenants,
}: AdminTenantControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTenant = useActiveAdminTenant(tenants, fallbackTenantId);

  if (tenants.length === 0) {
    return (
      <p className="text-sm font-bold text-amber-900" role="status">
        Contexto de tenant indisponível
      </p>
    );
  }

  return (
    <div className="grid min-w-0 flex-1 gap-3 xl:grid-cols-[minmax(16rem,1fr)_auto] xl:items-end">
      <form
        action={switchTenantAction}
        className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end"
      >
        <input
          name="returnTo"
          type="hidden"
          value={pageReturnPath(pathname, searchParams)}
        />
        <label className="grid min-w-0 flex-1 gap-1 text-xs font-bold text-slate-700">
          Tenant ativo
          <select
            className="min-h-11 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950"
            defaultValue={activeTenant?.id ?? ""}
            key={activeTenant?.id ?? "invalid"}
            name="tenantId"
            required
          >
            {!activeTenant ? (
              <option disabled value="">
                Selecione um tenant válido
              </option>
            ) : null}
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.display_name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="min-h-11 shrink-0 rounded-md border border-slate-400 bg-white px-4 text-sm font-bold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174a47]"
          type="submit"
        >
          Aplicar
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {activeTenant ? (
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md px-3 text-sm font-bold text-[#174a47] no-underline hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174a47]"
            href={`/?tenant=${encodeURIComponent(activeTenant.slug)}`}
            target="_blank"
          >
            Ver preview direto
            <span className="sr-only"> de {activeTenant.display_name}</span>
          </Link>
        ) : (
          <p className="self-center text-sm font-semibold text-amber-900">
            Contexto inválido
          </p>
        )}
        {activeTenant && defaultPortalSetting ? (
          activeTenant.id === defaultPortalSetting.defaultTenantId ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-900">
              Portal padrão em /
            </p>
          ) : (
            <TenantMutationForm
              action={setDefaultDemoPortalAction}
              className="grid gap-2 rounded-md border border-slate-300 bg-slate-50 p-3"
              tenantId={activeTenant.id}
            >
              <input
                name="expectedRevision"
                type="hidden"
                value={defaultPortalSetting.revision}
              />
              <input
                name="tenantId"
                type="hidden"
                value={activeTenant.id}
              />
              <label className="flex max-w-sm items-start gap-2 text-xs font-semibold text-slate-700">
                <input
                  className="mt-0.5 size-4 shrink-0"
                  name="confirmGlobalDefault"
                  required
                  type="checkbox"
                  value="yes"
                />
                Confirmo que a página / mudará para todas as pessoas.
              </label>
              <button
                className="min-h-11 rounded-md bg-[#174a47] px-3 text-sm font-bold text-white hover:bg-[#0f3937] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174a47]"
                type="submit"
              >
                Definir como portal padrão
              </button>
            </TenantMutationForm>
          )
        ) : null}
        {activeTenant && !defaultPortalSetting ? (
          <p className="text-center text-xs font-semibold text-amber-900">
            Configuração do portal padrão indisponível.
          </p>
        ) : null}
      </div>
    </div>
  );
}
