import { describe, expect, it } from "vitest";

import { parseBrapiQuotes } from "./stock-quotes";

describe("cotações de ações", () => {
  it("aceita somente ações de teste com o contrato esperado", () => {
    expect(
      parseBrapiQuotes({
        results: [
          {
            data: {
              currency: "BRL",
              regularMarketChangePercent: 1.25,
              regularMarketPrice: 42.5,
              regularMarketTime: "2026-07-27T16:44:50.000Z",
              shortName: "PETROBRAS PN",
            },
            requestedSymbol: "PETR4",
            symbol: "PETR4",
          },
        ],
      }),
    ).toEqual([
      {
        changePercent: 1.25,
        kind: "equity",
        label: "PETROBRAS PN",
        price: 42.5,
        referenceAt: "2026-07-27T16:44:50.000Z",
        source: "brapi",
        symbol: "PETR4",
      },
    ]);
  });

  it("recusa ativo fora da allowlist e preço inválido", () => {
    expect(
      parseBrapiQuotes({
        results: [
          {
            data: {
              currency: "BRL",
              regularMarketChangePercent: 1,
              regularMarketPrice: 10,
              regularMarketTime: "2026-07-27T16:44:50.000Z",
            },
            symbol: "BBDC4",
          },
          {
            data: {
              currency: "BRL",
              regularMarketChangePercent: 1,
              regularMarketPrice: "10",
              regularMarketTime: "2026-07-27T16:44:50.000Z",
            },
            symbol: "PETR4",
          },
        ],
      }),
    ).toEqual([]);
  });

  it("aceita a allowlist de saúde e preserva o nome editorial", () => {
    expect(
      parseBrapiQuotes(
        {
          results: [
            {
              data: {
                currency: "BRL",
                regularMarketChangePercent: -0.5,
                regularMarketPrice: 31.25,
                regularMarketTime: "2026-08-07T20:00:00.000Z",
                shortName: "REDE DOR ON NM",
              },
              symbol: "RDOR3",
            },
          ],
        },
        ["RDOR3"],
        { RDOR3: "Rede D’Or" },
      ),
    ).toEqual([
      {
        changePercent: -0.5,
        kind: "equity",
        label: "Rede D’Or",
        price: 31.25,
        referenceAt: "2026-08-07T20:00:00.000Z",
        source: "brapi",
        symbol: "RDOR3",
      },
    ]);
  });
});
