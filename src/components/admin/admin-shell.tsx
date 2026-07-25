import Link from "next/link";
import type { ReactNode } from "react";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { DemoNotice } from "@/components/demo-notice";

type AdminShellProps = {
  children: ReactNode;
  logoutAction: () => Promise<void>;
};

export function AdminShell({
  children,
  logoutAction,
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
            <Link
              className="inline-flex items-center gap-3 no-underline"
              href="/admin"
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
            <Link
              className="text-xs font-bold text-slate-300 lg:hidden"
              href="/"
            >
              Ver portal
            </Link>
          </div>
          <AdminNavigation />
        </aside>
        <div className="min-w-0">
          <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Escopo editorial
              </p>
              <p className="text-sm font-bold">Tenant definido no conteúdo</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:inline">
                demo-operator
              </span>
              <form action={logoutAction}>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-50"
                  type="submit"
                >
                  Sair
                </button>
              </form>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
