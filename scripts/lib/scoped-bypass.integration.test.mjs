import { createServer } from "node:http";

import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

import { handleScopedBrowserRoute } from "./smoke-admin-core.mjs";

function listen(handler) {
  return new Promise((resolvePromise, reject) => {
    const server = createServer(handler);
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolvePromise({
        origin: `http://127.0.0.1:${address.port}`,
        server,
      });
    });
  });
}

function close(server) {
  return new Promise((resolvePromise, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolvePromise();
    });
  });
}

async function launchChromium() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    return chromium.launch({ channel: "chrome", headless: true });
  }
}

describe("bypass Vercel através de redirects", () => {
  it(
    "envia o header a A, devolve o 302 ao browser e não o envia a B",
    async () => {
      let headerAtOriginA;
      let headerAtOriginB;
      let setCookieHeaderAtOriginA;
      let setCookieHeaderAtOriginB;
      const originB = await listen((request, response) => {
        headerAtOriginB = request.headers["x-vercel-protection-bypass"];
        setCookieHeaderAtOriginB =
          request.headers["x-vercel-set-bypass-cookie"];
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end("<!doctype html><title>Origin B</title><h1>Origin B</h1>");
      });
      const originA = await listen((request, response) => {
        headerAtOriginA = request.headers["x-vercel-protection-bypass"];
        setCookieHeaderAtOriginA =
          request.headers["x-vercel-set-bypass-cookie"];
        response.writeHead(302, { Location: `${originB.origin}/` });
        response.end();
      });

      let browser;
      try {
        browser = await launchChromium();
        const page = await browser.newPage();
        await page.route("**/*", (route) =>
          handleScopedBrowserRoute(route, {
            baseUrl: originA.origin,
            bypassSecret: "segredo-de-integracao",
            environment: "preview",
          }),
        );

        await page.goto(`${originA.origin}/`, {
          waitUntil: "domcontentloaded",
        });

        expect(page.url()).toBe(`${originB.origin}/`);
        expect(headerAtOriginA).toBe("segredo-de-integracao");
        expect(setCookieHeaderAtOriginA).toBe("true");
        expect(headerAtOriginB).toBeUndefined();
        expect(setCookieHeaderAtOriginB).toBeUndefined();
      } finally {
        await browser?.close();
        await close(originA.server);
        await close(originB.server);
      }
    },
    30_000,
  );
});
