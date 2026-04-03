import { API_BASE_URL } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bunnyVideoId: string }> }
) {
  const { bunnyVideoId } = await params;

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/v1/media/video-assets/${bunnyVideoId}/playback`,
      { cache: "no-store" }
    );

    if (!apiResponse.ok) {
      const error = await apiResponse
        .json()
        .catch(() => ({ message: "Failed to fetch playback info" }));
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Video playback bridge error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
