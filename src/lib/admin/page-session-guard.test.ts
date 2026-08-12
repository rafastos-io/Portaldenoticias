import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const protectedPages = [
  {
    file: "src/app/admin/(protected)/page.tsx",
    firstDataLoad: "loadAdminData(",
  },
  {
    file: "src/app/admin/(protected)/identidade/page.tsx",
    firstDataLoad: "loadIdentity(",
  },
  {
    file: "src/app/admin/(protected)/auditoria/page.tsx",
    firstDataLoad: "loadAudit(",
  },
];

describe("protected admin pages", () => {
  it.each(protectedPages)(
    "revalidates the session before loading data in $file",
    ({ file, firstDataLoad }) => {
      const source = readFileSync(file, "utf8");
      const pageStart = source.indexOf("export default async function");
      const sessionGuard = source.indexOf(
        "await requireDemoSession();",
        pageStart,
      );
      const dataLoad = source.indexOf(firstDataLoad, pageStart);

      expect(pageStart).toBeGreaterThanOrEqual(0);
      expect(sessionGuard).toBeGreaterThan(pageStart);
      expect(dataLoad).toBeGreaterThan(sessionGuard);
    },
  );
});
