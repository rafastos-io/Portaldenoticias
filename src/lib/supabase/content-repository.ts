import "server-only";

import { createServerSupabaseClient } from "./server";
import { toEntityId, toTenantId } from "./tenant-scope";
import type { Json } from "./database.types";

const PLATFORM_TENANT_ID = "00000000-0000-4000-8000-000000000001";

export type AdminContentStatus = "draft" | "published" | "paused";
export type AdminImageMode = "fallback" | "none";

function readDemoMedia(value: Json): {
  imageAlt: string;
  imageMode: AdminImageMode;
} {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof value.demo_media === "object" &&
    value.demo_media !== null &&
    !Array.isArray(value.demo_media)
  ) {
    const mode = value.demo_media.mode;
    const alt = value.demo_media.alt;
    if (mode === "none") {
      return { imageAlt: "", imageMode: "none" };
    }
    if (mode === "fallback" && typeof alt === "string") {
      return { imageAlt: alt, imageMode: "fallback" };
    }
  }

  return {
    imageAlt: "Composição abstrata fictícia sobre saúde e longevidade.",
    imageMode: "fallback",
  };
}

export async function listAdminTenants() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, display_name")
    .eq("kind", "demo")
    .eq("status", "demo")
    .order("display_name");

  if (error) {
    throw new Error("Não foi possível carregar os tenants.", { cause: error });
  }

  return data;
}

export async function listAdminContent(
  tenantIdInput: string,
  status?: AdminContentStatus,
) {
  const tenantId = toTenantId(tenantIdInput);
  const supabase = createServerSupabaseClient();
  let itemQuery = supabase
    .from("content_items")
    .select("id, content_type, workflow_status, updated_at, last_published_at")
    .eq("owner_tenant_id", tenantId)
    .in("workflow_status", ["draft", "published", "paused"])
    .order("updated_at", { ascending: false });

  if (status) {
    itemQuery = itemQuery.eq("workflow_status", status);
  }

  const { data: items, error: itemsError } = await itemQuery;
  if (itemsError) {
    throw new Error("Não foi possível listar as matérias do tenant.", {
      cause: itemsError,
    });
  }

  if (items.length === 0) {
    return [];
  }

  const itemIds = items.map((item) => item.id);
  const { data: revisions, error: revisionsError } = await supabase
    .from("content_revisions")
    .select("id, content_item_id, title, subtitle, revision_number")
    .in("content_item_id", itemIds)
    .order("revision_number", { ascending: false });

  if (revisionsError) {
    throw new Error("Não foi possível carregar as revisões.", {
      cause: revisionsError,
    });
  }

  const latestRevision = new Map<
    string,
    (typeof revisions)[number]
  >();
  for (const revision of revisions) {
    if (!latestRevision.has(revision.content_item_id)) {
      latestRevision.set(revision.content_item_id, revision);
    }
  }

  return items.map((item) => ({
    ...item,
    revision: latestRevision.get(item.id) ?? null,
  }));
}

export async function getAdminEditorOptions(tenantIdInput: string) {
  const tenantId = toTenantId(tenantIdInput);
  const supabase = createServerSupabaseClient();
  const ownerFilter = `owner_tenant_id.eq.${PLATFORM_TENANT_ID},owner_tenant_id.eq.${tenantId}`;
  const [authorsResult, categoriesResult] = await Promise.all([
    supabase
      .from("authors")
      .select("id, display_name")
      .or(ownerFilter)
      .eq("status", "active")
      .order("display_name"),
    supabase
      .from("categories")
      .select("id, name")
      .or(ownerFilter)
      .eq("status", "active")
      .order("name"),
  ]);

  if (authorsResult.error || categoriesResult.error) {
    throw new Error("Não foi possível carregar autoria e editorias.", {
      cause: authorsResult.error ?? categoriesResult.error,
    });
  }

  return {
    authors: authorsResult.data,
    categories: categoriesResult.data,
  };
}

export async function findOwnedContentItem(
  tenantIdInput: string,
  contentItemIdInput: string,
) {
  const tenantId = toTenantId(tenantIdInput);
  const contentItemId = toEntityId(contentItemIdInput);
  const supabase = createServerSupabaseClient();
  const { data: item, error: itemError } = await supabase
    .from("content_items")
    .select("id, canonical_slug, workflow_status")
    .eq("owner_tenant_id", tenantId)
    .eq("id", contentItemId)
    .maybeSingle();

  if (itemError) {
    throw new Error("Não foi possível consultar a matéria do tenant.", {
      cause: itemError,
    });
  }
  if (!item) {
    return null;
  }

  const { data: revision, error: revisionError } = await supabase
    .from("content_revisions")
    .select("id, title, subtitle, body_text, body_json")
    .eq("content_item_id", item.id)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (revisionError) {
    throw new Error("Não foi possível carregar a revisão da matéria.", {
      cause: revisionError,
    });
  }
  if (!revision) {
    return { ...item, revision: null, authorId: null, categoryId: null };
  }

  const [authorResult, categoryResult] = await Promise.all([
    supabase
      .from("content_revision_authors")
      .select("author_id")
      .eq("content_revision_id", revision.id)
      .order("byline_order")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("content_revision_categories")
      .select("category_id")
      .eq("content_revision_id", revision.id)
      .eq("is_primary", true)
      .limit(1)
      .maybeSingle(),
  ]);

  if (authorResult.error || categoryResult.error) {
    throw new Error("Não foi possível carregar a classificação da matéria.", {
      cause: authorResult.error ?? categoryResult.error,
    });
  }

  return {
    ...item,
    revision,
    ...readDemoMedia(revision.body_json),
    authorId: authorResult.data?.author_id ?? null,
    categoryId: categoryResult.data?.category_id ?? null,
  };
}

export async function createAdminContent(input: {
  authorId: string;
  body: string;
  categoryId: string;
  imageAlt: string;
  imageMode: AdminImageMode;
  slug: string;
  subtitle: string;
  tenantId: string;
  title: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cms_create_content_with_media", {
    p_author_id: toEntityId(input.authorId),
    p_body_text: input.body,
    p_category_id: toEntityId(input.categoryId),
    p_image_alt: input.imageAlt,
    p_image_mode: input.imageMode,
    p_slug: input.slug,
    p_subtitle: input.subtitle,
    p_tenant_id: toTenantId(input.tenantId),
    p_title: input.title,
  });

  if (error) {
    throw new Error("Não foi possível criar a matéria.", { cause: error });
  }

  return data;
}

export async function updateAdminContent(input: {
  authorId: string;
  body: string;
  categoryId: string;
  contentId: string;
  imageAlt: string;
  imageMode: AdminImageMode;
  subtitle: string;
  tenantId: string;
  title: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cms_update_content_with_media", {
    p_author_id: toEntityId(input.authorId),
    p_body_text: input.body,
    p_category_id: toEntityId(input.categoryId),
    p_content_id: toEntityId(input.contentId),
    p_image_alt: input.imageAlt,
    p_image_mode: input.imageMode,
    p_subtitle: input.subtitle,
    p_tenant_id: toTenantId(input.tenantId),
    p_title: input.title,
  });

  if (error) {
    throw new Error("Não foi possível editar a matéria.", { cause: error });
  }

  return data;
}

export async function setAdminContentStatus(input: {
  contentId: string;
  reason: string;
  status: "published" | "paused";
  tenantId: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cms_set_content_status", {
    p_content_id: toEntityId(input.contentId),
    p_reason: input.reason,
    p_status: input.status,
    p_tenant_id: toTenantId(input.tenantId),
  });

  if (error) {
    throw new Error("Não foi possível alterar o status da matéria.", {
      cause: error,
    });
  }

  return data;
}
