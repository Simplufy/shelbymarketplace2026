// Run this in your browser console when logged into the admin panel
// Or create a page at /admin/setup that runs this code

import { createClient } from '@/lib/supabase/client';

export async function setupSupabaseStorage() {
  const supabase = createClient();
  const results: string[] = [];

  // 1. Check if listings bucket exists
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      results.push(`❌ Error listing buckets: ${listError.message}`);
      return results;
    }

    const existingBuckets = buckets?.map(b => b.name) || [];
    results.push(`Found buckets: ${existingBuckets.join(', ') || 'None'}`);

    // 2. Create listings bucket if it doesn't exist
    if (!existingBuckets.includes('listings')) {
      const { error } = await supabase.storage.createBucket('listings', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
      });

      if (error) {
        results.push(`❌ Error creating listings bucket: ${error.message}`);
      } else {
        results.push(`✅ Created 'listings' bucket`);
      }
    } else {
      results.push(`✅ 'listings' bucket already exists`);
    }

    // 3. Create site-images bucket if it doesn't exist
    if (!existingBuckets.includes('site-images')) {
      const { error } = await supabase.storage.createBucket('site-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
      });

      if (error) {
        results.push(`❌ Error creating site-images bucket: ${error.message}`);
      } else {
        results.push(`✅ Created 'site-images' bucket`);
      }
    } else {
      results.push(`✅ 'site-images' bucket already exists`);
    }

  } catch (error: any) {
    results.push(`❌ Unexpected error: ${error.message}`);
  }

  return results;
}

export async function setupDatabaseTables() {
  const supabase = createClient();
  const results: string[] = [];

  // Check if tables exist by trying to select from them
  const tables = ['site_content', 'site_settings'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      
      if (error && error.message.includes('does not exist')) {
        results.push(`❌ Table '${table}' does not exist - needs SQL creation`);
      } else if (error) {
        results.push(`⚠️ Table '${table}' error: ${error.message}`);
      } else {
        results.push(`✅ Table '${table}' exists`);
      }
    } catch (error: any) {
      results.push(`❌ Error checking ${table}: ${error.message}`);
    }
  }

  return results;
}
