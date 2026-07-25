import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import {
  getDemoTenantIdentity,
  listPublicStories,
  resolvePublicTenant,
} from "@/lib/supabase/portal-repository";
import { getTenantTheme } from "@/lib/supabase/theme-repository";

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const tenantSlug =
    typeof query.tenant === "string" ? query.tenant : "banco-demo-horizonte";
  if (!getDemoTenantIdentity(tenantSlug)) notFound();
  const tenant = await resolvePublicTenant(tenantSlug);
  if (!tenant) notFound();
  const [stories, theme] = await Promise.all([
    listPublicStories(tenant.id),
    getTenantTheme(tenant.id),
  ]);
  if (!theme) notFound();
  const story = stories.find((item) => item.canonicalSlug === slug);
  if (!story) notFound();
  const categories = [
    ...new Map(
      stories.map((item) => [
        item.categorySlug,
        { name: item.categoryName, slug: item.categorySlug },
      ]),
    ).values(),
  ];
  const tenantQuery = `?tenant=${encodeURIComponent(tenant.slug)}`;

  return (
    <PublicShell categories={categories} tenant={tenant} theme={theme}>
      <main id="conteudo-principal">
        <article>
          <header className="page-container py-12 sm:py-16">
            <Link
              className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary"
              href={`/editoria/${story.categorySlug}${tenantQuery}`}
            >
              {story.categoryName}
            </Link>
            {story.sponsorshipLabel ? (
              <p className="mt-5 w-fit bg-demo-surface px-3 py-2 text-xs font-bold text-demo-text">
                {story.sponsorshipLabel}
              </p>
            ) : null}
            <h1 className="mt-5 max-w-5xl font-heading text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.98] font-bold tracking-[-0.045em] text-brand-primary">
              {story.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-text-muted sm:text-xl">
              {story.subtitle}
            </p>
            <p className="mt-7 text-sm font-semibold">
              Por {story.author} <span className="text-text-muted">• perfil fictício</span>
            </p>
          </header>

          {story.imagePath ? (
            <div className="page-container">
              <div className="relative aspect-[16/8] overflow-hidden bg-surface-muted">
                <Image
                  alt={story.imageAlt ?? ""}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1240px) 100vw, 1240px"
                  src={story.imagePath}
                />
              </div>
            </div>
          ) : (
            <p className="page-container border-y border-border-subtle py-5 text-sm text-text-muted">
              Esta matéria usa a exceção editorial demonstrativa sem imagem.
            </p>
          )}

          <div className="page-container grid gap-10 py-12 lg:grid-cols-[minmax(0,46rem)_1fr] lg:py-16">
            <div className="space-y-7 text-lg leading-8">
              {story.correctionNote ? (
                <aside className="border-l-4 border-amber-700 bg-demo-surface p-4 text-sm leading-6 text-demo-text">
                  <strong>Nota de correção:</strong> {story.correctionNote}
                </aside>
              ) : null}
              {story.body.map((paragraph, index) => (
                <p key={`${story.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
            <aside className="border-t border-border-subtle pt-5 text-sm leading-6 text-text-muted">
              Ambiente demonstrativo. Esta matéria, autoria e eventuais situações
              mencionadas são inteiramente fictícias.
            </aside>
          </div>
        </article>
      </main>
    </PublicShell>
  );
}
