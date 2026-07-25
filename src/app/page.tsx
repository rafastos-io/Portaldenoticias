import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { StoryList } from "@/components/public/story-list";
import {
  getDemoTenantIdentity,
  getDemoTenantThemeFallback,
  listHomePlacementIds,
  listPublicStories,
  resolvePublicTenant,
} from "@/lib/supabase/portal-repository";
import { getTenantTheme } from "@/lib/supabase/theme-repository";

const DEFAULT_TENANT = "banco-demo-horizonte";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function requestedTenant(value: string | string[] | undefined) {
  return typeof value === "string" ? value : DEFAULT_TENANT;
}

async function loadHome(tenantSlug: string) {
  try {
    const tenant = await resolvePublicTenant(tenantSlug);
    if (!tenant) return { found: false as const, ok: true as const };
    const [stories, placements, theme] = await Promise.all([
      listPublicStories(tenant.id),
      listHomePlacementIds(tenant.id),
      getTenantTheme(tenant.id),
    ]);
    if (!theme) return { found: false as const, ok: true as const };
    return {
      found: true as const,
      ok: true as const,
      placements,
      stories,
      tenant,
      theme,
    };
  } catch {
    return { ok: false as const };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tenantSlug = requestedTenant(params.tenant);
  const fallbackTenant = getDemoTenantIdentity(tenantSlug);
  if (!fallbackTenant) notFound();
  const fallbackTheme = getDemoTenantThemeFallback(tenantSlug);
  if (!fallbackTheme) notFound();

  const loaded = await loadHome(tenantSlug);
  if (!loaded.ok) {
    return (
      <PublicShell tenant={fallbackTenant} theme={fallbackTheme}>
        <main className="grid min-h-[60vh] place-items-center px-5" id="conteudo-principal">
          <div className="max-w-xl border-y border-border-subtle py-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
              Catálogo indisponível
            </p>
            <h1 className="mt-3 text-3xl font-bold">Não foi possível carregar as matérias.</h1>
            <p className="mt-3 leading-7 text-text-muted">
              O portal demonstrativo está configurado, mas a conexão server-side
              com o catálogo precisa ser verificada.
            </p>
          </div>
        </main>
      </PublicShell>
    );
  }
  if (!loaded.found) notFound();
  const { placements, stories, tenant, theme } = loaded;
    const categories = [
      ...new Map(
        stories.map((story) => [
          story.categorySlug,
          { name: story.categoryName, slug: story.categorySlug },
        ]),
      ).values(),
    ];
    const orderedIds = placements.map((placement) => placement.content_item_id);
    const ordered = [...stories].sort((left, right) => {
      const leftIndex = orderedIds.indexOf(left.id);
      const rightIndex = orderedIds.indexOf(right.id);
      return (
        (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
        (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
      );
    });
    const hero = ordered[0];
    const heroPlacement = hero
      ? placements.find(
          (placement) =>
            placement.content_item_id === hero.id &&
            placement.slot_key === "home.hero",
        )
      : null;

  return (
      <PublicShell categories={categories} tenant={tenant} theme={theme}>
        <main id="conteudo-principal">
          {hero ? (
            <section
              className={`relative isolate overflow-hidden ${
                theme.hero === "science-feature"
                  ? "min-h-[36rem] md:min-h-[42rem]"
                  : "min-h-[42rem] md:min-h-[calc(100svh-9.75rem)]"
              }`}
            >
              {hero.imagePath ? (
                <div className="hero-media absolute inset-0 -z-20">
                  <Image
                    alt={hero.imageAlt ?? ""}
                    className="object-cover object-[63%_center] md:object-center"
                    fill
                    priority
                    sizes="100vw"
                    src={hero.imagePath}
                  />
                </div>
              ) : null}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-surface-page/90 md:bg-[linear-gradient(90deg,var(--surface-page)_0%,color-mix(in_srgb,var(--surface-page)_88%,transparent)_55%,transparent_100%)]"
              />
              <div className="page-container flex min-h-[42rem] items-end py-12 md:min-h-[calc(100svh-9.75rem)] md:items-center md:py-16">
                <div
                  className={`hero-copy max-w-3xl ${
                    theme.hero === "featured-grid"
                      ? "border-l-8 border-brand-secondary bg-surface-raised/95 p-6 sm:p-10"
                      : theme.hero === "science-feature"
                        ? "border-t-4 border-accent pt-6"
                        : ""
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                    {heroPlacement?.eyebrow_override ?? hero.categoryName}
                  </p>
                  <h1 className="mt-4 font-heading text-[clamp(2.7rem,6.4vw,5.4rem)] leading-[0.96] font-bold tracking-[-0.055em] text-brand-primary">
                    {hero.title}
                  </h1>
                  <p className="mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
                    {hero.subtitle}
                  </p>
                  <Link
                    className="story-link mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-text-on-brand no-underline hover:bg-surface-inverse"
                    href={`/materia/${hero.canonicalSlug}?tenant=${encodeURIComponent(tenant.slug)}`}
                  >
                    Ler matéria <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            <PublicEmpty tenantName={tenant.displayName} />
          )}

          {ordered.length > 1 ? (
            <section
              aria-labelledby="destaques-title"
              className="page-container py-16 sm:py-20"
              id="destaques"
            >
              <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                    Curadoria demonstrativa
                  </p>
                  <h2
                    className="mt-3 max-w-sm font-heading text-4xl leading-tight font-bold tracking-tight text-brand-primary sm:text-5xl"
                    id="destaques-title"
                  >
                    Pautas para decisões de longo prazo.
                  </h2>
                  <p className="mt-5 max-w-md leading-7 text-text-muted">
                    Conteúdo fictício publicado e licenciado para este tenant.
                  </p>
                </div>
                <StoryList
                  stories={ordered.slice(1)}
                  tenant={tenant}
                  theme={theme}
                />
              </div>
            </section>
          ) : null}
        </main>
      </PublicShell>
  );
}

function PublicEmpty({ tenantName }: { tenantName: string }) {
  return (
    <section className="page-container grid min-h-[55vh] place-items-center py-16">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold">Nenhuma matéria publicada</h1>
        <p className="mt-3 leading-7 text-text-muted">
          {tenantName} não possui conteúdo ativo neste momento.
        </p>
      </div>
    </section>
  );
}
