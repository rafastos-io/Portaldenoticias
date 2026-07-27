import type { MarketQuote } from "./types";

type CurrencySymbol = (typeof CURRENCIES)[number]["symbol"];

type FrankfurterRate = {
  base: string;
  date: string;
  quote: string;
  rate: number;
};

const CURRENCIES = [
  { label: "Dólar", symbol: "USD" },
  { label: "Euro", symbol: "EUR" },
  { label: "Libra", symbol: "GBP" },
  { label: "Franco suíço", symbol: "CHF" },
  { label: "Dólar canadense", symbol: "CAD" },
  { label: "Iene", symbol: "JPY" },
] as const;

function isCurrencySymbol(input: string): input is CurrencySymbol {
  return CURRENCIES.some((currency) => currency.symbol === input);
}

function readFrankfurterRate(input: unknown): FrankfurterRate | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  const row = input as Partial<FrankfurterRate>;
  if (
    row.base !== "BRL" ||
    typeof row.quote !== "string" ||
    !isCurrencySymbol(row.quote) ||
    typeof row.rate !== "number" ||
    !Number.isFinite(row.rate) ||
    row.rate <= 0 ||
    typeof row.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(row.date)
  ) {
    return null;
  }
  return row as FrankfurterRate;
}

export function parseFrankfurterRates(input: unknown): MarketQuote[] {
  if (!Array.isArray(input)) return [];

  const byCurrency = new Map<CurrencySymbol, FrankfurterRate[]>();
  for (const candidate of input) {
    const row = readFrankfurterRate(candidate);
    if (!row) continue;
    const symbol = row.quote as CurrencySymbol;
    byCurrency.set(symbol, [...(byCurrency.get(symbol) ?? []), row]);
  }

  return CURRENCIES.flatMap(({ label, symbol }) => {
    const rows = (byCurrency.get(symbol) ?? []).sort((left, right) =>
      left.date.localeCompare(right.date),
    );
    const latest = rows.at(-1);
    if (!latest) return [];
    const previous = rows.at(-2);
    const price = 1 / latest.rate;
    const previousPrice = previous ? 1 / previous.rate : null;
    const changePercent =
      previousPrice === null
        ? null
        : ((price - previousPrice) / previousPrice) * 100;

    return [
      {
        changePercent,
        kind: "currency" as const,
        label,
        price,
        referenceAt: latest.date,
        source: "Frankfurter" as const,
        symbol,
      },
    ];
  });
}

export async function getExchangeRates(): Promise<MarketQuote[]> {
  try {
    const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const query = new URLSearchParams({
      base: "BRL",
      from,
      quotes: CURRENCIES.map((currency) => currency.symbol).join(","),
    });
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?${query}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 * 60 },
      },
    );
    if (!response.ok) return [];
    return parseFrankfurterRates(await response.json());
  } catch {
    return [];
  }
}
