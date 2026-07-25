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
    primary,
    secondary: storedColor(tokens.secondary),
    slogan: storedText(brand.slogan, 2, 160),
    textColor,
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
