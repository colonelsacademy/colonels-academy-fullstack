import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/apiClient";

export async function GET() {
  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/auth/csrf`, {
      method: "GET",
      cache: "no-store"
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
    console.error("CSRF bridge error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
