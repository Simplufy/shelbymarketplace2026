import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "uploads", { windowMs: 60 * 1000, max: 30 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many uploads. Please wait and try again." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const pathname = formData.get("pathname") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(pathname || `listings/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
