"use client";

import { useActionState, type ReactNode } from "react";

export type TenantMutationState =
  | { status: "idle" }
  | {
      message: string;
      status: "confirmation";
      tenantId: string;
      tenantName: string;
    }
  | { message: string; status: "error" };

export const INITIAL_TENANT_MUTATION_STATE: TenantMutationState = {
  status: "idle",
};

type TenantMutationFormProps = {
  action: (
    state: TenantMutationState,
    formData: FormData,
  ) => Promise<TenantMutationState>;
  children: ReactNode;
  className?: string;
  tenantId: string;
};

export function TenantMutationForm({
  action,
  children,
  className,
  tenantId,
}: TenantMutationFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_TENANT_MUTATION_STATE,
  );

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className={className}
    >
      <input name="contextTenantId" type="hidden" value={tenantId} />
      {state.status === "confirmation" ? (
        <div
          className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-bold">O tenant ativo mudou.</p>
          <p className="mt-1 leading-5">{state.message}</p>
          <label className="mt-3 flex items-start gap-2 font-semibold">
            <input
              className="mt-0.5 size-4 shrink-0"
              name="confirmTenantMismatch"
              required
              type="checkbox"
              value={state.tenantId}
            />
            Confirmo que desejo executar esta alteração em {state.tenantName}.
          </label>
        </div>
      ) : null}
      {state.status === "error" ? (
        <p
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-950"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <fieldset className="contents" disabled={pending}>
        {children}
      </fieldset>
    </form>
  );
}
