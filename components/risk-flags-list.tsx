'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import type { RiskFlag } from '@/lib/supabase/types';

interface RiskFlagsListProps {
  flags: RiskFlag[];
  isAdmin: boolean;
}

export function RiskFlagsList({ flags, isAdmin }: RiskFlagsListProps) {
  const router = useRouter();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

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

  if (flags.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Active Flags</h2>
      <ul className="space-y-2">
        {flags.map((flag) => (
          <li
            key={flag.id}
            className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
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
                className="flex items-center gap-1 rounded border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 shrink-0"
              >
                <CheckCircle className="h-3 w-3" />
                {resolvingId === flag.id ? 'Resolving...' : 'Resolve'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
