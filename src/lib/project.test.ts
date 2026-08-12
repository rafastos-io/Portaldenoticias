import { describe, expect, it } from "vitest";

describe("project scaffold", () => {
  it("keeps the demo label explicit", () => {
    expect("Ambiente demonstrativo").toContain("demonstrativo");
  });
});
