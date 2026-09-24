import Image from "next/image";
import Link from "next/link";

import { EditorialNavigation } from "@/components/public/editorial-navigation";
import type { ThemeValues } from "@/lib/admin/theme-form";
import { getPublicBrandCopy } from "@/lib/presentation/public-brand-copy";
import { getSiteModelDefinition } from "@/lib/presentation/site-models";
import type { PublicTenant } from "@/lib/supabase/portal-repository";

const headerLayouts = {
  "automotive-mobility": "justify-between",
  "financial-services-credit":
    "justify-between border-b-4 border-brand-primary",
  "health-pharma": "justify-between border-t-4 border-brand-primary",
  "insurance-pension": "justify-center text-center",
  "investments-asset-management":
    "justify-between border-b-2 border-text-primary",
} as const;

const brandSizes = {
  "automotive-mobility": "text-xl sm:text-2xl",
  "financial-services-credit": "text-xl sm:text-2xl",
  "health-pharma": "text-lg sm:text-xl",
  "insurance-pension": "text-2xl sm:text-4xl",
  "investments-asset-management": "text-2xl sm:text-4xl",
} as const;

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
  const model = getSiteModelDefinition(theme.siteModel);
  const brandCopy = getPublicBrandCopy(tenant.slug, model);
  const centered = theme.siteModel === "insurance-pension";
  const visibleCategories =
    model.headerCategoryLimit === null
      ? categories
      : categories.slice(0, model.headerCategoryLimit);
  return (
    <header
      className="model-header border-b border-border-subtle bg-surface-raised"
      data-site-model={theme.siteModel}
    >
      <div
        className={`page-container flex min-h-20 items-center gap-6 py-4 ${headerLayouts[theme.siteModel]}`}
      >
        <Link
          aria-label={`${theme.brandName} — início`}
          className={`group inline-flex min-w-0 items-center gap-3 no-underline ${
            centered ? "flex-col" : ""
          }`}
          href={`/${tenantQuery}`}
        >
          {theme.logoUrl ? (
            <span className="relative block h-12 w-44 shrink-0 sm:w-56">
              <Image
                alt={theme.logoAlt || theme.brandName}
                className={`object-contain ${
                  centered ? "object-center" : "object-left"
                }`}
                fill
                priority
                sizes="(max-width: 640px) 176px, 224px"
                src={theme.logoUrl}
                unoptimized
              />
            </span>
          ) : (
            <span className="min-w-0">
              <span
                className={`block font-heading leading-none font-bold tracking-[-0.04em] text-brand-primary ${brandSizes[theme.siteModel]}`}
              >
                {theme.brandName}
              </span>
              <span className="mt-1 hidden text-xs text-text-muted sm:block">
                {theme.slogan}
              </span>
            </span>
          )}
        </Link>
        {!centered ? (
          <div className="hidden text-right sm:block">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-primary">
              {brandCopy.headerEyebrow}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {brandCopy.headerTopics}
            </p>
          </div>
        ) : null}
      </div>

      <EditorialNavigation
        categories={visibleCategories}
        centered={centered}
        homeHref={`/${tenantQuery}`}
        tenantQuery={tenantQuery}
      />

      <details className="model-mobile-menu border-t border-border-subtle md:hidden">
        <summary className="page-container flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-bold text-brand-primary">
          Menu editorial <span aria-hidden="true">＋</span>
        </summary>
        <nav
          aria-label="Menu editorial mobile"
          className="page-container grid gap-px border-t border-border-subtle bg-border-subtle py-px"
        >
          <Link
            className="min-h-12 bg-surface-raised px-3 py-3 text-sm font-bold text-brand-primary no-underline"
            href={`/${tenantQuery}`}
          >
            Início
          </Link>
          {visibleCategories.map((category) => (
            <Link
              className="min-h-12 bg-surface-raised px-3 py-3 text-sm font-bold text-brand-primary no-underline"
              href={`/editoria/${category.slug}${tenantQuery}`}
              key={category.slug}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
