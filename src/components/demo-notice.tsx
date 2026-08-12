type DemoNoticeProps = {
  compact?: boolean;
  admin?: boolean;
};

export function DemoNotice({
  compact = false,
  admin = false,
}: DemoNoticeProps) {
  const message = admin
    ? "Modo demonstração - autenticação real desativada"
    : "Ambiente demonstrativo. Marcas, autores, dados e matérias são fictícios.";

  return (
    <aside
      aria-label="Aviso de ambiente demonstrativo"
      className={
        compact
          ? "border-b border-amber-300/70 bg-demo-surface px-4 py-2 text-center text-xs font-semibold text-demo-text"
          : "border-b border-amber-300/70 bg-demo-surface text-demo-text"
      }
    >
      {compact ? (
        message
      ) : (
        <div className="page-container flex items-center gap-3 py-2.5 text-xs font-semibold sm:text-sm">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-amber-600" />
          <p>{message}</p>
        </div>
      )}
    </aside>
  );
}
