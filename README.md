# MVF Launchpad

**Ship tools fast. Keep them running.**

An internal app registry and governance platform for MVF's vibe-coded tools.

## What It Does

Launchpad gives visibility into what internal tools exist, who built them, what data they touch, and whether they're safe to depend on.

### For Makers
- Register your tool in 30 seconds (4-step animated wizard)
- Track your apps and capacity in the sidebar
- Request app deletion with reason and active user confirmation
- Similar tools check at registration prevents duplicates

### For Leadership
- Governance dashboard: see all tools by layer and tier in a landscape grid
- Risk flags surface issues (PII, stale owners, missing backups, deletion requests)
- Action required notifications in the sidebar on every page
- Admin controls: change tier, add/resolve flags, delete apps

### For Everyone
- **App Library**: browse, search, and filter all registered tools
- Tier badges (Red/Amber/Green) with icons communicate reliability at a glance
- Know what's safe to depend on before adopting a tool

## Tier System

| Tier | Icon | Label | Meaning |
|------|------|-------|---------|
| Red | FlaskConical | Experimental | Early-stage. Maker-supported only. Use at own risk. |
| Amber | ShieldCheck | Verified | Security reviewed, documented, shared ownership. |
| Green | BadgeCheck | Supported | Production-ready. Formal support + SLA. |

## Tech Stack

Next.js 16 · Supabase (Postgres + Auth + RLS) · Tailwind v4 · Vitest · Zod v4 · Lucide · Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add Supabase credentials
npm run dev                  # http://localhost:3004
```

### Database Setup

Run in Supabase SQL Editor in order:
1. `supabase/schema.sql` — tables, enums, triggers, RLS, indexes
2. `supabase/functions.sql` — pg_trgm fuzzy search
3. Enable Google OAuth in Supabase Auth settings
4. Sign in via Google SSO
5. `supabase/seed.sql` — promotes first user to admin, seeds 3 amnesty apps
6. `supabase/seed-demo.sql` — 8 fictional Green-tier apps (optional, for demo)
7. `supabase/migration-deletion-requests.sql` — allows app owners to request deletion

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY     # Supabase service role key (server only)
NEXT_PUBLIC_SITE_URL          # http://localhost:3004
```

## Features

| Feature | Status |
|---------|--------|
| Google SSO authentication | Done |
| 4-step animated registration wizard | Done |
| Similar tools fuzzy match at registration | Done |
| App Library with search + tier/layer filters | Done |
| Maker dashboard with app cards | Done |
| Capacity indicator in sidebar (weighted by tier) | Done |
| Action required notifications in sidebar | Done |
| App profile pages (details, owners, flags) | Done |
| Admin controls (tier change, add/resolve flags) | Done |
| Role-based deletion (admin deletes, makers request) | Done |
| Governance dashboard (landscape grid, flags, all-apps) | Done |
| Sign out | Done |
| 78 passing tests (TDD) | Done |

## Design

Linear-inspired UI with MVF brand colours:
- Japanese-inspired dark gradient background (#0F0F4B → #0B0B38 → #08082A)
- Compact sidebar with nav, action required, capacity, and user profile
- Cards with tier accent stripes and hover effects
- Pink CTAs, purple active states, light-blue success indicators
- 14px base font, Inter with OpenType features, 150ms transitions

## Status

**Phase 1 complete** with Phase 2 consumer browse view shipped early.

Next: progressive registration, Amplitude usage tracking, automated risk flags, dormancy attestation, Slack notifications.
