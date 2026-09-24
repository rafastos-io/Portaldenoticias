export type LegacyComposition = {
  card: "compact-horizontal" | "data-led" | "image-top";
  header: "brand-centered" | "masthead-clean" | "masthead-minimal";
  hero: "featured-grid" | "science-feature" | "split-editorial";
};

export type SiteModelFontKey =
  | "sans-editorial"
  | "sans-humana"
  | "sans-geometrica";

export type SiteModelBrandCopy = {
  footerDescription: string;
  footerTopics: string;
  headerTopics: string;
};

type SiteModelDefinitionShape = {
  brandCopy?: SiteModelBrandCopy;
  composition: LegacyComposition;
  description: string;
  eyebrow: string;
  /** Font stacks that replace the shared defaults only inside this model. */
  fontStacks?: Partial<Record<SiteModelFontKey, string>>;
  /** Maximum categories in the header navigation; null shows all. */
  headerCategoryLimit: number | null;
  id: string;
  label: string;
  navigation: readonly string[];
};

const SITE_MODEL_DEFINITIONS = {
  "financial-services-credit": {
    composition: {
      card: "image-top",
      header: "masthead-clean",
      hero: "featured-grid",
    },
    description:
      "Central editorial de serviços com entrada por necessidade, atalhos e explicadores.",
    eyebrow: "Serviços & decisões",
    headerCategoryLimit: null,
    id: "financial-services-credit",
    label: "Serviços financeiros e crédito",
    navigation: [
      "Crédito",
      "Empresas",
      "Moradia",
      "Pagamentos",
      "Segurança",
      "Planejamento",
    ],
  },
  "investments-asset-management": {
    composition: {
      card: "data-led",
      header: "masthead-clean",
      hero: "split-editorial",
    },
    description:
      "Publicação premium de inteligência com leitura de cenário, rail analítico e alta densidade.",
    eyebrow: "Inteligência de mercado",
    headerCategoryLimit: 5,
    id: "investments-asset-management",
    label: "Investimentos e gestão de recursos",
    navigation: [
      "Mercados",
      "Renda fixa",
      "Renda variável",
      "Fundos",
      "Patrimônio",
      "Longevidade",
    ],
  },
  "insurance-pension": {
    composition: {
      card: "compact-horizontal",
      header: "brand-centered",
      hero: "featured-grid",
    },
    description:
      "Guia humano de proteção e longevidade organizado por objetivos e fases da vida.",
    eyebrow: "Proteção ao longo da vida",
    headerCategoryLimit: 5,
    id: "insurance-pension",
    label: "Seguros e previdência",
    navigation: [
      "Proteger renda",
      "Aposentadoria",
      "Cuidar da saúde",
      "Família",
      "Empresas",
      "Longevidade",
    ],
  },
  "health-pharma": {
    composition: {
      card: "data-led",
      header: "masthead-minimal",
      hero: "science-feature",
    },
    description:
      "Briefing científico contemporâneo para pesquisa, inovação, regulação e negócios.",
    eyebrow: "Ciência, saúde & negócios",
    headerCategoryLimit: 9,
    id: "health-pharma",
    label: "Saúde e indústria farmacêutica",
    navigation: [
      "Indústria farmacêutica",
      "Biotecnologia",
      "Pesquisa",
      "Saúde digital",
      "Regulação",
      "Longevidade",
    ],
  },
  "automotive-mobility": {
    brandCopy: {
      footerDescription:
        "Informação para quem compra, financia e dirige: crédito, mercado, segurança, estrada e cultura automotiva em uma experiência editorial white-label.",
      footerTopics: "Crédito · Mercado · Estrada",
      headerTopics: "Crédito · Mercado · Estrada",
    },
    composition: {
      card: "image-top",
      header: "masthead-clean",
      hero: "featured-grid",
    },
    description:
      "Portal de notícias automotivo em faixas temáticas: dinheiro, carro e mobilidade antes, durante e depois da compra.",
    eyebrow: "Dinheiro · Carro · Mobilidade",
    fontStacks: {
      "sans-geometrica":
        "var(--font-dm-sans), 'DM Sans', Arial, Helvetica, sans-serif",
    },
    headerCategoryLimit: null,
    id: "automotive-mobility",
    label: "Mobilidade e automotivo",
    navigation: [
      "Crédito",
      "Concessionárias",
      "Evite Acidentes",
      "Raridade",
      "Ruas e Avenidas",
      "Estradas",
      "Serviços e Manutenção",
      "Ainda terei um carro assim",
      "Área do Piloto",
    ],
  },
} as const satisfies Readonly<Record<string, SiteModelDefinitionShape>>;

export type SiteModelId = keyof typeof SITE_MODEL_DEFINITIONS;

export type SiteModelDefinition = Omit<SiteModelDefinitionShape, "id"> & {
  id: SiteModelId;
};

export const SITE_MODELS: Readonly<
  Record<SiteModelId, SiteModelDefinition>
> = SITE_MODEL_DEFINITIONS;

export const SITE_MODEL_IDS = Object.freeze(
  Object.keys(SITE_MODELS) as SiteModelId[],
);

function uniqueCompositionValues<Key extends keyof LegacyComposition>(
  key: Key,
): readonly LegacyComposition[Key][] {
  return Object.freeze([
    ...new Set(SITE_MODEL_IDS.map((id) => SITE_MODELS[id].composition[key])),
  ]);
}

export const SITE_MODEL_HEADERS = uniqueCompositionValues("header");
export const SITE_MODEL_HEROES = uniqueCompositionValues("hero");
export const SITE_MODEL_CARDS = uniqueCompositionValues("card");

export const LEGACY_COMPONENT_COMPATIBILITY = Object.freeze({
  fields: ["header", "hero", "card"] as const,
  mode: "derived-read-only",
  removeAfter: "2026-10-31",
  removalMilestone: "R311",
});

const LEGACY_SITE_MODELS: Readonly<Record<string, SiteModelId>> = {
  "00000000-0000-4000-8000-000000000002":
    "investments-asset-management",
  "00000000-0000-4000-8000-000000000003": "insurance-pension",
  "00000000-0000-4000-8000-000000000004": "health-pharma",
};

export function parseSiteModel(value: unknown): SiteModelId | null {
  return typeof value === "string" &&
    SITE_MODEL_IDS.some((candidate) => candidate === value)
    ? (value as SiteModelId)
    : null;
}

export function resolveLegacySiteModel(tenantId: string) {
  return LEGACY_SITE_MODELS[tenantId] ?? null;
}

export function getSiteModelDefinition(siteModel: SiteModelId) {
  return SITE_MODELS[siteModel];
}
