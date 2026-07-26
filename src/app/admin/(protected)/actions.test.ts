import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieTenantId: "",
  createAdminContent: vi.fn(),
  destroyDemoSession: vi.fn(),
  revalidatePath: vi.fn(),
  requireDemoSession: vi.fn(),
  saveAdminTheme: vi.fn(),
  setAdminContentStatus: vi.fn(),
  updateAdminContent: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() =>
      mocks.cookieTenantId
        ? { value: mocks.cookieTenantId }
        : undefined,
    ),
    set: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((location: string) => {
    throw new Error(`REDIRECT:${location}`);
  }),
}));

vi.mock("@/lib/demo-auth/server", () => ({
  destroyDemoSession: mocks.destroyDemoSession,
  requireDemoSession: mocks.requireDemoSession,
}));

vi.mock("@/lib/supabase/content-repository", () => ({
  createAdminContent: mocks.createAdminContent,
  listAdminTenants: vi.fn(async () => [
    {
      display_name: "Tenant A",
      id: "00000000-0000-4000-8000-000000000002",
      slug: "tenant-a",
    },
    {
      display_name: "Tenant B",
      id: "00000000-0000-4000-8000-000000000003",
      slug: "tenant-b",
    },
  ]),
  setAdminContentStatus: mocks.setAdminContentStatus,
  updateAdminContent: mocks.updateAdminContent,
}));

vi.mock("@/lib/supabase/theme-repository", () => ({
  saveAdminTheme: mocks.saveAdminTheme,
}));

import { pauseContentAction } from "./actions";

const TENANT_A = "00000000-0000-4000-8000-000000000002";
const TENANT_B = "00000000-0000-4000-8000-000000000003";
const CONTENT_ID = "00000000-0000-4000-8000-000000000010";
const initialState = { status: "idle" } as const;

function pauseForm(input: {
  confirmedTenantId?: string;
  contextTenantId: string;
  tenantId: string;
}) {
  const formData = new FormData();
  formData.set("tenantId", input.tenantId);
  formData.set("contextTenantId", input.contextTenantId);
  formData.set("contentId", CONTENT_ID);
  formData.set("reason", "Validação automatizada do contexto");
  formData.set("confirmPause", "yes");
  if (input.confirmedTenantId) {
    formData.set("confirmTenantMismatch", input.confirmedTenantId);
  }
  return formData;
}

describe("tenant-scoped admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookieTenantId = TENANT_B;
  });

  it("returns confirmation for A to B without calling the repository", async () => {
    const result = await pauseContentAction(
      initialState,
      pauseForm({
        contextTenantId: TENANT_A,
        tenantId: TENANT_A,
      }),
    );

    expect(result).toMatchObject({
      status: "confirmation",
      tenantId: TENANT_A,
      tenantName: "Tenant A",
    });
    expect(mocks.setAdminContentStatus).not.toHaveBeenCalled();
  });

  it("denies a tampered target without calling the repository", async () => {
    mocks.cookieTenantId = TENANT_A;

    const result = await pauseContentAction(
      initialState,
      pauseForm({
        contextTenantId: TENANT_A,
        tenantId: TENANT_B,
      }),
    );

    expect(result).toEqual({
      message:
        "O contexto informado não é válido. Recarregue a página antes de tentar novamente.",
      status: "error",
    });
    expect(mocks.setAdminContentStatus).not.toHaveBeenCalled();
  });

  it("executes once after explicit confirmation", async () => {
    await expect(
      pauseContentAction(
        initialState,
        pauseForm({
          confirmedTenantId: TENANT_A,
          contextTenantId: TENANT_A,
          tenantId: TENANT_A,
        }),
      ),
    ).rejects.toThrow("REDIRECT:");

    expect(mocks.setAdminContentStatus).toHaveBeenCalledTimes(1);
    expect(mocks.setAdminContentStatus).toHaveBeenCalledWith({
      contentId: CONTENT_ID,
      reason: "Validação automatizada do contexto",
      status: "paused",
      tenantId: TENANT_A,
    });
  });
});
