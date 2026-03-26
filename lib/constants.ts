export const TIER_WEIGHTS = {
  red: 0.5,
  amber: 1,
  green: 0,
} as const;

export const CAPACITY_LIMIT = 5;

export const TIER_LABELS = {
  red: 'Experimental',
  amber: 'Verified',
  green: 'Supported',
} as const;

export const LAYER_LABELS = {
  L1: 'Engineering',
  L2: 'Product & Design',
  L3: 'Makers Programme',
} as const;

export const TARGET_USERS_LABELS = {
  my_team: 'My Team',
  department: 'Department',
  org_wide: 'Organisation-wide',
} as const;

export const STATUS_LABELS = {
  intent: 'Intent',
  developing: 'Developing',
  testing: 'Testing',
  active: 'Active',
  archived: 'Archived',
} as const;
