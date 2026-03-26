import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { AppCard } from '@/components/app-card';
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app: App) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
