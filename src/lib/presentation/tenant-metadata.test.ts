import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./public-page-data", () => ({}));

import { tenantInitials } from "./tenant-metadata";

describe("tenantInitials", () => {
  it.each([
    ["FinanciaCar", "FC"],
    ["BV Educação", "BV"],
    ["Banco Demo Horizonte", "BH"],
    ["Crédito Demo Órbita", "CÓ"],
    ["Seguros Demo Atlas", "SA"],
    ["Broadcast Saúde & Longevidade", "BS"],
    ["Abrafarma", "A"],
  ])("%s → %s", (brandName, expected) => {
    expect(tenantInitials(brandName)).toBe(expected);
  });
});
