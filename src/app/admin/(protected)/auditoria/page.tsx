import { cookies } from "next/headers";

import {
  AUDIT_ACTIONS,
  isAuditAction,
  listAdminAuditEvents,
  type AuditAction,
} from "@/lib/supabase/audit-repository";
import {
  ADMIN_TENANT_COOKIE,
  resolveAdminTenant,
} from "@/lib/admin/tenant-context";
import { requireDemoSession } from "@/lib/demo-auth/server";
import { listAdminTenants } from "@/lib/supabase/content-repository";

const actionLabels: Record<AuditAction, string> = {
  "content.created": "Matéria criada",
  "content.edited": "Matéria editada",
  "content.media_selected": "Imagem definida",
  "content.paused": "Publicação pausada",
  "content.published": "Matéria publicada",
  "content.resumed": "Publicação retomada",
  "portal.default_changed": "Portal padrão alterado",
  "theme.updated": "Identidade atualizada",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

async function loadAudit(
  requestedTenant?: string,
  cookieTenant?: string,
  action?: AuditAction,
) {
  try {
    const tenants = await listAdminTenants();
    const resolution = resolveAdminTenant(
      tenants,
      requestedTenant,
      cookieTenant,
    );

    if (!resolution.ok) {
      const noTenants = resolution.reason === "no-tenants";
      return {
        description: noTenants
          ? "Nenhum tenant demonstrativo está disponível. Execute o seed idempotente."
          : "O contexto solicitado não corresponde a um tenant demonstrativo disponível. Selecione novamente no cabeçalho.",
        ok: false as const,
        title: noTenants
          ? "Auditoria sem tenants"
          : "Contexto de tenant inválido",
      };
    }
    const selectedTenant = resolution.tenant;

    const events = await listAdminAuditEvents(selectedTenant.id, action);
    return { events, ok: true as const, selectedTenant, tenants };
  } catch (error) {
    const configurationError =
      error instanceof Error &&
      (error.message.startsWith("SUPABASE_URL") ||
        error.message.startsWith("SUPABASE_SECRET_KEY"));
    return {
      description: configurationError
        ? "Configure SUPABASE_URL e SUPABASE_SECRET_KEY somente no servidor para consultar a trilha."
        : "O banco não respondeu como esperado. Tente novamente e verifique os logs do servidor.",
      ok: false as const,
      title: configurationError
        ? "Conexão da auditoria indisponível"
        : "Auditoria temporariamente indisponível",
    };
  }
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireDemoSession();

  const params = await searchParams;
  const requestedAction = single(params.action);
  const action = isAuditAction(requestedAction) ? requestedAction : undefined;
  const cookieStore = await cookies();
  const loaded = await loadAudit(
    single(params.tenant),
    cookieStore.get(ADMIN_TENANT_COOKIE)?.value,
    action,
  );

  if (!loaded.ok) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-5" id="admin-main">
        <div className="max-w-xl border-y border-slate-300 bg-white px-5 py-10 text-center sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
            Estado de erro
          </p>
          <h1 className="mt-3 text-2xl font-bold">{loaded.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {loaded.description}
          </p>
        </div>
      </main>
    );
  }

  const { events, selectedTenant } = loaded;

  return (
    <main className="px-5 py-8 lg:px-8 lg:py-10" id="admin-main">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-300 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Governança demonstrativa
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Trilha de auditoria
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Eventos mínimos por tenant. A consulta não carrega secrets, IPs,
            user agents ou o corpo integral das matérias.
          </p>
        </header>

        <section className="border-b border-slate-300 py-6">
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            method="get"
          >
            <input name="tenant" type="hidden" value={selectedTenant.id} />
            <label className="grid gap-2 text-sm font-bold">
              Ação
              <select
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3"
                defaultValue={action ?? ""}
                name="action"
              >
                <option value="">Todas as ações</option>
                {AUDIT_ACTIONS.map((item) => (
                  <option key={item} value={item}>
                    {actionLabels[item]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="min-h-11 self-end rounded-md border border-slate-400 bg-white px-4 text-sm font-bold hover:bg-slate-50"
              type="submit"
            >
              Aplicar filtro
            </button>
          </form>
        </section>

        <section aria-labelledby="events-title" className="py-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              {selectedTenant.display_name}
            </p>
            <h2 className="mt-2 text-xl font-bold" id="events-title">
              Eventos recentes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {events.length} evento(s) no filtro atual.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="mt-6 border-y border-slate-300 bg-white py-12 text-center">
              <h3 className="font-bold">Nenhum evento neste filtro</h3>
              <p className="mt-2 text-sm text-slate-600">
                Operações futuras do CMS aparecerão aqui sem registrar o corpo
                completo da matéria.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto border-y border-slate-300 bg-white">
              <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold" scope="col">
                      Horário
                    </th>
                    <th className="px-4 py-3 font-bold" scope="col">
                      Ação
                    </th>
                    <th className="px-4 py-3 font-bold" scope="col">
                      Ator
                    </th>
                    <th className="px-4 py-3 font-bold" scope="col">
                      Alvo
                    </th>
                    <th className="px-4 py-3 font-bold" scope="col">
                      Motivo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr className="border-t border-slate-200" key={event.id}>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        <time dateTime={event.created_at}>
                          {formatTime(event.created_at)}
                        </time>
                      </td>
                      <td className="px-4 py-4 font-bold">
                        {isAuditAction(event.action)
                          ? actionLabels[event.action]
                          : "Evento demonstrativo"}
                      </td>
                      <td className="px-4 py-4">{event.actor_id}</td>
                      <td className="px-4 py-4">
                        <span className="block text-xs text-slate-500">
                          {event.target_type}
                        </span>
                        <code className="mt-1 block text-xs">
                          {event.target_id ?? "—"}
                        </code>
                      </td>
                      <td className="max-w-md px-4 py-4 text-slate-600">
                        {event.reason ?? "Sem motivo adicional."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
