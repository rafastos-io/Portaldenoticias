"use client";

import Script from "next/script";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
    __broadcastVLibras?: boolean;
  }
}

function initializeVLibras() {
  if (!window.VLibras || window.__broadcastVLibras) return;
  new window.VLibras.Widget("https://vlibras.gov.br/app");
  window.__broadcastVLibras = true;
}

export function VLibrasWidget() {
  return (
    <>
      <div
        {...{ vw: "" }}
        aria-label="Tradução para Libras"
        className="enabled"
        role="region"
      >
        <div {...{ "vw-access-button": "" }} className="active" />
        <div {...{ "vw-plugin-wrapper": "" }}>
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
      <Script
        id="vlibras-widget"
        onLoad={initializeVLibras}
        onReady={initializeVLibras}
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
      />
    </>
  );
}
