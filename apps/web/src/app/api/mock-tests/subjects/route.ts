import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const position = searchParams.get("position");

  const query = position ? `?position=${encodeURIComponent(position)}` : "";

  return proxyFastifyRequest(request, `/v1/mock-tests/subjects${query}`);
}
