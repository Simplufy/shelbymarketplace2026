const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://stpliwgecckyjknkqenl.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cGxpd2dlY2NreWprbmtxZW5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYwOTUzOCwiZXhwIjoyMDkxMTg1NTM4fQ.7CgLLkngKkeLwL_GWiJSWf2BCHieIvyZ2UDA3PQmFvA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Starting Supabase setup...\n');

  try {
    // 1. Enable UUID extension
    console.log('1️⃣  Enabling UUID extension...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    }).catch(async () => {
      // Try direct SQL if RPC not available
      const { error } = await supabase.from('_exec_sql').select('*').eq('sql', 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      if (error) console.log('   ℹ️  UUID extension may already be enabled');
    });
    console.log('   ✅ UUID extension enabled\n');

    // 2. Create profiles table
    console.log('2️⃣  Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    if (profilesError) throw profilesError;
    console.log('   ✅ profiles table created\n');

    // 3. Create listings table
    console.log('3️⃣  Creating listings table...');
    const { error: listingsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    if (listingsError) throw listingsError;
    console.log('   ✅ listings table created\n');

    // 4. Create listing_features table
    console.log('4️⃣  Creating listing_features table...');
    const { error: featuresError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS listing_features (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
          feature TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    if (featuresError) throw featuresError;
    console.log('   ✅ listing_features table created\n');

    // 5. Create listing_images table
    console.log('5️⃣  Creating listing_images table...');
    const { error: imagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS listing_images (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
          url TEXT NOT NULL,
          storage_path TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT FALSE,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    if (imagesError) throw imagesError;
    console.log('   ✅ listing_images table created\n');

    // 6. Create dealer_profiles table
    console.log('6️⃣  Creating dealer_profiles table...');
    const { error: dealersError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    if (dealersError) throw dealersError;
    console.log('   ✅ dealer_profiles table created\n');

    // 7. Create saved_listings table
    console.log('7️⃣  Creating saved_listings table...');
    const { error: savedError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS saved_listings (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
          listing_id UUID REFERENCES listings ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, listing_id)
        );
      `
    });
    if (savedError) throw savedError;
    console.log('   ✅ saved_listings table created\n');

    // 8. Create news_articles table
    console.log('8️⃣  Creating news_articles table...');
    const { error: newsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    if (newsError) throw newsError;
    console.log('   ✅ news_articles table created\n');

    // 9. Create active_listings view
    console.log('9️⃣  Creating active_listings view...');
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW active_listings AS
        SELECT 
          l.*,
          (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary = TRUE LIMIT 1) as primary_image_url,
          dp.dealership_name,
          dp.verified as dealer_verified
        FROM listings l
        LEFT JOIN dealer_profiles dp ON l.user_id = dp.user_id
        WHERE l.status = 'ACTIVE';
      `
    });
    if (viewError) console.log('   ⚠️  View may already exist:', viewError.message);
    else console.log('   ✅ active_listings view created\n');

    // 10. Enable RLS on all tables
    console.log('🔒 Enabling Row Level Security...');
    const tables = ['profiles', 'listings', 'listing_features', 'listing_images', 'dealer_profiles', 'saved_listings', 'news_articles'];
    for (const table of tables) {
      await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      }).catch(() => {});
    }
    console.log('   ✅ RLS enabled on all tables\n');

    // 11. Create RLS policies
    console.log('🛡️  Creating RLS policies...');
    
    // Profiles policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
        CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (TRUE);
        
        DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
        CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
      `
    });
    console.log('   ✅ Profiles policies created');

    // Listings policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
        CREATE POLICY "Listings are viewable by everyone" ON listings FOR SELECT USING (TRUE);
        
        DROP POLICY IF EXISTS "Users can create listings" ON listings;
        CREATE POLICY "Users can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update own listings" ON listings;
        CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
        CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = user_id);
      `
    });
    console.log('   ✅ Listings policies created');

    // Listing features policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Listing features are viewable by everyone" ON listing_features;
        CREATE POLICY "Listing features are viewable by everyone" ON listing_features FOR SELECT USING (TRUE);
        
        DROP POLICY IF EXISTS "Users can manage features for own listings" ON listing_features;
        CREATE POLICY "Users can manage features for own listings" ON listing_features 
        FOR ALL USING (EXISTS (SELECT 1 FROM listings WHERE id = listing_features.listing_id AND user_id = auth.uid()));
      `
    });
    console.log('   ✅ Listing features policies created');

    // Listing images policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Listing images are viewable by everyone" ON listing_images;
        CREATE POLICY "Listing images are viewable by everyone" ON listing_images FOR SELECT USING (TRUE);
        
        DROP POLICY IF EXISTS "Users can manage images for own listings" ON listing_images;
        CREATE POLICY "Users can manage images for own listings" ON listing_images 
        FOR ALL USING (EXISTS (SELECT 1 FROM listings WHERE id = listing_images.listing_id AND user_id = auth.uid()));
      `
    });
    console.log('   ✅ Listing images policies created');

    // Dealer profiles policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Dealer profiles are viewable by everyone" ON dealer_profiles;
        CREATE POLICY "Dealer profiles are viewable by everyone" ON dealer_profiles FOR SELECT USING (TRUE);
        
        DROP POLICY IF EXISTS "Users can create own dealer profile" ON dealer_profiles;
        CREATE POLICY "Users can create own dealer profile" ON dealer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update own dealer profile" ON dealer_profiles;
        CREATE POLICY "Users can update own dealer profile" ON dealer_profiles FOR UPDATE USING (auth.uid() = user_id);
      `
    });
    console.log('   ✅ Dealer profiles policies created');

    // Saved listings policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view own saved listings" ON saved_listings;
        CREATE POLICY "Users can view own saved listings" ON saved_listings FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can create own saved listings" ON saved_listings;
        CREATE POLICY "Users can create own saved listings" ON saved_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can delete own saved listings" ON saved_listings;
        CREATE POLICY "Users can delete own saved listings" ON saved_listings FOR DELETE USING (auth.uid() = user_id);
      `
    });
    console.log('   ✅ Saved listings policies created');

    // News articles policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "News articles are viewable by everyone" ON news_articles;
        CREATE POLICY "News articles are viewable by everyone" ON news_articles FOR SELECT USING (TRUE);
        
        DROP POLICY IF EXISTS "Admins can manage news articles" ON news_articles;
        CREATE POLICY "Admins can manage news articles" ON news_articles 
        FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
      `
    });
    console.log('   ✅ News articles policies created\n');

    // 12. Create handle_updated_at function
    console.log('⚡ Creating updated_at trigger function...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    console.log('   ✅ handle_updated_at function created\n');

    // 13. Create triggers
    console.log('⚡ Creating updated_at triggers...');
    const tablesWithUpdatedAt = ['profiles', 'listings', 'dealer_profiles', 'news_articles'];
    for (const table of tablesWithUpdatedAt) {
      await supabase.rpc('exec_sql', {
        sql: `
          DROP TRIGGER IF EXISTS handle_${table}_updated_at ON ${table};
          CREATE TRIGGER handle_${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        `
      });
    }
    console.log('   ✅ Triggers created\n');

    // 14. Create handle_new_user function and trigger
    console.log('👤 Creating new user handler...');
    await supabase.rpc('exec_sql', {
      sql: `
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
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });
    console.log('   ✅ New user handler created\n');

    // 15. Create indexes
    console.log('📊 Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
        CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
        CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON listings(is_featured);
        CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
        CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON saved_listings(user_id);
        CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON news_articles(featured);
        CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
      `
    });
    console.log('   ✅ Indexes created\n');

    // 16. Insert sample news articles
    console.log('📰 Inserting sample news articles...');
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
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
        )
        ON CONFLICT DO NOTHING;
      `
    });
    if (insertError) console.log('   ⚠️  Articles may already exist');
    else console.log('   ✅ Sample news articles inserted\n');

    console.log('🎉 Database setup complete!\n');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    console.log('\n⚠️  Trying alternative setup method...\n');
    return false;
  }
  
  return true;
}

async function setupStorage() {
  console.log('📦 Setting up Storage buckets...\n');

  try {
    // Create listing-images bucket
    console.log('1️⃣  Creating listing-images bucket...');
    const { error: error1 } = await supabase.storage.createBucket('listing-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });
    if (error1 && !error1.message.includes('already exists')) {
      throw error1;
    }
    console.log('   ✅ listing-images bucket created/exists\n');

    // Create avatar-images bucket
    console.log('2️⃣  Creating avatar-images bucket...');
    const { error: error2 } = await supabase.storage.createBucket('avatar-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (error2 && !error2.message.includes('already exists')) {
      throw error2;
    }
    console.log('   ✅ avatar-images bucket created/exists\n');

    // Create dealer-documents bucket (private)
    console.log('3️⃣  Creating dealer-documents bucket...');
    const { error: error3 } = await supabase.storage.createBucket('dealer-documents', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
      fileSizeLimit: 10485760 // 10MB
    });
    if (error3 && !error3.message.includes('already exists')) {
      throw error3;
    }
    console.log('   ✅ dealer-documents bucket created/exists\n');

    console.log('🎉 Storage buckets setup complete!\n');
    return true;
  } catch (error) {
    console.error('❌ Error setting up storage:', error.message);
    return false;
  }
}

async function verifySetup() {
  console.log('🔍 Verifying setup...\n');

  try {
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) throw tablesError;

    const requiredTables = ['profiles', 'listings', 'listing_features', 'listing_images', 'dealer_profiles', 'saved_listings', 'news_articles'];
    const existingTables = tables.map(t => t.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables.join(', '));
    } else {
      console.log('✅ All tables created successfully');
    }

    // Check buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;

    const bucketNames = buckets.map(b => b.name);
    const requiredBuckets = ['listing-images', 'avatar-images', 'dealer-documents'];
    const missingBuckets = requiredBuckets.filter(b => !bucketNames.includes(b));

    if (missingBuckets.length > 0) {
      console.log('❌ Missing buckets:', missingBuckets.join(', '));
    } else {
      console.log('✅ All buckets created successfully');
    }

    // Count news articles
    const { count, error: countError } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true });

    if (!countError && count) {
      console.log(`✅ ${count} news articles inserted`);
    }

    console.log('\n🎉 Setup verification complete!\n');

  } catch (error) {
    console.error('❌ Error verifying setup:', error.message);
  }
}

// Run setup
async function runSetup() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('    SHELBY EXCHANGE - SUPABASE SETUP');
  console.log('═══════════════════════════════════════════════════════════\n');

  const dbSuccess = await setupDatabase();
  
  if (!dbSuccess) {
    console.log('\n⚠️  Database setup encountered issues. Continuing with storage...\n');
  }

  const storageSuccess = await setupStorage();
  
  if (storageSuccess || dbSuccess) {
    await verifySetup();
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('    SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Visit: http://localhost:3006');
  console.log('3. Test registration at: http://localhost:3006/register');
  console.log('4. Check your Supabase Dashboard to see the data\n');
}

runSetup();
