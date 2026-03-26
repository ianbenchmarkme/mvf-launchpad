-- Seed data: 3 apps from the amnesty CSV
-- Run AFTER schema.sql and after at least one user has signed in
-- Replace 'ADMIN_USER_ID' with the actual UUID of the admin user

-- To find your user ID after first sign-in:
-- SELECT id, email FROM profiles;

-- INSERT INTO apps (name, problem_statement, layer, target_users, needs_business_data, handles_pii, uses_api_keys, tier, status, created_by)
-- VALUES
--   ('ArtyFish', 'Utilise AI to generate paid marketing wins', 'L2', 'department', 'unsure', 'unsure', 'yes', 'amber', 'active', 'ADMIN_USER_ID'),
--   ('Allegros', 'Internal portal for Legal', 'L2', 'department', 'unsure', 'yes', 'unsure', 'red', 'active', 'ADMIN_USER_ID'),
--   ('Partner Portal', 'Partner portal for external partners', 'L2', 'org_wide', 'yes', 'unsure', 'unsure', 'red', 'active', 'ADMIN_USER_ID');

-- After inserting, create ownership records:
-- INSERT INTO app_owners (app_id, user_id, owner_role)
-- SELECT id, 'ADMIN_USER_ID', 'primary' FROM apps WHERE name IN ('ArtyFish', 'Allegros', 'Partner Portal');

-- Note: ArtyFish is set to 'amber' as it's the exemplar graduated app.
-- Allegros and Partner Portal are 'red' (experimental) pending review.
