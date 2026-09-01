import { IdentityPortalPreview } from "@/components/admin/identity-portal-preview";
import { requireDemoSession } from "@/lib/demo-auth/server";

export const dynamic = "force-dynamic";

export default async function PortalPreviewPage() {
  await requireDemoSession();
  return <IdentityPortalPreview />;
}
