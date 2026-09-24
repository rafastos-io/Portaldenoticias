import Link from "next/link";
import type { ReactNode } from "react";

import type {
  PublicStory,
  PublicTenant,
} from "@/lib/supabase/portal-repository";

import type {
  ArticleModelProps,
  CategoryModelProps,
  HomeModelProps,
} from "./model-types";
import {
  ArticleBody,
  PublishedMeta,
  StoryDisclosure,
  StoryImage,
  StoryTitleLink,
  tenantQuery,
} from "./story-primitives";

type Tone = "night" | "royal" | "sky";

type HomeLane = {
  categories: readonly string[];
  eyebrow: string;
  id: string;
  layout: "cards" | "columns" | "feature" | "track";
  title: string;
};

// Home lanes follow the editorial briefing: money first, then market,
// safety, road, garage and track. Lanes without stories are not rendered.
const HOME_LANES: readonly HomeLane[] = [
  {
    categories: ["concessionarias"],
    eyebrow: "Mercado",
    id: "mercados",
    layout: "cards",
    title: "Lojas, lançamentos e condições de compra",
  },
  {
    categories: ["evite-acidentes"],
    eyebrow: "Segurança",
    id: "seguranca",
    layout: "feature",
    title: "Informação para reduzir riscos no trânsito",
  },
  {
    categories: ["estradas", "ruas-e-avenidas"],
    eyebrow: "Na estrada",
    id: "na-estrada",
    layout: "cards",
    title: "Rodovias, cidades e o custo de cada trajeto",
  },
  {
    categories: [
      "servicos-e-manutencao",
      "raridade",
      "ainda-terei-um-carro-assim",
    ],
    eyebrow: "Garagem",
    id: "garagem",
    layout: "columns",
    title: "Cuidar, colecionar e lembrar",
  },
  {
    categories: ["area-do-piloto"],
    eyebrow: "Pista",
    id: "pista",
    layout: "track",
    title: "Automobilismo e cultura de competição",
  },
];

const CREDIT_CATEGORY = "credito";

const CATEGORY_TONES: Record<string, Tone> = {
  "area-do-piloto": "night",
  "ainda-terei-um-carro-assim": "night",
  concessionarias: "royal",
  credito: "royal",
  estradas: "sky",
  "evite-acidentes": "sky",
  raridade: "night",
  "ruas-e-avenidas": "sky",
  "servicos-e-manutencao": "royal",
};

const ICON_PATHS: Record<string, ReactNode> = {
  "area-do-piloto": (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4.5L18 13H5" />
      <path d="M9.5 4v9M14 4v9M5 8.5h11.5" />
    </>
  ),
  "ainda-terei-um-carro-assim": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M3.4 10.2h6.2M14.4 10.2h6.2M12 14.5V21" />
    </>
  ),
  concessionarias: (
    <>
      <path d="M5 15.5 6.6 10a2 2 0 0 1 1.9-1.5h7a2 2 0 0 1 1.9 1.5l1.6 5.5" />
      <rect height="4" rx="1.2" width="17" x="3.5" y="15" />
      <path d="M7 19v2M17 19v2M7.5 12.5h9" />
    </>
  ),
  credito: (
    <>
      <rect height="12" rx="2" width="18" x="3" y="6" />
      <path d="M3 10.5h18M7 15h4M15.5 15h1.5" />
    </>
  ),
  estradas: (
    <>
      <path d="M8.5 3 4 21M15.5 3 20 21" />
      <path d="M12 4v3M12 10.5v3M12 17v4" />
    </>
  ),
  "evite-acidentes": (
    <>
      <path d="M12 3 19 6v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
      <path d="m9 12 2.1 2.1L15.3 10" />
    </>
  ),
  raridade: (
    <>
      <path d="M6.5 4h11L21 9l-9 11L3 9z" />
      <path d="M3 9h18M9.5 4 12 20M14.5 4 12 20" />
    </>
  ),
  "ruas-e-avenidas": (
    <>
      <rect height="15" rx="2.5" width="8" x="8" y="2" />
      <circle cx="12" cy="6" r="1.3" />
      <circle cx="12" cy="9.5" r="1.3" />
      <circle cx="12" cy="13" r="1.3" />
      <path d="M12 17v5" />
    </>
  ),
  "servicos-e-manutencao": (
    <path d="M14.8 6.2a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 6-6a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.3-.6-.6-2.3z" />
  ),
};

function CategoryIcon({
  className = "",
  slug,
}: {
  className?: string;
  slug: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      {ICON_PATHS[slug] ?? ICON_PATHS["ainda-terei-um-carro-assim"]}
    </svg>
  );
}

function toneFor(story: PublicStory): Tone {
  return CATEGORY_TONES[story.categorySlug] ?? "royal";
}

/**
 * Editorial image when the story has one; otherwise a brand-driven graphic
 * built only from theme tokens, so the layout stays complete until the
 * client's photo pack replaces it.
 */
function AutoVisual({
  className = "",
  priority = false,
  sizes,
  story,
}: {
  className?: string;
  priority?: boolean;
  sizes: string;
  story: PublicStory;
}) {
  if (story.imagePath) {
    return (
      <StoryImage
        className={`auto-photo ${className}`}
        priority={priority}
        sizes={sizes}
        story={story}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`auto-visual relative block overflow-hidden ${className}`}
      data-tone={toneFor(story)}
    >
      <span className="auto-visual-lane" />
      <CategoryIcon
        className="auto-visual-icon absolute right-[8%] bottom-[10%] h-[46%] w-auto text-white"
        slug={story.categorySlug}
      />
    </span>
  );
}

function CategoryChip({
  inverse = false,
  story,
  tenant,
}: {
  inverse?: boolean;
  story: PublicStory;
  tenant: PublicTenant;
}) {
  return (
    <Link
      className={`inline-flex min-h-8 w-fit items-center gap-2 rounded-full px-3 text-[0.7rem] font-bold tracking-[0.08em] uppercase no-underline transition-colors ${
        inverse
          ? "bg-white/12 text-white hover:bg-white/20"
          : "auto-chip text-brand-secondary"
      }`}
      href={`/editoria/${story.categorySlug}${tenantQuery(tenant)}`}
    >
      <CategoryIcon className="size-3.5" slug={story.categorySlug} />
      {story.categoryName}
    </Link>
  );
}

function LaneHeader({
  eyebrow,
  href,
  id,
  inverse = false,
  title,
}: {
  eyebrow: string;
  href?: string;
  id: string;
  inverse?: boolean;
  title: string;
}) {
  return (
    <div className="relative isolate flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <span aria-hidden="true" className="auto-watermark hidden md:block">
        {eyebrow}
      </span>
      <div>
        <p
          className={`flex items-center gap-3 text-xs font-bold tracking-[0.18em] uppercase ${
            inverse ? "text-white/80" : "text-brand-secondary"
          }`}
        >
          <span aria-hidden="true" className="h-1 w-8 rounded-full bg-accent" />
          {eyebrow}
        </p>
        <h2
          className={`mt-3 max-w-2xl font-heading text-[clamp(1.6rem,3vw,2.35rem)] leading-tight font-bold tracking-[-0.02em] ${
            inverse ? "text-white" : "text-brand-primary"
          }`}
          id={id}
        >
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          className={`story-link inline-flex min-h-11 w-fit items-center gap-2 rounded-full border px-5 text-sm font-bold no-underline transition-colors ${
            inverse
              ? "border-white/40 text-white hover:bg-white hover:text-brand-primary"
              : "border-border-subtle text-brand-primary hover:border-brand-primary"
          }`}
          href={href}
        >
          Ver editoria
          <Arrow />
        </Link>
      ) : null}
    </div>
  );
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Dashed lane with a car and a finish flag: decorative fold divider. */
function RoadDivider() {
  return (
    <div aria-hidden="true" className="auto-road">
      <svg
        className="size-6 shrink-0"
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M3 15.5h1.2l1.4-3.6A2 2 0 0 1 7.5 10.6h7.2a2 2 0 0 1 1.6.8l2.2 3h1.6a1 1 0 0 1 1 1V17H3z" />
        <circle cx="7.5" cy="17.5" r="1.6" />
        <circle cx="16.5" cy="17.5" r="1.6" />
      </svg>
      <span className="auto-road-line" />
      <svg
        className="size-6 shrink-0"
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M5 21V4M5 4h13l-2.5 4.5L18 13H5" />
        <path d="M9.5 4v9M14 4v9M5 8.5h11.5" />
      </svg>
    </div>
  );
}

function StoryCard({
  inverse = false,
  size = "md",
  story,
  tenant,
}: {
  inverse?: boolean;
  size?: "lg" | "md";
  story: PublicStory;
  tenant: PublicTenant;
}) {
  return (
    <article className="group flex min-w-0 flex-col">
      <StoryTitleLink
        className="block overflow-hidden rounded-[var(--radius-md)]"
        story={story}
        tenant={tenant}
      >
        <AutoVisual
          className="aspect-[16/10]"
          sizes={
            size === "lg"
              ? "(max-width: 1024px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26vw"
          }
          story={story}
        />
        <span className="sr-only">{story.title}</span>
      </StoryTitleLink>
      <div className="mt-5 flex flex-col gap-3">
        <CategoryChip inverse={inverse} story={story} tenant={tenant} />
        <h3
          className={`font-heading leading-snug font-bold tracking-[-0.01em] ${
            size === "lg" ? "text-2xl sm:text-[1.75rem]" : "text-xl"
          } ${inverse ? "text-white" : "text-text-primary"}`}
        >
          <StoryTitleLink story={story} tenant={tenant} />
        </h3>
        <p
          className={`line-clamp-3 text-[0.95rem] leading-7 ${
            inverse ? "text-white/75" : "text-text-muted"
          }`}
        >
          {story.subtitle}
        </p>
      </div>
    </article>
  );
}

function CompactStory({
  index,
  story,
  tenant,
}: {
  index?: number;
  story: PublicStory;
  tenant: PublicTenant;
}) {
  return (
    <article className="group grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <StoryTitleLink
        className="block overflow-hidden rounded-[calc(var(--radius-md)*0.6)]"
        story={story}
        tenant={tenant}
      >
        <AutoVisual className="aspect-square" sizes="112px" story={story} />
        <span className="sr-only">{story.title}</span>
      </StoryTitleLink>
      <div className="min-w-0">
        {typeof index === "number" ? (
          <p className="font-heading text-sm font-bold text-brand-secondary">
            {String(index + 1).padStart(2, "0")}
          </p>
        ) : (
          <p className="text-[0.7rem] font-bold tracking-[0.08em] text-brand-secondary uppercase">
            {story.categoryName}
          </p>
        )}
        <h3 className="mt-1 font-heading text-base leading-snug font-bold sm:text-lg">
          <StoryTitleLink story={story} tenant={tenant} />
        </h3>
      </div>
    </article>
  );
}

function takeStories(
  stories: PublicStory[],
  used: Set<string>,
  categories: readonly string[],
  limit: number,
) {
  const selected = stories
    .filter(
      (story) =>
        !used.has(story.id) && categories.includes(story.categorySlug),
    )
    .slice(0, limit);
  for (const story of selected) used.add(story.id);
  return selected;
}

function categoryHref(slug: string, tenant: PublicTenant) {
  return `/editoria/${slug}${tenantQuery(tenant)}`;
}

function HomeHero({
  credit,
  hero,
  heroEyebrow,
  tenant,
}: {
  credit: PublicStory[];
  hero: PublicStory;
  heroEyebrow?: string | null;
  tenant: PublicTenant;
}) {
  return (
    <section
      aria-label="Manchete e crédito em foco"
      className="page-container pt-6 pb-14 sm:pt-10 sm:pb-20"
      id="destaques"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)] lg:gap-8">
        <article className="group auto-hero relative isolate flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] text-white sm:min-h-[34rem]">
          <div className="absolute inset-0 -z-10">
            <AutoVisual
              className="size-full"
              priority
              sizes="(max-width: 1024px) 100vw, 62vw"
              story={hero}
            />
          </div>
          <div
            aria-hidden="true"
            className="auto-hero-shade absolute inset-0 -z-10"
          />
          <span aria-hidden="true" className="auto-hero-speed" />
          <div className="auto-hero-copy hero-copy grid gap-4 p-6 sm:p-10">
            <p className="w-fit rounded-full bg-accent px-3 py-1.5 text-[0.7rem] font-bold tracking-[0.12em] text-brand-primary uppercase">
              {heroEyebrow ?? "Manchete"}
            </p>
            <h1 className="max-w-3xl font-heading text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.04] font-bold tracking-[-0.035em]">
              <StoryTitleLink story={hero} tenant={tenant} />
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              {hero.subtitle}
            </p>
            <StoryTitleLink
              className="story-link mt-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-brand-primary hover:no-underline"
              story={hero}
              tenant={tenant}
            >
              Ler reportagem
              <Arrow />
            </StoryTitleLink>
          </div>
        </article>

        {credit.length > 0 ? (
          <aside
            aria-labelledby="credito-em-foco"
            className="auto-panel relative isolate flex flex-col overflow-hidden rounded-[var(--radius-lg)] p-6 sm:p-8"
          >
            <svg
              aria-hidden="true"
              className="auto-gauge absolute -right-8 -bottom-10 -z-10 size-44"
              fill="none"
              focusable="false"
              stroke="currentColor"
              strokeLinecap="round"
              viewBox="0 0 100 100"
            >
              <path d="M15 70a35 35 0 1 1 70 0" strokeWidth="6" />
              <path d="M50 70 70 42" strokeWidth="4" />
              <path
                d="M22 52l5 2M33 36l4 4M50 30v6M67 36l-4 4M78 52l-5 2"
                strokeWidth="3"
              />
            </svg>
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-brand-secondary uppercase">
              <CategoryIcon className="size-4" slug={CREDIT_CATEGORY} />
              Crédito em foco
            </p>
            <h2
              className="mt-3 font-heading text-2xl leading-tight font-bold tracking-[-0.02em] text-brand-primary"
              id="credito-em-foco"
            >
              O dinheiro por trás da compra
            </h2>
            <div className="mt-6 grid gap-6">
              {credit.map((story, index) => (
                <CompactStory
                  index={index}
                  key={story.id}
                  story={story}
                  tenant={tenant}
                />
              ))}
            </div>
            <Link
              className="story-link mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-sm font-bold text-brand-primary no-underline hover:underline"
              href={categoryHref(CREDIT_CATEGORY, tenant)}
            >
              Tudo sobre crédito
              <Arrow />
            </Link>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function Lane({
  lane,
  stories,
  tenant,
}: {
  lane: HomeLane;
  stories: PublicStory[];
  tenant: PublicTenant;
}) {
  const titleId = `${lane.id}-title`;
  const href =
    lane.categories.length === 1
      ? categoryHref(lane.categories[0]!, tenant)
      : undefined;

  if (lane.layout === "track") {
    return (
      <section
        aria-labelledby={titleId}
        className="auto-track bg-surface-inverse pb-14 text-white sm:pb-20"
        id={lane.id}
      >
        <div aria-hidden="true" className="auto-checker mb-14 sm:mb-20" />
        <div className="page-container grid gap-10">
          <LaneHeader
            eyebrow={lane.eyebrow}
            href={href}
            id={titleId}
            inverse
            title={lane.title}
          />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard inverse key={story.id} story={story} tenant={tenant} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (lane.layout === "feature") {
    const [lead, ...rest] = stories;
    return (
      <section
        aria-labelledby={titleId}
        className="auto-tint py-14 sm:py-20"
        id={lane.id}
      >
        <div className="page-container grid gap-10">
          <LaneHeader
            eyebrow={lane.eyebrow}
            href={href}
            id={titleId}
            title={lane.title}
          />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
            {lead ? <StoryCard size="lg" story={lead} tenant={tenant} /> : null}
            {rest.length > 0 ? (
              <div className="grid gap-7 border-t border-border-subtle pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                {rest.map((story) => (
                  <CompactStory key={story.id} story={story} tenant={tenant} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (lane.layout === "columns") {
    const groups = lane.categories
      .map((slug) => stories.filter((story) => story.categorySlug === slug))
      .filter((group) => group.length > 0);
    return (
      <section
        aria-labelledby={titleId}
        className="page-container grid gap-10 py-14 sm:py-20"
        id={lane.id}
      >
        <RoadDivider />
        <LaneHeader eyebrow={lane.eyebrow} id={titleId} title={lane.title} />
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {groups.map((group) => {
            const [lead, ...rest] = group;
            return (
              <div
                className="auto-panel grid content-start gap-7 rounded-[var(--radius-lg)] p-5 sm:p-6"
                key={lead!.categorySlug}
              >
                <Link
                  className="story-link flex min-h-11 items-center justify-between gap-3 font-heading text-lg font-bold text-brand-primary no-underline hover:underline"
                  href={categoryHref(lead!.categorySlug, tenant)}
                >
                  <span className="flex items-center gap-3">
                    <CategoryIcon className="size-5" slug={lead!.categorySlug} />
                    {lead!.categoryName}
                  </span>
                  <Arrow />
                </Link>
                <StoryCard story={lead!} tenant={tenant} />
                {rest.map((story) => (
                  <CompactStory key={story.id} story={story} tenant={tenant} />
                ))}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className="page-container grid gap-10 py-14 sm:py-20"
      id={lane.id}
    >
      <RoadDivider />
      <LaneHeader
        eyebrow={lane.eyebrow}
        href={href}
        id={titleId}
        title={lane.title}
      />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} tenant={tenant} />
        ))}
      </div>
    </section>
  );
}

function EditoriasIndex({
  stories,
  tenant,
}: {
  stories: PublicStory[];
  tenant: PublicTenant;
}) {
  const categories = [
    ...new Map(
      stories.map((story) => [
        story.categorySlug,
        { name: story.categoryName, slug: story.categorySlug },
      ]),
    ).values(),
  ];
  if (categories.length === 0) return null;
  return (
    <section
      aria-labelledby="editorias-title"
      className="border-t border-border-subtle"
      id="editorias"
    >
      <div className="page-container grid gap-8 py-14 sm:py-20">
        <LaneHeader
          eyebrow="Editorias"
          id="editorias-title"
          title="Informação para antes, durante e depois da compra"
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                className="auto-panel story-link group flex min-h-16 items-center justify-between gap-4 rounded-[var(--radius-md)] px-5 py-4 font-bold text-brand-primary no-underline transition-colors hover:bg-surface-page"
                href={categoryHref(category.slug, tenant)}
              >
                <span className="flex items-center gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-secondary text-white">
                    <CategoryIcon className="size-5" slug={category.slug} />
                  </span>
                  {category.name}
                </span>
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AutomotiveMobilityHome({
  hero,
  heroEyebrow,
  stories,
  tenant,
}: HomeModelProps) {
  const used = new Set<string>([hero.id]);
  const credit = takeStories(stories, used, [CREDIT_CATEGORY], 3);
  const lanes = HOME_LANES.map((lane) => ({
    lane,
    // Column lanes give every category its own slot instead of a shared quota.
    stories:
      lane.layout === "columns"
        ? lane.categories.flatMap((category) =>
            takeStories(stories, used, [category], 2),
          )
        : takeStories(stories, used, lane.categories, 3),
  })).filter((entry) => entry.stories.length > 0);
  const latest = stories.filter((story) => !used.has(story.id)).slice(0, 6);

  return (
    <>
      <HomeHero
        credit={credit}
        hero={hero}
        heroEyebrow={heroEyebrow}
        tenant={tenant}
      />
      {lanes.map(({ lane, stories: laneStories }) => (
        <Lane key={lane.id} lane={lane} stories={laneStories} tenant={tenant} />
      ))}
      {latest.length > 0 ? (
        <section
          aria-labelledby="mais-noticias-title"
          className="page-container grid gap-10 py-14 sm:py-20"
        >
          <LaneHeader
            eyebrow="Mais notícias"
            id="mais-noticias-title"
            title="Continue acompanhando"
          />
          <div className="grid gap-8 md:grid-cols-2">
            {latest.map((story) => (
              <CompactStory key={story.id} story={story} tenant={tenant} />
            ))}
          </div>
        </section>
      ) : null}
      <EditoriasIndex stories={stories} tenant={tenant} />
    </>
  );
}

export function AutomotiveMobilityCategory({
  categoryName,
  stories,
  tenant,
}: CategoryModelProps) {
  const [lead, ...rest] = stories;
  const slug = lead?.categorySlug ?? "";
  return (
    <main id="conteudo-principal">
      <header className="auto-category-band relative isolate overflow-hidden text-white">
        <div className="page-container grid gap-6 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="hero-copy">
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-white/80 uppercase">
              <span aria-hidden="true" className="h-1 w-8 rounded-full bg-accent" />
              Editoria
            </p>
            <h1 className="mt-4 font-heading text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.02] font-bold tracking-[-0.04em]">
              {categoryName}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
              Notícias, explicações e orientações para quem compra, financia e
              dirige.
            </p>
          </div>
          {slug ? (
            <CategoryIcon
              className="hidden size-40 text-white/25 lg:block"
              slug={slug}
            />
          ) : null}
        </div>
      </header>

      {lead ? (
        <div className="page-container grid gap-14 py-14 sm:py-20">
          <article className="group grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center">
            <StoryTitleLink
              className="block overflow-hidden rounded-[var(--radius-lg)]"
              story={lead}
              tenant={tenant}
            >
              <AutoVisual
                className="aspect-[16/10]"
                priority
                sizes="(max-width: 1024px) 100vw, 56vw"
                story={lead}
              />
              <span className="sr-only">{lead.title}</span>
            </StoryTitleLink>
            <div className="grid gap-4">
              <p className="text-xs font-bold tracking-[0.18em] text-brand-secondary uppercase">
                Em destaque
              </p>
              <h2 className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.025em] text-brand-primary">
                <StoryTitleLink story={lead} tenant={tenant} />
              </h2>
              <p className="text-lg leading-8 text-text-muted">{lead.subtitle}</p>
              <PublishedMeta story={lead} />
            </div>
          </article>
          {rest.length > 0 ? (
            <section aria-labelledby="categoria-mais" className="grid gap-10">
              <h2
                className="border-t border-border-subtle pt-8 font-heading text-2xl font-bold text-brand-primary"
                id="categoria-mais"
              >
                Mais em {categoryName}
              </h2>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((story) => (
                  <StoryCard key={story.id} story={story} tenant={tenant} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="page-container py-20 text-center">
          <h2 className="font-heading text-2xl font-bold">
            Nenhuma matéria publicada nesta editoria
          </h2>
          <p className="mt-3 text-text-muted">
            Novos conteúdos aparecerão aqui assim que forem publicados.
          </p>
        </div>
      )}
    </main>
  );
}

export function AutomotiveMobilityArticle({
  story,
  tenant,
}: ArticleModelProps) {
  const home = `/${tenantQuery(tenant)}`;
  return (
    <main id="conteudo-principal">
      <article>
        <header className="page-container grid gap-8 pt-8 pb-10 sm:pt-12">
          <nav aria-label="Trilha de navegação">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <li>
                <Link className="font-semibold hover:text-brand-primary" href={home}>
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  className="font-semibold hover:text-brand-primary"
                  href={categoryHref(story.categorySlug, tenant)}
                >
                  {story.categoryName}
                </Link>
              </li>
            </ol>
          </nav>
          <div className="hero-copy grid max-w-4xl gap-5">
            <CategoryChip story={story} tenant={tenant} />
            <StoryDisclosure story={story} />
            <h1 className="font-heading text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] font-bold tracking-[-0.04em] text-brand-primary">
              {story.title}
            </h1>
            <p className="text-lg leading-8 text-text-muted sm:text-xl sm:leading-9">
              {story.subtitle}
            </p>
            <PublishedMeta story={story} />
          </div>
          <AutoVisual
            className="aspect-[16/9] rounded-[var(--radius-lg)] sm:aspect-[21/9]"
            priority
            sizes="(max-width: 1280px) 100vw, 80rem"
            story={story}
          />
        </header>
        <div className="page-container grid gap-10 pb-16 lg:grid-cols-[minmax(0,46rem)_minmax(16rem,20rem)] lg:justify-between lg:pb-24">
          <ArticleBody story={story} />
          <aside className="auto-panel h-fit rounded-[var(--radius-lg)] p-6 lg:sticky lg:top-6">
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-brand-secondary uppercase">
              <CategoryIcon className="size-4" slug={story.categorySlug} />
              Sobre este conteúdo
            </p>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              {story.isRealContent
                ? "Informação jornalística para contextualizar decisões. Não substitui a análise individual de crédito."
                : "Matéria demonstrativa criada para a pré-visualização do portal. O texto definitivo será substituído pelo conteúdo editorial aprovado."}
            </p>
            <Link
              className="story-link mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border-subtle px-5 text-sm font-bold text-brand-primary no-underline hover:border-brand-primary"
              href={categoryHref(story.categorySlug, tenant)}
            >
              Mais em {story.categoryName}
              <Arrow />
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
