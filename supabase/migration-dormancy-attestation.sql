-- Add dormancy_attestation to flag_type enum
-- Run this after schema.sql / previous migrations

ALTER TYPE flag_type ADD VALUE IF NOT EXISTS 'dormancy_attestation' AFTER 'capacity_exceeded';
