-- MVF Launchpad Phase 1 Schema
-- Run this in Supabase SQL Editor

-- Enable fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE app_layer AS ENUM ('L1', 'L2', 'L3');
CREATE TYPE app_tier AS ENUM ('red', 'amber', 'green');
CREATE TYPE app_status AS ENUM ('intent', 'developing', 'testing', 'active', 'archived');
CREATE TYPE user_role AS ENUM ('maker', 'admin', 'viewer');
CREATE TYPE target_users AS ENUM ('my_team', 'department', 'org_wide');
CREATE TYPE tristate AS ENUM ('yes', 'no', 'unsure');
CREATE TYPE owner_role AS ENUM ('primary', 'backup');
CREATE TYPE flag_type AS ENUM (
  'no_backup', 'stale_owner', 'pii_undisclosed', 'pii_confirmed', 'unsure_pii',
  'unsure_business_data', 'unsure_api_keys', 'high_wau_red_tier',
  'capacity_exceeded', 'manual'
);
CREATE TYPE flag_severity AS ENUM ('info', 'warning', 'critical');

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'maker',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Apps (the core registry)
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  layer app_layer NOT NULL,
  target_users target_users NOT NULL,
  potential_roi TEXT,
  needs_business_data tristate NOT NULL DEFAULT 'unsure',
  handles_pii tristate NOT NULL DEFAULT 'unsure',
  uses_api_keys tristate NOT NULL DEFAULT 'unsure',
  api_key_services TEXT,
  replaces_third_party BOOLEAN NOT NULL DEFAULT false,
  replaced_tool_name TEXT,
  replaced_tool_cost TEXT,
  tier app_tier NOT NULL DEFAULT 'red',
  status app_status NOT NULL DEFAULT 'intent',
  last_activity_at TIMESTAMPTZ,  -- Phase 2: dormancy tracking
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- App owners (primary + backup)
CREATE TABLE app_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_role owner_role NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);

-- Risk flags
CREATE TABLE risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  flag_type flag_type NOT NULL,
  severity flag_severity NOT NULL DEFAULT 'info',
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

-- Tier change audit trail
CREATE TABLE tier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  from_tier app_tier,
  to_tier app_tier NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_apps_layer ON apps(layer);
CREATE INDEX idx_apps_tier ON apps(tier);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_created_by ON apps(created_by);
CREATE INDEX idx_apps_name_trgm ON apps USING gin(name gin_trgm_ops);
CREATE INDEX idx_apps_problem_trgm ON apps USING gin(problem_statement gin_trgm_ops);
CREATE INDEX idx_app_owners_user ON app_owners(user_id);
CREATE INDEX idx_app_owners_app ON app_owners(app_id);
CREATE INDEX idx_risk_flags_app ON risk_flags(app_id);
CREATE INDEX idx_risk_flags_unresolved ON risk_flags(app_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_tier_history_app ON tier_history(app_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-log tier changes
CREATE OR REPLACE FUNCTION public.log_tier_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.tier IS DISTINCT FROM NEW.tier THEN
    INSERT INTO tier_history (app_id, from_tier, to_tier, changed_by)
    VALUES (NEW.id, OLD.tier, NEW.tier, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_app_tier_change
  BEFORE UPDATE ON apps
  FOR EACH ROW EXECUTE FUNCTION public.log_tier_change();

-- Auto-update updated_at on apps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_history ENABLE ROW LEVEL SECURITY;

-- Profiles: all authenticated can read, users can update own, admins can update any
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Apps: all authenticated can read, makers can insert own, owners/admins can update
CREATE POLICY "apps_select" ON apps FOR SELECT TO authenticated USING (true);
CREATE POLICY "apps_insert" ON apps FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "apps_update_owner" ON apps FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM app_owners WHERE app_id = apps.id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "apps_delete_admin" ON apps FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- App owners: all authenticated can read, app creator or admin can manage
CREATE POLICY "app_owners_select" ON app_owners FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_owners_insert" ON app_owners FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM apps WHERE id = app_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "app_owners_delete" ON app_owners FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM apps WHERE id = app_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Risk flags: all authenticated can read, admins can manage, owners can insert for their apps
CREATE POLICY "risk_flags_select" ON risk_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "risk_flags_insert" ON risk_flags FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM app_owners WHERE app_id = risk_flags.app_id AND user_id = auth.uid())
  );
CREATE POLICY "risk_flags_update" ON risk_flags FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tier history: all authenticated can read
CREATE POLICY "tier_history_select" ON tier_history FOR SELECT TO authenticated USING (true);
