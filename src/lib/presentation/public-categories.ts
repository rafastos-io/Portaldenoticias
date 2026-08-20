import type { PublicStory } from "@/lib/supabase/portal-repository";

import type { SiteModelId } from "./site-models";

const HEALTH_CATEGORY_ORDER = [
  "empresas",
  "m-a",
  "relgov",
  "investimentos",
  "regulacao",
  "pesquisa",
  "ti",
  "analise",
  "radar-da-imprensa",
] as const;

const CREDIT_CATEGORY_ORDER = [
  "indicadores",
  "investimentos",
  "alerta-de-golpes",
  "programando-o-futuro",
  "isso-ou-aquilo",
  "saia-das-dividas",
  "alivio-no-orcamento",
  "guias",
  "dicas-valiosas",
  "glossario",
] as const;

export function listPublicCategories(
  stories: PublicStory[],
  siteModel: SiteModelId,
) {
  const categories = [
    ...new Map(
      stories.map((story) => [
        story.categorySlug,
        { name: story.categoryName, slug: story.categorySlug },
      ]),
    ).values(),
  ];
  const preferredOrder =
    siteModel === "health-pharma"
      ? HEALTH_CATEGORY_ORDER
      : siteModel === "financial-services-credit"
        ? CREDIT_CATEGORY_ORDER
        : null;
  if (!preferredOrder) return categories;

  return categories.sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(
      left.slug as never,
    );
    const rightIndex = preferredOrder.indexOf(
      right.slug as never,
    );
    return (
      (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
    );
  });
}
