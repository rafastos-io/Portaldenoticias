import { describe, expect, it } from "vitest";

import { SITE_MODELS } from "./site-models";
import { getPublicBrandCopy } from "./public-brand-copy";

describe("copy pública por marca", () => {
  it("posiciona o BV Educação como portal de educação financeira", () => {
    const copy = getPublicBrandCopy(
      "bv-educacao",
      SITE_MODELS["financial-services-credit"],
    );

    expect(copy).toEqual({
      footerDescription:
        "Informação clara para organizar o orçamento, entender o crédito, prevenir golpes e planejar escolhas com mais confiança.",
      footerTopics: "Crédito · Planejamento · Segurança",
      headerEyebrow: "Educação financeira",
      headerTopics: "Crédito · Planejamento · Segurança",
    });
    expect(JSON.stringify(copy)).not.toMatch(/saúde|longevidade/i);
  });

  it("preserva o posicionamento padrão dos demais tenants", () => {
    const model = SITE_MODELS["financial-services-credit"];
    const copy = getPublicBrandCopy("banco-demo-horizonte", model);

    expect(copy.headerEyebrow).toBe(model.eyebrow);
    expect(copy.headerTopics).toBe("Saúde · Economia · Longevidade");
  });
});
