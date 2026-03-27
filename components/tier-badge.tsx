import { FlaskConical, ShieldCheck, BadgeCheck } from 'lucide-react';
import { TIER_LABELS, TIER_TOOLTIPS } from '@/lib/constants';
import { Tooltip } from '@/components/tooltip';
import type { AppTier } from '@/lib/supabase/types';

const tierConfig: Record<AppTier, {
  styles: string;
  dotColor: string;
  Icon: typeof FlaskConical;
}> = {
  red: {
    styles: 'bg-red-500/8 text-red-500 border-red-500/10',
    dotColor: 'bg-red-500',
    Icon: FlaskConical,
  },
  amber: {
    styles: 'bg-amber-500/8 text-amber-600 border-amber-500/10',
    dotColor: 'bg-amber-500',
    Icon: ShieldCheck,
  },
  green: {
    styles: 'bg-emerald-500/8 text-emerald-600 border-emerald-500/10',
    dotColor: 'bg-emerald-500',
    Icon: BadgeCheck,
  },
};

interface TierBadgeProps {
  tier: AppTier;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const { styles, Icon } = tierConfig[tier];
  return (
    <Tooltip text={TIER_TOOLTIPS[tier]}>
      <span
        className={`inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 text-[11px] font-medium leading-none ${styles} ${className}`}
      >
        <Icon className="h-3 w-3" />
        {TIER_LABELS[tier]}
      </span>
    </Tooltip>
  );
}
