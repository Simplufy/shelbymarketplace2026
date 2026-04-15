'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Listing, ListingImage, Profile } from '@/lib/supabase/database.types'

interface FavoriteListing extends Listing {
  images: ListingImage[]
  profile: Profile | null
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setFavorites([])
        return
      }

      const { data, error: fetchError } = await supabase
        .from('saved_listings')
        .select(`
          listing:listings(
            *,
            images:listing_images(*),
            profile:profiles(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform data
      const transformedData = data?.map((item: any) => item.listing) || []
      setFavorites(transformedData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addFavorite = async (listingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { error: new Error('Must be logged in to favorite') }
      }

      const { error } = await supabase
        .from('saved_listings')
        .insert({
          user_id: user.id,
          listing_id: listingId,
        })

      if (error) {
        return { error }
      }

      await fetchFavorites()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const removeFavorite = async (listingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { error: new Error('Must be logged in to unfavorite') }
      }

      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)

      if (error) {
        return { error }
      }

      await fetchFavorites()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const isFavorite = async (listingId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return false

      const { data, error } = await supabase
        .from('saved_listings')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single()

      if (error || !data) return false
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refresh: fetchFavorites,
  }
}

export function useProfile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<Error | null>(null)
  const supabase = createClient()

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    return Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), ms)
      ),
    ])
  }

  const updateProfile = async (updates: {
    first_name?: string
    last_name?: string
    phone?: string
    location?: string
    avatar_url?: string
  }) => {
    try {
      setIsUpdating(true)
      setUpdateError(null)

      const { data: { user } } = await withTimeout(
        supabase.auth.getUser(),
        10000,
        'Auth check'
      )
      
      if (!user) {
        return { error: new Error('Must be logged in') }
      }

      const sanitizedUpdates = {
        ...updates,
        first_name: updates.first_name?.trim(),
        last_name: updates.last_name?.trim(),
        phone: updates.phone?.trim(),
        location: updates.location?.trim(),
      }

      const { error } = await withTimeout(
        supabase
          .from('profiles')
          .update(sanitizedUpdates)
          .eq('id', user.id),
        12000,
        'Profile save'
      )

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (err) {
      setUpdateError(err as Error)
      return { error: err as Error }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateProfile,
    isUpdating,
    updateError,
  }
}
