import type {
  ArticleModelProps,
  CategoryModelProps,
  HomeModelProps,
} from "./model-types";
import { MarketTicker } from "../market-ticker";
import {
  ArticleBody,
  PublishedMeta,
  StoryCategory,
  StoryDisclosure,
  StoryImage,
  StoryTitleLink,
} from "./story-primitives";

export function HealthPharmaHome({
  hero,
  heroEyebrow,
  marketQuotes,
  stories,
  tenant,
}: HomeModelProps) {
  const highlights = stories.filter((story) => story.id !== hero.id).slice(0, 3);
  const categoryOrder = [
    { name: "Empresas", slug: "empresas" },
    { name: "M&A", slug: "m-a" },
    { name: "RelGov", slug: "relgov" },
    { name: "Investimentos", slug: "investimentos" },
    { name: "Regulação", slug: "regulacao" },
    { name: "Pesquisa", slug: "pesquisa" },
    { name: "Tecnologia e Inovação", slug: "ti" },
    { name: "Análise", slug: "analise" },
    { name: "Radar da Imprensa", slug: "radar-da-imprensa" },
  ];
  const editorialStories = stories
    .filter((story) => story.id !== hero.id)
    .sort(
      (left, right) =>
        (left.editorialOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.editorialOrder ?? Number.MAX_SAFE_INTEGER),
    );
  return (
    <>
      <MarketTicker label="Saúde na bolsa" quotes={marketQuotes} />
      <section className="page-container py-7 sm:py-8">
        <article className="group grid gap-7 border-t-4 border-brand-primary pt-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div className="hero-copy order-2 self-end lg:order-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                {heroEyebrow ?? "Briefing científico"}
              </p>
              <span className="border border-border-subtle px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-text-muted">
                {hero.isRealContent ? "Conteúdo autorizado" : "Contexto demonstrativo"}
              </span>
            </div>
            <h1 className="mt-4 font-heading text-[clamp(2.5rem,4.35vw,4.25rem)] leading-[0.96] font-bold tracking-[-0.045em] text-brand-primary">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
              {hero.subtitle}
            </p>
            <div className="mt-5 flex items-center gap-4 border-t border-border-subtle pt-3 text-xs text-text-muted">
              <span>{hero.categoryName}</span>
              <span aria-hidden="true">/</span>
              <span>{hero.author}</span>
            </div>
          </div>
          <StoryTitleLink className="order-1 lg:order-2" story={hero} tenant={tenant}>
            <StoryImage
              className="hero-media aspect-[16/11]"
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              story={hero}
            />
          </StoryTitleLink>
        </article>
      </section>

      {highlights.length > 0 ? (
        <section className="border-y border-border-subtle bg-surface-raised" id="destaques">
          <div className="page-container py-10 sm:py-14">
            <div className="flex items-end justify-between gap-6 border-b-2 border-brand-primary pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                  Agenda setorial
                </p>
                <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
                  Destaques
                </h2>
              </div>
              <p className="hidden max-w-md text-right text-sm leading-6 text-text-muted md:block">
                Empresas, regulação, pesquisa, tecnologia e movimentos de capital
                que moldam o setor de saúde.
              </p>
            </div>
            <div className="mt-6 grid gap-px bg-border-subtle lg:grid-cols-3">
              {highlights.map((story, index) => (
                <article className="group bg-surface-raised p-5" key={story.id}>
                  {index === 0 ? (
                    <StoryTitleLink story={story} tenant={tenant}>
                      <StoryImage
                        className="mb-5 aspect-[16/9]"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        story={story}
                      />
                    </StoryTitleLink>
                  ) : null}
                  <StoryCategory story={story} tenant={tenant} />
                  <h3 className="mt-3 font-heading text-2xl leading-7 font-bold">
                    <StoryTitleLink story={story} tenant={tenant} />
                  </h3>
                  {story.subtitle ? (
                    <p className="mt-4 text-sm leading-6 text-text-muted">
                      {story.subtitle}
                    </p>
                  ) : null}
                  <p className="mt-5 border-t border-border-subtle pt-3 text-xs text-text-muted">
                    {story.sourceLabel ? `Fonte: ${story.sourceLabel}` : story.author}
                    {story.externalOnly ? " · íntegra na origem" : ""}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="page-container py-10 sm:py-16" id="editorias">
        <div className="grid gap-10 lg:grid-cols-[0.26fr_1fr]">
          <header className="lg:sticky lg:top-5 lg:h-fit">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
              Cobertura completa
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold">Editorias</h2>
            <p className="mt-4 text-sm leading-7 text-text-muted">
              O mesmo catálogo canônico é distribuído para Abrafarma e Broadcast
              Saúde, respeitando origem e direitos de cada conteúdo.
            </p>
          </header>
          <div className="border-t-2 border-brand-primary">
            {categoryOrder.map((category) => {
              const categoryStories = editorialStories.filter(
                (story) => story.categorySlug === category.slug,
              );
              if (categoryStories.length === 0) return null;
              return (
                <section
                  aria-labelledby={`editoria-${category.slug}`}
                  className="grid gap-5 border-b border-border-subtle py-7 md:grid-cols-[0.26fr_1fr]"
                  key={category.slug}
                >
                  <div>
                    <h3
                      className="font-heading text-2xl font-bold text-brand-primary"
                      id={`editoria-${category.slug}`}
                    >
                      {category.name}
                    </h3>
                    <p className="mt-1 font-mono text-[0.65rem] text-text-muted">
                      {String(categoryStories.length).padStart(2, "0")} pauta
                      {categoryStories.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="grid gap-px bg-border-subtle sm:grid-cols-2">
                    {categoryStories.map((story, index) => (
                      <article
                        className={`bg-surface-page p-5 ${
                          categoryStories.length % 2 === 1 &&
                          index === categoryStories.length - 1
                            ? "sm:col-span-2"
                            : ""
                        }`}
                        key={story.id}
                      >
                        <h4 className="font-heading text-xl leading-7 font-bold">
                          <StoryTitleLink story={story} tenant={tenant} />
                        </h4>
                        {story.subtitle ? (
                          <p className="mt-3 text-sm leading-6 text-text-muted">
                            {story.subtitle}
                          </p>
                        ) : null}
                        <p className="mt-4 text-xs font-semibold text-text-muted">
                          {story.sourceLabel ? `Fonte: ${story.sourceLabel}` : story.author}
                          {story.externalOnly ? " · referência externa" : ""}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
export function HealthPharmaCategory({
  categoryName,
  stories,
  tenant,
}: CategoryModelProps) {
  return (
    <main className="page-container py-10 sm:py-14" id="conteudo-principal">
      <header className="grid gap-7 border-t-4 border-brand-primary pt-6 lg:grid-cols-[1fr_0.6fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
            Campo de cobertura
          </p>
          <h1 className="mt-4 font-heading text-5xl leading-none font-bold tracking-[-0.04em] sm:text-7xl">
            {categoryName}
          </h1>
        </div>
        <p className="self-end border-l-2 border-accent pl-5 text-sm leading-7 text-text-muted">
          Cobertura editorial de empresas, ciência, regulação, tecnologia e
          seus impactos econômicos, com procedência identificada em cada pauta.
        </p>
      </header>
      <section aria-label="Briefings da editoria" className="mt-10 grid gap-px bg-border-subtle md:grid-cols-2">
        {stories.map((story, index) => (
          <article className="group bg-surface-page p-6 sm:min-h-64" key={story.id}>
            <div className="flex justify-between gap-4">
              <StoryCategory story={story} tenant={tenant} />
              <span className="font-mono text-[0.65rem] text-text-muted">
                B-{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h2 className="mt-5 font-heading text-2xl leading-8 font-bold">
              <StoryTitleLink story={story} tenant={tenant} />
            </h2>
            <p className="mt-4 text-sm leading-6 text-text-muted">
              {story.subtitle}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

export function HealthPharmaArticle({ story, tenant }: ArticleModelProps) {
  return (
    <main id="conteudo-principal">
      <article>
        <header className="page-container py-10 sm:py-14">
          <div className="grid gap-8 border-t-4 border-brand-primary pt-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="hero-copy">
              <div className="flex flex-wrap items-center gap-3">
                <StoryCategory story={story} tenant={tenant} />
                <span className="border border-border-subtle px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-text-muted">
                  Briefing
                </span>
              </div>
              <StoryDisclosure story={story} />
              <h1 className="mt-5 max-w-5xl font-heading text-[clamp(2.25rem,3.5vw,4rem)] leading-[0.98] font-bold tracking-[-0.035em] text-brand-primary">
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
            Esta matéria não possui mídia associada.
          </p>
        ) : null}
        <div className="page-container grid gap-10 py-10 lg:grid-cols-[minmax(0,46rem)_17rem] lg:py-16">
          <ArticleBody story={story} />
          <aside className="h-fit border border-border-subtle p-5 text-sm leading-6 text-text-muted">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
              Procedência
            </p>
            <p className="mt-3">
              {story.isRealContent
                ? `Conteúdo autorizado para validação. Fonte: ${story.sourceLabel ?? "material editorial fornecido"}.`
                : "Conteúdo demonstrativo preservado do acervo anterior."}
            </p>
          </aside>
        </div>
      </article>
    </main>
  );
}
