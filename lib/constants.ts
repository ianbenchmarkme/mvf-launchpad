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

export const TIER_TOOLTIPS = {
  red: 'Maker-built, not formally reviewed. Use with caution.',
  amber: 'Reviewed and verified. Suitable for team use.',
  green: 'Fully supported by a product team. Production-grade.',
} as const;

export const STATUS_TOOLTIPS = {
  intent: 'Idea registered — not yet built.',
  developing: 'Currently being built.',
  testing: 'Built and being tested before going live.',
  active: 'Live and in use.',
  archived: 'Retired and no longer available.',
} as const;

export const LAYER_TOOLTIPS = {
  L1: 'Built by or for the Engineering team.',
  L2: 'Built by or for Product & Design.',
  L3: 'Built through the Makers Programme.',
} as const;

export const CATEGORY_LABELS = {
  Marketing: 'Marketing',
  Sales: 'Sales',
  Legal: 'Legal',
  Tech: 'Tech',
  Data: 'Data',
  Productivity: 'Productivity',
  AI: 'AI',
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
