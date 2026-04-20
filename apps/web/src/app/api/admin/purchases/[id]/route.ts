import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../../_lib/fastify-proxy";

/**
 * GET /api/admin/purchases/:id
 *
 * Get detailed purchase information (admin only) - proxied to backend API
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFastifyRequest(request, `/v1/admin/purchases/${id}`);
}
