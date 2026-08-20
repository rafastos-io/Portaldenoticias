import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DemoNotice } from "@/components/demo-notice";
import { LoginForm } from "@/app/admin/login/login-form";
import { createDemoLoginToken } from "@/lib/demo-auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar no ADM | Broadcast Saúde & Longevidade",
};

export default function AdminLoginPage() {
  const loginToken = createDemoLoginToken();

  return (
    <main className="min-h-screen bg-[#f4f5f3]">
      <DemoNotice admin compact />
      <div className="grid min-h-[calc(100vh-33px)] lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden overflow-hidden bg-[#12324a] lg:block">
          <Image
            alt=""
            aria-hidden="true"
            className="object-cover opacity-60"
            fill
            priority
            sizes="58vw"
            src="/images/editorial-hero-demo.png"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,50,74,0.15),rgba(18,50,74,0.92))]"
          />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
              Broadcast Saúde &amp; Longevidade
            </p>
            <p className="mt-4 max-w-2xl text-5xl leading-[1.02] font-bold tracking-tight xl:text-6xl">
              Operação editorial, pronta para cada marca.
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
              Ambiente demonstrativo. Marcas ou conteúdos reais aparecem
              somente quando há autorização e procedência registradas.
            </p>
          </div>
        </section>
        <section
          aria-labelledby="login-title"
          className="flex items-center justify-center px-5 py-12 sm:px-10 lg:bg-white"
        >
          <div className="w-full max-w-md">
            <Link
              className="inline-flex items-center gap-3 no-underline"
              href="/"
            >
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-md bg-[#13211f] text-sm font-black text-white"
              >
                B
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-950">
                  Broadcast
                </span>
                <span className="block text-xs text-slate-500">
                  Studio editorial
                </span>
              </span>
            </Link>
            <p className="mt-12 text-xs font-bold uppercase tracking-[0.16em] text-[#246a87]">
              Acesso restrito
            </p>
            <h1
              className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
              id="login-title"
            >
              Studio editorial
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Informe suas credenciais de acesso para continuar.
            </p>
            <LoginForm loginToken={loginToken} />
            <p className="mt-7 border-t border-slate-300 pt-5 text-xs leading-5 text-slate-500">
              Este gate protege apenas o ambiente de validação e deve ser
              substituído antes de qualquer operação editorial real.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
