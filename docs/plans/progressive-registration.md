# Progressive Registration — Implementation Plan

## Context

MVF Launchpad is an internal app registry where makers register tools via a 4-step wizard. After registration, makers **cannot edit** their app entries — they're frozen at whatever they entered during registration. This is the #1 gap before the product is demo-ready: makers need to update fields as their app progresses (add details, correct mistakes, change status).

**Goal:** Allow owners to edit all registration fields inline on the app profile page, with proper validation, authorization, and risk flag handling.

**Stack:** Next.js 16 + Supabase + Tailwind v4 + Zod v4 + Vitest

---

## Design: Section-Based Inline Editing

Inline edit mode on the existing profile page, grouped by section (matching the registration wizard steps). Click "Edit" on a section -> fields become editable -> Save/Cancel per section.

**Why not reuse the wizard?** The 4-step wizard is tightly coupled to its flow (animations, step validation, progress indicator). Section-based editing keeps context, is faster for single-field corrections, and follows the Linear pattern already used in the app.

**Sections:**
1. **Identity** — name, problem_statement (+ SimilarToolsCheck on name change)
2. **Context** — layer, target_users, potential_roi
3. **Data & Security** — needs_business_data, handles_pii, uses_api_keys, api_key_services
4. **Third-Party** — replaces_third_party, replaced_tool_name, replaced_tool_cost

Tier and status remain admin-only (via existing AdminActions component).

---

## Implementation Sequence

### Step 1: Update Schema (`lib/validators.ts`)

Add `updateAppSchema` — a partial version of the registration schema where all fields are optional but individually validated. Protected fields (`tier`, `status`, `id`, `created_by`, `created_at`, `updated_at`) are stripped.

Refactor: extract `baseAppFields` from the existing `registrationSchema` so both schemas share the same field definitions. The conditional `.check()` refinements (api_key_services required when uses_api_keys === 'yes') apply only when both related fields are present in the payload.

**Tests first** in `__tests__/lib/validators.test.ts`:
- Accepts partial payloads (e.g. `{ name: 'New Name' }`)
- Rejects invalid partials (e.g. `{ name: 'A' }`)
- Conditional validation fires only when related fields both present
- Strips protected fields

### Step 2: Harden PATCH + DELETE Endpoints (`app/api/apps/[id]/route.ts`)

Current state: both PATCH and DELETE pass through with zero validation and no auth check beyond "is logged in". Any authenticated user can update or archive any app.

**PATCH — new flow:**
1. Parse + validate with `updateAppSchema.safeParse(body)` -> 400 on failure
2. Explicit auth: fetch user profile role + check `app_owners` -> 403 if neither owner nor admin
3. Strip `tier`/`status` from payload if user is not admin
4. Fetch current app state (for risk flag diff)
5. `.update(validatedData)` on Supabase
6. If `handles_pii`, `needs_business_data`, or `uses_api_keys` changed TO 'unsure', auto-create risk flags (mirrors POST logic in `app/api/apps/route.ts` lines 92-123)
7. If `handles_pii` changed TO 'yes', also create a `pii_confirmed` risk flag with severity 'critical' and description noting legal notification needed — this closes the gap where the registration form says "Legal will be notified automatically" but no flag is created
8. Return updated app

**DELETE — add auth check:**
1. Explicit auth: fetch user profile role + check `app_owners` -> 403 if neither owner nor admin
2. Existing soft-delete logic (`update({ status: 'archived' })`) stays unchanged

**Note on risk flag inserts:** `createAuthServerClient` uses the anon key + user JWT (RLS enforced). The `migration-deletion-requests.sql` already added an owner insert policy for risk_flags, so owners CAN insert flags for their own apps. No new RLS migration needed.

**Tests** in `__tests__/api/apps-patch.test.ts`:
- Valid update -> 200
- Invalid payload -> 400
- Non-owner/non-admin -> 403
- Owner cannot update tier/status (silently stripped)
- Admin can update tier/status
- 'unsure' field change creates risk flag
- `handles_pii === 'yes'` creates a `pii_confirmed` flag
- DELETE by non-owner/non-admin -> 403
- DELETE by owner -> 200 (archives)

### Step 3: Extract Shared Field Components

**New:** `components/fields/tristate-field.tsx` — extract TristateField from registration-form.tsx
**New:** `lib/field-options.ts` — extract LAYER_OPTIONS, TARGET_OPTIONS, TRISTATE_OPTIONS
**Modify:** `components/registration-form.tsx` — import from new shared locations (no behavior change)

### Step 4: Build EditableSection Component

**New:** `components/editable-section.tsx`

Generic wrapper that toggles between read/edit mode:
- View mode: read content + pencil "Edit" button (hidden if `!canEdit`)
- Edit mode: form fields + Save/Cancel footer (mvf-pink Save, ghost Cancel)
- 150ms transitions, 8px spacing rhythm
- **No shadow-\* utilities** — use the project's `.card-shadow` class if elevation is needed (Tailwind v4 shadow utilities are broken on modern browsers in this project)

**Tests** in `__tests__/components/editable-section.test.tsx`

### Step 5: Build App Profile Client Wrapper

**New:** `components/app-profile-client.tsx`

Client component that receives server-fetched data and manages:
- Which section is currently being edited (max one at a time)
- Form state per section (initialized from app data)
- Per-field validation errors
- PATCH call on save -> `router.refresh()` on success
- SimilarToolsCheck shown when name changes in Identity section (pass only `name` as query, not `name || problemStatement` as the registration form does)

Props: `{ app, owners, flags, isAdmin, isOwner, currentUserId }`

**Tests** in `__tests__/components/app-profile-client.test.tsx`

### Step 6: Update Server Page (`app/(dashboard)/apps/[id]/page.tsx`)

Becomes a thin server wrapper:
- Keeps existing data fetching
- Computes `isOwner` from owners list + current user ID
- Renders `<AppProfileClient>` with all props
- Admin controls (AdminActions) and danger zone (DeleteAppButton) stay as-is

### ~~Step 7: RLS Policy Update~~ — NOT NEEDED

Verified: `migration-deletion-requests.sql` already replaced the admin-only `risk_flags_insert` policy with one that allows both admins AND app owners to insert flags. This migration has been applied in production. The base `schema.sql` still shows the old admin-only policy, but the migration overrides it. **Update `schema.sql` to reflect the current production state** (replace the admin-only insert policy with the owner+admin version) so the schema file stays authoritative.

---

## Critical Files

| File | Action |
|------|--------|
| `lib/validators.ts` | Modify — add updateAppSchema, extract baseAppFields |
| `app/api/apps/[id]/route.ts` | Modify — PATCH validation/auth/risk flags + DELETE auth |
| `app/(dashboard)/apps/[id]/page.tsx` | Modify — pass data to client wrapper |
| `components/registration-form.tsx` | Modify — import from shared locations |
| `components/app-profile-client.tsx` | **Create** — client wrapper with edit state |
| `components/editable-section.tsx` | **Create** — generic view/edit section toggle |
| `components/fields/tristate-field.tsx` | **Create** — extracted shared component |
| `lib/field-options.ts` | **Create** — shared option arrays |
| `supabase/schema.sql` | Modify — sync risk_flags insert policy to match production (owner+admin) |
| `__tests__/lib/validators.test.ts` | Modify — add updateAppSchema tests |
| `__tests__/api/apps-patch.test.ts` | **Create** — PATCH endpoint tests |
| `__tests__/components/editable-section.test.ts` | **Create** |
| `__tests__/components/app-profile-client.test.ts` | **Create** |

---

## Edge Cases

- **Concurrent edits:** Last write wins per-field (acceptable — Supabase does column-level updates)
- **Name uniqueness:** SimilarToolsCheck is advisory only, no hard constraint
- **Stale data:** `router.refresh()` after save re-fetches from server
- **Admin vs owner permissions:** Admins can edit everything including tier/status; owners can edit registration fields only

---

## Verification

1. `npm run test` — all existing + new tests pass
2. `npm run build` — zero TS errors
3. Manual test on localhost:3004:
   - Sign in as owner -> navigate to app profile -> Edit button visible on each section
   - Edit name -> SimilarToolsCheck appears -> Save -> name updated
   - Edit data field to 'unsure' -> Save -> new risk flag created
   - Sign in as non-owner -> no Edit buttons visible
   - Sign in as admin -> can edit tier/status via AdminActions + all sections
4. Playwright browser test if available
