import type { ReactNode } from "react";

import { logoutAction } from "@/app/admin/(protected)/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireDemoSession } from "@/lib/demo-auth/server";

export const dynamic = "force-dynamic";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  await requireDemoSession();
  return (
    <AdminShell logoutAction={logoutAction}>{children}</AdminShell>
  );
}
