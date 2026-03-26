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
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">App Library</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Discover internal tools. Find what exists before building something new.
        </p>
      </div>
      <AppBrowse apps={(apps || []) as App[]} />
    </div>
  );
}
