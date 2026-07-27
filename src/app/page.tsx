import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { MarketTicker } from "@/components/public/market-ticker";
import { StoryList } from "@/components/public/story-list";
import { getExchangeRates } from "@/lib/market/exchange-rates";
import { parsePublicTenantRequest } from "@/lib/public-tenant-request";
import {
  getDemoTenantIdentity,
  getDemoTenantThemeFallback,
  listHomePlacementIds,
  listPublicStories,
  resolveDefaultPublicTenant,
  resolvePublicTenant,
} from "@/lib/supabase/portal-repository";
import { getTenantTheme } from "@/lib/supabase/theme-repository";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function loadHome(request: ReturnType<typeof parsePublicTenantRequest>) {
  try {
    if (request.kind === "invalid") {
      return { found: false as const, ok: true as const };
    }
    const tenant =
      request.kind === "explicit"
        ? await resolvePublicTenant(request.slug)
        : await resolveDefaultPublicTenant();
    if (!tenant) return { found: false as const, ok: true as const };
    const [stories, placements, theme, exchangeRates] = await Promise.all([
      listPublicStories(tenant.id),
      listHomePlacementIds(tenant.id),
      getTenantTheme(tenant.id),
      getExchangeRates(),
    ]);
    if (!theme) return { found: false as const, ok: true as const };
    return {
      found: true as const,
      ok: true as const,
      placements,
      stories,
      tenant,
      theme,
      exchangeRates,
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
  const request = parsePublicTenantRequest(params.tenant);
  if (request.kind === "invalid") notFound();
  const fallbackTenant =
    request.kind === "explicit"
      ? getDemoTenantIdentity(request.slug)
      : null;
  const fallbackTheme =
    request.kind === "explicit"
      ? getDemoTenantThemeFallback(request.slug)
      : null;
  if (
    request.kind === "explicit" &&
    (!fallbackTenant || !fallbackTheme)
  ) {
    notFound();
  }

  const loaded = await loadHome(request);
  if (!loaded.ok) {
    if (request.kind === "default") {
      return <DefaultPortalUnavailable />;
    }
    return (
      <PublicShell tenant={fallbackTenant!} theme={fallbackTheme!}>
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
  if (!loaded.found) {
    if (request.kind === "default") {
      return <DefaultPortalUnavailable />;
    }
    notFound();
  }
  const { exchangeRates, placements, stories, tenant, theme } = loaded;
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
        <MarketTicker rates={exchangeRates} />
        {hero ? (
          <section
            className="page-container border-b border-border-subtle py-7 sm:py-10"
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
              <div
                className={`hero-copy flex flex-col justify-end ${
                  theme.hero === "featured-grid"
                    ? "border-l-8 border-brand-secondary pl-5 sm:pl-8"
                    : theme.hero === "science-feature"
                      ? "border-t-4 border-accent pt-5"
                      : ""
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                  {heroPlacement?.eyebrow_override ?? hero.categoryName}
                </p>
                <h1 className="mt-3 font-heading text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.96] font-bold tracking-[-0.055em] text-brand-primary">
                  {hero.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
                  {hero.subtitle}
                </p>
                <Link
                  className="story-link mt-6 inline-flex min-h-11 w-fit items-center gap-3 border-b-2 border-brand-primary py-2 text-sm font-bold text-brand-primary no-underline"
                  href={`/materia/${hero.canonicalSlug}?tenant=${encodeURIComponent(tenant.slug)}`}
                >
                  Ler matéria <span aria-hidden="true">→</span>
                </Link>
              </div>
              {hero.imagePath ? (
                <Link
                  aria-label={`Ler ${hero.title}`}
                  className="hero-media relative aspect-[4/3] w-full overflow-hidden bg-surface-muted sm:min-h-72 lg:order-last"
                  href={`/materia/${hero.canonicalSlug}?tenant=${encodeURIComponent(tenant.slug)}`}
                >
                  <Image
                    alt={hero.imageAlt ?? ""}
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 38vw"
                    src={hero.imagePath}
                  />
                </Link>
              ) : null}
            </div>
          </section>
        ) : (
          <PublicEmpty tenantName={tenant.displayName} />
        )}

        {ordered.length > 1 ? (
          <section
            aria-labelledby="destaques-title"
            className="page-container py-10 sm:py-14"
            id="destaques"
          >
            <div className="grid gap-10 lg:grid-cols-[0.58fr_1.42fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                  Agora
                </p>
                <h2
                  className="mt-3 max-w-sm font-heading text-4xl leading-tight font-bold tracking-tight text-brand-primary sm:text-5xl"
                  id="destaques-title"
                >
                  As notícias que conectam saúde e economia.
                </h2>
                <p className="mt-5 max-w-md leading-7 text-text-muted">
                  Análises, explicadores e tendências para acompanhar uma
                  sociedade que vive mais.
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

function DefaultPortalUnavailable() {
  return (
    <div className="min-h-screen bg-[#f4f5f3] text-slate-950">
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <main
        className="grid min-h-[70vh] place-items-center px-5"
        id="conteudo-principal"
      >
        <div className="max-w-xl border-y border-slate-300 bg-white px-5 py-12 text-center sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            Demonstração indisponível
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            O portal padrão não pôde ser carregado.
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            A configuração pública precisa ser verificada no ADM antes de uma
            nova tentativa.
          </p>
        </div>
      </main>
    </div>
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
