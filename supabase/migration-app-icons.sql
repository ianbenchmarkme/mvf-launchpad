-- Migration: App Icons
-- Creates the app-icons storage bucket and adds icon_url to the apps table.
-- Run in Supabase SQL Editor after migration-app-url.sql.

-- Create the app-icons bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-icons', 'app-icons', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload icons
CREATE POLICY "Authenticated users can upload app icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-icons');

-- RLS: authenticated users can replace existing icons
CREATE POLICY "Authenticated users can update app icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'app-icons');

-- RLS: public read access for displaying icons
CREATE POLICY "Public can read app icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-icons');

-- Add icon_url column to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS icon_url TEXT;
