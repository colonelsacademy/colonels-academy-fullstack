import { NextResponse, NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/apiClient";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/auth/session`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: `__session=${sessionCookie?.value}`,
      },
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
