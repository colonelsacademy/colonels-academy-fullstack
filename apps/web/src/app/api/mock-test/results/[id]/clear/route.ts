import { API_BASE_URL } from "@/lib/apiClient";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const sessionCookie = request.cookies.get("ca_session");
  const { id } = await context.params;

  if (!sessionCookie?.value) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  if (!id?.trim()) {
    return NextResponse.json({ message: "Result id is required." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/mock-test/results/${encodeURIComponent(id)}/clear`, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Cookie: `ca_session=${sessionCookie.value}`
      }
    });

    if (!apiResponse.ok && apiResponse.status !== 204) {
      const error = await apiResponse.json().catch(() => ({ message: "Request failed" }));
      return NextResponse.json(error, { status: apiResponse.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("mock-test clear bridge error:", error);
    return NextResponse.json({ message: "Upstream API unreachable." }, { status: 502 });
  }
}
