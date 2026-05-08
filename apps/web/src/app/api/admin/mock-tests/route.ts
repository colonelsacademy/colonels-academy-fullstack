import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/admin/mock-tests");
}

export async function POST(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/admin/mock-tests");
}
