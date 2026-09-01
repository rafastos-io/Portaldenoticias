"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  createPortalPreviewMessage,
  type PortalPreviewPayload,
  type PortalPreviewWidth,
} from "@/lib/presentation/portal-preview";

const PREVIEW_READY_MESSAGE = "broadcast:portal-preview:ready:v1";

type IdentityPortalPreviewFrameProps = PortalPreviewPayload & {
  logoUrl: string | null;
  width: PortalPreviewWidth;
};

export function IdentityPortalPreviewFrame({
  logoUrl,
  page,
  tenantId,
  tenantSlug,
  theme,
  width,
}: IdentityPortalPreviewFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const payload = useMemo(
    () => ({
      page,
      tenantId,
      tenantSlug,
      theme: { ...theme, logoUrl },
    }),
    [logoUrl, page, tenantId, tenantSlug, theme],
  ) satisfies PortalPreviewPayload;

  const sendPreview = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      createPortalPreviewMessage(payload),
      window.location.origin,
    );
  }, [payload]);

  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === PREVIEW_READY_MESSAGE
      ) {
        sendPreview();
      }
    };
    window.addEventListener("message", handleReady);
    sendPreview();
    return () => window.removeEventListener("message", handleReady);
  }, [sendPreview]);

  return (
    <iframe
      className="block border-0 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
      ref={frameRef}
      src="/admin/portal-preview"
      style={{ height: "760px", width: `${width}px` }}
      title={`Preview do portal em ${width} pixels`}
    />
  );
}
