"use client";

import { useActionState, useState } from "react";
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
      {pending ? "Validando acesso…" : "Acessar ambiente editorial"}
    </button>
  );
}

export function LoginForm({ loginToken }: { loginToken: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input name="loginToken" type="hidden" value={loginToken} />
      <div>
        <label className="text-sm font-bold text-slate-800" htmlFor="user">
          Usuário
        </label>
        <input
          autoCapitalize="none"
          autoComplete="username"
          className="mt-2 min-h-12 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950"
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
        <div className="mt-2 grid grid-cols-[1fr_auto] border border-slate-400 bg-white">
          <input
            autoComplete="current-password"
            className="min-h-12 min-w-0 border-0 bg-transparent px-3 py-2 text-base text-slate-950 outline-none"
            id="password"
            maxLength={256}
            name="password"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-pressed={showPassword}
            className="min-h-12 border-l border-slate-300 px-3 text-xs font-bold text-slate-700"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
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
