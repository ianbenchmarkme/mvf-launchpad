'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, PlusCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { AppCard } from '@/components/app-card';
import type { App } from '@/lib/supabase/types';

interface MyAppsListProps {
  primaryApps: App[];
  backupApps: App[];
}

export function MyAppsList({ primaryApps, backupApps }: MyAppsListProps) {
  const [search, setSearch] = useState('');

  const matches = (app: App) =>
    !search ||
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.problem_statement.toLowerCase().includes(search.toLowerCase());

  const filteredPrimary = useMemo(() => primaryApps.filter(matches), [primaryApps, search]);
  const filteredBackup = useMemo(() => backupApps.filter(matches), [backupApps, search]);

  const hasAny = primaryApps.length > 0 || backupApps.length > 0;

  return (
    <div className="space-y-6">
      {/* Search — only show if there are apps to search */}
      {hasAny && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your apps…"
            className="w-full rounded-[6px] border bg-background pl-9 pr-3 h-8 text-[13px] outline-none focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 transition-all duration-150"
          />
        </div>
      )}

      {/* Empty state — no apps at all */}
      {!hasAny && (
        <div className="rounded-[8px] border border-dashed py-16 text-center flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <PlusCircle className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-card-foreground">No apps registered yet</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Register your first tool to start tracking it here.</p>
          </div>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-[6px] bg-mvf-pink px-3 h-8 text-[13px] font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] transition-all duration-150"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Register App
          </Link>
        </div>
      )}

      {/* Primary apps */}
      {hasAny && filteredPrimary.length === 0 && filteredBackup.length === 0 && (
        <p className="text-[13px] text-muted-foreground">No apps match your search.</p>
      )}

      {filteredPrimary.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredPrimary.map((app, index) => (
              <AppCard key={app.id} app={app} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Backup-owned apps */}
      {filteredBackup.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="border-t pt-4">
            <h2 className="text-[14px] font-semibold tracking-tight">Also backing</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Apps where you are the backup owner.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredBackup.map((app, index) => (
                <AppCard key={app.id} app={app} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
