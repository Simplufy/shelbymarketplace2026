'use client'

import { useState } from 'react'

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

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadListingImage = async (
    file: File,
    listingId: string
  ): Promise<UploadAttempt> => {
    try {
      setIsUploading(true)
      setProgress(0)

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
