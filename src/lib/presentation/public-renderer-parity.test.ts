import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const publicRoutes = [
  "src/app/page.tsx",
  "src/app/editoria/[slug]/page.tsx",
  "src/app/materia/[slug]/page.tsx",
];

describe("paridade entre portal público e preview administrativo", () => {
  it.each(publicRoutes)(
    "$file delega a apresentação ao renderer público compartilhado",
    (file) => {
      const source = readFileSync(file, "utf8");

      expect(source).toContain("PublicPortalRenderer");
    },
  );

  it("remove a segunda implementação visual da central de identidade", () => {
    const source = readFileSync(
      "src/components/admin/identity-workbench.tsx",
      "utf8",
    );

    expect(source).toContain("IdentityPortalPreview");
    expect(source).not.toMatch(
      /function (LivePortalPreview|PreviewHome|PreviewCategory|PreviewArticle)/,
    );
    expect(source).not.toContain("--preview-primary");
  });

  it("faz a superfície do preview usar o mesmo renderer do portal", () => {
    const source = readFileSync(
      "src/components/admin/identity-portal-preview.tsx",
      "utf8",
    );

    expect(source).toContain("PublicPortalRenderer");
  });
});
