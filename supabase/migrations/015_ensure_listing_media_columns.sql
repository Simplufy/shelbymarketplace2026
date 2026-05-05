ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS carfax_report_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN public.listings.carfax_report_url IS 'Optional paid vehicle history report URL shown on public listing pages.';
COMMENT ON COLUMN public.listings.video_url IS 'Optional YouTube, Vimeo, or direct video URL shown on public listing pages.';

NOTIFY pgrst, 'reload schema';
