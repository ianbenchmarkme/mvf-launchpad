import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { addOwnerSchema, removeOwnerSchema } from '@/lib/validators';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Check if the current user is the app creator or an admin. */
async function checkCreatorOrAdmin(
  supabase: Awaited<ReturnType<typeof createAuthServerClient>>,
  userId: string,
  appId: string
): Promise<{ isAdmin: boolean } | NextResponse> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    const { data: app } = await supabase
      .from('apps')
      .select('created_by')
      .eq('id', appId)
      .single();

    const isCreator = app?.created_by === userId;
    if (!isCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return { isAdmin };
}

// POST /api/apps/[id]/owners — add a backup owner by email
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Validate body
  const body = await request.json();
  const result = addOwnerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  // Permission check — creator or admin only
  const perm = await checkCreatorOrAdmin(supabase, user.id, id);
  if (perm instanceof NextResponse) return perm;

  // Look up the profile by email
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', result.data.email)
    .single();

  if (!targetProfile) {
    return NextResponse.json(
      {
        error:
          'No Launchpad account found for that email. They must sign in at least once before being added as an owner.',
      },
      { status: 404 }
    );
  }

  // Check they're not already an owner
  const { data: existingOwners } = await supabase
    .from('app_owners')
    .select('user_id')
    .eq('app_id', id);

  const alreadyOwner = (existingOwners ?? []).some((o) => o.user_id === targetProfile.id);
  if (alreadyOwner) {
    return NextResponse.json(
      { error: 'This person is already an owner of this app.' },
      { status: 409 }
    );
  }

  // Insert backup owner
  const { data: newOwner, error } = await supabase
    .from('app_owners')
    .insert({ app_id: id, user_id: targetProfile.id, owner_role: 'backup' })
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(newOwner, { status: 201 });
}

// DELETE /api/apps/[id]/owners — remove a backup owner by owner row id
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createAuthServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Validate body
  const body = await request.json();
  const result = removeOwnerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  // Permission check — creator or admin only
  const perm = await checkCreatorOrAdmin(supabase, user.id, id);
  if (perm instanceof NextResponse) return perm;

  // Prevent removing the primary owner
  const { data: allOwners } = await supabase
    .from('app_owners')
    .select('id, owner_role')
    .eq('app_id', id);

  const targetRow = (allOwners ?? []).find((o) => o.id === result.data.owner_id);
  if (targetRow?.owner_role === 'primary') {
    return NextResponse.json(
      { error: 'Cannot remove the primary owner.' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('app_owners')
    .delete()
    .eq('id', result.data.owner_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
