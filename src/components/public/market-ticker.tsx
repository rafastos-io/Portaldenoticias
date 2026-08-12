import type { MarketQuote } from "@/lib/market/market-data";

const brlCurrency = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

const brlExchange = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
  style: "currency",
});

const percent = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: "always",
  style: "percent",
});

export function MarketTicker({
  label = "Mercados",
  quotes,
}: {
  label?: string;
  quotes: MarketQuote[];
}) {
  if (quotes.length === 0) return null;
  const referenceDate = quotes
    .flatMap((quote) =>
      quote.referenceAt ? [quote.referenceAt.slice(0, 10)] : [],
    )
    .sort()
    .at(-1)
    ?.split("-")
    .reverse()
    .join("/");
  const sources = [...new Set(quotes.map((quote) => quote.source))].join(" + ");
  const sourceSummary = referenceDate
    ? `Ref. ${referenceDate} · ${sources}`
    : `Símbolos verificados · ${sources}`;

  return (
    <aside
      aria-label={`Cotações e referências — ${label}`}
      className="market-ticker border-b border-border-subtle bg-surface-inverse text-text-on-brand"
      id="mercados"
    >
      <div className="flex min-h-11 items-stretch">
        <p className="relative z-10 grid shrink-0 place-items-center border-r border-white/20 bg-surface-inverse px-4 text-[10px] font-bold uppercase tracking-[0.18em] sm:px-6">
          {label}
        </p>
        <div
          aria-describedby="market-source"
          aria-label="Faixa de cotações em movimento"
          className="market-ticker-viewport flex min-h-11 min-w-0 flex-1 overflow-hidden"
          tabIndex={0}
        >
          <div className="market-ticker-track flex min-h-11 w-max items-stretch">
            <TickerCopy quotes={quotes} />
            <TickerCopy ariaHidden quotes={quotes} />
          </div>
        </div>
        <p className="hidden shrink-0 place-items-center border-l border-white/20 px-5 text-[10px] font-semibold opacity-65 xl:grid">
          {sourceSummary}
        </p>
      </div>
      <p className="border-t border-white/10 px-4 py-1 text-right text-[9px] opacity-55 xl:hidden">
        {sourceSummary}
      </p>
      <p className="sr-only" id="market-source">
        Valores ou símbolos de referência fornecidos por {sources}. Quando a
        cotação estiver indisponível, nenhum preço estimado será exibido. Não
        são recomendação financeira.
      </p>
    </aside>
  );
}

function TickerCopy({
  ariaHidden = false,
  quotes,
}: {
  ariaHidden?: boolean;
  quotes: MarketQuote[];
}) {
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className="market-ticker-copy flex min-h-11 shrink-0 items-stretch"
    >
      {quotes.map((quote) => {
        const isPositive =
          quote.changePercent !== null && quote.changePercent >= 0;
        const isNegative =
          quote.changePercent !== null && quote.changePercent < 0;
        return (
          <p
            className="flex min-h-11 shrink-0 items-center gap-2 border-r border-white/15 px-5 text-xs sm:px-6"
            key={`${ariaHidden ? "copy-" : ""}${quote.kind}-${quote.symbol}`}
            title={`${quote.label} · fonte ${quote.source}`}
          >
            <strong className="text-sm tracking-tight">{quote.symbol}</strong>
            <span className="max-w-36 truncate text-[0.68rem] font-medium opacity-75">
              {quote.label}
            </span>
            {quote.price !== null ? (
              <span className="font-semibold">
                {(quote.kind === "currency" ? brlExchange : brlCurrency).format(
                  quote.price,
                )}
              </span>
            ) : (
              <span className="font-medium opacity-65">
                {quote.statusLabel ?? "cotação indisponível"}
              </span>
            )}
            {quote.changePercent !== null ? (
              <span
                className={
                  isPositive
                    ? "font-bold text-emerald-300"
                    : isNegative
                      ? "font-bold text-rose-300"
                      : "opacity-70"
                }
              >
                {percent.format(quote.changePercent / 100)}
              </span>
            ) : quote.price !== null ? (
              <span className="opacity-60">referência</span>
            ) : null}
          </p>
        );
      })}
    </div>
  );
}
