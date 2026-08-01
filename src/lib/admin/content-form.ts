const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ContentFormError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentFormError";
  }
}

function readText(
  formData: FormData,
  field: string,
  label: string,
  minimum: number,
  maximum: number,
) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";

  if (text.length < minimum || text.length > maximum) {
    throw new ContentFormError(
      `${label} deve ter entre ${minimum} e ${maximum} caracteres.`,
    );
  }

  return text;
}

export function readUuid(formData: FormData, field: string, label: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!UUID_PATTERN.test(text)) {
    throw new ContentFormError(`${label} inválido.`);
  }

  return text;
}

export function slugifyTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140)
    .replace(/-+$/g, "");
}

export const EDITORIAL_TYPES = [
  "standard",
  "explainer",
  "sponsored",
  "correction",
] as const;
export type EditorialType = (typeof EDITORIAL_TYPES)[number];

// Texto alternativo padrão para a imagem editorial. O CMS demonstrativo exige
// um alt entre 12 e 220 caracteres quando há imagem; usamos este valor quando
// a pessoa não informa nada, para que o cadastro nunca falhe por causa disso.
const DEFAULT_IMAGE_ALT = "Composição editorial ilustrativa e fictícia.";

export function parseEditorialForm(formData: FormData) {
  const title = readText(formData, "title", "Título", 5, 180);
  const subtitle = readText(formData, "subtitle", "Linha fina", 10, 280);
  const body = readText(formData, "body", "Corpo", 80, 20_000);
  const slug = slugifyTitle(title);
  const authorNameValue = formData.get("authorName");
  const authorName =
    typeof authorNameValue === "string" ? authorNameValue.trim() : "";

  if (authorName.length < 2 || authorName.length > 120) {
    throw new ContentFormError(
      "O nome da autoria deve ter entre 2 e 120 caracteres.",
    );
  }

  if (slug.length < 3) {
    throw new ContentFormError(
      "O título precisa gerar uma URL editorial válida.",
    );
  }

  // Imagem: só existem dois modos. Qualquer valor diferente de "none" cai em
  // "fallback" (asset editorial), evitando o antigo erro de "selecione a
  // imagem". O texto alternativo é preenchido automaticamente quando vazio.
  const imageMode: "fallback" | "none" =
    formData.get("imageMode") === "none" ? "none" : "fallback";

  let imageAlt = "";
  if (imageMode === "fallback") {
    const altValue = formData.get("imageAlt");
    const alt = typeof altValue === "string" ? altValue.trim() : "";
    imageAlt = alt.length >= 12 && alt.length <= 220 ? alt : DEFAULT_IMAGE_ALT;
  }

  return {
    authorName,
    body,
    categoryId: readUuid(formData, "categoryId", "Editoria"),
    correctionNote: null,
    editorialType: "standard" as EditorialType,
    imageAlt,
    imageMode,
    keyTopics: [] as string[],
    slug,
    sponsorshipLabel: null,
    subtitle,
    tenantId: readUuid(formData, "tenantId", "Tenant"),
    title,
  };
}

export function parseStatusForm(
  formData: FormData,
  status: "published" | "paused",
) {
  const reasonValue = formData.get("reason");
  const reason = typeof reasonValue === "string" ? reasonValue.trim() : "";

  if (status === "paused") {
    if (formData.get("confirmPause") !== "yes") {
      throw new ContentFormError("Confirme a pausa antes de continuar.");
    }
    if (reason.length < 8 || reason.length > 500) {
      throw new ContentFormError(
        "O motivo da pausa deve ter entre 8 e 500 caracteres.",
      );
    }
  }

  return {
    contentId: readUuid(formData, "contentId", "Matéria"),
    reason,
    status,
    tenantId: readUuid(formData, "tenantId", "Tenant"),
  };
}
