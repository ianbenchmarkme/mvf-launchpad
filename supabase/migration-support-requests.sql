-- Migration: Support Requests
-- Run in Supabase SQL Editor after migration-dormancy-attestation.sql
-- Adds support_requests table for the user-facing support & feedback form

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE support_request_type AS ENUM ('bug_report', 'feature_request', 'feedback', 'question');
CREATE TYPE support_request_status AS ENUM ('open', 'in_progress', 'completed', 'wont_do');
CREATE TYPE support_request_priority AS ENUM ('low', 'medium', 'high');

-- ============================================================
-- TABLE
-- ============================================================

CREATE TABLE support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type support_request_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  related_app_id UUID REFERENCES apps(id) ON DELETE SET NULL,
  priority support_request_priority NOT NULL DEFAULT 'medium',
  wants_reply BOOLEAN NOT NULL DEFAULT true,
  status support_request_status NOT NULL DEFAULT 'open',
  resolution_note TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  submitted_email TEXT NOT NULL,       -- denormalised: avoids join at resolution time
  submitted_name TEXT,                 -- denormalised: used in email greeting
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- (update_updated_at function already exists from schema.sql)
-- ============================================================

CREATE TRIGGER support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can submit a request (must be their own)
CREATE POLICY "Users can create support requests"
  ON support_requests FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- Users can read their own requests; admins can read all
CREATE POLICY "Users can view own requests; admins view all"
  ON support_requests FOR SELECT
  TO authenticated
  USING (
    submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update (status changes, resolution notes)
CREATE POLICY "Admins can update support requests"
  ON support_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX support_requests_submitted_by_idx ON support_requests (submitted_by);
CREATE INDEX support_requests_status_idx ON support_requests (status);
CREATE INDEX support_requests_created_at_idx ON support_requests (created_at DESC);
