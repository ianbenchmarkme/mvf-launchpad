interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const positionClass = position === 'top'
    ? 'bottom-full mb-1.5'
    : 'top-full mt-1.5';

  return (
    <span className="relative group/tooltip inline-flex">
      {children}
      <span
        className={`pointer-events-none absolute ${positionClass} left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[5px] bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 z-50`}
      >
        {text}
      </span>
    </span>
  );
}
