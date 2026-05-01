import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxyFastifyRequest(request, "/v1/admin/courses");
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await proxyFastifyRequest(request, "/v1/admin/courses", {
    method: "POST",
    body,
    contentType: "application/json"
  });
  
  // Revalidate home page and courses page when a new course is created
  if (response.ok) {
    revalidatePath("/");
    revalidatePath("/courses");
  }
  
  return response;
}
