import { describe, expect, it } from "vitest";

import { parseFrankfurterRate } from "./exchange-rates";

describe("cotações de referência", () => {
  it("aceita somente o contrato esperado da fonte", () => {
    expect(
      parseFrankfurterRate(
        {
          base: "USD",
          date: "2026-07-27",
          quote: "BRL",
          rate: 5.1234,
        },
        "Dólar comercial",
      ),
    ).toEqual({
      base: "USD",
      date: "2026-07-27",
      label: "Dólar comercial",
      quote: "BRL",
      rate: 5.1234,
    });
  });

  it("recusa resposta inválida ou par não aprovado", () => {
    expect(
      parseFrankfurterRate(
        { base: "BTC", date: "2026-07-27", quote: "BRL", rate: 1 },
        "Bitcoin",
      ),
    ).toBeNull();
    expect(parseFrankfurterRate({ rate: "5.1" }, "Dólar")).toBeNull();
  });
});
