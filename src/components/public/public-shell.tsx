import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { PublicHeader } from "@/components/public/public-header";
import { AccessibilityControls } from "@/components/public/accessibility-controls";
import { VLibrasWidget } from "@/components/public/vlibras-widget";
import type { ThemeValues } from "@/lib/admin/theme-form";
import type { PublicTenant } from "@/lib/supabase/portal-repository";

type PublicShellProps = {
  children: ReactNode;
  categories?: Array<{ name: string; slug: string }>;
  tenant: PublicTenant;
  theme: ThemeValues;
};

export function PublicShell({
  categories = [],
  children,
  tenant,
  theme,
}: PublicShellProps) {
  const tenantQuery = `?tenant=${encodeURIComponent(tenant.slug)}`;
  const currentYear = new Date().getFullYear();
  const font =
    theme.font === "sans-geometrica"
      ? "Arial, Helvetica, sans-serif"
      : theme.font === "sans-humana"
        ? "Trebuchet MS, Arial, sans-serif"
        : "Georgia, Times New Roman, serif";
  const themeStyle = {
    "--accent": theme.accent,
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--focus": theme.primary,
    "--font-body": font,
    "--font-heading": font,
    "--link": theme.primary,
    "--surface-inverse": theme.primary,
    "--surface-page": theme.background,
    "--surface-raised": theme.background,
    "--text-primary": theme.textColor,
  } as CSSProperties;

  return (
    <div
      className="site-model min-h-screen bg-surface-page text-text-primary"
      data-site-model={theme.siteModel}
      style={themeStyle}
    >
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <AccessibilityControls />
      <PublicHeader categories={categories} tenant={tenant} theme={theme} />
      {children}
      <VLibrasWidget />
      <footer className="model-footer border-t-4 border-accent bg-surface-inverse text-text-on-brand">
        <div className="page-container py-12 sm:py-16">
          <div className="grid gap-12 border-b border-white/20 pb-12 lg:grid-cols-[1.3fr_0.7fr_0.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-90">
                Portal editorial
              </p>
              <p className="mt-4 max-w-xl font-heading text-3xl leading-tight font-bold sm:text-4xl">
                {theme.brandName}
              </p>
              <p className="mt-3 max-w-xl text-base leading-7 opacity-75">
                {theme.slogan}
              </p>
              <p className="mt-6 max-w-xl text-sm leading-6 opacity-90">
                Jornalismo sobre saúde, longevidade, inovação e seus impactos
                econômicos, apresentado em uma experiência editorial
                white-label.
              </p>
            </div>

            <nav aria-label="Navegação do rodapé">
              <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-90">
                Navegue
              </p>
              <ul className="mt-4 space-y-3 text-sm font-semibold">
                <li>
                  <Link className="hover:opacity-70" href={`/${tenantQuery}`}>
                    Início
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:opacity-70"
                    href={`/${tenantQuery}#destaques`}
                  >
                    Últimas notícias
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:opacity-70"
                    href={`/${tenantQuery}#editorias`}
                  >
                    Editorias
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:opacity-70"
                    href={`/${tenantQuery}#mercados`}
                  >
                    Mercados
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Editorias no rodapé">
              <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-90">
                Editorias
              </p>
              <ul className="mt-4 grid gap-3 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-1">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.slug}>
                    <Link
                      className="hover:opacity-70"
                      href={`/editoria/${category.slug}${tenantQuery}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-4 pt-6 text-xs leading-5 opacity-80 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} {theme.brandName}. Todos os direitos reservados.
            </p>
            <p>Saúde · Economia · Longevidade</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
