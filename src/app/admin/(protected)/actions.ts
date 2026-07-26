"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ContentFormError,
  parseEditorialForm,
  parseStatusForm,
  readUuid,
} from "@/lib/admin/content-form";
import { parseThemeForm } from "@/lib/admin/theme-form";
import {
  destroyDemoSession,
  requireDemoSession,
} from "@/lib/demo-auth/server";
import {
  createAdminContent,
  setAdminContentStatus,
  updateAdminContent,
} from "@/lib/supabase/content-repository";
import { saveAdminTheme } from "@/lib/supabase/theme-repository";

function adminLocation(
  tenantId: string,
  kind: "error" | "success",
  message: string,
) {
  const params = new URLSearchParams({
    tenant: tenantId,
    [kind]: message,
  });
  return `/admin?${params.toString()}#conteudo`;
}

function mutationFailure(error: unknown) {
  if (error instanceof ContentFormError) {
    return error.message;
  }

  return "Não foi possível concluir a alteração. Revise os dados e tente novamente.";
}

async function authorizeMutation() {
  await requireDemoSession();
}

export async function logoutAction() {
  await authorizeMutation();
  await destroyDemoSession();
  redirect("/admin/login");
}

export async function createContentAction(formData: FormData) {
  await authorizeMutation();
  let tenantId = "";

  try {
    const input = parseEditorialForm(formData);
    tenantId = input.tenantId;
    await createAdminContent(input);
  } catch (error) {
    redirect(
      adminLocation(
        tenantId || String(formData.get("tenantId") ?? ""),
        "error",
        mutationFailure(error),
      ),
    );
  }

  revalidatePath("/admin");
  redirect(adminLocation(tenantId, "success", "Rascunho criado."));
}

export async function updateContentAction(formData: FormData) {
  await authorizeMutation();
  let tenantId = "";

  try {
    const input = parseEditorialForm(formData);
    tenantId = input.tenantId;
    const contentId = readUuid(formData, "contentId", "Matéria");
    await updateAdminContent({ ...input, contentId });
  } catch (error) {
    redirect(
      adminLocation(
        tenantId || String(formData.get("tenantId") ?? ""),
        "error",
        mutationFailure(error),
      ),
    );
  }

  revalidatePath("/admin");
  redirect(adminLocation(tenantId, "success", "Nova revisão salva."));
}

async function changeStatus(
  formData: FormData,
  status: "published" | "paused",
  success: string,
) {
  await authorizeMutation();
  let tenantId = "";

  try {
    const input = parseStatusForm(formData, status);
    tenantId = input.tenantId;
    await setAdminContentStatus(input);
  } catch (error) {
    redirect(
      adminLocation(
        tenantId || String(formData.get("tenantId") ?? ""),
        "error",
        mutationFailure(error),
      ),
    );
  }

  revalidatePath("/admin");
  redirect(adminLocation(tenantId, "success", success));
}

export async function publishContentAction(formData: FormData) {
  return changeStatus(formData, "published", "Matéria publicada.");
}

export async function pauseContentAction(formData: FormData) {
  return changeStatus(formData, "paused", "Matéria pausada.");
}

export async function resumeContentAction(formData: FormData) {
  return changeStatus(formData, "published", "Matéria retomada.");
}

export async function saveThemeAction(formData: FormData) {
  await authorizeMutation();
  let tenantId = "";

  try {
    const input = parseThemeForm(formData);
    tenantId = input.tenantId;
    await saveAdminTheme(input);
  } catch (error) {
    const params = new URLSearchParams({
      error: mutationFailure(error),
      tenant: tenantId || String(formData.get("tenantId") ?? ""),
    });
    redirect(`/admin/identidade?${params.toString()}#identidade`);
  }

  revalidatePath("/admin/identidade");
  revalidatePath("/");
  redirect(
    `/admin/identidade?tenant=${encodeURIComponent(tenantId)}&success=${encodeURIComponent("Identidade salva.")}#identidade`,
  );
}
