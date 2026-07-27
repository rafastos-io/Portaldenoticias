export type MarketQuote = {
  changePercent: number | null;
  kind: "currency" | "equity";
  label: string;
  price: number;
  referenceAt: string;
  source: "brapi" | "Frankfurter";
  symbol: string;
};
