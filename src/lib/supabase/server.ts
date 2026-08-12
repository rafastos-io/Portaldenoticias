import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

function requiredServerEnv(name: "SUPABASE_URL" | "SUPABASE_SECRET_KEY"): string {
  const value = process.env[name]?.trim();

  if (
    !value ||
    value.includes("replace-with") ||
    value.includes("your-project")
  ) {
    throw new Error(`${name} não foi configurada no ambiente do servidor.`);
  }

  return value;
}

function readServerConfig() {
  const url = requiredServerEnv("SUPABASE_URL");
  const secretKey = requiredServerEnv("SUPABASE_SECRET_KEY");
  const parsedUrl = new URL(url);
  const isLocal =
    parsedUrl.hostname === "127.0.0.1" || parsedUrl.hostname === "localhost";

  if (parsedUrl.protocol !== "https:" && !isLocal) {
    throw new Error("SUPABASE_URL deve usar HTTPS fora do ambiente local.");
  }

  if (!secretKey.startsWith("sb_secret_")) {
    throw new Error(
      "SUPABASE_SECRET_KEY deve receber uma chave moderna sb_secret_ usada apenas no servidor.",
    );
  }

  if (secretKey.length < 32) {
    throw new Error("SUPABASE_SECRET_KEY é curta ou inválida.");
  }

  return { secretKey, url };
}

export function createServerSupabaseClient(): SupabaseClient<Database> {
  const { secretKey, url } = readServerConfig();

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "broadcast-mvp0-server",
      },
    },
  });
}
