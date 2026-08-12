export type MarketQuote = {
  changePercent: number | null;
  kind: "currency" | "equity";
  label: string;
  price: number | null;
  referenceAt: string | null;
  source: "B3" | "brapi" | "Frankfurter";
  statusLabel?: string;
  symbol: string;
};
