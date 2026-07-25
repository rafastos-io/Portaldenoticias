import "server-only";

import { parseStoredTheme } from "@/lib/admin/theme-form";

import { createServerSupabaseClient } from "./server";
import { toTenantId } from "./tenant-scope";

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
  return {
    id: version.id,
    ...parseStoredTheme({
      brand: version.brand_json,
      components: version.components_json,
      tokens: version.tokens_json,
    }),
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
  slogan: string;
  tenantId: string;
  textColor: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cms_save_theme", {
    p_accent: input.accent,
    p_background: input.background,
    p_brand_name: input.brandName,
    p_card: input.card,
    p_font: input.font,
    p_header: input.header,
    p_hero: input.hero,
    p_primary: input.primary,
    p_secondary: input.secondary,
    p_slogan: input.slogan,
    p_tenant_id: toTenantId(input.tenantId),
    p_text_color: input.textColor,
  });
  if (error) throw new Error("Falha ao salvar a identidade.", { cause: error });
  return data;
}
