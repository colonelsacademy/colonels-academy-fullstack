import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../_lib/fastify-proxy";

/**
 * POST /api/orders/chapters
 *
 * Create a chapter purchase order - proxied to backend API
 * Body: { moduleId: string, paymentMethod: 'ESEWA' | 'KHALTI' }
 */
export async function POST(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/orders/chapters", { method: "POST" });
}
