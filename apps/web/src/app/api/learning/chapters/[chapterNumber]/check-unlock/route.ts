import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";

/**
 * POST /api/learning/chapters/:chapterNumber/check-unlock?courseSlug=xxx
 *
 * Check if a chapter should be unlocked based on completion criteria - proxied to backend API
 * This endpoint is called after completing a chapter to check if next chapter should unlock
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chapterNumber: string }> }
) {
  const { chapterNumber } = await params;
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const path = `/v1/learning/chapters/${chapterNumber}/check-unlock${queryString ? `?${queryString}` : ""}`;

  return proxyFastifyRequest(request, path, { method: "POST" });
}
