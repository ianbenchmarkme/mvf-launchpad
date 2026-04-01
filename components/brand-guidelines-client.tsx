'use client';

import { useState } from 'react';
import { Check, Copy, HardHat } from 'lucide-react';
import { TierBadge } from '@/components/tier-badge';

const BRAND_COLOURS = [
  { name: 'MVF Pink', hex: '#FF00A5', var: '--mvf-pink', usage: 'Primary CTAs' },
  { name: 'MVF Orange', hex: '#FF5A41', var: '--mvf-orange', usage: 'Accents' },
  { name: 'MVF Dark Blue', hex: '#0F0F4B', var: '--mvf-dark-blue', usage: 'Sidebar, dark bg' },
  { name: 'MVF Purple', hex: '#8264C8', var: '--mvf-purple', usage: 'Active states, admin' },
  { name: 'MVF Yellow', hex: '#FADC28', var: '--mvf-yellow', usage: 'Highlights' },
  { name: 'MVF Light Grey', hex: '#DCDCDC', var: '--mvf-light-grey', usage: 'Borders, muted bg' },
  { name: 'MVF Light Blue', hex: '#00C8C8', var: '--mvf-light-blue', usage: 'Capacity bar, completed steps' },
  { name: 'MVF Dark Grey', hex: '#64788C', var: '--mvf-dark-grey', usage: 'Metadata text' },
];

const SEMANTIC_TOKENS = [
  { name: 'Background', light: '#f0f0f5', dark: '#0F0F4B', var: '--background' },
  { name: 'Card', light: '#f8f8fb', dark: '#16165a', var: '--card' },
  { name: 'Foreground', light: '#1a1a2e', dark: '#f0f0f5', var: '--foreground' },
  { name: 'Muted Foreground', light: '#52526b', dark: 'rgba(255,255,255,0.55)', var: '--muted-foreground' },
  { name: 'Border', light: 'rgba(0,0,0,0.08)', dark: 'rgba(255,255,255,0.10)', var: '--border' },
  { name: 'Sidebar', light: '#08082A', dark: '#08082A', var: '--sidebar' },
  { name: 'Primary', light: '#FF00A5', dark: '#FF00A5', var: '--primary' },
];

const SPACING_SCALE = [4, 8, 12, 16, 24, 32];
const RADII = [
  { label: '6px — controls', px: 6 },
  { label: '8px — cards', px: 8 },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card card-shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ColourSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="text-left group rounded-lg overflow-hidden border border-border hover:border-[var(--mvf-purple)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      title={`Copy ${hex}`}
    >
      <div className="h-16 w-full" style={{ backgroundColor: hex }} />
      <div className="px-3 py-2 bg-card">
        <div className="flex items-center justify-between gap-1">
          <p className="text-[13px] font-medium text-foreground truncate">{name}</p>
          <span className="shrink-0 text-muted-foreground transition-colors duration-150">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono">{hex}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{usage}</p>
      </div>
    </button>
  );
}

export function BrandGuidelinesClient() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Brand Guidelines</h1>
          <p className="text-sm text-muted-foreground mt-1">Design language for apps built on MVF Launchpad</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium border"
          style={{
            backgroundColor: 'var(--wip-badge-bg)',
            borderColor: 'var(--wip-badge-border)',
            color: 'var(--wip-badge-text)',
          }}>
          <HardHat className="h-3.5 w-3.5" />
          Work in Progress
        </span>
      </div>

      {/* Colour Palette */}
      <SectionCard title="Colour Palette">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BRAND_COLOURS.map((c) => (
            <ColourSwatch key={c.hex} name={c.name} hex={c.hex} usage={c.usage} />
          ))}
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">Click any swatch to copy the hex value.</p>
      </SectionCard>

      {/* Semantic Tokens */}
      <SectionCard title="Semantic Tokens">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">Token</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">Light</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">Dark</th>
                <th className="text-left py-2 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">CSS Variable</th>
              </tr>
            </thead>
            <tbody>
              {SEMANTIC_TOKENS.map((t) => (
                <tr key={t.var} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{t.name}</td>
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded border border-border shrink-0" style={{ backgroundColor: t.light }} />
                      <code className="text-[11px] font-mono text-muted-foreground">{t.light}</code>
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded border border-border shrink-0" style={{ backgroundColor: t.dark }} />
                      <code className="text-[11px] font-mono text-muted-foreground">{t.dark}</code>
                    </span>
                  </td>
                  <td className="py-2.5">
                    <code className="text-[11px] font-mono text-muted-foreground">{t.var}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">Always use semantic tokens — never hardcode hex values in components. This ensures correct light/dark rendering.</p>
      </SectionCard>

      {/* Typography */}
      <SectionCard title="Typography">
        <div className="space-y-5">
          <div className="pb-4 border-b border-border last:border-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Display Heading — text-2xl, font-semibold, tracking-tight</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">The quick brown fox jumps</p>
          </div>
          <div className="pb-4 border-b border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Section Heading — text-lg, font-semibold</p>
            <p className="text-lg font-semibold text-foreground">The quick brown fox jumps</p>
          </div>
          <div className="pb-4 border-b border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Body — text-sm, 14px</p>
            <p className="text-sm text-foreground">The quick brown fox jumps over the lazy dog. Used for all primary content, form labels, and descriptive text throughout the interface.</p>
          </div>
          <div className="pb-4 border-b border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Small / Muted — text-[13px], text-muted-foreground</p>
            <p className="text-[13px] text-muted-foreground">The quick brown fox jumps over the lazy dog. Used for secondary information, timestamps, and metadata.</p>
          </div>
          <div className="pb-4 border-b border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Label — text-xs, uppercase, tracking-wider</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Column Header / Field Label</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Font Stack</p>
            <code className="text-[13px] font-mono text-foreground">Inter → system-ui → -apple-system → sans-serif</code>
          </div>
        </div>
      </SectionCard>

      {/* Buttons */}
      <SectionCard title="Buttons">
        <div className="flex flex-wrap gap-3 items-center">
          <button className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-90" style={{ backgroundColor: 'var(--mvf-pink)' }}>
            Primary
          </button>
          <button className="px-4 py-2 rounded-[6px] text-[13px] font-medium border border-border text-foreground bg-transparent hover:bg-accent transition-colors duration-150">
            Secondary
          </button>
          <button className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 transition-colors duration-150">
            Destructive
          </button>
          <button className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-foreground hover:bg-accent transition-colors duration-150">
            Ghost
          </button>
          <button className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-90" style={{ backgroundColor: 'var(--mvf-purple)' }}>
            Admin
          </button>
          <button className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium border border-border text-foreground bg-transparent hover:bg-accent transition-colors duration-150">
            Small
          </button>
          <button disabled className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-white opacity-40 cursor-not-allowed" style={{ backgroundColor: 'var(--mvf-pink)' }}>
            Disabled
          </button>
        </div>
        <div className="mt-4 text-[12px] text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">Primary:</span> MVF Pink — Register, Next, Submit, Save</p>
          <p><span className="font-medium text-foreground">Admin:</span> MVF Purple — tier changes, flag actions</p>
          <p><span className="font-medium text-foreground">Destructive:</span> Red — delete, irreversible actions</p>
        </div>
      </SectionCard>

      {/* Tier Badges */}
      <SectionCard title="Tier Badges">
        <div className="space-y-3">
          {([
            { tier: 'red' as const, when: 'Maker-built, unreviewed. Not formally assessed. Use with caution.' },
            { tier: 'amber' as const, when: 'Reviewed and verified. Suitable for team-wide use.' },
            { tier: 'green' as const, when: 'Fully supported by a product team. Production-grade.' },
          ]).map(({ tier, when }) => (
            <div key={tier} className="flex items-start gap-4 py-3 border-b border-border last:border-0">
              <div className="pt-0.5">
                <TierBadge tier={tier} />
              </div>
              <p className="text-[13px] text-muted-foreground">{when}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Spacing & Radius */}
      <SectionCard title="Spacing & Radius">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Spacing Scale (4px base unit)</p>
            <div className="flex items-end gap-4 flex-wrap">
              {SPACING_SCALE.map((px) => (
                <div key={px} className="flex flex-col items-center gap-1.5">
                  <div className="rounded" style={{ width: px, height: px, backgroundColor: 'var(--mvf-purple)' }} />
                  <span className="text-[11px] text-muted-foreground font-mono">{px}px</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Border Radius</p>
            <div className="flex items-center gap-6 flex-wrap">
              {RADII.map(({ label, px }) => (
                <div key={px} className="flex flex-col items-center gap-2">
                  <div className="h-10 w-16 border-2 border-[var(--mvf-purple)]" style={{ borderRadius: px }} />
                  <span className="text-[11px] text-muted-foreground text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Tone of Voice */}
      <SectionCard title="Tone of Voice">
        <p className="text-[13px] text-foreground mb-4">Plain English. Direct. No jargon. Write for people who are busy, not for people trying to sound clever.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg p-4 border border-border" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 6%, transparent)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">Avoid</p>
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              <li>"Leverage our paradigm-shifting solution"</li>
              <li>"Utilise the functionality herein"</li>
              <li>"This system facilitates the optimisation of…"</li>
              <li>"Please be advised that your submission was received"</li>
            </ul>
          </div>
          <div className="rounded-lg p-4 border border-border" style={{ backgroundColor: 'color-mix(in srgb, #10b981 6%, transparent)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">Use instead</p>
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              <li>"Register your tool"</li>
              <li>"Use this feature"</li>
              <li>"This helps you…"</li>
              <li>"Your app was submitted"</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">Keep labels short, CTAs action-first ("Register App", not "App Registration"), and error messages specific ("Name is required", not "Validation failed").</p>
      </SectionCard>

      {/* Usage Notes for Lovable */}
      <SectionCard title="Usage Notes for Lovable & External Builders">
        <div className="rounded-lg border border-border p-4 space-y-3" style={{ backgroundColor: 'color-mix(in srgb, var(--mvf-purple) 6%, transparent)' }}>
          <ul className="space-y-2 text-[13px] text-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--mvf-pink)' }}>1</span>
              <span>Use <strong>Inter</strong> as your primary font. Fall back to <code className="font-mono text-[12px]">system-ui, sans-serif</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--mvf-pink)' }}>2</span>
              <span>Respect the <strong>14px base font size</strong> and compact density. Avoid large whitespace-heavy layouts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--mvf-pink)' }}>3</span>
              <span>Keep all primary CTAs (submit, save, next) in <strong>MVF Pink (#FF00A5)</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--mvf-pink)' }}>4</span>
              <span>Keep sidebars and navigation areas in <strong>MVF Dark Blue (#0F0F4B)</strong> or darker.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--mvf-pink)' }}>5</span>
              <span>Use <strong>6px radius</strong> for inputs/buttons and <strong>8px radius</strong> for cards and containers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--mvf-pink)' }}>6</span>
              <span>Use MVF Purple (<code className="font-mono text-[12px]">#8264C8</code>) for active states, focus rings, and admin-level actions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--mvf-pink)' }}>7</span>
              <span>Support dark mode. Use CSS variables — never hardcode colours in components.</span>
            </li>
          </ul>
        </div>
      </SectionCard>
    </div>
  );
}
