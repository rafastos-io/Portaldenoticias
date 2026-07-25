import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { StoryList } from "@/components/public/story-list";
import {
  getDemoTenantIdentity,
  listPublicStories,
  resolvePublicTenant,
} from "@/lib/supabase/portal-repository";
import { getTenantTheme } from "@/lib/supabase/theme-repository";

export default async function CategoryPage({
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
  const categoryStories = stories.filter((story) => story.categorySlug === slug);
  if (categoryStories.length === 0) notFound();
  const categories = [
    ...new Map(
      stories.map((story) => [
        story.categorySlug,
        { name: story.categoryName, slug: story.categorySlug },
      ]),
    ).values(),
  ];

  return (
    <PublicShell categories={categories} tenant={tenant} theme={theme}>
      <main className="page-container py-12 sm:py-16" id="conteudo-principal">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
          Editoria
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-brand-primary sm:text-6xl">
          {categoryStories[0]?.categoryName}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-text-muted">
          Matérias fictícias publicadas e distribuídas para {tenant.displayName}.
        </p>
        <section aria-label="Matérias da editoria" className="mt-10">
          <StoryList stories={categoryStories} tenant={tenant} theme={theme} />
        </section>
      </main>
    </PublicShell>
  );
}
