import { type NextRequest, NextResponse } from "next/server";

const BUNNY_API_KEY = process.env.BUNNY_STORAGE_API_KEY!;
const BUNNY_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME ?? "storage.bunnycdn.com";
const CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "https://ca-assets.b-cdn.net";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "images/courses";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sanitize filename
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const fileName = `${baseName}.${ext}`;
    const path = `${folder}/${fileName}`;

    const buffer = await file.arrayBuffer();

    const res = await fetch(`https://${BUNNY_HOSTNAME}/${BUNNY_ZONE}/${path}`, {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": file.type || "application/octet-stream"
      },
      body: buffer
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Bunny upload failed: ${text}` }, { status: 500 });
    }

    const cdnUrl = `${CDN_URL}/${path}`;
    return NextResponse.json({ url: cdnUrl, path });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
