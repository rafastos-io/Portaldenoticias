import {
  SiteModelArticle,
  SiteModelCategory,
  SiteModelHome,
} from "@/components/public/models";
import { PublicShell } from "@/components/public/public-shell";
import type { ThemeValues } from "@/lib/admin/theme-form";
import type { MarketQuote } from "@/lib/market/types";
import type {
  PublicStory,
  PublicTenant,
} from "@/lib/supabase/portal-repository";

type PublicPortalBaseProps = {
  categories: Array<{ name: string; slug: string }>;
  tenant: PublicTenant;
  theme: ThemeValues;
};

type PublicPortalHomeProps = PublicPortalBaseProps & {
  hero: PublicStory;
  heroEyebrow?: string | null;
  marketQuotes: MarketQuote[];
  page: "home";
  stories: PublicStory[];
};

type PublicPortalCategoryProps = PublicPortalBaseProps & {
  categoryName: string;
  page: "editoria";
  stories: PublicStory[];
};

type PublicPortalArticleProps = PublicPortalBaseProps & {
  page: "materia";
  story: PublicStory;
};

export type PublicPortalRendererProps =
  | PublicPortalHomeProps
  | PublicPortalCategoryProps
  | PublicPortalArticleProps;

export function PublicPortalRenderer(props: PublicPortalRendererProps) {
  const { categories, tenant, theme } = props;

  return (
    <PublicShell categories={categories} tenant={tenant} theme={theme}>
      {props.page === "home" ? (
        <main id="conteudo-principal">
          <SiteModelHome
            hero={props.hero}
            heroEyebrow={props.heroEyebrow}
            marketQuotes={props.marketQuotes}
            siteModel={theme.siteModel}
            stories={props.stories}
            tenant={tenant}
          />
        </main>
      ) : props.page === "editoria" ? (
        <SiteModelCategory
          categoryName={props.categoryName}
          siteModel={theme.siteModel}
          stories={props.stories}
          tenant={tenant}
        />
      ) : (
        <SiteModelArticle
          siteModel={theme.siteModel}
          story={props.story}
          tenant={tenant}
        />
      )}
    </PublicShell>
  );
}
