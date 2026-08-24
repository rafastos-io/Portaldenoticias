"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Category = { name: string; slug: string };

export function EditorialNavigation({
  categories,
  centered = false,
  homeHref,
  tenantQuery,
}: {
  categories: Category[];
  centered?: boolean;
  homeHref: string;
  tenantQuery: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const remaining = viewport.scrollWidth - viewport.clientWidth;
    setCanScrollBack(viewport.scrollLeft > 4);
    setCanScrollForward(viewport.scrollLeft < remaining - 4);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(viewport);
    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  function move(direction: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    viewport.scrollBy({
      behavior: reduceMotion ? "auto" : "smooth",
      left: direction * Math.min(viewport.clientWidth * 0.72, 640),
    });
  }

  return (
    <nav
      aria-label="Navegação editorial"
      className="hidden border-t border-border-subtle md:block"
    >
      <div className="editorial-nav-shell page-container relative">
        <div
          className={`editorial-nav-fade editorial-nav-fade-left ${
            canScrollBack ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <button
          aria-label="Ver editorias anteriores"
          className={`editorial-nav-control left-0 ${
            canScrollBack ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          disabled={!canScrollBack}
          onClick={() => move(-1)}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div
          className={`editorial-nav-scroll flex min-h-14 items-center gap-7 overflow-x-auto whitespace-nowrap px-1 pr-12 text-sm font-semibold ${
            centered ? "justify-center" : ""
          }`}
          ref={viewportRef}
        >
          <Link
            className="shrink-0 text-brand-primary decoration-brand-secondary decoration-2 hover:underline"
            href={homeHref}
          >
            Início
          </Link>
          {categories.map((category) => (
            <Link
              className="shrink-0 text-brand-primary decoration-brand-secondary decoration-2 hover:underline"
              href={`/editoria/${category.slug}${tenantQuery}`}
              key={category.slug}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <div
          className={`editorial-nav-fade editorial-nav-fade-right ${
            canScrollForward ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <button
          aria-label="Ver mais editorias"
          className={`editorial-nav-control right-0 ${
            canScrollForward ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          disabled={!canScrollForward}
          onClick={() => move(1)}
          type="button"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}
