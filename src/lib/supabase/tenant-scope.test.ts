import { describe, expect, it } from "vitest";

import {
  assertTenantStorageKey,
  tenantStorageKey,
  toEntityId,
  toTenantId,
} from "./tenant-scope";

const HORIZONTE_ID = "11111111-1111-4111-8111-111111111111";
const ATLAS_ID = "22222222-2222-4222-8222-222222222222";

describe("tenant scope", () => {
  it("aceita tenant UUID e cria chave prefixada", () => {
    expect(toTenantId(HORIZONTE_ID)).toBe(HORIZONTE_ID);
    expect(tenantStorageKey(HORIZONTE_ID, "capa.webp")).toBe(
      `${HORIZONTE_ID}/capa.webp`,
    );
  });

  it("recusa UUID ou nome de arquivo inválido", () => {
    expect(() => toTenantId("horizonte")).toThrow("UUID válido");
    expect(() => tenantStorageKey(HORIZONTE_ID, "../capa.webp")).toThrow(
      "Nome de arquivo inválido",
    );
  });

  it("aceita UUID determinístico persistido pelo PostgreSQL", () => {
    const contentId = "0949f0d3-39ce-0743-411f-27dfda108b1e";

    expect(toEntityId(contentId)).toBe(contentId);
  });

  it("nega acesso a objeto prefixado por outro tenant", () => {
    const atlasObject = `${ATLAS_ID}/capa.webp`;

    expect(() =>
      assertTenantStorageKey(HORIZONTE_ID, atlasObject),
    ).toThrow("não pertence ao tenant");
  });
});
