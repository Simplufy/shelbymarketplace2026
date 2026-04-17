-- Add listing_tag and service_history columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_tag TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_tag_number INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_history JSONB DEFAULT '[]'::jsonb;
