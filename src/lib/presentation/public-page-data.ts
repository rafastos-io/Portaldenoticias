import "server-only";

import { cache } from "react";

import {
  listPublicStories,
  resolveDefaultPublicTenant,
  resolvePublicTenant,
} from "@/lib/supabase/portal-repository";
import { getTenantTheme } from "@/lib/supabase/theme-repository";

// Request-scoped memoization: generateMetadata and the page share one read
// of tenant, theme and catalog instead of querying Supabase twice.

/** `null` resolves the configured default portal. */
export const loadPublicTenant = cache((slug: string | null) =>
  slug === null ? resolveDefaultPublicTenant() : resolvePublicTenant(slug),
);

export const loadTenantTheme = cache(getTenantTheme);

export const loadPublicStories = cache(listPublicStories);
