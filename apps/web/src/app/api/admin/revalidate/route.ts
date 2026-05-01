import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify admin via the API first
  const authRes = await proxyFastifyRequest(request, "/v1/admin/stats");
  if (!authRes.ok) {
    const message =
      authRes.status === 401 || authRes.status === 403 ? "Unauthorized" : "Auth check failed";
    return NextResponse.json({ message }, { status: authRes.status });
  }

  // Bust Next.js cache for pages that show courses
  revalidatePath("/");
  revalidatePath("/courses");

  return NextResponse.json({ ok: true, revalidated: ["/", "/courses"] });
}
