import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/lib/admin/theme-form";

import {
  createPortalPreviewFixture,
  createPortalPreviewMessage,
  DEFAULT_PORTAL_PREVIEW_PAYLOAD,
  parsePortalPreviewMessage,
} from "./portal-preview";

describe("contrato do preview público", () => {
  it("aceita uma atualização tipada da identidade", () => {
    const message = createPortalPreviewMessage(DEFAULT_PORTAL_PREVIEW_PAYLOAD);

    expect(parsePortalPreviewMessage(message)).toEqual(message);
  });

  it("rejeita modelo de site desconhecido sem tentar renderizá-lo", () => {
    const message = createPortalPreviewMessage(DEFAULT_PORTAL_PREVIEW_PAYLOAD);
    const invalid = {
      ...message,
      payload: {
        ...message.payload,
        theme: { ...message.payload.theme, siteModel: "modelo-inexistente" },
      },
    };

    expect(parsePortalPreviewMessage(invalid)).toBeNull();
  });

  it("rejeita composição que não pertence ao modelo selecionado", () => {
    const message = createPortalPreviewMessage(DEFAULT_PORTAL_PREVIEW_PAYLOAD);
    const invalid = {
      ...message,
      payload: {
        ...message.payload,
        theme: { ...message.payload.theme, card: "image-top" },
      },
    };

    expect(parsePortalPreviewMessage(invalid)).toBeNull();
  });

  it("mantém um caso sem imagem nas fixtures compartilhadas", () => {
    const fixture = createPortalPreviewFixture(DEFAULT_PORTAL_PREVIEW_PAYLOAD);

    expect(fixture.stories.some((story) => story.imagePath === null)).toBe(true);
    expect(
      fixture.categoryStories.every(
        (story) => story.categoryName === fixture.categoryName,
      ),
    ).toBe(true);
  });

  it("parte de uma fixture com os três contrastes mínimos aprovados", () => {
    const theme = DEFAULT_PORTAL_PREVIEW_PAYLOAD.theme;

    expect(contrastRatio(theme.primary, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.primary, theme.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.textColor, theme.background)).toBeGreaterThanOrEqual(4.5);
  });

  it("protege a rota isolada do preview antes de renderizar", () => {
    const source = readFileSync(
      "src/app/admin/portal-preview/page.tsx",
      "utf8",
    );
    const guard = source.indexOf("await requireDemoSession();");
    const render = source.indexOf("return <IdentityPortalPreview />");

    expect(guard).toBeGreaterThanOrEqual(0);
    expect(render).toBeGreaterThan(guard);
  });
});
