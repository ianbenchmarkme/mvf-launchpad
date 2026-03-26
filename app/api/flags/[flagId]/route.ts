import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';

interface RouteContext {
  params: Promise<{ flagId: string }>;
}

// PATCH /api/flags/[flagId] — resolve a flag (admin only)
export async function PATCH(_request: NextRequest, context: RouteContext) {
  const { flagId } = await context.params;
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile as { role: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { data: flag, error } = await supabase
    .from('risk_flags')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq('id', flagId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(flag);
}
