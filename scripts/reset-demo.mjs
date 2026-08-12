import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

const allowedEnvironments = new Set(["local", "demo"]);
const environmentName = process.env.DEMO_ENVIRONMENT?.trim();
const confirmation = process.env.DEMO_RESET_CONFIRMATION?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();
const projectId = process.env.SUPABASE_PROJECT_ID?.trim();
const demoProjectId = "yhatwpxsxntlorfgxpdl";

if (
  !environmentName ||
  !allowedEnvironments.has(environmentName) ||
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production"
) {
  throw new Error(
    "Reset recusado: DEMO_ENVIRONMENT deve ser local/demo e o ambiente não pode ser produção.",
  );
}

if (confirmation !== "RESET MVP0 DEMO") {
  throw new Error(
    "Reset recusado: defina DEMO_RESET_CONFIRMATION como RESET MVP0 DEMO.",
  );
}

if (!databaseUrl || databaseUrl.includes("replace-with")) {
  throw new Error("Reset recusado: DATABASE_URL não foi configurada.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
const isLocalDatabase = ["127.0.0.1", "localhost"].includes(
  parsedDatabaseUrl.hostname,
);
const databaseUsername = decodeURIComponent(parsedDatabaseUrl.username);
const isAuthorizedDemoDatabase =
  parsedDatabaseUrl.hostname === `db.${demoProjectId}.supabase.co` ||
  databaseUsername === `postgres.${demoProjectId}`;

if (
  (environmentName === "local" && !isLocalDatabase) ||
  (environmentName === "demo" &&
    (projectId !== demoProjectId || !isAuthorizedDemoDatabase))
) {
  throw new Error(
    "Reset recusado: DATABASE_URL não corresponde ao ambiente local ou ao projeto demo autorizado.",
  );
}

const seedPath = fileURLToPath(
  new URL("../supabase/seed.sql", import.meta.url),
);
const seedSql = await readFile(seedPath, "utf8");
const sql = postgres(databaseUrl, {
  max: 1,
  ssl: isLocalDatabase ? false : "require",
});

try {
  await sql.begin(async (transaction) => {
    await transaction`
      select set_config(
        'app.broadcast_environment',
        ${environmentName},
        true
      )
    `;
    await transaction`
      select private.reset_demo_catalog(${confirmation})
    `;
    await transaction.unsafe(seedSql);
  });

  console.log("Catálogo demonstrativo restaurado com sucesso.");
} finally {
  await sql.end();
}
