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

export function HealthPharmaHome({
  hero,
  heroEyebrow,
  stories,
  tenant,
}: HomeModelProps) {
  const research = stories.slice(1, 5);
  const updates = stories.slice(5, 9);
  return (
    <>
      <section className="page-container py-8 sm:py-12">
        <article className="group grid gap-7 border-t-4 border-brand-primary pt-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="hero-copy order-2 self-end lg:order-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                {heroEyebrow ?? "Briefing científico"}
              </p>
              <span className="border border-border-subtle px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-text-muted">
                Contexto demonstrativo
              </span>
            </div>
            <h1 className="mt-5 font-heading text-[clamp(2.7rem,5.6vw,5.4rem)] leading-[0.94] font-bold tracking-[-0.05em] text-brand-primary">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted">
              {hero.subtitle}
            </p>
            <div className="mt-7 flex items-center gap-4 border-t border-border-subtle pt-4 text-xs text-text-muted">
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

      <section className="border-y border-border-subtle bg-surface-raised">
        <div className="page-container py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.34fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                Pesquisa e inovação
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
                O que acompanhar
              </h2>
            </div>
            <div className="grid gap-px bg-border-subtle sm:grid-cols-2">
              {research.map((story, index) => (
                <article className="group bg-surface-raised p-5 sm:min-h-64" key={story.id}>
                  <div className="flex items-center justify-between gap-3">
                    <StoryCategory story={story} tenant={tenant} />
                    <span className="font-mono text-[0.65rem] text-text-muted">
                      R-{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-heading text-2xl leading-7 font-bold">
                    <StoryTitleLink story={story} tenant={tenant} />
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-text-muted">
                    {story.subtitle}
                  </p>
                  <p className="mt-5 border-t border-border-subtle pt-3 text-xs text-text-muted">
                    {story.author} · perfil fictício
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {updates.length > 0 ? (
        <section className="page-container py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                Atualizações de contexto
              </p>
              <div className="mt-4 border-t-2 border-brand-primary">
                {updates.map((story) => (
                  <article className="border-b border-border-subtle py-5" key={story.id}>
                    <StoryCategory story={story} tenant={tenant} />
                    <h3 className="mt-2 font-heading text-xl leading-7 font-bold">
                      <StoryTitleLink story={story} tenant={tenant} />
                    </h3>
                  </article>
                ))}
              </div>
            </div>
            <aside className="border border-border-subtle p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
                Nota editorial
              </p>
              <p className="mt-4 text-sm leading-7 text-text-muted">
                Os chips descrevem o tipo de leitura. Não indicam eficácia,
                estágio clínico ou recomendação médica.
              </p>
            </aside>
          </div>
        </section>
      ) : null}
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
          Escopo editorial demonstrativo para ciência, regulação, inovação e
          seus impactos econômicos.
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
              <h1 className="mt-5 max-w-5xl font-heading text-[clamp(2.7rem,5.8vw,5.7rem)] leading-[0.94] font-bold tracking-[-0.05em] text-brand-primary">
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
            Este briefing demonstrativo não possui mídia associada.
          </p>
        ) : null}
        <div className="page-container grid gap-10 py-10 lg:grid-cols-[minmax(0,46rem)_17rem] lg:py-16">
          <ArticleBody story={story} />
          <aside className="h-fit border border-border-subtle p-5 text-sm leading-6 text-text-muted">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
              Procedência
            </p>
            <p className="mt-3">
              Conteúdo e perfis são fictícios. Nenhuma alegação clínica é
              inferida por esta apresentação.
            </p>
          </aside>
        </div>
      </article>
    </main>
  );
}
