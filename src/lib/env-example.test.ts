import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readExampleValue(source: string, name: string) {
  const line = source
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`${name}=`));

  return line?.slice(name.length + 1).trim() ?? "";
}

describe(".env.example", () => {
  const source = readFileSync(".env.example", "utf8");

  it("keeps server secrets as explicit placeholders", () => {
    const supabaseSecret = readExampleValue(source, "SUPABASE_SECRET_KEY");
    const sessionSecret = readExampleValue(source, "DEMO_SESSION_SECRET");

    expect(supabaseSecret).toBe("replace-with-modern-server-secret");
    expect(supabaseSecret).not.toMatch(/^sb_secret_/);
    expect(sessionSecret).toContain("replace-with");
    expect(sessionSecret).not.toMatch(/^[a-f0-9]{64}$/i);
  });

  it("keeps the documented demo credentials", () => {
    expect(readExampleValue(source, "DEMO_ADMIN_USER")).toBe("USER");
    expect(readExampleValue(source, "DEMO_ADMIN_PASSWORD")).toBe("User123");
  });
});
