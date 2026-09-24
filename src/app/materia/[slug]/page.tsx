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
  return buildTenantMetadata(query.tenant, { kind: "materia", slug });
}

export default async function StoryPage({
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
  const story = stories.find((item) => item.canonicalSlug === slug);
  if (!story) notFound();
  if (!categories.some((category) => category.slug === story.categorySlug)) {
    notFound();
  }
  return (
    <PublicPortalRenderer
      categories={categories}
      page="materia"
      story={story}
      tenant={tenant}
      theme={theme}
    />
  );
}
