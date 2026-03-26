import Link from 'next/link';
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
      className="group relative flex flex-col rounded-[8px] border border-mvf-dark-blue/6 bg-white py-5 px-6 min-h-[140px] shadow-xs transition-all duration-150 hover:border-mvf-purple/20 hover:shadow-md dark:border-white/6 dark:bg-[#161650] dark:hover:border-mvf-purple/25"
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${accentColor[app.tier]} opacity-60 group-hover:opacity-100 transition-opacity duration-150`} />

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-card-foreground group-hover:text-mvf-purple transition-colors duration-150">
          {app.name}
        </h3>
        <TierBadge tier={app.tier} className="shrink-0" />
      </div>
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
