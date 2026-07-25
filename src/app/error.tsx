"use client";

import Link from "next/link";

import { DemoNotice } from "@/components/demo-notice";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <DemoNotice />
      <main className="grid min-h-[70vh] place-items-center px-5" id="conteudo-principal">
        <div className="max-w-xl border-y border-border-subtle py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            Falha temporária
          </p>
          <h1 className="mt-3 text-3xl font-bold">O portal não pôde ser carregado.</h1>
          <p className="mt-3 leading-7 text-text-muted">
            Tente novamente ou volte à demonstração principal.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              className="min-h-11 rounded-full bg-brand-primary px-5 text-sm font-bold text-white"
              onClick={reset}
              type="button"
            >
              Tentar novamente
            </button>
            <Link
              className="min-h-11 rounded-full border border-border-subtle px-5 py-3 text-sm font-bold no-underline"
              href="/"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
