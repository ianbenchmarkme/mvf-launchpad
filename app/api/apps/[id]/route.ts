import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { updateAppSchema, sanitizeUpdatePayload } from '@/lib/validators';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Check if user is owner or admin. Returns { isAdmin, isOwner } or a 403 response. */
async function checkAppPermission(
  supabase: Awaited<ReturnType<typeof createAuthServerClient>>,
  userId: string,
  appId: string
): Promise<{ isAdmin: boolean; isOwner: boolean } | NextResponse> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin';

  const { data: ownership } = await supabase
    .from('app_owners')
    .select('id')
    .eq('app_id', appId)
    .eq('user_id', userId)
    .limit(1);

  const isOwner = (ownership?.length ?? 0) > 0;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { isAdmin, isOwner };
}

// GET /api/apps/[id] — single app with owners and flags
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: app, error } = await supabase
    .from('apps')
    .select('*, app_owners(*, profiles(*)), risk_flags(*)')
    .eq('id', id)
    .single();

  if (error || !app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  return NextResponse.json(app);
}

// PATCH /api/apps/[id] — update app (owner or admin)
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Validate payload
  const body = await request.json();
  const result = updateAppSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  // Check permission
  const perm = await checkAppPermission(supabase, user.id, id);
  if (perm instanceof NextResponse) return perm;

  // Sanitize payload — strip protected/admin-only fields
  const sanitized = sanitizeUpdatePayload(result.data as Record<string, unknown>, perm.isAdmin);

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  // Fetch current app state for risk flag diffing
  const { data: currentApp } = await supabase
    .from('apps')
    .select('handles_pii, needs_business_data, uses_api_keys')
    .eq('id', id)
    .single();

  // Update the app
  const { data: app, error } = await supabase
    .from('apps')
    .update(sanitized)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-create risk flags when tristate fields change to 'unsure' or PII changes to 'yes'
  if (currentApp) {
    const autoFlags: { app_id: string; flag_type: string; severity: string; description: string }[] = [];
    const triFields = [
      { field: 'handles_pii', type: 'unsure_pii', severity: 'warning', desc: 'Maker changed PII handling to "Unsure". Follow up within 5 business days.' },
      { field: 'needs_business_data', type: 'unsure_business_data', severity: 'info', desc: 'Maker changed business data needs to "Unsure". Follow up within 5 business days.' },
      { field: 'uses_api_keys', type: 'unsure_api_keys', severity: 'info', desc: 'Maker changed API key usage to "Unsure". Follow up within 5 business days.' },
    ] as const;

    for (const { field, type, severity, desc } of triFields) {
      const newVal = sanitized[field] as string | undefined;
      const oldVal = currentApp[field as keyof typeof currentApp] as string;
      if (newVal && newVal === 'unsure' && oldVal !== 'unsure') {
        autoFlags.push({ app_id: id, flag_type: type, severity, description: desc });
      }
    }

    // PII confirmed 'yes' — create critical flag for legal notification
    if (sanitized.handles_pii === 'yes' && currentApp.handles_pii !== 'yes') {
      autoFlags.push({
        app_id: id,
        flag_type: 'pii_confirmed',
        severity: 'critical',
        description: 'Maker confirmed this app handles PII. Legal notification required.',
      });
    }

    if (autoFlags.length > 0) {
      await supabase.from('risk_flags').insert(autoFlags);
    }
  }

  return NextResponse.json(app);
}

// DELETE /api/apps/[id] — archive app (soft delete)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check permission
  const perm = await checkAppPermission(supabase, user.id, id);
  if (perm instanceof NextResponse) return perm;

  const { data: app, error } = await supabase
    .from('apps')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(app);
}
