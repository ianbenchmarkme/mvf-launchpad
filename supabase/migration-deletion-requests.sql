-- Allow app owners to insert risk flags (for deletion requests)
-- Run this after schema.sql

DROP POLICY IF EXISTS "risk_flags_insert" ON risk_flags;

CREATE POLICY "risk_flags_insert" ON risk_flags FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM app_owners WHERE app_id = risk_flags.app_id AND user_id = auth.uid())
  );
