-- Migration: App Icons
-- Creates the app-icons storage bucket and adds icon_url to the apps table.
-- Run in Supabase SQL Editor after migration-app-url.sql.

-- Create the app-icons bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-icons', 'app-icons', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: only the service role (server-side API) writes icons.
-- Client-side direct storage writes are intentionally blocked.
-- The upload API route uses the service-role key and handles auth/ownership itself.

-- RLS: public read access for displaying icons
CREATE POLICY "Public can read app icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-icons');

-- Add icon_url column to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS icon_url TEXT;
