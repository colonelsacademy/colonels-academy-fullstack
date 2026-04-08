import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/learning/study-sessions/start", {
    method: "POST",
    body: await request.text(),
    contentType: "application/json"
  });
}
