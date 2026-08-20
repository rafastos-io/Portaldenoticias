import { createRequire } from "node:module";

import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const baseUrl = (process.env.A11Y_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const tenant = process.env.A11Y_TENANT ?? "bv-educacao";
const paths = [
  `/?tenant=${encodeURIComponent(tenant)}`,
  `/materia/proteger-orcamento-reajuste-planos-saude?tenant=${encodeURIComponent(tenant)}`,
];
const viewports = [
  { height: 844, name: "mobile", width: 390 },
  { height: 1024, name: "tablet", width: 768 },
  { height: 1000, name: "desktop", width: 1440 },
];

const browser = await chromium.launch({ headless: true });
const findings = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const path of paths) {
      const url = `${baseUrl}${path}`;
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      if (!response?.ok()) {
        throw new Error(`HTTP ${response?.status() ?? "sem resposta"} em ${url}`);
      }
      await page.waitForTimeout(1000);
      await page.addScriptTag({ path: axePath });
      const result = await page.evaluate(async () =>
        window.axe.run(
          { exclude: [["iframe"]] },
          {
            runOnly: {
              type: "tag",
              values: [
                "wcag2a",
                "wcag2aa",
                "wcag21aa",
                "wcag22aa",
                "best-practice",
              ],
            },
          },
        ),
      );
      for (const violation of result.violations) {
        findings.push({
          help: violation.help,
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.slice(0, 12).map((node) => ({
            failure: node.failureSummary,
            target: node.target,
          })),
          totalNodes: violation.nodes.length,
          url,
          viewport: viewport.name,
        });
      }

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (overflows) throw new Error(`Overflow horizontal em ${url}`);

      if (path.includes("proteger-orcamento")) {
        const video = page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]');
        if ((await video.count()) !== 1) {
          throw new Error(`Embed seguro do YouTube ausente em ${url}`);
        }
        const title = await video.getAttribute("title");
        if (!title?.startsWith("Vídeo:")) {
          throw new Error(`Embed sem título acessível em ${url}`);
        }
        if ((await video.getAttribute("allowfullscreen")) === null) {
          throw new Error(`Embed sem suporte a tela cheia em ${url}`);
        }
      }
    }

    if (viewport.name === "mobile") {
      await page.goto(`${baseUrl}/?tenant=${encodeURIComponent(tenant)}`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByText("Acessibilidade", { exact: true }).click();
      await page.getByRole("button", { name: "Muito grande", exact: true }).click();
      await page.getByRole("button", { name: "Alto contraste", exact: true }).click();
      await page.getByRole("button", { name: "Reduzir animações", exact: true }).click();
      const preferences = await page.evaluate(() => ({ ...document.documentElement.dataset }));
      if (
        preferences.a11yContrast !== "high" ||
        preferences.a11yFont !== "xlarge" ||
        preferences.a11yMotion !== "reduced"
      ) {
        throw new Error("Controles de acessibilidade não foram aplicados.");
      }
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      const persisted = await page.evaluate(() => ({ ...document.documentElement.dataset }));
      if (persisted.a11yFont !== "xlarge") {
        throw new Error("Preferências de acessibilidade não persistiram.");
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

if (findings.length > 0) {
  console.error(JSON.stringify(findings, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    `Acessibilidade automatizada aprovada: ${paths.length} rotas × ${viewports.length} viewports.`,
  );
}
