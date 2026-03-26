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

  // Compute capacity for sidebar
  const { data: ownedApps } = await supabase
    .from('app_owners')
    .select('apps(tier, status)')
    .eq('user_id', user.id)
    .eq('owner_role', 'primary');

  const capacityUsed = (ownedApps || []).reduce((sum: number, o: Record<string, unknown>) => {
    const app = o.apps as { tier: string; status: string } | null;
    if (!app || app.status === 'archived') return sum;
    return sum + (TIER_WEIGHTS[app.tier as keyof typeof TIER_WEIGHTS] || 0);
  }, 0);

  return (
    <DashboardShell user={profile as Profile} capacityUsed={capacityUsed}>
      {children}
    </DashboardShell>
  );
}
