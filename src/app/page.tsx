import { notFound } from "next/navigation";

import { SiteModelHome } from "@/components/public/models";
import { PublicShell } from "@/components/public/public-shell";
import { getMarketQuotes } from "@/lib/market/market-data";
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
    const [stories, placements, theme, marketQuotes] = await Promise.all([
      listPublicStories(tenant.id),
      listHomePlacementIds(tenant.id),
      getTenantTheme(tenant.id),
      getMarketQuotes(),
    ]);
    if (!theme) return { found: false as const, ok: true as const };
    return {
      found: true as const,
      ok: true as const,
      placements,
      stories,
      tenant,
      theme,
      marketQuotes,
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
  const loaded = await loadHome(request);
  if (!loaded.ok) {
    if (
      request.kind === "default" ||
      !fallbackTenant ||
      !fallbackTheme
    ) {
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
  const { marketQuotes, placements, stories, tenant, theme } = loaded;
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
          <SiteModelHome
            hero={hero}
            heroEyebrow={heroPlacement?.eyebrow_override}
            marketQuotes={marketQuotes}
            siteModel={theme.siteModel}
            stories={ordered}
            tenant={tenant}
          />
        ) : (
          <PublicEmpty tenantName={tenant.displayName} />
        )}
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
