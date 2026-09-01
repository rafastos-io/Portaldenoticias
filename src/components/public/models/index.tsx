import type { ComponentType } from "react";

import {
  parseSiteModel,
  SITE_MODELS,
  type SiteModelDefinition,
  type SiteModelId,
} from "@/lib/presentation/site-models";

import {
  FinancialCreditArticle,
  FinancialCreditCategory,
  FinancialCreditHome,
} from "./financial-credit-model";
import {
  HealthPharmaArticle,
  HealthPharmaCategory,
  HealthPharmaHome,
} from "./health-pharma-model";
import {
  InsuranceArticle,
  InsuranceCategory,
  InsuranceHome,
} from "./insurance-model";
import {
  InvestmentsArticle,
  InvestmentsCategory,
  InvestmentsHome,
} from "./investments-model";
import type {
  ArticleModelProps,
  CategoryModelProps,
  HomeModelProps,
} from "./model-types";

export type SiteModelRegistration = {
  Article: ComponentType<ArticleModelProps>;
  Category: ComponentType<CategoryModelProps>;
  Home: ComponentType<HomeModelProps>;
  definition: SiteModelDefinition;
};

export const SITE_MODEL_REGISTRY = {
  "financial-services-credit": {
    Article: FinancialCreditArticle,
    Category: FinancialCreditCategory,
    Home: FinancialCreditHome,
    definition: SITE_MODELS["financial-services-credit"],
  },
  "health-pharma": {
    Article: HealthPharmaArticle,
    Category: HealthPharmaCategory,
    Home: HealthPharmaHome,
    definition: SITE_MODELS["health-pharma"],
  },
  "insurance-pension": {
    Article: InsuranceArticle,
    Category: InsuranceCategory,
    Home: InsuranceHome,
    definition: SITE_MODELS["insurance-pension"],
  },
  "investments-asset-management": {
    Article: InvestmentsArticle,
    Category: InvestmentsCategory,
    Home: InvestmentsHome,
    definition: SITE_MODELS["investments-asset-management"],
  },
} satisfies Readonly<Record<SiteModelId, SiteModelRegistration>>;

export function getSiteModelRegistration(
  value: unknown,
): SiteModelRegistration | null {
  const siteModel = parseSiteModel(value);
  return siteModel ? SITE_MODEL_REGISTRY[siteModel] : null;
}

export function SiteModelHome({
  siteModel,
  ...props
}: HomeModelProps & { siteModel: SiteModelId }) {
  const Model = SITE_MODEL_REGISTRY[siteModel].Home;
  return <Model {...props} />;
}

export function SiteModelCategory({
  siteModel,
  ...props
}: CategoryModelProps & { siteModel: SiteModelId }) {
  const Model = SITE_MODEL_REGISTRY[siteModel].Category;
  return <Model {...props} />;
}

export function SiteModelArticle({
  siteModel,
  ...props
}: ArticleModelProps & { siteModel: SiteModelId }) {
  const Model = SITE_MODEL_REGISTRY[siteModel].Article;
  return <Model {...props} />;
}
