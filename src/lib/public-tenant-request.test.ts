import { describe, expect, it } from "vitest";

import { parsePublicTenantRequest } from "./public-tenant-request";

describe("public home tenant request", () => {
  it("uses the persisted default only when tenant is absent", () => {
    expect(parsePublicTenantRequest(undefined)).toEqual({ kind: "default" });
  });

  it("preserves an explicit preview slug", () => {
    expect(parsePublicTenantRequest("seguros-demo-atlas")).toEqual({
      kind: "explicit",
      slug: "seguros-demo-atlas",
    });
  });

  it("fails closed for empty or duplicated tenant parameters", () => {
    expect(parsePublicTenantRequest("")).toEqual({ kind: "invalid" });
    expect(
      parsePublicTenantRequest([
        "banco-demo-horizonte",
        "seguros-demo-atlas",
      ]),
    ).toEqual({ kind: "invalid" });
  });
});
