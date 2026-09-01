"use client";

import { useEffect, useState } from "react";

import { PublicPortalRenderer } from "@/components/public/public-portal-renderer";
import {
  createPortalPreviewFixture,
  parsePortalPreviewMessage,
  type PortalPreviewPayload,
} from "@/lib/presentation/portal-preview";

const PREVIEW_READY_MESSAGE = "broadcast:portal-preview:ready:v1";

export function IdentityPortalPreview() {
  const [payload, setPayload] = useState<PortalPreviewPayload | null>(null);
  const [invalidMessage, setInvalidMessage] = useState(false);

  useEffect(() => {
    const handlePreviewUpdate = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent
      ) {
        return;
      }
      const message = parsePortalPreviewMessage(event.data);
      if (!message) {
        setInvalidMessage(true);
        return;
      }
      setInvalidMessage(false);
      setPayload(message.payload);
    };
    window.addEventListener("message", handlePreviewUpdate);
    window.parent.postMessage(
      { type: PREVIEW_READY_MESSAGE },
      window.location.origin,
    );
    return () => window.removeEventListener("message", handlePreviewUpdate);
  }, []);

  if (invalidMessage) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="max-w-md border-l-4 border-red-700 bg-white p-6">
          <h1 className="text-xl font-bold">Preview indisponível</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A identidade contém um modelo ou valor visual inválido. Revise a
            seleção antes de continuar.
          </p>
        </div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <p className="text-sm font-semibold text-slate-600" role="status">
          Preparando o preview do portal…
        </p>
      </main>
    );
  }

  const fixture = createPortalPreviewFixture(payload);
  const shared = {
    categories: fixture.categories,
    tenant: fixture.tenant,
    theme: payload.theme,
  };

  if (payload.page === "home") {
    return (
      <PublicPortalRenderer
        {...shared}
        hero={fixture.hero}
        heroEyebrow={fixture.heroEyebrow}
        marketQuotes={fixture.marketQuotes}
        page="home"
        stories={fixture.stories}
      />
    );
  }
  if (payload.page === "editoria") {
    return (
      <PublicPortalRenderer
        {...shared}
        categoryName={fixture.categoryName}
        page="editoria"
        stories={fixture.categoryStories}
      />
    );
  }
  return (
    <PublicPortalRenderer
      {...shared}
      page="materia"
      story={fixture.story}
    />
  );
}
