import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type {
  PublicStory,
  PublicTenant,
} from "@/lib/supabase/portal-repository";

export function tenantQuery(tenant: PublicTenant) {
  return `?tenant=${encodeURIComponent(tenant.slug)}`;
}

export function StoryImage({
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
  if (!story.imagePath) return null;
  return (
    <span
      className={`relative block overflow-hidden bg-surface-muted ${className}`}
    >
      <Image
        alt={story.imageAlt ?? ""}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        fill
        priority={priority}
        sizes={sizes}
        src={story.imagePath}
      />
    </span>
  );
}
export function StoryCategory({
  story,
  tenant,
}: {
  story: PublicStory;
  tenant: PublicTenant;
}) {
  return (
    <Link
      className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-brand-primary"
      href={`/editoria/${story.categorySlug}${tenantQuery(tenant)}`}
    >
      {story.categoryName}
    </Link>
  );
}

export function StoryTitleLink({
  children,
  className = "",
  story,
  tenant,
}: {
  children?: ReactNode;
  className?: string;
  story: PublicStory;
  tenant: PublicTenant;
}) {
  return (
    <Link
      className={`no-underline hover:underline ${className}`}
      href={`/materia/${story.canonicalSlug}${tenantQuery(tenant)}`}
    >
      {children ?? story.title}
    </Link>
  );
}

export function StoryDisclosure({ story }: { story: PublicStory }) {
  if (!story.sponsorshipLabel) return null;
  return (
    <p className="mt-2 w-fit bg-demo-surface px-2 py-1 text-[0.68rem] font-bold text-demo-text">
      {story.sponsorshipLabel}
    </p>
  );
}

export function ArticleBody({
  story,
}: {
  story: PublicStory;
}) {
  if (story.externalOnly && story.sourceUrl) {
    return (
      <div className="border-y border-border-subtle py-8 text-base leading-7">
        <p>
          Esta pauta foi indicada no briefing como referência externa. A íntegra
          permanece na publicação de origem.
        </p>
        <a
          className="mt-5 inline-flex min-h-11 items-center border border-brand-primary px-4 font-bold text-brand-primary no-underline hover:bg-surface-muted"
          href={story.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Ler na fonte {story.sourceLabel ? `— ${story.sourceLabel}` : ""}
        </a>
      </div>
    );
  }
  return (
    <div className="space-y-7 text-[1.05rem] leading-8 sm:text-lg">
      {story.correctionNote ? (
        <aside className="border-l-4 border-amber-700 bg-demo-surface p-4 text-sm leading-6 text-demo-text">
          <strong>Nota de correção:</strong> {story.correctionNote}
        </aside>
      ) : null}
      {(story.bodyBlocks ?? story.body.map((text) => ({ text, type: "paragraph" as const }))).map(
        (block, index) =>
          block.type === "heading" ? (
            <h2
              className="pt-4 font-heading text-2xl leading-tight font-bold text-brand-primary sm:text-3xl"
              key={`${story.id}-${index}`}
            >
              {block.text}
            </h2>
          ) : (
            <p key={`${story.id}-${index}`}>{block.text}</p>
          ),
      )}
    </div>
  );
}

export function PublishedMeta({ story }: { story: PublicStory }) {
  const publishedDate = story.publishedAt
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(story.publishedAt))
    : "data editorial não informada";

  return (
    <p className="text-xs leading-5 text-text-muted">
      Por <strong className="text-text-primary">{story.author}</strong>
      <span aria-hidden="true"> · </span>
      {story.isRealContent ? (
        <>
          Fonte: {story.sourceUrl ? (
            <a
              className="font-semibold underline underline-offset-2"
              href={story.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              {story.sourceLabel ?? "origem externa"}
            </a>
          ) : (
            <strong className="text-text-primary">
              {story.sourceLabel ?? "material autorizado"}
            </strong>
          )}
        </>
      ) : (
        "perfil demonstrativo"
      )}
      <span aria-hidden="true"> · </span>
      {publishedDate}
    </p>
  );
}
