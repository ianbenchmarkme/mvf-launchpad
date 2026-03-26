'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, Filter } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Search + Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="w-full rounded border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple transition-shadow"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'app' : 'apps'}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Tier filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex gap-1">
            {TIER_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTierFilter(f.value)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
                  tierFilter === f.value
                    ? 'bg-mvf-purple text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layer filter */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex gap-1">
            {LAYER_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setLayerFilter(f.value)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
                  layerFilter === f.value
                    ? 'bg-mvf-purple text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-sm">No apps found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              className="group block rounded border bg-card p-5 transition-all duration-150 hover:shadow-md hover:border-mvf-purple/30"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-card-foreground group-hover:text-mvf-purple transition-colors">
                  {app.name}
                </h3>
                <TierBadge tier={app.tier} />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {app.problem_statement}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{LAYER_LABELS[app.layer]}</span>
                <span>·</span>
                <span>{STATUS_LABELS[app.status]}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
