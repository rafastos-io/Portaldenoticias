import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import {
  AUDIT_ACTIONS,
  isAuditAction,
  listAdminAuditEvents,
} from "./audit-repository";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";

describe("escopo da auditoria demonstrativa", () => {
  it("inclui as cinco transições editoriais obrigatórias", () => {
    expect(AUDIT_ACTIONS).toEqual(
      expect.arrayContaining([
        "content.created",
        "content.edited",
        "content.published",
        "content.paused",
        "content.resumed",
      ]),
    );
  });

  it("recusa ações arbitrárias no filtro", () => {
    expect(isAuditAction("content.paused")).toBe(true);
    expect(isAuditAction("content.full_body_exported")).toBe(false);
  });

  it("sempre consulta somente eventos demo do tenant explícito", async () => {
    const chain = {
      eq: vi.fn(),
      in: vi.fn(),
      limit: vi.fn(),
      order: vi.fn(),
      select: vi.fn(),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.in.mockReturnValue(chain);
    chain.order.mockReturnValue(chain);
    chain.limit.mockResolvedValue({ data: [], error: null });
    const from = vi.fn().mockReturnValue(chain);
    mocks.createServerSupabaseClient.mockReturnValue({ from });

    await expect(listAdminAuditEvents(TENANT_ID)).resolves.toEqual([]);

    expect(from).toHaveBeenCalledWith("audit_events");
    expect(chain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(chain.eq).toHaveBeenCalledWith("is_demo", true);
    expect(chain.select).toHaveBeenCalledWith(
      "id, actor_id, action, target_type, target_id, reason, created_at",
    );
  });
});
