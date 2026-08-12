"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useActiveAdminTenant } from "@/components/admin/admin-tenant-controls";
import {
  adminHref,
  type AdminTenant,
} from "@/lib/admin/tenant-context";

const items = [
  { hash: "#conteudo", label: "Conteúdo", pathname: "/admin" },
  {
    hash: "",
    label: "Identidades",
    pathname: "/admin/identidade",
  },
  {
    hash: "",
    label: "Auditoria",
    pathname: "/admin/auditoria",
  },
] as const;

export function AdminNavigation({
  fallbackTenantId,
  tenants,
}: {
  fallbackTenantId?: string;
  tenants: AdminTenant[];
}) {
  const pathname = usePathname();
  const activeTenant = useActiveAdminTenant(tenants, fallbackTenantId);

  return (
    <nav
      aria-label="Navegação administrativa"
      className="flex flex-wrap gap-1 px-3 pb-4 lg:block lg:space-y-1 lg:px-4"
    >
      {items.map((item) => {
        const current = pathname === item.pathname;
        return (
          <Link
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "block shrink-0 rounded-md bg-white/12 px-3 py-2.5 text-sm font-bold text-white no-underline"
                : "block shrink-0 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-300 no-underline hover:bg-white/8 hover:text-white"
            }
            href={
              activeTenant
                ? adminHref(item.pathname, activeTenant.id, item.hash)
                : item.pathname
            }
            key={item.label}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
