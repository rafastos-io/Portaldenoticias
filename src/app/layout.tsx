import type { Metadata } from "next";
import { DM_Sans, Saira } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Broadcast Saúde & Longevidade",
  description: "Plataforma editorial B2B demonstrativa.",
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

// Display face for model wordmarks; also fetched only where a model uses it.
const saira = Saira({
  display: "swap",
  preload: false,
  style: ["italic"],
  subsets: ["latin"],
  variable: "--font-saira",
  weight: ["700", "800"],
});

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={`${dmSans.variable} ${saira.variable}`}
      data-scroll-behavior="smooth"
      lang="pt-BR"
    >
      <body>{children}</body>
    </html>
  );
}
