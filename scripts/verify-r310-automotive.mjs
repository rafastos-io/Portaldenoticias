// R310 — matriz visual do modelo automotive-mobility (FinanciaCar) e regressão
// das homes dos demais tenants. Uso: BASE_URL=http://127.0.0.1:3107 node scripts/verify-r310-automotive.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = process.env.ARTIFACTS_DIR ?? "artifacts/r310-financiacar";
const viewports = [
  { height: 844, width: 390 },
  { height: 1024, width: 768 },
  { height: 1000, width: 1440 },
];
const routes = [
  { expectModel: "automotive-mobility", name: "fc-home", path: "/?tenant=financiacar", shot: true },
  { expectModel: "automotive-mobility", name: "fc-editoria", path: "/editoria/credito?tenant=financiacar", shot: true },
  {
    expectModel: "automotive-mobility",
    name: "fc-materia",
    path: "/materia/entrada-maior-ou-prazo-mais-longo?tenant=financiacar",
    shot: true,
  },
  { expectModel: "financial-services-credit", name: "bv-educacao", path: "/?tenant=bv-educacao" },
  { expectModel: "financial-services-credit", name: "credito-orbita", path: "/?tenant=credito-demo-orbita" },
  { expectModel: "investments-asset-management", name: "banco-horizonte", path: "/?tenant=banco-demo-horizonte" },
  { expectModel: "insurance-pension", name: "seguros-atlas", path: "/?tenant=seguros-demo-atlas" },
  { expectModel: "health-pharma", name: "abrafarma", path: "/?tenant=abrafarma" },
];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseUrl}${route.path}`, {
      waitUntil: "networkidle",
    });
    const probe = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 90) ?? null,
      model: document.querySelector("[data-site-model]")?.getAttribute("data-site-model") ?? null,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      imagesMissingAlt: [...document.images].filter((img) => !img.hasAttribute("alt")).length,
      sections: document.querySelectorAll("main section").length,
    }));
    if (route.shot) {
      await page.screenshot({
        fullPage: true,
        path: `${outDir}/${route.name}-${viewport.width}.png`,
      });
    }
    const pass =
      response?.status() === 200 &&
      probe.model === route.expectModel &&
      probe.overflow <= 1 &&
      probe.imagesMissingAlt === 0 &&
      errors.length === 0 &&
      Boolean(probe.h1);
    results.push({ ...probe, errors, pass, route: route.name, status: response?.status(), width: viewport.width });
    await page.close();
  }
  await context.close();
}

await browser.close();
writeFileSync(`${outDir}/report.json`, JSON.stringify(results, null, 2));
for (const result of results) {
  console.log(
    `${result.pass ? "PASS" : "FAIL"} ${String(result.width).padStart(4)} ${result.route.padEnd(16)} http=${result.status} model=${result.model} overflow=${result.overflow} sections=${result.sections} errors=${result.errors.length}`,
  );
}
const failed = results.filter((result) => !result.pass).length;
console.log(`${results.length - failed}/${results.length} aprovados`);
process.exit(failed ? 1 : 0);
