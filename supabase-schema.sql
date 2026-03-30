-- Run this SQL in your Supabase SQL Editor to set up the database

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'FL',
  zip TEXT NOT NULL,
  price INTEGER NOT NULL,
  bedrooms NUMERIC(3,1) NOT NULL,
  bathrooms NUMERIC(3,1) NOT NULL,
  sqft INTEGER,
  description TEXT,
  amenities TEXT[], -- array of amenity strings
  available_date TEXT,
  pets_allowed BOOLEAN DEFAULT FALSE,
  parking TEXT,
  laundry TEXT,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7)
);

-- Listing photos table
CREATE TABLE IF NOT EXISTS listing_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  label TEXT, -- "Living Room", "Kitchen", etc.
  sort_order INTEGER DEFAULT 0
);

-- Interest submissions table
CREATE TABLE IF NOT EXISTS interest_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  listing_address TEXT,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  message TEXT,
  contacted BOOLEAN DEFAULT FALSE
);

-- Storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can view photos
CREATE POLICY "Public can view listing photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

-- Storage policy: only authenticated users can upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-photos');

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_submissions ENABLE ROW LEVEL SECURITY;

-- Public can read active listings
CREATE POLICY "Public can view active listings"
ON listings FOR SELECT
USING (active = TRUE);

-- Public can read listing photos
CREATE POLICY "Public can view listing photos"
ON listing_photos FOR SELECT
USING (TRUE);

-- Anyone can submit interest
CREATE POLICY "Anyone can submit interest"
ON interest_submissions FOR INSERT
WITH CHECK (TRUE);

-- For admin: use service role key in production
-- For now, allow all operations (restrict after setting up auth)
CREATE POLICY "Allow all for admin operations on listings"
ON listings FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "Allow all for admin operations on photos"
ON listing_photos FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "Allow admin to view submissions"
ON interest_submissions FOR SELECT
USING (TRUE);

CREATE POLICY "Allow admin to update submissions"
ON interest_submissions FOR UPDATE
USING (TRUE);
