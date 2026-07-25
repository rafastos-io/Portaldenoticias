import { saveThemeAction } from "@/app/admin/(protected)/actions";
import {
  APPROVED_CARDS,
  APPROVED_FONTS,
  APPROVED_HEADERS,
  APPROVED_HEROES,
  contrastRatio,
} from "@/lib/admin/theme-form";
import { requireDemoSession } from "@/lib/demo-auth/server";
import { listAdminTenants } from "@/lib/supabase/content-repository";
import { getAdminTheme } from "@/lib/supabase/theme-repository";

const HORIZON_TENANT_ID = "00000000-0000-4000-8000-000000000002";
const control =
  "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const labels = {
  card: {
    "compact-horizontal": "Lista horizontal compacta",
    "data-led": "Cartão orientado a dados",
    "image-top": "Imagem no topo",
  },
  font: {
    "sans-editorial": "Editorial",
    "sans-geometrica": "Geométrica",
    "sans-humana": "Humana",
  },
  header: {
    "brand-centered": "Marca centralizada",
    "masthead-clean": "Masthead editorial",
    "masthead-minimal": "Cabeçalho mínimo",
  },
  hero: {
    "featured-grid": "Grade de destaques",
    "science-feature": "Destaque científico",
    "split-editorial": "Editorial dividido",
  },
} as const;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function ContrastScore({
  foreground,
  background,
  label,
}: {
  foreground: string;
  background: string;
  label: string;
}) {
  const ratio = contrastRatio(foreground, background);
  const approved = ratio >= 4.5;

  return (
    <div className="border-l-2 border-slate-300 pl-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-bold">
        {ratio.toFixed(2)}:1 · {approved ? "Aprovado AA" : "Revisar"}
      </dd>
    </div>
  );
}

function ColorField({
  defaultValue,
  label,
  name,
}: {
  defaultValue: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <span className="flex min-h-11 items-center gap-3 rounded-md border border-slate-300 bg-white px-2">
        <input
          aria-label={`${label}: seletor de cor`}
          className="size-8 cursor-pointer border-0 bg-transparent p-0"
          defaultValue={defaultValue}
          name={name}
          type="color"
        />
        <span className="font-mono text-xs font-normal text-slate-600">
          {defaultValue}
        </span>
      </span>
    </label>
  );
}

function PortalPreview({
  height,
  tenantSlug,
  width,
}: {
  height: number;
  tenantSlug: string;
  width: number;
}) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
      <iframe
        className="block max-w-none border-0"
        height={height}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox=""
        src={`/?tenant=${encodeURIComponent(tenantSlug)}`}
        title={`Portal público real de ${tenantSlug} em ${width} pixels`}
        width={width}
      />
    </div>
  );
}

async function loadIdentity(requestedTenant?: string) {
  try {
    const tenants = await listAdminTenants();
    const selectedTenant =
      tenants.find((tenant) => tenant.id === requestedTenant) ??
      tenants.find((tenant) => tenant.id === HORIZON_TENANT_ID) ??
      tenants[0];

    if (!selectedTenant) {
      return {
        description:
          "Nenhum tenant demonstrativo está disponível. Execute o seed idempotente.",
        ok: false as const,
        title: "Central sem tenants",
      };
    }

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
  const loaded = await loadIdentity(single(params.tenant));

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
            Ajuste campos seguros e variantes aprovadas. Esta demonstração não
            aceita CSS, JavaScript ou uploads de código.
          </p>
        </header>

        <section className="border-b border-slate-300 py-6">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get">
            <label className="grid flex-1 gap-2 text-sm font-bold">
              Tenant
              <select
                className={control}
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
            <button
              className="min-h-11 rounded-md border border-slate-400 bg-white px-4 text-sm font-bold hover:bg-slate-50"
              type="submit"
            >
              Trocar identidade
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
        {error ? (
          <p
            className="mt-6 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-950"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="grid gap-10 py-8 xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
          <section aria-labelledby="identity-form-title" id="identidade">
            <h2 className="text-xl font-bold" id="identity-form-title">
              Campos da marca
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O logo do MVP-0 é um wordmark textual. Todas as escolhas abaixo
              são validadas novamente no servidor.
            </p>

            <form
              action={saveThemeAction}
              className="mt-6 grid gap-6 rounded-lg border border-slate-300 bg-white p-5"
            >
              <input name="tenantId" type="hidden" value={selectedTenant.id} />
              <label className="grid gap-2 text-sm font-bold">
                Nome / logo textual
                <input
                  className={control}
                  defaultValue={theme.brandName}
                  maxLength={120}
                  minLength={2}
                  name="brandName"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Slogan
                <input
                  className={control}
                  defaultValue={theme.slogan}
                  maxLength={160}
                  minLength={2}
                  name="slogan"
                  required
                />
              </label>

              <fieldset>
                <legend className="text-sm font-bold">Paleta</legend>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <ColorField
                    defaultValue={theme.primary}
                    label="Primária"
                    name="primary"
                  />
                  <ColorField
                    defaultValue={theme.secondary}
                    label="Secundária"
                    name="secondary"
                  />
                  <ColorField
                    defaultValue={theme.accent}
                    label="Acento"
                    name="accent"
                  />
                  <ColorField
                    defaultValue={theme.background}
                    label="Fundo"
                    name="background"
                  />
                  <ColorField
                    defaultValue={theme.textColor}
                    label="Texto"
                    name="textColor"
                  />
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-bold">
                  Variantes aprovadas
                </legend>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <SelectField
                    defaultValue={theme.font}
                    label="Tipografia"
                    labels={labels.font}
                    name="font"
                    options={APPROVED_FONTS}
                  />
                  <SelectField
                    defaultValue={theme.header}
                    label="Cabeçalho"
                    labels={labels.header}
                    name="header"
                    options={APPROVED_HEADERS}
                  />
                  <SelectField
                    defaultValue={theme.hero}
                    label="Destaque"
                    labels={labels.hero}
                    name="hero"
                    options={APPROVED_HEROES}
                  />
                  <SelectField
                    defaultValue={theme.card}
                    label="Cartões"
                    labels={labels.card}
                    name="card"
                    options={APPROVED_CARDS}
                  />
                </div>
              </fieldset>

              <button
                className="min-h-11 rounded-md bg-[#174a47] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f3937]"
                type="submit"
              >
                Salvar identidade
              </button>
            </form>
          </section>

          <section aria-labelledby="preview-title" className="min-w-0">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-bold" id="preview-title">
                  Preview salvo
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Recarrega após salvar e representa a versão vigente.
                </p>
              </div>
              <dl className="flex flex-wrap gap-5">
                <ContrastScore
                  background="#FFFFFF"
                  foreground={theme.primary}
                  label="Primária + branco"
                />
                <ContrastScore
                  background={theme.background}
                  foreground={theme.primary}
                  label="Primária + fundo"
                />
                <ContrastScore
                  background={theme.background}
                  foreground={theme.textColor}
                  label="Texto + fundo"
                />
              </dl>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Desktop · 1440 px
              </p>
              <div className="overflow-x-auto pb-3">
                <PortalPreview
                  height={620}
                  tenantSlug={selectedTenant.slug}
                  width={1440}
                />
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Mobile · 390 px
              </p>
              <PortalPreview
                height={680}
                tenantSlug={selectedTenant.slug}
                width={390}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SelectField<T extends readonly string[]>({
  defaultValue,
  label,
  labels: optionLabels,
  name,
  options,
}: {
  defaultValue: string;
  label: string;
  labels: Readonly<Record<string, string>>;
  name: string;
  options: T;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <select className={control} defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
