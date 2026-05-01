import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/apiClient";

export async function POST(request: Request) {
  const body = await request.json();
  const csrfToken = request.headers.get("x-csrf-token");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/auth/session-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    const response = NextResponse.json(data);

    // Forward Set-Cookie headers from Fastify to the browser
    const setCookieHeaders = apiResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });

    return response;
  } catch (error) {
    console.error("Auth bridge error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
