# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MVF Launchpad is an internal platform for managing vibe-coded tools. It provides a Starter Kit (standardized dev environment), an App Library (internal app store with Community/Verified/Supported tiers), and a Support team. The key innovation is an automated ingestion pipeline that brings existing Claude Code-built apps (Next.js + Tailwind + shadcn/ui) into the Launchpad ecosystem by swapping design tokens — no architecture changes needed.

## Key Documentation

- **[`README.md`](README.md)** — Full project context: vision, lifecycle, ingestion strategy, design decisions
- **[`docs/Launchpad_PRD.md`](docs/Launchpad_PRD.md)** — Product requirements document (problem, solution, phases, metrics, governance)
- **[`docs/Launchpad_OnePager.md`](docs/Launchpad_OnePager.md)** — Executive one-pager for stakeholder pitches
- **[`docs/plans/2025-02-13-ingestion-strategy-decision.md`](docs/plans/2025-02-13-ingestion-strategy-decision.md)** — Ingestion strategy decision tree (4 approaches with pros/cons)

Always read the README.md and relevant docs before making product or architecture decisions.

## Development Commands

- **Dev server**: `npm run dev` — Starts Next.js dev server at http://localhost:3000
- **Build**: `npm run build` — Builds for production
- **Start**: `npm start` — Runs production server (requires build first)
- **Lint**: `npm run lint` — Runs ESLint with flat config
- **Lint fix**: `npm run lint:fix` — Auto-fix lint issues
- **Type check**: `npm run type-check` — Runs TypeScript compiler without emitting files

## Project Structure

### Core Directories
- **`/app`** - Next.js App Router with layouts and pages. All routes are file-based (e.g., `app/about/page.tsx` → `/about`)
- **`/components`** - Reusable React components
  - **`/ui`** - shadcn/ui components and custom base UI components
  - Other subdirectories for feature-specific components
- **`/lib`** - Utility functions (`utils.ts` exports `cn()` for merging Tailwind classes)
- **`/public`** - Static files served at root

### Configuration Files
- **`next.config.ts`** - Next.js configuration
- **`tsconfig.json`** - TypeScript config with `@/*` path alias for imports
- **`postcss.config.mjs`** - PostCSS config for Tailwind v4 via `@tailwindcss/postcss`
- **`eslint.config.mjs`** - ESLint 9 flat config with Next.js rules

## Design System & Style Guide

**IMPORTANT**: Always reference and follow the **frontend-design** skill when building new screens and features, and when modifying existing components.

The style guide governs:
- **Colors** - Use semantic color names (e.g., `bg-primary`, `text-destructive`, `bg-sidebar-primary`)
- **Typography** - Follow font stack guidelines (sans, serif, mono)
- **Spacing & Sizing** - Use consistent spacing scale (4px multiples)
- **Shadows** - Apply appropriate elevation levels (sm, md, lg, xl)
- **Components** - Follow button, card, input, and modal guidelines
- **Accessibility** - Ensure WCAG AA compliance (4.5:1 contrast minimum)
- **Dark Mode** - All components must work in both light and dark modes

Invoke the skill with `/frontend-design` before starting any styling work to review current design tokens and best practices.

## Key Patterns

### Styling
- Tailwind v4 with CSS-first configuration via `@theme inline` in `app/globals.css`
- Use Tailwind CSS utility classes with semantic color tokens from the design system
- Use `cn()` helper from `lib/utils.ts` to conditionally merge Tailwind classes
- Global styles in `app/globals.css` (contains all CSS variables for light/dark modes)
- Never use arbitrary colors; always use the defined palette
- Test components in both light and dark modes

### File-based Routing
- Pages: `app/page.tsx` (root), `app/features/page.tsx` (nested routes)
- Layouts: `app/layout.tsx` (root), `app/features/layout.tsx` (nested layouts)
- API routes: `app/api/route.ts`

### Component Structure
- Functional components with TypeScript
- Props passed with explicit types
- UI components in `/components/ui` for reusability

### Imports
- Use `@/*` path alias (e.g., `import { cn } from '@/lib/utils'`)
- Avoid relative imports; use absolute paths with alias

## TypeScript

- Strict mode enabled
- All files are `.ts` or `.tsx` (no `.js`)
- Type definitions for React, Next.js, and Node.js included
- No unused variables or parameters allowed

## Adding shadcn/ui Components

Use the shadcn CLI to add components:
```bash
npx shadcn@latest add [component-name]
```

Components are added to `/components/ui` and can be imported and customized.
