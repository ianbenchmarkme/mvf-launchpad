-- Add pii_confirmed to flag_type enum
-- Run this after schema.sql / previous migrations

ALTER TYPE flag_type ADD VALUE IF NOT EXISTS 'pii_confirmed' AFTER 'pii_undisclosed';
