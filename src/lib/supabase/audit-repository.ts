import "server-only";

import { createServerSupabaseClient } from "./server";
import { toTenantId } from "./tenant-scope";

export const AUDIT_ACTIONS = [
  "content.created",
  "content.edited",
  "content.published",
  "content.paused",
  "content.resumed",
  "content.media_selected",
  "portal.default_changed",
  "theme.updated",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export function isAuditAction(value: string | undefined): value is AuditAction {
  return AUDIT_ACTIONS.some((action) => action === value);
}

export async function listAdminAuditEvents(
  tenantIdInput: string,
  action?: AuditAction,
) {
  const tenantId = toTenantId(tenantIdInput);
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("audit_events")
    .select(
      "id, actor_id, action, target_type, target_id, reason, created_at",
    )
    .eq("tenant_id", tenantId)
    .eq("is_demo", true)
    .in("action", [...AUDIT_ACTIONS])
    .order("created_at", { ascending: false })
    .limit(100);

  if (action) query = query.eq("action", action);

  const { data, error } = await query;
  if (error) {
    throw new Error("Não foi possível consultar a trilha de auditoria.", {
      cause: error,
    });
  }
  return data;
}
