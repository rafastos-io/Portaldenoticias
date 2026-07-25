"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin#conteudo", label: "Conteúdo", pathname: "/admin" },
  {
    href: "/admin/identidade",
    label: "Identidades",
    pathname: "/admin/identidade",
  },
  {
    href: "/admin/auditoria",
    label: "Auditoria",
    pathname: "/admin/auditoria",
  },
];

export function AdminNavigation() {
  const pathname = usePathname();

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
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
