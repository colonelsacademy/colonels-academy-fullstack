import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import { type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params;

  return proxyFastifyRequest(
    request,
    `/v1/learning/submissions/${encodeURIComponent(courseSlug)}`,
    {
      method: "GET"
    }
  );
}
