"use client";

const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);
const MAX_IMAGE_DIMENSION = 2200;
const JPEG_QUALITY = 0.84;

function extensionFor(name: string) {
  return name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || "";
}

function baseNameFor(name: string) {
  return (name.replace(/\.[^.]+$/, "") || "listing-photo").replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isHeic(file: File) {
  const extension = extensionFor(file.name);
  return HEIC_TYPES.has(file.type) || extension === ".heic" || extension === ".heif";
}

async function imageElementFor(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new window.Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return image;
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function scaledSize(width: number, height: number) {
  const largestSide = Math.max(width, height);
  if (largestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_IMAGE_DIMENSION / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!COMPRESSIBLE_TYPES.has(file.type) || isHeic(file)) return file;

  let bitmap: ImageBitmap | null = null;
  let image: HTMLImageElement | null = null;
  let objectUrl: string | null = null;

  try {
    if ("createImageBitmap" in window) {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } else {
      image = await imageElementFor(file);
      objectUrl = image.src;
    }

    const sourceWidth = bitmap?.width || image?.naturalWidth || 0;
    const sourceHeight = bitmap?.height || image?.naturalHeight || 0;
    if (!sourceWidth || !sourceHeight) return file;

    const { width, height } = scaledSize(sourceWidth, sourceHeight);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    if (bitmap) {
      context.drawImage(bitmap, 0, 0, width, height);
    } else if (image) {
      context.drawImage(image, 0, 0, width, height);
    }

    const blob = await canvasToBlob(canvas);
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], `${baseNameFor(file.name)}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Image compression skipped:", error);
    return file;
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
