import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const cookie = request.headers.get("cookie");
  const csrfToken = request.headers.get("x-csrf-token");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/orders/${orderId}/confirm`, {
      method: "POST",
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {})
      }
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
