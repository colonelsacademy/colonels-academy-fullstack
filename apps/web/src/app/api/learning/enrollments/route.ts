import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/v1/learning/enrollments`, {
      headers: {
        ...(cookie ? { cookie } : {})
      }
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json().catch(() => ({ message: "Failed to fetch enrollments" }));
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Enrollments bridge error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
