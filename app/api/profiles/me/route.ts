import { NextResponse } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { CAPACITY_LIMIT, TIER_WEIGHTS } from '@/lib/constants';

// GET /api/profiles/me — current user profile with computed capacity
export async function GET() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Compute capacity from primary-owned non-archived apps
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

  return NextResponse.json({
    ...profile,
    capacity_used: capacityUsed,
    capacity_limit: CAPACITY_LIMIT,
  });
}
