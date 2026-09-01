import {
  APPROVED_CARDS,
  APPROVED_FONTS,
  APPROVED_HEADERS,
  APPROVED_HEROES,
  type ThemeValues,
} from "@/lib/admin/theme-form";
import type { MarketQuote } from "@/lib/market/types";
import {
  getSiteModelDefinition,
  parseSiteModel,
} from "@/lib/presentation/site-models";
import type {
  PublicStory,
  PublicTenant,
} from "@/lib/supabase/portal-repository";

export const PORTAL_PREVIEW_MESSAGE_TYPE = "broadcast:portal-preview:v1";

export type PortalPreviewPage = "editoria" | "home" | "materia";
export type PortalPreviewWidth = 390 | 768 | 1440;

export type PortalPreviewPayload = {
  page: PortalPreviewPage;
  tenantId: string;
  tenantSlug: string;
  theme: ThemeValues;
};

export type PortalPreviewMessage = {
  payload: PortalPreviewPayload;
  type: typeof PORTAL_PREVIEW_MESSAGE_TYPE;
};

const DEFAULT_PREVIEW_THEME: ThemeValues = {
  accent: "#D9912B",
  background: "#F7F9F8",
  brandName: "Preview editorial",
  card: "data-led",
  font: "sans-editorial",
  header: "masthead-minimal",
  hero: "science-feature",
  logoAlt: "",
  logoUrl: null,
  primary: "#0B4A5A",
  secondary: "#1F7A8C",
  siteModel: "health-pharma",
  slogan: "Identidade em preparação",
  textColor: "#15272C",
};

export const DEFAULT_PORTAL_PREVIEW_PAYLOAD: PortalPreviewPayload = {
  page: "home",
  tenantId: "preview",
  tenantSlug: "preview-editorial",
  theme: DEFAULT_PREVIEW_THEME,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAllowed<T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === "string" && allowed.some((item) => item === value);
}

function parsePreviewTheme(value: unknown): ThemeValues | null {
  if (!isRecord(value)) return null;
  const siteModel = parseSiteModel(value.siteModel);
  const color = /^#[0-9a-f]{6}$/i;
  const colors = [
    value.accent,
    value.background,
    value.primary,
    value.secondary,
    value.textColor,
  ];
  if (!siteModel || colors.some((item) => typeof item !== "string" || !color.test(item))) {
    return null;
  }
  if (
    !isAllowed(value.card, APPROVED_CARDS) ||
    !isAllowed(value.font, APPROVED_FONTS) ||
    !isAllowed(value.header, APPROVED_HEADERS) ||
    !isAllowed(value.hero, APPROVED_HEROES) ||
    typeof value.brandName !== "string" ||
    typeof value.slogan !== "string" ||
    typeof value.logoAlt !== "string" ||
    !(typeof value.logoUrl === "string" || value.logoUrl === null)
  ) {
    return null;
  }
  const composition = getSiteModelDefinition(siteModel).composition;
  if (
    value.card !== composition.card ||
    value.header !== composition.header ||
    value.hero !== composition.hero
  ) {
    return null;
  }
  return { ...value, siteModel } as ThemeValues;
}

export function createPortalPreviewMessage(
  payload: PortalPreviewPayload,
): PortalPreviewMessage {
  return { payload, type: PORTAL_PREVIEW_MESSAGE_TYPE };
}

export function parsePortalPreviewMessage(
  value: unknown,
): PortalPreviewMessage | null {
  if (!isRecord(value) || value.type !== PORTAL_PREVIEW_MESSAGE_TYPE) {
    return null;
  }
  const payload = value.payload;
  if (!isRecord(payload)) return null;
  const page = payload.page;
  const theme = parsePreviewTheme(payload.theme);
  if (
    !theme ||
    !["home", "editoria", "materia"].includes(String(page)) ||
    typeof payload.tenantId !== "string" ||
    payload.tenantId.length === 0 ||
    typeof payload.tenantSlug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.tenantSlug)
  ) {
    return null;
  }
  return createPortalPreviewMessage({
    page: page as PortalPreviewPage,
    tenantId: payload.tenantId,
    tenantSlug: payload.tenantSlug,
    theme,
  });
}

const STORY_SEEDS = [
  {
    categoryName: "Empresas",
    categorySlug: "empresas",
    imagePath: "/images/editorial/2026-07/economia-saude.webp",
    subtitle:
      "Mudanças demográficas aproximam saúde, patrimônio, trabalho e inovação.",
    title: "Longevidade amplia o horizonte das decisões econômicas",
  },
  {
    categoryName: "Pesquisa",
    categorySlug: "pesquisa",
    imagePath: "/images/editorial/2026-07/pesquisa-clinica.webp",
    subtitle: "Pesquisa aplicada transforma prevenção em estratégia de longo prazo.",
    title: "Prevenção ganha espaço nas decisões de empresas e famílias",
  },
  {
    categoryName: "Tecnologia e Inovação",
    categorySlug: "ti",
    imagePath: "/images/editorial/2026-07/ia-saude.webp",
    subtitle: "Ferramentas digitais ampliam acesso sem substituir o cuidado humano.",
    title: "Tecnologia aproxima informação e escolhas de saúde",
  },
  {
    categoryName: "Investimentos",
    categorySlug: "investimentos",
    imagePath: null,
    subtitle: "O estado sem imagem também precisa preservar hierarquia e leitura.",
    title: "Planejamento de longo prazo exige produtos mais claros",
  },
  {
    categoryName: "Regulação",
    categorySlug: "regulacao",
    imagePath: "/images/editorial/2026-07/industria-farmaceutica.webp",
    subtitle: "Transparência regulatória reduz incerteza para todo o ecossistema.",
    title: "Novas regras reorganizam prioridades do setor",
  },
  {
    categoryName: "Análise",
    categorySlug: "analise",
    imagePath: "/images/editorial/2026-07/envelhecimento-saudavel.webp",
    subtitle: "Vidas mais longas mudam a forma de organizar trabalho e patrimônio.",
    title: "Carreiras mais longas pedem novas formas de proteção",
  },
] as const;

const PREVIEW_STORIES: PublicStory[] = STORY_SEEDS.map((seed, index) => ({
  author: "Marina Vale",
  body: [
    "Viver mais altera a sequência das decisões e amplia a importância de escolhas que possam ser revistas ao longo do tempo.",
    "O movimento também cria oportunidades para serviços claros, inclusivos e conectados às diferentes fases da vida adulta.",
  ],
  canonicalSlug: `preview-materia-${index + 1}`,
  categoryName: seed.categoryName,
  categorySlug: seed.categorySlug,
  correctionNote: null,
  editorialOrder: index + 1,
  externalOnly: false,
  id: `preview-story-${index + 1}`,
  imageAlt: seed.imagePath ? "Cena editorial demonstrativa" : null,
  imagePath: seed.imagePath,
  isRealContent: false,
  publishedAt: "2026-07-27T12:00:00.000Z",
  sourceLabel: null,
  sourceUrl: null,
  sponsorshipLabel: null,
  subtitle: seed.subtitle,
  title: seed.title,
}));

const PREVIEW_MARKET_QUOTES: MarketQuote[] = [
  {
    changePercent: 0.72,
    kind: "equity",
    label: "Índice demonstrativo",
    price: 128.42,
    referenceAt: "2026-07-27T12:00:00.000Z",
    source: "B3",
    symbol: "SAÚDE",
  },
  {
    changePercent: null,
    kind: "currency",
    label: "Dólar de referência",
    price: 5.43,
    referenceAt: "2026-07-27T12:00:00.000Z",
    source: "Frankfurter",
    symbol: "USD",
  },
];

export function createPortalPreviewFixture(payload: PortalPreviewPayload) {
  const tenant: PublicTenant = {
    displayName: payload.theme.brandName,
    id: payload.tenantId,
    slug: payload.tenantSlug,
    slogan: payload.theme.slogan,
  };
  const categories = STORY_SEEDS.map(({ categoryName, categorySlug }) => ({
    name: categoryName,
    slug: categorySlug,
  }));

  return {
    categories,
    categoryStories: PREVIEW_STORIES.filter(
      (story) => story.categorySlug === PREVIEW_STORIES[0]!.categorySlug,
    ),
    categoryName: PREVIEW_STORIES[0]!.categoryName,
    hero: PREVIEW_STORIES[0]!,
    heroEyebrow: "Longevidade & economia",
    marketQuotes: PREVIEW_MARKET_QUOTES,
    stories: PREVIEW_STORIES,
    story: PREVIEW_STORIES[0]!,
    tenant,
  };
}
