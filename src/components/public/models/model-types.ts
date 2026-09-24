import type { ThemeValues } from "@/lib/admin/theme-form";
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

/** Props for optional model-owned header and footer chrome. */
export type ShellChromeProps = {
  categories: Array<{ name: string; slug: string }>;
  tenant: PublicTenant;
  theme: ThemeValues;
};
