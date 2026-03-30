import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/apps/[id]/confirm-active
// Resolves the unresolved dormancy_attestation flag and updates last_activity_at.
// Accessible by app owners and admins (not admin-only, unlike the generic flag resolve endpoint).
export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if caller is owner or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  const { data: ownership } = await supabase
    .from('app_owners')
    .select('id')
    .eq('app_id', id)
    .eq('user_id', user.id)
    .limit(1);

  const isOwner = (ownership?.length ?? 0) > 0;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Find the unresolved dormancy_attestation flag for this app
  const { data: flag } = await supabase
    .from('risk_flags')
    .select('id')
    .eq('app_id', id)
    .eq('flag_type', 'dormancy_attestation')
    .is('resolved_at', null)
    .limit(1)
    .single();

  if (!flag) {
    return NextResponse.json({ error: 'No dormancy flag to resolve' }, { status: 404 });
  }

  // Resolve the flag
  const now = new Date().toISOString();
  await supabase
    .from('risk_flags')
    .update({ resolved_at: now, resolved_by: user.id })
    .eq('id', flag.id);

  // Update last_activity_at on the app
  await supabase
    .from('apps')
    .update({ last_activity_at: now })
    .eq('id', id);

  return NextResponse.json({ ok: true });
}
