import type { MarketQuote } from "./types";

const TEST_SYMBOLS = ["PETR4", "VALE3", "ITUB4", "MGLU3"] as const;

type BrapiQuote = {
  currency?: unknown;
  regularMarketChangePercent?: unknown;
  regularMarketPrice?: unknown;
  regularMarketTime?: unknown;
  shortName?: unknown;
};

type BrapiResult = {
  data?: unknown;
  requestedSymbol?: unknown;
  symbol?: unknown;
};

function isTestSymbol(input: string): input is (typeof TEST_SYMBOLS)[number] {
  return TEST_SYMBOLS.some((symbol) => symbol === input);
}

export function parseBrapiQuotes(input: unknown): MarketQuote[] {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return [];
  }
  const results = (input as { results?: unknown }).results;
  if (!Array.isArray(results)) return [];

  const parsed = new Map<string, MarketQuote>();
  for (const candidate of results) {
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      Array.isArray(candidate)
    ) {
      continue;
    }
    const result = candidate as BrapiResult;
    const symbol =
      typeof result.symbol === "string"
        ? result.symbol
        : typeof result.requestedSymbol === "string"
          ? result.requestedSymbol
          : "";
    if (!isTestSymbol(symbol)) continue;
    if (
      typeof result.data !== "object" ||
      result.data === null ||
      Array.isArray(result.data)
    ) {
      continue;
    }
    const quote = result.data as BrapiQuote;
    if (
      quote.currency !== "BRL" ||
      typeof quote.regularMarketPrice !== "number" ||
      !Number.isFinite(quote.regularMarketPrice) ||
      quote.regularMarketPrice <= 0 ||
      typeof quote.regularMarketChangePercent !== "number" ||
      !Number.isFinite(quote.regularMarketChangePercent) ||
      typeof quote.regularMarketTime !== "string" ||
      Number.isNaN(Date.parse(quote.regularMarketTime))
    ) {
      continue;
    }

    parsed.set(symbol, {
      changePercent: quote.regularMarketChangePercent,
      kind: "equity",
      label:
        typeof quote.shortName === "string" && quote.shortName.trim()
          ? quote.shortName.trim()
          : symbol,
      price: quote.regularMarketPrice,
      referenceAt: quote.regularMarketTime,
      source: "brapi",
      symbol,
    });
  }

  return TEST_SYMBOLS.flatMap((symbol) => {
    const quote = parsed.get(symbol);
    return quote ? [quote] : [];
  });
}

export async function getStockQuotes(): Promise<MarketQuote[]> {
  try {
    const query = new URLSearchParams({ symbols: TEST_SYMBOLS.join(",") });
    const response = await fetch(
      `https://brapi.dev/api/v2/stocks/quote?${query}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 15 * 60 },
      },
    );
    if (!response.ok) return [];
    return parseBrapiQuotes(await response.json());
  } catch {
    return [];
  }
}
