# MVF Launchpad — TODO

Last updated: 2026-03-27

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

### Pending migration

- [ ] **Run `migration-pii-confirmed-flag.sql`** against production Supabase (adds `pii_confirmed` to flag_type enum)

### Next up

- [ ] **Deploy to Vercel** — stakeholders need to access it for demo
- [ ] **Amplitude integration** — usage analytics, WAU tracking per app
- [ ] **Automated risk flags** — stale owner detection, high-WAU Red-tier alerts, capacity exceeded
- [ ] **Dormancy attestation** — auto-flag apps with no activity for 60 days, require owner confirmation
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
5. What triggers dormancy attestation? (Currently: 60 days no activity)
6. Should there be a formal graduation ceremony for Green tier?
7. How do we measure "business-critical" for the North Star metric?

## Technical Debt

- [ ] `middleware.ts` uses deprecated convention — Next.js 16 recommends `proxy` instead
- [ ] Consider extracting `uses_api_keys` field in Security section to use TristateField (currently inline for conditional input handling)
- [ ] Scale icon in TristateField is PII-specific — consider making it a prop for generic use
