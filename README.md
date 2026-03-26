# MVF Launchpad

**Ship tools fast. Keep them running.**

An internal app registry and governance platform for MVF's vibe-coded tools.

## What It Does

Launchpad gives visibility into what internal tools exist, who built them, what data they touch, and whether they're safe to depend on. It replaces the amnesty spreadsheet with a proper registry.

### For Makers
- Register your tool in 30 seconds (4-step wizard)
- Track your apps and capacity on the dashboard
- Progressive governance — requirements grow with your tool, not upfront

### For Leadership
- Governance dashboard: see all tools by layer and tier
- Risk flags surface issues (PII, stale owners, missing backups)
- Tier system (Red/Amber/Green) communicates support levels

### For Everyone
- Browse and discover internal tools (coming soon)
- Know what's safe to depend on
- Find existing solutions before building duplicates

## Tier System

| Tier | Label | Meaning |
|------|-------|---------|
| Red | Experimental | Early-stage. Maker-supported only. Use at own risk. |
| Amber | Verified | Security reviewed, documented, shared ownership. |
| Green | Supported | Production-ready. Formal support + SLA. |

## Tech Stack

Next.js 16 · Supabase (Postgres + Auth) · Tailwind v4 · Vitest · Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add Supabase credentials
npm run dev                  # http://localhost:3004
```

### Database Setup

1. Create a Supabase project
2. Enable Google OAuth provider
3. Run `supabase/schema.sql` in SQL Editor
4. Run `supabase/functions.sql`
5. Run `supabase/seed.sql` (after first sign-in)

## Status

**Phase 1 complete** — registry MVP with Google SSO, multi-step registration, maker dashboard, governance dashboard, admin controls, risk flag management.

Phase 2 (progressive registration, usage tracking, automated flags, Slack notifications) is next.
