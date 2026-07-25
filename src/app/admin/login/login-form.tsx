"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  loginAction,
  type LoginState,
} from "@/app/admin/login/actions";

const initialLoginState: LoginState = {
  message: null,
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-2 min-h-12 w-full rounded-md bg-[#13211f] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#23423d] disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Validando…" : "Entrar no ADM"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-bold text-slate-800" htmlFor="user">
          Usuário
        </label>
        <input
          autoCapitalize="none"
          autoComplete="username"
          className="mt-2 min-h-12 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950"
          defaultValue="USER"
          id="user"
          maxLength={256}
          name="user"
          required
          spellCheck={false}
          type="text"
        />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-800" htmlFor="password">
          Senha
        </label>
        <input
          autoComplete="current-password"
          className="mt-2 min-h-12 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950"
          defaultValue="User123"
          id="password"
          maxLength={256}
          name="password"
          required
          type="password"
        />
      </div>
      {state.status === "error" && state.message ? (
        <p
          aria-live="polite"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
