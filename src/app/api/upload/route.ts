import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import convert from "heic-convert";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const HEIC_FILE_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  ...HEIC_FILE_TYPES,
  "application/pdf",
]);

function safeFilename(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function fileExtension(name: string) {
  const match = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] || "";
}

function isHeicFile(file: File) {
  return HEIC_FILE_TYPES.has(file.type) || HEIC_EXTENSIONS.has(fileExtension(file.name));
}

function isAllowedFile(file: File) {
  return ALLOWED_FILE_TYPES.has(file.type) || isHeicFile(file);
}

async function normalizeUploadFile(file: File) {
  if (!isHeicFile(file)) {
    return {
      body: file,
      filename: safeFilename(file.name),
      contentType: file.type || "application/octet-stream",
      converted: false,
    };
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await convert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.9,
  });
  const baseFilename = safeFilename(file.name.replace(/\.(heic|heif)$/i, "") || "iphone-photo");

  return {
    body: outputBuffer,
    filename: `${baseFilename}.jpg`,
    contentType: "image/jpeg",
    converted: true,
  };
}

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "uploads", { windowMs: 60 * 1000, max: 12 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many uploads. Please wait and try again." }, { status: 429 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isAllowedFile(file)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF, HEIC, HEIF, and PDF files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Files must be 10MB or smaller" }, { status: 400 });
    }

    const normalizedFile = await normalizeUploadFile(file);
    const blob = await put(`listings/${user.id}/${Date.now()}-${normalizedFile.filename}`, normalizedFile.body, {
      access: "public",
      contentType: normalizedFile.contentType,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname, converted: normalizedFile.converted });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
