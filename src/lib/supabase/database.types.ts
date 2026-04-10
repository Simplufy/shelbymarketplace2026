export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'BUYER' | 'SELLER' | 'DEALER' | 'ADMIN'
          avatar_url: string | null
          phone: string | null
          location: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: 'BUYER' | 'SELLER' | 'DEALER' | 'ADMIN'
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'BUYER' | 'SELLER' | 'DEALER' | 'ADMIN'
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          vin: string
          year: number
          make: string
          model: string
          trim: string | null
          price: number
          msrp: number | null
          description: string
          mileage: number
          transmission: 'Manual' | 'Automatic'
          drivetrain: 'RWD' | 'AWD' | '4WD'
          engine: string | null
          exterior_color: string | null
          interior_color: string | null
          location: string | null
          status: 'PENDING' | 'ACTIVE' | 'SOLD' | 'REJECTED'
          package_tier: 'STANDARD' | 'HOMEPAGE' | 'HOMEPAGE_PLUS_ADS'
          is_featured: boolean
          title_status: string | null
          previous_owners: number | null
          accidents: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vin: string
          year: number
          make: string
          model: string
          trim?: string | null
          price: number
          msrp?: number | null
          description: string
          mileage: number
          transmission?: 'Manual' | 'Automatic'
          drivetrain?: 'RWD' | 'AWD' | '4WD'
          engine?: string | null
          exterior_color?: string | null
          interior_color?: string | null
          location?: string | null
          status?: 'PENDING' | 'ACTIVE' | 'SOLD' | 'REJECTED'
          package_tier?: 'STANDARD' | 'HOMEPAGE' | 'HOMEPAGE_PLUS_ADS'
          is_featured?: boolean
          title_status?: string | null
          previous_owners?: number | null
          accidents?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vin?: string
          year?: number
          make?: string
          model?: string
          trim?: string | null
          price?: number
          msrp?: number | null
          description?: string
          mileage?: number
          transmission?: 'Manual' | 'Automatic'
          drivetrain?: 'RWD' | 'AWD' | '4WD'
          engine?: string | null
          exterior_color?: string | null
          interior_color?: string | null
          location?: string | null
          status?: 'PENDING' | 'ACTIVE' | 'SOLD' | 'REJECTED'
          package_tier?: 'STANDARD' | 'HOMEPAGE' | 'HOMEPAGE_PLUS_ADS'
          is_featured?: boolean
          title_status?: string | null
          previous_owners?: number | null
          accidents?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listing_features: {
        Row: {
          id: string
          listing_id: string
          feature: string
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          feature: string
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          feature?: string
          created_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          url: string
          storage_path: string
          is_primary: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          storage_path: string
          is_primary?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          url?: string
          storage_path?: string
          is_primary?: boolean
          order_index?: number
          created_at?: string
        }
      }
      dealer_profiles: {
        Row: {
          user_id: string
          dealership_name: string
          license_number: string
          website_url: string | null
          phone: string | null
          location: string | null
          subscription_tier: 'ENTHUSIAST' | 'APEX'
          subscription_status: 'ACTIVE' | 'PAST_DUE' | 'INACTIVE'
          rating: number
          review_count: number
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          dealership_name: string
          license_number: string
          website_url?: string | null
          phone?: string | null
          location?: string | null
          subscription_tier?: 'ENTHUSIAST' | 'APEX'
          subscription_status?: 'ACTIVE' | 'PAST_DUE' | 'INACTIVE'
          rating?: number
          review_count?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          dealership_name?: string
          license_number?: string
          website_url?: string | null
          phone?: string | null
          location?: string | null
          subscription_tier?: 'ENTHUSIAST' | 'APEX'
          subscription_status?: 'ACTIVE' | 'PAST_DUE' | 'INACTIVE'
          rating?: number
          review_count?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      saved_listings: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
      }
      news_articles: {
        Row: {
          id: string
          title: string
          excerpt: string
          content: string
          category: 'Review' | 'Market News' | 'Guide' | 'Collectors'
          image_url: string | null
          author_id: string | null
          featured: boolean
          read_time: string | null
          published_at: string | null
          created_at: string
          updated_at: string
          status: 'draft' | 'published' | 'archived'
          views: number
        }
        Insert: {
          id?: string
          title: string
          excerpt: string
          content: string
          category: 'Review' | 'Market News' | 'Guide' | 'Collectors'
          image_url?: string | null
          author_id?: string | null
          featured?: boolean
          read_time?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'published' | 'archived'
          views?: number
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string
          content?: string
          category?: 'Review' | 'Market News' | 'Guide' | 'Collectors'
          image_url?: string | null
          author_id?: string | null
          featured?: boolean
          read_time?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'published' | 'archived'
          views?: number
        }
      }
      site_content: {
        Row: {
          id: string
          section: string
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          section: string
          key: string
          value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          section?: string
          key?: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
    Views: {
      active_listings: {
        Row: {
          id: string
          user_id: string
          vin: string
          year: number
          make: string
          model: string
          trim: string | null
          price: number
          mileage: number
          transmission: 'Manual' | 'Automatic'
          drivetrain: 'RWD' | 'AWD' | '4WD'
          location: string | null
          status: 'PENDING' | 'ACTIVE' | 'SOLD' | 'REJECTED'
          package_tier: 'STANDARD' | 'HOMEPAGE' | 'HOMEPAGE_PLUS_ADS'
          is_featured: boolean
          created_at: string
          primary_image_url: string | null
          dealership_name: string | null
          dealer_verified: boolean
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Listing = Tables<'listings'>
export type ListingFeature = Tables<'listing_features'>
export type ListingImage = Tables<'listing_images'>
export type DealerProfile = Tables<'dealer_profiles'>
export type SavedListing = Tables<'saved_listings'>
export type NewsArticle = Tables<'news_articles'>
export type SiteContent = Tables<'site_content'>
export type SiteSettings = Tables<'site_settings'>
