import { describe, expect, it } from "vitest";

import {
  createSignedDemoLoginToken,
  createSignedDemoSession,
  credentialsMatch,
  DEMO_ACTOR,
  DEMO_LOGIN_TOKEN_TTL_SECONDS,
  DEMO_SESSION_TTL_SECONDS,
  isTrustedMutationOrigin,
  readDemoConfig,
  SlidingWindowRateLimiter,
  verifySignedDemoLoginToken,
  verifySignedDemoSession,
} from "./core";

const strongSecret = "a-strong-demo-secret-with-at-least-32-bytes";

describe("demo configuration", () => {
  it("uses only the documented credential defaults", () => {
    const config = readDemoConfig({ DEMO_SESSION_SECRET: strongSecret });
    expect(config.user).toBe("USER");
    expect(config.password).toBe("User123");
  });

  it("rejects missing, short and placeholder session secrets", () => {
    expect(() => readDemoConfig({})).toThrow();
    expect(() =>
      readDemoConfig({ DEMO_SESSION_SECRET: "too-short" }),
    ).toThrow();
    expect(() =>
      readDemoConfig({
        DEMO_SESSION_SECRET: "replace-with-a-long-random-value",
      }),
    ).toThrow();
    expect(() =>
      readDemoConfig({
        DEMO_SESSION_SECRET:
          "replace-with-at-least-32-random-characters",
      }),
    ).toThrow();
  });
});

describe("demo credentials", () => {
  const config = readDemoConfig({ DEMO_SESSION_SECRET: strongSecret });

  it("accepts the configured credential pair", () => {
    expect(credentialsMatch("USER", "User123", config)).toBe(true);
  });

  it("rejects an incorrect user or password", () => {
    expect(credentialsMatch("user", "User123", config)).toBe(false);
    expect(credentialsMatch("USER", "wrong", config)).toBe(false);
  });
});

describe("signed demo session", () => {
  const now = Date.UTC(2026, 6, 24, 12);

  it("verifies an intact and unexpired cookie", () => {
    const cookie = createSignedDemoSession(strongSecret, now);
    expect(verifySignedDemoSession(cookie, strongSecret, now)).toEqual({
      actor: DEMO_ACTOR,
      issuedAt: Math.floor(now / 1000),
      expiresAt: Math.floor(now / 1000) + DEMO_SESSION_TTL_SECONDS,
    });
  });

  it("rejects tampering, a different secret and expiration", () => {
    const cookie = createSignedDemoSession(strongSecret, now);
    expect(
      verifySignedDemoSession(`${cookie}tampered`, strongSecret, now),
    ).toBeNull();
    expect(
      verifySignedDemoSession(cookie, `${strongSecret}-different`, now),
    ).toBeNull();
    expect(
      verifySignedDemoSession(
        cookie,
        strongSecret,
        now + DEMO_SESSION_TTL_SECONDS * 1000,
      ),
    ).toBeNull();
  });
});

describe("signed demo login token", () => {
  const now = Date.UTC(2026, 6, 24, 12);

  it("accepts an intact token only inside its short validity window", () => {
    const token = createSignedDemoLoginToken(strongSecret, now);
    expect(verifySignedDemoLoginToken(token, strongSecret, now)).toBe(
      true,
    );
    expect(
      verifySignedDemoLoginToken(
        token,
        strongSecret,
        now + DEMO_LOGIN_TOKEN_TTL_SECONDS * 1000,
      ),
    ).toBe(false);
  });

  it("rejects a changed token and a different secret", () => {
    const token = createSignedDemoLoginToken(strongSecret, now);
    expect(
      verifySignedDemoLoginToken(`${token}tampered`, strongSecret, now),
    ).toBe(false);
    expect(
      verifySignedDemoLoginToken(
        token,
        `${strongSecret}-different`,
        now,
      ),
    ).toBe(false);
  });
});

describe("mutation origin", () => {
  it("accepts the exact request origin or configured application URL", () => {
    expect(
      isTrustedMutationOrigin({
        host: "localhost:3000",
        origin: "http://localhost:3000",
      }),
    ).toBe(true);
    expect(
      isTrustedMutationOrigin({
        appUrl: "https://demo.example",
        host: "internal:3000",
        origin: "https://demo.example",
      }),
    ).toBe(true);
  });

  it("accepts public and generated Vercel aliases without trusting a foreign origin", () => {
    expect(
      isTrustedMutationOrigin({
        forwardedHost:
          "portaldenoticias-raafastosgmailcoms-projects.vercel.app",
        forwardedProto: "https",
        host: "portaldenoticias-five.vercel.app",
        origin: "https://portaldenoticias-five.vercel.app",
      }),
    ).toBe(true);
    expect(
      isTrustedMutationOrigin({
        forwardedHost: "internal.example",
        forwardedProto: "https",
        host: "internal.example",
        origin: "https://portaldenoticias-five.vercel.app",
        vercelProductionUrl: "portaldenoticias-five.vercel.app",
        vercelUrl:
          "portaldenoticias-dnh46i58q-raafastosgmailcoms-projects.vercel.app",
      }),
    ).toBe(true);
    expect(
      isTrustedMutationOrigin({
        forwardedHost: "internal.example",
        forwardedProto: "https",
        host: "internal.example",
        origin: "https://attacker.example",
        vercelProductionUrl: "portaldenoticias-five.vercel.app",
      }),
    ).toBe(false);
  });

  it("accepts an originless same-origin browser mutation", () => {
    expect(
      isTrustedMutationOrigin({
        host: "demo.example",
        origin: null,
        secFetchSite: "same-origin",
      }),
    ).toBe(true);
  });

  it("accepts Vercel host rewrites only with a same-site browser signal", () => {
    expect(
      isTrustedMutationOrigin({
        forwardedHost: "internal.vercel.example",
        host: "internal.vercel.example",
        origin:
          "https://portaldenoticias-actfvduyn-raafastosgmailcoms-projects.vercel.app",
        secFetchSite: "same-origin",
      }),
    ).toBe(true);
    expect(
      isTrustedMutationOrigin({
        forwardedHost: "internal.vercel.example",
        host: "internal.vercel.example",
        origin: "https://attacker.example",
        secFetchSite: "cross-site",
      }),
    ).toBe(false);
  });

  it("rejects absent, malformed and cross-site origins", () => {
    expect(
      isTrustedMutationOrigin({
        host: "demo.example",
        origin: null,
      }),
    ).toBe(false);
    expect(
      isTrustedMutationOrigin({
        host: "demo.example",
        origin: null,
        secFetchSite: "cross-site",
      }),
    ).toBe(false);
    expect(
      isTrustedMutationOrigin({
        host: "demo.example",
        origin: "not-an-origin",
      }),
    ).toBe(false);
    expect(
      isTrustedMutationOrigin({
        host: "demo.example",
        origin: "https://attacker.example",
      }),
    ).toBe(false);
  });
});

describe("login rate limiter", () => {
  it("blocks attempts above the window limit and resets safely", () => {
    const limiter = new SlidingWindowRateLimiter(2, 1_000);
    expect(limiter.consume("client", 0).allowed).toBe(true);
    expect(limiter.consume("client", 1).allowed).toBe(true);
    expect(limiter.consume("client", 2).allowed).toBe(false);
    expect(limiter.consume("client", 1_001).allowed).toBe(true);
    limiter.clear("client");
    expect(limiter.consume("client", 1_002).remaining).toBe(1);
  });
});
