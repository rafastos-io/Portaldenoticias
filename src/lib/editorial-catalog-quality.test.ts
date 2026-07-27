import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

type EditorialArticle = {
  code: string;
  cross_tenant_slugs: string[];
  image_file: string;
  ordinal: number;
  paragraphs: string[];
  tenant_slug: string;
};

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260727224132_expand_editorial_catalog.sql",
    import.meta.url,
  ),
  "utf8",
);
const catalogMatch = migration.match(/\$catalog\$\s*(\[[\s\S]*\])\s*\$catalog\$/);

if (!catalogMatch) {
  throw new Error("Catálogo JSON não encontrado na migration editorial.");
}

const articles = JSON.parse(catalogMatch[1]) as EditorialArticle[];

describe("qualidade do catálogo editorial expandido", () => {
  it("mantém dez matérias canônicas em cada uma das quatro verticais", () => {
    const totals = Object.groupBy(articles, (article) => article.tenant_slug);

    expect(articles).toHaveLength(40);
    expect(Object.keys(totals)).toHaveLength(4);
    expect(Object.values(totals).map((items) => items?.length)).toEqual([
      10, 10, 10, 10,
    ]);
    expect(new Set(articles.map((article) => article.ordinal)).size).toBe(40);
    expect(new Set(articles.map((article) => article.code)).size).toBe(40);
  });

  it("associa uma imagem própria e existente a cada matéria", () => {
    expect(new Set(articles.map((article) => article.image_file)).size).toBe(40);

    for (const article of articles) {
      expect(
        existsSync(
          new URL(
            `../../public/images/editorial/2026-07/${article.image_file}`,
            import.meta.url,
          ),
        ),
        article.image_file,
      ).toBe(true);
    }
  });

  it("mantém texto desenvolvido e crossovers sem autorreferência", () => {
    expect(articles.some((article) => article.cross_tenant_slugs.length > 0)).toBe(
      true,
    );

    for (const article of articles) {
      expect(article.paragraphs).toHaveLength(4);
      expect(article.paragraphs.every((paragraph) => paragraph.length >= 100)).toBe(
        true,
      );
      expect(article.cross_tenant_slugs).not.toContain(article.tenant_slug);
    }
  });

  it("preserva o catálogo em UTF-8 sem sequências de mojibake", () => {
    expect(migration).not.toMatch(/Ã(?:§|£|­|©|µ|º|¡|ª|³|´|¢| )/);
    expect(migration).not.toContain("â€");
  });
});
