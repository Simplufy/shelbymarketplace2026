import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This uses the service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST() {
  try {
    // Create site-images bucket
    const { error } = await supabaseAdmin.storage.createBucket('site-images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
    });

    if (error) {
      // Bucket might already exist
      if (error.message?.includes('already exists') || error.message?.includes('Already exists')) {
        return NextResponse.json({ 
          success: true, 
          message: 'Bucket already exists',
          bucket: 'site-images'
        });
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bucket created successfully',
      bucket: 'site-images'
    });

  } catch (error: any) {
    console.error('Error creating bucket:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create bucket' 
    }, { status: 500 });
  }
}
