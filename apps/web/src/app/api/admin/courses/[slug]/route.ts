import { proxyFastifyRequest } from "@/app/api/_lib/fastify-proxy";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.text();
  const response = await proxyFastifyRequest(request, `/v1/admin/courses/${slug}`, {
    method: "PATCH",
    body,
    contentType: "application/json"
  });
  
  // Revalidate home page and courses page when a course is updated (including hide/show)
  if (response.ok) {
    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath(`/courses/${slug}`);
    revalidatePath("/staff-college"); // In case it's the staff college course
  }
  
  return response;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const response = await proxyFastifyRequest(request, `/v1/admin/courses/${slug}`, {
    method: "DELETE"
  });
  
  // Revalidate home page and courses page when a course is deleted
  if (response.ok) {
    revalidatePath("/");
    revalidatePath("/courses");
  }
  
  return response;
}
