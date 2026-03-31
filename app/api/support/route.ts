import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { supportRequestSchema } from '@/lib/validators';

// POST /api/support — create a support request (any authenticated user)
export async function POST(request: NextRequest) {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch profile for denormalised email + name
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single();

  const body = await request.json();
  const result = supportRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const { data: supportRequest, error } = await supabase
    .from('support_requests')
    .insert({
      ...result.data,
      submitted_by: user.id,
      submitted_email: (profile as { email: string; full_name: string | null } | null)?.email ?? user.email ?? '',
      submitted_name: (profile as { email: string; full_name: string | null } | null)?.full_name ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(supportRequest, { status: 201 });
}
