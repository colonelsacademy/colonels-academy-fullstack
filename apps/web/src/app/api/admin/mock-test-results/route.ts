import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../_lib/fastify-proxy";

export async function GET(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/admin/mock-test-results");
}
