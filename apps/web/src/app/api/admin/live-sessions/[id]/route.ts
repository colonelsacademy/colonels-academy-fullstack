import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookie = request.headers.get("cookie");
  const res = await fetch(`${API_BASE_URL}/v1/admin/live-sessions/${id}`, {
    method: "DELETE",
    headers: { ...(cookie ? { cookie } : {}) }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
