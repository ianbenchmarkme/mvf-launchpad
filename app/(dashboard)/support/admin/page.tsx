import { redirect } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { SupportAdminClient } from '@/components/support-admin-client';
import type { Profile, SupportRequestWithDetails } from '@/lib/supabase/types';

export default async function SupportAdminPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile as Profile).role !== 'admin') {
    redirect('/');
  }

  // Fetch all requests with FK-disambiguated joins
  // support_requests has two FK refs to profiles (submitted_by, resolved_by)
  // so we must use profiles!submitted_by syntax
  const { data: requests } = await supabase
    .from('support_requests')
    .select('*, submitter:profiles!submitted_by(full_name, email), apps!related_app_id(id, name)')
    .order('created_at', { ascending: false });

  const typedRequests = (requests ?? []) as SupportRequestWithDetails[];

  const openCount = typedRequests.filter((r) => r.status === 'open').length;
  const inProgressCount = typedRequests.filter((r) => r.status === 'in_progress').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Inbox className="h-4 w-4 text-muted-foreground" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Admin · Support Inbox
          </span>
        </div>
        <h1 className="text-[24px] font-bold tracking-tight text-foreground">Support &amp; Feedback</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          All user-submitted support requests, feature requests, and feedback.
        </p>

        {/* Quick stats */}
        {typedRequests.length > 0 && (
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--muted-foreground)' }}
              />
              <span className="text-[12px] text-muted-foreground">
                <strong className="text-foreground">{openCount}</strong> open
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--mvf-yellow)' }}
              />
              <span className="text-[12px] text-muted-foreground">
                <strong className="text-foreground">{inProgressCount}</strong> in progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted" />
              <span className="text-[12px] text-muted-foreground">
                <strong className="text-foreground">{typedRequests.length}</strong> total
              </span>
            </div>
          </div>
        )}
      </div>

      <SupportAdminClient requests={typedRequests} />
    </div>
  );
}
