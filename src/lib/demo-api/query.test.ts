import { describe, expect, it } from "vitest";

import { DemoApiQueryError, parseDemoApiQuery } from "./query";

describe("filtros da rota JSON demo", () => {
  it("exige tenant e assume apenas status público", () => {
    expect(
      parseDemoApiQuery(
        new URLSearchParams("tenant=banco-demo-horizonte&editoria=longevidade"),
      ),
    ).toEqual({
      categorySlug: "longevidade",
      status: "published",
      tenantSlug: "banco-demo-horizonte",
    });
  });

  it("rejeita tenant ausente ou slug inseguro", () => {
    expect(() => parseDemoApiQuery(new URLSearchParams())).toThrow(
      DemoApiQueryError,
    );
    expect(() =>
      parseDemoApiQuery(new URLSearchParams("tenant=../outro")),
    ).toThrow("Tenant inválido");
  });

  it("recusa tentativa de consultar estados não públicos", () => {
    expect(() =>
      parseDemoApiQuery(
        new URLSearchParams("tenant=banco-demo-horizonte&status=draft"),
      ),
    ).toThrow("somente conteúdo com status published");
  });
});
