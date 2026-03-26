-- Demo seed: 8 fictional Green-tier apps
-- Run AFTER schema.sql, functions.sql, and seed.sql
-- Uses the first admin profile as the creator/owner

INSERT INTO apps (name, problem_statement, layer, target_users, potential_roi, needs_business_data, handles_pii, uses_api_keys, api_key_services, replaces_third_party, replaced_tool_name, replaced_tool_cost, tier, status, created_by)
VALUES
  (
    'Delphi',
    'AI-powered feature discovery tool that helps stakeholders explore problems, validate ideas, and produce structured proposals for engineering review. Reduces PM bottleneck on low-level discovery work.',
    'L2', 'org_wide',
    'Frees up 8-10 hours per PM per week on discovery tasks',
    'yes', 'no', 'yes', 'Anthropic Claude API',
    false, NULL, NULL,
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Beacon',
    'Real-time campaign performance dashboard pulling data from Snowflake and Looker. Surfaces anomalies, trending KPIs, and daily revenue snapshots for commercial leads without requiring Looker access.',
    'L1', 'department',
    'Saves 30 min daily for 12 commercial leads checking reports',
    'yes', 'no', 'yes', 'Snowflake SQL API',
    true, 'Custom Looker dashboards', '£8,000/year',
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Switchboard',
    'Centralised API key and secrets management portal for all internal tools. Provides scoped credentials, rotation reminders, audit logs, and one-click revocation. Eliminates keys stored in source code.',
    'L1', 'org_wide',
    'Prevents API key exposure incidents — estimated £50K risk reduction',
    'no', 'no', 'yes', 'HashiCorp Vault',
    false, NULL, NULL,
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Pulse',
    'Weekly employee sentiment tracker with anonymous micro-surveys. Tracks team health, flags burnout risk, and generates actionable insights for managers. Three questions, once a week, takes 30 seconds.',
    'L2', 'org_wide',
    'Early warning system for retention risk — replaces quarterly engagement surveys',
    'no', 'yes', 'no', NULL,
    true, 'Culture Amp pulse surveys', '£12,000/year',
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Relay',
    'Automated client onboarding workflow that takes a signed contract and provisions accounts, sends welcome emails, schedules kick-off calls, and creates CRM records. End-to-end in under 5 minutes.',
    'L1', 'department',
    'Reduces onboarding time from 2 days to 5 minutes per client',
    'yes', 'yes', 'yes', 'Salesforce API, SendGrid, Calendly',
    false, NULL, NULL,
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Prism',
    'A/B test results analyser that pulls experiment data from Optimizely, runs statistical significance calculations, and generates plain-English summaries with recommended actions. No data science degree required.',
    'L2', 'department',
    'Accelerates test-and-learn cycles from weekly to daily decisions',
    'yes', 'no', 'yes', 'Optimizely REST API',
    false, NULL, NULL,
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Atlas',
    'Internal knowledge base and documentation hub. AI-powered search across Confluence, Notion, Slack, and Google Drive. Ask a question in natural language, get answers with source links.',
    'L1', 'org_wide',
    'Reduces time-to-answer for internal queries by 70%',
    'yes', 'no', 'yes', 'OpenAI Embeddings, Google Drive API',
    true, 'Confluence search + tribal knowledge', '£15,000/year',
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  ),
  (
    'Cadence',
    'Meeting cost calculator and calendar hygiene tool. Shows the £ cost of every meeting based on attendee seniority, flags meetings without agendas, and suggests async alternatives. Integrates with Google Calendar.',
    'L3', 'org_wide',
    'Identified £180K/year in unnecessary meeting costs during pilot',
    'no', 'no', 'yes', 'Google Calendar API',
    false, NULL, NULL,
    'green', 'active',
    (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  );

-- Create ownership records for all 8 apps
INSERT INTO app_owners (app_id, user_id, owner_role)
SELECT a.id, (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1), 'primary'
FROM apps a
WHERE a.name IN ('Delphi', 'Beacon', 'Switchboard', 'Pulse', 'Relay', 'Prism', 'Atlas', 'Cadence')
  AND NOT EXISTS (
    SELECT 1 FROM app_owners ao WHERE ao.app_id = a.id
  );
