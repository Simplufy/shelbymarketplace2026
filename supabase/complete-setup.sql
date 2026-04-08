-- ============================================
-- SHELBY EXCHANGE - COMPLETE DATABASE SETUP
-- Copy this entire file and paste into:
-- https://supabase.com/dashboard/project/stpliwgecckyjknkqenl/sql/new
-- Then click "Run"
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
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
-- 2. LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
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
-- 3. LISTING FEATURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS listing_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. LISTING IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. DEALER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dealer_profiles (
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
-- 6. SAVED LISTINGS TABLE (Favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- 7. NEWS ARTICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news_articles (
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
-- 8. CREATE VIEW FOR ACTIVE LISTINGS
-- ============================================
CREATE OR REPLACE VIEW active_listings AS
SELECT 
  l.*,
  (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary = TRUE LIMIT 1) as primary_image_url,
  dp.dealership_name,
  dp.verified as dealer_verified
FROM listings l
LEFT JOIN dealer_profiles dp ON l.user_id = dp.user_id
WHERE l.status = 'ACTIVE';

-- ============================================
-- 9. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. PROFILES RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 11. LISTINGS RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can create listings" ON listings;
CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own listings" ON listings;
CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 12. LISTING FEATURES RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Listing features are viewable by everyone" ON listing_features;
CREATE POLICY "Listing features are viewable by everyone" ON listing_features
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can manage features for own listings" ON listing_features;
CREATE POLICY "Users can manage features for own listings" ON listing_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_features.listing_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- 13. LISTING IMAGES RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Listing images are viewable by everyone" ON listing_images;
CREATE POLICY "Listing images are viewable by everyone" ON listing_images
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can manage images for own listings" ON listing_images;
CREATE POLICY "Users can manage images for own listings" ON listing_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_images.listing_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- 14. DEALER PROFILES RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Dealer profiles are viewable by everyone" ON dealer_profiles;
CREATE POLICY "Dealer profiles are viewable by everyone" ON dealer_profiles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can create own dealer profile" ON dealer_profiles;
CREATE POLICY "Users can create own dealer profile" ON dealer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dealer profile" ON dealer_profiles;
CREATE POLICY "Users can update own dealer profile" ON dealer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 15. SAVED LISTINGS RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own saved listings" ON saved_listings;
CREATE POLICY "Users can view own saved listings" ON saved_listings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own saved listings" ON saved_listings;
CREATE POLICY "Users can create own saved listings" ON saved_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved listings" ON saved_listings;
CREATE POLICY "Users can delete own saved listings" ON saved_listings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 16. NEWS ARTICLES RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "News articles are viewable by everyone" ON news_articles;
CREATE POLICY "News articles are viewable by everyone" ON news_articles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage news articles" ON news_articles;
CREATE POLICY "Admins can manage news articles" ON news_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- 17. CREATE FUNCTION FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 18. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_listings_updated_at ON listings;
CREATE TRIGGER handle_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_dealer_profiles_updated_at ON dealer_profiles;
CREATE TRIGGER handle_dealer_profiles_updated_at
  BEFORE UPDATE ON dealer_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_news_articles_updated_at ON news_articles;
CREATE TRIGGER handle_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 19. CREATE FUNCTION TO CREATE PROFILE ON SIGNUP
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 20. CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON listings(is_featured);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON news_articles(featured);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);

-- ============================================
-- 21. INSERT SAMPLE NEWS ARTICLES
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
),
(
  '2024 Shelby F-150 Super Snake: Truck Meets Track',
  'We test the 775HP F-150 Super Snake on both the highway and on a closed course to see if it lives up to the hype.',
  'Full article content here...',
  'Review',
  FALSE,
  '9 min',
  NOW() - INTERVAL '12 days'
),
(
  'Why Vintage Shelby Prices Are Skyrocketing in 2024',
  'An analysis of the collector car market reveals that original Shelby Cobras and Mustangs have seen 40% increases.',
  'Full article content here...',
  'Market News',
  FALSE,
  '6 min',
  NOW() - INTERVAL '14 days'
),
(
  'The Complete Shelby GT350 Buyer''s Guide',
  'Everything you need to know before purchasing a GT350 or GT350R, from common issues to fair market values.',
  'Full article content here...',
  'Guide',
  FALSE,
  '12 min',
  NOW() - INTERVAL '16 days'
),
(
  'Inside Carroll Shelby''s Personal Car Collection',
  'A rare look at the vehicles Carroll Shelby kept for himself during his legendary career.',
  'Full article content here...',
  'Collectors',
  FALSE,
  '10 min',
  NOW() - INTERVAL '19 days'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- ✅ SETUP COMPLETE!
-- ============================================
SELECT '✅ Database setup complete! All tables, policies, and sample data created.' as status;
