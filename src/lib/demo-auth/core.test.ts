import { describe, expect, it } from "vitest";

import {
  createSignedDemoLoginToken,
  createSignedDemoSession,
  credentialsMatch,
  DEMO_ACTOR,
  DEMO_LOGIN_TOKEN_TTL_SECONDS,
  DEMO_SESSION_TTL_SECONDS,
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
