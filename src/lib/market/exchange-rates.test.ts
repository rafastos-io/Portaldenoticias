import { describe, expect, it } from "vitest";

import { parseFrankfurterRates } from "./exchange-rates";

describe("cotações de referência", () => {
  it("calcula preço em reais e variação entre duas referências", () => {
    expect(
      parseFrankfurterRates([
        { base: "BRL", date: "2026-07-24", quote: "USD", rate: 0.2 },
        { base: "BRL", date: "2026-07-25", quote: "USD", rate: 0.196 },
      ]),
    ).toEqual([
      {
        changePercent: expect.closeTo(2.0408, 3),
        kind: "currency",
        label: "Dólar",
        price: expect.closeTo(5.102, 3),
        referenceAt: "2026-07-25",
        source: "Frankfurter",
        symbol: "USD",
      },
    ]);
  });

  it("ignora linhas inválidas ou moedas não aprovadas", () => {
    expect(
      parseFrankfurterRates([
        { base: "BRL", date: "2026-07-27", quote: "BTC", rate: 1 },
        { base: "USD", date: "2026-07-27", quote: "BRL", rate: 5.1 },
        { rate: "5.1" },
      ]),
    ).toEqual([]);
  });
});
