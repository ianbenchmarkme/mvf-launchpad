interface CapacityIndicatorProps {
  used: number;
  limit: number;
  variant?: 'default' | 'sidebar';
}

export function CapacityIndicator({ used, limit, variant = 'default' }: CapacityIndicatorProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  const isWarning = percentage >= 80 && percentage < 100;
  const isFull = percentage >= 100;

  let barColor = 'bg-mvf-light-blue';
  if (isFull) barColor = 'bg-red-500';
  else if (isWarning) barColor = 'bg-amber-500';

  const isSidebar = variant === 'sidebar';

  let stateClass = '';
  if (isFull) stateClass = 'text-red-500';
  else if (isWarning) stateClass = 'text-amber-500 warning';

  return (
    <div className={`space-y-1.5 ${stateClass}`}>
      <div className={`flex items-baseline justify-between ${isSidebar ? 'text-[12px]' : 'text-[13px]'}`}>
        <span className={`font-semibold tabular-nums ${isSidebar ? 'text-sidebar-foreground' : ''}`}>{used}</span>
        <span className={isSidebar ? 'text-sidebar-foreground/40 text-[11px]' : 'text-muted-foreground text-[12px]'}>/ {limit} points</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`h-1.5 w-full rounded-full overflow-hidden ${isSidebar ? 'bg-sidebar-foreground/10' : 'bg-muted'}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
