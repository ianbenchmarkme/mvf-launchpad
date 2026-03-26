import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { AppCard } from '@/components/app-card';
import { CapacityIndicator } from '@/components/capacity-indicator';
import { CAPACITY_LIMIT, TIER_WEIGHTS } from '@/lib/constants';
import type { App } from '@/lib/supabase/types';

export default async function DashboardPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ownedApps } = await supabase
    .from('app_owners')
    .select('app_id, apps(*)')
    .eq('user_id', user!.id)
    .eq('owner_role', 'primary');

  const apps: App[] = (ownedApps || [])
    .map((o: Record<string, unknown>) => o.apps as App)
    .filter((a: App | null): a is App => a !== null && a.status !== 'archived');

  const capacityUsed = apps.reduce((sum: number, app: App) => {
    return sum + (TIER_WEIGHTS[app.tier] || 0);
  }, 0);

  const appIds = apps.map((a: App) => a.id);
  const { data: flags } = appIds.length > 0
    ? await supabase
        .from('risk_flags')
        .select('*')
        .in('app_id', appIds)
        .is('resolved_at', null)
    : { data: [] };

  const unresolvedFlags = flags || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/register"
          className="flex items-center gap-1.5 rounded-[6px] bg-mvf-pink px-3 h-8 text-[13px] font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] transition-all duration-150"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Register App
        </Link>
      </div>

      {/* Capacity */}
      <div className="rounded-[8px] border border-mvf-dark-blue/8 bg-mvf-dark-blue/[0.02] p-4 max-w-[240px] shadow-xs dark:border-white/6 dark:bg-white/[0.03]">
        <h2 className="text-[12px] font-medium text-muted-foreground mb-2">Capacity</h2>
        <CapacityIndicator used={capacityUsed} limit={CAPACITY_LIMIT} />
      </div>

      {/* Action Required */}
      {unresolvedFlags.length > 0 && (
        <div className="rounded-[8px] border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
          <h2 className="text-[13px] font-semibold text-amber-600 mb-2">
            Action Required ({unresolvedFlags.length})
          </h2>
          <ul className="space-y-1">
            {unresolvedFlags.map((flag: Record<string, unknown>) => (
              <li key={flag.id as string} className="text-[12px] text-amber-600/80">
                <span className="capitalize">{(flag.flag_type as string).replace(/_/g, ' ')}</span>
                {' — '}
                <Link
                  href={`/apps/${flag.app_id}`}
                  className="text-amber-700 underline decoration-amber-700/30 hover:decoration-amber-700"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* My Apps */}
      <div>
        <h2 className="text-[13px] font-semibold text-muted-foreground mb-3">My Apps</h2>
        {apps.length === 0 ? (
          <div className="rounded-[8px] border border-dashed py-12 text-center">
            <p className="text-[13px] text-muted-foreground">No apps registered yet.</p>
            <Link href="/register" className="text-[13px] text-mvf-purple hover:underline mt-1 inline-block">
              Register your first app
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app: App) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
