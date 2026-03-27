import { Search, Hammer, BarChart3 } from 'lucide-react';

const audiences = [
  {
    icon: Search,
    headline: 'Using tools',
    body: 'Browse the App Library. See what tier a tool is, who owns it, and whether it\'s safe to rely on for your workflow.',
  },
  {
    icon: Hammer,
    headline: 'Building tools',
    body: 'Register in 2 minutes. Avoid duplicating existing work. Get visibility and support as your tool grows.',
  },
  {
    icon: BarChart3,
    headline: 'Leading teams',
    body: 'Governance dashboard. Risk flags. Tier status across all tools. No approval gates — just visibility.',
  },
];

export function AudienceCards() {
  return (
    <div className="flex flex-col gap-4">
      {audiences.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.headline} className="flex gap-4 items-start">
            <div className="shrink-0 w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#8264C8]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-snug">{item.headline}</p>
              <p className="text-[12px] text-white/55 leading-relaxed mt-0.5">{item.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
