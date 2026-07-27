import Image from "next/image";
import Link from "next/link";

import type { ThemeValues } from "@/lib/admin/theme-form";
import type { PublicTenant } from "@/lib/supabase/portal-repository";

export function PublicHeader({
  categories,
  tenant,
  theme,
}: {
  categories: Array<{ name: string; slug: string }>;
  tenant: PublicTenant;
  theme: ThemeValues;
}) {
  const tenantQuery = `?tenant=${encodeURIComponent(tenant.slug)}`;
  const centered = theme.header === "brand-centered";
  const minimal = theme.header === "masthead-minimal";
  return (
    <header className="border-b border-border-subtle bg-surface-raised">
      <div
        className={`page-container flex min-h-20 items-center gap-6 py-3 ${
          centered ? "justify-center text-center" : "justify-between"
        }`}
      >
        <Link
          aria-label={`${theme.brandName} — início`}
          className="group inline-flex min-w-0 items-center gap-3 no-underline"
          href={`/${tenantQuery}`}
        >
          {theme.logoUrl ? (
            <span className="relative block h-12 w-44 shrink-0 sm:w-56">
              <Image
                alt={theme.logoAlt || theme.brandName}
                className="object-contain object-left"
                fill
                priority
                sizes="(max-width: 640px) 176px, 224px"
                src={theme.logoUrl}
                unoptimized
              />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-primary text-sm font-bold text-text-on-brand transition-transform group-hover:-rotate-3"
            >
              {theme.brandName.charAt(0)}
            </span>
          )}
          <span className="min-w-0">
            {!theme.logoUrl ? (
              <span className="block font-heading text-sm leading-4 font-bold text-brand-primary sm:text-lg sm:leading-normal">
                {theme.brandName}
              </span>
            ) : null}
            {!minimal ? (
              <span className="hidden text-xs text-text-muted sm:block">
                {theme.slogan}
              </span>
            ) : null}
          </span>
        </Link>
        {!centered ? (
          <p className="hidden shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-text-muted sm:block">
            Saúde · Economia · Longevidade
          </p>
        ) : null}
      </div>
      <nav
        aria-label="Navegação editorial"
        className="overflow-x-auto border-t border-border-subtle"
      >
        <div className="page-container flex min-w-max items-center gap-7 py-3 text-sm font-semibold">
          <Link
            className="text-brand-primary decoration-brand-secondary decoration-2 hover:underline"
            href={`/${tenantQuery}#destaques`}
          >
            Destaques
          </Link>
          {categories.slice(0, 4).map((category) => (
            <Link
              className="text-brand-primary decoration-brand-secondary decoration-2 hover:underline"
              href={`/editoria/${category.slug}${tenantQuery}`}
              key={category.slug}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
