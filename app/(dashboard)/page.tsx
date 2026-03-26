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

  // Fetch user's apps (as primary owner)
  const { data: ownedApps } = await supabase
    .from('app_owners')
    .select('app_id, apps(*)')
    .eq('user_id', user!.id)
    .eq('owner_role', 'primary');

  const apps: App[] = (ownedApps || [])
    .map((o: Record<string, unknown>) => o.apps as App)
    .filter((a: App | null): a is App => a !== null && a.status !== 'archived');

  // Compute capacity
  const capacityUsed = apps.reduce((sum: number, app: App) => {
    return sum + (TIER_WEIGHTS[app.tier] || 0);
  }, 0);

  // Fetch unresolved flags for user's apps
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <Link
          href="/register"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-4 w-4" />
          Register New App
        </Link>
      </div>

      {/* Capacity */}
      <div className="rounded-lg border bg-card p-4 max-w-xs">
        <h2 className="text-sm font-medium text-card-foreground mb-2">My Capacity</h2>
        <CapacityIndicator used={capacityUsed} limit={CAPACITY_LIMIT} />
      </div>

      {/* Action Required */}
      {unresolvedFlags.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-800 mb-2">
            Action Required ({unresolvedFlags.length})
          </h2>
          <ul className="space-y-1 text-sm text-amber-700">
            {unresolvedFlags.map((flag: Record<string, unknown>) => (
              <li key={flag.id as string}>
                • {(flag.flag_type as string).replace(/_/g, ' ')} —{' '}
                <Link
                  href={`/apps/${flag.app_id}`}
                  className="underline hover:no-underline"
                >
                  View app
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* My Apps */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Apps</h2>
        {apps.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p>No apps registered yet.</p>
            <Link href="/register" className="text-primary underline mt-2 inline-block">
              Register your first app
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app: App) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
