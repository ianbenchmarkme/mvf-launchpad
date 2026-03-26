interface CapacityIndicatorProps {
  used: number;
  limit: number;
}

export function CapacityIndicator({ used, limit }: CapacityIndicatorProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  const isWarning = percentage >= 80 && percentage < 100;
  const isFull = percentage >= 100;

  let barColor = 'bg-mvf-light-blue';
  if (isFull) barColor = 'bg-red-500';
  else if (isWarning) barColor = 'bg-amber-500';

  let stateClass = '';
  if (isFull) stateClass = 'text-red-500';
  else if (isWarning) stateClass = 'text-amber-500 warning';

  return (
    <div className={`space-y-1.5 ${stateClass}`}>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-semibold tabular-nums">{used}</span>
        <span className="text-muted-foreground text-[12px]">/ {limit} points</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
