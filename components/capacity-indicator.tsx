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

  const emptyBg = isSidebar ? 'bg-sidebar-foreground/10' : 'bg-muted';

  return (
    <div className={`space-y-1.5 ${stateClass}`}>
      {/* Header row: "Capacity  4 / 5 points" (sidebar) or "4  / 5 points" (default) */}
      <div className="flex items-baseline justify-between">
        {isSidebar && (
          <span className="text-[11px] font-medium text-sidebar-foreground/40">Capacity</span>
        )}
        <span className={`tabular-nums ${isSidebar ? 'text-[11px] text-sidebar-foreground/40' : 'text-[13px] text-muted-foreground'}`}>
          <span className={`font-semibold ${isSidebar ? 'text-sidebar-foreground' : ''}`}>{used}</span>
          {' / '}{limit} points
        </span>
      </div>

      {/* 5 discrete dashes */}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex gap-1"
      >
        {Array.from({ length: limit }, (_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full overflow-hidden ${emptyBg}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${used > i ? barColor : ''}`}
              style={{ width: used > i ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
