#!/usr/bin/env node

import { chromium } from "playwright";

import { validateCredentials } from "./lib/smoke-admin-core.mjs";

const baseUrl = (process.env.R302_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const credentials = validateCredentials();
const widths = [390, 768, 1440];
const pages = [
  { button: "home", heading: "Longevidade amplia o horizonte das decisões econômicas" },
  { button: "editoria", heading: "Empresas" },
  { button: "Matéria", heading: "Longevidade amplia o horizonte das decisões econômicas" },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    return chromium.launch({ channel: "chrome", headless: true });
  }
}

const browser = await launchBrowser();

try {
  const context = await browser.newContext({
    viewport: { height: 1000, width: 1600 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  const loginResponse = await page.goto(`${baseUrl}/admin/login`, {
    waitUntil: "domcontentloaded",
  });
  assert(loginResponse?.ok(), `Login retornou HTTP ${loginResponse?.status()}.`);
  await page.locator("#user").fill(credentials.user);
  await page.locator("#password").fill(credentials.password);
  await Promise.all([
    page.waitForURL(`${baseUrl}/admin`),
    page.getByRole("button", { name: "Acessar ambiente editorial" }).click(),
  ]);

  const identityResponse = await page.goto(`${baseUrl}/admin/identidade`, {
    waitUntil: "domcontentloaded",
  });
  assert(
    identityResponse?.ok(),
    `Central de identidade retornou HTTP ${identityResponse?.status()}.`,
  );
  await page.getByRole("heading", { name: "Identidade visual" }).waitFor();
  const themeForm = page.locator("form").filter({
    has: page.getByRole("button", { name: "Salvar identidade" }),
  });
  await themeForm.locator('input[name="brandName"]').fill("Marca Preview R302");

  for (const width of widths) {
    await page.getByRole("button", { name: String(width), exact: true }).click();
    const frameElement = page.locator('iframe[title^="Preview do portal"]');
    await frameElement.waitFor();
    const renderedWidth = await frameElement.evaluate((element) => element.clientWidth);
    assert(
      renderedWidth === width,
      `Viewport ${width}px foi renderizado com ${renderedWidth}px.`,
    );

    for (const previewPage of pages) {
      await page
        .getByRole("button", { name: previewPage.button, exact: true })
        .click();
      const frame = page.frameLocator('iframe[title^="Preview do portal"]');
      await frame.getByText("Marca Preview R302", { exact: true }).first().waitFor();
      await frame
        .locator("#conteudo-principal")
        .getByRole("heading", { name: previewPage.heading, exact: true })
        .first()
        .waitFor();
      const overlay = await frame.locator("[data-nextjs-dialog]").count();
      assert(overlay === 0, `Overlay do Next detectado em ${width}px/${previewPage.button}.`);
    }
  }

  assert(
    runtimeErrors.length === 0,
    `Erros no browser: ${runtimeErrors.join(" | ")}`,
  );
  console.log(
    "R302 aprovado: renderer público, alterações não salvas e 9 combinações de página/viewport verificadas.",
  );
  await context.close();
} finally {
  await browser.close();
}
