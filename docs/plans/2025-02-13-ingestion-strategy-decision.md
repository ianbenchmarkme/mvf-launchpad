# App Ingestion Strategy — Decision Document

**Status:** Draft — For Peer Review
**Date:** 2025-02-13
**Context:** How should vibe-coded apps be transformed when graduating into the Launchpad app store?

---

## The Core Question

When a vibe-coded tool proves its worth and graduates into Launchpad, what happens to its code? Specifically: how do we make it look, feel, and behave like a native Launchpad app — without rewriting it?

### Constraints
- Apps are built with Claude Code on compatible stacks (Next.js, React, Tailwind, shadcn/ui, Supabase)
- All graduated apps must share one consistent style guide (look and feel as one ecosystem)
- The app's internal architecture must NOT be changed
- The process should **reduce** technical debt over time, not create it
- Maintainability is the top priority

---

## Decision Tree

```
App graduates into Launchpad
│
├─ Is it built on Next.js + Tailwind + shadcn/ui?
│  │
│  ├─ YES ──────────────────────────────────────────────┐
│  │                                                     │
│  │  Can an automated agent swap the design tokens?     │
│  │  │                                                  │
│  │  ├─ YES → APPROACH A: Automated Token Replacement   │
│  │  │        (Agent replaces globals.css, validates     │
│  │  │         build, deploys to subdomain)              │
│  │  │                                                  │
│  │  └─ NO (custom CSS, non-standard patterns)          │
│  │       → APPROACH B: Assisted Migration              │
│  │         (Agent does what it can, flags manual        │
│  │          fixes, Support team assists)                │
│  │                                                     │
│  └─ NO (Vue, Svelte, plain HTML, etc.) ───────────────┘
│     │
│     ├─ Is it worth rebuilding?
│     │  │
│     │  ├─ YES (high value, active users)
│     │  │   → APPROACH C: Guided Rebuild
│     │  │     (Agent scaffolds new Launchpad app,
│     │  │      migrates business logic, Support assists)
│     │  │
│     │  └─ NO (niche, low user count)
│     │      → APPROACH D: Wrapper Only
│     │        (Reverse proxy behind subdomain,
│     │         Launchpad nav injected via edge middleware,
│     │         no code changes — legacy path only)
│     │
│     └─ [Future] Could agent auto-convert?
│        (Out of scope for now, but possible with
│         Claude Code framework-to-framework migration)
```

---

## The Four Approaches

### Approach A: Automated Token Replacement (Recommended Default)

**What happens:** A Claude Code agent/skill runs against the app's repo at the point of ingestion and performs a deterministic set of transformations:

1. **Replace `globals.css`** — Swap the app's CSS variables with the Launchpad design token file (your current `globals.css` is already structured for this — semantic tokens like `--primary`, `--background`, `--card`, etc.)
2. **Validate shadcn/ui components** — Check that the app uses standard shadcn/ui components. Flag any custom overrides that may conflict.
3. **Inject Launchpad layout wrapper** — Add the shared Launchpad header/nav as a layout component (back to app store, user menu, SSO context)
4. **Font alignment** — Ensure the app uses the Launchpad font stack (Inter + system fallbacks)
5. **Build validation** — Run `npm run build` + `npm run lint` to confirm nothing broke
6. **Deploy to subdomain** — `tool-name.launchpad.company.com`

**Why this works for your stack:** Because both Launchpad and the ingested apps use the same architecture (Tailwind CSS variables → `@theme inline` → shadcn/ui components), swapping the token file cascades through the entire UI automatically. No component code changes needed. shadcn/ui components already read from CSS variables — change the variables, the whole app transforms.

```
┌─────────────────────────────────────────────────┐
│  Ingested App (before)         Launchpad (after) │
│                                                  │
│  globals.css (custom tokens) → globals.css (LP)  │
│  shadcn Button (reads --primary) → same Button   │
│  shadcn Card (reads --card)    → same Card       │
│  Custom components using       → same components │
│    Tailwind utilities             new colors      │
│                                                  │
│  Result: Entire UI updates automatically         │
└─────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Fully automated — no manual work | Only works for Next.js + Tailwind + shadcn stack |
| Zero architecture changes to the app | Custom CSS (outside Tailwind) won't transform |
| Deterministic and repeatable | Hardcoded color values (e.g., `text-red-500` instead of `text-destructive`) will be missed |
| Reduces tech debt (standardizes tokens) | Apps using Tailwind v3 config need migration to v4 first |
| Build validation catches breakage before deploy | Edge cases in complex layouts may need manual review |
| Can be re-run when design tokens update | — |
| Claude Code agent can do this in minutes | — |

**Effort:** Low (agent-automated, ~15 min per app)
**Risk:** Low (build validation catches issues, easy to rollback)
**Maintainability impact:** High positive (standardized tokens = any engineer can update the design system globally)

---

### Approach B: Assisted Migration

**What happens:** Same as Approach A, but for apps where the automated agent hits issues it can't resolve automatically.

1. Agent runs the same token replacement and validation steps
2. Agent generates a **migration report** listing:
   - Hardcoded colors found (e.g., `bg-blue-500` instead of semantic tokens)
   - Custom CSS files outside the design system
   - Non-standard component patterns
   - shadcn/ui version mismatches
3. Support team reviews the report and works with the maker to resolve flagged items
4. Agent re-runs until clean

| Pros | Cons |
|------|------|
| Handles edge cases that full automation misses | Requires human involvement (Support team time) |
| Migration report gives clear, actionable items | Slower — days instead of minutes |
| Teaches makers Launchpad conventions | Creates a queue/backlog for Support |
| Still reduces tech debt (fixes non-standard patterns) | Maker may push back on changing "their" code |
| Progressive — can ship partially and iterate | — |

**Effort:** Medium (hours to days, depends on app complexity)
**Risk:** Low-Medium (human review catches what automation misses)
**Maintainability impact:** High positive (cleans up non-standard patterns)

---

### Approach C: Guided Rebuild

**What happens:** For apps on incompatible stacks (Vue, Svelte, plain HTML), a Claude Code agent scaffolds a fresh Launchpad app and helps migrate the business logic.

1. Agent analyzes the existing app's functionality (routes, API calls, data models)
2. Scaffolds a new Next.js + Tailwind + shadcn app with Launchpad conventions
3. Migrates business logic, API integrations, and data layer
4. Maker validates functionality
5. Old app is retired, new app deploys to subdomain

| Pros | Cons |
|------|------|
| Results in a fully native Launchpad app | Most expensive approach — significant effort |
| Maximum maintainability | Risk of functionality regression |
| Any engineer can maintain it | Maker loses ownership/familiarity with codebase |
| Clean codebase, no legacy debt | Time-intensive even with agent assistance |
| — | May discourage makers from graduating tools |

**Effort:** High (days to weeks, depending on complexity)
**Risk:** Medium-High (regression risk, maker friction)
**Maintainability impact:** Highest positive (completely native)

---

### Approach D: Wrapper Only (Legacy/Escape Hatch)

**What happens:** The app is deployed as-is behind a Launchpad subdomain. A reverse proxy or edge middleware injects a minimal Launchpad navigation bar. No code changes to the app itself.

1. App deploys to its subdomain
2. Edge middleware (e.g., Vercel middleware or Nginx) injects Launchpad header
3. SSO authentication handled at the proxy layer
4. App's internal styling is untouched

| Pros | Cons |
|------|------|
| Zero effort — deploy immediately | Visual inconsistency (different styling from ecosystem) |
| No risk of breaking the app | Creates technical debt (another pattern to maintain) |
| Works for ANY stack | Injected header may conflict with app's own nav |
| Good for "buy time" while planning proper migration | Employees notice the inconsistency — breaks trust |
| — | Two styling systems to maintain per app |
| — | No path to reducing debt — it accumulates |
| — | Contradicts the "one ecosystem" goal |

**Effort:** Very Low (hours)
**Risk:** Very Low (no code changes)
**Maintainability impact:** Negative (adds debt, doesn't reduce it)

---

## Comparison Matrix

| Criteria | A: Auto Token | B: Assisted | C: Rebuild | D: Wrapper |
|----------|:---:|:---:|:---:|:---:|
| **Visual consistency** | Full | Full | Full | Partial |
| **Architecture preserved** | Yes | Yes | No (new app) | Yes |
| **Automation potential** | 100% | ~70% | ~40% | 100% |
| **Effort per app** | ~15 min | Hours-Days | Days-Weeks | ~1 hour |
| **Reduces tech debt** | Yes | Yes | Yes (most) | No (adds it) |
| **Maintainability gain** | High | High | Highest | None |
| **Maker friction** | None | Low | High | None |
| **Works for non-Next.js** | No | No | Yes | Yes |
| **Scalable to 100+ apps** | Yes | Somewhat | No | Yes |
| **Design system updates cascade** | Yes | Yes | Yes | No |

---

## Recommended Strategy

### Default path: Approach A (Automated Token Replacement)

For the 80%+ of apps that are already built on Next.js + Tailwind + shadcn/ui (which is the case since teams are using Claude Code with this stack), this is the clear winner:

- **Zero architecture changes** — the app's code stays the same
- **Full visual consistency** — CSS variable swap cascades through all shadcn/ui components
- **Fully automatable** — a Claude Code skill/agent can do this in minutes
- **Reduces tech debt** — standardizes the token layer across all apps
- **Design system updates propagate** — update Launchpad tokens once, all apps inherit

### Fallback path: A → B escalation

When the automated agent hits issues (hardcoded colors, custom CSS), it escalates to Approach B automatically. The migration report tells Support exactly what needs fixing. Over time, as the agent learns common patterns, more of B gets automated into A.

### Escape hatch: Approach D (Wrapper Only)

Only for non-Next.js apps that are too valuable to ignore but not worth rebuilding yet. This is explicitly a **temporary state** with a migration deadline. Apps in this state get a visible "Legacy" badge in the App Library.

### Reserved: Approach C (Guided Rebuild)

Only for high-value, business-critical apps on incompatible stacks where the business sponsor agrees the rebuild is worth the investment.

---

## The Ingestion Agent — What It Does

At the point of ingestion, a Claude Code agent/skill runs this automated pipeline:

```
┌─────────────────────────────────────────────────────────┐
│                   INGESTION PIPELINE                     │
│                                                          │
│  1. SCAN                                                 │
│     ├─ Detect stack (Next.js version, Tailwind version,  │
│     │  shadcn/ui presence, CSS variable structure)        │
│     ├─ Identify auth pattern (Supabase, NextAuth, etc.)  │
│     └─ Map to ingestion approach (A, B, C, or D)         │
│                                                          │
│  2. TRANSFORM (Approach A)                               │
│     ├─ Replace globals.css with Launchpad design tokens  │
│     ├─ Align font configuration                          │
│     ├─ Inject Launchpad layout wrapper (nav, user menu)  │
│     ├─ Add SSO integration layer                         │
│     └─ Add monitoring/analytics hooks                    │
│                                                          │
│  3. VALIDATE                                             │
│     ├─ npm run build (must pass)                         │
│     ├─ npm run lint (must pass)                          │
│     ├─ Visual regression check (screenshot comparison)   │
│     └─ Auth flow verification                            │
│                                                          │
│  4. REPORT                                               │
│     ├─ GREEN: All clear → auto-deploy to subdomain       │
│     ├─ YELLOW: Minor issues → deploy + flag for review   │
│     └─ RED: Breaking issues → escalate to Approach B     │
│                                                          │
│  5. DEPLOY                                               │
│     ├─ Deploy to tool-name.launchpad.company.com         │
│     ├─ Register in App Library (Verified tier)           │
│     └─ Notify maker + stakeholders                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## How This Maps to the Tier System

| Stage | Tier | What Happened |
|-------|------|---------------|
| Maker registers idea/MVP | **Community** | Lightweight form submitted. App lives on Lovable/Vercel/wherever. Tech/legal aware. |
| App gains traction, flagged for graduation | *Transition* | Ingestion pipeline triggered (Approach A/B/C/D selected) |
| App passes ingestion + deployed to Launchpad | **Verified** | Hosted on Launchpad subdomain. Design tokens aligned. SSO integrated. Monitored. |
| Backup owner assigned, SLA agreed, runbooks written | **Supported** | Full production support. Green badge. Safe for critical workflows. |

---

## Key Insight: Why This Stack Choice Makes It Possible

The reason Approach A is viable — and why this whole strategy works — is the architectural decision to standardize on **Tailwind CSS variables + shadcn/ui**.

shadcn/ui components don't contain hardcoded styles. They read from CSS variables:
- A `Button` with `bg-primary` reads from `--primary`
- A `Card` with `bg-card` reads from `--card`
- All colors, radii, shadows flow from the token file

This means: **swap the token file, transform the entire app.** No component surgery needed.

This is not an accident — it's why the Starter Kit uses this stack. The ingestion strategy and the Starter Kit are two sides of the same coin.

---

## Open Questions for Discussion

1. **Tailwind v3 → v4 migration:** Some existing apps may be on Tailwind v3 (config-based) instead of v4 (CSS-first). Should the ingestion agent handle this migration, or is it a prerequisite?

2. **Custom components:** What if an app has custom components that don't use shadcn/ui? They'll keep their original styling. Acceptable, or must everything conform?

3. **Supabase auth vs. Launchpad SSO:** Apps on Supabase auth need to switch to Launchpad's SSO. How deep does the agent go here? Just add the SSO layer and keep Supabase for data, or fully migrate auth?

4. **Design token versioning:** When the Launchpad design system updates, do all graduated apps auto-update? Or do they pin to a version?

5. **Rollback plan:** If ingestion breaks something subtle that validation missed, what's the rollback? Keep the original deployment running in parallel for 30 days?

6. **Who owns the code post-ingestion?** Does it stay in the maker's repo, or move to a Launchpad org repo?

---

*This document is intended for peer review and stakeholder discussion. Each approach has a clear use case — the recommendation is to lead with Approach A (automated) and escalate when needed.*
