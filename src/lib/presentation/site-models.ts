export const SITE_MODEL_IDS = [
  "financial-services-credit",
  "investments-asset-management",
  "insurance-pension",
  "health-pharma",
] as const;

export type SiteModelId = (typeof SITE_MODEL_IDS)[number];

type LegacyComposition = {
  card: "compact-horizontal" | "data-led" | "image-top";
  header: "brand-centered" | "masthead-clean" | "masthead-minimal";
  hero: "featured-grid" | "science-feature" | "split-editorial";
};

export type SiteModelDefinition = {
  composition: LegacyComposition;
  description: string;
  eyebrow: string;
  id: SiteModelId;
  label: string;
  navigation: readonly string[];
};

export const SITE_MODELS: Record<SiteModelId, SiteModelDefinition> = {
  "financial-services-credit": {
    composition: {
      card: "image-top",
      header: "masthead-clean",
      hero: "featured-grid",
    },
    description:
      "Central editorial de serviços com entrada por necessidade, atalhos e explicadores.",
    eyebrow: "Serviços & decisões",
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
};

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
