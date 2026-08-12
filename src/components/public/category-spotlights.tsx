import Image from "next/image";
import Link from "next/link";

import type {
  PublicStory,
  PublicTenant,
} from "@/lib/supabase/portal-repository";

export function CategorySpotlights({
  stories,
  tenant,
}: {
  stories: PublicStory[];
  tenant: PublicTenant;
}) {
  const tenantQuery = `?tenant=${encodeURIComponent(tenant.slug)}`;
  const groups = new Map<
    string,
    { name: string; slug: string; stories: PublicStory[] }
  >();

  for (const story of stories) {
    const current = groups.get(story.categorySlug);
    if (current) {
      current.stories.push(story);
    } else {
      groups.set(story.categorySlug, {
        name: story.categoryName,
        slug: story.categorySlug,
        stories: [story],
      });
    }
  }

  const categories = [...groups.values()].slice(0, 3);
  if (categories.length === 0) return null;

  return (
    <section
      aria-labelledby="editorias-title"
      className="border-t border-border-subtle bg-surface-raised py-12 sm:py-16"
      id="editorias"
    >
      <div className="page-container">
        <div className="flex items-end justify-between gap-6 border-b-2 border-text-primary pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
              Leitura por tema
            </p>
            <h2
              className="mt-2 font-heading text-3xl font-bold tracking-tight text-brand-primary sm:text-4xl"
              id="editorias-title"
            >
              Editorias em destaque
            </h2>
          </div>
          <p className="hidden max-w-md text-right text-sm leading-6 text-text-muted md:block">
            Acompanhe as pautas que conectam saúde, inovação e os impactos
            econômicos de uma vida mais longa.
          </p>
        </div>

        <div className="grid gap-10 pt-8 lg:grid-cols-3 lg:gap-8">
          {categories.map((category) => (
            <CategoryColumn
              category={category}
              key={category.slug}
              tenantQuery={tenantQuery}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryColumn({
  category,
  tenantQuery,
}: {
  category: { name: string; slug: string; stories: PublicStory[] };
  tenantQuery: string;
}) {
  const featured = category.stories[0];
  if (!featured) return null;

  return (
    <section aria-labelledby={`category-${category.slug}`}>
      <Link
        className="inline-flex min-h-11 items-center border-b-4 border-accent pb-1 font-heading text-2xl font-bold text-brand-primary no-underline hover:opacity-70 sm:text-3xl"
        href={`/editoria/${category.slug}${tenantQuery}`}
        id={`category-${category.slug}`}
      >
        {category.name}
      </Link>

      <article className="group mt-5 border-b border-border-subtle pb-5">
        <Link
          className="block no-underline"
          href={`/materia/${featured.canonicalSlug}${tenantQuery}`}
        >
          {featured.imagePath ? (
            <span className="relative block aspect-[16/10] overflow-hidden bg-surface-muted">
              <Image
                alt={featured.imageAlt ?? ""}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                src={featured.imagePath}
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/2 bg-black/55"
              />
              <strong className="absolute inset-x-0 bottom-0 p-4 font-heading text-xl leading-6 text-white sm:p-5 sm:text-2xl sm:leading-7">
                {featured.title}
              </strong>
            </span>
          ) : (
            <strong className="block border-t-4 border-brand-primary py-6 font-heading text-2xl leading-8">
              {featured.title}
            </strong>
          )}
        </Link>
      </article>

      <div>
        {category.stories.slice(1, 3).map((story) => (
          <article
            className="group grid grid-cols-[6.5rem_1fr] gap-4 border-b border-border-subtle py-5"
            key={story.id}
          >
            {story.imagePath ? (
              <Link
                aria-label={`Ler ${story.title}`}
                className="relative aspect-[4/3] overflow-hidden bg-surface-muted"
                href={`/materia/${story.canonicalSlug}${tenantQuery}`}
              >
                <Image
                  alt={story.imageAlt ?? ""}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="104px"
                  src={story.imagePath}
                />
              </Link>
            ) : null}
            <h3 className="font-heading text-base leading-6 font-bold">
              <Link
                className="no-underline hover:underline"
                href={`/materia/${story.canonicalSlug}${tenantQuery}`}
              >
                {story.title}
              </Link>
            </h3>
          </article>
        ))}
      </div>

      <Link
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-primary no-underline hover:underline"
        href={`/editoria/${category.slug}${tenantQuery}`}
      >
        Mais de {category.name}
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
