import Image from "next/image";
import Link from "next/link";

import { AccessibilityControls } from "@/components/public/accessibility-controls";
import { EditorialNavigation } from "@/components/public/editorial-navigation";
import type { ThemeValues } from "@/lib/admin/theme-form";

import type { ShellChromeProps } from "./model-types";
import { tenantQuery } from "./story-primitives";

/**
 * Splits a CamelCase brand ("FinanciaCar") so the last segment can carry the
 * accent colour. Single-word brands render in one colour.
 */
function wordmarkSegments(brandName: string) {
  const segments = brandName.trim().split(/(?=[A-Z])/).filter(Boolean);
  if (segments.length < 2 || brandName.includes(" ")) {
    return { head: brandName.trim(), tail: "" };
  }
  return { head: segments.slice(0, -1).join(""), tail: segments.at(-1)! };
}

function BrandLockup({
  size = "md",
  theme,
}: {
  size?: "lg" | "md";
  theme: ThemeValues;
}) {
  const { head, tail } = wordmarkSegments(theme.brandName);
  return (
    <span className="flex min-w-0 items-center gap-3 sm:gap-4">
      {theme.logoUrl ? (
        <>
          <span
            className={`relative block shrink-0 ${
              size === "lg" ? "size-11 sm:size-12" : "size-9 sm:size-10"
            }`}
          >
            <Image
              alt={theme.logoAlt || "Logo"}
              className="object-contain"
              fill
              priority={size === "md"}
              sizes="64px"
              src={theme.logoUrl}
              unoptimized
            />
          </span>
          <span
            aria-hidden="true"
            className={`auto-lockup-rule shrink-0 ${
              size === "lg" ? "h-11 sm:h-12" : "h-9 sm:h-10"
            }`}
          />
        </>
      ) : null}
      <span className="min-w-0">
        <span
          className={`auto-wordmark block leading-[0.9] uppercase ${
            size === "lg"
              ? "text-[1.55rem] sm:text-[1.9rem]"
              : "text-[1.2rem] sm:text-[1.45rem]"
          }`}
        >
          {head}
          {tail ? <span className="text-accent">{tail}</span> : null}
        </span>
        <span
          className={`mt-1.5 block font-semibold tracking-[0.24em] text-white/80 uppercase ${
            size === "lg" ? "text-xs sm:text-sm" : "text-[0.62rem] sm:text-[0.7rem]"
          }`}
        >
          {theme.slogan}
        </span>
      </span>
    </span>
  );
}

export function AutomotiveMobilityHeader({
  categories,
  tenant,
  theme,
}: ShellChromeProps) {
  const query = tenantQuery(tenant);
  const today = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="model-header" data-site-model={theme.siteModel}>
      <div className="auto-masthead relative isolate z-20 text-white">
        <span aria-hidden="true" className="auto-masthead-speed" />
        <div className="page-container flex min-h-24 items-center justify-between gap-6 py-4 sm:min-h-28">
          <Link
            aria-label={`${theme.brandName} — início`}
            className="min-w-0 text-white no-underline"
            href={`/${query}`}
          >
            <BrandLockup theme={theme} />
          </Link>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <AccessibilityControls variant="inline" />
            <p className="hidden text-right text-sm leading-5 text-white/80 first-letter:uppercase md:block">
              {today}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-raised">
        <EditorialNavigation
          categories={categories}
          homeHref={`/${query}`}
          tenantQuery={query}
        />
      </div>

      <details className="model-mobile-menu border-b border-border-subtle bg-surface-raised md:hidden">
        <summary className="page-container flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-bold text-brand-primary">
          Editorias <span aria-hidden="true">＋</span>
        </summary>
        <nav
          aria-label="Menu editorial mobile"
          className="page-container grid gap-px border-t border-border-subtle bg-border-subtle py-px"
        >
          <Link
            className="min-h-12 bg-surface-raised px-3 py-3 text-sm font-bold text-brand-primary no-underline"
            href={`/${query}`}
          >
            Início
          </Link>
          {categories.map((category) => (
            <Link
              className="min-h-12 bg-surface-raised px-3 py-3 text-sm font-bold text-brand-primary no-underline"
              href={`/editoria/${category.slug}${query}`}
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

export function AutomotiveMobilityFooter({
  categories,
  tenant,
  theme,
}: ShellChromeProps) {
  const query = tenantQuery(tenant);
  const links = [
    { href: `/${query}`, label: "Início" },
    { href: `/${query}#destaques`, label: "Manchete" },
    { href: `/${query}#mercados`, label: "Mercado" },
    { href: `/${query}#editorias`, label: "Todas as editorias" },
  ];

  return (
    <footer className="model-footer auto-footer relative isolate overflow-hidden text-white">
      <span aria-hidden="true" className="auto-footer-road" />
      <div className="page-container pt-14 pb-10 sm:pt-20">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.35fr_0.65fr_1fr]">
          <div>
            <Link
              aria-label={`${theme.brandName} — início`}
              className="inline-block text-white no-underline"
              href={`/${query}`}
            >
              <BrandLockup size="lg" theme={theme} />
            </Link>
            <p className="mt-7 max-w-md text-sm leading-6 text-white/75">
              Informação para quem compra, financia e dirige: crédito, mercado,
              segurança, estrada e cultura automotiva.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              Navegue
            </p>
            <ul className="mt-5 space-y-3 text-sm font-semibold">
              {links.map((link) => (
                <li key={link.label}>
                  <Link className="text-white hover:text-accent" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Editorias no rodapé">
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              Editorias
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    className="text-white hover:text-accent"
                    href={`/editoria/${category.slug}${query}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="pt-6 text-xs leading-5 text-white/70">
          © {new Date().getFullYear()} {theme.brandName}. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
