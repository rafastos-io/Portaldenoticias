"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import {
  saveThemeAction,
  uploadThemeLogoAction,
} from "@/app/admin/(protected)/actions";
import { TenantMutationForm } from "@/components/admin/tenant-mutation-form";
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

const control =
  "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950";

const labels = {
  font: {
    "sans-editorial": "Editorial",
    "sans-geometrica": "Geométrica",
    "sans-humana": "Humana",
  },
} as const;

type PreviewPage = "home" | "editoria" | "materia";
type PreviewWidth = 390 | 768 | 1440;

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
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>(1440);

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
          <LivePortalPreview
            logoUrl={logoPreview}
            page={previewPage}
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

function LivePortalPreview({
  logoUrl,
  page,
  theme,
  width,
}: {
  logoUrl: string | null;
  page: PreviewPage;
  theme: ThemeValues;
  width: PreviewWidth;
}) {
  const compact = width === 390;
  const font =
    theme.font === "sans-editorial"
      ? "Georgia, 'Times New Roman', serif"
      : theme.font === "sans-humana"
        ? "'Trebuchet MS', Arial, sans-serif"
        : "Arial, Helvetica, sans-serif";
  const style = {
    "--preview-accent": theme.accent,
    "--preview-background": theme.background,
    "--preview-primary": theme.primary,
    "--preview-secondary": theme.secondary,
    "--preview-text": theme.textColor,
    color: theme.textColor,
    fontFamily: font,
    maxWidth: `${width}px`,
  } as CSSProperties;

  return (
    <div
      className="mx-auto min-h-[38rem] overflow-hidden bg-[var(--preview-background)] shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
      style={style}
    >
      <div className="h-1.5 bg-[var(--preview-primary)]" />
      <header
        className={`border-b border-black/15 px-5 py-4 ${
          theme.header === "brand-centered"
            ? "text-center"
            : "flex items-center justify-between"
        }`}
      >
        <div>
          {logoUrl ? (
            <div className="relative h-9 w-40">
              <Image
                alt={theme.logoAlt || theme.brandName}
                className="object-contain object-left"
                fill
                sizes="160px"
                src={logoUrl}
                unoptimized
              />
            </div>
          ) : (
            <p
              className={`font-black tracking-[-0.04em] text-[var(--preview-primary)] ${
                compact ? "text-xl" : "text-3xl"
              }`}
            >
              {theme.brandName}
            </p>
          )}
          {theme.header !== "masthead-minimal" ? (
            <p className="mt-1 text-[10px] opacity-65">{theme.slogan}</p>
          ) : null}
        </div>
        {theme.header !== "brand-centered" && !compact ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
            Saúde · Economia · Longevidade
          </p>
        ) : null}
      </header>
      <nav className="flex gap-5 overflow-hidden border-b border-black/15 px-5 py-3 text-[10px] font-bold uppercase tracking-wide">
        <span>Destaques</span>
        <span>Economia</span>
        <span>Inovação</span>
        <span>Previdência</span>
      </nav>

      {page === "home" ? (
        <PreviewHome compact={compact} theme={theme} />
      ) : page === "editoria" ? (
        <PreviewCategory compact={compact} />
      ) : (
        <PreviewArticle compact={compact} />
      )}
    </div>
  );
}

function PreviewHome({
  compact,
  theme,
}: {
  compact: boolean;
  theme: ThemeValues;
}) {
  const gridHero = theme.hero === "featured-grid";
  return (
    <div className="p-5 sm:p-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--preview-primary)]">
        Longevidade &amp; Economia
      </p>
      <div
        className={`mt-3 grid gap-4 ${
          !compact && gridHero ? "grid-cols-[1.2fr_0.8fr]" : ""
        }`}
      >
        <div
          className={`${
            theme.hero === "science-feature"
              ? "border-t-4 border-[var(--preview-accent)] pt-4"
              : ""
          }`}
        >
          <h3
            className={`max-w-3xl font-black leading-[0.96] tracking-[-0.045em] text-[var(--preview-primary)] ${
              compact ? "text-4xl" : "text-6xl"
            }`}
          >
            Novas escolhas redesenham o futuro da longevidade
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-6 opacity-75">
            Economia, ciência e proteção ganham uma leitura editorial clara,
            visual e orientada a contexto.
          </p>
        </div>
        {gridHero && !compact ? (
          <div className="grid gap-3">
            <div className="min-h-28 bg-[var(--preview-secondary)] p-4 text-white">
              <p className="text-lg font-bold">Tecnologia amplia acesso ao cuidado</p>
            </div>
            <div className="min-h-28 bg-[var(--preview-primary)] p-4 text-white">
              <p className="text-lg font-bold">Planejamento muda com novas gerações</p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-8 border-t border-black/20">
        {[
          "Prevenção vira estratégia para empresas e famílias",
          "Biotecnologia aproxima pesquisa e novos negócios",
          "Carreiras mais longas exigem outras formas de planejar",
        ].map((title, index) => (
          <div
            className={`border-b border-black/15 py-4 ${
              theme.card === "compact-horizontal"
                ? "grid grid-cols-[1.5rem_1fr] gap-3"
                : ""
            }`}
            key={title}
          >
            <span className="text-[10px] opacity-45">0{index + 1}</span>
            <p className={`${compact ? "text-lg" : "text-xl"} font-bold leading-tight`}>
              {title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewCategory({ compact }: { compact: boolean }) {
  return (
    <div className="p-5 sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--preview-primary)]">
        Editoria
      </p>
      <h3
        className={`mt-3 font-black tracking-[-0.04em] text-[var(--preview-primary)] ${
          compact ? "text-4xl" : "text-6xl"
        }`}
      >
        Longevidade &amp; Economia
      </h3>
      <div className="mt-7 border-t border-black/20">
        {[
          "A nova economia de uma vida mais longa",
          "Proteção financeira ganha outras camadas",
          "Consumo maduro impulsiona serviços especializados",
          "Mobilidade entra no planejamento familiar",
        ].map((title) => (
          <article className="border-b border-black/15 py-5" key={title}>
            <p className="text-[10px] font-bold uppercase text-[var(--preview-primary)]">
              Análise
            </p>
            <h4 className={`${compact ? "text-xl" : "text-2xl"} mt-2 font-bold`}>
              {title}
            </h4>
          </article>
        ))}
      </div>
    </div>
  );
}

function PreviewArticle({ compact }: { compact: boolean }) {
  return (
    <article className="p-5 sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--preview-primary)]">
        Análise
      </p>
      <h3
        className={`mt-3 max-w-4xl font-black leading-[0.98] tracking-[-0.045em] text-[var(--preview-primary)] ${
          compact ? "text-4xl" : "text-6xl"
        }`}
      >
        Longevidade amplia o horizonte das decisões econômicas
      </h3>
      <p className="mt-5 max-w-3xl text-base leading-7 opacity-70">
        Mudanças demográficas aproximam saúde, patrimônio, trabalho e inovação.
      </p>
      <p className="mt-5 text-xs font-bold">Por Marina Vale · 27 jul 2026</p>
      <div className="mt-8 max-w-2xl space-y-4 text-sm leading-7">
        <p>
          Viver mais altera a sequência das decisões e amplia a importância de
          escolhas que possam ser revistas ao longo do tempo.
        </p>
        <p>
          O movimento também cria oportunidades para serviços mais claros,
          inclusivos e conectados às diferentes fases da vida adulta.
        </p>
      </div>
    </article>
  );
}
