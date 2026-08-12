import { cookies } from "next/headers";

import { createIdentityAction } from "@/app/admin/(protected)/actions";
import { IdentityWorkbench } from "@/components/admin/identity-workbench";
import { TenantMutationForm } from "@/components/admin/tenant-mutation-form";
import {
  ADMIN_TENANT_COOKIE,
  resolveAdminTenant,
} from "@/lib/admin/tenant-context";
import { requireDemoSession } from "@/lib/demo-auth/server";
import { listAdminTenants } from "@/lib/supabase/content-repository";
import { getAdminTheme } from "@/lib/supabase/theme-repository";
import { SITE_MODELS, SITE_MODEL_IDS } from "@/lib/presentation/site-models";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function loadIdentity(
  requestedTenant?: string,
  cookieTenant?: string,
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
          ? "Central sem tenants"
          : "Contexto de tenant inválido",
      };
    }
    const selectedTenant = resolution.tenant;

    const theme = await getAdminTheme(selectedTenant.id);
    if (!theme) {
      return {
        description:
          "O tenant selecionado ainda não possui uma identidade publicada.",
        ok: false as const,
        title: "Identidade não encontrada",
      };
    }

    return { ok: true as const, selectedTenant, tenants, theme };
  } catch (error) {
    const configurationError =
      error instanceof Error &&
      (error.message.startsWith("SUPABASE_URL") ||
        error.message.startsWith("SUPABASE_SECRET_KEY"));
    return {
      description: configurationError
        ? "Configure SUPABASE_URL e SUPABASE_SECRET_KEY somente no servidor para acessar as identidades persistidas."
        : "O banco não respondeu como esperado. Tente novamente e verifique os logs do servidor.",
      ok: false as const,
      title: configurationError
        ? "Conexão da identidade indisponível"
        : "Identidade temporariamente indisponível",
    };
  }
}

export default async function IdentityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireDemoSession();

  const params = await searchParams;
  const cookieStore = await cookies();
  const loaded = await loadIdentity(
    single(params.tenant),
    cookieStore.get(ADMIN_TENANT_COOKIE)?.value,
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

  const { selectedTenant, tenants, theme } = loaded;
  const success = single(params.success);
  const error = single(params.error);

  return (
    <main className="px-5 py-8 lg:px-8 lg:py-10" id="admin-main">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-300 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Central white-label
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Identidade visual
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Ajuste a marca e veja a composição mudar em tempo real. Somente
            tokens e variantes aprovados podem ser salvos.
          </p>
        </header>

        {success ? (
          <p
            className="mt-6 border-l-4 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950"
            role="status"
          >
            {success}
          </p>
        ) : null}
        {error ? (
          <p
            className="mt-6 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-950"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <details
          className="mt-8 border-y border-slate-300 bg-white py-5"
          id="nova-identidade"
        >
          <summary className="cursor-pointer text-lg font-bold">
            Cadastrar nova identidade visual
          </summary>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Cria uma nova marca demonstrativa a partir da composição atual,
            reaproveitando referências editoriais sem duplicar matérias.
          </p>
          <TenantMutationForm
            action={createIdentityAction}
            className="mt-5 grid max-w-3xl gap-4 sm:grid-cols-2"
            tenantId={selectedTenant.id}
          >
            <input name="tenantId" type="hidden" value={selectedTenant.id} />
            <label className="grid gap-2 text-sm font-bold">
              Nome da nova marca
              <input
                className="min-h-11 border border-slate-300 bg-white px-3"
                maxLength={120}
                minLength={2}
                name="brandName"
                placeholder="Ex.: Vértice Longevidade"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Slug público
              <input
                className="min-h-11 border border-slate-300 bg-white px-3 font-mono text-sm"
                maxLength={80}
                name="slug"
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="vertice-longevidade"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Slogan
              <input
                className="min-h-11 border border-slate-300 bg-white px-3"
                maxLength={160}
                minLength={2}
                name="slogan"
                placeholder="Informação para escolhas que atravessam gerações"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Modelo de site
              <select
                className="min-h-11 border border-slate-300 bg-white px-3"
                defaultValue="financial-services-credit"
                name="siteModel"
                required
              >
                {SITE_MODEL_IDS.map((siteModel) => (
                  <option key={siteModel} value={siteModel}>
                    {SITE_MODELS[siteModel].label}
                  </option>
                ))}
              </select>
              <span className="font-normal leading-5 text-slate-500">
                Escolha a estrutura do segmento antes de personalizar a marca.
              </span>
            </label>
            <p className="text-xs leading-5 text-slate-500">
              Preset: {selectedTenant.display_name}. Há {tenants.length}{" "}
              identidades disponíveis neste ambiente.
            </p>
            <button
              className="min-h-11 bg-slate-950 px-5 text-sm font-bold text-white sm:justify-self-end"
              type="submit"
            >
              Criar identidade
            </button>
          </TenantMutationForm>
        </details>

        <IdentityWorkbench
          initialTheme={theme}
          tenantId={selectedTenant.id}
          tenantSlug={selectedTenant.slug}
        />
      </div>
    </main>
  );
}
