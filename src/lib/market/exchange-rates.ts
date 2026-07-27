export type ExchangeRate = {
  base: "EUR" | "GBP" | "USD";
  date: string;
  label: string;
  quote: "BRL";
  rate: number;
};

type FrankfurterRate = {
  base: string;
  date: string;
  quote: string;
  rate: number;
};

const PAIRS = [
  { base: "USD", label: "Dólar comercial" },
  { base: "EUR", label: "Euro" },
  { base: "GBP", label: "Libra" },
] as const;

export function parseFrankfurterRate(
  input: unknown,
  label: string,
): ExchangeRate | null {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return null;
  }

  const rate = input as Partial<FrankfurterRate>;
  if (
    (rate.base !== "USD" && rate.base !== "EUR" && rate.base !== "GBP") ||
    rate.quote !== "BRL" ||
    typeof rate.rate !== "number" ||
    !Number.isFinite(rate.rate) ||
    rate.rate <= 0 ||
    typeof rate.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(rate.date)
  ) {
    return null;
  }

  return {
    base: rate.base,
    date: rate.date,
    label,
    quote: "BRL",
    rate: rate.rate,
  };
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const results = await Promise.all(
    PAIRS.map(async ({ base, label }) => {
      try {
        const response = await fetch(
          `https://api.frankfurter.dev/v2/rate/${base}/BRL`,
          {
            headers: { Accept: "application/json" },
            next: { revalidate: 60 * 60 },
          },
        );
        if (!response.ok) return null;
        return parseFrankfurterRate(await response.json(), label);
      } catch {
        return null;
      }
    }),
  );

  return results.filter((rate): rate is ExchangeRate => rate !== null);
}
