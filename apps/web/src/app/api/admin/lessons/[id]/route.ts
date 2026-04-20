import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFastifyRequest(request, `/v1/admin/lessons/${encodeURIComponent(id)}`, {
    method: "PATCH"
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyFastifyRequest(request, `/v1/admin/lessons/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
