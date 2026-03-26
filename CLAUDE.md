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
  (dashboard)/            # Authenticated routes (sidebar + topbar shell)
    page.tsx              # Maker dashboard (My Apps, Capacity, Action Required)
    register/             # Multi-step registration wizard (4 steps)
    apps/[id]/            # App profile page (details, owners, flags, admin controls)
    governance/           # Governance dashboard (landscape grid, flags, all-apps table)
  api/
    apps/                 # CRUD + fuzzy search
    apps/[id]/flags/      # Risk flag management
    flags/[flagId]/       # Resolve individual flags
    profiles/me/          # Current user + computed capacity
    auth/signout/         # Sign out
components/
  registration-form.tsx   # 4-step animated wizard with per-step validation
  similar-tools-check.tsx # Debounced fuzzy match at registration
  admin-actions.tsx       # Tier change + add flags (admin only)
  risk-flags-list.tsx     # Flags with resolve buttons (app profile)
  governance-flags-list.tsx # Flags with resolve + app links (governance)
  dashboard-shell.tsx     # Sidebar + topbar layout
  app-card.tsx            # App summary card
  tier-badge.tsx          # Red/Amber/Green badge
  capacity-indicator.tsx  # Weighted capacity progress bar
  delete-app-button.tsx   # Delete with governance placeholder message
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
middleware.ts             # Auth guard (redirect to /login if unauthenticated)
```

## Key Design Decisions

- **Tier system:** Red (Experimental, 0.5 capacity points), Amber (Verified, 1 point), Green (Supported, 0 team-owned)
- **Capacity:** 5-point weighted limit per maker, computed not stored
- **Registration:** Progressive 4-step wizard. Intent-first, grows with the tool.
- **Risk flags:** Auto-created for "Unsure" PII/data/API responses. Admins resolve.
- **RLS:** Authorization enforced at database level. API routes are thin wrappers.
- **Route groups:** `(auth)` = no shell, `(dashboard)` = sidebar + topbar
- **RBAC:** Maker (default), Admin, Viewer roles

## MVF Brand Colours

Defined as CSS variables in `globals.css`, mapped to Tailwind via `@theme inline`:

| Name | Hex | Usage |
|------|-----|-------|
| `mvf-pink` | #FF00A5 | Primary CTAs |
| `mvf-orange` | #FF5A41 | Accents |
| `mvf-dark-blue` | #0F0F4B | Dark background, sidebar |
| `mvf-purple` | #8264C8 | Step indicators, active states, admin controls |
| `mvf-yellow` | #FADC28 | Highlights |
| `mvf-light-grey` | #DCDCDC | Borders, muted backgrounds |
| `mvf-light-blue` | #00C8C8 | Completed steps, success |
| `mvf-dark-grey` | #64788C | Card backgrounds (dark mode) |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY     # Supabase service role (server only)
NEXT_PUBLIC_SITE_URL          # http://localhost:3004
```

## Testing

69 tests across 7 suites. TDD approach — tests written before implementation.

- `__tests__/lib/` — constants, validators (Zod schema validation)
- `__tests__/components/` — tier badge, capacity indicator, app card, registration form, auth button

Run: `npm run test:run`
