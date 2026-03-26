import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { AppBrowse } from '@/components/app-browse';
import type { App } from '@/lib/supabase/types';

export default async function BrowsePage() {
  const supabase = await createAuthServerClient();

  const { data: apps } = await supabase
    .from('apps')
    .select('*')
    .neq('status', 'archived')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">App Library</h1>
        <p className="mt-1 text-muted-foreground">
          Discover internal tools built across MVF. Find what exists before building something new.
        </p>
      </div>
      <AppBrowse apps={(apps || []) as App[]} />
    </div>
  );
}
