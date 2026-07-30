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

const LIFE_STAGES = [
  "Começar a planejar",
  "Proteger quem depende de você",
  "Construir autonomia",
  "Organizar a sucessão",
];

export function InsuranceHome({
  hero,
  heroEyebrow,
  stories,
  tenant,
}: HomeModelProps) {
  return (
    <>
      <section className="page-container py-7 sm:py-11">
        <article className="group overflow-hidden rounded-[2rem] bg-surface-raised ring-1 ring-border-subtle lg:grid lg:grid-cols-[1.03fr_0.97fr]">
          <div className="hero-copy order-2 min-w-0 flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
              {heroEyebrow ?? "Proteção e autonomia"}
            </p>
            <h1 className="mt-4 font-heading text-[clamp(1.9rem,3.7vw,3.15rem)] leading-[1.03] font-bold tracking-[-0.04em] text-brand-primary">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-text-muted">
              {hero.subtitle}
            </p>
            <StoryTitleLink
              className="mt-7 inline-flex min-h-11 w-fit items-center rounded-full bg-brand-primary px-5 text-sm font-bold text-text-on-brand"
              story={hero}
              tenant={tenant}
            >
              Continuar a leitura <span aria-hidden="true">→</span>
            </StoryTitleLink>
          </div>
          <StoryTitleLink className="order-1 min-w-0" story={hero} tenant={tenant}>
            <StoryImage
              className="hero-media aspect-[4/3] min-h-80 rounded-[2rem] lg:aspect-auto lg:h-full"
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              story={hero}
            />
          </StoryTitleLink>
        </article>
      </section>

      <section aria-labelledby="life-stages-title" className="page-container py-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
            Planejamento contínuo
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold sm:text-5xl" id="life-stages-title">
            Cada fase traz uma pergunta diferente
          </h2>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {LIFE_STAGES.map((stage, index) => (
            <li
              className="rounded-[1.5rem] bg-surface-raised p-5 ring-1 ring-border-subtle"
              key={stage}
            >
              <span className="grid size-9 place-items-center rounded-full bg-brand-primary text-xs font-bold text-text-on-brand">
                {index + 1}
              </span>
              <p className="mt-5 font-heading text-lg leading-6 font-bold">
                {stage}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border-subtle bg-surface-raised">
        <div className="page-container py-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-3">
            {stories.slice(1, 7).map((story) => (
              <article
                className="group rounded-[1.75rem] bg-surface-page p-5 sm:p-6"
                key={story.id}
              >
                <StoryImage
                  className="aspect-[16/10] rounded-[1.25rem]"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  story={story}
                />
                <div className="pt-5">
                  <StoryCategory story={story} tenant={tenant} />
                  <h3 className="mt-3 font-heading text-2xl leading-7 font-bold">
                    <StoryTitleLink story={story} tenant={tenant} />
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-text-muted">
                    {story.subtitle}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function InsuranceCategory({
  categoryName,
  stories,
  tenant,
}: CategoryModelProps) {
  return (
    <main className="page-container py-10 sm:py-14" id="conteudo-principal">
      <header className="max-w-4xl rounded-[2rem] bg-surface-raised p-7 ring-1 ring-border-subtle sm:p-11">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
          Perguntas para cada fase
        </p>
        <h1 className="mt-3 font-heading text-4xl leading-tight font-bold sm:text-6xl">
          {categoryName}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-text-muted">
          Como este tema pode apoiar proteção, autonomia e planejamento ao
          longo da vida?
        </p>
      </header>
      <section aria-label="Leituras da editoria" className="mt-10 grid gap-6 md:grid-cols-2">
        {stories.map((story) => (
          <article
            className="group rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-border-subtle"
            key={story.id}
          >
            <StoryCategory story={story} tenant={tenant} />
            <h2 className="mt-3 font-heading text-2xl leading-8 font-bold">
              <StoryTitleLink story={story} tenant={tenant} />
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              {story.subtitle}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

export function InsuranceArticle({ story, tenant }: ArticleModelProps) {
  return (
    <main id="conteudo-principal">
      <article>
        <header className="page-container py-10 sm:py-14">
          <div className="mx-auto max-w-5xl text-center">
            <StoryCategory story={story} tenant={tenant} />
            <StoryDisclosure story={story} />
            <h1 className="mt-5 font-heading text-[clamp(2.7rem,6vw,5.6rem)] leading-[0.98] font-bold tracking-[-0.045em] text-brand-primary">
              {story.title}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-text-muted sm:text-xl">
              {story.subtitle}
            </p>
            <div className="mt-6">
              <PublishedMeta story={story} />
            </div>
          </div>
        </header>
        <div className="page-container">
          <StoryImage
            className="hero-media aspect-[16/8] rounded-[2rem]"
            priority
            sizes="(max-width: 1240px) 100vw, 1240px"
            story={story}
          />
        </div>
        {!story.imagePath ? (
          <p className="page-container rounded-[1.5rem] bg-surface-raised p-5 text-sm text-text-muted">
            Esta matéria demonstrativa foi planejada sem imagem.
          </p>
        ) : null}
        <div className="page-container mx-auto grid max-w-5xl gap-8 py-10 lg:grid-cols-[minmax(0,44rem)_13rem] lg:py-16">
          <ArticleBody story={story} />
          <aside className="h-fit rounded-[1.5rem] bg-surface-raised p-5 text-sm leading-6 text-text-muted ring-1 ring-border-subtle">
            <strong className="text-text-primary">Para lembrar</strong>
            <p className="mt-2">
              Proteção e previdência mudam conforme contexto e objetivos. Esta
              leitura é apenas editorial e demonstrativa.
            </p>
          </aside>
        </div>
      </article>
    </main>
  );
}
