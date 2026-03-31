'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Bot, User } from 'lucide-react';
import type { RiskFlag } from '@/lib/supabase/types';

interface GovernanceFlag extends RiskFlag {
  apps: { name: string } | null;
}

interface GovernanceFlagsListProps {
  flags: GovernanceFlag[];
  isAdmin: boolean;
}

function SourceBadge({ createdBy }: { createdBy: string | null }) {
  const isSystem = createdBy === null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 text-[11px] font-medium leading-none shrink-0 ${
        isSystem
          ? 'bg-mvf-light-blue/8 text-mvf-light-blue border-mvf-light-blue/10'
          : 'bg-mvf-purple/8 text-mvf-purple border-mvf-purple/10'
      }`}
    >
      {isSystem ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
      {isSystem ? 'System' : 'Admin'}
    </span>
  );
}

export function GovernanceFlagsList({ flags, isAdmin }: GovernanceFlagsListProps) {
  const router = useRouter();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function resolveFlag(flag: GovernanceFlag) {
    setResolvingId(flag.id);
    try {
      // dormancy_attestation must go through confirm-active to update last_activity_at,
      // otherwise the cron will immediately re-raise the flag on the next run
      const endpoint =
        flag.flag_type === 'dormancy_attestation'
          ? `/api/apps/${flag.app_id}/confirm-active`
          : `/api/flags/${flag.id}`;
      const method = flag.flag_type === 'dormancy_attestation' ? 'POST' : 'PATCH';
      const res = await fetch(endpoint, { method });
      if (res.ok) router.refresh();
    } finally {
      setResolvingId(null);
    }
  }

  if (flags.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Active Risk Flags ({flags.length})
      </h2>
      <ul className="space-y-2">
        {flags.map((flag) => (
          <li
            key={flag.id}
            className="flex items-start gap-3 rounded-[6px] border px-4 py-3 text-[13px]"
          >
            {/* Severity dot — mt-[3px] optically centres with first text line */}
            <span
              className={`mt-[3px] h-2 w-2 rounded-full shrink-0 ${
                flag.severity === 'critical'
                  ? 'bg-red-500'
                  : flag.severity === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
            />

            {/* Main content column */}
            <div className="flex-1 min-w-0 space-y-0.5">
              {/* Row 1: app link + flag type + source badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={`/apps/${flag.app_id}`}
                  className="font-medium text-mvf-purple hover:underline shrink-0"
                >
                  {flag.apps?.name || 'Unknown app'}
                </a>
                <span className="text-muted-foreground capitalize">
                  {flag.flag_type.replace(/_/g, ' ')}
                </span>
                <SourceBadge createdBy={flag.created_by} />
              </div>

              {/* Row 2: description when present */}
              {flag.description && (
                <p className="text-[12px] text-muted-foreground">
                  {flag.description}
                </p>
              )}
            </div>

            {/* Resolve button — admin only, aligned to top of row */}
            {isAdmin && (
              <button
                type="button"
                disabled={resolvingId === flag.id}
                onClick={() => resolveFlag(flag)}
                className="flex items-center gap-1 rounded-[6px] border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 shrink-0"
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
