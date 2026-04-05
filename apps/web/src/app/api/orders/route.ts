import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const cookie = request.headers.get("cookie");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {})
      },
      body: JSON.stringify(body)
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
