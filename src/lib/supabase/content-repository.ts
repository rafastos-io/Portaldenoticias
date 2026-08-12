import "server-only";

import type { EditorialType } from "@/lib/admin/content-form";

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
    .select(
        "id, title, subtitle, body_text, body_json, sponsorship_label, correction_note",
      )
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

  let authorName = "";
  if (authorResult.data?.author_id) {
    const { data: authorRow } = await supabase
      .from("authors")
      .select("display_name")
      .eq("id", authorResult.data.author_id)
      .limit(1)
      .maybeSingle();
    authorName = authorRow?.display_name ?? "";
  }

  let editorialType: EditorialType = "standard";
  let sponsorshipLabel: string | null = null;
  let correctionNote: string | null = null;
  let keyTopics: string[] = [];

  if (
    typeof revision.body_json === "object" &&
    revision.body_json !== null &&
    !Array.isArray(revision.body_json)
  ) {
    const bodyJson = revision.body_json as Record<string, unknown>;
    if (
      typeof bodyJson.editorial_type === "string" &&
      EDITORIAL_TYPES.includes(bodyJson.editorial_type as EditorialType)
    ) {
      editorialType = bodyJson.editorial_type as EditorialType;
    }
    if (typeof revision.sponsorship_label === "string") {
      sponsorshipLabel = revision.sponsorship_label;
    }
    if (typeof revision.correction_note === "string") {
      correctionNote = revision.correction_note;
    }
    if (Array.isArray(bodyJson.key_topics)) {
      keyTopics = bodyJson.key_topics.filter(
        (item): item is string => typeof item === "string",
      );
    }
  }

  return {
    ...item,
    revision,
    ...readDemoMedia(revision.body_json),
    authorName,
    categoryId: categoryResult.data?.category_id ?? null,
    correctionNote,
    editorialType,
    keyTopics,
    sponsorshipLabel,
  };
}

const EDITORIAL_TYPES = ["standard", "explainer", "sponsored", "correction"] as const;

const AUTHOR_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugifyAuthorName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

async function resolveAuthorByName(
  tenantId: string,
  authorName: string,
): Promise<string> {
  const supabase = createServerSupabaseClient();
  const trimmed = authorName.trim();

  const { data: existing, error: lookupError } = await supabase
    .from("authors")
    .select("id")
    .or(
      `owner_tenant_id.eq.${PLATFORM_TENANT_ID},owner_tenant_id.eq.${tenantId}`,
    )
    .eq("status", "active")
    .ilike("display_name", trimmed)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error("Não foi possível verificar a autoria.", {
      cause: lookupError,
    });
  }

  if (existing) return existing.id;

  let candidateSlug = slugifyAuthorName(trimmed);
  if (!AUTHOR_SLUG.test(candidateSlug)) {
    candidateSlug = `autor-${Date.now().toString(36)}`;
  }

  const { data: created, error: insertError } = await supabase
    .from("authors")
    .insert({
      bio: "Perfil fictício criado no CMS demonstrativo.",
      display_name: trimmed,
      is_demo: true,
      owner_tenant_id: tenantId,
      slug: candidateSlug,
      status: "active",
    })
    .select("id")
    .single();

  if (insertError || !created) {
    const { data: retry, error: retryError } = await supabase
      .from("authors")
      .select("id")
      .or(
        `owner_tenant_id.eq.${PLATFORM_TENANT_ID},owner_tenant_id.eq.${tenantId}`,
      )
      .eq("status", "active")
      .ilike("display_name", trimmed)
      .limit(1)
      .maybeSingle();
    if (retryError || !retry) {
      throw new Error("Não foi possível cadastrar a autoria informada.", {
        cause: retryError ?? insertError,
      });
    }
    return retry.id;
  }

  return created.id;
}

async function applyEditorialMetadata(input: {
  contentId: string;
  correctionNote: string | null;
  editorialType: EditorialType;
  keyTopics: string[];
  revisionId: string | null;
  sponsorshipLabel: string | null;
  tenantId: string;
}) {
  if (input.editorialType === "standard" && !input.correctionNote && !input.sponsorshipLabel && input.keyTopics.length === 0) {
    return;
  }

  const supabase = createServerSupabaseClient();
  let targetRevisionId = input.revisionId;

  if (!targetRevisionId) {
    const { data: revision, error: revisionError } = await supabase
      .from("content_revisions")
      .select("id")
      .eq("content_item_id", input.contentId)
      .order("revision_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (revisionError || !revision) {
      throw new Error("Não foi possível localizar a revisão criada.", {
        cause: revisionError,
      });
    }
    targetRevisionId = revision.id;
  }

  const patch: {
    body_json: Json;
    correction_note?: string;
    sponsorship_label?: string;
  } = {
    body_json: {
      editorial_type: input.editorialType,
      key_topics: input.keyTopics,
    },
  };
  if (input.correctionNote) patch.correction_note = input.correctionNote;
  if (input.sponsorshipLabel) patch.sponsorship_label = input.sponsorshipLabel;

  const { error: updateError } = await supabase
    .from("content_revisions")
    .update(patch)
    .eq("id", targetRevisionId);

  if (updateError) {
    throw new Error("Não foi possível salvar os metadados editoriais.", {
      cause: updateError,
    });
  }

  if (input.editorialType === "sponsored") {
    await supabase
      .from("content_items")
      .update({ content_type: "sponsored" })
      .eq("id", input.contentId)
      .eq("owner_tenant_id", input.tenantId);
  }
}

export async function createAdminContent(input: {
  authorName: string;
  body: string;
  categoryId: string;
  correctionNote: string | null;
  editorialType: EditorialType;
  imageAlt: string;
  imageMode: AdminImageMode;
  keyTopics: string[];
  slug: string;
  sponsorshipLabel: string | null;
  subtitle: string;
  tenantId: string;
  title: string;
}) {
  const supabase = createServerSupabaseClient();
  const authorId = await resolveAuthorByName(input.tenantId, input.authorName);
  const { data, error } = await supabase.rpc("cms_create_content_with_media", {
    p_author_id: toEntityId(authorId),
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

  await applyEditorialMetadata({
    contentId: data,
    correctionNote: input.correctionNote,
    editorialType: input.editorialType,
    keyTopics: input.keyTopics,
    revisionId: null,
    sponsorshipLabel: input.sponsorshipLabel,
    tenantId: input.tenantId,
  });

  return data;
}

export async function updateAdminContent(input: {
  authorName: string;
  body: string;
  categoryId: string;
  contentId: string;
  correctionNote: string | null;
  editorialType: EditorialType;
  imageAlt: string;
  imageMode: AdminImageMode;
  keyTopics: string[];
  slug: string;
  sponsorshipLabel: string | null;
  subtitle: string;
  tenantId: string;
  title: string;
}) {
  const supabase = createServerSupabaseClient();
  const authorId = await resolveAuthorByName(input.tenantId, input.authorName);
  const { data, error } = await supabase.rpc("cms_update_content_with_media", {
    p_author_id: toEntityId(authorId),
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

  await applyEditorialMetadata({
    contentId: input.contentId,
    correctionNote: input.correctionNote,
    editorialType: input.editorialType,
    keyTopics: input.keyTopics,
    revisionId: data,
    sponsorshipLabel: input.sponsorshipLabel,
    tenantId: input.tenantId,
  });

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
