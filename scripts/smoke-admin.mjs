#!/usr/bin/env node

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import {
  createSmokeReport,
  DEMO_NOTICE,
  handleScopedBrowserRoute,
  isExpectedLocation,
  parseSmokeArguments,
  redactSensitiveText,
  runRecordedStep,
  safeArtifactLabel,
  SESSION_COOKIE,
  validateCredentials,
  validateProductionCookie,
  writeSmokeReport,
} from "./lib/smoke-admin-core.mjs";

const HELP = `
Uso:
  pnpm smoke:admin -- --base-url https://preview.example

Opções:
  --base-url <url>          alvo do smoke (ou SMOKE_BASE_URL)
  --environment <nome>      local, preview ou production
  --artifacts-dir <path>    raiz dos artefatos
  --browser-channel <nome>  canal Playwright, por exemplo chrome
  --headed                   abre o browser visível

Segredos opcionais são lidos de SMOKE_VERCEL_BYPASS_SECRET,
SMOKE_ACCESS_URL e SMOKE_ADMIN_PASSWORD e nunca são impressos.
`.trim();

async function launchBrowser(options) {
  const requestedChannel = options.browserChannel || undefined;
  try {
    return await chromium.launch({
      channel: requestedChannel,
      headless: !options.headed,
    });
  } catch (error) {
    if (requestedChannel) throw error;
    return chromium.launch({ channel: "chrome", headless: !options.headed });
  }
}

async function apiSession(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/admin/session", {
      cache: "no-store",
      credentials: "same-origin",
    });
    let body = null;
    try {
      body = await response.json();
    } catch {
      // A asserção de status ainda produz evidência suficiente.
    }
    return { body, status: response.status };
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function sanitizeLoginForm(page) {
  if (!/\/admin\/login(?:[?#]|$)/.test(page.url())) return;
  await page.locator("#user").fill("").catch(() => {});
  await page.locator("#password").fill("").catch(() => {});
}

function canCaptureScreenshot(page) {
  try {
    const url = new URL(page.url());
    return (
      !url.searchParams.has("_vercel_share") &&
      !url.searchParams.has("x-vercel-protection-bypass")
    );
  } catch {
    return false;
  }
}

async function main() {
  let options;
  try {
    options = parseSmokeArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Argumentos inválidos.");
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(HELP);
    return;
  }

  const credentials = validateCredentials();
  const bypassSecret = process.env.SMOKE_VERCEL_BYPASS_SECRET || "";
  const sensitiveValues = [
    credentials.password,
    options.accessUrl,
    process.env.SMOKE_VERCEL_BYPASS_SECRET,
  ].filter(Boolean);
  const artifactDirectory = resolve(
    options.artifactsDir,
    safeArtifactLabel(options.baseUrl),
  );
  const report = createSmokeReport(options);
  let browser;
  let page;

  try {
    browser = await launchBrowser(options);
    const context = await browser.newContext({
      viewport: { height: 900, width: 1440 },
    });
    page = await context.newPage();
    page.setDefaultTimeout(options.timeoutMs);
    page.setDefaultNavigationTimeout(options.timeoutMs);

    const pageErrors = [];
    let externalOriginAttempt = false;
    page.on("pageerror", (error) => {
      if (!externalOriginAttempt) {
        pageErrors.push(redactSensitiveText(error.message, sensitiveValues));
      }
    });
    await page.route("**/*", async (route) => {
      await handleScopedBrowserRoute(route, {
        baseUrl: options.baseUrl,
        bypassSecret,
        environment: options.environment,
        externalOriginAttempt,
      });
    });

    if (options.accessUrl) {
      await runRecordedStep(report, "bootstrap de acesso ao Preview", async () => {
        await page.goto(options.accessUrl, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("domcontentloaded");
        assert(
          new URL(page.url()).origin === new URL(options.baseUrl).origin,
          "O bootstrap saiu da origin exata do Preview.",
        );
        return { established: true };
      });
    }

    await runRecordedStep(report, "abrir login e confirmar aviso demo", async () => {
      await page.goto(`${options.baseUrl}/admin/login`, {
        waitUntil: "domcontentloaded",
      });
      assert(
        isExpectedLocation(page.url(), options.baseUrl, "/admin/login"),
        "A navegação de login saiu da origin esperada.",
      );
      await page
        .getByRole("complementary", {
          name: "Aviso de ambiente demonstrativo",
        })
        .getByText(DEMO_NOTICE, { exact: true })
        .waitFor();
      await page.getByRole("heading", { name: "Entrar no ADM" }).waitFor();
    });

    await runRecordedStep(report, "recusar login inválido", async () => {
      await page.locator("#user").fill("__smoke_invalid_user__");
      await page.locator("#password").fill("__smoke_invalid_password__");
      await page.getByRole("button", { name: "Entrar no ADM" }).click();
      const loginAlert = page.locator("form [role='alert']");
      await loginAlert.waitFor();
      assert(
        /inválid|Muitas tentativas/i.test(
          (await loginAlert.textContent()) || "",
        ),
        "O login inválido não exibiu a recusa esperada.",
      );
      assert(
        isExpectedLocation(page.url(), options.baseUrl, "/admin/login"),
        "Login inválido saiu da rota de login.",
      );
    });

    await runRecordedStep(report, "confirmar sessão 401", async () => {
      const session = await apiSession(page);
      assert(session.status === 401, `Sessão anônima retornou ${session.status}.`);
      return { status: session.status };
    });

    await runRecordedStep(
      report,
      "recusar tentativa com Origin externa",
      async () => {
        await page.locator("#user").fill(credentials.user);
        await page.locator("#password").fill(credentials.password);
        externalOriginAttempt = true;
        let actionResponse;
        try {
          actionResponse = await Promise.all([
            page.waitForResponse(
              (response) =>
                response.request().method() === "POST" &&
                isExpectedLocation(
                  response.url(),
                  options.baseUrl,
                  "/admin/login",
                ),
            ),
            page.getByRole("button", { name: "Entrar no ADM" }).click(),
          ]).then(([response]) => response);
        } finally {
          externalOriginAttempt = false;
        }
        assert(
          actionResponse.status() >= 400,
          `Origin externa não foi recusada (${actionResponse.status()}).`,
        );
        await page.goto(`${options.baseUrl}/admin/login`, {
          waitUntil: "domcontentloaded",
        });
        assert(
          isExpectedLocation(page.url(), options.baseUrl, "/admin/login"),
          "Tentativa de Origin externa saiu da origin esperada.",
        );
        const session = await apiSession(page);
        assert(
          session.status === 401,
          `Origin externa criou sessão (${session.status}).`,
        );
        return {
          actionStatus: actionResponse.status(),
          sessionStatus: session.status,
        };
      },
    );

    await runRecordedStep(report, "aceitar login válido e redirecionar", async () => {
      await page.locator("#user").fill(credentials.user);
      await page.locator("#password").fill(credentials.password);
      await Promise.all([
        page.waitForURL((url) =>
          isExpectedLocation(url.toString(), options.baseUrl, "/admin"),
        ),
        page.getByRole("button", { name: "Entrar no ADM" }).click(),
      ]);
      await page.getByText("demo-operator", { exact: true }).waitFor();
      return { redirectedTo: "/admin" };
    });

    await runRecordedStep(report, "confirmar sessão 200", async () => {
      const session = await apiSession(page);
      assert(session.status === 200, `Sessão autenticada retornou ${session.status}.`);
      assert(session.body?.actor === "demo-operator", "Actor da sessão é inválido.");
      assert(session.body?.demo === true, "A sessão não confirmou demo=true.");
      assert(
        typeof session.body?.expiresAt === "number" &&
          session.body.expiresAt > Math.floor(Date.now() / 1000),
        "A sessão não informou expiração futura.",
      );
      return {
        actor: session.body.actor,
        demo: session.body.demo,
        status: session.status,
      };
    });

    if (options.environment === "production") {
      await runRecordedStep(report, "validar cookie de Production", async () => {
        const cookies = await context.cookies(options.baseUrl);
        const cookie = cookies.find((item) => item.name === SESSION_COOKIE);
        assert(cookie, "Cookie da sessão não foi encontrado.");
        return validateProductionCookie(cookie);
      });
    }

    await runRecordedStep(
      report,
      "recusar cookie adulterado sem remover sessão Vercel",
      async () => {
        const cookies = await context.cookies(options.baseUrl);
        const demoCookie = cookies.find(
          (item) => item.name === SESSION_COOKIE,
        );
        assert(demoCookie, "Cookie demo não foi encontrado para adulteração.");
        await context.addCookies([
          {
            domain: demoCookie.domain,
            expires: demoCookie.expires,
            httpOnly: demoCookie.httpOnly,
            name: demoCookie.name,
            path: demoCookie.path,
            sameSite: demoCookie.sameSite,
            secure: demoCookie.secure,
            value: `${demoCookie.value}.adulterado`,
          },
        ]);
        const session = await apiSession(page);
        assert(
          session.status === 401,
          `Cookie adulterado retornou ${session.status}.`,
        );

        const beforeClear = (await context.cookies())
          .filter((item) => item.name !== SESSION_COOKIE)
          .map((item) => ({
            domain: item.domain,
            name: item.name,
            path: item.path,
            value: item.value,
          }))
          .sort((left, right) =>
            `${left.domain}:${left.path}:${left.name}`.localeCompare(
              `${right.domain}:${right.path}:${right.name}`,
            ),
          );
        await context.clearCookies({ name: SESSION_COOKIE });
        const afterClear = (await context.cookies())
          .filter((item) => item.name !== SESSION_COOKIE)
          .map((item) => ({
            domain: item.domain,
            name: item.name,
            path: item.path,
            value: item.value,
          }))
          .sort((left, right) =>
            `${left.domain}:${left.path}:${left.name}`.localeCompare(
              `${right.domain}:${right.path}:${right.name}`,
            ),
          );
        assert(
          JSON.stringify(afterClear) === JSON.stringify(beforeClear),
          "A remoção do cookie demo alterou cookies da sessão Vercel.",
        );
        return {
          nonDemoCookiesPreserved: true,
          sessionStatus: session.status,
        };
      },
    );

    await runRecordedStep(report, "restabelecer sessão válida", async () => {
      await page.goto(`${options.baseUrl}/admin/login`, {
        waitUntil: "domcontentloaded",
      });
      assert(
        isExpectedLocation(page.url(), options.baseUrl, "/admin/login"),
        "Restabelecimento saiu da origin esperada.",
      );
      await page.locator("#user").fill(credentials.user);
      await page.locator("#password").fill(credentials.password);
      await Promise.all([
        page.waitForURL((url) =>
          isExpectedLocation(url.toString(), options.baseUrl, "/admin"),
        ),
        page.getByRole("button", { name: "Entrar no ADM" }).click(),
      ]);
      const session = await apiSession(page);
      assert(
        session.status === 200,
        `Sessão restabelecida retornou ${session.status}.`,
      );
      return { status: session.status };
    });

    await runRecordedStep(report, "recarregar Conteúdo protegido", async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: "Conteúdo", exact: true }).waitFor();
      assert(
        isExpectedLocation(page.url(), options.baseUrl, "/admin"),
        "Reload não preservou a área protegida.",
      );
    });

    await runRecordedStep(report, "navegar Identidades", async () => {
      await page.getByRole("link", { name: "Identidades", exact: true }).click();
      await page.waitForURL((url) =>
        isExpectedLocation(
          url.toString(),
          options.baseUrl,
          "/admin/identidade",
        ),
      );
      await page.getByRole("heading", { name: "Identidade visual" }).waitFor();
    });

    await runRecordedStep(report, "navegar Auditoria", async () => {
      await page.getByRole("link", { name: "Auditoria", exact: true }).click();
      await page.waitForURL((url) =>
        isExpectedLocation(
          url.toString(),
          options.baseUrl,
          "/admin/auditoria",
        ),
      );
      await page.getByRole("heading", { name: "Trilha de auditoria" }).waitFor();
    });

    await runRecordedStep(report, "voltar a Conteúdo", async () => {
      await page.getByRole("link", { name: "Conteúdo", exact: true }).click();
      await page.waitForURL((url) =>
        isExpectedLocation(url.toString(), options.baseUrl, "/admin"),
      );
      await page.getByRole("heading", { name: "Conteúdo", exact: true }).waitFor();
    });

    await runRecordedStep(report, "logout e novo bloqueio", async () => {
      await Promise.all([
        page.waitForURL((url) =>
          isExpectedLocation(
            url.toString(),
            options.baseUrl,
            "/admin/login",
          ),
        ),
        page.getByRole("button", { name: "Sair", exact: true }).click(),
      ]);
      await page.goto(`${options.baseUrl}/admin`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForURL((url) =>
        isExpectedLocation(
          url.toString(),
          options.baseUrl,
          "/admin/login",
        ),
      );
      const session = await apiSession(page);
      assert(session.status === 401, `Sessão após logout retornou ${session.status}.`);
      return { blockedPath: "/admin/login", sessionStatus: session.status };
    });

    assert(
      pageErrors.length === 0,
      `Exceções de runtime no browser: ${pageErrors.join(" | ")}`,
    );
    report.passed = true;
    console.log(
      `Smoke aprovado (${options.environment}) em ${new URL(options.baseUrl).hostname}.`,
    );
  } catch (error) {
    report.error = redactSensitiveText(
      error instanceof Error ? error.message : "Falha desconhecida.",
      sensitiveValues,
    );
    if (page) {
      await sanitizeLoginForm(page);
      await mkdir(artifactDirectory, { recursive: true });
      if (canCaptureScreenshot(page)) {
        await page
          .screenshot({
            fullPage: true,
            path: resolve(artifactDirectory, "failure.png"),
          })
          .catch(() => {});
      }
    }
    console.error(`Smoke reprovado: ${report.error}`);
    process.exitCode = 1;
  } finally {
    report.finishedAt = new Date().toISOString();
    report.steps = report.steps.map((step) => ({
      ...step,
      ...(step.error
        ? { error: redactSensitiveText(step.error, sensitiveValues) }
        : {}),
    }));
    const reportPath = await writeSmokeReport(report, artifactDirectory);
    console.log(`Relatório: ${reportPath}`);
    await browser?.close();
  }
}

await main();
