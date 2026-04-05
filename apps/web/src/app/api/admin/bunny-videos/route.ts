import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;

  if (!apiKey || !libraryId) {
    return NextResponse.json({ error: "Bunny Stream not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100&orderBy=date`,
      { headers: { AccessKey: apiKey }, cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Bunny" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      items: (data.items ?? []).map((v: { guid: string; title: string; status: number; length: number; thumbnailFileName: string }) => ({
        guid: v.guid,
        title: v.title,
        status: v.status, // 4 = ready
        lengthSeconds: v.length,
        thumbnail: v.thumbnailFileName
          ? `https://vz-${libraryId}.b-cdn.net/${v.guid}/${v.thumbnailFileName}`
          : null
      }))
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
