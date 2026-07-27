import { describe, expect, it } from "vitest";

import {
  getSiteModelDefinition,
  parseSiteModel,
  resolveLegacySiteModel,
  SITE_MODEL_IDS,
} from "./site-models";

describe("site model registry", () => {
  it("accepts only the four approved identifiers", () => {
    for (const id of SITE_MODEL_IDS) {
      expect(parseSiteModel(id)).toBe(id);
      expect(getSiteModelDefinition(id).id).toBe(id);
    }
    expect(parseSiteModel("bank-blue")).toBeNull();
    expect(parseSiteModel(null)).toBeNull();
  });

  it("maps only the three known legacy tenants", () => {
    expect(
      resolveLegacySiteModel("00000000-0000-4000-8000-000000000002"),
    ).toBe("investments-asset-management");
    expect(
      resolveLegacySiteModel("00000000-0000-4000-8000-000000000003"),
    ).toBe("insurance-pension");
    expect(
      resolveLegacySiteModel("00000000-0000-4000-8000-000000000004"),
    ).toBe("health-pharma");
    expect(
      resolveLegacySiteModel("00000000-0000-4000-8000-000000000099"),
    ).toBeNull();
  });
});
