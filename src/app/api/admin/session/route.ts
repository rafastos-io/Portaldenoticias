import { getDemoSession } from "@/lib/demo-auth/server";

const responseHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET() {
  try {
    const session = await getDemoSession();
    if (!session) {
      return Response.json(
        { error: "unauthorized" },
        { headers: responseHeaders, status: 401 },
      );
    }

    return Response.json(
      {
        actor: session.actor,
        demo: true,
        expiresAt: session.expiresAt,
      },
      { headers: responseHeaders },
    );
  } catch {
    return Response.json(
      { error: "demo_gate_unavailable" },
      { headers: responseHeaders, status: 503 },
    );
  }
}
