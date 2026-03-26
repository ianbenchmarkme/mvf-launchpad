import Link from 'next/link';
import { TierBadge } from '@/components/tier-badge';
import { LAYER_LABELS, STATUS_LABELS } from '@/lib/constants';
import type { App } from '@/lib/supabase/types';

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Link
      href={`/apps/${app.id}`}
      className="group block rounded-[8px] border bg-card p-4 transition-all duration-150 hover:border-mvf-purple/20 hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-card-foreground group-hover:text-mvf-purple transition-colors duration-150">
          {app.name}
        </h3>
        <TierBadge tier={app.tier} />
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
        {app.problem_statement}
      </p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground/70">
        <span>{LAYER_LABELS[app.layer]}</span>
        <span className="opacity-30">·</span>
        <span>{STATUS_LABELS[app.status]}</span>
      </div>
    </Link>
  );
}
