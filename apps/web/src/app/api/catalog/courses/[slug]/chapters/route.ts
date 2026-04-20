import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../../_lib/fastify-proxy";

/**
 * GET /api/catalog/courses/[slug]/chapters
 *
 * Fetch course chapters with purchase status and bundle offers - proxied to backend API
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  return proxyFastifyRequest(request, `/v1/catalog/courses/${slug}/chapters`);
}
