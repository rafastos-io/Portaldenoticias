export default function PublicLoading() {
  return (
    <main aria-busy="true" aria-live="polite" id="conteudo-principal">
      <span className="sr-only">Carregando portal demonstrativo</span>
      <div className="min-h-[70vh] animate-pulse bg-surface-muted">
        <div className="page-container flex min-h-[70vh] items-end py-14">
          <div className="w-full max-w-3xl">
            <div className="h-4 w-44 rounded bg-slate-300" />
            <div className="mt-5 h-28 rounded bg-slate-300" />
            <div className="mt-6 h-5 w-3/4 rounded bg-slate-300" />
          </div>
        </div>
      </div>
    </main>
  );
}
