'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TierBadge } from '@/components/tier-badge';
import { LAYER_LABELS, STATUS_LABELS } from '@/lib/constants';
import type { App, AppTier } from '@/lib/supabase/types';

const EASE = [0.25, 0.1, 0.25, 1] as const;

const accentColor: Record<AppTier, string> = {
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
};

interface AppCardProps {
  app: App;
  index?: number;
}

export function AppCard({ app, index = 0 }: AppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: EASE }}
      whileHover={{ y: -2, transition: { duration: 0.15, ease: EASE } }}
    >
      <Link
        href={`/apps/${app.id}`}
        className="group relative flex flex-col rounded-[8px] border border-border bg-card py-5 px-6 min-h-[140px] card-shadow hover:border-mvf-purple/20 transition-colors duration-150"
      >
        {/* Left accent stripe */}
        <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${accentColor[app.tier]} opacity-60 group-hover:opacity-100 transition-opacity duration-150`} />

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-card-foreground group-hover:text-mvf-purple transition-colors duration-150">
            {app.name}
          </h3>
          <TierBadge tier={app.tier} className="shrink-0" />
        </div>
        <p className="mt-2 text-[12px] leading-[1.6] text-muted-foreground line-clamp-4 flex-1">
          {app.problem_statement}
        </p>
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground/80">
          <span>{LAYER_LABELS[app.layer]}</span>
          <span className="opacity-40">·</span>
          <span>{STATUS_LABELS[app.status]}</span>
        </div>
      </Link>
    </motion.div>
  );
}
