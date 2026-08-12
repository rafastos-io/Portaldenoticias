const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class DemoApiQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoApiQueryError";
  }
}

function slug(
  value: string | null,
  label: string,
  required: boolean,
): string | null {
  const parsed = value?.trim().toLowerCase() ?? "";
  if (!parsed && !required) return null;
  if (!parsed || parsed.length > 100 || !SLUG.test(parsed)) {
    throw new DemoApiQueryError(`${label} inválido.`);
  }
  return parsed;
}

export function parseDemoApiQuery(searchParams: URLSearchParams) {
  const status = searchParams.get("status")?.trim().toLowerCase() || "published";
  if (status !== "published") {
    throw new DemoApiQueryError(
      "A demonstração expõe somente conteúdo com status published.",
    );
  }

  return {
    categorySlug: slug(searchParams.get("editoria"), "Editoria", false),
    status: "published" as const,
    tenantSlug: slug(searchParams.get("tenant"), "Tenant", true)!,
  };
}
