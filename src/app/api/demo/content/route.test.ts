import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listPublicStories: vi.fn(),
  resolvePublicTenant: vi.fn(),
}));

vi.mock("@/lib/supabase/portal-repository", () => ({
  listPublicStories: mocks.listPublicStories,
  resolvePublicTenant: mocks.resolvePublicTenant,
}));

import { GET, POST } from "./route";

const tenant = {
  displayName: "Banco Demo Horizonte",
  id: "00000000-0000-4000-8000-000000000002",
  slug: "banco-demo-horizonte",
  slogan: "Planejamento para vidas mais longas",
};

const stories = [
  {
    author: "Marina Vale",
    body: ["Conteúdo fictício."],
    canonicalSlug: "vida-longa",
    categoryName: "Longevidade",
    categorySlug: "longevidade",
    correctionNote: null,
    id: "40000000-0000-4000-8000-000000000001",
    imageAlt: null,
    imagePath: null,
    publishedAt: "2026-07-01T12:00:00Z",
    sponsorshipLabel: null,
    subtitle: "Linha fina fictícia.",
    title: "Vida longa em perspectiva",
  },
  {
    author: "Tomás Prado",
    body: ["Conteúdo fictício."],
    canonicalSlug: "trabalho-futuro",
    categoryName: "Trabalho",
    categorySlug: "trabalho",
    correctionNote: null,
    id: "40000000-0000-4000-8000-000000000002",
    imageAlt: null,
    imagePath: null,
    publishedAt: "2026-07-02T12:00:00Z",
    sponsorshipLabel: null,
    subtitle: "Outra linha fina fictícia.",
    title: "Trabalho e futuro",
  },
];

describe("GET /api/demo/content", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolvePublicTenant.mockResolvedValue(tenant);
    mocks.listPublicStories.mockResolvedValue(stories);
  });

  it("retorna somente o tenant e a editoria solicitados como demonstração", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/demo/content?tenant=banco-demo-horizonte&editoria=longevidade",
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(payload).toMatchObject({
      demo: true,
      filters: { editoria: "longevidade", status: "published" },
      tenant: { slug: "banco-demo-horizonte" },
      total: 1,
    });
    expect(payload.items).toHaveLength(1);
    expect(mocks.listPublicStories).toHaveBeenCalledWith(tenant.id);
  });

  it("recusa tenant inexistente após consultar o catálogo persistido", async () => {
    mocks.resolvePublicTenant.mockResolvedValueOnce(null);
    const response = await GET(
      new Request(
        "http://localhost/api/demo/content?tenant=tenant-inexistente",
      ),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(await response.json()).toMatchObject({ demo: true });
    expect(mocks.resolvePublicTenant).toHaveBeenCalledWith("tenant-inexistente");
    expect(mocks.listPublicStories).not.toHaveBeenCalled();
  });

  it("recusa status não público", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/demo/content?tenant=banco-demo-horizonte&status=paused",
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(payload.demo).toBe(true);
    expect(mocks.listPublicStories).not.toHaveBeenCalled();
  });

  it("responde 503 seguro quando o catálogo falha", async () => {
    mocks.resolvePublicTenant.mockRejectedValueOnce(new Error("detalhe interno"));
    const response = await GET(
      new Request(
        "http://localhost/api/demo/content?tenant=banco-demo-horizonte",
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(payload).toEqual({
      demo: true,
      error: "Catálogo demonstrativo temporariamente indisponível no servidor.",
    });
  });

  it("mantém aviso demo e noindex em métodos não permitidos", async () => {
    const response = POST();
    const payload = await response.json();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(payload.demo).toBe(true);
  });
});
