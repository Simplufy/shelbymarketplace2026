// One-time script to create storage buckets
// Run this with: node src/scripts/setup-storage.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stpliwgecckyjknkqenl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node src/scripts/setup-storage.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('Setting up Supabase Storage buckets...\n');

  const buckets = [
    {
      name: 'site-images',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
    },
    {
      name: 'listings',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    }
  ];

  for (const bucketConfig of buckets) {
    try {
      console.log(`Creating bucket: ${bucketConfig.name}...`);
      
      const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
        public: bucketConfig.public,
        fileSizeLimit: bucketConfig.fileSizeLimit,
        allowedMimeTypes: bucketConfig.allowedMimeTypes
      });

      if (error) {
        if (error.message?.includes('already exists') || error.message?.includes('Already exists')) {
          console.log(`  ✅ Bucket '${bucketConfig.name}' already exists`);
        } else {
          console.error(`  ❌ Error creating '${bucketConfig.name}':`, error.message);
        }
      } else {
        console.log(`  ✅ Bucket '${bucketConfig.name}' created successfully`);
      }
    } catch (err) {
      console.error(`  ❌ Unexpected error for '${bucketConfig.name}':`, err.message);
    }
  }

  console.log('\n✨ Storage setup complete!');
  console.log('\nYou can now upload images in:');
  console.log('  - Admin > Media Library');
  console.log('  - Admin > Content (Hero/CTA images)');
  console.log('  - Admin > News > New Article (featured images)');
}

setupStorage();
