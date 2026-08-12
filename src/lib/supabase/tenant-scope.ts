// PostgreSQL's uuid type accepts the canonical 8-4-4-4-12 representation
// independently of the RFC version and variant bits. Some seeded entities use
// deterministic UUID values, so restricting those bits rejects IDs that are
// already valid and persisted in the database.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

declare const tenantIdBrand: unique symbol;

export type TenantId = string & { readonly [tenantIdBrand]: true };

function assertUuid(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${label} deve ser um UUID válido.`);
  }

  return value.toLowerCase();
}

export function toTenantId(value: string): TenantId {
  return assertUuid(value, "tenant_id") as TenantId;
}

export function toEntityId(value: string): string {
  return assertUuid(value, "id");
}

export function tenantStorageKey(
  tenantIdInput: string,
  fileNameInput: string,
): string {
  const tenantId = toTenantId(tenantIdInput);
  const fileName = fileNameInput.trim();

  if (
    fileName.length === 0 ||
    fileName === "." ||
    fileName === ".." ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(fileName)
  ) {
    throw new Error("Nome de arquivo inválido para o Storage.");
  }

  return `${tenantId}/${fileName}`;
}

export function assertTenantStorageKey(
  tenantIdInput: string,
  storageKey: string,
): string {
  const tenantId = toTenantId(tenantIdInput);
  const [pathTenant, ...pathParts] = storageKey.split("/");

  if (
    pathTenant !== tenantId ||
    pathParts.length === 0 ||
    pathParts.some((part) => part.length === 0 || part === "." || part === "..")
  ) {
    throw new Error("Objeto do Storage não pertence ao tenant solicitado.");
  }

  return storageKey;
}
