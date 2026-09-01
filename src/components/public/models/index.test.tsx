import { describe, expect, it } from "vitest";

import {
  SITE_MODELS,
  SITE_MODEL_IDS,
} from "@/lib/presentation/site-models";

import {
  getSiteModelRegistration,
  SITE_MODEL_REGISTRY,
} from "./index";

describe("site model component registry", () => {
  it("associates every approved ID with one definition and all route renderers", () => {
    expect(Object.keys(SITE_MODEL_REGISTRY).sort()).toEqual(
      [...SITE_MODEL_IDS].sort(),
    );

    for (const id of SITE_MODEL_IDS) {
      const registration = getSiteModelRegistration(id);
      expect(registration).not.toBeNull();
      expect(registration?.definition).toBe(SITE_MODELS[id]);
      expect(registration?.definition.id).toBe(id);
      expect(registration?.Home).toBeTypeOf("function");
      expect(registration?.Category).toBeTypeOf("function");
      expect(registration?.Article).toBeTypeOf("function");
    }
  });

  it("fails closed for an unknown or missing model", () => {
    expect(getSiteModelRegistration("bank-blue")).toBeNull();
    expect(getSiteModelRegistration(null)).toBeNull();
  });
});
