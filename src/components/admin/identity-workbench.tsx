"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  saveThemeAction,
  uploadThemeLogoAction,
} from "@/app/admin/(protected)/actions";
import { TenantMutationForm } from "@/components/admin/tenant-mutation-form";
import { IdentityPortalPreviewFrame } from "@/components/admin/identity-portal-preview-frame";
import {
  APPROVED_FONTS,
  contrastRatio,
  MAX_THEME_LOGO_BYTES,
  type ThemeValues,
} from "@/lib/admin/theme-form";
import {
  getSiteModelDefinition,
  SITE_MODELS,
  SITE_MODEL_IDS,
  type SiteModelId,
} from "@/lib/presentation/site-models";
import type {
  PortalPreviewPage,
  PortalPreviewWidth,
} from "@/lib/presentation/portal-preview";

const control =
  "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950";

const labels = {
  font: {
    "sans-editorial": "Editorial",
    "sans-geometrica": "Geométrica",
    "sans-humana": "Humana",
  },
} as const;

type IdentityWorkbenchProps = {
  initialTheme: ThemeValues;
  tenantId: string;
  tenantSlug: string;
};

export function IdentityWorkbench({
  initialTheme,
  tenantId,
  tenantSlug,
}: IdentityWorkbenchProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [logoPreview, setLogoPreview] = useState(initialTheme.logoUrl);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<PortalPreviewPage>("home");
  const [previewWidth, setPreviewWidth] =
    useState<PortalPreviewWidth>(1440);

  const changed = useMemo(
    () => JSON.stringify(theme) !== JSON.stringify(initialTheme),
    [initialTheme, theme],
  );
  const scores = [
    {
      label: "Primária + branco",
      value: contrastRatio(theme.primary, "#FFFFFF"),
    },
    {
      label: "Primária + fundo",
      value: contrastRatio(theme.primary, theme.background),
    },
    {
      label: "Texto + fundo",
      value: contrastRatio(theme.textColor, theme.background),
    },
  ];
  const allApproved = scores.every((score) => score.value >= 4.5);

  function update<K extends keyof ThemeValues>(
    key: K,
    value: ThemeValues[K],
  ) {
    setTheme((current) => ({ ...current, [key]: value }));
  }

  function updateSiteModel(siteModel: SiteModelId) {
    const composition = getSiteModelDefinition(siteModel).composition;
    setTheme((current) => ({
      ...current,
      ...composition,
      siteModel,
    }));
  }

  return (
    <div className="grid gap-8 py-8 xl:grid-cols-[minmax(21rem,0.72fr)_minmax(0,1.28fr)]">
      <section aria-labelledby="identity-form-title" id="identidade">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" id="identity-form-title">
              Campos da marca
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Edite e acompanhe o resultado antes de salvar.
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-bold ${
              changed ? "text-amber-700" : "text-emerald-700"
            }`}
            role="status"
          >
            {changed ? "Alterações pendentes" : "Versão salva"}
          </span>
        </div>

        <TenantMutationForm
          action={uploadThemeLogoAction}
          className="mt-6 grid gap-4 border-y border-slate-200 py-5"
          tenantId={tenantId}
        >
          <input name="tenantId" type="hidden" value={tenantId} />
          <div className="flex items-center gap-4">
            <div className="relative grid h-16 w-36 shrink-0 place-items-center overflow-hidden bg-slate-100">
              {logoPreview ? (
                <Image
                  alt={theme.logoAlt || "Preview do logo"}
                  className="object-contain p-2"
                  fill
                  sizes="144px"
                  src={logoPreview}
                  unoptimized
                />
              ) : (
                <span className="text-xs font-bold text-slate-500">Sem logo</span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold" id="logo">
                Logo da marca
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                PNG ou JPEG, até 2 MB. O arquivo fica isolado por tenant.
              </p>
            </div>
          </div>
          <label className="grid gap-2 text-sm font-bold">
            Arquivo
            <input
              accept="image/png,image/jpeg"
              className="block w-full text-sm file:mr-3 file:min-h-10 file:border-0 file:bg-slate-950 file:px-4 file:text-xs file:font-bold file:text-white"
              name="logo"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > MAX_THEME_LOGO_BYTES) {
                  event.currentTarget.value = "";
                  setLogoPreview(initialTheme.logoUrl);
                  setLogoError("O logo deve ter no máximo 2 MB.");
                  return;
                }
                setLogoError(null);
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                  if (typeof reader.result === "string") {
                    setLogoPreview(reader.result);
                  }
                });
                reader.readAsDataURL(file);
              }}
              required
              type="file"
            />
          </label>
          {logoError ? (
            <p className="text-sm font-semibold text-red-700" role="alert">
              {logoError}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Texto alternativo
              <input
                className={control}
                defaultValue={theme.logoAlt}
                maxLength={180}
                minLength={2}
                name="logoAlt"
                placeholder="Logo da marca"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Crédito / origem
              <input
                className={control}
                defaultValue="Asset original da demonstração"
                maxLength={160}
                minLength={2}
                name="logoCredit"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Base de uso
              <select
                className={control}
                defaultValue="demo-original"
                name="logoRightsBasis"
                required
              >
                <option value="demo-original">
                  Asset original da demonstração
                </option>
                <option value="authorized-brand-validation">
                  Marca autorizada para validação
                </option>
              </select>
            </label>
          </div>
          <button
            className="min-h-11 w-fit bg-slate-950 px-5 text-sm font-bold text-white"
            disabled={Boolean(logoError)}
            type="submit"
          >
            Salvar logo
          </button>
        </TenantMutationForm>

        <TenantMutationForm
          action={saveThemeAction}
          className="mt-6 grid gap-6 border-t border-slate-300 bg-white pt-6"
          tenantId={tenantId}
        >
          <input name="tenantId" type="hidden" value={tenantId} />
          <label className="grid gap-2 text-sm font-bold">
            Nome da marca
            <input
              className={control}
              maxLength={120}
              minLength={2}
              name="brandName"
              onChange={(event) => update("brandName", event.target.value)}
              required
              value={theme.brandName}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Slogan
            <input
              className={control}
              maxLength={160}
              minLength={2}
              name="slogan"
              onChange={(event) => update("slogan", event.target.value)}
              required
              value={theme.slogan}
            />
          </label>

          <fieldset>
            <legend className="text-sm font-bold">Paleta</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Primária"
                name="primary"
                onChange={(value) => update("primary", value)}
                value={theme.primary}
              />
              <ColorField
                label="Secundária"
                name="secondary"
                onChange={(value) => update("secondary", value)}
                value={theme.secondary}
              />
              <ColorField
                label="Acento"
                name="accent"
                onChange={(value) => update("accent", value)}
                value={theme.accent}
              />
              <ColorField
                label="Fundo"
                name="background"
                onChange={(value) => update("background", value)}
                value={theme.background}
              />
              <ColorField
                label="Texto"
                name="textColor"
                onChange={(value) => update("textColor", value)}
                value={theme.textColor}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold">
              Modelo de site do segmento
            </legend>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              O modelo define a composição coerente de cabeçalho, destaque e
              listas. A marca continua controlando nome, paleta e tipografia.
            </p>
            <div className="mt-4 grid gap-3">
              {SITE_MODEL_IDS.map((siteModel) => {
                const definition = SITE_MODELS[siteModel];
                const selected = theme.siteModel === siteModel;
                return (
                  <label
                    className={`grid cursor-pointer grid-cols-[1.25rem_1fr] gap-3 border p-4 transition-colors ${
                      selected
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-500"
                    }`}
                    key={siteModel}
                  >
                    <input
                      checked={selected}
                      className="mt-1"
                      name="siteModel"
                      onChange={() => updateSiteModel(siteModel)}
                      required
                      type="radio"
                      value={siteModel}
                    />
                    <span>
                      <strong className="block text-sm">
                        {definition.label}
                      </strong>
                      <span
                        className={`mt-1 block text-xs leading-5 ${
                          selected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {definition.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold">Tipografia da marca</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Tipografia"
                labels={labels.font}
                name="font"
                onChange={(value) => update("font", value)}
                options={APPROVED_FONTS}
                value={theme.font}
              />
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button
              className="min-h-11 bg-[#174a47] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f3937] disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={!changed || !allApproved}
              type="submit"
            >
              Salvar identidade
            </button>
            <button
              className="min-h-11 border border-slate-400 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              disabled={!changed}
              onClick={() => setTheme(initialTheme)}
              type="button"
            >
              Desfazer
            </button>
          </div>
        </TenantMutationForm>
      </section>

      <section aria-labelledby="preview-title" className="min-w-0">
        <div className="flex flex-col gap-5 border-b border-slate-300 pb-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold" id="preview-title">
                Preview ao vivo
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                O preview usa somente os valores aprovados do formulário.
              </p>
            </div>
            <a
              className="text-sm font-bold text-slate-800"
              href={`/?tenant=${encodeURIComponent(tenantSlug)}`}
              rel="noreferrer"
              target="_blank"
            >
              Abrir portal salvo
            </a>
          </div>

          <div className="flex flex-wrap justify-between gap-4">
            <div aria-label="Página do preview" className="flex flex-wrap gap-2">
              {(["home", "editoria", "materia"] as const).map((page) => (
                <button
                  aria-pressed={previewPage === page}
                  className={`min-h-10 border px-3 text-xs font-bold uppercase tracking-wide ${
                    previewPage === page
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                  key={page}
                  onClick={() => setPreviewPage(page)}
                  type="button"
                >
                  {page === "materia" ? "Matéria" : page}
                </button>
              ))}
            </div>
            <div aria-label="Largura do preview" className="flex gap-2">
              {([390, 768, 1440] as const).map((width) => (
                <button
                  aria-pressed={previewWidth === width}
                  className={`min-h-10 border px-3 text-xs font-bold ${
                    previewWidth === width
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                  key={width}
                  onClick={() => setPreviewWidth(width)}
                  type="button"
                >
                  {width}
                </button>
              ))}
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            {scores.map((score) => (
              <div className="border-l-2 border-slate-300 pl-3" key={score.label}>
                <dt className="text-xs text-slate-500">{score.label}</dt>
                <dd
                  className={`mt-1 text-sm font-bold ${
                    score.value >= 4.5 ? "text-emerald-800" : "text-red-700"
                  }`}
                >
                  {score.value.toFixed(2)}:1 ·{" "}
                  {score.value >= 4.5 ? "AA" : "Revisar"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 overflow-x-auto bg-slate-100 p-3 sm:p-5">
          <IdentityPortalPreviewFrame
            logoUrl={logoPreview}
            page={previewPage}
            tenantId={tenantId}
            tenantSlug={tenantSlug}
            theme={theme}
            width={previewWidth}
          />
        </div>
      </section>
    </div>
  );
}

function ColorField({
  label,
  name,
  onChange,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <span className="grid min-h-11 grid-cols-[2.5rem_1fr] items-center gap-2 border border-slate-300 bg-white px-2">
        <input
          aria-label={`${label}: seletor de cor`}
          className="size-8 cursor-pointer border-0 bg-transparent p-0"
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
        />
        <input
          aria-label={`${label}: hexadecimal`}
          className="min-w-0 border-0 bg-transparent font-mono text-xs font-normal uppercase outline-none"
          maxLength={7}
          name={name}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          pattern="^#[0-9A-Fa-f]{6}$"
          required
          value={value}
        />
      </span>
    </label>
  );
}

function SelectField<T extends readonly string[]>({
  label,
  labels: optionLabels,
  name,
  onChange,
  options,
  value,
}: {
  label: string;
  labels: Readonly<Record<string, string>>;
  name: string;
  onChange: (value: T[number]) => void;
  options: T;
  value: T[number];
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <select
        className={control}
        name={name}
        onChange={(event) => onChange(event.target.value as T[number])}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
