import { FlaskConical, ShieldCheck, BadgeCheck } from 'lucide-react';

const tiers = [
  {
    icon: FlaskConical,
    label: 'Red',
    name: 'Experimental',
    body: 'Use at your own risk. Maker-supported only. Great for early tools.',
    bg: 'bg-[#FF5A41]',
    iconColor: 'text-white',
  },
  {
    icon: ShieldCheck,
    label: 'Amber',
    name: 'Verified',
    body: 'Security reviewed, documented, approved infra. Good for wider team use.',
    bg: 'bg-[#FADC28]',
    iconColor: 'text-[#0F0F4B]',
  },
  {
    icon: BadgeCheck,
    label: 'Green',
    name: 'Supported',
    body: '24/7 monitored. Formal SLA. Safe for critical workflows.',
    bg: 'bg-[#00C8C8]',
    iconColor: 'text-[#0F0F4B]',
  },
];

export function TierBlocks() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiers.map((tier) => {
        const Icon = tier.icon;
        const isDark = tier.label === 'Red';
        const textColor = isDark ? 'text-white' : 'text-[#0F0F4B]';
        const bodyColor = isDark ? 'text-white/80' : 'text-[#0F0F4B]/70';

        return (
          <div key={tier.label} className={`${tier.bg} rounded-lg p-4 flex flex-col gap-3`}>
            <Icon className={`${tier.iconColor} w-5 h-5`} strokeWidth={2} />
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-widest ${bodyColor}`}>
                {tier.label}
              </p>
              <p className={`text-sm font-bold leading-tight ${textColor}`}>{tier.name}</p>
            </div>
            <p className={`text-[11px] leading-relaxed ${bodyColor}`}>{tier.body}</p>
          </div>
        );
      })}
    </div>
  );
}
