import Link from "next/link";

import {
  createContentAction,
  pauseContentAction,
  publishContentAction,
  resumeContentAction,
  updateContentAction,
} from "@/app/admin/(protected)/actions";
import {
  findOwnedContentItem,
  getAdminEditorOptions,
  listAdminContent,
  listAdminTenants,
  type AdminContentStatus,
} from "@/lib/supabase/content-repository";
import { requireDemoSession } from "@/lib/demo-auth/server";

const HORIZON_TENANT_ID = "00000000-0000-4000-8000-000000000002";
const statusLabels: Record<AdminContentStatus, string> = {
  draft: "Rascunho",
  paused: "Pausado",
  published: "Publicado",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function singleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function isContentStatus(value: string | undefined): value is AdminContentStatus {
  return value === "draft" || value === "published" || value === "paused";
}

function adminHref(
  tenantId: string,
  options: { edit?: string; mode?: "new"; status?: AdminContentStatus } = {},
) {
  const params = new URLSearchParams({ tenant: tenantId });
  if (options.status) params.set("status", options.status);
  if (options.edit) params.set("edit", options.edit);
  if (options.mode) params.set("mode", options.mode);
  return `/admin?${params.toString()}${options.edit || options.mode ? "#editor" : "#conteudo"}`;
}

function formatUpdate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function Field({
  children,
  label,
  name,
}: {
  children: React.ReactNode;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-800">
      {label}
      {children}
      <span className="sr-only">Campo {name}</span>
    </label>
  );
}

function EditorialForm({
  action,
  authors,
  categories,
  contentId,
  initial,
  tenantId,
}: {
  action: (formData: FormData) => Promise<void>;
  authors: Array<{ display_name: string; id: string }>;
  categories: Array<{ id: string; name: string }>;
  contentId?: string;
  initial?: {
    authorId: string | null;
    body: string;
    categoryId: string | null;
    imageAlt: string;
    imageMode: "fallback" | "none";
    subtitle: string;
    title: string;
  };
  tenantId: string;
}) {
  const control =
    "min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 transition-colors hover:border-slate-500";

  return (
    <form action={action} className="mt-6 grid gap-5">
      <input name="tenantId" type="hidden" value={tenantId} />
      {contentId ? (
        <input name="contentId" type="hidden" value={contentId} />
      ) : null}
      <Field label="Título" name="title">
        <input
          className={control}
          defaultValue={initial?.title}
          maxLength={180}
          minLength={5}
          name="title"
          required
        />
      </Field>
      <Field label="Linha fina" name="subtitle">
        <textarea
          className={`${control} min-h-24 resize-y`}
          defaultValue={initial?.subtitle}
          maxLength={280}
          minLength={10}
          name="subtitle"
          required
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Autoria" name="authorId">
          <select
            className={control}
            defaultValue={initial?.authorId ?? ""}
            name="authorId"
            required
          >
            <option disabled value="">
              Selecione um autor
            </option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.display_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Editoria principal" name="categoryId">
          <select
            className={control}
            defaultValue={initial?.categoryId ?? ""}
            name="categoryId"
            required
          >
            <option disabled value="">
              Selecione uma editoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Imagem principal" name="imageMode">
          <select
            className={control}
            defaultValue={initial?.imageMode ?? "fallback"}
            name="imageMode"
            required
          >
            <option value="fallback">Asset editorial gerado</option>
            <option value="none">Sem imagem — exceção demonstrativa</option>
          </select>
        </Field>
        <Field label="Texto alternativo" name="imageAlt">
          <input
            className={control}
            defaultValue={
              initial?.imageAlt ??
              "Composição abstrata fictícia sobre saúde e longevidade."
            }
            maxLength={220}
            name="imageAlt"
          />
        </Field>
      </div>
      <p className="-mt-2 text-xs leading-5 text-slate-500">
        O texto alternativo é obrigatório quando o asset editorial está
        selecionado. A biblioteca avançada de mídia não faz parte do MVP-0.
      </p>
      <Field label="Corpo da matéria" name="body">
        <textarea
          className={`${control} min-h-64 resize-y leading-7`}
          defaultValue={initial?.body}
          maxLength={20_000}
          minLength={80}
          name="body"
          required
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="min-h-11 rounded-md bg-[#174a47] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0f3937]"
          type="submit"
        >
          {contentId ? "Salvar nova revisão" : "Criar rascunho"}
        </button>
        <Link
          className="min-h-11 rounded-md px-4 py-3 text-sm font-bold text-slate-600 no-underline hover:bg-slate-100"
          href={adminHref(tenantId)}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

async function loadAdminData(input: {
  editId?: string;
  requestedTenant?: string;
  status?: AdminContentStatus;
}) {
  try {
    const tenants = await listAdminTenants();
    const selectedTenant =
      tenants.find((tenant) => tenant.id === input.requestedTenant) ??
      tenants.find((tenant) => tenant.id === HORIZON_TENANT_ID) ??
      tenants[0];

    if (!selectedTenant) {
      return {
        description:
          "Nenhum tenant demonstrativo está disponível. Execute o seed idempotente antes de operar o CMS.",
        ok: false as const,
        title: "Catálogo sem tenants",
      };
    }

    const [items, options, editedItem] = await Promise.all([
      listAdminContent(selectedTenant.id, input.status),
      getAdminEditorOptions(selectedTenant.id),
      input.editId
        ? findOwnedContentItem(selectedTenant.id, input.editId)
        : null,
    ]);

    return {
      editedItem,
      items,
      ok: true as const,
      options,
      selectedTenant,
      tenants,
    };
  } catch (error) {
    const configurationError =
      error instanceof Error &&
      (error.message.startsWith("SUPABASE_URL") ||
        error.message.startsWith("SUPABASE_SECRET_KEY"));

    return {
      description: configurationError
        ? "Configure SUPABASE_URL e SUPABASE_SECRET_KEY no servidor para acessar o catálogo persistente."
        : "O banco não respondeu como esperado. Tente novamente; se o problema persistir, verifique os logs do servidor.",
      ok: false as const,
      title: configurationError
        ? "Conexão do catálogo indisponível"
        : "Catálogo temporariamente indisponível",
    };
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireDemoSession();

  const params = await searchParams;
  const requestedTenant = singleParam(params.tenant);
  const requestedStatus = singleParam(params.status);
  const status = isContentStatus(requestedStatus) ? requestedStatus : undefined;
  const editId = singleParam(params.edit);
  const mode = singleParam(params.mode);
  const success = singleParam(params.success);
  const errorNotice = singleParam(params.error);

  const loaded = await loadAdminData({ editId, requestedTenant, status });
  if (!loaded.ok) {
    return (
      <AdminUnavailable
        description={loaded.description}
        title={loaded.title}
      />
    );
  }

  const { editedItem, items, options, selectedTenant, tenants } = loaded;
  const showEditor = mode === "new" || Boolean(editedItem);
  const statusCounts = {
    draft: items.filter((item) => item.workflow_status === "draft").length,
    paused: items.filter((item) => item.workflow_status === "paused").length,
    published: items.filter((item) => item.workflow_status === "published")
      .length,
  };

  return (
      <main className="px-5 py-8 lg:px-8 lg:py-10" id="admin-main">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-300 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Operação editorial
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Conteúdo
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Crie revisões e controle a publicação do tenant selecionado.
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#13211f] px-4 py-2.5 text-sm font-bold text-white no-underline transition-colors hover:bg-[#23423d]"
              href={adminHref(selectedTenant.id, { mode: "new" })}
            >
              Nova matéria
            </Link>
          </div>

          <section
            aria-label="Escopo do catálogo"
            className="grid gap-4 border-b border-slate-300 py-6 md:grid-cols-[minmax(16rem,1fr)_minmax(16rem,1fr)_auto]"
          >
            <form className="contents" method="get">
              <label className="grid gap-2 text-sm font-bold">
                Tenant
                <select
                  className="min-h-11 rounded-md border border-slate-300 bg-white px-3"
                  defaultValue={selectedTenant.id}
                  name="tenant"
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.display_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Status
                <select
                  className="min-h-11 rounded-md border border-slate-300 bg-white px-3"
                  defaultValue={status ?? ""}
                  name="status"
                >
                  <option value="">Todos</option>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="paused">Pausado</option>
                </select>
              </label>
              <button
                className="min-h-11 self-end rounded-md border border-slate-400 bg-white px-4 text-sm font-bold transition-colors hover:bg-slate-50"
                type="submit"
              >
                Aplicar filtro
              </button>
            </form>
          </section>

          {success ? (
            <p
              className="mt-6 border-l-4 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950"
              role="status"
            >
              {success}
            </p>
          ) : null}
          {errorNotice ? (
            <p
              className="mt-6 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-950"
              role="alert"
            >
              {errorNotice}
            </p>
          ) : null}
          {editId && !editedItem ? (
            <p
              className="mt-6 border-l-4 border-amber-700 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
              role="alert"
            >
              A matéria não existe ou pertence a outro tenant.
            </p>
          ) : null}

          {showEditor ? (
            <section
              aria-labelledby="editor-title"
              className="border-b border-slate-300 py-8"
              id="editor"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#174a47]">
                {editedItem ? "Nova revisão" : "Novo conteúdo"}
              </p>
              <h2 className="mt-2 text-2xl font-bold" id="editor-title">
                {editedItem ? editedItem.revision?.title : "Criar matéria"}
              </h2>
              <EditorialForm
                action={
                  editedItem ? updateContentAction : createContentAction
                }
                authors={options.authors}
                categories={options.categories}
                contentId={editedItem?.id}
                initial={
                  editedItem?.revision
                    ? {
                        authorId: editedItem.authorId,
                        body: editedItem.revision.body_text,
                        categoryId: editedItem.categoryId,
                        imageAlt: editedItem.imageAlt,
                        imageMode: editedItem.imageMode,
                        subtitle: editedItem.revision.subtitle,
                        title: editedItem.revision.title,
                      }
                    : undefined
                }
                tenantId={selectedTenant.id}
              />
            </section>
          ) : null}

          <section aria-labelledby="conteudo-title" className="py-8" id="conteudo">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  {selectedTenant.display_name}
                </p>
                <h2 className="mt-2 text-xl font-bold" id="conteudo-title">
                  Matérias do tenant
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {status
                    ? `${items.length} item(ns) com status ${statusLabels[status].toLowerCase()}.`
                    : `${items.length} item(ns) persistidos neste catálogo.`}
                </p>
              </div>
              {!status ? (
                <dl className="flex gap-5 text-sm">
                  {(["published", "draft", "paused"] as const).map((key) => (
                    <div key={key}>
                      <dt className="text-slate-500">{statusLabels[key]}</dt>
                      <dd className="mt-1 text-lg font-bold">
                        {statusCounts[key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {items.length === 0 ? (
              <div className="mt-6 border-y border-slate-300 bg-white py-12 text-center">
                <h3 className="font-bold">Nenhuma matéria neste filtro</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ajuste o status ou crie um novo rascunho para este tenant.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto border-y border-slate-300 bg-white">
                <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold" scope="col">
                        Matéria
                      </th>
                      <th className="px-4 py-3 font-bold" scope="col">
                        Status
                      </th>
                      <th className="px-4 py-3 font-bold" scope="col">
                        Atualização
                      </th>
                      <th className="px-4 py-3 text-right font-bold" scope="col">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        className="border-t border-slate-200 align-top"
                        key={item.id}
                      >
                        <th className="max-w-xl px-4 py-4" scope="row">
                          <span className="block font-semibold">
                            {item.revision?.title ?? "Sem revisão"}
                          </span>
                          <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                            {item.revision?.subtitle}
                          </span>
                        </th>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              item.workflow_status === "published"
                                ? "bg-emerald-100 text-emerald-900"
                                : item.workflow_status === "paused"
                                  ? "bg-amber-100 text-amber-950"
                                  : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {
                              statusLabels[
                                item.workflow_status as AdminContentStatus
                              ]
                            }
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatUpdate(item.updated_at)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              className="min-h-10 rounded-md px-3 py-2 text-xs font-bold text-[#174a47] no-underline hover:bg-slate-100"
                              href={adminHref(selectedTenant.id, {
                                edit: item.id,
                                status,
                              })}
                            >
                              Editar
                            </Link>
                            {item.workflow_status === "draft" ? (
                              <StatusButton
                                action={publishContentAction}
                                contentId={item.id}
                                label="Publicar"
                                tenantId={selectedTenant.id}
                              />
                            ) : null}
                            {item.workflow_status === "paused" ? (
                              <StatusButton
                                action={resumeContentAction}
                                contentId={item.id}
                                label="Retomar"
                                tenantId={selectedTenant.id}
                              />
                            ) : null}
                          </div>
                          {item.workflow_status === "published" ? (
                            <details className="mt-2 text-right">
                              <summary className="cursor-pointer text-xs font-bold text-amber-800">
                                Pausar publicação
                              </summary>
                              <form
                                action={pauseContentAction}
                                className="ml-auto mt-3 grid max-w-xs gap-3 rounded-md bg-amber-50 p-3 text-left"
                              >
                                <input
                                  name="contentId"
                                  type="hidden"
                                  value={item.id}
                                />
                                <input
                                  name="tenantId"
                                  type="hidden"
                                  value={selectedTenant.id}
                                />
                                <label className="grid gap-1 text-xs font-bold">
                                  Motivo da pausa
                                  <textarea
                                    className="min-h-20 rounded-md border border-amber-300 bg-white p-2 text-sm"
                                    maxLength={500}
                                    minLength={8}
                                    name="reason"
                                    required
                                  />
                                </label>
                                <label className="flex items-start gap-2 text-xs font-semibold">
                                  <input
                                    className="mt-0.5 size-4"
                                    name="confirmPause"
                                    required
                                    type="checkbox"
                                    value="yes"
                                  />
                                  Confirmo que esta matéria sairá do portal.
                                </label>
                                <button
                                  className="min-h-10 rounded-md bg-amber-800 px-3 text-xs font-bold text-white hover:bg-amber-900"
                                  type="submit"
                                >
                                  Confirmar pausa
                                </button>
                              </form>
                            </details>
                          ) : null}
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

function StatusButton({
  action,
  contentId,
  label,
  tenantId,
}: {
  action: (formData: FormData) => Promise<void>;
  contentId: string;
  label: string;
  tenantId: string;
}) {
  return (
    <form action={action}>
      <input name="contentId" type="hidden" value={contentId} />
      <input name="tenantId" type="hidden" value={tenantId} />
      <button
        className="min-h-10 rounded-md bg-[#174a47] px-3 py-2 text-xs font-bold text-white hover:bg-[#0f3937]"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}

function AdminUnavailable({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <main className="grid min-h-[60vh] place-items-center px-5" id="admin-main">
      <div className="max-w-xl border-y border-slate-300 bg-white px-5 py-10 text-center sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
          Estado de erro
        </p>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </main>
  );
}
