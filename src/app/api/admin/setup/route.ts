import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Check environment variables at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      }, { status: 500 });
    }

    // Create client inside the function to avoid build-time issues
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

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
