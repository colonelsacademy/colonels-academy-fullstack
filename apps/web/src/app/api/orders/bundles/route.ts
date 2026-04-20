import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../_lib/fastify-proxy";

/**
 * POST /api/orders/bundles
 *
 * Create a bundle purchase order - proxied to backend API
 * Body: { bundleOfferId: string, paymentMethod: 'ESEWA' | 'KHALTI' }
 */
export async function POST(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/orders/bundles", { method: "POST" });
}
