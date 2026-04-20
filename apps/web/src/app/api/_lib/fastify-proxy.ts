import { API_BASE_URL } from "@/lib/apiClient";
import { type NextRequest, NextResponse } from "next/server";

type ProxyOptions = {
  body?: string;
  contentType?: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
};

export async function proxyFastifyRequest(
  request: NextRequest,
  path: string,
  options: ProxyOptions = {}
) {
  const sessionCookie = request.cookies.get("ca_session");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? request.method,
      cache: "no-store",
      headers: {
        ...(sessionCookie?.value ? { Cookie: `ca_session=${sessionCookie.value}` } : {}),
        ...(options.contentType ? { "Content-Type": options.contentType } : {})
      },
      ...(options.body !== undefined ? { body: options.body } : {})
    });

    const responseText = await apiResponse.text();

    return new NextResponse(responseText, {
      status: apiResponse.status,
      headers: {
        "content-type": apiResponse.headers.get("content-type") ?? "application/json"
      }
    });
  } catch (error) {
    console.error(`Proxy bridge failed for ${path}:`, error);
    return NextResponse.json({ message: "Upstream request failed." }, { status: 502 });
  }
}
