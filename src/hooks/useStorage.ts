'use client'

import { useState } from 'react'

interface UploadResult {
  url: string
  storagePath: string
}

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadListingImage = async (
    file: File,
    listingId: string,
    isPrimary: boolean = false
  ): Promise<UploadResult | null> => {
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
        return null
      }

      if (data.error) {
        console.error("Upload error:", data.error)
        return null
      }

      setProgress(100)

      return {
        url: data.url,
        storagePath: data.pathname,
      }
    } catch (error) {
      return null
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
      const result = await uploadListingImage(files[i], listingId, i === 0)
      if (result) {
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
