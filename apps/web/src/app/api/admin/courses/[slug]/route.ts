import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.text();
  return proxyFastifyRequest(request, `/v1/admin/courses/${slug}`, {
    method: "PATCH",
    body,
    contentType: "application/json"
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyFastifyRequest(request, `/v1/admin/courses/${slug}`, {
    method: "DELETE"
  });
}
