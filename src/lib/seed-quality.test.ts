import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const seed = readFileSync(
  new URL("../../supabase/seed.sql", import.meta.url),
  "utf8",
);

describe("qualidade textual do seed", () => {
  it("mantém o catálogo fonte em UTF-8 sem sequências de mojibake", () => {
    expect(seed).not.toMatch(/Ã(?:§|£|­|©|µ|º|¡|ª|³|´|¢| )/);
    expect(seed).not.toContain("â€");
  });

  it("preserva os 24 códigos editoriais determinísticos", () => {
    const codes = new Set(seed.match(/DEMO-\d{3}/g));
    expect(codes.size).toBe(24);
  });
});
