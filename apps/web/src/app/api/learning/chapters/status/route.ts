import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";

/**
 * GET /api/learning/chapters/status?courseSlug=xxx
 *
 * Get chapter unlock status for all chapters in a course - proxied to backend API
 * Returns which chapters are locked/unlocked and why
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const path = `/v1/learning/chapters/status${queryString ? `?${queryString}` : ""}`;

  return proxyFastifyRequest(request, path);
}
