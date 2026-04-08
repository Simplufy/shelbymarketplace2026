'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadResult {
  url: string
  storagePath: string
}

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  const uploadListingImage = async (
    file: File,
    listingId: string,
    isPrimary: boolean = false
  ): Promise<UploadResult | null> => {
    try {
      setIsUploading(true)
      setProgress(0)

      const fileExt = file.name.split('.').pop()
      const fileName = `${listingId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `listings/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      setProgress(100)

      return {
        url: publicUrl,
        storagePath: filePath,
      }
    } catch (error) {
      console.error('Error uploading image:', error)
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

  const deleteImage = async (storagePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('listing-images')
        .remove([storagePath])

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }

  return {
    uploadListingImage,
    uploadMultipleImages,
    deleteImage,
    isUploading,
    progress,
  }
}
