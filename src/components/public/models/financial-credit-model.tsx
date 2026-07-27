import Link from "next/link";

import {
  ArticleBody,
  PublishedMeta,
  StoryCategory,
  StoryDisclosure,
  StoryImage,
  StoryTitleLink,
  tenantQuery,
} from "./story-primitives";
import type {
  ArticleModelProps,
  CategoryModelProps,
  HomeModelProps,
} from "./model-types";

const NEEDS = [
  "Organizar o orçamento",
  "Entender o crédito",
  "Proteger dados e contas",
  "Planejar novos projetos",
];

export function FinancialCreditHome({
  hero,
  heroEyebrow,
  stories,
  tenant,
}: HomeModelProps) {
  const support = stories.slice(1, 5);
  return (
    <>
      <section className="page-container py-7 sm:py-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.38fr)_minmax(18rem,0.62fr)] lg:gap-9">
          <article className="group grid min-w-0 gap-7 border-b-4 border-brand-primary pb-7 sm:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
            <div className="hero-copy min-w-0 self-end">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                {heroEyebrow ?? "Decisões financeiras"}
              </p>
              <h1 className="mt-3 font-heading text-[clamp(2.5rem,4.6vw,4.35rem)] leading-[0.95] font-bold tracking-[-0.05em] text-brand-primary">
                {hero.title}
              </h1>
              <p className="mt-5 max-w-xl leading-7 text-text-muted">
                {hero.subtitle}
              </p>
              <StoryTitleLink
                className="mt-6 inline-flex min-h-11 items-center border-b-2 border-brand-primary py-2 text-sm font-bold text-brand-primary"
                story={hero}
                tenant={tenant}
              >
                Entenda o tema <span aria-hidden="true">→</span>
              </StoryTitleLink>
            </div>
            <StoryTitleLink
              className="block min-w-0 self-start"
              story={hero}
              tenant={tenant}
            >
              <StoryImage
                className="hero-media aspect-[4/3] w-full"
                priority
                sizes="(max-width: 1024px) 100vw, 34vw"
                story={hero}
              />
            </StoryTitleLink>
          </article>

          <aside className="min-w-0 bg-surface-raised p-5 ring-1 ring-border-subtle sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
              Comece por uma necessidade
            </p>
            <ul className="mt-4 divide-y divide-border-subtle">
              {NEEDS.map((need, index) => (
                <li key={need}>
                  <a
                    className="group flex min-h-14 items-center justify-between gap-4 py-3 text-sm font-bold no-underline"
                    href="#explicadores"
                  >
                    <span>
                      <span className="mr-3 font-mono text-[0.65rem] text-text-muted">
                        0{index + 1}
                      </span>
                      {need}
                    </span>
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section
        aria-labelledby="explicadores-title"
        className="border-y border-border-subtle bg-surface-raised"
        id="explicadores"
      >
        <div className="page-container py-10 sm:py-14">
          <div className="flex flex-col gap-3 border-b border-border-subtle pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
                Entenda antes de decidir
              </p>
              <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl" id="explicadores-title">
                Explicadores para o próximo passo
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-text-muted">
              Leituras demonstrativas, informativas e sem recomendação
              individual.
            </p>
          </div>
          <div className="grid gap-px bg-border-subtle sm:grid-cols-2 lg:grid-cols-4">
            {support.map((story, index) => (
              <article
                className="group min-w-0 bg-surface-raised p-5 sm:min-h-60"
                key={story.id}
              >
                <p className="font-mono text-xs text-text-muted">0{index + 1}</p>
                <StoryCategory story={story} tenant={tenant} />
                <h3 className="mt-4 font-heading text-xl leading-7 font-bold">
                  <StoryTitleLink story={story} tenant={tenant} />
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-muted">
                  {story.subtitle}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <FinancialNewsList stories={stories.slice(5)} tenant={tenant} />
    </>
  );
}

function FinancialNewsList({
  stories,
  tenant,
}: Pick<HomeModelProps, "stories" | "tenant">) {
  if (stories.length === 0) return null;
  return (
    <section aria-labelledby="financial-latest" className="page-container py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.45fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
            Atualizações
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold" id="financial-latest">
            Notícias para acompanhar
          </h2>
        </div>
        <div className="border-t-2 border-brand-primary">
          {stories.slice(0, 6).map((story) => (
            <article
              className="grid gap-4 border-b border-border-subtle py-5 sm:grid-cols-[9rem_1fr]"
              key={story.id}
            >
              <StoryImage
                className="aspect-[4/3]"
                sizes="144px"
                story={story}
              />
              <div>
                <StoryCategory story={story} tenant={tenant} />
                <h3 className="mt-2 text-lg leading-6 font-bold">
                  <StoryTitleLink story={story} tenant={tenant} />
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinancialCreditCategory({
  categoryName,
  stories,
  tenant,
}: CategoryModelProps) {
  return (
    <main className="py-10 sm:py-14" id="conteudo-principal">
      <div className="page-container grid gap-7 border-b-4 border-brand-primary pb-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
            Guia de tema
          </p>
          <h1 className="mt-3 font-heading text-4xl leading-tight font-bold sm:text-6xl">
            {categoryName}
          </h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-text-muted">
          Conceitos, contexto e notícias fictícias para entender o assunto
          antes de avançar.
        </p>
      </div>
      <FinancialNewsList stories={stories} tenant={tenant} />
    </main>
  );
}

export function FinancialCreditArticle({
  story,
  tenant,
}: ArticleModelProps) {
  return (
    <main id="conteudo-principal">
      <article>
        <header className="page-container grid gap-7 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
          <div className="hero-copy self-end">
            <StoryCategory story={story} tenant={tenant} />
            <StoryDisclosure story={story} />
            <h1 className="mt-4 font-heading text-[clamp(2.5rem,5.6vw,5.2rem)] leading-[0.96] font-bold tracking-[-0.045em] text-brand-primary">
              {story.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-text-muted">
              {story.subtitle}
            </p>
            <div className="mt-6">
              <PublishedMeta story={story} />
            </div>
          </div>
          <StoryImage
            className="hero-media aspect-[4/3]"
            priority
            sizes="(max-width: 1024px) 100vw, 38vw"
            story={story}
          />
        </header>
        {!story.imagePath ? (
          <p className="page-container border-y border-border-subtle py-5 text-sm text-text-muted">
            Esta matéria usa a exceção editorial demonstrativa sem imagem.
          </p>
        ) : null}
        <div className="page-container grid gap-8 border-t border-border-subtle py-10 lg:grid-cols-[14rem_minmax(0,46rem)] lg:py-14">
          <aside className="h-fit bg-surface-raised p-5 ring-1 ring-border-subtle">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
              Nesta leitura
            </p>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Informação demonstrativa para contextualizar decisões. Não é
              aconselhamento financeiro.
            </p>
            <Link
              className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-brand-primary"
              href={`/editoria/${story.categorySlug}${tenantQuery(tenant)}`}
            >
              Ver editoria
            </Link>
          </aside>
          <ArticleBody story={story} />
        </div>
      </article>
    </main>
  );
}
