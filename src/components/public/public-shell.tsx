import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { DemoNotice } from "@/components/demo-notice";
import { PublicHeader } from "@/components/public/public-header";
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
    <div className="min-h-screen bg-surface-page text-text-primary" style={themeStyle}>
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <DemoNotice />
      <PublicHeader categories={categories} tenant={tenant} theme={theme} />
      {children}
      <footer className="bg-surface-inverse text-text-on-brand">
        <div className="page-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-heading text-2xl font-bold">
              {theme.brandName}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Portal fictício criado exclusivamente para demonstrar a plataforma
              editorial Broadcast Saúde &amp; Longevidade.
            </p>
          </div>
          <nav aria-label="Navegação do rodapé" className="flex gap-6 text-sm">
            <Link href={`/${tenantQuery}`}>Início</Link>
            <Link href="/admin">ADM demo</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
