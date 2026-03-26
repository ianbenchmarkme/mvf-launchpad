'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Flag, Check } from 'lucide-react';
import type { AppTier, FlagType, FlagSeverity } from '@/lib/supabase/types';
import { TIER_LABELS } from '@/lib/constants';

interface AdminActionsProps {
  appId: string;
  currentTier: AppTier;
}

const TIERS: AppTier[] = ['red', 'amber', 'green'];

const FLAG_OPTIONS: { type: FlagType; label: string; severity: FlagSeverity }[] = [
  { type: 'no_backup', label: 'No backup owner', severity: 'warning' },
  { type: 'pii_undisclosed', label: 'PII undisclosed', severity: 'critical' },
  { type: 'stale_owner', label: 'Stale owner', severity: 'warning' },
  { type: 'manual', label: 'Manual flag', severity: 'info' },
];

const tierColors: Record<AppTier, string> = {
  red: 'border-red-300 bg-red-50 text-red-800',
  amber: 'border-amber-300 bg-amber-50 text-amber-800',
  green: 'border-emerald-300 bg-emerald-50 text-emerald-800',
};

const tierColorsActive: Record<AppTier, string> = {
  red: 'border-red-500 bg-red-100 text-red-900 ring-2 ring-red-200',
  amber: 'border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-200',
  green: 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-200',
};

export function AdminActions({ appId, currentTier }: AdminActionsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tierSuccess, setTierSuccess] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<typeof FLAG_OPTIONS[0] | null>(null);
  const [flagDescription, setFlagDescription] = useState('');

  async function changeTier(tier: AppTier) {
    if (tier === currentTier) return;
    setSaving(true);
    setTierSuccess(false);
    try {
      const res = await fetch(`/api/apps/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        setTierSuccess(true);
        setTimeout(() => setTierSuccess(false), 2000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function addFlag() {
    if (!selectedFlag) return;
    setSaving(true);
    setFlagSuccess(false);
    try {
      const res = await fetch(`/api/apps/${appId}/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_type: selectedFlag.type,
          severity: selectedFlag.severity,
          description: flagDescription || undefined,
        }),
      });
      if (res.ok) {
        setFlagSuccess(true);
        setSelectedFlag(null);
        setFlagDescription('');
        setTimeout(() => setFlagSuccess(false), 2000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Tier Change */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-mvf-purple" />
          Change Tier
        </h3>
        <div className="flex gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              disabled={saving}
              onClick={() => changeTier(tier)}
              className={`flex-1 rounded border px-3 py-2 text-sm font-medium transition-all duration-150 disabled:opacity-50 ${
                tier === currentTier
                  ? tierColorsActive[tier]
                  : `${tierColors[tier]} hover:opacity-80`
              }`}
            >
              {TIER_LABELS[tier]}
            </button>
          ))}
        </div>
        {tierSuccess && (
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Tier updated
          </p>
        )}
      </div>

      {/* Add Flag */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Flag className="h-4 w-4 text-mvf-purple" />
          Add Risk Flag
        </h3>
        <div className="flex flex-wrap gap-2">
          {FLAG_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setSelectedFlag(selectedFlag?.type === opt.type ? null : opt)}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                selectedFlag?.type === opt.type
                  ? 'border-mvf-purple bg-mvf-purple/10 text-mvf-purple'
                  : 'border-input bg-background hover:border-mvf-purple/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {selectedFlag && (
          <div className="space-y-2">
            <input
              type="text"
              value={flagDescription}
              onChange={(e) => setFlagDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple"
            />
            <button
              type="button"
              disabled={saving}
              onClick={addFlag}
              className="rounded bg-mvf-pink px-4 py-2 text-sm font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50"
            >
              Add Flag
            </button>
          </div>
        )}
        {flagSuccess && (
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Flag added
          </p>
        )}
      </div>
    </div>
  );
}
