import Link from "next/link";

import type { ThemeValues } from "@/lib/admin/theme-form";
import type {
  PublicStory,
  PublicTenant,
} from "@/lib/supabase/portal-repository";

export function StoryList({
  stories,
  tenant,
  theme,
}: {
  stories: PublicStory[];
  tenant: PublicTenant;
  theme: ThemeValues;
}) {
  const tenantQuery = `?tenant=${encodeURIComponent(tenant.slug)}`;

  return (
    <div className="border-t border-border-subtle">
      {stories.map((story, index) => (
        <article
          className={`grid gap-4 border-b border-border-subtle py-7 sm:items-start ${
            theme.card === "compact-horizontal"
              ? "sm:grid-cols-[1.25rem_1fr_auto] sm:py-5"
              : "sm:grid-cols-[2rem_1fr_auto]"
          }`}
          key={story.id}
        >
          <span aria-hidden="true" className="pt-1 font-mono text-xs text-text-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <Link
              className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary"
              href={`/editoria/${story.categorySlug}${tenantQuery}`}
            >
              {story.categoryName}
            </Link>
            {story.sponsorshipLabel ? (
              <p className="mt-2 text-xs font-bold text-amber-800">
                {story.sponsorshipLabel}
              </p>
            ) : null}
            <h3 className="mt-2 max-w-2xl text-xl leading-7 font-bold tracking-tight sm:text-2xl">
              <Link
                className="no-underline hover:underline"
                href={`/materia/${story.canonicalSlug}${tenantQuery}`}
              >
                {story.title}
              </Link>
            </h3>
            <p className="mt-3 max-w-2xl leading-7 text-text-muted">
              {story.subtitle}
            </p>
            {theme.card === "data-led" ? (
              <p className="mt-3 border-l-2 border-accent pl-3 text-xs font-bold text-text-primary">
                Contexto demonstrativo · leitura editorial
              </p>
            ) : null}
          </div>
          <Link
            aria-label={`Ler ${story.title}`}
            className="hidden size-10 place-items-center rounded-full border border-border-subtle text-link no-underline transition-transform hover:translate-x-1 sm:grid"
            href={`/materia/${story.canonicalSlug}${tenantQuery}`}
          >
            →
          </Link>
        </article>
      ))}
    </div>
  );
}
