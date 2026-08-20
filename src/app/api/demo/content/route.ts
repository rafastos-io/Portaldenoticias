import {
  DemoApiQueryError,
  parseDemoApiQuery,
} from "@/lib/demo-api/query";
import {
  listPublicStories,
  resolvePublicTenant,
} from "@/lib/supabase/portal-repository";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function json(payload: unknown, status = 200) {
  return Response.json(payload, { headers, status });
}

function methodNotAllowed() {
  return Response.json(
    {
      demo: true,
      error: "Método não permitido nesta rota demonstrativa.",
    },
    {
      headers: {
        ...headers,
        Allow: "GET",
      },
      status: 405,
    },
  );
}

export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;

export async function GET(request: Request) {
  let query: ReturnType<typeof parseDemoApiQuery>;
  try {
    query = parseDemoApiQuery(new URL(request.url).searchParams);
  } catch (error) {
    return json(
      {
        demo: true,
        error:
          error instanceof DemoApiQueryError
            ? error.message
            : "Filtros inválidos.",
      },
      400,
    );
  }

  try {
    const tenant = await resolvePublicTenant(query.tenantSlug);
    if (!tenant) {
      return json(
        {
          demo: true,
          error: "Tenant demonstrativo não encontrado.",
        },
        404,
      );
    }

    const stories = (await listPublicStories(tenant.id)).filter(
      (story) =>
        !query.categorySlug || story.categorySlug === query.categorySlug,
    );

    return json({
      demo: true,
      disclaimer:
        "Rota técnica de demonstração, sem credenciais comerciais, SLA ou garantia de compatibilidade.",
      filters: {
        editoria: query.categorySlug,
        status: query.status,
      },
      items: stories.map((story) => ({
        author: story.author,
        category: {
          name: story.categoryName,
          slug: story.categorySlug,
        },
        id: story.id,
        publishedAt: story.publishedAt,
        slug: story.canonicalSlug,
        sponsored: Boolean(story.sponsorshipLabel),
        subtitle: story.subtitle,
        title: story.title,
      })),
      tenant: {
        displayName: tenant.displayName,
        slug: tenant.slug,
      },
      total: stories.length,
    });
  } catch {
    return json(
      {
        demo: true,
        error:
          "Catálogo demonstrativo temporariamente indisponível no servidor.",
      },
      503,
    );
  }
}
