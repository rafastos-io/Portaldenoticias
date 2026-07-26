import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  createSignedDemoSession,
  DEMO_SESSION_TTL_SECONDS,
  isTrustedMutationOrigin,
  LOGIN_RATE_LIMIT_ATTEMPTS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
  readDemoConfig,
  SlidingWindowRateLimiter,
  verifySignedDemoSession,
} from "@/lib/demo-auth/core";

export const DEMO_SESSION_COOKIE = "broadcast_demo_session";

const globalRateLimit = globalThis as typeof globalThis & {
  broadcastDemoLoginRateLimiter?: SlidingWindowRateLimiter;
};

export const demoLoginRateLimiter =
  globalRateLimit.broadcastDemoLoginRateLimiter ??
  new SlidingWindowRateLimiter(
    LOGIN_RATE_LIMIT_ATTEMPTS,
    LOGIN_RATE_LIMIT_WINDOW_MS,
  );

if (process.env.NODE_ENV !== "production") {
  globalRateLimit.broadcastDemoLoginRateLimiter = demoLoginRateLimiter;
}

export function getServerDemoConfig() {
  return readDemoConfig(process.env);
}

function sessionCookieOptions(maxAge = DEMO_SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    priority: "high" as const,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
  };
}

export async function createDemoSession() {
  const config = getServerDemoConfig();
  const cookieStore = await cookies();
  cookieStore.set(
    DEMO_SESSION_COOKIE,
    createSignedDemoSession(config.sessionSecret),
    sessionCookieOptions(),
  );
}

export async function destroyDemoSession() {
  const cookieStore = await cookies();
  cookieStore.set(
    DEMO_SESSION_COOKIE,
    "",
    sessionCookieOptions(0),
  );
}

export async function getDemoSession() {
  const config = getServerDemoConfig();
  const cookieStore = await cookies();
  return verifySignedDemoSession(
    cookieStore.get(DEMO_SESSION_COOKIE)?.value,
    config.sessionSecret,
  );
}

export async function requireDemoSession() {
  const session = await getDemoSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function assertTrustedMutationOrigin() {
  const requestHeaders = await headers();
  const trusted = isTrustedMutationOrigin({
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    forwardedHost: requestHeaders.get("x-forwarded-host"),
    forwardedProto: requestHeaders.get("x-forwarded-proto"),
    host: requestHeaders.get("host"),
    origin: requestHeaders.get("origin"),
    vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    vercelUrl: process.env.VERCEL_URL,
  });

  if (!trusted) {
    throw new Error("Origem da mutação não autorizada.");
  }
}

export async function getLoginRateLimitKey() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const clientAddress = forwardedFor?.split(",")[0]?.trim();
  return clientAddress || requestHeaders.get("x-real-ip") || "local-unknown";
}
