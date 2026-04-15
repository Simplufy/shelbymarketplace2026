#!/usr/bin/env node
/**
 * Database Setup Script for Shelby Exchange
 * Run this after setting up your Supabase project to ensure all tables exist
 * 
 * Usage: node scripts/setup-database.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log('🔧 Setting up Shelby Exchange database...\n');

  const tables = [
    {
      name: 'listing_inquiries',
      sql: `
        CREATE TABLE IF NOT EXISTS listing_inquiries (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          buyer_name TEXT NOT NULL,
          buyer_email TEXT NOT NULL,
          buyer_phone TEXT,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE listing_inquiries ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Sellers can view inquiries on their listings"
          ON listing_inquiries FOR SELECT
          USING (seller_id = auth.uid());

        CREATE POLICY "Anyone can create inquiries"
          ON listing_inquiries FOR INSERT
          WITH CHECK (true);
      `,
    },
    {
      name: 'newsletter_subscribers',
      sql: `
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          unsubscribed_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true
        );

        ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Anyone can subscribe"
          ON newsletter_subscribers FOR INSERT
          WITH CHECK (true);
      `,
    },
    {
      name: 'email_notifications',
      sql: `
        CREATE TABLE IF NOT EXISTS email_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          recipient_email TEXT NOT NULL,
          notification_type TEXT NOT NULL,
          subject TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          sent_at TIMESTAMP WITH TIME ZONE,
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
      `,
    },
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Checking table: ${table.name}`);
      
      // Try to select from the table to see if it exists
      const { error: checkError } = await supabase
        .from(table.name)
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist, create it
        console.log(`   Creating ${table.name}...`);
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: table.sql,
        });

        if (createError) {
          console.error(`   ❌ Error creating ${table.name}:`, createError.message);
          console.log(`   Please run this SQL manually in Supabase SQL Editor:`);
          console.log(table.sql);
        } else {
          console.log(`   ✅ ${table.name} created successfully`);
        }
      } else if (checkError) {
        console.error(`   ⚠️  Error checking ${table.name}:`, checkError.message);
      } else {
        console.log(`   ✅ ${table.name} already exists`);
      }
    } catch (error) {
      console.error(`   ❌ Error with ${table.name}:`, error);
    }
  }

  console.log('\n📦 Checking storage buckets...');
  
  const buckets = [
    { name: 'listing-images', public: true },
    { name: 'dealer-documents', public: true },
    { name: 'avatar-images', public: true },
  ];

  for (const bucket of buckets) {
    try {
      console.log(`   Checking bucket: ${bucket.name}`);
      const { error } = await supabase.storage.getBucket(bucket.name);
      
      if (error && error.message.includes('not found')) {
        console.log(`   Creating ${bucket.name} bucket...`);
        const { error: createError } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
        });
        
        if (createError) {
          console.error(`   ❌ Error creating bucket:`, createError.message);
        } else {
          console.log(`   ✅ ${bucket.name} bucket created`);
        }
      } else if (error) {
        console.error(`   ⚠️  Error checking bucket:`, error.message);
      } else {
        console.log(`   ✅ ${bucket.name} bucket exists`);
      }
    } catch (error) {
      console.error(`   ❌ Error with bucket ${bucket.name}:`, error);
    }
  }

  console.log('\n✨ Database setup complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Set up your Stripe keys in .env.local');
  console.log('   2. Configure Stripe webhook endpoint: /api/stripe/webhook');
  console.log('   3. Create an admin user and set their role to ADMIN in profiles table');
  console.log('   4. Test the listing creation flow');
  console.log('   5. Test the contact seller form');
}

setupDatabase().catch(console.error);
