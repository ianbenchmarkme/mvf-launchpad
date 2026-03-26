import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { TierBadge } from '@/components/tier-badge';
import { LAYER_LABELS, STATUS_LABELS } from '@/lib/constants';
import type { App, AppTier } from '@/lib/supabase/types';

const accentColor: Record<AppTier, string> = {
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
};

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Link
      href={`/apps/${app.id}`}
      className="group relative block rounded-[8px] border border-mvf-dark-blue/8 bg-mvf-dark-blue/[0.02] p-4 pl-5 transition-all duration-150 hover:border-mvf-purple/20 hover:bg-mvf-dark-blue/[0.04] hover:shadow-sm dark:border-white/6 dark:bg-white/[0.03] dark:hover:border-mvf-purple/25 dark:hover:bg-white/[0.05]"
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${accentColor[app.tier]} opacity-60 group-hover:opacity-100 transition-opacity duration-150`} />

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-card-foreground group-hover:text-mvf-purple transition-colors duration-150">
          {app.name}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <TierBadge tier={app.tier} />
          <ArrowUpRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all duration-150" />
        </div>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
        {app.problem_statement}
      </p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground/50">
        <span>{LAYER_LABELS[app.layer]}</span>
        <span className="opacity-30">·</span>
        <span>{STATUS_LABELS[app.status]}</span>
      </div>
    </Link>
  );
}
