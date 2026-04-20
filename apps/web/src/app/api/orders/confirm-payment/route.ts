import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "../../_lib/fastify-proxy";

/**
 * POST /api/orders/confirm-payment
 *
 * Confirm payment and unlock chapters - proxied to backend API
 * Body: {
 *   purchaseId: string,
 *   type: 'chapter' | 'bundle',
 *   transactionId: string,
 *   paymentStatus: 'COMPLETED' | 'FAILED'
 * }
 */
export async function POST(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/orders/confirm-payment", { method: "POST" });
}
