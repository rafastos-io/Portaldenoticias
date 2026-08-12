#!/usr/bin/env node

import { spawn } from "node:child_process";
import { resolve } from "node:path";

import {
  buildPromotionCommand,
  parsePromotionArguments,
  redactSensitiveText,
  runPromotionSequence,
} from "./lib/smoke-admin-core.mjs";

function run(command, args, extraEnvironment = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...extraEnvironment },
      shell: false,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(
        new Error(
          signal
            ? `Processo interrompido por ${signal}.`
            : `Processo encerrou com código ${code}.`,
        ),
      );
    });
  });
}

async function main() {
  const argv = process.argv.slice(2);
  let options;
  try {
    options = parsePromotionArguments(argv);
  } catch (error) {
    console.error(
      `Gate bloqueado: ${
        error instanceof Error ? error.message : "Argumentos inválidos."
      }`,
    );
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(`
Uso:
  pnpm release:promote -- --preview-url <deployment-url> --deployment <mesma-url> --production-url https://portaldenoticias-five.vercel.app

O gate roda o smoke de Preview, executa "vercel promote --yes" somente se ele
passar e então reverifica Production. Use --dry-run para provar apenas o bloqueio
e o smoke de Preview, sem mutação externa.
`.trim());
    return;
  }

  try {
    const { deployment, dryRun, previewUrl, productionUrl } = options;

    const smokeScript = resolve("scripts/smoke-admin.mjs");
    const nodeArgs = [
      smokeScript,
      "--base-url",
      previewUrl,
      "--environment",
      "preview",
    ];

    await runPromotionSequence({
      previewSmoke: () =>
        run(process.execPath, nodeArgs, {
          SMOKE_ACCESS_URL: process.env.PREVIEW_ACCESS_URL || process.env.SMOKE_ACCESS_URL || "",
        }),
      promote: async () => {
        if (dryRun) {
          console.log(
            "Dry-run aprovado: promoção e smoke de Production não foram executados.",
          );
          return;
        }
        const promotionCommand = buildPromotionCommand(deployment);
        await run(promotionCommand.command, promotionCommand.args);
      },
      productionSmoke: async () => {
        if (dryRun) return;
        await run(process.execPath, [
          smokeScript,
          "--base-url",
          productionUrl,
          "--environment",
          "production",
        ], {
          PREVIEW_ACCESS_URL: "",
          SMOKE_ACCESS_URL: "",
          SMOKE_VERCEL_BYPASS_SECRET: "",
        });
      },
    });

    console.log(
      dryRun
        ? "Gate de Preview aprovado sem promoção."
        : "Promoção e reverificação de Production aprovadas.",
    );
  } catch (error) {
    const safeMessage = redactSensitiveText(
      error instanceof Error ? error.message : "Falha desconhecida.",
      [
        process.env.PREVIEW_ACCESS_URL,
        process.env.SMOKE_ACCESS_URL,
        process.env.SMOKE_VERCEL_BYPASS_SECRET,
        process.env.SMOKE_ADMIN_PASSWORD,
      ],
    );
    console.error(`Gate bloqueado: ${safeMessage}`);
    process.exitCode = 1;
  }
}

await main();
