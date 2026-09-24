import { tenantInitials } from "@/lib/presentation/tenant-metadata";
import { resolvePublicTenant } from "@/lib/supabase/portal-repository";
import { getTenantTheme } from "@/lib/supabase/theme-repository";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Favicon generated from the tenant identity: primary colour + initials. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG.test(slug)) return new Response("Not found", { status: 404 });

  try {
    const tenant = await resolvePublicTenant(slug);
    const theme = tenant ? await getTenantTheme(tenant.id) : null;
    if (!theme) return new Response("Not found", { status: 404 });

    const initials = escapeXml(tenantInitials(theme.brandName));
    const fontSize = initials.length > 1 ? 28 : 36;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${theme.primary}"/><rect x="14" y="50" width="36" height="4" rx="2" fill="${theme.accent}"/><text x="32" y="${initials.length > 1 ? 41 : 45}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#FFFFFF">${initials}</text></svg>`;

    return new Response(svg, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Content-Type": "image/svg+xml; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
