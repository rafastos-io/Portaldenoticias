import { ContentFormError, readUuid } from "./content-form";

export const APPROVED_FONTS = [
  "sans-editorial",
  "sans-humana",
  "sans-geometrica",
] as const;
export const APPROVED_HEADERS = [
  "masthead-clean",
  "brand-centered",
  "masthead-minimal",
] as const;
export const APPROVED_HEROES = [
  "split-editorial",
  "featured-grid",
  "science-feature",
] as const;
export const APPROVED_CARDS = [
  "image-top",
  "compact-horizontal",
  "data-led",
] as const;

const HEX = /^#[0-9a-f]{6}$/i;

export type ThemeValues = {
  accent: string;
  background: string;
  brandName: string;
  card: (typeof APPROVED_CARDS)[number];
  font: (typeof APPROVED_FONTS)[number];
  header: (typeof APPROVED_HEADERS)[number];
  hero: (typeof APPROVED_HEROES)[number];
  logoAlt: string;
  logoUrl: string | null;
  primary: string;
  secondary: string;
  slogan: string;
  textColor: string;
};

function text(formData: FormData, field: string, label: string, max: number) {
  const value = formData.get(field);
  const parsed = typeof value === "string" ? value.trim() : "";
  if (parsed.length < 2 || parsed.length > max) {
    throw new ContentFormError(`${label} deve ter entre 2 e ${max} caracteres.`);
  }
  return parsed;
}

function color(formData: FormData, field: string) {
  const value = formData.get(field);
  const parsed = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!HEX.test(parsed)) throw new ContentFormError("Cor hexadecimal inválida.");
  return parsed;
}

function option<T extends readonly string[]>(
  formData: FormData,
  field: string,
  allowed: T,
) {
  const value = formData.get(field);
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new ContentFormError("Variante visual não aprovada.");
  }
  return value as T[number];
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function contrastRatio(foreground: string, background: string) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContentFormError("Identidade persistida inválida.");
  }
  return value as Record<string, unknown>;
}

function storedText(
  value: unknown,
  minimum: number,
  maximum: number,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length < minimum ||
    value.trim().length > maximum
  ) {
    throw new ContentFormError("Identidade persistida inválida.");
  }
  return value.trim();
}

function storedColor(value: unknown): string {
  if (typeof value !== "string" || !HEX.test(value)) {
    throw new ContentFormError("Identidade persistida inválida.");
  }
  return value.toUpperCase();
}

function storedOption<T extends readonly string[]>(
  value: unknown,
  allowed: T,
): T[number] {
  if (typeof value !== "string" || !allowed.some((item) => item === value)) {
    throw new ContentFormError("Identidade persistida inválida.");
  }
  return value as T[number];
}

export function parseStoredTheme(input: {
  brand: unknown;
  components: unknown;
  tokens: unknown;
}): ThemeValues {
  const tokens = record(input.tokens);
  const components = record(input.components);
  const brand = record(input.brand);
  const primary = storedColor(tokens.primary);
  const background = storedColor(tokens.background);
  const textColor = storedColor(tokens.text);

  if (
    contrastRatio(primary, "#FFFFFF") < 4.5 ||
    contrastRatio(primary, background) < 4.5 ||
    contrastRatio(textColor, background) < 4.5
  ) {
    throw new ContentFormError("Identidade persistida inválida.");
  }

  return {
    accent: storedColor(tokens.accent),
    background,
    brandName: storedText(brand.display_name, 2, 120),
    card: storedOption(components.card, APPROVED_CARDS),
    font: storedOption(tokens.font, APPROVED_FONTS),
    header: storedOption(components.header, APPROVED_HEADERS),
    hero: storedOption(components.hero, APPROVED_HEROES),
    logoAlt:
      typeof brand.logo_alt === "string" ? brand.logo_alt.trim().slice(0, 180) : "",
    logoUrl: null,
    primary,
    secondary: storedColor(tokens.secondary),
    slogan: storedText(brand.slogan, 2, 160),
    textColor,
  };
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseCreateIdentityForm(formData: FormData) {
  const slugValue = formData.get("slug");
  const slug = typeof slugValue === "string" ? slugValue.trim() : "";
  if (!SLUG.test(slug) || slug.length > 80) {
    throw new ContentFormError(
      "Slug inválido. Use letras minúsculas, números e hífens.",
    );
  }

  return {
    brandName: text(formData, "brandName", "Nome da marca", 120),
    presetTenantId: readUuid(formData, "tenantId", "Preset"),
    slug,
    slogan: text(formData, "slogan", "Slogan", 160),
  };
}

function readJpegDimensions(bytes: Uint8Array) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1]!;
    const blockLength = (bytes[offset + 2]! << 8) + bytes[offset + 3]!;
    if (
      [
        0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
        0xce, 0xcf,
      ].includes(marker)
    ) {
      return {
        height: (bytes[offset + 5]! << 8) + bytes[offset + 6]!,
        width: (bytes[offset + 7]! << 8) + bytes[offset + 8]!,
      };
    }
    if (blockLength < 2) return null;
    offset += 2 + blockLength;
  }
  return null;
}

export async function parseLogoUploadForm(formData: FormData) {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    throw new ContentFormError("Selecione um arquivo de logo.");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new ContentFormError("O logo deve ter no máximo 2 MB.");
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const png =
    buffer.length >= 24 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => buffer[index] === value,
    );
  const jpeg =
    buffer.length >= 10 && buffer[0] === 0xff && buffer[1] === 0xd8;

  let dimensions: { height: number; width: number } | null = null;
  let contentType: "image/jpeg" | "image/png";
  let extension: "jpg" | "png";
  if (png) {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );
    dimensions = {
      height: view.getUint32(20),
      width: view.getUint32(16),
    };
    contentType = "image/png";
    extension = "png";
  } else if (jpeg) {
    dimensions = readJpegDimensions(buffer);
    contentType = "image/jpeg";
    extension = "jpg";
  } else {
    throw new ContentFormError("Envie um logo PNG ou JPEG válido.");
  }

  if (
    !dimensions ||
    dimensions.width < 96 ||
    dimensions.height < 48 ||
    dimensions.width > 2400 ||
    dimensions.height > 2400 ||
    dimensions.width / dimensions.height > 8
  ) {
    throw new ContentFormError(
      "O logo deve ter entre 96 × 48 e 2400 × 2400 px, sem proporção extrema.",
    );
  }

  return {
    altText: text(formData, "logoAlt", "Texto alternativo", 180),
    body: buffer,
    contentType,
    credit: text(formData, "logoCredit", "Crédito", 160),
    extension,
    height: dimensions.height,
    tenantId: readUuid(formData, "tenantId", "Tenant"),
    width: dimensions.width,
  };
}

export function parseThemeForm(formData: FormData) {
  const primary = color(formData, "primary");
  const background = color(formData, "background");
  const textColor = color(formData, "textColor");

  if (contrastRatio(primary, "#FFFFFF") < 4.5) {
    throw new ContentFormError(
      "A cor primária precisa ter contraste 4,5:1 com texto branco.",
    );
  }
  if (contrastRatio(primary, background) < 4.5) {
    throw new ContentFormError(
      "A cor primária precisa ter contraste 4,5:1 com o fundo.",
    );
  }
  if (contrastRatio(textColor, background) < 4.5) {
    throw new ContentFormError(
      "Texto e fundo precisam ter contraste mínimo de 4,5:1.",
    );
  }

  return {
    accent: color(formData, "accent"),
    background,
    brandName: text(formData, "brandName", "Nome da marca", 120),
    card: option(formData, "card", APPROVED_CARDS),
    font: option(formData, "font", APPROVED_FONTS),
    header: option(formData, "header", APPROVED_HEADERS),
    hero: option(formData, "hero", APPROVED_HEROES),
    primary,
    secondary: color(formData, "secondary"),
    slogan: text(formData, "slogan", "Slogan", 160),
    tenantId: readUuid(formData, "tenantId", "Tenant"),
    textColor,
  };
}
