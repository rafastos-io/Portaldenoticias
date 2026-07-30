import { beforeEach, describe, expect, it, vi } from "vitest";

const TENANT_A_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_B_ID = "22222222-2222-4222-8222-222222222222";
const TENANT_B_ITEM_ID = "33333333-3333-4333-8333-333333333333";
const REVISION_ID = "44444444-4444-4444-8444-444444444444";
const AUTHOR_ID = "55555555-5555-4555-8555-555555555555";
const CATEGORY_ID = "66666666-6666-4666-8666-666666666666";

type Row = Record<string, unknown>;

const database = vi.hoisted(() => ({
  calls: [] as Array<{
    operation: "eq" | "rpc";
    payload: unknown;
    table: string;
  }>,
  tables: {
    content_items: [
      {
        canonical_slug: "materia-atlas",
        id: "33333333-3333-4333-8333-333333333333",
        last_published_at: null,
        owner_tenant_id: "22222222-2222-4222-8222-222222222222",
        updated_at: "2026-07-25T00:00:00.000Z",
        workflow_status: "draft",
      },
    ],
    content_revision_authors: [
      {
        author_id: "55555555-5555-4555-8555-555555555555",
        byline_order: 1,
        content_revision_id: "44444444-4444-4444-8444-444444444444",
      },
    ],
    content_revision_categories: [
      {
        category_id: "66666666-6666-4666-8666-666666666666",
        content_revision_id: "44444444-4444-4444-8444-444444444444",
        is_primary: "true",
      },
    ],
    authors: [
      {
        display_name: "Autor Teste",
        id: "55555555-5555-4555-8555-555555555555",
        owner_tenant_id: "22222222-2222-4222-8222-222222222222",
        slug: "autor-teste",
        status: "active",
      },
      {
        display_name: "Joana Neri",
        id: "55555555-5555-4555-8555-555555555566",
        owner_tenant_id: "11111111-1111-4111-8111-111111111111",
        slug: "joana-neri",
        status: "active",
      },
    ],
    content_revisions: [
      {
        body_text:
          "Corpo editorial fictício suficientemente longo para representar a matéria no teste unitário.",
        body_json: {
          demo_media: {
            alt: "Composição abstrata fictícia sobre saúde e longevidade.",
            mode: "fallback",
          },
        },
        content_item_id: "33333333-3333-4333-8333-333333333333",
        id: "44444444-4444-4444-8444-444444444444",
        revision_number: 1,
        subtitle: "Linha fina de demonstração editorial.",
        title: "Matéria do tenant Atlas",
      },
    ],
  } as Record<string, Row[]>,
}));

vi.mock("server-only", () => ({}));

vi.mock("./server", () => ({
  createServerSupabaseClient: () => ({
    from(table: string) {
      const predicates: Array<{ column: string; value: unknown }> = [];
      const arrayPredicates: Array<{ column: string; values: string[] }> = [];
      const matchingRows = () =>
        (database.tables[table] ?? []).filter(
          (row) =>
            predicates.every(
              ({ column, value }) =>
                String(row[column]) === String(value),
            ) &&
            arrayPredicates.every(({ column, values }) =>
              values.includes(String(row[column])),
            ),
        );
      const query = {
        eq(column: string, value: unknown) {
          predicates.push({ column, value });
          database.calls.push({
            operation: "eq" as const,
            payload: { column, value },
            table,
          });
          return query;
        },
        ilike() {
          return query;
        },
        in(column: string, values: string[]) {
          arrayPredicates.push({ column, values });
          return query;
        },
        insert(row: Record<string, unknown>) {
          const inserted = { ...row, id: row.id ?? AUTHOR_ID };
          if (database.tables[table]) {
            database.tables[table].push(inserted);
          } else {
            database.tables[table] = [inserted];
          }
          return {
            select(column: string) {
              return {
                async single() {
                  return { data: { [column]: inserted.id }, error: null };
                },
              };
            },
          };
        },
        limit() {
          return query;
        },
        async maybeSingle() {
          const data = matchingRows()[0] ?? null;
          return { data, error: null };
        },
        or() {
          return query;
        },
        order() {
          return query;
        },
        select() {
          return query;
        },
        async single() {
          const data = matchingRows()[0] ?? null;
          return { data, error: null };
        },
        then<TResult1 = { data: Row[]; error: null }>(
          onfulfilled?: (
            value: { data: Row[]; error: null },
          ) => TResult1 | PromiseLike<TResult1>,
        ) {
          return Promise.resolve({ data: matchingRows(), error: null }).then(
            onfulfilled,
          );
        },
        update() {
          return query;
        },
      };
      return query;
    },
    async rpc(name: string, payload: unknown) {
      database.calls.push({
        operation: "rpc",
        payload,
        table: name,
      });
      return { data: "77777777-7777-4777-8777-777777777777", error: null };
    },
  }),
}));

import {
  createAdminContent,
  findOwnedContentItem,
  listAdminContent,
  setAdminContentStatus,
} from "./content-repository";

describe("content repository tenant isolation", () => {
  beforeEach(() => {
    database.calls.length = 0;
  });

  it("não retorna item pertencente a outro tenant no caminho privilegiado", async () => {
    await expect(
      findOwnedContentItem(TENANT_A_ID, TENANT_B_ITEM_ID),
    ).resolves.toBeNull();
    expect(database.calls.slice(0, 2)).toEqual([
      {
        operation: "eq",
        payload: { column: "owner_tenant_id", value: TENANT_A_ID },
        table: "content_items",
      },
      {
        operation: "eq",
        payload: { column: "id", value: TENANT_B_ITEM_ID },
        table: "content_items",
      },
    ]);
  });

  it("carrega revisão e classificação somente após validar o tenant", async () => {
await expect(
      findOwnedContentItem(TENANT_B_ID, TENANT_B_ITEM_ID),
    ).resolves.toMatchObject({
      authorName: "Autor Teste",
      categoryId: CATEGORY_ID,
      editorialType: "standard",
      imageMode: "fallback",
      id: TENANT_B_ITEM_ID,
      revision: { id: REVISION_ID },
    });
  });

  it("filtra a listagem pelo proprietário antes de buscar revisões", async () => {
    await expect(listAdminContent(TENANT_A_ID)).resolves.toEqual([]);
    expect(database.calls).toContainEqual({
      operation: "eq",
      payload: { column: "owner_tenant_id", value: TENANT_A_ID },
      table: "content_items",
    });
  });

  it("envia tenant obrigatório aos RPCs de criação e status", async () => {
    await createAdminContent({
      authorName: "Joana Neri",
      body: "Texto fictício com mais de oitenta caracteres para validar a operação persistente do CMS demonstrativo.",
      categoryId: CATEGORY_ID,
      correctionNote: null,
      editorialType: "standard",
      imageAlt: "Composição abstrata fictícia sobre saúde e longevidade.",
      imageMode: "fallback",
      keyTopics: [],
      slug: "nova-materia",
      sponsorshipLabel: null,
      subtitle: "Linha fina para a nova matéria fictícia.",
      tenantId: TENANT_A_ID,
      title: "Nova matéria fictícia",
    });
    await setAdminContentStatus({
      contentId: TENANT_B_ITEM_ID,
      reason: "Motivo editorial demonstrativo.",
      status: "paused",
      tenantId: TENANT_A_ID,
    });

    expect(
      database.calls.filter((call) => call.operation === "rpc"),
    ).toEqual([
      expect.objectContaining({
        payload: expect.objectContaining({ p_tenant_id: TENANT_A_ID }),
        table: "cms_create_content_with_media",
      }),
      expect.objectContaining({
        payload: expect.objectContaining({
          p_content_id: TENANT_B_ITEM_ID,
          p_tenant_id: TENANT_A_ID,
        }),
        table: "cms_set_content_status",
      }),
    ]);
  });
});
