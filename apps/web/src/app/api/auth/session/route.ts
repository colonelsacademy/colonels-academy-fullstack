import { API_BASE_URL } from "@/lib/apiClient";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("ca_session");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/auth/session`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: `ca_session=${sessionCookie?.value}`
      }
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Session bridge error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
