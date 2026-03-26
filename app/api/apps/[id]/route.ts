import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';

interface RouteContext {
  params: Promise<{ id: string }>;
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

  const body = await request.json();

  const { data: app, error } = await supabase
    .from('apps')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(app);
}

// DELETE /api/apps/[id] — archive app (soft delete)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: app, error } = await supabase
    .from('apps')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(app);
}
