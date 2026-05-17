import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const response = await proxyFastifyRequest(request, "/v1/admin/mock-tests/mock-tests");
  console.log("Mock Tests Proxy Response Status:", response.status);
  const clone = response.clone();
  console.log("Mock Tests Proxy Response Body:", await clone.text());
  return response;
}

export async function POST(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/admin/mock-tests/mock-tests");
}
