# Supabase Integration Setup

This project is now integrated with Supabase for authentication, database, and storage.

## Setup Instructions

### 1. Environment Variables

The `.env.local` file has been created with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://stpliwgecckyjknkqenl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cGxpd2dlY2NreWprbmtxZW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDk1MzgsImV4cCI6MjA5MTE4NTUzOH0.UhrPZIhrWJ0psBUldP6ly-jZ-oYTjY8ohZ2jsuTTtgU
```

### 2. Database Setup

1. Go to your Supabase Dashboard: https://stpliwgecckyjknkqenl.supabase.co
2. Navigate to the **SQL Editor**
3. Open and run the file `supabase/setup.sql`
   - This creates all tables, indexes, triggers, and sample data
   - Includes: profiles, listings, listing_features, listing_images, dealer_profiles, saved_listings, news_articles

### 3. Storage Buckets Setup

1. In Supabase Dashboard, go to **Storage**
2. Create the following buckets:
   - `listing-images` (Public: true)
   - `avatar-images` (Public: true)
   - `dealer-documents` (Public: false)

3. Go to **SQL Editor** and run `supabase/storage-setup.sql` to set up RLS policies

### 4. Auth Settings (Optional)

In Supabase Dashboard > Authentication > Settings:
- Configure Site URL: `http://localhost:3006` (for development)
- Add Redirect URLs if needed
- Configure email templates

## Features Implemented

### Authentication
- User signup with email/password
- User login/logout
- Protected routes (requires authentication)
- Admin-only routes
- Profile creation on signup

### Database Tables
- **profiles**: User profiles extending auth.users
- **listings**: Vehicle listings with full details
- **listing_features**: Features/options for each listing
- **listing_images**: Image URLs and storage paths
- **dealer_profiles**: Dealer information and subscriptions
- **saved_listings**: User favorites
- **news_articles**: Blog/news content

### Storage
- Image upload for listings
- Avatar upload for users
- Dealer document storage

### Hooks & Context
- `useAuth()`: Authentication context
- `useListings()`: Fetch listings from database
- `useListing(id)`: Fetch single listing
- `useCreateListing()`: Create new listing with images
- `useStorage()`: Upload/delete images

## Protected Routes

The following routes now require authentication:
- `/sell` - Create a new listing
- `/admin` - Admin dashboard (requires ADMIN role)

## Usage Examples

### In Components
```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, profile, signIn, signOut } = useAuth();
  
  // Check if user is logged in
  if (user) {
    console.log("User:", profile?.first_name);
  }
}
```

### Fetching Listings
```tsx
import { useListings } from "@/hooks/useListings";

function ListingsPage() {
  const { listings, isLoading, error } = useListings({ 
    status: 'ACTIVE',
    limit: 10 
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {listings.map(listing => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}
```

### Creating a Listing
```tsx
import { useCreateListing } from "@/hooks/useListings";
import { useStorage } from "@/hooks/useStorage";

function CreateListingForm() {
  const { createListing, isLoading } = useCreateListing();
  const { uploadMultipleImages } = useStorage();
  
  const handleSubmit = async (formData, files) => {
    // Upload images first
    const uploadedImages = await uploadMultipleImages(files, 'temp-id');
    
    // Create listing
    await createListing(
      {
        user_id: user.id,
        vin: formData.vin,
        year: formData.year,
        // ... other fields
      },
      formData.features,
      uploadedImages
    );
  };
}
```

## Next Steps

1. Run the SQL setup scripts in Supabase
2. Create storage buckets
3. Test authentication flow
4. Update listings page to fetch from database
5. Update individual listing page (VDP) to fetch from database
6. Connect the sell form to create actual listings

## Database Schema

See `src/lib/supabase/database.types.ts` for complete TypeScript types.

### Key Relationships
- `listings.user_id` → `profiles.id` (owner)
- `listing_images.listing_id` → `listings.id`
- `listing_features.listing_id` → `listings.id`
- `dealer_profiles.user_id` → `profiles.id`
- `saved_listings.user_id` → `profiles.id`
- `saved_listings.listing_id` → `listings.id`
- `news_articles.author_id` → `profiles.id`
