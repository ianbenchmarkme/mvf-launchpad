import { TIER_LABELS } from '@/lib/constants';
import type { AppTier } from '@/lib/supabase/types';

const tierStyles: Record<AppTier, string> = {
  red: 'bg-red-500/10 text-red-600 border-red-500/15',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/15',
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15',
};

interface TierBadgeProps {
  tier: AppTier;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[5px] border px-1.5 py-0.5 text-[11px] font-medium leading-none ${tierStyles[tier]} ${className}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
