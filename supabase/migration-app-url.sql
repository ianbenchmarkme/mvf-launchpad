-- Add app_url column to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS app_url TEXT;
