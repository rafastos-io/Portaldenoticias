import type { SiteModelDefinition } from "./site-models";

export type PublicBrandCopy = {
  footerDescription: string;
  footerTopics: string;
  headerEyebrow: string;
  headerTopics: string;
};

export function getPublicBrandCopy(
  tenantSlug: string,
  model: SiteModelDefinition,
): PublicBrandCopy {
  if (tenantSlug === "bv-educacao") {
    return {
      footerDescription:
        "Informação clara para organizar o orçamento, entender o crédito, prevenir golpes e planejar escolhas com mais confiança.",
      footerTopics: "Crédito · Planejamento · Segurança",
      headerEyebrow: "Educação financeira",
      headerTopics: "Crédito · Planejamento · Segurança",
    };
  }

  if (model.brandCopy) {
    return { ...model.brandCopy, headerEyebrow: model.eyebrow };
  }

  return {
    footerDescription:
      "Jornalismo sobre saúde, longevidade, inovação e seus impactos econômicos, apresentado em uma experiência editorial white-label.",
    footerTopics: "Saúde · Economia · Longevidade",
    headerEyebrow: model.eyebrow,
    headerTopics: "Saúde · Economia · Longevidade",
  };
}
