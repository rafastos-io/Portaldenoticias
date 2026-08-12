"use server";

import { redirect } from "next/navigation";

import { credentialsMatch } from "@/lib/demo-auth/core";
import {
  createDemoSession,
  demoLoginRateLimiter,
  getLoginRateLimitKey,
  getServerDemoConfig,
  isValidDemoLoginToken,
} from "@/lib/demo-auth/server";

export type LoginState = {
  message: string | null;
  status: "idle" | "error";
};

function readCredential(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" && value.length <= 256 ? value : "";
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const loginToken = readCredential(formData, "loginToken");

  try {
    if (!isValidDemoLoginToken(loginToken)) {
      throw new Error("Token de login inválido.");
    }
  } catch {
    return {
      message: "A sessão de login expirou. Recarregue a página e tente novamente.",
      status: "error",
    };
  }

  const rateLimitKey = await getLoginRateLimitKey();
  const rateLimit = demoLoginRateLimiter.consume(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      message: `Muitas tentativas. Tente novamente em ${rateLimit.retryAfterSeconds} segundos.`,
      status: "error",
    };
  }

  let config;
  try {
    config = getServerDemoConfig();
  } catch {
    return {
      message: "O ambiente demonstrativo ainda não está configurado.",
      status: "error",
    };
  }

  const receivedUser = readCredential(formData, "user");
  const receivedPassword = readCredential(formData, "password");

  if (
    !credentialsMatch(receivedUser, receivedPassword, config)
  ) {
    return {
      message: "Usuário ou senha inválidos.",
      status: "error",
    };
  }

  demoLoginRateLimiter.clear(rateLimitKey);
  await createDemoSession();
  redirect("/admin");
}
