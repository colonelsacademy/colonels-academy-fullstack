import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyFastifyRequest(
    request,
    `/v1/admin/courses/${encodeURIComponent(slug)}/lessons`,
    { method: "GET" }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyFastifyRequest(
    request,
    `/v1/admin/courses/${encodeURIComponent(slug)}/lessons`,
    { method: "POST" }
  );
}
