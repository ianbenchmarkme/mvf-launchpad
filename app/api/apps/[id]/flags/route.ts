import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/apps/[id]/flags — list flags for an app
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('risk_flags')
    .select('*')
    .eq('app_id', id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/apps/[id]/flags — add a flag (admin or app owner)
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin role or app ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = (profile as { role: string } | null)?.role === 'admin';

  if (!isAdmin) {
    // Check if user is an owner of this app
    const { data: ownership } = await supabase
      .from('app_owners')
      .select('id')
      .eq('app_id', id)
      .eq('user_id', user.id)
      .limit(1);

    if (!ownership || ownership.length === 0) {
      return NextResponse.json({ error: 'Admin or app owner access required' }, { status: 403 });
    }
  }

  const body = await request.json();

  const { data: flag, error } = await supabase
    .from('risk_flags')
    .insert({
      app_id: id,
      flag_type: body.flag_type,
      severity: body.severity || 'info',
      description: body.description,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(flag, { status: 201 });
}
