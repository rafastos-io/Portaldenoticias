import type { MarketQuote } from "@/lib/market/types";
import type {
  PublicStory,
  PublicTenant,
} from "@/lib/supabase/portal-repository";

export type HomeModelProps = {
  hero: PublicStory;
  heroEyebrow?: string | null;
  marketQuotes: MarketQuote[];
  stories: PublicStory[];
  tenant: PublicTenant;
};
export type CategoryModelProps = {
  categoryName: string;
  stories: PublicStory[];
  tenant: PublicTenant;
};

export type ArticleModelProps = {
  story: PublicStory;
  tenant: PublicTenant;
};
