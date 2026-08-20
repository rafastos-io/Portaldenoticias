import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { parseStoredTheme } from "@/lib/admin/theme-form";
import { resolveLegacySiteModel } from "@/lib/presentation/site-models";

import { createServerSupabaseClient } from "./server";
import { createTenantMediaSignedUrl, uploadTenantMedia } from "./storage";
import { toTenantId } from "./tenant-scope";

function logoAssetId(brand: unknown) {
  if (typeof brand !== "object" || brand === null || Array.isArray(brand)) {
    return null;
  }
  const value = (brand as Record<string, unknown>).logo_asset_id;
  return typeof value === "string" ? value : null;
}

export async function getTenantTheme(tenantIdInput: string) {
  const tenantId = toTenantId(tenantIdInput);
  const supabase = createServerSupabaseClient();
  const { data: theme, error: themeError } = await supabase
    .from("themes")
    .select("id, name, published_version_id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (themeError) throw new Error("Falha ao consultar a identidade.", { cause: themeError });
  if (!theme?.published_version_id) return null;
  const { data: version, error: versionError } = await supabase
    .from("theme_versions")
    .select("id, tokens_json, components_json, brand_json")
    .eq("theme_id", theme.id)
    .eq("id", theme.published_version_id)
    .maybeSingle();

  if (versionError) throw new Error("Falha ao carregar os tokens.", { cause: versionError });
  if (!version) return null;
  const parsed = parseStoredTheme({
    brand: version.brand_json,
    components: version.components_json,
    legacySiteModel: resolveLegacySiteModel(tenantId),
    tokens: version.tokens_json,
  });
  const assetId = logoAssetId(version.brand_json);
  if (!assetId) {
    return {
      id: version.id,
      ...parsed,
    };
  }

  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .select("id, storage_key, alt_text")
    .eq("id", assetId)
    .eq("owner_tenant_id", tenantId)
    .eq("status", "ready")
    .maybeSingle();
  if (assetError) {
    throw new Error("Falha ao carregar o logo da identidade.", {
      cause: assetError,
    });
  }
  const signed = asset
    ? await createTenantMediaSignedUrl({
        expiresIn: 3600,
        storageKey: asset.storage_key,
        tenantId,
      })
    : null;

  return {
    id: version.id,
    ...parsed,
    logoAlt: asset?.alt_text ?? parsed.logoAlt,
    logoUrl: signed?.signedUrl ?? null,
  };
}

export const getAdminTheme = getTenantTheme;

export async function saveAdminTheme(input: {
  accent: string;
  background: string;
  brandName: string;
  card: string;
  font: string;
  header: string;
  hero: string;
  primary: string;
  secondary: string;
  siteModel: string;
  slogan: string;
  tenantId: string;
  textColor: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cms_save_theme_v2", {
    p_accent: input.accent,
    p_background: input.background,
    p_brand_name: input.brandName,
    p_card: input.card,
    p_font: input.font,
    p_header: input.header,
    p_hero: input.hero,
    p_primary: input.primary,
    p_secondary: input.secondary,
    p_site_model: input.siteModel,
    p_slogan: input.slogan,
    p_tenant_id: toTenantId(input.tenantId),
    p_text_color: input.textColor,
  });
  if (error) throw new Error("Falha ao salvar a identidade.", { cause: error });
  return data;
}

export async function createDemoTenantFromPreset(input: {
  brandName: string;
  presetTenantId: string;
  slug: string;
  siteModel: string;
  slogan: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cms_create_demo_tenant_v2", {
    p_display_name: input.brandName,
    p_slug: input.slug,
    p_site_model: input.siteModel,
    p_slogan: input.slogan,
    p_source_tenant_id: toTenantId(input.presetTenantId),
  });
  if (error) {
    throw new Error("Falha ao criar a nova identidade.", { cause: error });
  }
  return data;
}

export async function uploadAdminThemeLogo(input: {
  altText: string;
  body: Uint8Array;
  contentType: "image/jpeg" | "image/png";
  credit: string;
  extension: "jpg" | "png";
  height: number;
  rightsBasis: "authorized-brand-validation" | "demo-original";
  tenantId: string;
  width: number;
}) {
  const tenantId = toTenantId(input.tenantId);
  const fileName = `logo-${randomUUID()}.${input.extension}`;
  const uploaded = await uploadTenantMedia({
    body: input.body,
    contentType: input.contentType,
    fileName,
    tenantId,
  });
  const storageKey = uploaded.path;
  const supabase = createServerSupabaseClient();
  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      alt_text: input.altText,
      credit: input.credit,
      height: input.height,
      mime_type: input.contentType,
      owner_tenant_id: tenantId,
      rights_basis: input.rightsBasis,
      sha256: createHash("sha256").update(input.body).digest("hex"),
      size_bytes: input.body.byteLength,
      status: "ready",
      storage_key: storageKey,
      width: input.width,
    })
    .select("id")
    .single();

  if (assetError || !asset) {
    await supabase.storage.from("demo-media").remove([storageKey]);
    throw new Error("Falha ao registrar o logo do tenant.", {
      cause: assetError,
    });
  }

  const { error: themeError } = await supabase.rpc("cms_set_theme_logo", {
    p_media_asset_id: asset.id,
    p_tenant_id: tenantId,
  });
  if (themeError) {
    await supabase.from("media_assets").delete().eq("id", asset.id);
    await supabase.storage.from("demo-media").remove([storageKey]);
    throw new Error("Falha ao associar o logo à identidade.", {
      cause: themeError,
    });
  }

  return asset.id;
}
