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
  getPublicCategoryName,
  readEditorialOrigin,
  resolveDefaultPublicTenant,
} from "./portal-repository";

describe("identidade pública de tenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["banco-demo-horizonte", "Banco Demo Horizonte"],
    ["seguros-demo-atlas", "Seguros Demo Atlas"],
    ["abrafarma", "Abrafarma"],
    ["broadcast-saude", "Broadcast Saúde"],
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

  it("mantém as cinco marcas explícitas no fallback seguro", () => {
    const themes = [
      getDemoTenantThemeFallback("banco-demo-horizonte"),
      getDemoTenantThemeFallback("seguros-demo-atlas"),
      getDemoTenantThemeFallback("abrafarma"),
      getDemoTenantThemeFallback("broadcast-saude"),
      getDemoTenantThemeFallback("credito-demo-orbita"),
    ];

    expect(new Set(themes.map((theme) => theme?.primary)).size).toBe(5);
    expect(new Set(themes.map((theme) => theme?.siteModel)).size).toBe(4);
  });

  it("normaliza o rótulo público da editoria ti sem alterar o slug", () => {
    expect(getPublicCategoryName("ti", "TI")).toBe(
      "Tecnologia e Inovação",
    );
    expect(getPublicCategoryName("pesquisa", "Pesquisa")).toBe("Pesquisa");
  });

  it("lê somente procedência real autorizada e URL HTTPS", () => {
    expect(
      readEditorialOrigin({
        editorial_origin: {
          briefing_order: 4,
          external_only: true,
          kind: "authorized-real",
          source_label: "Viva",
          source_published_at: "2026-07-02T13:30:00.000Z",
          source_url: "https://viva.com.br/pauta",
        },
      }),
    ).toMatchObject({
      editorialOrder: 4,
      externalOnly: true,
      isRealContent: true,
      sourceLabel: "Viva",
      sourceUrl: "https://viva.com.br/pauta",
    });

    expect(
      readEditorialOrigin({
        editorial_origin: {
          kind: "authorized-real",
          source_url: "javascript:alert(1)",
        },
      }).sourceUrl,
    ).toBeNull();
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
      display_name: "Abrafarma",
      id: "00000000-0000-4000-8000-000000000004",
      slug: "abrafarma",
    });
    mocks.createServerSupabaseClient
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue(settingChain),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue(tenantChain),
      });

    await expect(resolveDefaultPublicTenant()).resolves.toMatchObject({
      displayName: "Abrafarma",
      id: "00000000-0000-4000-8000-000000000004",
      slug: "abrafarma",
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
