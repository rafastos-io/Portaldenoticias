"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

type FontScale = "default" | "large" | "xlarge";
type Preferences = {
  contrast: boolean;
  font: FontScale;
  reducedMotion: boolean;
};

const STORAGE_KEY = "broadcast:a11y:v1";
const PREFERENCES_EVENT = "broadcast:a11y-change";
const DEFAULT_PREFERENCES: Preferences = {
  contrast: false,
  font: "default",
  reducedMotion: false,
};

function applyPreferences(preferences: Preferences) {
  const root = document.documentElement;
  root.dataset.a11yContrast = preferences.contrast ? "high" : "default";
  root.dataset.a11yFont = preferences.font;
  root.dataset.a11yMotion = preferences.reducedMotion ? "reduced" : "default";
}

function readPreferences(value: string | null): Preferences {
  try {
    const saved = JSON.parse(value ?? "null");
    return {
      contrast: saved?.contrast === true,
      font: ["default", "large", "xlarge"].includes(saved?.font)
        ? saved.font
        : "default",
      reducedMotion: saved?.reducedMotion === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREFERENCES_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREFERENCES_EVENT, onChange);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

export function AccessibilityControls({
  variant = "bar",
}: {
  /** "bar" renders its own strip; "inline" is embedded in a model header. */
  variant?: "bar" | "inline";
} = {}) {
  const storedPreferences = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const preferences = useMemo(
    () => readPreferences(storedPreferences),
    [storedPreferences],
  );

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  function update(next: Preferences) {
    applyPreferences(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // O ajuste ainda funciona durante a sessão quando o storage é bloqueado.
    }
    window.dispatchEvent(new Event(PREFERENCES_EVENT));
  }

  const announcement = `Texto ${
    preferences.font === "default"
      ? "padrão"
      : preferences.font === "large"
        ? "grande"
        : "muito grande"
  }; alto contraste ${preferences.contrast ? "ativo" : "inativo"}; animações ${
    preferences.reducedMotion ? "reduzidas" : "padrão"
  }.`;

  const panel = (
        <details className="relative">
          <summary
            className={
              variant === "inline"
                ? "flex min-h-10 min-w-10 cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-white/35 px-2.5 sm:px-4 text-sm font-bold text-white transition-colors hover:bg-white hover:text-brand-primary"
                : "cursor-pointer list-none rounded-sm px-3 py-2 text-sm font-bold text-brand-primary underline underline-offset-4"
            }
          >
            {variant === "inline" ? (
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                focusable="false"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="4.5" r="1.8" />
                <path d="M5 8.5 12 10l7-1.5M12 10v4.5M9 21l3-6.5 3 6.5" />
              </svg>
            ) : null}
            {variant === "inline" ? (
              <span className="sr-only sm:not-sr-only">Acessibilidade</span>
            ) : (
              "Acessibilidade"
            )}
          </summary>
          <div className="absolute right-0 z-50 mt-1 w-[min(22rem,calc(100vw-2rem))] border border-border-subtle bg-surface-raised p-4 text-text-primary shadow-lg">
            <p className="font-bold">Preferências de leitura</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Ajustes gratuitos salvos somente neste navegador.
            </p>
            <fieldset className="mt-4">
              <legend className="text-sm font-bold">Tamanho do texto</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {([
                  ["default", "Padrão"],
                  ["large", "Grande"],
                  ["xlarge", "Muito grande"],
                ] as const).map(([value, label]) => (
                  <button
                    aria-pressed={preferences.font === value}
                    className="min-h-11 border border-brand-primary px-3 text-sm font-bold aria-pressed:bg-brand-primary aria-pressed:text-text-on-brand"
                    key={value}
                    onClick={() => update({ ...preferences, font: value })}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 grid gap-2">
              <button
                aria-pressed={preferences.contrast}
                className="min-h-11 border border-brand-primary px-3 text-left text-sm font-bold aria-pressed:bg-brand-primary aria-pressed:text-text-on-brand"
                onClick={() =>
                  update({ ...preferences, contrast: !preferences.contrast })
                }
                type="button"
              >
                Alto contraste
              </button>
              <button
                aria-pressed={preferences.reducedMotion}
                className="min-h-11 border border-brand-primary px-3 text-left text-sm font-bold aria-pressed:bg-brand-primary aria-pressed:text-text-on-brand"
                onClick={() =>
                  update({
                    ...preferences,
                    reducedMotion: !preferences.reducedMotion,
                  })
                }
                type="button"
              >
                Reduzir animações
              </button>
            </div>
            <p aria-live="polite" className="sr-only">
              {announcement}
            </p>
          </div>
        </details>
  );

  if (variant === "inline") return panel;

  return (
    <div className="border-b border-border-subtle bg-surface-raised">
      <div className="page-container flex min-h-11 items-center justify-end py-1">
        {panel}
      </div>
    </div>
  );
}
