export default function AdminLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="px-5 py-8 lg:px-8 lg:py-10"
      id="admin-main"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <span className="sr-only">Carregando catálogo editorial</span>
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-3 h-10 w-52 rounded bg-slate-300" />
        <div className="mt-8 h-16 border-y border-slate-300 bg-white" />
        <div className="mt-8 space-y-3">
          <div className="h-12 bg-slate-200" />
          <div className="h-20 bg-white" />
          <div className="h-20 bg-white" />
          <div className="h-20 bg-white" />
        </div>
      </div>
    </main>
  );
}
