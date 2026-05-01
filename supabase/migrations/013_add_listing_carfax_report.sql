ALTER TABLE listings
ADD COLUMN IF NOT EXISTS carfax_report_url TEXT;
