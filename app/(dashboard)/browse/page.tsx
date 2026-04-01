import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">App Library</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Discover internal tools. Find what exists before building something new.
          </p>
        </div>
        <Link
          href="/register"
          className="shrink-0 flex items-center gap-1.5 rounded-[6px] bg-mvf-pink px-3 h-8 text-[13px] font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] transition-all duration-150"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Register App
        </Link>
      </div>
      <AppBrowse apps={(apps || []) as App[]} />
    </div>
  );
}
