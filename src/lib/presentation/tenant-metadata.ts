import "server-only";

import type { Metadata } from "next";

import { parsePublicTenantRequest } from "@/lib/public-tenant-request";

import { listPublicCategories } from "./public-categories";
import {
  loadPublicStories,
  loadPublicTenant,
  loadTenantTheme,
} from "./public-page-data";

const IGNORED_WORDS = new Set(["&", "da", "de", "do", "das", "dos", "demo", "e"]);

/**
 * Two-letter mark for the generated favicon: CamelCase capitals
 * ("FinanciaCar" → "FC"), a short all-caps first word ("BV Educação" → "BV")
 * or the initials of the first meaningful words ("Banco Demo Horizonte" → "BH").
 */
export function tenantInitials(brandName: string) {
  const name = brandName.trim();
  const words = name
    .split(/\s+/)
    .filter((word) => word && !IGNORED_WORDS.has(word.toLowerCase()));
  const first = words[0] ?? name;
  if (words.length === 1) {
    const capitals = first.match(/\p{Lu}/gu) ?? [];
    return (capitals.length >= 2 ? capitals.slice(0, 2).join("") : first.slice(0, 1))
      .toLocaleUpperCase("pt-BR");
  }
  if (/^\p{Lu}{2,3}$/u.test(first)) return first;
  return words
    .slice(0, 2)
    .map((word) => word.slice(0, 1))
    .join("")
    .toLocaleUpperCase("pt-BR");
}

type TenantPage =
  | { kind: "home" }
  | { kind: "editoria"; slug: string }
  | { kind: "materia"; slug: string };

/** Tab title, description and favicon for a public page of a tenant. */
export async function buildTenantMetadata(
  tenantParam: string | string[] | undefined,
  page: TenantPage,
): Promise<Metadata> {
  const request = parsePublicTenantRequest(tenantParam);
  if (request.kind === "invalid") return {};
  try {
    const tenant = await loadPublicTenant(
      request.kind === "explicit" ? request.slug : null,
    );
    if (!tenant) return {};
    const theme = await loadTenantTheme(tenant.id);
    if (!theme) return {};

    let title = `${theme.brandName} — ${theme.slogan}`;
    if (page.kind !== "home") {
      const allStories = await loadPublicStories(
        tenant.id,
        tenant.catalogReferences,
      );
      // Same visibility rule as the pages: the published navigation is an
      // allowlist, so hidden stories never leak through the tab title.
      const visible = new Set(
        listPublicCategories(allStories, theme.siteModel, theme.navigation).map(
          (category) => category.slug,
        ),
      );
      const stories = allStories.filter((story) =>
        visible.has(story.categorySlug),
      );
      const label =
        page.kind === "editoria"
          ? stories.find((story) => story.categorySlug === page.slug)
              ?.categoryName
          : stories.find((story) => story.canonicalSlug === page.slug)?.title;
      if (label) title = `${label} | ${theme.brandName}`;
    }

    return {
      description: theme.slogan,
      icons: {
        icon: {
          type: "image/svg+xml",
          url: `/api/public/tenant-icon/${encodeURIComponent(tenant.slug)}?v=${theme.id}`,
        },
      },
      title,
    };
  } catch {
    return {};
  }
}
