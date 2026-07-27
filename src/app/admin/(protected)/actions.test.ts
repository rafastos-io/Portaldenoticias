import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieTenantId: "",
  createAdminContent: vi.fn(),
  DefaultDemoPortalConflictError: class extends Error {},
  destroyDemoSession: vi.fn(),
  revalidatePath: vi.fn(),
  requireDemoSession: vi.fn(),
  saveAdminTheme: vi.fn(),
  setDefaultDemoPortal: vi.fn(),
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

vi.mock("@/lib/supabase/demo-settings-repository", () => ({
  DefaultDemoPortalConflictError:
    mocks.DefaultDemoPortalConflictError,
  setDefaultDemoPortal: mocks.setDefaultDemoPortal,
}));

import {
  pauseContentAction,
  setDefaultDemoPortalAction,
} from "./actions";

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

function defaultPortalForm(input: {
  confirmed?: boolean;
  contextTenantId?: string;
  expectedRevision?: string;
  tenantId?: string;
}) {
  const tenantId = input.tenantId ?? TENANT_A;
  const formData = new FormData();
  formData.set("tenantId", tenantId);
  formData.set("contextTenantId", input.contextTenantId ?? tenantId);
  formData.set("expectedRevision", input.expectedRevision ?? "4");
  if (input.confirmed) {
    formData.set("confirmGlobalDefault", "yes");
  }
  return formData;
}

describe("tenant-scoped admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setDefaultDemoPortal.mockReset();
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

  it("does not change the public default without global confirmation", async () => {
    mocks.cookieTenantId = TENANT_A;

    await expect(
      setDefaultDemoPortalAction(
        initialState,
        defaultPortalForm({ confirmed: false }),
      ),
    ).resolves.toMatchObject({ status: "error" });
    expect(mocks.setDefaultDemoPortal).not.toHaveBeenCalled();
  });

  it("does not change the public default without a valid session", async () => {
    mocks.cookieTenantId = TENANT_A;
    mocks.requireDemoSession.mockRejectedValueOnce(
      new Error("unauthorized"),
    );

    await expect(
      setDefaultDemoPortalAction(
        initialState,
        defaultPortalForm({ confirmed: true }),
      ),
    ).rejects.toThrow("unauthorized");
    expect(mocks.setDefaultDemoPortal).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("denies a tampered tenant context before changing the public default", async () => {
    mocks.cookieTenantId = TENANT_A;

    await expect(
      setDefaultDemoPortalAction(
        initialState,
        defaultPortalForm({
          confirmed: true,
          contextTenantId: TENANT_A,
          tenantId: TENANT_B,
        }),
      ),
    ).resolves.toMatchObject({ status: "error" });
    expect(mocks.setDefaultDemoPortal).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("changes the public default once and invalidates public and admin routes", async () => {
    mocks.cookieTenantId = TENANT_A;
    mocks.setDefaultDemoPortal.mockResolvedValue(5);

    await expect(
      setDefaultDemoPortalAction(
        initialState,
        defaultPortalForm({ confirmed: true }),
      ),
    ).resolves.toEqual({
      message: "Este tenant agora é a demonstração pública padrão.",
      status: "success",
    });

    expect(mocks.setDefaultDemoPortal).toHaveBeenCalledWith({
      expectedRevision: 4,
      tenantId: TENANT_A,
    });
    expect(mocks.setDefaultDemoPortal).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/admin",
      "layout",
    );
  });

  it("returns a safe conflict and never retries a stale revision", async () => {
    mocks.cookieTenantId = TENANT_A;
    mocks.setDefaultDemoPortal.mockRejectedValue(
      new mocks.DefaultDemoPortalConflictError(
        "stale",
      ),
    );

    await expect(
      setDefaultDemoPortalAction(
        initialState,
        defaultPortalForm({ confirmed: true }),
      ),
    ).resolves.toEqual({
      message: "stale",
      status: "error",
    });
    expect(mocks.setDefaultDemoPortal).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
