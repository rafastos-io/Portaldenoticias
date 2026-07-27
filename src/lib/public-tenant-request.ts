export type PublicTenantRequest =
  | { kind: "default" }
  | { kind: "explicit"; slug: string }
  | { kind: "invalid" };

export function parsePublicTenantRequest(
  value: string | string[] | undefined,
): PublicTenantRequest {
  if (value === undefined) return { kind: "default" };
  if (typeof value !== "string" || value.length === 0) {
    return { kind: "invalid" };
  }
  return { kind: "explicit", slug: value };
}
