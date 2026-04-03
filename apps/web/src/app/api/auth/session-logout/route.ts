import { NextResponse, NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/apiClient";

export async function POST(request: NextRequest) {
  const csrfToken = request.headers.get("x-csrf-token");
  const cookie = request.headers.get("cookie");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/auth/session-logout`, {
      method: "POST",
      headers: {
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        ...(cookie ? { cookie } : {})
      }
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json().catch(() => ({ message: "Logout failed" }));
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const response = NextResponse.json({ success: true });

    // Forward Set-Cookie headers (to clear the cookie)
    const setCookieHeaders = apiResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });

    return response;
  } catch (error) {
    console.error("Logout bridge error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
