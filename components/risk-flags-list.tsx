'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import type { RiskFlag } from '@/lib/supabase/types';

interface RiskFlagsListProps {
  flags: RiskFlag[];
  isAdmin: boolean;
  appId?: string;
  isOwner?: boolean;
}

export function RiskFlagsList({ flags, isAdmin, appId = '', isOwner = false }: RiskFlagsListProps) {
  const router = useRouter();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function resolveFlag(flagId: string) {
    setResolvingId(flagId);
    try {
      const res = await fetch(`/api/flags/${flagId}`, { method: 'PATCH' });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setResolvingId(null);
    }
  }

  async function confirmActive(flagId: string) {
    setConfirmingId(flagId);
    try {
      const res = await fetch(`/api/apps/${appId}/confirm-active`, { method: 'POST' });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setConfirmingId(null);
    }
  }

  if (flags.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Active Flags</h2>
      <ul className="space-y-2">
        {flags.map((flag) => (
          <li
            key={flag.id}
            className="flex items-center gap-2 rounded-[6px] border px-3 py-2 text-[13px]"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${
              flag.severity === 'critical' ? 'bg-red-500' :
              flag.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
            <span className="capitalize flex-1">{flag.flag_type.replace(/_/g, ' ')}</span>
            {flag.description && (
              <span className="text-muted-foreground text-xs hidden sm:inline">
                {flag.description.length > 50
                  ? flag.description.slice(0, 50) + '…'
                  : flag.description}
              </span>
            )}
            {isAdmin && (
              <button
                type="button"
                disabled={resolvingId === flag.id}
                onClick={() => resolveFlag(flag.id)}
                className="flex items-center gap-1 rounded-[6px] border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 shrink-0"
              >
                <CheckCircle className="h-3 w-3" />
                {resolvingId === flag.id ? 'Resolving...' : 'Resolve'}
              </button>
            )}
            {isOwner && flag.flag_type === 'dormancy_attestation' && (
              <button
                type="button"
                disabled={confirmingId === flag.id}
                onClick={() => confirmActive(flag.id)}
                className="flex items-center gap-1 rounded-[6px] border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 shrink-0"
              >
                <CheckCircle className="h-3 w-3" />
                {confirmingId === flag.id ? 'Confirming...' : 'Confirm active'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
