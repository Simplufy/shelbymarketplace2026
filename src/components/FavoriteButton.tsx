'use client'

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  listingId: string
  className?: string
  showLabel?: boolean
}

export function FavoriteButton({ listingId, className = '', showLabel = false }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    const checkFavorite = async () => {
      if (user) {
        const favorited = await isFavorite(listingId)
        setIsFavorited(favorited)
      }
    }
    checkFavorite()
  }, [user, listingId, isFavorite])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      // Redirect to login if not authenticated - only on client side
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/listings'
      window.location.href = '/login?redirect=' + encodeURIComponent(currentPath)
      return
    }

    setIsLoading(true)
    
    if (isFavorited) {
      const { error } = await removeFavorite(listingId)
      if (!error) {
        setIsFavorited(false)
      }
    } else {
      const { error } = await addFavorite(listingId)
      if (!error) {
        setIsFavorited(true)
      }
    }
    
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <button
        className={`p-2 rounded-full bg-white/90 backdrop-blur-sm ${className}`}
        disabled
      >
        <Loader2 className="w-5 h-5 animate-spin text-[#565d6d]" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 transition-all ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <div className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
        isFavorited 
          ? 'bg-[#E31837] text-white' 
          : 'bg-white/90 text-[#565d6d] hover:text-[#E31837]'
      }`}>
        <Heart 
          className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} 
        />
      </div>
      {showLabel && (
        <span className={`text-sm font-medium ${isFavorited ? 'text-[#E31837]' : 'text-[#565d6d]'}`}>
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
