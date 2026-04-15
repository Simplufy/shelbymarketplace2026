-- Supabase Database Setup for Shelby Exchange
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
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

-- Listings table
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

-- Listing features table
CREATE TABLE listing_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing images table
CREATE TABLE listing_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dealer profiles table
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

-- Saved listings table (favorites)
CREATE TABLE saved_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- News articles table
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

-- Create view for active listings with primary image
CREATE VIEW active_listings AS
SELECT 
  l.*,
  (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary = TRUE LIMIT 1) as primary_image_url,
  dp.dealership_name,
  dp.verified as dealer_verified
FROM listings l
LEFT JOIN dealer_profiles dp ON l.user_id = dp.user_id
WHERE l.status = 'ACTIVE';

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Listings RLS policies
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Listing features RLS policies
CREATE POLICY "Listing features are viewable by everyone" ON listing_features
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage features for own listings" ON listing_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_features.listing_id AND user_id = auth.uid()
    )
  );

-- Listing images RLS policies
CREATE POLICY "Listing images are viewable by everyone" ON listing_images
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage images for own listings" ON listing_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_images.listing_id AND user_id = auth.uid()
    )
  );

-- Dealer profiles RLS policies
CREATE POLICY "Dealer profiles are viewable by everyone" ON dealer_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create own dealer profile" ON dealer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dealer profile" ON dealer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Saved listings RLS policies
CREATE POLICY "Users can view own saved listings" ON saved_listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved listings" ON saved_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved listings" ON saved_listings
  FOR DELETE USING (auth.uid() = user_id);

-- News articles RLS policies
CREATE POLICY "News articles are viewable by everyone" ON news_articles
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage news articles" ON news_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create function to handle updated_at
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

-- Create function to create profile on signup
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

-- Performance indexes for growth
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_model ON listings(model);
CREATE INDEX IF NOT EXISTS idx_listings_status_price ON listings(status, price);
CREATE INDEX IF NOT EXISTS idx_listings_status_created_at ON listings(status, created_at DESC);

-- Insert sample news articles
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
