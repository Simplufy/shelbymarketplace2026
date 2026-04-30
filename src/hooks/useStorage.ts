'use client'

import { useState } from 'react'
import { upload } from '@vercel/blob/client'

interface UploadResult {
  url: string
  storagePath: string
}

type UploadSuccess = UploadResult & {
  ok: true
}

type UploadFailure = {
  ok: false
  error: string
}

type UploadAttempt = UploadSuccess | UploadFailure

type UploadOptions = {
  onProgress?: (percentage: number) => void
}

const HEIC_FILE_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
])
const HEIC_EXTENSIONS = new Set([".heic", ".heif"])

function safeFilename(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
}

function fileExtension(name: string) {
  const match = name.toLowerCase().match(/\.[a-z0-9]+$/)
  return match?.[0] || ""
}

function isHeicFile(file: File) {
  return HEIC_FILE_TYPES.has(file.type) || HEIC_EXTENSIONS.has(fileExtension(file.name))
}

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadListingImage = async (
    file: File,
    listingId: string,
    options?: UploadOptions
  ): Promise<UploadAttempt> => {
    try {
      setIsUploading(true)
      setProgress(0)

      if (!isHeicFile(file)) {
        const pathname = `listings/client/${listingId}-${Date.now()}-${safeFilename(file.name)}`
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/upload/client",
          contentType: file.type || undefined,
          multipart: file.size > 5 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => {
            setProgress(percentage)
            options?.onProgress?.(percentage)
          },
        })

        setProgress(100)
        options?.onProgress?.(100)

        return {
          ok: true,
          url: blob.url,
          storagePath: blob.pathname,
        }
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("pathname", `listings/${listingId}/${Date.now()}-${file.name}`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error("Upload failed:", response.status, data)
        return { ok: false, error: data.error || "Upload failed" }
      }

      if (data.error) {
        console.error("Upload error:", data.error)
        return { ok: false, error: data.error }
      }

      setProgress(100)
      options?.onProgress?.(100)

      return {
        ok: true,
        url: data.url,
        storagePath: data.pathname,
      }
    } catch (error) {
      console.error("Upload request failed:", error)
      return { ok: false, error: "Upload failed. Please check your connection and try again." }
    } finally {
      setIsUploading(false)
    }
  }

  const uploadMultipleImages = async (
    files: File[],
    listingId: string
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const result = await uploadListingImage(files[i], listingId)
      if (result.ok) {
        results.push(result)
      }
      setProgress(((i + 1) / files.length) * 100)
    }

    return results
  }

  return {
    uploadListingImage,
    uploadMultipleImages,
    isUploading,
    progress,
  }
}
