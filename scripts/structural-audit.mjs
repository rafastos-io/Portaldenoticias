import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const projectRoot = process.cwd();
const sourceRoot = join(projectRoot, "src");
const sourceExtensions = new Set([".ts", ".tsx"]);
const entryNames = new Set([
  "default.tsx",
  "error.tsx",
  "layout.tsx",
  "loading.tsx",
  "not-found.tsx",
  "page.tsx",
  "robots.ts",
  "route.ts",
  "sitemap.ts",
  "template.tsx",
]);
const knownTenantSlugs = [
  "abrafarma",
  "banco-demo-horizonte",
  "broadcast-saude",
  "bv-educacao",
  "credito-demo-orbita",
  "healthtech-demo-lumen",
  "seguros-demo-atlas",
];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function normalized(path) {
  return relative(projectRoot, path).replaceAll("\\", "/");
}

function isTestFile(path) {
  return /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path);
}

function resolveModule(importer, specifier, candidates) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return null;
  const base = specifier.startsWith("@/")
    ? resolve(sourceRoot, specifier.slice(2))
    : resolve(importer, "..", specifier);
  const paths = [
    base,
    ...[".ts", ".tsx"].map((extension) => `${base}${extension}`),
    ...[".ts", ".tsx"].map((extension) => join(base, `index${extension}`)),
  ];
  return paths.find((path) => candidates.has(path)) ?? null;
}

function importedModules(path, candidates) {
  const source = readFileSync(path, "utf8");
  const imports = new Set();
  const pattern =
    /(?:\bimport\s*(?:type\s+)?(?:[^"']*?\s+from\s+)?|\bexport\s+(?:type\s+)?[^"']*?\s+from\s+|\bimport\s*\()\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    const dependency = resolveModule(path, match[1], candidates);
    if (dependency) imports.add(dependency);
  }
  return imports;
}

function collectReachable(roots, graph) {
  const reachable = new Set();
  const pending = [...roots];
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || reachable.has(current)) continue;
    reachable.add(current);
    for (const dependency of graph.get(current) ?? []) pending.push(dependency);
  }
  return reachable;
}

function occurrences(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

const allSourceFiles = walk(sourceRoot).filter((path) =>
  sourceExtensions.has(extname(path)),
);
const productionFiles = allSourceFiles.filter(
  (path) => !isTestFile(path) && !path.endsWith("database.types.ts"),
);
const productionSet = new Set(productionFiles);
const graph = new Map(
  productionFiles.map((path) => [path, importedModules(path, productionSet)]),
);
const roots = productionFiles.filter(
  (path) =>
    normalized(path).startsWith("src/app/") &&
    entryNames.has(normalized(path).split("/").at(-1)),
);
const reachable = collectReachable(roots, graph);
const orphanCandidates = productionFiles
  .filter((path) => !reachable.has(path))
  .map(normalized)
  .sort();

const largeFiles = productionFiles
  .map((path) => ({
    lines: readFileSync(path, "utf8").split(/\r?\n/).length,
    path: normalized(path),
  }))
  .filter((item) => item.lines >= 400)
  .sort((left, right) => right.lines - left.lines);

const hardcodedTenantFiles = productionFiles.flatMap((path) => {
  const source = readFileSync(path, "utf8");
  const slugs = knownTenantSlugs.filter((slug) => source.includes(`"${slug}"`));
  return slugs.length > 0 ? [{ path: normalized(path), slugs }] : [];
});

const suppressions = productionFiles.flatMap((path) => {
  const source = readFileSync(path, "utf8");
  const count = occurrences(
    source,
    /(?:eslint-disable|@ts-ignore|@ts-expect-error|\bas any\b|\bdebugger\b)/g,
  );
  return count > 0 ? [{ count, path: normalized(path) }] : [];
});

const broadCatchFiles = productionFiles.flatMap((path) => {
  const source = readFileSync(path, "utf8");
  const count = occurrences(source, /catch\s*\{/g);
  return count > 0 ? [{ count, path: normalized(path) }] : [];
});

console.log("Auditoria estrutural (heurística; confirme cada candidato antes de remover)\n");
console.log(`Entradas Next analisadas: ${roots.length}`);
console.log(`Arquivos de produção analisados: ${productionFiles.length}`);

console.log("\nCandidatos a código órfão:");
console.log(
  orphanCandidates.length > 0
    ? orphanCandidates.map((path) => `- ${path}`).join("\n")
    : "- nenhum",
);

console.log("\nArquivos com 400+ linhas:");
console.log(
  largeFiles.length > 0
    ? largeFiles.map((item) => `- ${item.lines}: ${item.path}`).join("\n")
    : "- nenhum",
);

console.log("\nSlugs de tenant em código de produção:");
console.log(
  hardcodedTenantFiles.length > 0
    ? hardcodedTenantFiles
        .map((item) => `- ${item.path}: ${item.slugs.join(", ")}`)
        .join("\n")
    : "- nenhum",
);

console.log("\nSupressões de lint/tipos e casts 'as any':");
console.log(
  suppressions.length > 0
    ? suppressions.map((item) => `- ${item.count}: ${item.path}`).join("\n")
    : "- nenhuma",
);

console.log("\nBlocos catch sem variável de erro:");
console.log(
  broadCatchFiles.length > 0
    ? broadCatchFiles.map((item) => `- ${item.count}: ${item.path}`).join("\n")
    : "- nenhum",
);

console.log(
  "\nObservação: imports dinâmicos não literais e convenções externas ao App Router podem gerar falsos positivos.",
);
