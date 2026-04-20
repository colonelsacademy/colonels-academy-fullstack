import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../_lib/fastify-proxy";

/**
 * GET /api/learning/chapters/purchase-status?courseSlug=xxx
 *
 * Get user's chapter purchase status and progress - proxied to backend API
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const path = `/v1/learning/chapters/purchase-status${queryString ? `?${queryString}` : ""}`;

  return proxyFastifyRequest(request, path);
}
