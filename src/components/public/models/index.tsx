import type { ComponentType } from "react";

import type { SiteModelId } from "@/lib/presentation/site-models";

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

const HOME_MODELS: Record<SiteModelId, ComponentType<HomeModelProps>> = {
  "financial-services-credit": FinancialCreditHome,
  "health-pharma": HealthPharmaHome,
  "insurance-pension": InsuranceHome,
  "investments-asset-management": InvestmentsHome,
};

const CATEGORY_MODELS: Record<
  SiteModelId,
  ComponentType<CategoryModelProps>
> = {
  "financial-services-credit": FinancialCreditCategory,
  "health-pharma": HealthPharmaCategory,
  "insurance-pension": InsuranceCategory,
  "investments-asset-management": InvestmentsCategory,
};

const ARTICLE_MODELS: Record<
  SiteModelId,
  ComponentType<ArticleModelProps>
> = {
  "financial-services-credit": FinancialCreditArticle,
  "health-pharma": HealthPharmaArticle,
  "insurance-pension": InsuranceArticle,
  "investments-asset-management": InvestmentsArticle,
};

export function SiteModelHome({
  siteModel,
  ...props
}: HomeModelProps & { siteModel: SiteModelId }) {
  const Model = HOME_MODELS[siteModel];
  return <Model {...props} />;
}

export function SiteModelCategory({
  siteModel,
  ...props
}: CategoryModelProps & { siteModel: SiteModelId }) {
  const Model = CATEGORY_MODELS[siteModel];
  return <Model {...props} />;
}

export function SiteModelArticle({
  siteModel,
  ...props
}: ArticleModelProps & { siteModel: SiteModelId }) {
  const Model = ARTICLE_MODELS[siteModel];
  return <Model {...props} />;
}
