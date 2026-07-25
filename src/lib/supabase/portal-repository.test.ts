import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

import {
  getDemoTenantIdentity,
  getDemoTenantThemeFallback,
} from "./portal-repository";

describe("identidade pública de tenant", () => {
  it.each([
    ["banco-demo-horizonte", "Banco Demo Horizonte"],
    ["seguros-demo-atlas", "Seguros Demo Atlas"],
    ["healthtech-demo-lumen", "Healthtech Demo Lúmen"],
  ])("resolve %s sem fallback entre clientes", (slug, displayName) => {
    expect(getDemoTenantIdentity(slug)).toMatchObject({
      displayName,
      slug,
    });
  });

  it("recusa slug desconhecido", () => {
    expect(getDemoTenantIdentity("tenant-inexistente")).toBeNull();
    expect(getDemoTenantThemeFallback("tenant-inexistente")).toBeNull();
  });

  it("mantém os três temas visualmente distintos no fallback seguro", () => {
    const themes = [
      getDemoTenantThemeFallback("banco-demo-horizonte"),
      getDemoTenantThemeFallback("seguros-demo-atlas"),
      getDemoTenantThemeFallback("healthtech-demo-lumen"),
    ];

    expect(new Set(themes.map((theme) => theme?.primary)).size).toBe(3);
    expect(new Set(themes.map((theme) => theme?.font)).size).toBe(3);
    expect(new Set(themes.map((theme) => theme?.header)).size).toBe(3);
    expect(new Set(themes.map((theme) => theme?.hero)).size).toBe(3);
    expect(new Set(themes.map((theme) => theme?.card)).size).toBe(3);
  });
});
