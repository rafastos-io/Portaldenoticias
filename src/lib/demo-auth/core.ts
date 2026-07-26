import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export const DEMO_ACTOR = "demo-operator";
export const DEMO_SESSION_TTL_SECONDS = 4 * 60 * 60;
export const DEMO_LOGIN_TOKEN_TTL_SECONDS = 15 * 60;
export const LOGIN_RATE_LIMIT_ATTEMPTS = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const SESSION_VERSION = 1;
const MINIMUM_SECRET_BYTES = 32;
const MAXIMUM_CREDENTIAL_LENGTH = 256;

export type DemoConfig = {
  user: string;
  password: string;
  sessionSecret: string;
};

export type DemoSession = {
  actor: typeof DEMO_ACTOR;
  expiresAt: number;
  issuedAt: number;
};

type DemoSessionPayload = {
  actor: typeof DEMO_ACTOR;
  exp: number;
  iat: number;
  v: typeof SESSION_VERSION;
};

type DemoLoginTokenPayload = {
  exp: number;
  iat: number;
  purpose: "demo-login";
  v: typeof SESSION_VERSION;
};

export class DemoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoConfigurationError";
  }
}

export function readDemoConfig(
  environment: Partial<Record<string, string | undefined>>,
): DemoConfig {
  const user = environment.DEMO_ADMIN_USER?.trim() || "USER";
  const password = environment.DEMO_ADMIN_PASSWORD || "User123";
  const sessionSecret = environment.DEMO_SESSION_SECRET || "";

  if (
    !sessionSecret ||
    sessionSecret.startsWith("replace-with-") ||
    Buffer.byteLength(sessionSecret, "utf8") < MINIMUM_SECRET_BYTES
  ) {
    throw new DemoConfigurationError(
      "DEMO_SESSION_SECRET deve ter ao menos 32 bytes e não pode usar o placeholder.",
    );
  }

  if (
    user.length === 0 ||
    user.length > MAXIMUM_CREDENTIAL_LENGTH ||
    password.length === 0 ||
    password.length > MAXIMUM_CREDENTIAL_LENGTH
  ) {
    throw new DemoConfigurationError(
      "Credenciais demonstrativas inválidas no ambiente.",
    );
  }

  return { user, password, sessionSecret };
}

function credentialDigest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function credentialsMatch(
  receivedUser: string,
  receivedPassword: string,
  config: DemoConfig,
): boolean {
  const receivedUserDigest = credentialDigest(receivedUser);
  const expectedUserDigest = credentialDigest(config.user);
  const receivedPasswordDigest = credentialDigest(receivedPassword);
  const expectedPasswordDigest = credentialDigest(config.password);

  const userMatches = timingSafeEqual(
    receivedUserDigest,
    expectedUserDigest,
  );
  const passwordMatches = timingSafeEqual(
    receivedPasswordDigest,
    expectedPasswordDigest,
  );

  return userMatches && passwordMatches;
}

function signSessionPayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(encodedPayload, "utf8")
    .digest("base64url");
}

export function createSignedDemoSession(
  secret: string,
  now = Date.now(),
): string {
  const issuedAt = Math.floor(now / 1000);
  const payload: DemoSessionPayload = {
    actor: DEMO_ACTOR,
    exp: issuedAt + DEMO_SESSION_TTL_SECONDS,
    iat: issuedAt,
    v: SESSION_VERSION,
  };
  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");
  const signature = signSessionPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function createSignedDemoLoginToken(
  secret: string,
  now = Date.now(),
): string {
  const issuedAt = Math.floor(now / 1000);
  const payload: DemoLoginTokenPayload = {
    exp: issuedAt + DEMO_LOGIN_TOKEN_TTL_SECONDS,
    iat: issuedAt,
    purpose: "demo-login",
    v: SESSION_VERSION,
  };
  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");
  const signature = signSessionPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function isDemoLoginTokenPayload(
  value: unknown,
): value is DemoLoginTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<DemoLoginTokenPayload>;
  return (
    payload.purpose === "demo-login" &&
    payload.v === SESSION_VERSION &&
    Number.isInteger(payload.iat) &&
    Number.isInteger(payload.exp)
  );
}

export function verifySignedDemoLoginToken(
  value: string | undefined,
  secret: string,
  now = Date.now(),
): boolean {
  if (!value) {
    return false;
  }

  const parts = value.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [encodedPayload, receivedSignature] = parts;
  if (!encodedPayload || !receivedSignature) {
    return false;
  }

  const expectedSignature = signSessionPayload(encodedPayload, secret);
  const receivedBuffer = Buffer.from(receivedSignature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as unknown;

    if (!isDemoLoginTokenPayload(payload)) {
      return false;
    }

    const nowInSeconds = Math.floor(now / 1000);
    return (
      payload.exp > nowInSeconds &&
      payload.iat <= nowInSeconds + 60 &&
      payload.exp - payload.iat === DEMO_LOGIN_TOKEN_TTL_SECONDS
    );
  } catch {
    return false;
  }
}

function isDemoSessionPayload(value: unknown): value is DemoSessionPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<DemoSessionPayload>;
  return (
    payload.actor === DEMO_ACTOR &&
    payload.v === SESSION_VERSION &&
    Number.isInteger(payload.iat) &&
    Number.isInteger(payload.exp)
  );
}

export function verifySignedDemoSession(
  value: string | undefined,
  secret: string,
  now = Date.now(),
): DemoSession | null {
  if (!value) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, receivedSignature] = parts;
  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const expectedSignature = signSessionPayload(encodedPayload, secret);
  const receivedBuffer = Buffer.from(receivedSignature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as unknown;

    if (!isDemoSessionPayload(payload)) {
      return null;
    }

    const nowInSeconds = Math.floor(now / 1000);
    if (
      payload.exp <= nowInSeconds ||
      payload.iat > nowInSeconds + 60 ||
      payload.exp - payload.iat !== DEMO_SESSION_TTL_SECONDS
    ) {
      return null;
    }

    return {
      actor: payload.actor,
      expiresAt: payload.exp,
      issuedAt: payload.iat,
    };
  } catch {
    return null;
  }
}

type TrustedOriginInput = {
  appUrl?: string;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  host?: string | null;
  origin?: string | null;
  secFetchSite?: string | null;
  vercelProductionUrl?: string;
  vercelUrl?: string;
};

function normalizeForwardedValue(value: string | null | undefined) {
  return value?.split(",")[0]?.trim().toLowerCase() || null;
}

export function isTrustedMutationOrigin({
  appUrl,
  forwardedHost,
  forwardedProto,
  host,
  origin,
  secFetchSite,
  vercelProductionUrl,
  vercelUrl,
}: TrustedOriginInput): boolean {
  const fetchSite = normalizeForwardedValue(secFetchSite);

  if (fetchSite === "cross-site") {
    return false;
  }

  if (!origin) {
    return fetchSite === "same-origin" || fetchSite === "same-site";
  }

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  if (
    !["http:", "https:"].includes(originUrl.protocol) ||
    originUrl.username ||
    originUrl.password
  ) {
    return false;
  }

  const allowedOrigins = new Set<string>();
  const requestProtocol =
    normalizeForwardedValue(forwardedProto) ?? originUrl.protocol.slice(0, -1);

  if (requestProtocol === "http" || requestProtocol === "https") {
    for (const requestHost of [
      normalizeForwardedValue(forwardedHost),
      normalizeForwardedValue(host),
    ]) {
      if (requestHost) {
        allowedOrigins.add(`${requestProtocol}://${requestHost}`);
      }
    }
  }

  if (appUrl) {
    try {
      allowedOrigins.add(new URL(appUrl).origin.toLowerCase());
    } catch {
      return false;
    }
  }

  for (const vercelHost of [vercelProductionUrl, vercelUrl]) {
    const normalizedHost = normalizeForwardedValue(vercelHost);
    if (normalizedHost) {
      allowedOrigins.add(`https://${normalizedHost}`);
    }
  }

  if (allowedOrigins.has(originUrl.origin.toLowerCase())) {
    return true;
  }

  // Vercel can rewrite the request host before a Server Action runs. In that
  // case the browser's Fetch Metadata remains the reliable same-site signal,
  // while Next.js has already performed its own Origin/Host validation.
  return fetchSite === "same-origin" || fetchSite === "same-site";
}

type RateLimitEntry = {
  attempts: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export class SlidingWindowRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(
    private readonly maximumAttempts: number,
    private readonly windowMs: number,
    private readonly maximumEntries = 2_000,
  ) {}

  consume(key: string, now = Date.now()): RateLimitResult {
    this.removeExpired(now);
    const current = this.entries.get(key);
    const entry =
      !current || current.resetAt <= now
        ? { attempts: 0, resetAt: now + this.windowMs }
        : current;

    entry.attempts += 1;
    this.entries.set(key, entry);
    this.enforceMaximumSize();

    const allowed = entry.attempts <= this.maximumAttempts;
    return {
      allowed,
      remaining: Math.max(0, this.maximumAttempts - entry.attempts),
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000),
      ),
    };
  }

  clear(key: string) {
    this.entries.delete(key);
  }

  private removeExpired(now: number) {
    for (const [key, entry] of this.entries) {
      if (entry.resetAt <= now) {
        this.entries.delete(key);
      }
    }
  }

  private enforceMaximumSize() {
    while (this.entries.size > this.maximumEntries) {
      const oldestKey = this.entries.keys().next().value as
        | string
        | undefined;
      if (!oldestKey) {
        break;
      }
      this.entries.delete(oldestKey);
    }
  }
}
