-- Supabase Storage Setup for Shelby Exchange
-- Run this in your Supabase SQL Editor after creating the storage buckets

-- Create storage buckets (do this in the Supabase Dashboard under Storage)
-- Bucket name: listing-images
-- Public: true

-- Set up storage RLS policies for listing-images bucket

-- Allow anyone to view images
CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create avatar-images bucket policies
-- Bucket name: avatar-images
-- Public: true

-- Allow anyone to view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatar-images');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatar-images' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatar-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatar-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create dealer-documents bucket (private)
-- Bucket name: dealer-documents
-- Public: false

-- Allow dealers to view their own documents
CREATE POLICY "Dealers can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'dealer-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow dealers to upload their own documents
CREATE POLICY "Dealers can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dealer-documents' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow dealers to delete their own documents
CREATE POLICY "Dealers can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'dealer-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
