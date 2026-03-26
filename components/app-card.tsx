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
      className="block rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-card-foreground">{app.name}</h3>
        <TierBadge tier={app.tier} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {app.problem_statement}
      </p>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{LAYER_LABELS[app.layer]}</span>
        <span>·</span>
        <span>{STATUS_LABELS[app.status]}</span>
      </div>
    </Link>
  );
}
