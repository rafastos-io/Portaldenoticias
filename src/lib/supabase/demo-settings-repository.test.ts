import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./server", () => ({
  createServerSupabaseClient: vi.fn(() => ({
    from: mocks.from,
    rpc: mocks.rpc,
  })),
}));

import {
  DefaultDemoPortalConflictError,
  getDefaultDemoPortalSetting,
  setDefaultDemoPortal,
} from "./demo-settings-repository";

const TENANT_ID = "00000000-0000-4000-8000-000000000002";

function settingQuery(result: {
  data: { default_tenant_id: string; revision: number } | null;
  error: null;
}) {
  const chain = {
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    select: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  return chain;
}

describe("default demo portal repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads only the demo singleton", async () => {
    const chain = settingQuery({
      data: { default_tenant_id: TENANT_ID, revision: 4 },
      error: null,
    });
    mocks.from.mockReturnValue(chain);

    await expect(getDefaultDemoPortalSetting()).resolves.toEqual({
      defaultTenantId: TENANT_ID,
      revision: 4,
    });

    expect(mocks.from).toHaveBeenCalledWith("demo_portal_settings");
    expect(chain.eq).toHaveBeenCalledWith("setting_key", "public-home");
    expect(chain.eq).toHaveBeenCalledWith("is_demo", true);
  });

  it("calls the atomic RPC with tenant and expected revision", async () => {
    mocks.rpc.mockResolvedValue({ data: 5, error: null });

    await expect(
      setDefaultDemoPortal({
        expectedRevision: 4,
        tenantId: TENANT_ID,
      }),
    ).resolves.toBe(5);

    expect(mocks.rpc).toHaveBeenCalledWith(
      "cms_set_default_demo_tenant",
      {
        p_expected_revision: 4,
        p_tenant_id: TENANT_ID,
      },
    );
  });

  it("maps a stale revision without retrying the mutation", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "40001", message: "revision conflict" },
    });

    await expect(
      setDefaultDemoPortal({
        expectedRevision: 3,
        tenantId: TENANT_ID,
      }),
    ).rejects.toBeInstanceOf(DefaultDemoPortalConflictError);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid revision before opening the client", async () => {
    await expect(
      setDefaultDemoPortal({
        expectedRevision: 0,
        tenantId: TENANT_ID,
      }),
    ).rejects.toThrow("Revisão da demonstração pública inválida.");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
