# Complete Supabase Setup Guide for Shelby Exchange

This guide will walk you through every step of setting up your Supabase project.

---

## Step 1: Access Your Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Find your project: `stpliwgecckyjknkqenl`
4. Click on the project to open the dashboard

---

## Step 2: Run the Database Schema

### 2.1 Open SQL Editor

1. In the left sidebar, click on **"SQL Editor"**
2. Click the **"New query"** button (or the "+" icon)
3. You'll see a text editor where you can paste SQL

### 2.2 Create the Database Tables

Copy and paste this entire SQL block into the editor:

```sql
-- ============================================
-- SUPABASE SETUP FOR SHELBY EXCHANGE
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('BUYER', 'SELLER', 'DEALER', 'ADMIN')) DEFAULT 'BUYER',
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  vin TEXT NOT NULL,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  price INTEGER NOT NULL,
  msrp INTEGER,
  description TEXT NOT NULL,
  mileage INTEGER NOT NULL,
  transmission TEXT CHECK (transmission IN ('Manual', 'Automatic')),
  drivetrain TEXT CHECK (drivetrain IN ('RWD', 'AWD', '4WD')),
  engine TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  location TEXT,
  status TEXT CHECK (status IN ('PENDING', 'ACTIVE', 'SOLD', 'REJECTED')) DEFAULT 'PENDING',
  package_tier TEXT CHECK (package_tier IN ('STANDARD', 'HOMEPAGE', 'HOMEPAGE_PLUS_ADS')) DEFAULT 'STANDARD',
  is_featured BOOLEAN DEFAULT FALSE,
  title_status TEXT,
  previous_owners INTEGER,
  accidents TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTING FEATURES TABLE
-- ============================================
CREATE TABLE listing_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTING IMAGES TABLE
-- ============================================
CREATE TABLE listing_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEALER PROFILES TABLE
-- ============================================
CREATE TABLE dealer_profiles (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  dealership_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  website_url TEXT,
  phone TEXT,
  location TEXT,
  subscription_tier TEXT CHECK (subscription_tier IN ('ENTHUSIAST', 'APEX')) DEFAULT 'ENTHUSIAST',
  subscription_status TEXT CHECK (subscription_status IN ('ACTIVE', 'PAST_DUE', 'INACTIVE')) DEFAULT 'INACTIVE',
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED LISTINGS TABLE (Favorites)
-- ============================================
CREATE TABLE saved_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- NEWS ARTICLES TABLE
-- ============================================
CREATE TABLE news_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('Review', 'Market News', 'Guide', 'Collectors')),
  image_url TEXT,
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  featured BOOLEAN DEFAULT FALSE,
  read_time TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE VIEW FOR ACTIVE LISTINGS
-- ============================================
CREATE VIEW active_listings AS
SELECT 
  l.*,
  (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary = TRUE LIMIT 1) as primary_image_url,
  dp.dealership_name,
  dp.verified as dealer_verified
FROM listings l
LEFT JOIN dealer_profiles dp ON l.user_id = dp.user_id
WHERE l.status = 'ACTIVE';

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- LISTINGS RLS POLICIES
-- ============================================
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- LISTING FEATURES RLS POLICIES
-- ============================================
CREATE POLICY "Listing features are viewable by everyone" ON listing_features
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage features for own listings" ON listing_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_features.listing_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- LISTING IMAGES RLS POLICIES
-- ============================================
CREATE POLICY "Listing images are viewable by everyone" ON listing_images
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage images for own listings" ON listing_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_images.listing_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- DEALER PROFILES RLS POLICIES
-- ============================================
CREATE POLICY "Dealer profiles are viewable by everyone" ON dealer_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create own dealer profile" ON dealer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dealer profile" ON dealer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SAVED LISTINGS RLS POLICIES
-- ============================================
CREATE POLICY "Users can view own saved listings" ON saved_listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved listings" ON saved_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved listings" ON saved_listings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- NEWS ARTICLES RLS POLICIES
-- ============================================
CREATE POLICY "News articles are viewable by everyone" ON news_articles
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage news articles" ON news_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- CREATE FUNCTION FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_dealer_profiles_updated_at
  BEFORE UPDATE ON dealer_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- CREATE FUNCTION TO CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INSERT SAMPLE NEWS ARTICLES
-- ============================================
INSERT INTO news_articles (title, excerpt, content, category, featured, read_time, published_at)
VALUES 
(
  'The Evolution of the Shelby Super Snake: 800+ HP for the Street',
  'Carroll Shelby''s legacy continues with the boldest Super Snake yet. We go under the hood of the new S650-based monster.',
  'Full article content here...',
  'Review',
  TRUE,
  '8 min',
  NOW()
),
(
  'Auction Results: 1965 GT350R Sells for Record $3.8M',
  'Barrett-Jackson''s Scottsdale auction set a new record for the R-model, cementing its status as the most valuable Shelby.',
  'Full article content here...',
  'Market News',
  FALSE,
  '5 min',
  NOW() - INTERVAL '2 days'
),
(
  'Top 5 Upgrades for your Shelby GT500 Performance Pack',
  'From supercharger pulleys to suspension tuning, here are the mods that actually make a difference on track day.',
  'Full article content here...',
  'Guide',
  FALSE,
  '6 min',
  NOW() - INTERVAL '6 days'
),
(
  'How to Authenticate a Classic Shelby VIN',
  'Not every Shelby is what it claims to be. Learn the detective work behind verifying a genuine classic.',
  'Full article content here...',
  'Collectors',
  FALSE,
  '7 min',
  NOW() - INTERVAL '9 days'
);

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_is_featured ON listings(is_featured);
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX idx_news_articles_featured ON news_articles(featured);
CREATE INDEX idx_news_articles_category ON news_articles(category);

SELECT 'Database setup complete!' as status;
```

### 2.3 Run the SQL

1. Paste the SQL above into the editor
2. Click the **"Run"** button (play icon)
3. Wait for it to complete - you should see "Database setup complete!"

---

## Step 3: Set Up Storage Buckets

### 3.1 Create Storage Buckets

1. In the left sidebar, click on **"Storage"**
2. Click the **"New bucket"** button
3. Create these three buckets one by one:

#### Bucket 1: listing-images
- **Name:** `listing-images`
- **Public:** ✅ Check the box (toggle ON)
- Click **"Save"

#### Bucket 2: avatar-images
- **Name:** `avatar-images`
- **Public:** ✅ Check the box (toggle ON)
- Click **"Save"

#### Bucket 3: dealer-documents
- **Name:** `dealer-documents`
- **Public:** ❌ Leave unchecked (toggle OFF)
- Click **"Save"

### 3.2 Set Up Storage Policies

For each bucket, you need to set up security policies:

#### For listing-images bucket:

1. Click on **"listing-images"** bucket
2. Click the **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full custom access"**
5. Click **"Create a policy from scratch"**

**Create these 4 policies one by one:**

**Policy 1: Allow public viewing**
- Policy name: `Allow public viewing`
- Allowed operation: SELECT (read only)
- Target roles: Leave empty (all roles)
- Policy definition: `true`
- Click **"Save Policy"**

**Policy 2: Allow authenticated uploads**
- Policy name: `Allow authenticated uploads`
- Allowed operation: INSERT (create)
- Target roles: `authenticated`
- Policy definition: `true`
- Click **"Save Policy"**

**Policy 3: Allow users to update own images**
- Policy name: `Allow users to update own images`
- Allowed operation: UPDATE
- Target roles: `authenticated`
- Policy definition: `(storage.foldername(name))[1] = auth.uid()::text`
- Click **"Save Policy"**

**Policy 4: Allow users to delete own images**
- Policy name: `Allow users to delete own images`
- Allowed operation: DELETE
- Target roles: `authenticated`
- Policy definition: `(storage.foldername(name))[1] = auth.uid()::text`
- Click **"Save Policy"**

#### For avatar-images bucket:

Repeat the same 4 policies as above for the `avatar-images` bucket.

#### For dealer-documents bucket (private):

**Policy 1: Allow owners to view**
- Policy name: `Allow owners to view`
- Allowed operation: SELECT
- Target roles: `authenticated`
- Policy definition: `(storage.foldername(name))[1] = auth.uid()::text`
- Click **"Save Policy"**

**Policy 2: Allow owners to upload**
- Policy name: `Allow owners to upload`
- Allowed operation: INSERT
- Target roles: `authenticated`
- Policy definition: `(storage.foldername(name))[1] = auth.uid()::text`
- Click **"Save Policy"**

**Policy 3: Allow owners to delete**
- Policy name: `Allow owners to delete`
- Allowed operation: DELETE
- Target roles: `authenticated`
- Policy definition: `(storage.foldername(name))[1] = auth.uid()::text`
- Click **"Save Policy"**

---

## Step 4: Configure Authentication Settings

### 4.1 Site URL Configuration

1. In the left sidebar, click on **"Authentication"**
2. Click on **"URL Configuration"**
3. Set these values:
   - **Site URL:** `http://localhost:3006`
   - **Redirect URLs:** Add these (one per line):
     ```
     http://localhost:3006/**
     https://localhost:3006/**
     ```
4. Click **"Save"**

### 4.2 Email Templates (Optional)

1. In Authentication, click on **"Email Templates"**
2. You can customize the confirmation and password reset emails
3. Default templates work fine for development

### 4.3 Providers

1. In Authentication, click on **"Providers"**
2. **Email** provider should already be enabled
3. You can add Google, GitHub, etc. if desired

---

## Step 5: Create an Admin User (Optional)

To create an admin user for testing:

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Select **"Send invitation"** or **"Create new user"**
4. Enter email and password
5. After creating, go to SQL Editor and run:

```sql
-- Replace with the actual user ID from the Users table
UPDATE profiles 
SET role = 'ADMIN' 
WHERE email = 'your-admin-email@example.com';
```

---

## Step 6: Test the Connection

1. Start your local development server:
   ```bash
   npm run dev
   # or
   npx next dev --port 3006
   ```

2. Open http://localhost:3006 in your browser

3. Try these actions:
   - Go to `/register` and create an account
   - Check Supabase Dashboard → Authentication → Users (you should see the new user)
   - Check Supabase Dashboard → Table Editor → profiles (you should see the profile)
   - Log in with the account
   - Check that the header shows your initials

---

## Step 7: Insert Sample Listings (Optional)

To test the listings functionality, run this SQL:

```sql
-- First, create a test user manually or use an existing user ID
-- Then insert sample listings:

INSERT INTO listings (
  user_id, vin, year, make, model, trim, price, description, 
  mileage, transmission, drivetrain, status, package_tier, is_featured, location
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1), -- Uses first user, replace with actual UUID
  '1FA6P8SJ1N51XXXXX',
  2022,
  'Ford',
  'Shelby',
  'GT500 Heritage Edition',
  124900,
  'This 2022 Ford Shelby GT500 Heritage Edition is a masterpiece of modern engineering.',
  1240,
  'Automatic',
  'RWD',
  'ACTIVE',
  'HOMEPAGE',
  true,
  'Las Vegas, NV'
),
(
  (SELECT id FROM auth.users LIMIT 1),
  '1FA6P8JZXLXXXXXX',
  2020,
  'Ford',
  'Shelby',
  'GT350R',
  98000,
  'Carbon Fiber Track Pack. Low miles, pristine condition.',
  4500,
  'Manual',
  'RWD',
  'ACTIVE',
  'STANDARD',
  false,
  'Miami, FL'
);

-- Add features for the first listing
INSERT INTO listing_features (listing_id, feature)
SELECT id, unnest(ARRAY[
  'Carbon Fiber Track Pack',
  'MagneRide Damping System',
  'Brembo High-Performance Brakes',
  'Recaro Leather-Trimmed Seats'
])
FROM listings 
WHERE vin = '1FA6P8SJ1N51XXXXX';

SELECT 'Sample listings created!' as status;
```

---

## Troubleshooting

### Issue: "Failed to fetch" errors
- Check that your `.env.local` file has the correct Supabase URL and key
- Make sure the site URL is configured in Supabase Auth settings

### Issue: "Permission denied" errors
- Check that RLS policies are properly set up
- Make sure you're logged in for protected operations

### Issue: Images not uploading
- Verify storage buckets exist and are public (for listing-images)
- Check storage policies are configured correctly

### Issue: Profile not created on signup
- Check that the trigger `on_auth_user_created` exists
- Look at the function `handle_new_user()` in the database

---

## Quick Reference Commands

### View all tables
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
```

### View all users
```sql
SELECT * FROM auth.users;
```

### View all profiles
```sql
SELECT * FROM profiles;
```

### View all listings
```sql
SELECT * FROM listings;
```

### Reset a user's password
Go to Authentication → Users → Click user → "Send password recovery"

---

## Next Steps After Setup

1. ✅ Database tables created
2. ✅ Storage buckets configured
3. ✅ Auth settings configured
4. ✅ Test user registration
5. ✅ Test user login
6. 🔄 Update listings page to fetch from database
7. 🔄 Update VDP page to fetch from database
8. 🔄 Connect sell form to create listings
9. 🔄 Add image upload functionality

You're now ready to use Supabase with your Shelby Exchange app!
