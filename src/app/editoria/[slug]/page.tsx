import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPortalRenderer } from "@/components/public/public-portal-renderer";
import { parsePublicTenantRequest } from "@/lib/public-tenant-request";
import { listPublicCategories } from "@/lib/presentation/public-categories";
import {
  loadPublicStories,
  loadPublicTenant,
  loadTenantTheme,
} from "@/lib/presentation/public-page-data";
import { buildTenantMetadata } from "@/lib/presentation/tenant-metadata";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return buildTenantMetadata(query.tenant, { kind: "editoria", slug });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const request = parsePublicTenantRequest(query.tenant);
  if (request.kind === "invalid") notFound();
  const tenant = await loadPublicTenant(
    request.kind === "explicit" ? request.slug : null,
  );
  if (!tenant) notFound();
  const [stories, theme] = await Promise.all([
    loadPublicStories(tenant.id, tenant.catalogReferences),
    loadTenantTheme(tenant.id),
  ]);
  if (!theme) notFound();
  const categories = listPublicCategories(
    stories,
    theme.siteModel,
    theme.navigation,
  );
  if (!categories.some((category) => category.slug === slug)) notFound();
  const categoryStories = stories
    .filter((story) => story.categorySlug === slug)
    .sort(
      (left, right) =>
        (left.editorialOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.editorialOrder ?? Number.MAX_SAFE_INTEGER),
  );
  if (categoryStories.length === 0) notFound();

  return (
    <PublicPortalRenderer
      categories={categories}
      categoryName={categoryStories[0]!.categoryName}
      page="editoria"
      stories={categoryStories}
      tenant={tenant}
      theme={theme}
    />
  );
}
