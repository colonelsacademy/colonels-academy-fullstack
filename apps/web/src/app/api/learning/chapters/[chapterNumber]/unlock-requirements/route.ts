import type { NextRequest } from "next/server";

import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";

/**
 * GET /api/learning/chapters/:chapterNumber/unlock-requirements?courseSlug=xxx
 *
 * Get unlock requirements for a specific chapter - proxied to backend API
 * Returns what needs to be completed to unlock the chapter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterNumber: string }> }
) {
  const { chapterNumber } = await params;
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const path = `/v1/learning/chapters/${chapterNumber}/unlock-requirements${queryString ? `?${queryString}` : ""}`;

  return proxyFastifyRequest(request, path);
}
