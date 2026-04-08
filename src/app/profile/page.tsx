'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the profile content with SSR disabled
// This prevents 'location is not defined' errors during build
const ProfileContent = dynamic(
  () => import('./ProfileContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#002D72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#565d6d]">Loading profile...</p>
        </div>
      </div>
    )
  }
);

// Force dynamic rendering
export const dynamicConfig = 'force-dynamic';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#002D72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#565d6d]">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
