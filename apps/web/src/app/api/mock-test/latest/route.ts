import { API_BASE_URL } from "@/lib/apiClient";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("ca_session");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/mock-test/latest`, {
      method: "GET",
      cache: "no-store",
      headers: {
        ...(sessionCookie?.value ? { Cookie: `ca_session=${sessionCookie.value}` } : {})
      }
    });

    if (apiResponse.status === 401) {
      return NextResponse.json({ result: null }, { status: 200 });
    }

    if (!apiResponse.ok) {
      const error = await apiResponse.json().catch(() => ({ message: "Request failed" }));
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("mock-test latest bridge error:", error);
    return NextResponse.json({ result: null }, { status: 200 });
  }
}
