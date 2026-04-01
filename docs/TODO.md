# MVF Launchpad — TODO

Last updated: 2026-04-01 (session 6)

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

- [x] **Support & Feedback form** (PR #8, merged 2026-03-31)
  - `/support` — 2-step animated wizard (request type, subject, description, app link, priority, wants-reply)
  - `/support/admin` — admin-only inbox with filter bar (status/type/priority), status dropdown, resolution modal
  - Status lifecycle: Open → In Progress → Completed / Won't Do; terminal statuses require a resolution note
  - Email notification to submitter via Resend when status set to Completed or Won't Do (graceful degradation if key missing)
  - `support_requests` table, enums, RLS — `migration-support-requests.sql`
  - Server component scopes app dropdown to current user's owned apps only
  - Silent-failure fix: `updateStatus` throws on `!res.ok`; modal stays open with `toast.error` on failure
  - 254 tests, 19 suites, zero TS errors

- [x] **UX & UI improvements** (PR #10, merged 2026-03-31)
  - Active sidebar nav highlight using `usePathname()` — correct highlight including `/support` vs `/support/admin`
  - App cards: footer shows `LAYER_LABELS[app.layer]` instead of raw category code
  - Grid gap tightened: `gap-8` → `gap-4` for denser layout
  - My Apps dashboard: search bar, improved empty state (icon + CTA), "Also backing" section for backup-owned apps
  - App Library: Register App nudge banner at bottom of results
  - Sidebar: "PRD [temp]" renamed to "Roadmap [Admin]"
  - Capacity indicator: 5 discrete dashes (one per point), inline "Capacity 4 / 5 points" label
  - `MyAppsList` extracted as client component — server page stays pure data-fetching
  - 281 tests, 20 suites, zero TS errors (no regressions)

- [x] **Backup owner management** (PR #9, merged 2026-03-31)
  - `POST /api/apps/[id]/owners` — add backup owner by email (creator + admin only)
  - `DELETE /api/apps/[id]/owners` — remove backup owner by row id (creator + admin only)
  - Guards: 401, 403, 404 (no Launchpad account), 409 (already an owner), 400 (removing primary)
  - Owners section gains inline Manage/Done toggle; remove buttons on backup rows; email add form
  - Optimistic re-fetch after add — no page reload required
  - `isCreator` prop added to `AppProfileClient` (derived server-side)
  - `addOwnerSchema` + `removeOwnerSchema` in `lib/validators.ts`
  - No DB migration needed — schema already had `app_owners` + `owner_role` enum + RLS
  - Fix: lazy-init Resend client in `lib/email.ts` to prevent build crash when `RESEND_API_KEY` absent
  - 281 tests, 20 suites, zero TS errors

- [x] **App URL field** (PR #11, merged 2026-03-31)
  - `app_url` column added to `apps` table (`migration-app-url.sql`)
  - URL shown on app cards and app profile; optional field in registration + Identity section edit

- [x] **Per-app icons** (PR #14, merged 2026-04-01)
  - Icon upload via `POST /api/apps/[id]/icon` — stored in Supabase Storage (`app-icons` bucket)
  - Displayed on app cards (60×60) and app profile Identity section
  - Deferred upload: file staged locally, uploaded on Identity section Save
  - Icon size reduced to 60×60 after PR review (was 72×72)

- [x] **App URL promoted to profile header with inline edit** (PR #17, merged 2026-04-01)
  - URL displayed below app name in header with pencil icon; Edit → input → Save/Cancel
  - Client-side URL format validation (http/https prefix)
  - XSS guard on href rendering

- [x] **Brand Guidelines page** (PR #15, merged 2026-04-01)
  - `/brand-guidelines` — living styleguide for makers building on MVF Launchpad
  - 8 colour swatches (click-to-copy hex + CSS variable), semantic tokens table, typography specimens, button examples, tier badges, spacing/radius scale, tone of voice, Lovable usage notes
  - WIP badge; full light/dark mode support via CSS variable tokens
  - Sidebar link visible to all authenticated users

- [x] **UI polish batch** (PR #16, merged 2026-04-01)
  - Brand Guidelines: flush colour swatches to card corners; consistent swatch card height
  - Sidebar: Admin links (Governance, Support Inbox, Roadmap) separated into labelled "Admin" section; nav icons `--mvf-light-blue`, admin icons `--mvf-yellow`, Action Required label `--mvf-orange`
  - App Library: Register App button pinned to page header; search bar inline with filters (right-aligned, wraps on narrow screens)
  - App cards: more breathing room between name and description
  - App profile: pink Lucide icons inline with all section headings; Problem Statement split into its own card section; App URL promoted to full card with Edit/Save/Cancel; Owners "Manage" button matches Edit style; redundant problem_statement removed from page header
  - 287 tests, 20 suites, zero TS errors

### Next up

- [ ] **Amplitude integration** — usage analytics, WAU tracking per app (unblocks `high_wau_red_tier` cron check)
- [ ] **Slack notifications** — alert admins on new registrations, flag escalations, tier change requests
- [ ] **Status changes by makers** — allow owners to move apps through intent → developing → testing → active

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
- [ ] `uses_api_keys` field in Security section uses inline conditional rendering — consider extracting to TristateField with a prop for the conditional input
