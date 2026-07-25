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

export function parseEditorialForm(formData: FormData) {
  const title = readText(formData, "title", "Título", 5, 180);
  const subtitle = readText(formData, "subtitle", "Linha fina", 10, 280);
  const body = readText(formData, "body", "Corpo", 80, 20_000);
  const imageModeValue = formData.get("imageMode");
  const imageMode: "fallback" | "none" | null =
    imageModeValue === "fallback" || imageModeValue === "none"
      ? (imageModeValue as "fallback" | "none")
      : null;
  const slug = slugifyTitle(title);

  if (!imageMode) {
    throw new ContentFormError("Selecione uma opção de imagem principal.");
  }

  if (slug.length < 3) {
    throw new ContentFormError(
      "O título precisa gerar uma URL editorial válida.",
    );
  }

  return {
    authorId: readUuid(formData, "authorId", "Autor"),
    body,
    categoryId: readUuid(formData, "categoryId", "Editoria"),
    imageAlt:
      imageMode === "fallback"
        ? readText(
            formData,
            "imageAlt",
            "Texto alternativo da imagem",
            12,
            220,
          )
        : "",
    imageMode,
    slug,
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
