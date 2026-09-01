import { notFound } from "next/navigation";

import { PublicPortalRenderer } from "@/components/public/public-portal-renderer";
import { parsePublicTenantRequest } from "@/lib/public-tenant-request";
import { listPublicCategories } from "@/lib/presentation/public-categories";
import {
  listPublicStories,
  resolveDefaultPublicTenant,
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
  const request = parsePublicTenantRequest(query.tenant);
  if (request.kind === "invalid") notFound();
  const tenant =
    request.kind === "explicit"
      ? await resolvePublicTenant(request.slug)
      : await resolveDefaultPublicTenant();
  if (!tenant) notFound();
  const [stories, theme] = await Promise.all([
    listPublicStories(tenant.id, tenant.catalogReferences),
    getTenantTheme(tenant.id),
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
