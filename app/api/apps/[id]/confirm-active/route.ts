import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/apps/[id]/confirm-active
// Resolves the unresolved dormancy_attestation flag and updates last_activity_at.
// Accessible by app owners and admins (not admin-only, unlike the generic flag resolve endpoint).
// Uses the service-role client for writes — risk_flags_update RLS is admin-only, but
// permission has already been verified at the API layer before any writes occur.
export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if caller is owner or admin (using user's JWT — auth check only, no writes yet)
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

  // Find the unresolved dormancy_attestation flag for this app (read is allowed for all authenticated users)
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

  // Use service-role client for writes — risk_flags_update RLS is admin-only and would
  // silently block owner updates. Permission has been verified above.
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const now = new Date().toISOString();

  const { error: flagError } = await serviceClient
    .from('risk_flags')
    .update({ resolved_at: now, resolved_by: user.id })
    .eq('id', flag.id);

  if (flagError) {
    return NextResponse.json({ error: flagError.message }, { status: 500 });
  }

  const { error: appError } = await serviceClient
    .from('apps')
    .update({ last_activity_at: now })
    .eq('id', id);

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
