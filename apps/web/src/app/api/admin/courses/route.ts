import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");
  const res = await fetch(`${API_BASE_URL}/v1/admin/courses`, {
    headers: { ...(cookie ? { cookie } : {}) }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie");
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/v1/admin/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
