import { notFound } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { AppProfileClient } from '@/components/app-profile-client';
import type { App, AppOwner, Profile, RiskFlag } from '@/lib/supabase/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createAuthServerClient();

  // Fetch app
  const { data: app } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .single();

  if (!app) {
    notFound();
  }

  const { data: owners } = await supabase
    .from('app_owners')
    .select('*, profiles(*)')
    .eq('app_id', id);

  const { data: flags } = await supabase
    .from('risk_flags')
    .select('*')
    .eq('app_id', id)
    .is('resolved_at', null);

  // Fetch current user + role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  const isAdmin = (profile as Profile | null)?.role === 'admin';
  const typedApp = app as App;
  const typedOwners = (owners || []) as (AppOwner & { profiles: Profile })[];
  const typedFlags = (flags || []) as RiskFlag[];
  const isOwner = typedOwners.some((o) => o.user_id === user!.id);

  return (
    <AppProfileClient
      key={typedApp.updated_at}
      app={typedApp}
      owners={typedOwners}
      flags={typedFlags}
      isAdmin={isAdmin}
      isOwner={isOwner}
    />
  );
}
