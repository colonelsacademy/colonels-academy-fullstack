import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");
  const res = await fetch(`${API_BASE_URL}/v1/admin/stats`, {
    headers: { ...(cookie ? { cookie } : {}) }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
