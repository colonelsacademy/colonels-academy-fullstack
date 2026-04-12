import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return proxyFastifyRequest(
    request,
    `/v1/learning/study-sessions/${encodeURIComponent(sessionId)}/heartbeat`,
    {
      method: "POST",
      body: await request.text(),
      contentType: "application/json"
    }
  );
}
