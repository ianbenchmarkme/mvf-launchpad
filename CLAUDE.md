# CLAUDE.md

## Project Overview

MVF Launchpad is an internal app registry and governance platform. Makers (employees who build internal tools with Lovable, Claude Code, etc.) register their tools here. Leadership gets governance visibility via dashboards. The platform uses a traffic-light tier system (Red/Amber/Green) and progressive registration.

**PRD:** `/Users/adriaanhitge/Dropbox/ai-apps/anita/docs/launchpad-prd.md`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme inline` in globals.css) |
| Components | Custom components + Lucide icons |
| Auth | Supabase Auth with Google OAuth |
| Database | Supabase (PostgreSQL) with RLS |
| Hosting | Vercel |
| Testing | Vitest + Testing Library |
| Validation | Zod v4 |

## Development Commands

```bash
npm run dev          # Dev server on localhost:3004
npm run build        # Production build
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run type-check   # TypeScript check
npm run lint         # ESLint
```

**Port:** 3004 (configured in `.env.local` as `NEXT_PUBLIC_SITE_URL`)

## Project Structure

```
app/
  (auth)/login/           # Google SSO login page
  (auth)/auth/callback/   # OAuth callback handler
  (dashboard)/            # Authenticated routes (sidebar shell)
    page.tsx              # Maker dashboard (My Apps)
    browse/               # App Library — search, filter, discover tools
    register/             # Multi-step registration wizard (4 steps)
    apps/[id]/            # App profile (details, owners, flags, admin controls, delete)
    governance/           # Governance dashboard (landscape grid, flags, all-apps table)
  api/
    apps/                 # CRUD + fuzzy search
    apps/[id]/flags/      # Risk flag management (admin + app owners)
    apps/similar/         # pg_trgm fuzzy match for duplicate detection
    flags/[flagId]/       # Resolve individual flags
    profiles/me/          # Current user + computed capacity
    auth/signout/         # Sign out
components/
  registration-form.tsx   # 4-step animated wizard with per-step validation
  similar-tools-check.tsx # Debounced fuzzy match at registration
  app-browse.tsx          # App Library with search + tier/layer filters
  app-card.tsx            # App card with tier accent stripe + badge
  admin-actions.tsx       # Tier change + add flags (admin only)
  risk-flags-list.tsx     # Flags with resolve buttons (app profile)
  governance-flags-list.tsx # Flags with resolve + app links (governance)
  dashboard-shell.tsx     # Sidebar: nav, action required, capacity, user profile
  tier-badge.tsx          # Red/Amber/Green badge with Lucide icons
  capacity-indicator.tsx  # Weighted capacity progress bar (default + sidebar variants)
  delete-app-button.tsx   # Role-based: admin deletes, makers request deletion
  google-sign-in-button.tsx
lib/
  constants.ts            # Tier weights, capacity limit, label maps
  validators.ts           # Zod schemas (registration, etc.)
  utils.ts                # cn() helper
  supabase/               # Client wrappers (browser, auth-server, service-role)
  supabase/types.ts       # TypeScript types mirroring DB schema
supabase/
  schema.sql              # Full DB schema (enums, tables, triggers, RLS, indexes)
  functions.sql           # pg_trgm fuzzy search function
  seed.sql                # 3 amnesty apps + admin promotion
  seed-demo.sql           # 8 fictional Green-tier apps for demo
  migration-deletion-requests.sql  # RLS update: app owners can create flags
middleware.ts             # Auth guard (redirect to /login if unauthenticated)
```

## Key Design Decisions

- **Tier system:** Red (Experimental, 0.5 capacity points), Amber (Verified, 1 point), Green (Supported, 0 team-owned)
- **Tier badges:** Lucide icons — FlaskConical (red), ShieldCheck (amber), BadgeCheck (green)
- **Capacity:** 5-point weighted limit per maker, computed not stored, shown in sidebar
- **Registration:** Progressive 4-step wizard. Intent-first, grows with the tool.
- **Risk flags:** Auto-created for "Unsure" PII/data/API responses. Admins resolve. Action required shown in sidebar.
- **Deletion:** Admins can delete directly. Makers must request deletion with reason + active user count.
- **RLS:** Authorization enforced at database level. API routes are thin wrappers.
- **Route groups:** `(auth)` = no shell, `(dashboard)` = sidebar shell
- **RBAC:** Maker (default), Admin, Viewer roles
- **Shadows:** Custom `.card-shadow` class in globals.css (Tailwind v4's shadow utilities don't work on modern browsers due to @property/@supports initialisation bug)

## Design System

Linear-inspired with MVF brand colours. Key principles:
- **Typography:** Inter, 14px base, -0.02em heading tracking, OpenType features
- **Density:** Compact sidebar (32px nav items), 8px spacing rhythm
- **Borders:** 6px radius controls, 8px cards, rgba opacity borders
- **Transitions:** 150ms everywhere
- **Dark mode:** Japanese-inspired gradient (#0F0F4B → #0B0B38 → #08082A), fixed attachment
- **Cards:** White bg (light) / #08082A (dark), tier accent stripe on left, hover border glow

## MVF Brand Colours

Defined as CSS variables in `globals.css`, mapped to Tailwind via `@theme inline`:

| Name | Hex | Usage |
|------|-----|-------|
| `mvf-pink` | #FF00A5 | Primary CTAs (Register, Next, Submit) |
| `mvf-orange` | #FF5A41 | Accents |
| `mvf-dark-blue` | #0F0F4B | Gradient start, sidebar background |
| `mvf-purple` | #8264C8 | Step indicators, active states, admin controls, hover |
| `mvf-yellow` | #FADC28 | Highlights |
| `mvf-light-grey` | #DCDCDC | Borders, muted backgrounds |
| `mvf-light-blue` | #00C8C8 | Completed steps, capacity bar |
| `mvf-dark-grey` | #64788C | Metadata text |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY     # Supabase service role (server only)
NEXT_PUBLIC_SITE_URL          # http://localhost:3004
```

## Testing

78 tests across 8 suites. TDD approach — tests written before implementation.

- `__tests__/lib/` — constants, validators (Zod schema validation)
- `__tests__/components/` — tier badge, capacity indicator, app card, registration form, auth button, app browse

Run: `npm run test:run`

## Database Migrations

Run in Supabase SQL Editor in this order:
1. `supabase/schema.sql` — tables, enums, triggers, RLS
2. `supabase/functions.sql` — pg_trgm fuzzy search
3. `supabase/seed.sql` — 3 amnesty apps + admin promotion (after first sign-in)
4. `supabase/seed-demo.sql` — 8 demo Green-tier apps (optional)
5. `supabase/migration-deletion-requests.sql` — RLS update for deletion requests
