import type { SiteModelId } from "@/lib/presentation/site-models";

import { getExchangeRates } from "./exchange-rates";
import { getHealthStockQuotes, getStockQuotes } from "./stock-quotes";
import type { MarketQuote } from "./types";

export async function getMarketQuotes(
  siteModel?: SiteModelId,
): Promise<MarketQuote[]> {
  if (siteModel === "health-pharma") return getHealthStockQuotes();
  const [stocks, currencies] = await Promise.all([
    getStockQuotes(),
    getExchangeRates(),
  ]);
  return [...stocks, ...currencies];
}

export type { MarketQuote } from "./types";
