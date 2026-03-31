import React from 'react';
import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import {
  FlaskConical,
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  Users,
  Lock,
  Shuffle,
  Eye,
  Zap,
  ArrowRight,
  Check,
  X,
  Clock,
  Database,
  FileText,
  Layers,
  Rocket,
  Hammer,
  Building2,
  UserCheck,
  BarChart3,
  GitMerge,
  Search,
} from 'lucide-react';
import type { Profile } from '@/lib/supabase/types';

export default async function PRDPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  if (!profile || (profile as Profile).role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-20">

      {/* ── 1. HERO ── */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground tracking-widest uppercase font-medium">
            Internal · Admin Only
          </span>
        </div>

        <h1 className="text-[32px] font-bold tracking-tight text-foreground mb-1">
          MVF Launchpad
        </h1>
        <p className="text-[15px] text-muted-foreground mb-5">
          Product Requirements Document
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            v1.1
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            31 March 2026
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            Ian Hitge · Author
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-border" style={{ color: '#22c55e', borderColor: '#22c55e', backgroundColor: '#22c55e18' }}>
            Live · Phase 2 in progress
          </span>
        </div>

        <blockquote className="text-[22px] font-semibold italic tracking-tight" style={{ color: 'var(--mvf-pink)' }}>
          &ldquo;Ship tools fast. Keep them running.&rdquo;
        </blockquote>
      </header>

      <hr className="border-border mb-12" />

      {/* ── 2. PROBLEM CARDS ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Why this exists
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-6">
          The Problem in 6 Lines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Search, title: 'No Visibility', desc: "We don't know what tools exist, who built them, or what data they touch.", },
            { icon: Users, title: 'Support Gaps', desc: "When makers leave or go on holiday, their tools become unsupportable.", },
            { icon: Shuffle, title: 'Tech Fragmentation', desc: "Every tool uses a different stack, deployed anywhere, maintained by nobody.", },
            { icon: Lock, title: 'Security Blind Spots', desc: "API keys exposed. PII mishandled. No review process. We've had incidents.", },
            { icon: GitMerge, title: 'Duplication', desc: "Teams rebuild what already exists because there's no way to discover it.", },
            { icon: Zap, title: 'Innovation Stifled', desc: "Approval gates kill momentum. People stop building. We lose the benefit.", },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card rounded-[8px] p-4 border border-border card-shadow"
              style={{ borderLeft: '3px solid var(--mvf-orange)' }}
            >
              <Icon className="h-4 w-4 mb-2.5" style={{ color: 'var(--mvf-orange)' }} />
              <p className="text-[13px] font-semibold text-foreground mb-1">{title}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. WHAT IT IS NOT ── */}
      <section className="mb-14">
        <div
          className="rounded-[8px] p-5 border"
          style={{
            borderLeft: '4px solid var(--mvf-yellow)',
            backgroundColor: 'color-mix(in srgb, var(--mvf-yellow) 6%, transparent)',
            borderColor: 'color-mix(in srgb, var(--mvf-yellow) 30%, transparent)',
            borderLeftColor: 'var(--mvf-yellow)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'color-mix(in srgb, var(--mvf-yellow) 20%, transparent)' }}
            >
              <X className="h-3.5 w-3.5" style={{ color: 'var(--mvf-yellow)' }} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground mb-2">What Launchpad is NOT</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {[
                  'An approval process',
                  'Another committee',
                  'IT telling people what to build',
                  'Mandatory (in Phase 1)',
                  'A way to slow anyone down',
                ].map((item) => (
                  <span key={item} className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                    <X className="h-3 w-3 text-red-400 flex-shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. THREE DELIVERY LAYERS ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Organisational Model
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-2">
          Three Layers of AI-Enabled Delivery
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Launchpad governs all three layers — proportionally, not uniformly.
        </p>

        {/* Layer cards with arrows */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-stretch mb-6">
          {/* L3 — Makers (entry point, rightmost in graduation flow) */}
          {[
            {
              label: 'L3',
              title: 'Makers Programme',
              color: 'var(--mvf-orange)',
              who: 'Business users',
              tools: 'Lovable (MVF workspace)',
              scope: 'Team tools, workflow automations',
              governance: 'Strongest guardrails, mentor, budget',
              note: 'Entry point',
            },
            {
              label: 'L2',
              title: 'Product & Design',
              color: 'var(--mvf-light-blue)',
              who: 'PMs, designers, CRO specialists',
              tools: 'Lovable, Claude Code, AI Studio',
              scope: 'Internal tools, CRO experiments, prototypes',
              governance: 'Launchpad registration, no PII without approval',
              note: 'Grows here',
            },
            {
              label: 'L1',
              title: 'Engineering',
              color: 'var(--mvf-purple)',
              who: 'Engineers (pairs/small teams)',
              tools: 'Claude Code (agentic terminal)',
              scope: 'Core systems, production, PII, integrations',
              governance: 'Full engineering standards',
              note: 'Business-critical',
            },
          ].map((layer, i) => (
            <React.Fragment key={layer.label}>
              <div
                className="bg-card rounded-[8px] border border-border p-4 flex flex-col"
              >
                <div
                  className="h-1 rounded-full mb-4 -mt-4 -mx-4 rounded-t-[8px]"
                  style={{ backgroundColor: layer.color, height: '3px', marginTop: 0 }}
                />
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]"
                    style={{ backgroundColor: `color-mix(in srgb, ${layer.color} 15%, transparent)`, color: layer.color }}
                  >
                    {layer.label}
                  </span>
                  <span className="text-[13px] font-semibold text-foreground">{layer.title}</span>
                </div>
                <dl className="space-y-2 text-[12px] flex-1">
                  {[
                    { label: 'Who', value: layer.who },
                    { label: 'Tools', value: layer.tools },
                    { label: 'Scope', value: layer.scope },
                    { label: 'Governance', value: layer.governance },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-muted-foreground font-medium">{label}</dt>
                      <dd className="text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">{layer.note}</span>
                </div>
              </div>
              {i < 2 && (
                <div key={`arrow-${i}`} className="hidden md:flex items-center justify-center px-1">
                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '9px', lineHeight: 1.2 }}>
                      graduates
                    </span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Graduation triggers table */}
        <div className="rounded-[8px] border border-border overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
            <p className="text-[12px] font-semibold text-foreground">Graduation Triggers</p>
          </div>
          <table className="w-full text-[12px]">
            <tbody>
              {[
                { trigger: 'Used by 10+ people regularly', from: 'L3 Makers', to: 'L2 Product/Design' },
                { trigger: 'Business-critical or revenue-generating', from: 'L2 Product/Design', to: 'L1 Engineering' },
                { trigger: 'Handles PII or integrates with core systems', from: 'Any layer', to: 'L1 Engineering' },
                { trigger: 'Context window degradation / technical limits', from: 'L2 or L3', to: 'L1 (rebuild)' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-foreground">{row.trigger}</td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{row.from}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span style={{ color: 'var(--mvf-purple)' }} className="font-medium">{row.to}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. TIER SYSTEM ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Governance
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-2">
          The Traffic Light Tier System
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Every registered tool gets a tier. Tiers determine support level, data access, and governance requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: FlaskConical,
              tier: 'Red',
              label: 'Experimental',
              color: '#ef4444',
              bgColor: 'rgba(239,68,68,0.08)',
              meaning: 'Early stage. Use at your own risk. Maker-supported only.',
              rows: [
                { label: 'Ownership', value: 'Single maker' },
                { label: 'SLA', value: 'Best effort' },
                { label: 'Data', value: 'Public + Internal only' },
                { label: 'Security', value: 'None required' },
                { label: 'Capacity cost', value: '0.5 pts' },
              ],
              graduation: ['Security checklist', 'Basic docs', 'Approved infra', 'Named backup owner'],
            },
            {
              icon: ShieldCheck,
              tier: 'Amber',
              label: 'Verified',
              color: '#f59e0b',
              bgColor: 'rgba(245,158,11,0.08)',
              meaning: 'Meets standards. Security reviewed. Good for team use.',
              rows: [
                { label: 'Ownership', value: 'Maker + backup' },
                { label: 'SLA', value: '48 hours' },
                { label: 'Data', value: '+ Confidential (with review)' },
                { label: 'Security', value: 'Lightweight checklist' },
                { label: 'Capacity cost', value: '1 pt' },
              ],
              graduation: ['Monitoring + alerting', 'Runbook for issues', 'Business sponsor', 'Full security assessment'],
            },
            {
              icon: BadgeCheck,
              tier: 'Green',
              label: 'Supported',
              color: '#22c55e',
              bgColor: 'rgba(34,197,94,0.08)',
              meaning: 'Production-ready. Formal support. Safe for critical workflows.',
              rows: [
                { label: 'Ownership', value: 'Team-owned (Engineering)' },
                { label: 'SLA', value: '24h + escalation' },
                { label: 'Data', value: 'All classifications' },
                { label: 'Security', value: 'Full assessment' },
                { label: 'Capacity cost', value: '0 pts (team-owned)' },
              ],
              graduation: [],
            },
          ].map(({ icon: Icon, tier, label, color, bgColor, meaning, rows, graduation }) => (
            <div
              key={tier}
              className="bg-card rounded-[8px] border border-border overflow-hidden card-shadow"
            >
              {/* Tier header */}
              <div className="px-4 pt-4 pb-3" style={{ backgroundColor: bgColor }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color }} />
                  <span className="text-[13px] font-bold" style={{ color }}>
                    {tier}
                  </span>
                  <span className="text-[12px] text-muted-foreground">— {label}</span>
                </div>
                <p className="text-[12px] text-foreground leading-relaxed">{meaning}</p>
              </div>

              {/* Details */}
              <div className="px-4 py-3 space-y-2">
                {rows.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-[12px]">
                    <span className="text-muted-foreground flex-shrink-0">{label}</span>
                    <span className="text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Graduation to next tier */}
              {graduation.length > 0 && (
                <div className="px-4 pb-4 pt-1 border-t border-border">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                    To graduate →
                  </p>
                  <ul className="space-y-1">
                    {graduation.map((item) => (
                      <li key={item} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Check className="h-3 w-3 flex-shrink-0" style={{ color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. AUTOMATIC FLAGS ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Risk Signals
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-2">
          Automatic Risk Flags
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Flags trigger conversations, not blocks.
        </p>

        <div className="rounded-[8px] border border-border overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-semibold text-foreground">Flag</th>
                <th className="px-4 py-2.5 text-left font-semibold text-foreground">Trigger</th>
                <th className="px-4 py-2.5 text-left font-semibold text-foreground">Action</th>
                <th className="px-4 py-2.5 text-left font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { flag: 'Adoption threshold', trigger: '25+ weekly active users', action: 'Prompt tier upgrade', icon: BarChart3, color: 'var(--mvf-light-blue)', live: false, liveLabel: 'Needs Amplitude' },
                { flag: 'Data risk', trigger: 'Confidential data + Red tier', action: 'Mandatory security review', icon: Database, color: '#ef4444', live: false, liveLabel: 'Manual' },
                { flag: 'Stale owner', trigger: 'Primary owner no sign-in for 90+ days', action: 'Flag to governance dashboard', icon: Clock, color: '#f59e0b', live: true, liveLabel: 'Live · daily cron' },
                { flag: 'Capacity exceeded', trigger: 'Maker weighted load > 5 points', action: 'Flag newest app; maker must archive or graduate', icon: AlertTriangle, color: 'var(--mvf-orange)', live: true, liveLabel: 'Live · daily cron' },
                { flag: 'Dormancy', trigger: 'Active/testing app — no activity for 60+ days', action: 'Owner confirms still active or archives', icon: Rocket, color: 'var(--mvf-purple)', live: true, liveLabel: 'Live · daily cron' },
              ].map(({ flag, trigger, action, icon: Icon, color, live, liveLabel }) => (
                <tr key={flag} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
                      <span className="font-medium text-foreground">{flag}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{trigger}</td>
                  <td className="px-4 py-3 text-foreground">{action}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={live
                        ? { color: '#22c55e', backgroundColor: '#22c55e18', border: '1px solid #22c55e40' }
                        : { color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }
                      }>
                      {liveLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 7. CAPACITY MODEL ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Support Model
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-2">
          The Capacity Model
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Prevents overcommitment without blocking builders.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { tier: 'Red', pts: '0.5 pts', max: '10', label: 'Red-tier tools', color: '#ef4444', icon: FlaskConical, fill: 10 },
            { tier: 'Amber', pts: '1 pt', max: '5', label: 'Amber-tier tools', color: '#f59e0b', icon: ShieldCheck, fill: 50 },
            { tier: 'Green', pts: '0 pts', max: '∞', label: 'team-owned', color: '#22c55e', icon: BadgeCheck, fill: 0 },
          ].map(({ tier, pts, max, label, color, icon: Icon }) => (
            <div key={tier} className="bg-card rounded-[8px] border border-border p-4 card-shadow text-center">
              <Icon className="h-5 w-5 mx-auto mb-2" style={{ color }} />
              <div className="text-[28px] font-bold tracking-tight mb-0.5" style={{ color }}>
                {max}
              </div>
              <div className="text-[12px] text-foreground mb-1">{label}</div>
              <div className="text-[11px] text-muted-foreground">{pts} per tool</div>
            </div>
          ))}
        </div>

        {/* Visual capacity bar */}
        <div className="bg-card rounded-[8px] border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-foreground">Example: 5-point capacity</span>
            <span className="text-[11px] text-muted-foreground">5.0 / 5.0 pts used</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-muted flex gap-0.5">
            {/* 4× Red (0.5 each = 2pts) */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`r${i}`} className="h-full rounded-full" style={{ flex: '0.5', backgroundColor: '#ef4444' }} />
            ))}
            {/* 2× Amber (1 each = 2pts) */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`a${i}`} className="h-full rounded-full" style={{ flex: '1', backgroundColor: '#f59e0b' }} />
            ))}
            {/* 1× Red (0.5 = last 0.5pt, but rounding: show 0.5 segment) */}
            <div className="h-full rounded-full" style={{ flex: '0.5', backgroundColor: '#ef4444' }} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            {[
              { color: '#ef4444', label: 'Red (0.5 pts)' },
              { color: '#f59e0b', label: 'Amber (1 pt)' },
              { color: '#22c55e', label: 'Green (0 pts)' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. REGISTRATION FLOW ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Registration
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-2">
          Progressive Registration
        </h2>
        <p className="text-[13px] text-muted-foreground mb-8">
          Intent-first. Grows with the tool. Never blocks progress.
        </p>

        {/* Horizontal timeline */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-6 left-[calc(16.66%+8px)] right-[calc(16.66%+8px)] h-px bg-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                phase: '1',
                icon: Zap,
                title: 'Intent',
                timing: '30 seconds',
                badge: 'Before you build',
                badgeColor: 'var(--mvf-purple)',
                fields: ['App name', 'Problem statement', 'Layer (L1/L2/L3)', 'Target users', 'Potential ROI', 'Handles PII?', 'Needs business data?', 'Uses API keys?', 'Replaces a third-party tool?'],
                color: 'var(--mvf-purple)',
              },
              {
                phase: '2',
                icon: Hammer,
                title: 'In Progress',
                timing: 'As you build',
                badge: 'While building',
                badgeColor: 'var(--mvf-light-blue)',
                fields: ['App URL (Lovable / staging)', 'GitHub repository', 'Tech stack', 'External APIs used', 'Data classification', 'Screenshots'],
                color: 'var(--mvf-light-blue)',
              },
              {
                phase: '3',
                icon: Rocket,
                title: 'Live',
                timing: 'When users arrive',
                badge: 'Go-live',
                badgeColor: 'var(--mvf-pink)',
                fields: ['Status → Active', 'Usage analytics (Amplitude)', 'Oversight model declared', 'Named backup owner', 'Handover guide'],
                color: 'var(--mvf-pink)',
              },
            ].map(({ phase, icon: Icon, title, timing, badge, badgeColor, fields, color }) => (
              <div key={phase} className="relative">
                {/* Phase dot */}
                <div
                  className="relative z-10 h-12 w-12 rounded-full flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, border: `2px solid ${color}` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>

                <div className="bg-card rounded-[8px] border border-border p-4 card-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Phase {phase} — {title}</p>
                      <p className="text-[11px] text-muted-foreground">{timing}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${badgeColor} 15%, transparent)`,
                        color: badgeColor,
                      }}
                    >
                      {badge}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {fields.map((field) => (
                      <li key={field} className="flex items-start gap-1.5 text-[12px] text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0 bg-current opacity-40" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Similar tools callout */}
        <div
          className="mt-5 rounded-[8px] px-4 py-3 border flex items-start gap-3"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--mvf-light-blue) 8%, transparent)',
            borderColor: 'color-mix(in srgb, var(--mvf-light-blue) 30%, transparent)',
          }}
        >
          <Search className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--mvf-light-blue)' }} />
          <div>
            <p className="text-[12px] font-semibold text-foreground mb-0.5">Similar Tools Check</p>
            <p className="text-[12px] text-muted-foreground">
              Before submitting Phase 1, we show the maker similar existing tools — fuzzy match by name and description — to reduce duplication.
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. OVERSIGHT MODELS ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          AI Governance
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-2">
          Human Oversight Models
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Declared at registration. Reviewed on graduation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Human in the Loop',
              subtitle: 'Human approves every action before it takes effect',
              when: 'Irreversible actions, customer-facing, financial data, production changes',
              examples: ['Approving lead reassignment', 'Sending client emails', 'Modifying pricing'],
              tier: 'Green',
              color: '#22c55e',
              icon: UserCheck,
            },
            {
              title: 'Human on the Loop',
              subtitle: 'System operates autonomously; human monitors and can intervene',
              when: 'Low-risk, reversible, internal-only, errors easily corrected',
              examples: ['Generating internal reports', 'Updating team dashboards', 'Workflow automation'],
              tier: 'Red + Amber',
              color: '#f59e0b',
              icon: Eye,
            },
          ].map(({ title, subtitle, when, examples, tier, color, icon: Icon }) => (
            <div key={title} className="bg-card rounded-[8px] border border-border p-5 card-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="h-8 w-8 rounded-[6px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">{title}</p>
                  <p className="text-[12px] text-muted-foreground">{subtitle}</p>
                </div>
              </div>
              <div className="space-y-2.5 text-[12px]">
                <div>
                  <p className="text-muted-foreground font-medium mb-1">When to use</p>
                  <p className="text-foreground">{when}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Examples</p>
                  <ul className="space-y-0.5">
                    {examples.map((ex) => (
                      <li key={ex} className="flex items-center gap-1.5 text-foreground">
                        <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground">Typical tier: </span>
                  <span className="font-medium text-foreground">{tier}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. USER PERSONAS ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Users
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-6">
          Who Uses Launchpad
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              persona: 'The Maker',
              chip: 'Builder',
              chipColor: 'var(--mvf-purple)',
              icon: Hammer,
              goal: 'Build something useful quickly without compliance overhead.',
              pain: "Doesn't know where to start. Worried about doing it wrong.",
              value: '30-second registration, progressive governance, recognition.',
            },
            {
              persona: 'The Consumer',
              chip: 'User',
              chipColor: 'var(--mvf-light-blue)',
              icon: Search,
              goal: 'Find tools that solve real problems. Know what\'s safe to depend on.',
              pain: "Can't discover existing tools. Unclear which are official.",
              value: 'App Library with tier badges and clear support contacts.',
            },
            {
              persona: 'The Maintainer',
              chip: 'IT / Engineering',
              chipColor: 'var(--mvf-orange)',
              icon: Building2,
              goal: 'Support any tool without deep context. Apply security patches.',
              pain: 'Every tool is different. No docs. Can\'t access the maker\'s workspace.',
              value: 'Registry + handover guides + governance dashboard.',
            },
            {
              persona: 'The Leader',
              chip: 'Leadership',
              chipColor: 'var(--mvf-pink)',
              icon: Layers,
              goal: 'Encourage innovation while managing risk. See what\'s being built.',
              pain: "No visibility. Nervous about security exposure. Can't measure ROI.",
              value: 'Governance dashboard, tier system, and flag alerts.',
            },
          ].map(({ persona, chip, chipColor, icon: Icon, goal, pain, value }) => (
            <div key={persona} className="bg-card rounded-[8px] border border-border p-4 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 flex-shrink-0" style={{ color: chipColor }} />
                <span className="text-[13px] font-bold text-foreground">{persona}</span>
                <span
                  className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${chipColor} 15%, transparent)`,
                    color: chipColor,
                  }}
                >
                  {chip}
                </span>
              </div>
              <div className="space-y-2 text-[12px]">
                {[
                  { label: 'Goal', value: goal },
                  { label: 'Pain', value: pain },
                  { label: 'Launchpad gives them', value: value },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-muted-foreground font-medium">{label}: </span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 11. SUCCESS METRICS ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Measurement
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-6">
          Phase 1 Success Criteria
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { stat: '10+', label: 'tools registered' },
            { stat: '<1 min', label: 'registration time' },
            { stat: '0', label: 'API key incidents' },
            { stat: '3+', label: 'new untracked tools' },
            { stat: '100%', label: 'leadership visibility' },
          ].map(({ stat, label }) => (
            <div key={label} className="bg-card rounded-[8px] border border-border p-4 card-shadow text-center">
              <div className="text-[22px] font-bold tracking-tight mb-1" style={{ color: 'var(--mvf-pink)' }}>
                {stat}
              </div>
              <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 12. PHASING ── */}
      <section className="mb-14">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Delivery
        </p>
        <h2 className="text-[20px] font-bold tracking-tight text-foreground mb-2">
          Phasing
        </h2>
        <p className="text-[13px] text-muted-foreground mb-8">
          Progress at a glance — for product managers communicating with stakeholders.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-5 mb-8">
          {[
            { color: '#22c55e', label: 'Shipped' },
            { color: '#f59e0b', label: 'In progress' },
            { color: 'var(--mvf-light-blue)', label: 'Planned' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>

        {/* Vertical timeline */}
        <div className="relative">
          {[
            {
              phase: 'Phase 1',
              title: 'Registry MVP',
              status: 'complete' as const,
              statusLabel: 'Shipped',
              railColor: '#22c55e',
              groups: [
                {
                  label: 'Authentication',
                  items: [
                    { text: 'Google SSO sign-in and sign-out', done: true },
                    { text: 'Role-based access (Maker, Admin, Viewer)', done: true },
                    { text: 'Row-level security across all tables', done: true },
                  ],
                },
                {
                  label: 'Registration',
                  items: [
                    { text: '4-step animated registration wizard with per-step validation', done: true },
                    { text: 'Similar tools fuzzy match (pg_trgm) before submission', done: true },
                    { text: 'Red / Amber / Green tier assignment', done: true },
                  ],
                },
                {
                  label: 'Maker Experience',
                  items: [
                    { text: 'Maker dashboard — My Apps with capacity indicator', done: true },
                    { text: 'App profile pages with ownership, flags, and admin controls', done: true },
                    { text: 'Deletion flow — admins delete, makers request with justification', done: true },
                    { text: 'App Library — browse, search, filter by tier and layer', done: true },
                  ],
                },
                {
                  label: 'Governance',
                  items: [
                    { text: 'Governance dashboard — landscape grid by layer × tier', done: true },
                    { text: 'Risk flags list with resolve controls', done: true },
                    { text: 'Admin tier change controls', done: true },
                  ],
                },
                {
                  label: 'Quality',
                  items: [
                    { text: '78 tests across 8 suites — zero TypeScript errors', done: true },
                    { text: '3 amnesty apps and 8 demo apps seeded', done: true },
                  ],
                },
              ],
            },
            {
              phase: 'Phase 2',
              title: 'Adoption & Governance',
              status: 'in-progress' as const,
              statusLabel: 'In progress',
              railColor: '#f59e0b',
              groups: [
                {
                  label: 'Shipped',
                  items: [
                    { text: 'Section-based inline editing on app profiles (Identity, Context, Data & Security, Third-Party)', done: true },
                    { text: 'Progressive registration — fields grow with tool maturity', done: true },
                    { text: 'Auto-create risk flags when PII or data fields are marked Unsure or Yes', done: true },
                    { text: 'PATCH and DELETE endpoints hardened with Zod validation and auth checks', done: true },
                    { text: 'Login page — two-panel layout with audience cards and tier blocks', done: true },
                    { text: 'Light/dark theme toggle in sidebar', done: true },
                    { text: 'Framer Motion animations — page transitions, card stagger, browse grid', done: true },
                    { text: 'Deploy to Vercel — live at mvf-launchpad.vercel.app with Google OAuth', done: true },
                    { text: 'Automated risk flags — stale owner (90 days), capacity exceeded, dormancy attestation (60 days) — daily Vercel cron', done: true },
                    { text: 'Dormancy attestation — owners self-resolve via "Confirm active" button on app profile', done: true },
                    { text: 'Governance flags UX — description rows, System/Admin source badge, isAdmin gate, dormancy resolved via confirm-active', done: true },
                    { text: '170 tests across 15 suites — zero TypeScript errors', done: true },
                  ],
                },
                {
                  label: 'Up next',
                  items: [
                    { text: 'Amplitude integration — usage analytics and WAU tracking per app (also unblocks high-WAU Red-tier flag)', done: false },
                    { text: 'Slack notifications — admin alerts for new registrations, flag escalations, tier change requests', done: false },
                    { text: 'Maker status changes — move apps through intent → developing → testing → active', done: false },
                    { text: 'Backup owner management — add and remove backup owners on app profile', done: false },
                  ],
                },
              ],
            },
            {
              phase: 'Phase 3',
              title: 'Ingestion & Scale',
              status: 'planned' as const,
              statusLabel: 'Planned',
              railColor: 'var(--mvf-light-blue)',
              groups: [
                {
                  label: 'Planned',
                  items: [
                    { text: 'Automatic app ingestion — detect tools from Vercel, GitHub, and Lovable via API', done: false },
                    { text: 'Tool health dashboard — uptime, error rates, deployment frequency', done: false },
                    { text: 'Cost tracking — API spend and infrastructure costs per app', done: false },
                    { text: 'Graduation criteria automation — auto-suggest tier upgrades based on maturity signals', done: false },
                    { text: 'Handover readiness scoring — assess whether an app can survive its maker leaving', done: false },
                    { text: 'Cross-team discovery — recommend tools from other departments solving similar problems', done: false },
                  ],
                },
              ],
            },
          ].map((phase, phaseIdx, phases) => {
            const isComplete = phase.status === 'complete';
            const isInProgress = phase.status === 'in-progress';
            const isPlanned = phase.status === 'planned';
            const isLast = phaseIdx === phases.length - 1;

            const nodeStyle = {
              complete: { bg: '#22c55e', border: '#22c55e' },
              'in-progress': { bg: '#f59e0b', border: '#f59e0b' },
              planned: { bg: 'transparent', border: 'var(--mvf-light-blue)' },
            }[phase.status];

            return (
              <div key={phase.phase} className="relative flex gap-6">
                {/* Rail column */}
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '32px' }}>
                  {/* Node */}
                  <div
                    className="relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: nodeStyle.bg,
                      border: `2px solid ${nodeStyle.border}`,
                      boxShadow: isInProgress ? `0 0 0 4px color-mix(in srgb, ${phase.railColor} 20%, transparent)` : undefined,
                    }}
                  >
                    {isComplete && <Check className="h-4 w-4 text-white" />}
                    {isInProgress && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                    {isPlanned && (
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--mvf-light-blue)' }} />
                    )}
                  </div>
                  {/* Vertical rail line */}
                  {!isLast && (
                    <div
                      className="flex-1 w-px mt-2"
                      style={{
                        background: isComplete
                          ? '#22c55e'
                          : isInProgress
                          ? `linear-gradient(to bottom, #f59e0b 40%, color-mix(in srgb, var(--mvf-light-blue) 40%, transparent))`
                          : 'color-mix(in srgb, var(--mvf-light-blue) 30%, transparent)',
                        minHeight: '24px',
                      }}
                    />
                  )}
                </div>

                {/* Card content */}
                <div className="flex-1 min-w-0 pb-10">
                  {/* Phase header */}
                  <div className="flex items-center gap-3 mb-4" style={{ marginTop: '4px' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{phase.phase}</span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${phase.railColor} 15%, transparent)`,
                            color: phase.railColor,
                          }}
                        >
                          {phase.statusLabel}
                        </span>
                      </div>
                      <h3 className="text-[17px] font-bold tracking-tight text-foreground">{phase.title}</h3>
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="space-y-5">
                    {phase.groups.map((group) => (
                      <div key={group.label}>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          {group.label}
                        </p>
                        <div className="space-y-1.5">
                          {group.items.map((item) => (
                            <div key={item.text} className="flex items-start gap-2.5">
                              {/* Checkbox */}
                              <div
                                className="mt-0.5 h-4 w-4 rounded-[4px] flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: item.done
                                    ? '#22c55e'
                                    : isPlanned
                                    ? 'transparent'
                                    : 'transparent',
                                  border: item.done
                                    ? '1.5px solid #22c55e'
                                    : isPlanned
                                    ? '1.5px dashed color-mix(in srgb, var(--mvf-light-blue) 50%, transparent)'
                                    : '1.5px solid color-mix(in srgb, #f59e0b 50%, transparent)',
                                }}
                              >
                                {item.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                              </div>
                              <span
                                className="text-[12px] leading-relaxed"
                                style={{
                                  color: item.done
                                    ? 'var(--muted-foreground)'
                                    : isPlanned
                                    ? 'var(--muted-foreground)'
                                    : 'var(--foreground)',
                                  opacity: item.done ? 0.7 : isPlanned ? 0.5 : 1,
                                }}
                              >
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border pt-6 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          MVF Launchpad PRD · v1.1 · 31 March 2026 · Ian Hitge
        </p>
        <p className="text-[11px] text-muted-foreground">
          Stakeholders: Michael Johnson
        </p>
      </footer>
    </div>
  );
}
