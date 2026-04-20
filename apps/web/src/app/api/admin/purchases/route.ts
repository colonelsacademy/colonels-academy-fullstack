import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../_lib/fastify-proxy";

/**
 * GET /api/admin/purchases?courseSlug=xxx&limit=50&offset=0&status=COMPLETED
 *
 * List all purchases (admin only) - proxied to backend API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const path = `/v1/admin/purchases${queryString ? `?${queryString}` : ""}`;

  return proxyFastifyRequest(request, path);
}
