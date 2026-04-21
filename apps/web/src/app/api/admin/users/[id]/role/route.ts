import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();
  return proxyFastifyRequest(request, `/v1/admin/users/${id}/role`, {
    method: "PATCH",
    body,
    contentType: "application/json"
  });
}
