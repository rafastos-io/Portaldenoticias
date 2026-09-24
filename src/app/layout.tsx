import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Broadcast Saúde & Longevidade",
  description: "Plataforma editorial B2B demonstrativa.",
  icons: { icon: { type: "image/svg+xml", url: "/favicon.svg" } },
  robots: {
    index: false,
    follow: false,
  },
};

// Loaded on demand: only models that map a font key to DM Sans request it.
const dmSans = DM_Sans({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={dmSans.variable}
      data-scroll-behavior="smooth"
      lang="pt-BR"
    >
      <body>{children}</body>
    </html>
  );
}
