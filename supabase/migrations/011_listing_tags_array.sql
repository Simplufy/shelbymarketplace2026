-- Change listing_tag from single text to JSONB array for multiple tags
ALTER TABLE listings DROP COLUMN IF EXISTS listing_tag;
ALTER TABLE listings DROP COLUMN IF EXISTS listing_tag_number;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_tags JSONB DEFAULT '[]'::jsonb;
