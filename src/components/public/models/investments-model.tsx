import { MarketTicker } from "@/components/public/market-ticker";

import type {
  ArticleModelProps,
  CategoryModelProps,
  HomeModelProps,
} from "./model-types";
import {
  ArticleBody,
  PublishedMeta,
  StoryCategory,
  StoryDisclosure,
  StoryImage,
  StoryTitleLink,
} from "./story-primitives";

export function InvestmentsHome({
  hero,
  heroEyebrow,
  marketQuotes,
  stories,
  tenant,
}: HomeModelProps) {
  const rail = stories.slice(1, 4);
  return (
    <>
      <MarketTicker quotes={marketQuotes} />
      <section className="page-container py-8 sm:py-11">
        <div className="grid gap-8 border-b-4 border-text-primary pb-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
          <article className="group grid min-w-0 gap-6 md:grid-cols-[0.9fr_1.1fr]">
            <div className="hero-copy self-end">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                {heroEyebrow ?? "Leitura de cenário"}
              </p>
              <h1 className="mt-4 font-heading text-[clamp(2.8rem,5.7vw,5.5rem)] leading-[0.91] font-bold tracking-[-0.055em] text-brand-primary">
                {hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-text-muted">
                {hero.subtitle}
              </p>
              <StoryTitleLink
                className="mt-6 inline-flex min-h-11 items-center border-b-2 border-text-primary py-2 text-xs font-bold uppercase tracking-[0.14em]"
                story={hero}
                tenant={tenant}
              >
                Ler análise <span aria-hidden="true">↗</span>
              </StoryTitleLink>
            </div>
            <StoryTitleLink story={hero} tenant={tenant}>
              <StoryImage
                className="hero-media aspect-[4/5] min-h-80"
                priority
                sizes="(max-width: 768px) 100vw, 34vw"
                story={hero}
              />
            </StoryTitleLink>
          </article>
          <aside className="border-t-2 border-text-primary lg:border-t-0 lg:border-l lg:pl-7">
            <p className="pb-4 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              Três leituras agora
            </p>
            {rail.map((story, index) => (
              <article className="border-t border-border-subtle py-5" key={story.id}>
                <p className="font-mono text-[0.65rem] text-text-muted">
                  INSIGHT {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 font-heading text-xl leading-6 font-bold">
                  <StoryTitleLink story={story} tenant={tenant} />
                </h2>
                <p className="mt-3 text-xs leading-5 text-text-muted">
                  {story.categoryName} · {story.author}
                </p>
              </article>
            ))}
          </aside>
        </div>
      </section>
      <InvestmentsAnalysisList stories={stories.slice(4)} tenant={tenant} />
    </>
  );
}
function InvestmentsAnalysisList({
  stories,
  tenant,
}: Pick<HomeModelProps, "stories" | "tenant">) {
  if (stories.length === 0) return null;
  return (
    <section className="page-container py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.38fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
            Pesquisa editorial
          </p>
          <h2 className="mt-3 font-heading text-4xl leading-tight font-bold">
            Análises recentes
          </h2>
        </div>
        <div className="border-t-2 border-text-primary">
          {stories.slice(0, 8).map((story, index) => (
            <article
              className="group grid grid-cols-[2rem_1fr] gap-4 border-b border-border-subtle py-5 sm:grid-cols-[3rem_1fr_9rem]"
              key={story.id}
            >
              <span className="font-mono text-xs text-text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <StoryCategory story={story} tenant={tenant} />
                <h3 className="mt-2 font-heading text-xl leading-6 font-bold sm:text-2xl">
                  <StoryTitleLink story={story} tenant={tenant} />
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-muted">
                  {story.subtitle}
                </p>
              </div>
              <p className="hidden text-right text-xs leading-5 text-text-muted sm:block">
                {story.author}
                <br />
                perfil fictício
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InvestmentsCategory({
  categoryName,
  stories,
  tenant,
}: CategoryModelProps) {
  return (
    <main className="page-container py-10 sm:py-14" id="conteudo-principal">
      <header className="grid gap-7 border-y-4 border-text-primary py-7 lg:grid-cols-[1fr_0.5fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
            Índice de pesquisa
          </p>
          <h1 className="mt-3 font-heading text-5xl leading-none font-bold tracking-[-0.04em] sm:text-7xl">
            {categoryName}
          </h1>
        </div>
        <p className="self-end text-sm leading-6 text-text-muted">
          Análises e contexto demonstrativos, organizados para leitura de
          cenário. Nenhum conteúdo constitui recomendação individual.
        </p>
      </header>
      <InvestmentsAnalysisList stories={stories} tenant={tenant} />
    </main>
  );
}

export function InvestmentsArticle({ story, tenant }: ArticleModelProps) {
  return (
    <main id="conteudo-principal">
      <article>
        <header className="page-container py-10 sm:py-14">
          <div className="grid gap-8 border-b-4 border-text-primary pb-9 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="hero-copy">
              <StoryCategory story={story} tenant={tenant} />
              <StoryDisclosure story={story} />
              <h1 className="mt-5 max-w-5xl font-heading text-[clamp(2.8rem,6.2vw,6.2rem)] leading-[0.91] font-bold tracking-[-0.055em] text-brand-primary">
                {story.title}
              </h1>
            </div>
            <div className="self-end border-t border-border-subtle pt-5">
              <p className="text-lg leading-8 text-text-muted">{story.subtitle}</p>
              <div className="mt-6">
                <PublishedMeta story={story} />
              </div>
            </div>
          </div>
        </header>
        <div className="page-container">
          <StoryImage
            className="hero-media aspect-[16/7]"
            priority
            sizes="(max-width: 1240px) 100vw, 1240px"
            story={story}
          />
        </div>
        {!story.imagePath ? (
          <p className="page-container border-y border-border-subtle py-5 text-sm text-text-muted">
            Esta análise demonstrativa foi publicada sem imagem.
          </p>
        ) : null}
        <div className="page-container grid gap-10 py-10 lg:grid-cols-[minmax(0,46rem)_16rem] lg:py-16">
          <ArticleBody story={story} />
          <aside className="h-fit border-y-2 border-text-primary py-5 text-sm leading-6 text-text-muted">
            <strong className="text-text-primary">Nota de contexto</strong>
            <p className="mt-2">
              Conteúdo editorial fictício. Não é recomendação de investimento
              nem considera objetivos individuais.
            </p>
          </aside>
        </div>
      </article>
    </main>
  );
}
