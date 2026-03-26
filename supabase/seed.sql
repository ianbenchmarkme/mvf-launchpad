-- Seed data: 3 apps from the amnesty CSV
-- Run AFTER schema.sql and after at least one user has signed in
-- Uses the first profile found as the creator/owner

-- First, promote the first user to admin
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);

-- Insert the 3 amnesty apps
INSERT INTO apps (name, problem_statement, layer, target_users, potential_roi, needs_business_data, handles_pii, uses_api_keys, api_key_services, replaces_third_party, tier, status, created_by)
VALUES
  (
    'ArtyFish',
    'Utilise AI to generate paid marketing wins through AI-powered creative tools',
    'L2', 'department',
    'Significant time savings for the creative team',
    'unsure', 'unsure', 'yes', 'OpenAI, Replicate',
    false,
    'amber', 'active',
    (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Allegros',
    'Internal portal for the Legal department — centralised legal workflows and document management',
    'L2', 'department',
    NULL,
    'unsure', 'yes', 'unsure', NULL,
    false,
    'red', 'active',
    (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Partner Portal',
    'External-facing partner portal for managing partner relationships and communications',
    'L2', 'org_wide',
    NULL,
    'yes', 'unsure', 'unsure', NULL,
    false,
    'red', 'active',
    (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)
  );

-- Create ownership records
INSERT INTO app_owners (app_id, user_id, owner_role)
SELECT a.id, (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1), 'primary'
FROM apps a
WHERE a.name IN ('ArtyFish', 'Allegros', 'Partner Portal');

-- Auto-create risk flags for 'unsure' and 'yes' PII entries
INSERT INTO risk_flags (app_id, flag_type, severity, description)
SELECT a.id, 'unsure_pii', 'warning', 'Maker selected "Unsure" for PII handling. Follow up within 5 business days.'
FROM apps a WHERE a.name = 'ArtyFish';

INSERT INTO risk_flags (app_id, flag_type, severity, description)
SELECT a.id, 'unsure_business_data', 'info', 'Maker selected "Unsure" for business data needs. Follow up within 5 business days.'
FROM apps a WHERE a.name IN ('ArtyFish', 'Allegros');

INSERT INTO risk_flags (app_id, flag_type, severity, description)
SELECT a.id, 'unsure_api_keys', 'info', 'Maker selected "Unsure" for API key usage. Follow up within 5 business days.'
FROM apps a WHERE a.name IN ('Allegros', 'Partner Portal');
