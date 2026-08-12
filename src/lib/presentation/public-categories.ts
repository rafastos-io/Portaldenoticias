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
  if (siteModel !== "health-pharma") return categories;

  return categories.sort((left, right) => {
    const leftIndex = HEALTH_CATEGORY_ORDER.indexOf(
      left.slug as (typeof HEALTH_CATEGORY_ORDER)[number],
    );
    const rightIndex = HEALTH_CATEGORY_ORDER.indexOf(
      right.slug as (typeof HEALTH_CATEGORY_ORDER)[number],
    );
    return (
      (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
    );
  });
}
