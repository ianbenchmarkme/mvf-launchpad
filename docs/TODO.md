# MVF Launchpad — TODO

Last updated: 2026-03-31 (session 4)

---

## Phase 1: Registry MVP — COMPLETE

- [x] Google SSO auth + sign out
- [x] Multi-step registration wizard (4 steps, animated, per-step validation)
- [x] Similar tools fuzzy match (pg_trgm) at registration
- [x] Maker dashboard with app cards
- [x] Sidebar: nav, action required (amber flags), capacity indicator, user profile
- [x] App profile pages (details, owners, risk flags, admin controls)
- [x] Admin: tier change, add/resolve flags, delete apps
- [x] Makers: request deletion with reason + active user count + confirmation
- [x] Governance dashboard (landscape grid by layer×tier, flags, all-apps table)
- [x] Tier badges with Lucide icons (FlaskConical/ShieldCheck/BadgeCheck)
- [x] RLS policies for all tables
- [x] 3 amnesty apps seeded (ArtyFish, Allegros, Partner Portal)
- [x] 8 demo Green-tier apps seeded
- [x] 78 tests (TDD), 8 test suites, zero TS errors

## Phase 2: Adoption & Governance — IN PROGRESS

### Shipped

- [x] **Consumer browse view** (App Library with search + tier/layer filters) — shipped early in Phase 1
- [x] **Progressive registration** (PR #1, merged 2026-03-27)
  - Section-based inline editing on app profile (Identity, Context, Data & Security, Third-Party)
  - PATCH endpoint hardened with Zod validation + owner/admin auth
  - DELETE endpoint hardened with owner/admin auth
  - Auto-create risk flags when tristate fields change to 'unsure'
  - `pii_confirmed` critical flag when PII set to 'yes'
  - Shared TristateField + field options extracted from registration form
  - EditableSection generic view/edit toggle component
  - `key={updated_at}` remount pattern for stale state prevention
  - 137 tests, 11 suites
- [x] **Login page content** — two-panel layout (dark gradient + auth), audience cards, tier blocks
- [x] **Light/dark theme toggle** — Sun/Moon button in sidebar, `next-themes` integration
- [x] **Sidebar pinned bottom** — sticky positioning for Action Required, Capacity, user section
- [x] **Light mode card fix** — semantic CSS tokens only, no `dark:` utilities (Tailwind v4 compatibility)
- [x] **Animations** — Framer Motion: PageTransition (enter + exit), stagger on app cards, AnimatePresence on browse grid, PulseBadge
- [x] **Production deploy** — live at https://mvf-launchpad.vercel.app, Google OAuth working, Vercel auto-deploys on merge to main
- [x] **Run `migration-pii-confirmed-flag.sql`** against production Supabase — done 2026-03-27
- [x] **Automated risk flags + dormancy attestation** (PR #6, merged 2026-03-31)
  - Vercel cron job (`/api/cron/risk-flags`, daily at 00:00 UTC)
  - `stale_owner` — flags apps where primary owner hasn't signed in for 90+ days (skips SQL-seeded users)
  - `capacity_exceeded` — flags newest app when maker's weighted load exceeds 5 points
  - `dormancy_attestation` — flags active/testing apps with no activity for 60+ days (uses `COALESCE(last_activity_at, updated_at)`)
  - All checks idempotent — skip if unresolved flag of same type already exists
  - `POST /api/apps/[id]/confirm-active` — owners self-resolve dormancy flags; updates `last_activity_at`
  - "Confirm active" button on app profile for dormancy flags (owner-facing)
  - `high_wau_red_tier` deferred — stub only until Amplitude integrated
  - `dormancy_attestation` added to `flag_type` enum (migration + schema.sql)
  - 168 tests, 14 suites, zero TS errors
  - **Run `migration-dormancy-attestation.sql`** against production Supabase — done 2026-03-31

- [x] **Governance flags UX** (PR #7, merged 2026-03-31)
  - Two-line flag rows: metadata on row 1, description on row 2
  - `SourceBadge` component — System (Bot icon, mvf-light-blue) vs Admin (User icon, mvf-purple), discriminated by `created_by === null`
  - `isAdmin` gate on Resolve button (viewers no longer see it)
  - `dormancy_attestation` resolved via `confirm-active` endpoint (not generic PATCH), so `last_activity_at` updates and cron won't immediately re-raise
  - 14 new tests — 170 total, 15 suites, zero TS errors

### Next up

- [ ] **Amplitude integration** — usage analytics, WAU tracking per app (unblocks `high_wau_red_tier` cron check)
- [ ] **Slack notifications** — alert admins on new registrations, flag escalations, tier change requests
- [ ] **Status changes by makers** — allow owners to move apps through intent → developing → testing → active
- [ ] **Backup owner management** — add/remove backup owners on app profile

## Phase 3: Ingestion & Scale — PLANNED

- [ ] **Automatic app ingestion** — detect tools from Vercel, GitHub, Lovable via API integrations
- [ ] **Tool health dashboard** — uptime, error rates, deployment frequency
- [ ] **Cost tracking** — API spend per app, infrastructure costs
- [ ] **Graduation criteria automation** — auto-suggest tier upgrades based on maturity signals
- [ ] **Handover readiness scoring** — assess whether an app can survive its maker leaving
- [ ] **Cross-team discovery** — recommend tools from other departments solving similar problems

---

## Open Questions (from PRD)

1. Should amnesty apps enter at Red or Amber?
2. What's the right capacity limit? (Currently 5 points)
3. Should consumers see Red-tier apps in the App Library?
4. How do we handle tools that span multiple layers?
5. ~~What triggers dormancy attestation?~~ Resolved: 60 days no activity (`COALESCE(last_activity_at, updated_at)`)
6. Should there be a formal graduation ceremony for Green tier?
7. How do we measure "business-critical" for the North Star metric?

## Technical Debt

- [ ] `middleware.ts` uses deprecated convention — Next.js 16 recommends `proxy` instead
- [ ] Consider extracting `uses_api_keys` field in Security section to use TristateField (currently inline for conditional input handling)
- [ ] Scale icon in TristateField is PII-specific — consider making it a prop for generic use
- [ ] 29 pre-existing test failures in `app-profile-client`, `app-browse`, `registration-form` suites — unrelated to recent work, needs investigation
