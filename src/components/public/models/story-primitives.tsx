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
  return (
    <div className="space-y-7 text-[1.05rem] leading-8 sm:text-lg">
      {story.correctionNote ? (
        <aside className="border-l-4 border-amber-700 bg-demo-surface p-4 text-sm leading-6 text-demo-text">
          <strong>Nota de correção:</strong> {story.correctionNote}
        </aside>
      ) : null}
      {story.body.map((paragraph, index) => (
        <p key={`${story.id}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

export function PublishedMeta({ story }: { story: PublicStory }) {
  return (
    <p className="text-xs leading-5 text-text-muted">
      Por <strong className="text-text-primary">{story.author}</strong>
      <span aria-hidden="true"> · </span>
      perfil fictício
      <span aria-hidden="true"> · </span>
      {story.publishedAt
        ? new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
            timeZone: "America/Sao_Paulo",
          }).format(new Date(story.publishedAt))
        : "data editorial não informada"}
    </p>
  );
}
