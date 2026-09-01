import { spawnSync } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_PROJECT_REF = "yhatwpxsxntlorfgxpdl";
const CLI_VERSION = "2.101.0";
const execute = process.argv.includes("--execute");
const prepareOnly = process.argv.includes("--prepare-only");
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");

const migrationPath = join(
  repositoryRoot,
  "supabase",
  "migrations",
  "20260831110000_make_editorial_metadata_atomic.sql",
);
const testPath = join(
  repositoryRoot,
  "supabase",
  "tests",
  "preflight",
  "editorial_atomicity_preflight.sql",
);
const projectRefPath = join(repositoryRoot, "supabase", ".temp", "project-ref");
const preparedRelativePath = "supabase/.temp/r301-production-preflight.generated.sql";
const preparedSqlPath = join(repositoryRoot, ...preparedRelativePath.split("/"));

const nativeAssertions = `
create temporary table r301_assertions (
  assertion_number integer generated always as identity primary key,
  passed boolean not null,
  description text not null
) on commit drop;

create function pg_temp.r301_ok(condition boolean, description text)
returns void
language plpgsql
as $$
begin
  if condition is distinct from true then
    raise exception 'R301 assertion failed: %', description;
  end if;

  insert into pg_temp.r301_assertions (passed, description)
  values (true, description);
end;
$$;

create function pg_temp.r301_is(actual anycompatible, expected anycompatible, description text)
returns void
language plpgsql
as $$
begin
  perform pg_temp.r301_ok(actual is not distinct from expected, description);
end;
$$;
`;

const rollbackCheckWithoutTableTrigger = `
create function pg_temp.r301_post_create_failure_rolled_back()
returns boolean
language plpgsql
as $$
declare
  context_row pg_temp.r301_test_context%rowtype;
begin
  select * into strict context_row from pg_temp.r301_test_context;

  begin
    perform public.cms_create_editorial_content(
      context_row.tenant_a,
      context_row.forced_failure_slug,
      'Falha posterior deve reverter tudo',
      'Linha fina válida para o ensaio de rollback.',
      'Texto fictício suficientemente longo para criar item, revisão, distribuição e auditoria antes da falha transacional forçada.',
      context_row.category_id,
      context_row.platform_author_id,
      'fallback',
      'Composição abstrata fictícia para o teste de rollback.',
      'standard',
      array[]::text[],
      null,
      null
    );

    raise exception 'r301 forced caller rollback';
  exception
    when others then
      if sqlerrm <> 'r301 forced caller rollback' then
        raise;
      end if;
  end;

  return not exists (
    select 1
    from public.content_items item
    where item.owner_tenant_id = context_row.tenant_a
      and item.canonical_slug = context_row.forced_failure_slug
  );
end;
$$;

`;

function replaceExactlyOnce(source, search, replacement, label) {
  const first = source.indexOf(search);
  const last = source.lastIndexOf(search);

  if (first === -1 || first !== last) {
    throw new Error(`Expected exactly one ${label} marker.`);
  }

  return source.replace(search, () => replacement);
}

function composePreflight(migration, testSource) {
  let sql = testSource;

  sql = replaceExactlyOnce(sql, "\\set ON_ERROR_STOP on\n\n", "", "psql setup");
  sql = replaceExactlyOnce(
    sql,
    "begin;\n\n",
    `begin;\n\nset local lock_timeout = '3s';\nset local statement_timeout = '60s';\nset local idle_in_transaction_session_timeout = '60s';\nset local application_name = 'r301-production-preflight';\n\n`,
    "transaction start",
  );
  sql = replaceExactlyOnce(
    sql,
    "create extension if not exists pgtap with schema extensions;\n\n",
    nativeAssertions,
    "pgTAP extension",
  );
  sql = replaceExactlyOnce(
    sql,
    "\\ir ../../migrations/20260831110000_make_editorial_metadata_atomic.sql",
    migration.trim(),
    "migration include",
  );

  const unsafeStart = sql.indexOf(
    "create function pg_temp.r301_force_metadata_failure()",
  );
  const unsafeEnd = sql.indexOf("select extensions.plan(23);");
  if (unsafeStart === -1 || unsafeEnd === -1 || unsafeEnd <= unsafeStart) {
    throw new Error("Could not isolate the table-trigger rollback test.");
  }
  sql = `${sql.slice(0, unsafeStart)}${rollbackCheckWithoutTableTrigger}${sql.slice(unsafeEnd)}`;

  sql = replaceExactlyOnce(sql, "select extensions.plan(23);", "", "test plan");
  sql = sql.replaceAll("select extensions.ok(", "select pg_temp.r301_ok(");
  sql = sql.replaceAll("select extensions.is(", "select pg_temp.r301_is(");
  sql = replaceExactlyOnce(
    sql,
    "select * from extensions.finish();",
    `select jsonb_build_object(
      'status', case when count(*) = 23 and bool_and(passed) then 'PASS' else 'FAIL' end,
      'assertions', count(*),
      'expected', 23,
      'checks', jsonb_agg(description order by assertion_number)
    ) as r301_preflight
    from pg_temp.r301_assertions;`,
    "test finish",
  );

  const assertionCalls = sql.match(/select pg_temp\.r301_(?:ok|is)\(/g)?.length ?? 0;
  if (assertionCalls !== 23) {
    throw new Error(`Expected 23 assertions, composed ${assertionCalls}.`);
  }

  if (!sql.trimEnd().endsWith("rollback;")) {
    throw new Error("The composed preflight must end with rollback.");
  }

  if (/^(?:as \$|\$;)$/m.test(sql)) {
    throw new Error("The composed preflight contains a broken dollar delimiter.");
  }

  const dollarDelimiterCount = sql.match(/\$\$/g)?.length ?? 0;
  if (dollarDelimiterCount === 0 || dollarDelimiterCount % 2 !== 0) {
    throw new Error("The composed preflight has unbalanced dollar delimiters.");
  }

  return sql;
}

const [projectRef, migration, testSource] = await Promise.all([
  readFile(projectRefPath, "utf8").then((value) => value.trim()),
  readFile(migrationPath, "utf8"),
  readFile(testPath, "utf8"),
]);

if (projectRef !== EXPECTED_PROJECT_REF) {
  throw new Error(
    `Refusing to run: linked project ${projectRef} does not match ${EXPECTED_PROJECT_REF}.`,
  );
}

const preflight = composePreflight(migration, testSource);

if (prepareOnly) {
  await writeFile(preparedSqlPath, preflight, { encoding: "utf8" });
  console.log(
    JSON.stringify({
      status: "PREPARED",
      projectRef,
      assertions: 23,
      relativePath: preparedRelativePath,
    }),
  );
  process.exit(0);
}

if (!execute) {
  console.log(
    JSON.stringify({
      status: "READY",
      projectRef,
      assertions: 23,
      transaction: "ROLLBACK",
      lockTimeout: "3s",
      statementTimeout: "60s",
      persistentTableTrigger: false,
    }),
  );
  process.exit(0);
}

try {
  await writeFile(preparedSqlPath, preflight, { encoding: "utf8" });

  const cliArguments = [
    "dlx",
    `supabase@${CLI_VERSION}`,
    "db",
    "query",
    "--linked",
    "--file",
    preparedRelativePath,
    "--output",
    "json",
  ];
  const command = process.platform === "win32"
    ? (process.env.ComSpec ?? "C:\\Windows\\System32\\cmd.exe")
    : "pnpm";
  const commandArguments = process.platform === "win32"
    ? [
        "/d",
        "/s",
        "/c",
        `pnpm dlx supabase@${CLI_VERSION} db query --linked --file ${preparedRelativePath} --output json`,
      ]
    : cliArguments;
  const result = spawnSync(command, commandArguments, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(preparedSqlPath, { force: true });
}
