import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorage() {
  console.log('Setting up storage buckets...');

  try {
    // Create dealer-documents bucket
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const dealerDocsExists = existingBuckets?.find(b => b.name === 'dealer-documents');
    
    if (!dealerDocsExists) {
      console.log('Creating dealer-documents bucket...');
      const { data, error } = await supabase.storage.createBucket('dealer-documents', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
      });

      if (error) {
        console.error('Error creating dealer-documents bucket:', error);
      } else {
        console.log('✓ Created dealer-documents bucket');
      }
    } else {
      console.log('✓ dealer-documents bucket already exists');
    }

    // Check listing-images bucket
    const listingImagesExists = existingBuckets?.find(b => b.name === 'listing-images');
    
    if (!listingImagesExists) {
      console.log('Creating listing-images bucket...');
      const { error } = await supabase.storage.createBucket('listing-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
      });

      if (error) {
        console.error('Error creating listing-images bucket:', error);
      } else {
        console.log('✓ Created listing-images bucket');
      }
    } else {
      console.log('✓ listing-images bucket already exists');
    }

    console.log('\nStorage setup complete!');
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorage();
