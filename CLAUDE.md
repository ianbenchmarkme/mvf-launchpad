# CLAUDE.md

## Project Overview

MVF Launchpad is an internal app registry and governance platform. Makers (employees who build internal tools with Lovable, Claude Code, etc.) register their tools here. Leadership gets governance visibility via dashboards. The platform uses a traffic-light tier system (Red/Amber/Green) and progressive registration.

**Status (2026-03-27):** Phase 1 complete + Phase 2 progressive registration merged. Login page, theme toggle, animations, light mode fixes on PR branch (`feat/login-page-light-mode-animations`) — awaiting merge. 137 tests, 11 suites, zero TS errors.

## Documentation

| Document | Path | Description |
|----------|------|-------------|
| PRD | `docs/PRD.md` | Full product requirements (v1.0, 2026-03-25) |
| One-Pager | `docs/Launchpad_OnePager.md` | Executive summary |
| TODO | `docs/TODO.md` | What's done and what's planned |
| Progressive Registration Plan | `docs/plans/progressive-registration.md` | Implementation plan (completed) |
| Ingestion Strategy | `docs/plans/2025-02-13-ingestion-strategy-decision.md` | Phase 3 ingestion architecture |

## Key People

- **Ian** — PRD author and builder (admin user, ian@benchmarkme.com)
- **Stakeholders** — Michael Johnson, Tim Kitching

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

**Supabase project:** kdrmssannwwdgtrvzggl

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
    apps/[id]/            # GET/PATCH/DELETE with auth + validation
    apps/[id]/flags/      # Risk flag management (admin + app owners)
    apps/similar/         # pg_trgm fuzzy match for duplicate detection
    flags/[flagId]/       # Resolve individual flags
    profiles/me/          # Current user + computed capacity
    auth/signout/         # Sign out
components/
  app-profile-client.tsx  # App profile with section-based inline editing
  editable-section.tsx    # Generic view/edit toggle wrapper
  fields/
    tristate-field.tsx    # Reusable Yes/No/Unsure button group
  registration-form.tsx   # 4-step animated wizard with per-step validation
  similar-tools-check.tsx # Debounced fuzzy match at registration + edit
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
  validators.ts           # Zod schemas (registration + update), sanitizeUpdatePayload
  field-options.ts        # Shared LAYER_OPTIONS, TARGET_OPTIONS, TRISTATE_OPTIONS
  utils.ts                # cn() helper
  supabase/               # Client wrappers (browser, auth-server, service-role)
  supabase/types.ts       # TypeScript types mirroring DB schema
supabase/
  schema.sql              # Full DB schema (enums, tables, triggers, RLS, indexes)
  functions.sql           # pg_trgm fuzzy search function
  seed.sql                # 3 amnesty apps + admin promotion
  seed-demo.sql           # 8 fictional Green-tier apps for demo
  migration-deletion-requests.sql  # RLS update: app owners can create flags
  migration-pii-confirmed-flag.sql # Add pii_confirmed to flag_type enum
docs/
  PRD.md                  # Full product requirements document
  TODO.md                 # Done / planned feature tracker
  plans/                  # Implementation plans (completed and upcoming)
middleware.ts             # Auth guard (redirect to /login if unauthenticated)
```

## Key Design Decisions

- **Tier system:** Red (Experimental, 0.5 capacity points), Amber (Verified, 1 point), Green (Supported, 0 team-owned)
- **Tier badges:** Lucide icons — FlaskConical (red), ShieldCheck (amber), BadgeCheck (green)
- **Capacity:** 5-point weighted limit per maker, computed not stored, shown in sidebar
- **Registration:** Progressive 4-step wizard. Intent-first, grows with the tool.
- **Progressive editing:** Section-based inline editing on app profile (Identity, Context, Data & Security, Third-Party). One section editable at a time. Component remounts via `key={updated_at}` after save.
- **Risk flags:** Auto-created for "Unsure" PII/data/API responses and "Yes" PII (`pii_confirmed`). Admins resolve. Action required shown in sidebar.
- **Deletion:** Admins can delete directly. Makers must request deletion with reason + active user count.
- **RLS:** Authorization enforced at database level. API routes add explicit auth checks too.
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
| `mvf-pink` | #FF00A5 | Primary CTAs (Register, Next, Submit, Save) |
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

## Development Workflow

All pieces of work follow this mandatory sequence:

1. **Plan** — Claude drafts an implementation plan before writing any code
2. **Plan approval** — User reviews and explicitly approves the plan before work begins
3. **Execute** — Claude implements the approved plan
4. **Create PR** — Claude opens a pull request for review (never merges directly to main)
5. **PR reviewed** — User reviews the PR
6. **Approval** — User approves the PR
7. **Merge** — User merges (or Claude merges on explicit instruction)

> No code is written without an approved plan. No code lands on main without a reviewed PR.

## Testing

137 tests across 11 suites. TDD approach — tests written before implementation.

- `__tests__/lib/` — constants, validators (Zod schema validation + update schema + sanitizer)
- `__tests__/components/` — tier badge, capacity indicator, app card, registration form, auth button, app browse, editable section, app profile client
- `__tests__/api/` — PATCH/DELETE endpoint auth, validation, risk flag creation

Run: `npm run test:run`

## Database Migrations

Run in Supabase SQL Editor in this order:
1. `supabase/schema.sql` — tables, enums, triggers, RLS
2. `supabase/functions.sql` — pg_trgm fuzzy search
3. `supabase/seed.sql` — 3 amnesty apps + admin promotion (after first sign-in)
4. `supabase/seed-demo.sql` — 8 demo Green-tier apps (optional)
5. `supabase/migration-deletion-requests.sql` — RLS update for deletion requests
6. `supabase/migration-pii-confirmed-flag.sql` — Add `pii_confirmed` flag type
