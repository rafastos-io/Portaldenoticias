import type { NextConfig } from "next";

function appHostname(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

const serverActionAllowedOrigins = [
  ...new Set(
    [
      appHostname(process.env.NEXT_PUBLIC_APP_URL),
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
    ].filter((value): value is string => Boolean(value)),
  ),
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins,
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/sign/**",
        protocol: "https",
      },
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
