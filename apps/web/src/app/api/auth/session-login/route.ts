import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const csrfToken = request.headers.get("x-csrf-token");
  const cookie = request.headers.get("cookie");

  // Development-only logging
  if (process.env.NODE_ENV === "development") {
    console.log("Session login request:", {
      hasIdToken: !!body.idToken,
      hasCsrfToken: !!csrfToken,
      apiBaseUrl: API_BASE_URL
    });
  }

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/auth/session-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        ...(cookie ? { cookie } : {})
      },
      body: JSON.stringify(body)
    });

    if (process.env.NODE_ENV === "development") {
      console.log("API response status:", apiResponse.status);
    }

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      if (process.env.NODE_ENV === "development") {
        console.error("API error response:", error);
      }
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    const response = NextResponse.json(data);

    // Forward Set-Cookie headers from Fastify to the browser
    const setCookieHeaders = apiResponse.headers.getSetCookie();
    if (process.env.NODE_ENV === "development") {
      console.log("Setting cookies:", setCookieHeaders.length);
    }
    for (const cookie of setCookieHeaders) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Auth bridge error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
