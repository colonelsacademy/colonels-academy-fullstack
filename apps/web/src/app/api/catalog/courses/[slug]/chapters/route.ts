import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";

/**
 * GET /api/catalog/courses/[slug]/chapters
 *
 * Fetch course chapters with purchase status and bundle offers - proxied to backend API
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyFastifyRequest(request, `/v1/catalog/courses/${slug}/chapters`);
}
