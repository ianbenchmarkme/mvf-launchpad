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
      className="group relative flex flex-col rounded-[8px] border border-mvf-dark-blue/8 bg-mvf-dark-blue/[0.02] p-5 pl-6 min-h-[140px] transition-all duration-150 hover:border-mvf-purple/20 hover:bg-mvf-dark-blue/[0.04] hover:shadow-sm dark:border-white/6 dark:bg-white/[0.03] dark:hover:border-mvf-purple/25 dark:hover:bg-white/[0.05]"
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${accentColor[app.tier]} opacity-60 group-hover:opacity-100 transition-opacity duration-150`} />

      {/* Tier badge — top right, aligned with card padding */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5">
        <TierBadge tier={app.tier} />
        <ArrowUpRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all duration-150" />
      </div>

      <h3 className="text-[13px] font-semibold text-card-foreground group-hover:text-mvf-purple transition-colors duration-150 pr-24">
        {app.name}
      </h3>
      <p className="mt-2 text-[12px] leading-[1.6] text-foreground/60 dark:text-white/50 line-clamp-4 flex-1">
        {app.problem_statement}
      </p>
      <div className="mt-3 pt-3 border-t border-mvf-dark-blue/5 dark:border-white/5 flex items-center gap-2 text-[11px] text-foreground/45 dark:text-white/40">
        <span>{LAYER_LABELS[app.layer]}</span>
        <span className="opacity-40">·</span>
        <span>{STATUS_LABELS[app.status]}</span>
      </div>
    </Link>
  );
}
