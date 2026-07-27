import { getExchangeRates } from "./exchange-rates";
import { getStockQuotes } from "./stock-quotes";
import type { MarketQuote } from "./types";

export async function getMarketQuotes(): Promise<MarketQuote[]> {
  const [stocks, currencies] = await Promise.all([
    getStockQuotes(),
    getExchangeRates(),
  ]);
  return [...stocks, ...currencies];
}

export type { MarketQuote } from "./types";
