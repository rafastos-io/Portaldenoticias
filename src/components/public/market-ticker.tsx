import type { ExchangeRate } from "@/lib/market/exchange-rates";

export function MarketTicker({ rates }: { rates: ExchangeRate[] }) {
  if (rates.length === 0) return null;

  const referenceDate = rates[0]?.date;
  return (
    <aside
      aria-label="Cotações de moedas"
      className="border-b border-border-subtle bg-surface-inverse text-text-on-brand"
    >
      <div className="page-container flex min-h-10 items-center gap-6 overflow-x-auto text-xs">
        <p className="shrink-0 font-bold uppercase tracking-[0.16em] opacity-65">
          Mercados
        </p>
        {rates.map((rate) => (
          <p className="shrink-0" key={rate.base}>
            <span className="font-semibold opacity-70">{rate.label}</span>{" "}
            <strong className="ml-1 text-sm">
              {new Intl.NumberFormat("pt-BR", {
                currency: "BRL",
                maximumFractionDigits: 4,
                minimumFractionDigits: 4,
                style: "currency",
              }).format(rate.rate)}
            </strong>
          </p>
        ))}
        <p className="ml-auto shrink-0 opacity-60">
          Referência diária · {referenceDate?.split("-").reverse().join("/")} ·
          Frankfurter
        </p>
      </div>
    </aside>
  );
}
