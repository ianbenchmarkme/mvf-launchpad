import { NextResponse, type NextRequest } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { registrationSchema } from '@/lib/validators';
import { CAPACITY_LIMIT, TIER_WEIGHTS } from '@/lib/constants';

// GET /api/apps — list apps with optional filters
export async function GET(request: NextRequest) {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer');
  const tier = searchParams.get('tier');
  const status = searchParams.get('status');

  let query = supabase
    .from('apps')
    .select('*, app_owners(*, profiles(*))')
    .order('created_at', { ascending: false });

  if (layer) query = query.eq('layer', layer);
  if (tier) query = query.eq('tier', tier);
  if (status) query = query.eq('status', status);
  else query = query.neq('status', 'archived');

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/apps — register new app
export async function POST(request: NextRequest) {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const result = registrationSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  // Check capacity
  const { data: ownedApps } = await supabase
    .from('app_owners')
    .select('apps(tier, status)')
    .eq('user_id', user.id)
    .eq('owner_role', 'primary');

  const capacityUsed = (ownedApps || []).reduce((sum: number, o: Record<string, unknown>) => {
    const app = o.apps as { tier: string; status: string } | null;
    if (!app || app.status === 'archived') return sum;
    return sum + (TIER_WEIGHTS[app.tier as keyof typeof TIER_WEIGHTS] || 0);
  }, 0);

  // New app is always red (0.5 points)
  if (capacityUsed + TIER_WEIGHTS.red > CAPACITY_LIMIT) {
    return NextResponse.json(
      { error: 'Capacity limit reached. Retire or graduate an app before registering a new one.' },
      { status: 409 }
    );
  }

  // Insert app
  const { data: app, error: appError } = await supabase
    .from('apps')
    .insert({
      ...result.data,
      tier: 'red',
      status: 'intent',
      created_by: user.id,
    })
    .select()
    .single();

  if (appError) return NextResponse.json({ error: appError.message }, { status: 500 });

  // Add primary owner
  await supabase.from('app_owners').insert({
    app_id: app.id,
    user_id: user.id,
    owner_role: 'primary',
  });

  // Auto-create risk flags for 'unsure' responses
  const autoFlags: { app_id: string; flag_type: string; severity: string; description: string }[] = [];

  if (result.data.handles_pii === 'unsure') {
    autoFlags.push({
      app_id: app.id,
      flag_type: 'unsure_pii',
      severity: 'warning',
      description: 'Maker selected "Unsure" for PII handling. Follow up within 5 business days.',
    });
  }

  if (result.data.needs_business_data === 'unsure') {
    autoFlags.push({
      app_id: app.id,
      flag_type: 'unsure_business_data',
      severity: 'info',
      description: 'Maker selected "Unsure" for business data needs. Follow up within 5 business days.',
    });
  }

  if (result.data.uses_api_keys === 'unsure') {
    autoFlags.push({
      app_id: app.id,
      flag_type: 'unsure_api_keys',
      severity: 'info',
      description: 'Maker selected "Unsure" for API key usage. Follow up within 5 business days.',
    });
  }

  if (autoFlags.length > 0) {
    await supabase.from('risk_flags').insert(autoFlags);
  }

  return NextResponse.json(app, { status: 201 });
}
