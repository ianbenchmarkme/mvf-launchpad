import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { DashboardShell } from '@/components/dashboard-shell';
import { TIER_WEIGHTS } from '@/lib/constants';
import type { Profile } from '@/lib/supabase/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Compute capacity
  const { data: ownedApps } = await supabase
    .from('app_owners')
    .select('apps(id, tier, status)')
    .eq('user_id', user.id)
    .eq('owner_role', 'primary');

  const activeApps = (ownedApps || [])
    .map((o: Record<string, unknown>) => o.apps as { id: string; tier: string; status: string } | null)
    .filter((a): a is { id: string; tier: string; status: string } => a !== null && a.status !== 'archived');

  const capacityUsed = activeApps.reduce((sum, app) => {
    return sum + (TIER_WEIGHTS[app.tier as keyof typeof TIER_WEIGHTS] || 0);
  }, 0);

  // Fetch unresolved flags for user's apps
  const appIds = activeApps.map((a) => a.id);
  const { data: flags } = appIds.length > 0
    ? await supabase
        .from('risk_flags')
        .select('id, app_id, flag_type')
        .in('app_id', appIds)
        .is('resolved_at', null)
    : { data: [] };

  return (
    <DashboardShell
      user={profile as Profile}
      capacityUsed={capacityUsed}
      unresolvedFlags={(flags || []) as { id: string; app_id: string; flag_type: string }[]}
    >
      {children}
    </DashboardShell>
  );
}
