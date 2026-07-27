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
  canonicalSlug: string;
  categoryName: string;
  categorySlug: string;
  correctionNote: string | null;
  id: string;
  imageAlt: string | null;
  imagePath: string | null;
  publishedAt: string | null;
  sponsorshipLabel: string | null;
  subtitle: string;
  title: string;
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
  "healthtech-demo-lumen": {
    displayName: "Healthtech Demo Lúmen",
    id: "00000000-0000-4000-8000-000000000004",
    slug: "healthtech-demo-lumen",
    slogan: "Ciência para ampliar futuros",
  },
  "credito-demo-orbita": {
    displayName: "Crédito Demo Órbita",
    id: "00000000-0000-4000-8000-000000000005",
    slug: "credito-demo-orbita",
    slogan: "Clareza para decidir o próximo passo",
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
  "healthtech-demo-lumen": {
    accent: "#8ED1C9",
    background: "#F6F5FA",
    brandName: "Healthtech Demo Lúmen",
    card: "data-led",
    font: "sans-geometrica",
    header: "masthead-minimal",
    hero: "science-feature",
    logoAlt: "",
    logoUrl: null,
    primary: "#4A2E78",
    secondary: "#20A4B8",
    siteModel: "health-pharma",
    slogan: "Ciência para ampliar futuros",
    textColor: "#222033",
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
};

export function getDemoTenantIdentity(slug: string) {
  return DEMO_TENANTS[slug] ?? null;
}

export function getDemoTenantThemeFallback(slug: string) {
  return DEMO_THEME_FALLBACKS[slug] ?? null;
}

function readBody(bodyJson: Json, bodyText: string) {
  if (
    typeof bodyJson === "object" &&
    bodyJson !== null &&
    !Array.isArray(bodyJson) &&
    Array.isArray(bodyJson.content)
  ) {
    const paragraphs = bodyJson.content.flatMap((node) =>
      typeof node === "object" &&
      node !== null &&
      !Array.isArray(node) &&
      node.type === "paragraph" &&
      typeof node.text === "string"
        ? [node.text]
        : [],
    );
    if (paragraphs.length > 0) return paragraphs;
  }

  return bodyText.split(/\n\s*\n/).filter(Boolean);
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
    .eq("workflow_status", "published");

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

    return [
      {
        author: author?.display_name ?? "Redação demonstrativa",
        body: readBody(revision.body_json, revision.body_text),
        canonicalSlug: distribution.slug_override ?? item.canonical_slug,
        categoryName: category?.name ?? "Destaques",
        categorySlug,
        correctionNote: revision.correction_note,
        id: item.id,
        ...media,
        publishedAt: item.last_published_at,
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
