import "server-only";

import type { ThemeValues } from "@/lib/admin/theme-form";

import type { Json } from "./database.types";
import { getDefaultDemoPortalSetting } from "./demo-settings-repository";
import { createServerSupabaseClient } from "./server";
import { toTenantId } from "./tenant-scope";

export type PublicTenant = {
  displayName: string;
  id: string;
  slug: string;
  slogan: string;
};

export type PublicStory = {
  author: string;
  body: string[];
  bodyBlocks?: PublicStoryBodyBlock[];
  canonicalSlug: string;
  categoryName: string;
  categorySlug: string;
  correctionNote: string | null;
  editorialOrder: number | null;
  externalOnly: boolean;
  id: string;
  imageAlt: string | null;
  imagePath: string | null;
  isRealContent: boolean;
  publishedAt: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  sponsorshipLabel: string | null;
  subtitle: string;
  title: string;
};

export type PublicStoryBodyBlock = {
  text: string;
  type: "heading" | "paragraph";
};

const DEMO_TENANTS: Record<string, PublicTenant> = {
  "banco-demo-horizonte": {
    displayName: "Banco Demo Horizonte",
    id: "00000000-0000-4000-8000-000000000002",
    slug: "banco-demo-horizonte",
    slogan: "Planejamento para vidas mais longas",
  },
  "seguros-demo-atlas": {
    displayName: "Seguros Demo Atlas",
    id: "00000000-0000-4000-8000-000000000003",
    slug: "seguros-demo-atlas",
    slogan: "Proteção que acompanha cada fase",
  },
  abrafarma: {
    displayName: "Abrafarma",
    id: "00000000-0000-4000-8000-000000000004",
    slug: "abrafarma",
    slogan: "Aqui você fica por dentro da saúde",
  },
  "broadcast-saude": {
    displayName: "Broadcast Saúde",
    id: "00000000-0000-4000-8000-000000000006",
    slug: "broadcast-saude",
    slogan: "Informação estratégica para o setor de saúde",
  },
  "credito-demo-orbita": {
    displayName: "Crédito Demo Órbita",
    id: "00000000-0000-4000-8000-000000000005",
    slug: "credito-demo-orbita",
    slogan: "Clareza para decidir o próximo passo",
  },
  "bv-educacao": {
    displayName: "BV Educação",
    id: "00000000-0000-4000-8000-000000000007",
    slug: "bv-educacao",
    slogan: "Educação financeira e soluções de crédito para todas as fases da vida",
  },
};

const DEMO_THEME_FALLBACKS: Record<string, ThemeValues> = {
  "banco-demo-horizonte": {
    accent: "#C7A35A",
    background: "#F5F7F8",
    brandName: "Banco Demo Horizonte",
    card: "data-led",
    font: "sans-editorial",
    header: "masthead-clean",
    hero: "split-editorial",
    logoAlt: "",
    logoUrl: null,
    primary: "#12324A",
    secondary: "#2F80A3",
    siteModel: "investments-asset-management",
    slogan: "Planejamento para vidas mais longas",
    textColor: "#14232D",
  },
  "seguros-demo-atlas": {
    accent: "#D66B5D",
    background: "#FAF8F3",
    brandName: "Seguros Demo Atlas",
    card: "compact-horizontal",
    font: "sans-humana",
    header: "brand-centered",
    hero: "featured-grid",
    logoAlt: "",
    logoUrl: null,
    primary: "#174A47",
    secondary: "#C9B99A",
    siteModel: "insurance-pension",
    slogan: "Proteção que acompanha cada fase",
    textColor: "#18302F",
  },
  abrafarma: {
    accent: "#8ED1C9",
    background: "#F6F5FA",
    brandName: "Abrafarma",
    card: "data-led",
    font: "sans-geometrica",
    header: "masthead-minimal",
    hero: "science-feature",
    logoAlt: "",
    logoUrl: null,
    primary: "#4A2E78",
    secondary: "#20A4B8",
    siteModel: "health-pharma",
    slogan: "Aqui você fica por dentro da saúde",
    textColor: "#222033",
  },
  "broadcast-saude": {
    accent: "#D9912B",
    background: "#F7F9F8",
    brandName: "Broadcast Saúde",
    card: "data-led",
    font: "sans-editorial",
    header: "masthead-minimal",
    hero: "science-feature",
    logoAlt: "",
    logoUrl: null,
    primary: "#0B4A5A",
    secondary: "#1F7A8C",
    siteModel: "health-pharma",
    slogan: "Informação estratégica para o setor de saúde",
    textColor: "#15272C",
  },
  "credito-demo-orbita": {
    accent: "#E6A23C",
    background: "#F5F7F4",
    brandName: "Crédito Demo Órbita",
    card: "image-top",
    font: "sans-geometrica",
    header: "masthead-clean",
    hero: "featured-grid",
    logoAlt: "",
    logoUrl: null,
    primary: "#173F5F",
    secondary: "#2F76A5",
    siteModel: "financial-services-credit",
    slogan: "Clareza para decidir o próximo passo",
    textColor: "#142633",
  },
  "bv-educacao": {
    accent: "#00BAF2",
    background: "#F4F6F8",
    brandName: "BV Educação",
    card: "image-top",
    font: "sans-geometrica",
    header: "masthead-clean",
    hero: "featured-grid",
    logoAlt: "Logo BV Educação",
    logoUrl: "/images/bv-logo.png",
    primary: "#002B49",
    secondary: "#0099DA",
    siteModel: "financial-services-credit",
    slogan: "Educação financeira e soluções de crédito para todas as fases da vida",
    textColor: "#101828",
  },
};

export function getDemoTenantIdentity(slug: string) {
  return DEMO_TENANTS[slug] ?? null;
}

export function getDemoTenantThemeFallback(slug: string) {
  return DEMO_THEME_FALLBACKS[slug] ?? null;
}

export function getPublicCategoryName(
  categorySlug: string,
  persistedName?: string | null,
) {
  if (categorySlug === "ti") return "Tecnologia e Inovação";
  return persistedName?.trim() || "Destaques";
}

export function readPublicStoryBodyBlocks(
  bodyJson: Json,
  bodyText: string,
): PublicStoryBodyBlock[] {
  if (
    typeof bodyJson === "object" &&
    bodyJson !== null &&
    !Array.isArray(bodyJson) &&
    Array.isArray(bodyJson.content)
  ) {
    const blocks = bodyJson.content.flatMap((node) =>
      typeof node === "object" &&
      node !== null &&
      !Array.isArray(node) &&
      (node.type === "paragraph" || node.type === "heading") &&
      typeof node.text === "string"
        ? [{ text: node.text, type: node.type } as PublicStoryBodyBlock]
        : [],
    );
    if (blocks.length > 0) return blocks;
  }

  return bodyText
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((text) => ({ text, type: "paragraph" }));
}

function readBody(bodyJson: Json, bodyText: string) {
  return readPublicStoryBodyBlocks(bodyJson, bodyText)
    .filter((block) => block.type === "paragraph")
    .map((block) => block.text);
}

function readMedia(bodyJson: Json) {
  if (
    typeof bodyJson === "object" &&
    bodyJson !== null &&
    !Array.isArray(bodyJson) &&
    typeof bodyJson.demo_media === "object" &&
    bodyJson.demo_media !== null &&
    !Array.isArray(bodyJson.demo_media)
  ) {
    const media = bodyJson.demo_media;
    return {
      imageAlt: typeof media.alt === "string" ? media.alt : null,
      imagePath:
        media.mode === "fallback" && typeof media.fallback_path === "string"
          ? media.fallback_path
          : null,
    };
  }
  return { imageAlt: null, imagePath: null };
}

export function readEditorialOrigin(bodyJson: Json) {
  const emptyOrigin = {
    editorialOrder: null,
    externalOnly: false,
    isRealContent: false,
    sourceLabel: null,
    sourcePublishedAt: null,
    sourceUrl: null,
  };
  if (
    typeof bodyJson !== "object" ||
    bodyJson === null ||
    Array.isArray(bodyJson) ||
    typeof bodyJson.editorial_origin !== "object" ||
    bodyJson.editorial_origin === null ||
    Array.isArray(bodyJson.editorial_origin)
  ) {
    return emptyOrigin;
  }

  const origin = bodyJson.editorial_origin;
  if (origin.kind !== "authorized-real") return emptyOrigin;
  const sourceLabel =
    typeof origin.source_label === "string" && origin.source_label.trim()
      ? origin.source_label.trim()
      : null;
  const sourcePublishedAt =
    typeof origin.source_published_at === "string" &&
    !Number.isNaN(Date.parse(origin.source_published_at))
      ? origin.source_published_at
      : null;
  let sourceUrl: string | null = null;
  if (typeof origin.source_url === "string") {
    try {
      const candidate = new URL(origin.source_url);
      sourceUrl = candidate.protocol === "https:" ? candidate.toString() : null;
    } catch {
      sourceUrl = null;
    }
  }

  return {
    editorialOrder:
      typeof origin.briefing_order === "number" &&
      Number.isInteger(origin.briefing_order) &&
      origin.briefing_order > 0
        ? origin.briefing_order
        : null,
    externalOnly: origin.external_only === true,
    isRealContent: true,
    sourceLabel,
    sourcePublishedAt,
    sourceUrl,
  };
}

const CATEGORY_IMAGES: Record<string, { alt: string; path: string }> = {
  biotecnologia: {
    alt: "Equipe de pesquisa analisa amostras em um laboratório contemporâneo.",
    path: "/images/editorial-biotecnologia-laboratorio.png",
  },
  "inovacao-medica": {
    alt: "Equipe de pesquisa analisa amostras em um laboratório contemporâneo.",
    path: "/images/editorial-biotecnologia-laboratorio.png",
  },
  "longevidade-e-economia": {
    alt: "Mulher madura analisa documentos de planejamento em casa.",
    path: "/images/editorial-longevidade-planejamento.png",
  },
  "previdencia-e-seguros": {
    alt: "Mulher madura analisa documentos de planejamento em casa.",
    path: "/images/editorial-longevidade-planejamento.png",
  },
  "saude-e-regulacao": {
    alt: "Grupo de adultos maduros caminha em um parque urbano.",
    path: "/images/editorial-prevencao-ativa.png",
  },
  "trabalho-e-geracoes": {
    alt: "Profissionais de diferentes gerações colaboram em um projeto.",
    path: "/images/editorial-trabalho-geracoes.png",
  },
};

function resolveEditorialMedia(
  media: ReturnType<typeof readMedia>,
  categorySlug: string,
) {
  if (
    media.imagePath &&
    media.imagePath !== "/images/editorial-hero-demo.png"
  ) {
    return media;
  }

  const categoryImage = CATEGORY_IMAGES[categorySlug];
  return categoryImage
    ? { imageAlt: categoryImage.alt, imagePath: categoryImage.path }
    : media;
}

export async function resolvePublicTenant(
  slug: string,
): Promise<PublicTenant | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, display_name")
    .eq("slug", slug)
    .eq("kind", "demo")
    .eq("status", "demo")
    .maybeSingle();

  if (error) throw new Error("Falha ao resolver o tenant público.", { cause: error });
  if (!data) return null;

  return {
    displayName: data.display_name,
    id: data.id,
    slug: data.slug,
    slogan:
      getDemoTenantIdentity(data.slug)?.slogan ??
      "Conteúdo para vidas mais longas",
  };
}

export async function resolvePublicTenantById(
  tenantIdInput: string,
): Promise<PublicTenant | null> {
  const tenantId = toTenantId(tenantIdInput);
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, display_name")
    .eq("id", tenantId)
    .eq("kind", "demo")
    .eq("status", "demo")
    .eq("is_demo", true)
    .maybeSingle();

  if (error) {
    throw new Error("Falha ao resolver o tenant público padrão.", {
      cause: error,
    });
  }
  if (!data) return null;

  return {
    displayName: data.display_name,
    id: data.id,
    slug: data.slug,
    slogan:
      getDemoTenantIdentity(data.slug)?.slogan ??
      "Conteúdo para vidas mais longas",
  };
}

export async function resolveDefaultPublicTenant() {
  const setting = await getDefaultDemoPortalSetting();
  if (!setting) return null;
  return resolvePublicTenantById(setting.defaultTenantId);
}

export async function listPublicStories(
  tenantIdInput: string,
): Promise<PublicStory[]> {
  const tenantId = toTenantId(tenantIdInput);
  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data: distributions, error: distributionError } = await supabase
    .from("distributions")
    .select(
      "content_item_id, headline_override, subtitle_override, slug_override, category_override_id",
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .contains("channels", ["portal"])
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`);

  if (distributionError) {
    throw new Error("Falha ao consultar distribuições públicas.", {
      cause: distributionError,
    });
  }
  if (distributions.length === 0) return [];

  const itemIds = distributions.map((row) => row.content_item_id);
  const { data: items, error: itemError } = await supabase
    .from("content_items")
    .select(
      "id, canonical_slug, current_published_revision_id, last_published_at",
    )
    .in("id", itemIds)
    .eq("workflow_status", "published")
    .order("last_published_at", { ascending: false });

  if (itemError) throw new Error("Falha ao consultar conteúdo público.", { cause: itemError });
  const revisionIds = items.flatMap((item) =>
    item.current_published_revision_id
      ? [item.current_published_revision_id]
      : [],
  );
  if (revisionIds.length === 0) return [];

  const [revisionResult, authorLinkResult, categoryLinkResult] =
    await Promise.all([
      supabase
        .from("content_revisions")
        .select(
          "id, title, subtitle, body_text, body_json, correction_note, sponsorship_label",
        )
        .in("id", revisionIds),
      supabase
        .from("content_revision_authors")
        .select("content_revision_id, author_id, byline_order")
        .in("content_revision_id", revisionIds)
        .order("byline_order"),
      supabase
        .from("content_revision_categories")
        .select("content_revision_id, category_id")
        .in("content_revision_id", revisionIds)
        .eq("is_primary", true),
    ]);

  if (
    revisionResult.error ||
    authorLinkResult.error ||
    categoryLinkResult.error
  ) {
    throw new Error("Falha ao montar o conteúdo público.", {
      cause:
        revisionResult.error ??
        authorLinkResult.error ??
        categoryLinkResult.error,
    });
  }

  const authorIds = [...new Set(authorLinkResult.data.map((row) => row.author_id))];
  const categoryIds = [
    ...new Set([
      ...categoryLinkResult.data.map((row) => row.category_id),
      ...distributions.flatMap((row) =>
        row.category_override_id ? [row.category_override_id] : [],
      ),
    ]),
  ];
  const [authorResult, categoryResult] = await Promise.all([
    supabase.from("authors").select("id, display_name").in("id", authorIds),
    supabase.from("categories").select("id, name, slug").in("id", categoryIds),
  ]);

  if (authorResult.error || categoryResult.error) {
    throw new Error("Falha ao carregar a classificação pública.", {
      cause: authorResult.error ?? categoryResult.error,
    });
  }

  const revisions = new Map(revisionResult.data.map((row) => [row.id, row]));
  const authors = new Map(authorResult.data.map((row) => [row.id, row]));
  const categories = new Map(categoryResult.data.map((row) => [row.id, row]));
  const authorLinks = new Map(
    authorLinkResult.data.map((row) => [row.content_revision_id, row.author_id]),
  );
  const categoryLinks = new Map(
    categoryLinkResult.data.map((row) => [
      row.content_revision_id,
      row.category_id,
    ]),
  );
  const distributionMap = new Map(
    distributions.map((row) => [row.content_item_id, row]),
  );

  return items.flatMap((item) => {
    const revisionId = item.current_published_revision_id;
    const revision = revisionId ? revisions.get(revisionId) : null;
    const distribution = distributionMap.get(item.id);
    if (!revision || !distribution) return [];
    const categoryId =
      distribution.category_override_id ?? categoryLinks.get(revision.id);
    const category = categoryId ? categories.get(categoryId) : null;
    const authorId = authorLinks.get(revision.id);
    const author = authorId ? authors.get(authorId) : null;
    const categorySlug = category?.slug ?? "destaques";
    const media = resolveEditorialMedia(
      readMedia(revision.body_json),
      categorySlug,
    );
    const origin = readEditorialOrigin(revision.body_json);

    const bodyBlocks = readPublicStoryBodyBlocks(
      revision.body_json,
      revision.body_text,
    );

    return [
      {
        author: author?.display_name ?? "Redação demonstrativa",
        body: readBody(revision.body_json, revision.body_text),
        bodyBlocks,
        canonicalSlug: distribution.slug_override ?? item.canonical_slug,
        categoryName: getPublicCategoryName(categorySlug, category?.name),
        categorySlug,
        correctionNote: revision.correction_note,
        editorialOrder: origin.editorialOrder,
        externalOnly: origin.externalOnly,
        id: item.id,
        ...media,
        isRealContent: origin.isRealContent,
        publishedAt: origin.isRealContent
          ? origin.sourcePublishedAt
          : item.last_published_at,
        sourceLabel: origin.sourceLabel,
        sourceUrl: origin.sourceUrl,
        sponsorshipLabel: revision.sponsorship_label,
        subtitle: distribution.subtitle_override ?? revision.subtitle,
        title: distribution.headline_override ?? revision.title,
      },
    ];
  });
}

export async function listHomePlacementIds(tenantIdInput: string) {
  const tenantId = toTenantId(tenantIdInput);
  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("placements")
    .select(
      "content_item_id, slot_key, rank, eyebrow_override, presentation_variant",
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("slot_key")
    .order("rank");

  if (error) throw new Error("Falha ao carregar a curadoria pública.", { cause: error });
  return data;
}
