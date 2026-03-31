import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { supportUpdateSchema } from '@/lib/validators';
import { sendResolutionEmail } from '@/lib/email';
import type { SupportRequest } from '@/lib/supabase/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/support/[id] — update status + resolution note (admin only)
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin only
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if ((profile as { role: string; full_name: string | null } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Fetch existing request
  const { data: existing } = await supabase
    .from('support_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Validate update payload
  const body = await request.json();
  const result = supportUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const { status, resolution_note } = result.data;
  const isTerminal = status === 'completed' || status === 'wont_do';

  const updatePayload: Record<string, unknown> = { status };
  if (isTerminal) {
    updatePayload.resolution_note = resolution_note;
    updatePayload.resolved_by = user.id;
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('support_requests')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send resolution email if terminal status + user wants a reply
  const existingRequest = existing as SupportRequest;
  if (isTerminal && existingRequest.wants_reply && resolution_note) {
    await sendResolutionEmail({
      to: existingRequest.submitted_email,
      name: existingRequest.submitted_name,
      requestSubject: existingRequest.subject,
      status: status as 'completed' | 'wont_do',
      resolutionNote: resolution_note,
      resolvedBy: (profile as { role: string; full_name: string | null } | null)?.full_name ?? 'Admin',
    });
  }

  return NextResponse.json(updated);
}
