import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookie = request.headers.get("cookie");
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/v1/admin/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
