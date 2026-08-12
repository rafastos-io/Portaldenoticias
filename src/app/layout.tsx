import type { Metadata } from "next";
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

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
