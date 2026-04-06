import { API_BASE_URL } from "@/lib/apiClient";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("ca_session");

  if (!sessionCookie?.value) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/mock-test/results`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: `ca_session=${sessionCookie.value}`
      },
      body: JSON.stringify(body)
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json().catch(() => ({ message: "Request failed" }));
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("mock-test results bridge error:", error);
    return NextResponse.json({ message: "Upstream API unreachable." }, { status: 502 });
  }
}
