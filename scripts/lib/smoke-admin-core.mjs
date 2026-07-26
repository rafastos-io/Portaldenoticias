import { mkdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

export const DEMO_NOTICE =
  "Modo demonstração - autenticação real desativada";
export const PRODUCTION_BASE_URL =
  "https://portaldenoticias-five.vercel.app";
export const SESSION_COOKIE = "broadcast_demo_session";

const SENSITIVE_QUERY_PARAMETERS = [
  "x-vercel-protection-bypass",
  "_vercel_share",
];

function readOptionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`A opção ${option} exige um valor.`);
  }
  return value;
}

export function parseSmokeArguments(argv, environment = process.env) {
  const options = {
    accessUrl: environment.SMOKE_ACCESS_URL || "",
    artifactsDir:
      environment.SMOKE_ARTIFACTS_DIR || "artifacts/smoke-admin",
    baseUrl: environment.SMOKE_BASE_URL || "",
    browserChannel: environment.SMOKE_BROWSER_CHANNEL || "",
    environment: environment.SMOKE_ENVIRONMENT || "preview",
    headed: environment.SMOKE_HEADED === "true",
    timeoutMs: Number(environment.SMOKE_TIMEOUT_MS || 30_000),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === "--headed") {
      options.headed = true;
      continue;
    }
    if (option === "--base-url") {
      options.baseUrl = readOptionValue(argv, index, option);
      index += 1;
      continue;
    }
    if (option === "--artifacts-dir") {
      options.artifactsDir = readOptionValue(argv, index, option);
      index += 1;
      continue;
    }
    if (option === "--browser-channel") {
      options.browserChannel = readOptionValue(argv, index, option);
      index += 1;
      continue;
    }
    if (option === "--environment") {
      options.environment = readOptionValue(argv, index, option);
      index += 1;
      continue;
    }
    if (option === "--timeout-ms") {
      options.timeoutMs = Number(readOptionValue(argv, index, option));
      index += 1;
      continue;
    }
    if (option === "--help") {
      options.help = true;
      continue;
    }
    throw new Error(`Opção desconhecida: ${option}`);
  }

  if (options.help) return options;
  if (!options.baseUrl) {
    throw new Error("Informe --base-url ou SMOKE_BASE_URL.");
  }
  if (!["preview", "production", "local"].includes(options.environment)) {
    throw new Error(
      "--environment deve ser preview, production ou local.",
    );
  }
  if (
    !Number.isSafeInteger(options.timeoutMs) ||
    options.timeoutMs < 5_000 ||
    options.timeoutMs > 120_000
  ) {
    throw new Error("SMOKE_TIMEOUT_MS deve estar entre 5000 e 120000.");
  }

  options.baseUrl = normalizeSmokeBaseUrl(
    options.baseUrl,
    options.environment,
  );
  if (options.accessUrl) {
    if (options.environment !== "preview") {
      throw new Error("SMOKE_ACCESS_URL só pode ser usado em Preview.");
    }
    options.accessUrl = normalizeAccessUrl(
      options.accessUrl,
      options.baseUrl,
    );
  }
  options.artifactsDir = resolve(options.artifactsDir);
  return options;
}

export function normalizeBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Base URL inválida.");
  }

  if (url.username || url.password) {
    throw new Error("A Base URL não pode conter credenciais.");
  }
  if (url.search || url.hash) {
    throw new Error("A Base URL não pode conter query string ou fragmento.");
  }
  if (url.pathname !== "/" && url.pathname !== "") {
    throw new Error("A Base URL deve apontar para a raiz do deployment.");
  }
  return url.origin;
}

function isLocalHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

export function normalizeSmokeBaseUrl(value, environment) {
  const normalized = normalizeBaseUrl(value);
  const url = new URL(normalized);

  if (environment === "local") {
    if (url.protocol !== "http:" || !isLocalHostname(url.hostname)) {
      throw new Error(
        "O ambiente local exige uma Base URL HTTP em localhost.",
      );
    }
    return normalized;
  }

  if (url.protocol !== "https:" || isLocalHostname(url.hostname)) {
    throw new Error(
      "Preview e Production exigem uma Base URL HTTPS remota.",
    );
  }
  if (
    environment === "production" &&
    normalized !== PRODUCTION_BASE_URL
  ) {
    throw new Error(
      `Production deve usar o domínio público vigente ${PRODUCTION_BASE_URL}.`,
    );
  }
  if (
    environment === "preview" &&
    normalized === PRODUCTION_BASE_URL
  ) {
    throw new Error("Preview não pode usar o domínio público de Production.");
  }
  return normalized;
}

export function normalizeAccessUrl(value, baseUrl) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Access URL inválida.");
  }
  if (url.protocol !== "https:") {
    throw new Error("A Access URL deve usar HTTPS.");
  }
  if (url.username || url.password || url.hash) {
    throw new Error("A Access URL não pode conter credenciais ou fragmento.");
  }
  if (url.origin !== new URL(baseUrl).origin) {
    throw new Error(
      "SMOKE_ACCESS_URL deve ter exatamente a mesma origin da Base URL.",
    );
  }
  return url.toString();
}

export function parsePromotionArguments(argv, environment = process.env) {
  const options = {
    deployment: environment.PREVIEW_DEPLOYMENT || "",
    dryRun: false,
    previewUrl: environment.PREVIEW_BASE_URL || "",
    productionUrl: environment.PRODUCTION_BASE_URL || "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (option === "--help") {
      options.help = true;
      continue;
    }

    const target = {
      "--deployment": "deployment",
      "--preview-url": "previewUrl",
      "--production-url": "productionUrl",
    }[option];
    if (!target) {
      throw new Error(`Opção desconhecida: ${option}`);
    }
    options[target] = readOptionValue(argv, index, option);
    index += 1;
  }

  if (options.help) return options;
  if (!options.previewUrl) {
    throw new Error("Informe --preview-url ou PREVIEW_BASE_URL.");
  }
  if (!options.productionUrl) {
    throw new Error("Informe --production-url ou PRODUCTION_BASE_URL.");
  }
  if (!options.deployment) {
    throw new Error("Informe --deployment ou PREVIEW_DEPLOYMENT.");
  }

  options.previewUrl = normalizeSmokeBaseUrl(
    options.previewUrl,
    "preview",
  );
  options.productionUrl = normalizeSmokeBaseUrl(
    options.productionUrl,
    "production",
  );
  options.deployment = normalizeSmokeBaseUrl(
    options.deployment,
    "preview",
  );
  if (options.deployment !== options.previewUrl) {
    throw new Error(
      "O deployment promovido deve ser exatamente o Preview imutável aprovado.",
    );
  }
  return options;
}

export function redactSensitiveText(value, secrets = []) {
  let output = String(value);
  for (const secret of secrets.filter(Boolean)) {
    output = output.split(secret).join("[REDACTED]");
  }
  for (const parameter of SENSITIVE_QUERY_PARAMETERS) {
    output = output.replace(
      new RegExp(`([?&]${parameter}=)[^&\\s"'<>]+`, "gi"),
      `$1[REDACTED]`,
    );
  }
  output = output.replace(
    /(x-vercel-protection-bypass\s*[:=]\s*)[^\s,;"']+/gi,
    "$1[REDACTED]",
  );
  return output;
}

export function validateCredentials(environment = process.env) {
  const user =
    environment.SMOKE_ADMIN_USER || environment.DEMO_ADMIN_USER || "USER";
  const password =
    environment.SMOKE_ADMIN_PASSWORD ||
    environment.DEMO_ADMIN_PASSWORD ||
    "User123";

  if (!user || !password || user.length > 256 || password.length > 256) {
    throw new Error("Credenciais do smoke ausentes ou inválidas.");
  }
  return { password, user };
}

export function bypassHeadersForRequest({
  baseUrl,
  bypassSecret,
  environment,
  requestUrl,
}) {
  if (!bypassSecret || environment !== "preview") return {};
  let requestOrigin;
  try {
    requestOrigin = new URL(requestUrl).origin;
  } catch {
    return {};
  }
  if (requestOrigin !== new URL(baseUrl).origin) return {};
  return {
    "x-vercel-protection-bypass": bypassSecret,
    "x-vercel-set-bypass-cookie": "true",
  };
}

export async function handleScopedBrowserRoute(
  route,
  {
    baseUrl,
    bypassSecret,
    environment,
    externalOriginAttempt = false,
  },
) {
  const request = route.request();
  const bypassHeaders = bypassHeadersForRequest({
    baseUrl,
    bypassSecret,
    environment,
    requestUrl: request.url(),
  });
  const isExternalOriginAction =
    externalOriginAttempt &&
    request.method() === "POST" &&
    isExpectedLocation(request.url(), baseUrl, "/admin/login");

  if (!isExternalOriginAction && Object.keys(bypassHeaders).length === 0) {
    await route.continue();
    return;
  }

  const headers = {
    ...request.headers(),
    ...bypassHeaders,
    ...(isExternalOriginAction
      ? { origin: "https://external-origin.invalid" }
      : {}),
  };
  const response = await route.fetch({
    headers,
    maxRedirects: 0,
  });
  await route.fulfill({ response });
}

export function isExpectedLocation(value, baseUrl, pathname) {
  try {
    const url = new URL(value);
    return url.origin === new URL(baseUrl).origin && url.pathname === pathname;
  } catch {
    return false;
  }
}

export function buildPromotionCommand(
  deployment,
  platform = process.platform,
  environment = process.env,
) {
  const normalizedDeployment = normalizeSmokeBaseUrl(
    deployment,
    "preview",
  );
  const args = ["promote", normalizedDeployment, "--yes"];
  if (platform !== "win32") {
    return { args, command: "vercel" };
  }

  return {
    args: ["/d", "/s", "/c", "vercel.cmd", ...args],
    command:
      environment.ComSpec ||
      environment.COMSPEC ||
      "C:\\Windows\\System32\\cmd.exe",
  };
}

export function validateProductionCookie(cookie, nowSeconds = Date.now() / 1000) {
  const checks = {
    expires: Number.isFinite(cookie?.expires) && cookie.expires > nowSeconds,
    httpOnly: cookie?.httpOnly === true,
    path: cookie?.path === "/",
    sameSite: cookie?.sameSite === "Strict",
    secure: cookie?.secure === true,
  };

  if (Object.values(checks).some((passed) => !passed)) {
    const failed = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([name]) => name)
      .join(", ");
    throw new Error(`Política do cookie de Production reprovada: ${failed}.`);
  }
  return checks;
}

export function createSmokeReport({ baseUrl, environment }) {
  return {
    baseUrl,
    environment,
    finishedAt: null,
    passed: false,
    startedAt: new Date().toISOString(),
    steps: [],
  };
}

export async function runRecordedStep(report, name, operation) {
  const startedAt = Date.now();
  try {
    const details = await operation();
    report.steps.push({
      durationMs: Date.now() - startedAt,
      name,
      passed: true,
      ...(details === undefined ? {} : { details }),
    });
    return details;
  } catch (error) {
    report.steps.push({
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Falha desconhecida.",
      name,
      passed: false,
    });
    throw error;
  }
}

export async function writeSmokeReport(report, directory) {
  await mkdir(directory, { recursive: true });
  const reportPath = resolve(directory, "report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

export function safeArtifactLabel(baseUrl, now = new Date()) {
  const hostname = new URL(baseUrl).hostname.replace(/[^a-z0-9.-]/gi, "-");
  return `${now.toISOString().replace(/[:.]/g, "-")}-${hostname}`;
}

export function relativeArtifactName(path) {
  return basename(path);
}

export async function runPromotionSequence({
  previewSmoke,
  promote,
  productionSmoke,
}) {
  await previewSmoke();
  await promote();
  await productionSmoke();
}
