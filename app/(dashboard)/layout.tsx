import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { DashboardShell } from '@/components/dashboard-shell';
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

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return (
    <DashboardShell user={profile as Profile}>
      {children}
    </DashboardShell>
  );
}
