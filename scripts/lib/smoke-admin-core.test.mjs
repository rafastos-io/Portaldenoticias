import { describe, expect, it, vi } from "vitest";

import {
  buildPromotionCommand,
  bypassHeadersForRequest,
  normalizeBaseUrl,
  parsePromotionArguments,
  parseSmokeArguments,
  PRODUCTION_BASE_URL,
  redactSensitiveText,
  runPromotionSequence,
  validateProductionCookie,
} from "./smoke-admin-core.mjs";

describe("argumentos seguros do smoke", () => {
  it("aceita Base URL por argumento e bootstrap protegido por ambiente", () => {
    const options = parseSmokeArguments(
      ["--base-url", "https://preview.example/", "--environment", "preview"],
      {
        SMOKE_ACCESS_URL:
          "https://preview.example/?_vercel_share=segredo-temporario",
      },
    );

    expect(options.baseUrl).toBe("https://preview.example");
    expect(options.accessUrl).toContain("_vercel_share=");
  });

  it("remove access URL do argv e aceita somente o ambiente", () => {
    expect(() =>
      parseSmokeArguments([
        "--base-url",
        "https://preview.example",
        "--environment",
        "preview",
        "--access-url",
        "https://preview.example/?_vercel_share=segredo",
      ]),
    ).toThrow("Opção desconhecida");
  });

  it("recusa Access URL de outra origin", () => {
    expect(() =>
      parseSmokeArguments(
        [
          "--base-url",
          "https://preview.example",
          "--environment",
          "preview",
        ],
        {
          SMOKE_ACCESS_URL:
            "https://attacker.example/?_vercel_share=segredo",
        },
      ),
    ).toThrow("mesma origin");
  });

  it("recusa protocolo, paths e combinações ambiente/alvo inseguras", () => {
    expect(() => normalizeBaseUrl("https://preview.example/admin")).toThrow(
      "raiz",
    );
    expect(() =>
      parseSmokeArguments([
        "--base-url",
        "http://preview.example",
        "--environment",
        "preview",
      ]),
    ).toThrow("HTTPS remota");
    expect(() =>
      parseSmokeArguments([
        "--base-url",
        "http://localhost:3000",
        "--environment",
        "preview",
      ]),
    ).toThrow("HTTPS remota");
    expect(() =>
      parseSmokeArguments([
        "--base-url",
        "https://preview.example",
        "--environment",
        "local",
      ]),
    ).toThrow("HTTP em localhost");
    expect(() =>
      parseSmokeArguments([
        "--base-url",
        "http://localhost:3000/admin",
        "--environment",
        "local",
      ]),
    ).toThrow("raiz");
  });

  it("fixa Production no domínio público vigente", () => {
    expect(
      parseSmokeArguments([
        "--base-url",
        PRODUCTION_BASE_URL,
        "--environment",
        "production",
      ]).baseUrl,
    ).toBe(PRODUCTION_BASE_URL);
    expect(() =>
      parseSmokeArguments([
        "--base-url",
        "https://production-errada.example",
        "--environment",
        "production",
      ]),
    ).toThrow("domínio público vigente");
  });
});

describe("bypass Vercel com escopo de origin", () => {
  it("adiciona headers somente na origin exata do Preview", () => {
    expect(
      bypassHeadersForRequest({
        baseUrl: "https://preview.example",
        bypassSecret: "segredo",
        environment: "preview",
        requestUrl: "https://preview.example/admin/login",
      }),
    ).toEqual({
      "x-vercel-protection-bypass": "segredo",
      "x-vercel-set-bypass-cookie": "true",
    });
  });

  it("não envia segredo cross-origin nem em Production/local", () => {
    for (const requestUrl of [
      "https://attacker.example/collect",
      "https://preview.example.attacker.invalid/collect",
    ]) {
      expect(
        bypassHeadersForRequest({
          baseUrl: "https://preview.example",
          bypassSecret: "segredo",
          environment: "preview",
          requestUrl,
        }),
      ).toEqual({});
    }
    for (const environment of ["production", "local"]) {
      expect(
        bypassHeadersForRequest({
          baseUrl:
            environment === "production"
              ? PRODUCTION_BASE_URL
              : "http://localhost:3000",
          bypassSecret: "segredo",
          environment,
          requestUrl:
            environment === "production"
              ? `${PRODUCTION_BASE_URL}/admin`
              : "http://localhost:3000/admin",
        }),
      ).toEqual({});
    }
  });
});

describe("argumentos do gate de promoção", () => {
  it("recusa flags desconhecidas para evitar promoção acidental", () => {
    expect(() =>
      parsePromotionArguments([
        "--preview-url",
        "https://preview.example",
        "--production-url",
        PRODUCTION_BASE_URL,
        "--deployment",
        "https://preview.example",
        "--dryrun",
      ]),
    ).toThrow("Opção desconhecida");
  });

  it("normaliza alvos distintos e aceita dry-run explícito", () => {
    expect(
      parsePromotionArguments([
        "--preview-url",
        "https://preview.example/",
        "--production-url",
        `${PRODUCTION_BASE_URL}/`,
        "--deployment",
        "https://preview.example/",
        "--dry-run",
      ]),
    ).toMatchObject({
      deployment: "https://preview.example",
      dryRun: true,
      previewUrl: "https://preview.example",
      productionUrl: PRODUCTION_BASE_URL,
    });
  });

  it.each([
    {
      args: [
        "--preview-url",
        "http://localhost:3000",
        "--production-url",
        PRODUCTION_BASE_URL,
        "--deployment",
        "http://localhost:3000",
      ],
      reason: "localhost como Preview",
    },
    {
      args: [
        "--preview-url",
        "https://preview.example/admin",
        "--production-url",
        PRODUCTION_BASE_URL,
        "--deployment",
        "https://preview.example/admin",
      ],
      reason: "path arbitrário",
    },
    {
      args: [
        "--preview-url",
        "https://preview.example",
        "--production-url",
        PRODUCTION_BASE_URL,
        "--deployment",
        "https://outro-preview.example",
      ],
      reason: "deployment diferente",
    },
    {
      args: [
        "--preview-url",
        "https://preview.example",
        "--production-url",
        PRODUCTION_BASE_URL,
        "--deployment",
        "dpl_solto",
      ],
      reason: "deployment ID sem inspect",
    },
    {
      args: [
        "--preview-url",
        "https://preview.example",
        "--production-url",
        "https://alias-incorreto.example",
        "--deployment",
        "https://preview.example",
      ],
      reason: "alias de Production incorreto",
    },
  ])("recusa $reason", ({ args }) => {
    expect(() => parsePromotionArguments(args)).toThrow();
  });
});

describe("comando de promoção", () => {
  it("usa cmd.exe de forma compatível no Windows", () => {
    expect(
      buildPromotionCommand(
        "https://preview.example",
        "win32",
        { ComSpec: "C:\\Windows\\System32\\cmd.exe" },
      ),
    ).toEqual({
      command: "C:\\Windows\\System32\\cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "vercel.cmd",
        "promote",
        "https://preview.example",
        "--yes",
      ],
    });
  });

  it("mantém spawn direto e shell:false fora do Windows", () => {
    expect(
      buildPromotionCommand("https://preview.example", "linux", {}),
    ).toEqual({
      command: "vercel",
      args: ["promote", "https://preview.example", "--yes"],
    });
  });
});

describe("evidência sem segredos", () => {
  it("redige access URL, bypass e senha", () => {
    const access =
      "https://preview.example/?_vercel_share=token-super-secreto";
    const text = redactSensitiveText(
      `goto ${access} x-vercel-protection-bypass: bypass-secreto senha`,
      [access, "senha"],
    );

    expect(text).not.toContain("token-super-secreto");
    expect(text).not.toContain("bypass-secreto");
    expect(text).not.toContain("senha");
    expect(text).toContain("[REDACTED]");
  });
});

describe("cookie de Production", () => {
  it("aprova todos os atributos exigidos", () => {
    expect(
      validateProductionCookie(
        {
          expires: 2_000,
          httpOnly: true,
          path: "/",
          sameSite: "Strict",
          secure: true,
        },
        1_000,
      ),
    ).toEqual({
      expires: true,
      httpOnly: true,
      path: true,
      sameSite: true,
      secure: true,
    });
  });

  it("reprova expiração ausente e flags enfraquecidas", () => {
    expect(() =>
      validateProductionCookie(
        {
          expires: -1,
          httpOnly: false,
          path: "/admin",
          sameSite: "Lax",
          secure: false,
        },
        1_000,
      ),
    ).toThrow("Production reprovada");
  });
});

describe("gate de promoção", () => {
  it("promove e reverifica somente após Preview aprovado", async () => {
    const calls = [];
    await runPromotionSequence({
      previewSmoke: async () => calls.push("preview"),
      promote: async () => calls.push("promote"),
      productionSmoke: async () => calls.push("production"),
    });
    expect(calls).toEqual(["preview", "promote", "production"]);
  });

  it("bloqueia promoção quando o smoke Preview falha", async () => {
    const promote = vi.fn();
    const productionSmoke = vi.fn();

    await expect(
      runPromotionSequence({
        previewSmoke: async () => {
          throw new Error("preview reprovado");
        },
        promote,
        productionSmoke,
      }),
    ).rejects.toThrow("preview reprovado");
    expect(promote).not.toHaveBeenCalled();
    expect(productionSmoke).not.toHaveBeenCalled();
  });

  it("propaga falha de Production após a promoção", async () => {
    await expect(
      runPromotionSequence({
        previewSmoke: async () => {},
        promote: async () => {},
        productionSmoke: async () => {
          throw new Error("production reprovada");
        },
      }),
    ).rejects.toThrow("production reprovada");
  });
});

describe("compatibilidade com pnpm", () => {
  it("aceita o separador de argumentos no smoke", () => {
    expect(
      parseSmokeArguments([
        "--",
        "--base-url",
        "https://preview.example",
        "--environment",
        "preview",
      ]).baseUrl,
    ).toBe("https://preview.example");
  });

  it("aceita o separador de argumentos no gate de promocao", () => {
    expect(
      parsePromotionArguments([
        "--",
        "--preview-url",
        "https://preview.example",
        "--production-url",
        PRODUCTION_BASE_URL,
        "--deployment",
        "https://preview.example",
        "--dry-run",
      ]),
    ).toMatchObject({
      dryRun: true,
      previewUrl: "https://preview.example",
    });
  });
});
