import { notFound } from "next/navigation";

import { SiteModelCategory } from "@/components/public/models";
import { PublicShell } from "@/components/public/public-shell";
import { parsePublicTenantRequest } from "@/lib/public-tenant-request";
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
      <SiteModelCategory
        categoryName={categoryStories[0]!.categoryName}
        siteModel={theme.siteModel}
        stories={categoryStories}
        tenant={tenant}
      />
    </PublicShell>
  );
}
