I h# MVF Launchpad

## Product Requirements Document

**Ship tools fast. Keep them running.**

| Field | Value |
|-------|-------|
| **Version** | 1.1 — Updated |
| **Date** | 31 March 2026 |
| **Author** | Ian Hitge |
| **Status** | Live — Phase 2 in progress |
| **Stakeholders** | Michael Johnson |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Context: AI Engineering Acceleration](#2-context-ai-engineering-acceleration)
3. [Problem Statement](#3-problem-statement)
4. [Design Principles](#4-design-principles)
5. [Solution: The Launchpad Platform](#5-solution-the-launchpad-platform)
6. [User Personas](#6-user-personas)
7. [Views and Features](#7-views-and-features)
8. [Data Classification](#8-data-classification)
9. [Security and Compliance](#9-security-and-compliance)
10. [Phasing](#10-phasing)
11. [Success Metrics](#11-success-metrics)
12. [Technical Architecture](#12-technical-architecture)
13. [Future Scope](#13-future-scope)
14. [Open Questions](#14-open-questions)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

The proliferation of "vibe coded" internal tools — built primarily through Lovable and Claude Code — has created both an opportunity and a challenge for MVF. These tools demonstrate employee initiative and solve real business problems, but they also introduce risks around sustainability, security, and operational continuity.

**Launchpad** is a centralised app registry and governance platform for all internally-built tools across MVF's three delivery layers. It provides visibility into what exists, who owns it, how much it is used, and whether it handles sensitive data.

The platform will not act as a gatekeeper. Instead, it will make compliance the path of least resistance by providing a clear registration process, progressive governance that scales with a tool's maturity, and natural pathways for successful tools to transition from experimental to production-grade.

### Key Outcomes

- **Preserve innovation velocity:** Anyone can build and deploy tools without approval gates
- **Enable visibility:** Know what tools exist, who built them, what data they touch, and what problem they solve
- **Ensure operational sustainability:** Business-critical tools have clear ownership and support
- **Improve security posture:** Surface API key usage, PII handling, and data flows early — before they become incidents
- **Reduce duplication:** Help makers discover existing tools before building something that already exists
- **Reduce waste:** Surface tools that replace paid third-party software, quantifying ROI

### What This Is Not

- A new approval process
- IT telling people what they can build
- Mandatory anything (in Phase 1)
- A way to slow anyone down
- Another governance committee

---

## 2. Context: AI Engineering Acceleration

Launchpad sits within MVF's broader AI Engineering Acceleration programme. Phase 1 of that programme proved that agentic AI tools dramatically reduce cycle times for bug fixes, small features, and test generation. Phase 2 addresses the organisational question: how do we restructure our ways of working to exploit this capability at scale?

### Three Layers of AI-Enabled Delivery

MVF's delivery model recognises three distinct layers, each with different levels of autonomy, governance, and tooling. Launchpad serves all three.

| | Layer 1: Engineering | Layer 2: Product and Design | Layer 3: Makers Programme |
|---|---|---|---|
| **Who** | Engineers in pairs or small teams | Product managers, designers, CRO specialists | Assessed business users from across the organisation |
| **Tools** | Claude Code (agentic terminal-based AI) | Lovable, Claude Code, Google AI Studio | Lovable (MVF workspace only) |
| **Scope** | Core systems, production, strategic Rocks, anything touching PII or integrations | Internal tools, CRO experiments, prototypes, data dashboards | Team-level tools, workflow improvements, automations |
| **Autonomy** | High | Medium | Structured (prescribed tools, budget, mentor) |
| **Governance** | Full engineering standards | Launchpad registration, no PII without approval, read-only API access | Strongest guardrails: prescribed infra, security review before go-live, allocated budget |

### Graduation Between Layers

Tools move between layers as their criticality grows:

| Trigger | From | To |
|---------|------|-----|
| Used by 10+ people regularly | Layer 3 (Makers) | Layer 2 (Product/Design ownership) |
| Business-critical or revenue-generating | Layer 2 (Product/Design) | Layer 1 (Engineering ownership) |
| Handles PII or integrates with core systems | Any layer | Layer 1 (Engineering ownership) |
| Context window degradation or technical limits | Layer 2 or 3 | Layer 1 (for rebuild on stable architecture) |

On graduation, the application receives UX attention for accessibility and usability, is migrated to stable engineering architecture, and enters the standard deployment and monitoring pipeline.

### Why Launchpad Is Needed

Without a centralised registry, we have no visibility into:
- What tools exist across all three layers
- Who owns them and whether there is backup coverage
- What data they access, store, or transmit
- Whether they duplicate existing solutions
- What happens when a maker goes on holiday, changes role, or leaves

Launchpad is the governance backbone that makes the three-layer model sustainable.

---

## 3. Problem Statement

Across MVF, employees are increasingly using AI-assisted development to build internal tools that solve real business problems. This is a positive development — it demonstrates initiative, domain expertise, and a bias toward action.

However, these tools are being built in isolation, without consideration for long-term sustainability. The result is a growing landscape of useful but fragile applications that create operational risk.

### 3.1 Support Continuity Gap

When makers go on holiday, change roles, or leave the company, their tools become unsupportable. Other engineers cannot easily step in because each tool uses different technologies, architectures, and deployment methods. Business processes that depend on these tools become fragile.

### 3.2 Technology Fragmentation

Tools are being built on Next.js, Vite, Create React App, Vue, Svelte, and various other frameworks. Some run on personal machines, others on random cloud instances or personal Supabase accounts. This diversity makes it nearly impossible to maintain a security baseline, apply updates consistently, or train support staff.

### 3.3 Security and Compliance Blind Spots

Most vibe-coded tools bypass standard security review processes. They may store sensitive data without encryption, lack proper authentication, expose API keys in client-side code, or connect to external services without appropriate controls. We have had incidents of API keys being exposed. We do not have visibility into what data flows through these applications.

### 3.4 Brand Inconsistency

Internal tools present inconsistent user experiences. Each maker makes their own design decisions, resulting in a fragmented internal product ecosystem that does not feel cohesive.

### 3.5 Duplication of Effort

Without visibility into what tools exist, multiple teams may build similar solutions to the same problems. There is no easy way to discover existing tools or share successful solutions across the organisation. In some cases, a specific problem has already been solved but there is no visibility of the tool.

### What We Must Not Do

It would be easy to solve these problems by creating approval gates, mandatory review processes, or restricting who can build tools. **This would be the wrong approach.** The vibe coding trend represents genuine employee empowerment. People are solving their own problems rather than waiting for IT to prioritise their requests. This initiative should be celebrated and enabled, not stifled.

---

## 4. Design Principles

1. **Enable by default, restrict by exception.** Anyone can register and build tools without approval. Restrictions apply only when data classification or usage thresholds demand it.

2. **Compliance as the path of least resistance.** Make doing the right thing easier than doing the wrong thing. Registration should take 30 seconds, not 30 minutes.

3. **Progressive governance.** Governance scales with the tool's maturity and criticality. A side project for your team has minimal requirements. A tool the department depends on has more. This is proportional, not punitive.

4. **Transparency over control.** Make risks visible rather than blocking activity. Surface issues (stale ownership, PII without approval, missing backups) so conversations happen naturally.

5. **Incentivise rather than mandate.** Make the benefits of participation clear: visibility, support, credibility, graduation path. Do not mandate registration in Phase 1 — earn adoption through value.

6. **No gatekeeping.** The Support function exists to help makers succeed, not to approve or reject their ideas.

---

## 5. Solution: The Launchpad Platform

Launchpad has four interconnected components that work together to enable sustainable innovation.

### 5.1 App Registry

The App Registry is the core of Launchpad — a centralised database of all internally-built tools with progressive registration that grows alongside each tool.

#### Registration Flow

Registration is **intent-first** and **progressive**. Makers never face a wall of fields. They start with a lightweight intent declaration, then update their entry as the tool takes shape.

**Phase 1: Intent Declaration (before building — 30 seconds)**

| Field | Type | Purpose |
|-------|------|---------|
| App name | Text | What the tool is called |
| Problem statement | Text | What problem are you trying to solve? |
| Layer | Select (L1/L2/L3) | Which delivery layer does this belong to? |
| Target users | Select (my team / department / org-wide) | Who will use this? |
| Potential ROI | Text | Time saved, revenue impact, efficiency gain |
| Needs business data? | Select (Yes / No / Unsure) | Triggers data team awareness |
| Handles PII? | Select (Yes / No / Unsure) | Yes auto-notifies Legal |
| Uses API keys or external services? | Select (Yes / No / Unsure) | Yes: specify which services |
| Replaces a third-party tool? | Select (Yes / No) | Yes: which tool and approximate annual cost (self-reported; validated for claims >£5k/year in Phase 2) |

Before submitting, the maker is shown a **similar tools check**: a lightweight fuzzy match against existing registry entries by name and description. If potential duplicates are found, the maker sees them and can choose to proceed (their tool is different) or contact the existing tool's owner. This is available from Phase 1 and does not require the full consumer browse experience.

**Phase 2: In-Progress Updates (as you build)**

- Link to app (Lovable URL, staging URL, etc.)
- Link to source code (GitHub repo)
- Tech stack (auto-detected from repo where possible)
- External APIs and services used (detailed)
- API keys and secrets in use (which services — not the values)
- Data classification (Public / Internal / Confidential / Restricted)
- Screenshots and description update

**Phase 3: Live Registration (when users start using it)**

- Status change: Developing → Testing → Active
- Usage analytics connected (Amplitude)
- Oversight model declared: Human-in-the-loop or Human-on-the-loop (see Section 5.4)
- Named backup owner (required for Amber tier, prompted for Red)
- Handover guide (can be AI-generated from codebase)

**Key principle:** The system prompts makers at natural milestones (first deploy, first external user, 10+ users, etc.) to complete the next registration phase. This creates progressive disclosure without blocking progress.

**Handling "Unsure" responses:** When a maker selects "Unsure" for PII, business data, or API key questions, this triggers a follow-up from the platform team within 5 business days to help the maker resolve the uncertainty. If still unresolved after 10 business days, the item is flagged on the governance dashboard as requiring attention. Registration is not blocked — the maker can continue building — but the uncertainty is tracked and visible.

### 5.2 Tier System: Red / Amber / Green

Every registered tool is assigned a tier that communicates its support level, reliability, and governance status to both makers and consumers.

| | Red — Experimental | Amber — Verified | Green — Supported |
|---|---|---|---|
| **What it means** | Early-stage tool. Use at your own risk. Maker-supported only. | Meets standards. Security reviewed. Good for team use. | Production-ready. Formal support. Safe for critical workflows. |
| **Ownership** | Single maker | Shared: maker + named backup | Team-owned (engineering) |
| **Response SLA** | Best effort (no guarantee) | 48 hours | 24 hours, with critical issue escalation path |
| **Availability** | Unavailable when maker is away | Business hours; backup covers absence | 24/7 monitored |
| **Monitoring** | Usage analytics only (Amplitude) | Usage analytics + basic health checks | Full alerting (Datadog/Sentry), automated health checks |
| **Data allowed** | Public, Internal only | Public, Internal, Confidential (with security review) | All classifications including Restricted |
| **PII handling** | Must disclose to Legal if PII is involved | Requires Legal + Engineering approval | Requires Legal + Engineering approval |
| **Security review** | None required | Lightweight checklist reviewed by Layer 1 engineer | Full engineering security assessment |
| **Who should use it** | Maker's immediate team, with understanding of limitations | Wider teams, with awareness of support level | Organisation-wide, including business-critical workflows |
| **Typical layer** | Layer 3 (Makers Programme) | Layer 2 (Product/Design) | Layer 1 (Engineering) |
| **Badge** | Red circle | Amber circle | Green circle |

#### Graduation Criteria

**Red → Amber requires:**
- Security checklist completed with no critical findings
- Basic documentation (README, usage instructions)
- Runs on approved infrastructure (MVF-managed, not personal accounts)
- Named backup owner assigned who has read the handover guide
- Maker agrees to best-effort support commitment

**Amber → Green requires:**
- All Amber criteria, plus:
- Monitoring and alerting configured
- Runbook for common issues
- Business sponsor identified
- Formal support commitment (SLA agreement)
- Full engineering security assessment passed

#### Automatic Flags

The platform automatically flags tools for review when thresholds are crossed. Flags trigger conversations, not blocks.

| Flag | Trigger | Action | Status |
|------|---------|--------|--------|
| Adoption threshold (`high_wau_red_tier`) | Weekly active users exceeds 25 | Prompt maker to consider Amber tier promotion | Deferred — requires Amplitude integration |
| Data risk | App handles Confidential+ data while in Red tier | Mandatory security review triggered | Manual (admin-created) |
| Stale owner (`stale_owner`) | Primary owner hasn't signed in for 90+ days | Flag to governance dashboard | **Live** — daily cron |
| Capacity risk (`capacity_exceeded`) | Maker's weighted app load exceeds 5 points | Flag on newest app; maker must archive or graduate | **Live** — daily cron |
| Dormancy (`dormancy_attestation`) | Active/testing app with no activity for 60+ days | Owner prompted to confirm still active or archive | **Live** — daily cron; owner self-resolves via "Confirm active" |

#### Dormancy and Retirement

Not all tools have interactive users — batch jobs, scheduled reports, and API-only services may have zero sign-ins while being business-critical. Launchpad uses a **dormancy attestation** model rather than auto-offlining based on sign-in data.

**Implemented (Phase 2):**
- Applications with no detected activity for **60 days** trigger a `dormancy_attestation` risk flag (checked daily via cron)
- Activity is tracked via `last_activity_at`; falls back to `updated_at` for apps that predate the feature
- Owners see a **"Confirm active"** button on their app profile for any dormancy flag — clicking it resolves the flag and resets the clock without requiring admin involvement
- The flag is idempotent — if an unresolved dormancy flag already exists, the cron skips re-flagging
- Only `active` and `testing` apps are checked; `intent`, `developing`, and `archived` apps are excluded

**Planned (Phase 3):**
- Auto-archive if owner does not respond within 14 days of dormancy flag (not yet implemented)
- Amplitude/health check integration for activity signals beyond `updated_at`
- Sunsetting a tool with active users requires 30-day notice with migration guidance

### 5.3 Support Model

Every application that exists is a maintenance liability. The more successful we are at enabling people to build, the larger the support burden becomes. Launchpad manages this through clear ownership rules and capacity limits.

#### Ownership and Capacity

- Every app must have a designated owner
- Each individual has a **support capacity of 5 points** as primary owner, weighted by tier:
  - Red (Experimental) = 0.5 points — low support burden, single-team use
  - Amber (Verified) = 1 point — shared ownership, wider user base
  - Green (Supported) = 0 points — team-owned, so does not count against maker's personal capacity
- This means a prolific maker can own up to 10 simple Red-tier tools, or 5 Amber-tier tools, or a mix. Green-tier tools are team-owned and do not consume personal capacity.
- If a maker wants to register a new app but is at capacity, they must retire an existing app or get one graduated to shared/team ownership
- This creates natural pressure while avoiding penalising responsible builders: the cost scales with the support burden, not a flat count

#### Support Map

Launchpad maintains a support map showing:
- Who owns which applications
- How close each person is to their capacity limit
- Upcoming gaps (e.g., app owner has holiday booked — which apps will be unsupported?)
- Cover arrangements for absence periods

#### Handover Readiness

For any application used beyond the maker's immediate team, the following must be in place:
- **Handover guide** — can be AI-generated from the codebase; covers how the app works, how to deploy, known issues, how to access environments
- **Named backup** — someone who has read the handover guide and has access to all resources
- **Shared access** — backup must be able to access the Lovable workspace, Supabase backend, Vercel deployment, and any API keys the app depends on. No single person should be the only one with credentials.

#### Escalation Path

If a Red-tier application becomes something a team or department depends on:
1. Stakeholder or users raise that they are relying on a Red-tier tool for important work
2. The app is reviewed for graduation to Amber (shared ownership) or Green (team ownership)
3. If graduation is not justified, users are informed of the support limitations and can decide whether to continue depending on it

### 5.4 Oversight Models

Not all applications require the same level of human oversight. When registering, the maker declares which model applies.

| | Human in the Loop | Human on the Loop |
|---|---|---|
| **Definition** | A human must review and approve every action or output before it takes effect | The system operates autonomously; a human monitors and can intervene if something goes wrong |
| **When to use** | Actions that are irreversible, affect customers or revenue, modify financial data, send external communications, or change production systems | Actions that are low-risk, reversible, internal-only, or where occasional errors are easily corrected |
| **Examples** | Approving lead reassignment, publishing to a live page, sending client email, modifying pricing | Generating internal reports, updating a team dashboard, suggesting optimisations for review, internal workflow automation |
| **Typical tier** | Required for Green-tier apps that affect customers or revenue | Appropriate for most Red and Amber-tier apps where blast radius is limited |

Applications that start as human-on-the-loop may need to move to human-in-the-loop as they graduate or as their scope expands. The oversight model is reviewed as part of the graduation process.

### 5.5 Support & Feedback

Launchpad includes a built-in support and feedback channel so all users can contact the platform team without leaving the tool.

**User-facing form** (`/support`) — available to all authenticated users:
- Request types: Bug Report, Feature Request, Feedback, Question
- Optional: link to a specific registered app, priority indication, opt-in to receive a reply
- Toast confirmation on submit; no page reload

**Admin inbox** (`/support/admin`) — admin-only:
- Full request log with filters by status, type, and priority
- Status lifecycle: Open → In Progress → Completed / Won't Do
- Completed and Won't Do transitions require a resolution note; email is sent to the submitter via Resend if they opted in to a reply
- Resolved by field records which admin closed the ticket

**Email notifications**: Sent via Resend from a verified sender domain. Requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL` environment variables. Gracefully degrades (logs a warning, does not error) if the API key is not set.

---

## 6. User Personas

### 6.1 The Maker

**Profile:** Product manager, commercial lead, CRO specialist, or domain expert who identifies a problem and builds a tool to solve it. May have limited technical background but is empowered by AI-assisted development (typically Lovable).

**Goals:** Build something useful quickly. Get credit for solving problems. Not get bogged down in infrastructure or compliance paperwork.

**Pain points:** Does not know where to start. Worried about "doing it wrong." No time to learn DevOps. Concerned about what happens when they go on holiday.

**Launchpad value:** 30-second registration captures intent without blocking progress. Progressive governance means requirements grow with the tool, not upfront. Visibility in the registry brings recognition. Support team offers help without judgement.

### 6.2 The Consumer

**Profile:** Employee looking for tools to help with their work. May not know what tools exist or who built them.

**Goals:** Find tools that solve their problems. Understand what is safe to use for critical work. Know who to contact when things break.

**Pain points:** Cannot discover existing tools. Unclear which tools are "official." Nervous about depending on someone's side project.

**Launchpad value:** App Library provides discoverability. Tier badges indicate reliability at a glance. Clear support contacts and documentation.

### 6.3 The Maintainer

**Profile:** IT or engineering staff responsible for keeping tools running when original makers are unavailable.

**Goals:** Be able to support any tool without deep context. Apply security patches quickly. Avoid being paged about tools they have never seen.

**Pain points:** Every tool is different. No documentation. Cannot access the maker's Lovable workspace to debug. Security vulnerabilities in unknown tools.

**Launchpad value:** Registry provides visibility into the full landscape. Handover guides and named backups enable support coverage. Governance dashboard surfaces risk before it becomes an incident.

### 6.4 The Leader

**Profile:** Department head or senior leader who wants to encourage innovation while managing risk.

**Goals:** Enable their team to solve problems autonomously. Ensure business continuity. Maintain compliance and security posture. Understand ROI.

**Pain points:** Does not want to be a bottleneck. Worried about shadow IT risks. Needs visibility without micromanagement.

**Launchpad value:** Governance dashboard provides landscape visibility. Tier system manages risk without approval gates. ROI and third-party replacement data quantifies value. Support map ensures business continuity.

---

## 7. Views and Features

### 7.1 Maker Dashboard (MVP Homepage)

The primary view for authenticated makers. Optimised for registration and app management.

**Components:**
- **My Apps** — Cards for each registered app showing: name, tier badge (Red/Amber/Green), status (Developing/Testing/Active), last updated, user count (when Amplitude connected)
- **Register New App** — Prominent call-to-action opening the intent declaration form
- **Action Required** — Prompts to: complete the next registration phase, respond to dormancy attestation prompts, review flagged apps, address upcoming tier reviews
- **My Capacity** — Visual indicator showing points used out of 5 (weighted: Red=0.5, Amber=1, Green=0), with clear guidance on what happens at capacity

### 7.2 Governance Dashboard

For engineering leads, platform team, and senior leadership. Provides the "landscape view" of all internal tools.

**Components:**
- **Landscape View** — All registered apps visualised by layer (L1/L2/L3) and tier (Red/Amber/Green), filterable by department
- **Risk Flags** — Active flags: apps with no backup owner, maker on holiday with no cover, >25 WAU still in Red tier, PII disclosed without Legal approval, dormancy attestation pending, unresolved "Unsure" declarations, dependencies with known vulnerabilities
- **Support Map** — Who owns what, capacity utilisation per person, upcoming holiday gaps with affected apps
- **Cost Overview** — Placeholder in MVP; in Phase 3, shows estimated running costs per app and tools replacing paid third-party software

### 7.3 App Profile Pages

One page per registered app, displaying all information collected through progressive registration.

**Fields displayed:**
- Name, description, screenshots
- Tier badge and status
- Owner and backup contact
- Layer designation
- Data classification badge (Public/Internal/Confidential/Restricted)
- PII status
- API keys and external services used
- Oversight model (human-in-the-loop / human-on-the-loop)
- Tech stack
- Usage statistics (when Amplitude connected)
- GitHub repo link
- App URL (launch button)
- ROI statement
- Third-party tool it replaces (if applicable)

### 7.4 Consumer Browse (Deferred)

Activated when 5-10 apps are registered in the library. Before this threshold, a sparse browse page would undermine confidence in the platform.

**Planned features:**
- Search by name, description, category
- Filter by department, layer, tier
- "Similar tools" suggestions to reduce duplication
- Recently added and most popular sections

---

## 8. Data Classification

All data handled by Launchpad-registered applications must be classified. This classification determines which layers can handle the data and what security controls are required.

| Classification | Description | Examples | Allowed In |
|----------------|-------------|----------|------------|
| **Public** | Information that is freely available or intended for public consumption | Published marketing content, public website data, aggregated metrics | All layers |
| **Internal** | Information intended for internal use that would not cause significant harm if disclosed | Internal reports, team performance data, non-sensitive operational metrics, campaign configuration | All layers (with Launchpad registration) |
| **Confidential** | Sensitive business information that could cause harm if disclosed | Revenue data, client contract details, employee information, commercial terms | Layer 1 and Layer 2 only (with security review) |
| **Restricted** | Highly sensitive data subject to regulatory requirements | Customer PII, health data, special category data (GDPR), payment information, consent records | Layer 1 only (full engineering security controls) |

When registering an application, the maker declares the highest classification of data the application will handle. This determines which security requirements apply and whether additional approvals are needed.

---

## 9. Security and Compliance

### 9.1 Hard Guardrails (Non-Negotiable)

These apply across all three layers regardless of tier:

- **Customer data, health data, and special category data** (as defined by GDPR) must never be stored in or processed by Layer 2 or Layer 3 applications. These are restricted to Layer 1 with full security controls.
- **PII** (names, email addresses, phone numbers, IP addresses) must be disclosed to Legal at registration. Storage in Layer 2 or Layer 3 backends requires explicit Legal + Engineering approval.
- **Consent management** is not something that can be improvised. Any application collecting data from customers must respect consent statements and collect data in accordance with MVF privacy policies.
- **API keys and secrets** must never be stored in application code or client-side JavaScript. All secrets must be managed through prescribed infrastructure (Vercel environment variables, Supabase secrets, or MVF secrets management).
- **No direct integration with core production systems** from Layer 2 or Layer 3. Read-only API access only, and only through approved endpoints.
- **Authentication required for Internal+ data.** Any tool handling Internal, Confidential, or Restricted data must have authentication. Google SSO is preferred; basic authentication is acceptable for Red-tier tools. A publicly accessible tool with no authentication may only handle Public data.

### 9.2 Security Assessment by Tier

| Tier | Assessment Required | Scope |
|------|-------------------|-------|
| **Red** | None (self-declaration at registration) | Maker declares data classification, PII handling, and API usage. Auto-notifications triggered where appropriate. |
| **Amber** | Lightweight security checklist (5 business day SLA) | Reviewed by a Layer 1 engineer within 5 business days of request. Can be partially automated using AI to scan the codebase for: exposed secrets, overly permissive database settings, missing authentication, client-side API keys. SLA ensures this does not become a bottleneck. |
| **Green** | Full engineering security assessment | Covers authentication, authorisation, data storage, input validation, deployment security, and data flow analysis. Prerequisite for graduation. |

### 9.3 Infrastructure Controls

All non-Layer-1 applications should use MVF-managed infrastructure:
- Applications deployed to MVF-managed hosting, not personal free-tier accounts
- Database backends provisioned within MVF infrastructure (eliminates risk of overly permissive Supabase RLS settings on personal accounts)
- API keys and secrets managed through MVF secrets management
- Engineering team can audit, monitor, and if necessary shut down any application

---

## 10. Phasing

### Phase 1: Registry MVP (Weeks 1-4)

**Goal:** Replace the amnesty CSV with a proper registry. Get all existing tools registered. Prove the concept to makers and leadership.

#### Build

| Feature | Priority | Success Criteria |
|---------|----------|-----------------|
| Next.js app with Google SSO (Supabase Auth) | P0 | Any MVF employee can sign in |
| Intent registration form (9 fields) | P0 | Register in under 1 minute |
| Maker dashboard (My Apps, Register, Capacity) | P0 | Maker can see and manage their apps |
| App profile pages (basic) | P0 | Each app has a dedicated page |
| Governance dashboard (landscape view, basic risk flags) | P1 | Leadership can see the full landscape |
| Similar tools check (fuzzy match at registration) | P1 | Maker sees potential duplicates before submitting |
| Seed data: import 3 apps from amnesty CSV | P0 | Existing tools visible from day one |
| Admin: manually set tier, flag apps | P1 | Platform team can manage tiers |

#### Do Not Build Yet

- Amplitude integration
- Automated tier promotion or flagging
- Consumer browse view
- Lovable ingestion pipeline
- Data access framework
- Slack notifications
- Cost tracking

#### Phase 1 Success Criteria

- All known existing tools registered (target: 10+ within first month)
- Makers can register intent in under 1 minute
- Leadership can see the landscape in one view
- Zero API key exposure incidents from newly registered tools
- At least 3 new tools registered by makers who were not previously tracked

### Phase 2: Adoption and Governance (Weeks 5-10)

**Goal:** Drive adoption across the organisation. Add the governance features that make Launchpad indispensable for leaders and the platform team.

#### Build

| Feature | Priority | Status |
|---------|----------|--------|
| Progressive registration (section-based inline editing) | P0 | ✅ Shipped PR #1 (2026-03-27) |
| Animated UI, light/dark theme, login page | P0 | ✅ Shipped (2026-03-27) |
| Automated risk flags — stale owner, capacity exceeded, dormancy | P0 | ✅ Shipped PR #6 (2026-03-31) |
| Dormancy attestation — owner self-resolve via "Confirm active" | P1 | ✅ Shipped PR #6 (2026-03-31) |
| Governance flags UX — source badge, isAdmin gate, two-line rows | P1 | ✅ Shipped PR #7 (2026-03-31) |
| Support & Feedback form — user form + admin inbox + Resend email | P1 | ✅ Shipped PR #8 (2026-03-31) |
| Amplitude usage tracking integration | P0 | ⬜ Next — unblocks WAU flag |
| Slack notifications for risk flags and registration prompts | P2 | ⬜ Planned |
| Status changes by makers (intent → developing → testing → active) | P1 | ⬜ Planned |
| Backup owner management (add/remove on app profile) | P1 | ⬜ Planned |
| Holiday/absence gap detection on support map | P2 | ⬜ Planned |

#### Phase 2 Success Criteria

- 80%+ of known internal tools registered
- Governance dashboard actively used in leadership reviews
- At least one tool graduated from Red to Amber using the defined criteria
- Dormancy attestation process has surfaced and retired at least one stale app
- Makers voluntarily updating their entries as tools evolve

### Phase 3: Ingestion and Scale (Weeks 11-16)

**Goal:** Solve the "graduated app" problem. Build the pipeline to pull successful Lovable builds into stable, governed infrastructure.

#### Build

| Feature | Priority |
|---------|----------|
| Lovable → stable environment ingestion workflow | P0 |
| Secrets migration (personal accounts → MVF-managed) | P0 |
| Security checklist automation (AI-assisted codebase scan) | P1 |
| Handover guide generation (AI from codebase) | P1 |
| Data access request workflow (link to Snowflake/data team process) | P2 |
| Cost tracking per app | P2 |
| Self-service tier promotion workflow | P2 |

#### Phase 3 Success Criteria

- At least one Lovable app successfully ingested into stable infrastructure
- Secrets migrated from personal accounts for all Amber+ tier apps
- AI-generated handover guides available for all Amber+ tier apps
- Data access request pathway documented and linked from registration flow

---

## 11. Success Metrics

### North Star Metric

**Percentage of business-critical tools in Green (Supported) tier.**

This measures whether we are achieving our core goal: ensuring that tools the business depends on have appropriate support and governance.

**Target:** 80% of tools with >50 weekly active users in Supported tier within 12 months.

### Leading Indicators

| Metric | 3-Month Target | 6-Month Target | 12-Month Target |
|--------|---------------|----------------|-----------------|
| Tools registered in Launchpad | 15 | 50 | 150 |
| Tools with named backup owner | 5 | 25 | 80 |
| Active Launchpad users (monthly) | 50 | 200 | 500 |
| Maker satisfaction (NPS) | >30 | >40 | >50 |
| Time to register new tool | <1 minute | <1 minute | <1 minute |
| Tools replacing third-party software | 3 | 10 | 25 |

### Lagging Indicators

- **Incidents from unsupported tools:** Should decrease over time
- **Time to resolve tool issues:** Should decrease for Green-tier tools
- **Security vulnerabilities in internal tools:** Should decrease as security reviews scale
- **Duplicate tools discovered:** Should increase initially (discovery effect), then decrease
- **Cost saved from third-party replacements:** Should grow as registry matures

### Anti-Metrics (What We Do Not Want)

These metrics would indicate we have gone wrong:

- **Decrease in tools being built:** Would suggest we are stifling innovation
- **Tools built outside Launchpad increasing:** Would suggest the platform is not valuable enough
- **Long queue for Support/reviews:** Would suggest we have become a bottleneck
- **Low maker satisfaction:** Would suggest the partnership model is not working
- **Registration abandonment rate rising:** Would suggest the form is too burdensome

---

## 12. Technical Architecture

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14+ | Industry standard, strong ecosystem, works well with AI-assisted development, full-stack patterns |
| **Styling** | Tailwind CSS | Utility-first, design tokens from MVF brand, works well with AI tooling |
| **Authentication** | Google SSO via Supabase Auth | MVF uses Google Workspace; Supabase Auth supports Google OAuth natively |
| **Database** | Supabase (PostgreSQL) | Postgres + auth + realtime + storage in one platform. Row Level Security for data isolation. |
| **Hosting** | Vercel | Push-to-deploy, preview deployments for PRs, edge functions, aligns with wider MVF tooling |
| **Usage Analytics** | Amplitude (Phase 2) | Tracks tool adoption; feeds probation/retirement workflows |
| **Notifications** | Slack API (Phase 2) | Risk flags, registration prompts, probation notices |

### Data Model (Simplified)

**Core entities:**
- `apps` — registered tools (name, description, status, tier, layer, data_classification, oversight_model, etc.)
- `makers` — users who build tools (linked to Google SSO identity, capacity count)
- `app_owners` — ownership relationships (primary owner, backup, role)
- `registration_fields` — progressive field completion tracking
- `risk_flags` — active flags per app (type, severity, created_at, resolved_at)
- `tier_history` — audit trail of tier changes

### Launchpad Roles (RBAC)

| Role | Access |
|------|--------|
| **Maker** | Register apps, manage own apps, view all app profiles, update own registration fields |
| **Admin** | Everything Maker can do, plus: manually set tiers, trigger/resolve flags, archive apps, manage probation, access governance dashboard, manage other makers' apps |
| **Viewer** | Browse registered apps and app profiles, view governance dashboard (read-only). For leadership and consumers who do not build tools. |

Role assignment is managed by Admins. All authenticated MVF employees default to the Maker role.

### Integration Points

- **Google Workspace** — SSO authentication, user identity
- **GitHub** — source code links (read-only in MVP; deeper integration in Phase 3)
- **Amplitude** — usage analytics per registered app (Phase 2)
- **Slack** — notifications for risk flags, registration prompts (Phase 2)
- **Snowflake/Looker** — data access request workflow (Phase 3, linked not embedded)

---

## 13. Future Scope

The following items are explicitly out of scope for the initial three phases but are anticipated as natural extensions of Launchpad.

### Starter Kit

An opinionated development environment (CLI scaffolding tool) that makes building compliant tools easier than building non-compliant ones. Pre-configured with SSO, database, deployment, and MVF design system. Primarily for Claude Code users (Layer 1 and technical Layer 2 builders). Tools built on the Starter Kit would skip most graduation requirements — they are already compliant by design.

### Data Access Framework

A governed pipeline for application access to business data via Snowflake. Builders describe data needs by referencing Looker explores; the data team creates secure Snowflake views with scoped credentials. Integrated into Launchpad registration as a "this app needs data" workflow. Detailed design in the Phase 2 Ways of Working document (Section 7).

### Cost Management

Per-app cost tracking showing hosting, database compute, API calls, and Snowflake query credits. Threshold-based reviews when an app exceeds defined monthly costs. Quarterly review of total application running costs by layer and owner. Cost data alongside usage metrics to identify underused apps with significant running costs.

### Automated Compliance

AI-assisted security scanning of registered app codebases. Automated detection of exposed secrets, overly permissive database settings, missing authentication, and client-side API keys. Automated tier promotion recommendations based on criteria completion.

### Consumer App Store Experience

Full browse experience with categories, ratings, reviews, "similar tools" recommendations, and "popular this week" sections. Activated once the registry reaches critical mass (target: 10+ apps).

---

## 14. Open Questions

### Strategic

| Question | Initial Thinking |
|----------|-----------------|
| Should registration eventually become mandatory? | Start voluntary with strong incentives. Revisit after 6 months based on adoption. If >80% of known tools are registered voluntarily, mandatory may not be needed. |
| Where does the platform/support team sit organisationally? | IT, Engineering, or Product all have arguments. Recommend Engineering with dotted line to IT for security. |
| Funding model — centrally funded or departmental chargeback? | Centrally funded in Phase 1-2. Cost tracking in Phase 3 enables chargeback discussion. |
| Existing tools — amnesty or require migration? | Amnesty period: register as-is, then work toward compliance. Do not block existing tools. |
| How prescriptive should we be about tooling for Layer 2? | Google AI Studio may be viable given workspace subscription. Lovable is dominant today. Let the market evolve; Launchpad is tool-agnostic. |
| Will Claude Co-work / Claude Office make the Makers Programme obsolete? | Possibly for some use cases. Monitor. Launchpad's value (visibility, governance) persists regardless of build tool. |
| What happens to tools handling PII that are discovered outside Launchpad? | Registration is voluntary in Phase 1, but unregistered tools handling PII represent genuine risk. Recommend a defined escalation: discovery triggers a conversation (not a shutdown), with a 14-day window to register. Revisit if voluntary adoption falls below 80%. |

### Technical

| Question | Initial Thinking |
|----------|-----------------|
| Should we support additional frontend frameworks beyond Next.js? | Not in the Starter Kit. Launchpad itself is tool-agnostic — it registers tools built on anything. |
| How do we handle the existing Supabase fragmentation? | Amnesty: consolidate to MVF-managed accounts. New apps must use MVF infrastructure. |
| What refresh frequencies for Snowflake data views? | Most internal tools need daily or hourly, not real-time. Define per use case in Phase 3. |
| Is Streamlit in Snowflake viable for data-heavy tools? | Worth evaluating as a Layer 2/3 option. Keeps data in Snowflake. Pilot in Phase 3. |

### Operational

| Question | Initial Thinking |
|----------|-----------------|
| What hours/days should Green-tier tools have support coverage? | Business hours + critical escalation. Full 24/7 only for revenue-critical tools. |
| When a Green-tier tool has issues, who gets paged? | The team that owns it. Launchpad surfaces the owner, it does not provide on-call. |
| Makers Programme assessment process? | Proposal-based: submit problem statement and approach. Looking for clarity of thought, not technical skill. Criteria to be defined. |
| How do we handle a maker who is rejected from the Makers Programme? | Must have a development path to reapply. Never make rejection feel final or punitive. |
| Is the 5-point weighted capacity the right limit? | Start at 5 points (Red=0.5, Amber=1, Green=0), review after 3 months based on actual usage patterns. May need adjustment if builders consistently hit the cap with legitimate tools. |

---

## 15. Appendices

### Appendix A: Competitive Analysis

**Spotify (Backstage):** Built an open-source developer portal as a catalog for internal services. Key insight: developers adopt tools that make their lives easier, not tools that impose process. Backstage succeeded because it provided genuine value (service discovery, documentation) before asking for compliance.

**Netflix (Full Cycle Developers):** Empowers developers to own tools end-to-end, but provides excellent platform primitives for infrastructure, monitoring, and security. Key insight: "paved paths" that are genuinely easier than alternatives achieve adoption without mandates.

**Google (Internal Tool Culture):** Rich ecosystem of internal tools built by employees. Key insight: celebrating makers and making tools discoverable creates a positive feedback loop that encourages more building.

**Key takeaway for Launchpad:** All three examples demonstrate that adoption comes from value, not mandates. Launchpad must be genuinely useful to makers before it can be a governance tool for leaders.

### Appendix B: Current State — Amnesty List

As of March 2026, three tools are registered in the amnesty spreadsheet:

| Tool | Purpose | Status | Owner | Tech | Repo |
|------|---------|--------|-------|------|------|
| ArtyFish | AI-generated paid marketing wins | Active (users depend on it) | — | Lovable | mvf-tech/artyfish |
| Allegros | Internal portal for Legal | Active (users depend on it) | Alex Mandel | Lovable | mvf-tech/mvflgr |
| Partner Portal | Partner portal | Active (users depend on it) | Alex Mandel | Lovable | mvf-tech/inboxguide |

All three are Lovable builds, all are active with dependent users, all are hosted on GitHub under the mvf-tech organisation. ArtyFish is the exemplar "graduated" application.

### Appendix C: Glossary

| Term | Definition |
|------|-----------|
| **Vibe Coding** | Building software with AI assistance, often by non-professional developers |
| **Maker** | The person who builds and initially maintains a tool |
| **Consumer** | An employee who uses a tool built by someone else |
| **Maintainer** | The person or team responsible for ongoing tool support |
| **Graduation** | Process by which a tool moves from a lower tier to a higher one |
| **Dormancy Attestation** | Prompt triggered after 30 days of no detected activity, asking the owner to confirm the tool is still in use. No response within 14 days leads to archival. |
| **Shadow IT** | Technology deployed outside official IT governance |
| **Layer** | One of three delivery tiers in MVF's AI-enabled delivery model (L1: Engineering, L2: Product/Design, L3: Makers) |
| **Rock** | A 6-month strategic priority agreed at leadership level |
| **Launchpad** | The centralised registry and governance platform described in this document |
| **Starter Kit** | Future: a pre-configured development environment for building Launchpad-compliant apps |

---

*End of Document*
