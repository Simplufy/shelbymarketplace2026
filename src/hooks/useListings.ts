'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Listing, ListingImage, Profile, Insertables } from '@/lib/supabase/database.types'

interface ListingWithDetails extends Listing {
  images: ListingImage[]
  profile: Profile | null
  features: string[]
}

interface UseListingsOptions {
  status?: 'PENDING' | 'ACTIVE' | 'SOLD' | 'REJECTED'
  featured?: boolean
  limit?: number
  userId?: string
}

export function useListings(options: UseListingsOptions = {}) {
  const [listings, setListings] = useState<ListingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('listings')
        .select(`
          *,
          images:listing_images(*),
          profile:profiles(*),
          features:listing_features(feature)
        `)

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.featured) {
        query = query.eq('is_featured', true)
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform features array
      const transformedData = data?.map((listing: any) => ({
        ...listing,
        features: listing.features?.map((f: any) => f.feature) || [],
      })) || []

      setListings(transformedData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [options.status, options.featured, options.limit, options.userId])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return { listings, isLoading, error, refresh: fetchListings }
}

export function useListing(id: string) {
  const [listing, setListing] = useState<ListingWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchListing = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          images:listing_images(*),
          profile:profiles(*),
          features:listing_features(feature)
        `)
        .eq('id', id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Transform features array
      const transformedData = {
        ...data,
        features: data.features?.map((f: any) => f.feature) || [],
      }

      setListing(transformedData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchListing()
    }
  }, [id, fetchListing])

  return { listing, isLoading, error, refresh: fetchListing }
}

export function useCreateListing() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const createListing = async (
    listingData: Insertables<'listings'>,
    features: string[],
    images: { url: string; storage_path: string; is_primary: boolean }[]
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single()

      if (listingError) {
        throw listingError
      }

      // Add features
      if (features.length > 0) {
        const featureInserts = features.map((feature) => ({
          listing_id: listing.id,
          feature,
        }))

        const { error: featuresError } = await supabase
          .from('listing_features')
          .insert(featureInserts)

        if (featuresError) {
          console.error('Error adding features:', featuresError)
        }
      }

      // Add images
      if (images.length > 0) {
        const imageInserts = images.map((image, index) => ({
          listing_id: listing.id,
          url: image.url,
          storage_path: image.storage_path,
          is_primary: image.is_primary,
          order_index: index,
        }))

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imageInserts)

        if (imagesError) {
          console.error('Error adding images:', imagesError)
        }
      }

      return { listing, error: null }
    } catch (err) {
      setError(err as Error)
      return { listing: null, error: err as Error }
    } finally {
      setIsLoading(false)
    }
  }

  return { createListing, isLoading, error }
}
