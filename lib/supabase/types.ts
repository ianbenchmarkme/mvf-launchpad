// Manual types mirroring the Supabase schema
// Replace with `supabase gen types typescript` output when available

export type AppLayer = 'L1' | 'L2' | 'L3';
export type AppCategory = 'Marketing' | 'Sales' | 'Legal' | 'Tech' | 'Data' | 'Productivity' | 'AI';
export type AppTier = 'red' | 'amber' | 'green';
export type AppStatus = 'intent' | 'developing' | 'testing' | 'active' | 'archived';
export type UserRole = 'maker' | 'admin' | 'viewer';
export type TargetUsers = 'my_team' | 'department' | 'org_wide';
export type Tristate = 'yes' | 'no' | 'unsure';
export type OwnerRole = 'primary' | 'backup';
export type FlagType =
  | 'no_backup'
  | 'stale_owner'
  | 'pii_undisclosed'
  | 'pii_confirmed'
  | 'unsure_pii'
  | 'unsure_business_data'
  | 'unsure_api_keys'
  | 'high_wau_red_tier'
  | 'capacity_exceeded'
  | 'dormancy_attestation'
  | 'manual';
export type FlagSeverity = 'info' | 'warning' | 'critical';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface App {
  id: string;
  name: string;
  problem_statement: string;
  layer: AppLayer;
  category: AppCategory | null;
  target_users: TargetUsers;
  potential_roi: string | null;
  needs_business_data: Tristate;
  handles_pii: Tristate;
  uses_api_keys: Tristate;
  api_key_services: string | null;
  app_url: string | null;
  icon_url: string | null;
  replaces_third_party: boolean;
  replaced_tool_name: string | null;
  replaced_tool_cost: string | null;
  tier: AppTier;
  status: AppStatus;
  last_activity_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AppOwner {
  id: string;
  app_id: string;
  user_id: string;
  owner_role: OwnerRole;
  created_at: string;
}

export interface RiskFlag {
  id: string;
  app_id: string;
  flag_type: FlagType;
  severity: FlagSeverity;
  description: string | null;
  created_by: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface TierHistory {
  id: string;
  app_id: string;
  from_tier: AppTier | null;
  to_tier: AppTier;
  changed_by: string;
  reason: string | null;
  created_at: string;
}

// Joined types for API responses
export interface AppWithOwners extends App {
  app_owners: (AppOwner & { profiles: Profile })[];
}

export interface AppWithDetails extends App {
  app_owners: (AppOwner & { profiles: Profile })[];
  risk_flags: RiskFlag[];
}

export interface ProfileWithCapacity extends Profile {
  capacity_used: number;
  capacity_limit: number;
}

// ── Support Requests ──────────────────────────────────────────

export type SupportRequestType = 'bug_report' | 'feature_request' | 'feedback' | 'question';
export type SupportRequestStatus = 'open' | 'in_progress' | 'completed' | 'wont_do';
export type SupportRequestPriority = 'low' | 'medium' | 'high';

export interface SupportRequest {
  id: string;
  request_type: SupportRequestType;
  subject: string;
  description: string;
  related_app_id: string | null;
  priority: SupportRequestPriority;
  wants_reply: boolean;
  status: SupportRequestStatus;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  submitted_by: string;
  submitted_email: string;
  submitted_name: string | null;
  created_at: string;
  updated_at: string;
}

// For admin inbox — includes FK-joined profile + app data
// Use alias keys (submitter/related_app) to avoid collision if resolved_by join is added later
export interface SupportRequestWithDetails extends SupportRequest {
  submitter: Pick<Profile, 'full_name' | 'email'> | null;  // profiles!submitted_by join
  apps: Pick<App, 'id' | 'name'> | null;                   // related_app_id join
}
