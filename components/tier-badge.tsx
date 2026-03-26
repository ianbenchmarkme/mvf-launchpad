import { TIER_LABELS } from '@/lib/constants';
import type { AppTier } from '@/lib/supabase/types';

const tierStyles: Record<AppTier, string> = {
  red: 'bg-red-100 text-red-800 border-red-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

interface TierBadgeProps {
  tier: AppTier;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tierStyles[tier]} ${className}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
