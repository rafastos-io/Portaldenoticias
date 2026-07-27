import "server-only";

import { createServerSupabaseClient } from "./server";
import { toTenantId } from "./tenant-scope";

const PUBLIC_HOME_SETTING_KEY = "public-home";

export type DefaultDemoPortalSetting = {
  defaultTenantId: string;
  revision: number;
};

export class DefaultDemoPortalConflictError extends Error {
  constructor() {
    super(
      "A demonstração pública padrão mudou em outra sessão. Recarregue a página antes de confirmar novamente.",
    );
    this.name = "DefaultDemoPortalConflictError";
  }
}

export async function getDefaultDemoPortalSetting(): Promise<DefaultDemoPortalSetting | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("demo_portal_settings")
    .select("default_tenant_id, revision")
    .eq("setting_key", PUBLIC_HOME_SETTING_KEY)
    .eq("is_demo", true)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Não foi possível carregar a demonstração pública padrão.",
      { cause: error },
    );
  }
  if (!data) return null;
  if (!Number.isSafeInteger(data.revision) || data.revision < 1) {
    throw new Error("A configuração da demonstração pública é inválida.");
  }

  return {
    defaultTenantId: toTenantId(data.default_tenant_id),
    revision: data.revision,
  };
}

export async function setDefaultDemoPortal(input: {
  expectedRevision: number;
  tenantId: string;
}) {
  if (
    !Number.isSafeInteger(input.expectedRevision) ||
    input.expectedRevision < 1
  ) {
    throw new Error("Revisão da demonstração pública inválida.");
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc(
    "cms_set_default_demo_tenant",
    {
      p_expected_revision: input.expectedRevision,
      p_tenant_id: toTenantId(input.tenantId),
    },
  );

  if (error?.code === "40001") {
    throw new DefaultDemoPortalConflictError();
  }
  if (error) {
    throw new Error(
      "Não foi possível alterar a demonstração pública padrão.",
      { cause: error },
    );
  }

  return data;
}
