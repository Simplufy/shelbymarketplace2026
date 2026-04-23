CREATE TABLE IF NOT EXISTS listing_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_page_views_listing_id ON listing_page_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_page_views_viewed_at ON listing_page_views(viewed_at DESC);

ALTER TABLE listing_page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert listing page views" ON listing_page_views;
CREATE POLICY "Anyone can insert listing page views"
  ON listing_page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read listing page views" ON listing_page_views;
CREATE POLICY "Service role can read listing page views"
  ON listing_page_views
  FOR SELECT
  TO authenticated
  USING (true);
