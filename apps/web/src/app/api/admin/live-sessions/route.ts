import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyFastifyRequest(request, "/v1/admin/live-sessions", {
    method: "POST",
    body,
    contentType: "application/json"
  });
}
