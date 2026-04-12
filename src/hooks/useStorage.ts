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

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit')
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${listingId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `listings/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError)
        throw new Error(uploadError.message || 'Failed to upload image')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      setProgress(100)

      return {
        url: publicUrl,
        storagePath: filePath,
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw error
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
      try {
        const result = await uploadListingImage(files[i], listingId, i === 0)
        if (result) {
          results.push(result)
        }
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error)
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
