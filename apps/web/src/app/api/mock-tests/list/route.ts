import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subjectId = searchParams.get("subjectId");

  if (!subjectId) {
    return Response.json({ message: "subjectId is required" }, { status: 400 });
  }

  const query = `?subjectId=${encodeURIComponent(subjectId)}`;

  return proxyFastifyRequest(request, `/v1/mock-tests${query}`);
}
