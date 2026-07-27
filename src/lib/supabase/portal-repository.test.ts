import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import {
  getDemoTenantIdentity,
  getDemoTenantThemeFallback,
  resolveDefaultPublicTenant,
} from "./portal-repository";

describe("identidade pública de tenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["banco-demo-horizonte", "Banco Demo Horizonte"],
    ["seguros-demo-atlas", "Seguros Demo Atlas"],
    ["healthtech-demo-lumen", "Healthtech Demo Lúmen"],
    ["credito-demo-orbita", "Crédito Demo Órbita"],
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

  it("mantém os quatro modelos explícitos no fallback seguro", () => {
    const themes = [
      getDemoTenantThemeFallback("banco-demo-horizonte"),
      getDemoTenantThemeFallback("seguros-demo-atlas"),
      getDemoTenantThemeFallback("healthtech-demo-lumen"),
      getDemoTenantThemeFallback("credito-demo-orbita"),
    ];

    expect(new Set(themes.map((theme) => theme?.primary)).size).toBe(4);
    expect(new Set(themes.map((theme) => theme?.siteModel)).size).toBe(4);
  });

  it("resolves the persisted public default through a validated demo tenant", async () => {
    const query = (data: unknown) => {
      const chain = {
        eq: vi.fn(),
        maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
        select: vi.fn(),
      };
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      return chain;
    };
    const settingChain = query({
      default_tenant_id: "00000000-0000-4000-8000-000000000004",
      revision: 2,
    });
    const tenantChain = query({
      display_name: "Healthtech Demo Lúmen",
      id: "00000000-0000-4000-8000-000000000004",
      slug: "healthtech-demo-lumen",
    });
    mocks.createServerSupabaseClient
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue(settingChain),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue(tenantChain),
      });

    await expect(resolveDefaultPublicTenant()).resolves.toMatchObject({
      displayName: "Healthtech Demo Lúmen",
      id: "00000000-0000-4000-8000-000000000004",
      slug: "healthtech-demo-lumen",
    });
    expect(tenantChain.eq).toHaveBeenCalledWith("kind", "demo");
    expect(tenantChain.eq).toHaveBeenCalledWith("status", "demo");
    expect(tenantChain.eq).toHaveBeenCalledWith("is_demo", true);
  });

  it("fails closed when the singleton is absent", async () => {
    const chain = {
      eq: vi.fn(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: null, error: null }),
      select: vi.fn(),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn().mockReturnValue(chain),
    });

    await expect(resolveDefaultPublicTenant()).resolves.toBeNull();
    expect(mocks.createServerSupabaseClient).toHaveBeenCalledTimes(1);
  });
});
