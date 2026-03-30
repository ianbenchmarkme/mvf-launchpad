-- Migration: Add category field to apps
-- Run in Supabase SQL Editor

CREATE TYPE app_category AS ENUM (
  'Marketing', 'Sales', 'Legal', 'Tech', 'Data', 'Productivity', 'AI'
);

ALTER TABLE apps ADD COLUMN category app_category NULL;

CREATE INDEX idx_apps_category ON apps(category);

ALTER TABLE apps ALTER COLUMN layer SET DEFAULT 'L3';
