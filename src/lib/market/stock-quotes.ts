import type { MarketQuote } from "./types";

const TEST_SYMBOLS = ["PETR4", "VALE3", "ITUB4", "MGLU3"] as const;

export const HEALTH_STOCKS = [
  { label: "Rede D’Or", symbol: "RDOR3" },
  { label: "Fleury", symbol: "FLRY3" },
  { label: "Hapvida", symbol: "HAPV3" },
  { label: "Mater Dei", symbol: "MATD3" },
  { label: "Dasa", symbol: "DASA3" },
  { label: "Oncoclínicas", symbol: "ONCO3" },
  { label: "Qualicorp", symbol: "QUAL3" },
  { label: "BradSaúde", symbol: "SAUD3" },
] as const;

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

export function parseBrapiQuotes(
  input: unknown,
  allowedSymbols: readonly string[] = TEST_SYMBOLS,
  preferredLabels: Readonly<Record<string, string>> = {},
): MarketQuote[] {
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
    if (!allowedSymbols.includes(symbol)) continue;
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
        preferredLabels[symbol] ??
        (typeof quote.shortName === "string" && quote.shortName.trim()
          ? quote.shortName.trim()
          : symbol),
      price: quote.regularMarketPrice,
      referenceAt: quote.regularMarketTime,
      source: "brapi",
      symbol,
    });
  }

  return allowedSymbols.flatMap((symbol) => {
    const quote = parsed.get(symbol);
    return quote ? [quote] : [];
  });
}

async function fetchStockQuotes(
  symbols: readonly string[],
  token?: string,
  preferredLabels: Readonly<Record<string, string>> = {},
): Promise<MarketQuote[]> {
  try {
    const query = new URLSearchParams({ symbols: symbols.join(",") });
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(
      `https://brapi.dev/api/v2/stocks/quote?${query}`,
      {
        headers,
        next: { revalidate: 15 * 60 },
      },
    );
    if (!response.ok) return [];
    return parseBrapiQuotes(await response.json(), symbols, preferredLabels);
  } catch {
    return [];
  }
}

export async function getStockQuotes(): Promise<MarketQuote[]> {
  return fetchStockQuotes(TEST_SYMBOLS);
}

export async function getHealthStockQuotes(): Promise<MarketQuote[]> {
  const symbols = HEALTH_STOCKS.map((stock) => stock.symbol);
  const labels = Object.fromEntries(
    HEALTH_STOCKS.map((stock) => [stock.symbol, stock.label]),
  );
  const token = process.env.BRAPI_API_TOKEN?.trim();
  const live = token
    ? (
        await Promise.all(
          symbols.map((symbol) => fetchStockQuotes([symbol], token, labels)),
        )
      ).flat()
    : [];
  const quotes = new Map(live.map((quote) => [quote.symbol, quote]));

  return [
    ...HEALTH_STOCKS.map(
      ({ label, symbol }): MarketQuote =>
        quotes.get(symbol) ?? {
          changePercent: null,
          kind: "equity",
          label,
          price: null,
          referenceAt: null,
          source: "B3",
          statusLabel: "cotação indisponível",
          symbol,
        },
    ),
    {
      changePercent: null,
      kind: "equity",
      label: "OdontoPrev",
      price: null,
      referenceAt: null,
      source: "B3",
      statusLabel: "integrada à BradSaúde",
      symbol: "ODPV3 → SAUD3",
    },
  ];
}
