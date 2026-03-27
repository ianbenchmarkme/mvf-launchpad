'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { AppCard } from '@/components/app-card';
import { LAYER_LABELS, TIER_LABELS } from '@/lib/constants';
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((app, index) => (
              <AppCard key={app.id} app={app} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
