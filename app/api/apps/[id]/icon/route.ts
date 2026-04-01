import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { createClient as createServiceClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ALLOWED_MIME_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg'] as const;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const EXTENSION_MAP: Record<string, string> = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

// POST /api/apps/[id]/icon — upload or replace app icon
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // Auth check
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Permission check: must be owner or admin
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

  // Parse multipart form
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate mime type
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only SVG, PNG, and JPG are allowed.' },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 2MB.' },
      { status: 400 }
    );
  }

  const ext = EXTENSION_MAP[file.type];
  const storagePath = `${id}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  // Upload using service-role client (bypasses storage RLS for server-side uploads)
  const serviceClient = createServiceClient();
  const { error: uploadError } = await serviceClient.storage
    .from('app-icons')
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: true, // overwrite existing
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL (stored clean, without cache-buster)
  const { data: { publicUrl } } = serviceClient.storage
    .from('app-icons')
    .getPublicUrl(storagePath);

  // Persist the clean URL in the database
  const { error: updateError } = await supabase
    .from('apps')
    .update({ icon_url: publicUrl })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Return URL with a cache-bust param so the browser shows the new icon immediately.
  // This is only used client-side for the live preview; the DB holds the clean URL.
  return NextResponse.json({ icon_url: `${publicUrl}?t=${Date.now()}` });
}
