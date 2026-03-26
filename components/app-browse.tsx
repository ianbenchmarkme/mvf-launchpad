'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { TierBadge } from '@/components/tier-badge';
import { LAYER_LABELS, STATUS_LABELS, TIER_LABELS } from '@/lib/constants';
import type { App, AppTier, AppLayer } from '@/lib/supabase/types';

interface AppBrowseProps {
  apps: App[];
}

const TIER_FILTERS: { value: AppTier | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'green', label: TIER_LABELS.green },
  { value: 'amber', label: TIER_LABELS.amber },
  { value: 'red', label: TIER_LABELS.red },
];

const LAYER_FILTERS: { value: AppLayer | 'all'; label: string }[] = [
  { value: 'all', label: 'All Layers' },
  { value: 'L1', label: LAYER_LABELS.L1 },
  { value: 'L2', label: LAYER_LABELS.L2 },
  { value: 'L3', label: LAYER_LABELS.L3 },
];

export function AppBrowse({ apps }: AppBrowseProps) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<AppTier | 'all'>('all');
  const [layerFilter, setLayerFilter] = useState<AppLayer | 'all'>('all');

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch = !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.problem_statement.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === 'all' || app.tier === tierFilter;
      const matchesLayer = layerFilter === 'all' || app.layer === layerFilter;
      return matchesSearch && matchesTier && matchesLayer;
    });
  }, [apps, search, tierFilter, layerFilter]);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="w-full rounded-[6px] border bg-background pl-9 pr-3 h-8 text-[13px] outline-none focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 transition-all duration-150"
          />
        </div>
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'app' : 'apps'}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3 w-3 text-muted-foreground/50" />
          <div className="flex gap-0.5">
            {TIER_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTierFilter(f.value)}
                className={`rounded-[5px] px-2 h-6 text-[11px] font-medium transition-all duration-150 ${
                  tierFilter === f.value
                    ? 'bg-mvf-purple text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-3 w-px bg-border" />

        <div className="flex gap-0.5">
          {LAYER_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setLayerFilter(f.value)}
              className={`rounded-[5px] px-2 h-6 text-[11px] font-medium transition-all duration-150 ${
                layerFilter === f.value
                  ? 'bg-mvf-purple text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-[8px] border border-dashed py-16 text-center text-muted-foreground">
          <p className="text-[13px]">No apps found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => {
            const accent = app.tier === 'green' ? 'bg-emerald-500' : app.tier === 'amber' ? 'bg-amber-500' : 'bg-red-500';
            return (
              <Link
                key={app.id}
                href={`/apps/${app.id}`}
                className="group relative flex flex-col rounded-[8px] border border-mvf-dark-blue/8 bg-mvf-dark-blue/[0.02] py-5 px-6 min-h-[140px] shadow-xs transition-all duration-150 hover:border-mvf-purple/20 hover:bg-mvf-dark-blue/[0.04] hover:shadow-sm dark:border-white/6 dark:bg-white/[0.03] dark:hover:border-mvf-purple/25 dark:hover:bg-white/[0.05]"
              >
                <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${accent} opacity-60 group-hover:opacity-100 transition-opacity duration-150`} />
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-card-foreground group-hover:text-mvf-purple transition-colors duration-150">
                    {app.name}
                  </h3>
                  <TierBadge tier={app.tier} className="shrink-0" />
                </div>
                <p className="mt-2 text-[12px] leading-[1.6] text-foreground/60 dark:text-white/50 line-clamp-4 flex-1">
                  {app.problem_statement}
                </p>
                <div className="mt-3 pt-3 border-t border-mvf-dark-blue/5 dark:border-white/5 flex items-center gap-2 text-[11px] text-foreground/45 dark:text-white/40">
                  <span>{LAYER_LABELS[app.layer]}</span>
                  <span className="opacity-40">·</span>
                  <span>{STATUS_LABELS[app.status]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
