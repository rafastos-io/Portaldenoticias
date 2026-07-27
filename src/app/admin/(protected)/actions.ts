"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { TenantMutationState } from "@/components/admin/tenant-mutation-form";
import {
  ContentFormError,
  parseEditorialForm,
  parseStatusForm,
  readUuid,
} from "@/lib/admin/content-form";
import {
  ADMIN_TENANT_COOKIE,
  assessTenantMutationContext,
  safeAdminReturnPath,
} from "@/lib/admin/tenant-context";
import {
  parseCreateIdentityForm,
  parseLogoUploadForm,
  parseThemeForm,
} from "@/lib/admin/theme-form";
import {
  destroyDemoSession,
  requireDemoSession,
} from "@/lib/demo-auth/server";
import {
  createAdminContent,
  listAdminTenants,
  setAdminContentStatus,
  updateAdminContent,
} from "@/lib/supabase/content-repository";
import {
  DefaultDemoPortalConflictError,
  setDefaultDemoPortal,
} from "@/lib/supabase/demo-settings-repository";
import {
  createDemoTenantFromPreset,
  saveAdminTheme,
  uploadAdminThemeLogo,
} from "@/lib/supabase/theme-repository";

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

async function authorizeMutation(formData?: FormData) {
  await requireDemoSession();

  if (!formData) return null;

  const tenants = await listAdminTenants();
  const targetTenantId = String(formData.get("tenantId") ?? "") || undefined;
  const contextTenantId =
    String(formData.get("contextTenantId") ?? "") || undefined;
  const confirmedTenantId =
    String(formData.get("confirmTenantMismatch") ?? "") || undefined;
  const cookieStore = await cookies();
  const assessment = assessTenantMutationContext({
    activeCookieTenantId: cookieStore.get(ADMIN_TENANT_COOKIE)?.value,
    allowedTenantIds: tenants.map((tenant) => tenant.id),
    confirmedTenantId,
    contextTenantId,
    targetTenantId,
  });

  if (assessment.ok) return null;

  if (assessment.kind === "confirmation") {
    const tenant = tenants.find((item) => item.id === assessment.tenantId);
    if (!tenant) {
      return {
        message:
          "O contexto informado não é válido. Recarregue a página antes de tentar novamente.",
        status: "error",
      } satisfies TenantMutationState;
    }
    return {
      message: `A operação foi aberta em ${tenant.display_name}, mas o seletor global aponta para outro tenant. Nenhuma alteração foi executada.`,
      status: "confirmation",
      tenantId: tenant.id,
      tenantName: tenant.display_name,
    } satisfies TenantMutationState;
  }

  return {
    message:
      "O contexto informado não é válido. Recarregue a página antes de tentar novamente.",
    status: "error",
  } satisfies TenantMutationState;
}

export async function logoutAction() {
  await authorizeMutation();
  await destroyDemoSession();
  redirect("/admin/login");
}

export async function switchTenantAction(formData: FormData) {
  await authorizeMutation();
  const tenants = await listAdminTenants();
  const tenantId = String(formData.get("tenantId") ?? "");
  const selected = tenants.find((tenant) => tenant.id === tenantId);

  if (!selected) {
    redirect(
      `/admin?error=${encodeURIComponent("Contexto de tenant inválido.")}`,
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TENANT_COOKIE, selected.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const returnPath = safeAdminReturnPath(formData.get("returnTo"));
  const url = new URL(returnPath, "https://broadcast.local");
  url.searchParams.set("tenant", selected.id);
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}

export async function setDefaultDemoPortalAction(
  _state: TenantMutationState,
  formData: FormData,
): Promise<TenantMutationState> {
  const authorization = await authorizeMutation(formData);
  if (authorization) return authorization;

  if (formData.get("confirmGlobalDefault") !== "yes") {
    return {
      message:
        "Confirme que a página pública sem tenant mudará para todas as pessoas.",
      status: "error",
    };
  }

  const expectedRevision = Number(formData.get("expectedRevision"));
  const tenantId = String(formData.get("tenantId") ?? "");

  if (
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 1
  ) {
    return {
      message:
        "A versão da configuração pública é inválida. Recarregue a página.",
      status: "error",
    };
  }

  try {
    await setDefaultDemoPortal({ expectedRevision, tenantId });
  } catch (error) {
    return {
      message:
        error instanceof DefaultDemoPortalConflictError
          ? error.message
          : "Não foi possível alterar o portal padrão. Recarregue a página e tente novamente.",
      status: "error",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin", "layout");
  return {
    message: "Este tenant agora é a demonstração pública padrão.",
    status: "success",
  };
}

export async function createContentAction(
  _state: TenantMutationState,
  formData: FormData,
): Promise<TenantMutationState> {
  const authorization = await authorizeMutation(formData);
  if (authorization) return authorization;
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

export async function updateContentAction(
  _state: TenantMutationState,
  formData: FormData,
): Promise<TenantMutationState> {
  const authorization = await authorizeMutation(formData);
  if (authorization) return authorization;
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
  _state: TenantMutationState,
  formData: FormData,
  status: "published" | "paused",
  success: string,
): Promise<TenantMutationState> {
  const authorization = await authorizeMutation(formData);
  if (authorization) return authorization;
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

export async function publishContentAction(
  state: TenantMutationState,
  formData: FormData,
) {
  return changeStatus(state, formData, "published", "Matéria publicada.");
}

export async function pauseContentAction(
  state: TenantMutationState,
  formData: FormData,
) {
  return changeStatus(state, formData, "paused", "Matéria pausada.");
}

export async function resumeContentAction(
  state: TenantMutationState,
  formData: FormData,
) {
  return changeStatus(state, formData, "published", "Matéria retomada.");
}

export async function saveThemeAction(
  _state: TenantMutationState,
  formData: FormData,
): Promise<TenantMutationState> {
  const authorization = await authorizeMutation(formData);
  if (authorization) return authorization;
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

export async function createIdentityAction(
  _state: TenantMutationState,
  formData: FormData,
): Promise<TenantMutationState> {
  const authorization = await authorizeMutation(formData);
  if (authorization) return authorization;
  let createdTenantId = "";

  try {
    const input = parseCreateIdentityForm(formData);
    createdTenantId = await createDemoTenantFromPreset(input);
  } catch (error) {
    redirect(
      `/admin/identidade?tenant=${encodeURIComponent(String(formData.get("tenantId") ?? ""))}&error=${encodeURIComponent(mutationFailure(error))}#nova-identidade`,
    );
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect(
    `/admin/identidade?tenant=${encodeURIComponent(createdTenantId)}&success=${encodeURIComponent("Nova identidade criada a partir do preset.")}#identidade`,
  );
}

export async function uploadThemeLogoAction(
  _state: TenantMutationState,
  formData: FormData,
): Promise<TenantMutationState> {
  const authorization = await authorizeMutation(formData);
  if (authorization) return authorization;
  const tenantId = String(formData.get("tenantId") ?? "");

  try {
    const input = await parseLogoUploadForm(formData);
    await uploadAdminThemeLogo(input);
  } catch (error) {
    redirect(
      `/admin/identidade?tenant=${encodeURIComponent(tenantId)}&error=${encodeURIComponent(mutationFailure(error))}#logo`,
    );
  }

  revalidatePath("/admin/identidade");
  revalidatePath("/");
  redirect(
    `/admin/identidade?tenant=${encodeURIComponent(tenantId)}&success=${encodeURIComponent("Logo salvo na identidade.")}#logo`,
  );
}
