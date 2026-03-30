import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TIER_WEIGHTS, CAPACITY_LIMIT, STALE_OWNER_DAYS, DORMANCY_DAYS } from '@/lib/constants';

// Use Node.js runtime — @supabase/supabase-js requires Node APIs
export const runtime = 'nodejs';

interface FlagResult {
  stale_owner: number;
  capacity_exceeded: number;
  dormancy_attestation: number;
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Missing Supabase environment variables');
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Returns true if an unresolved flag of the given type already exists for the given app. */
async function hasUnresolvedFlag(
  supabase: ReturnType<typeof getServiceClient>,
  appId: string,
  flagType: string
): Promise<boolean> {
  const { data } = await supabase
    .from('risk_flags')
    .select('id')
    .eq('app_id', appId)
    .eq('flag_type', flagType)
    .is('resolved_at', null)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

async function runStaleOwnerCheck(
  supabase: ReturnType<typeof getServiceClient>,
  results: FlagResult
): Promise<void> {
  // Get all auth users with their last sign-in times
  // Note: single page fetch — sufficient at MVF scale (<<1000 users)
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const lastSignInByUserId = new Map<string, string | null>();
  for (const u of users) {
    lastSignInByUserId.set(u.id, u.last_sign_in_at ?? null);
  }

  // Get all non-archived apps with their primary owners
  const { data: ownerships } = await supabase
    .from('app_owners')
    .select('app_id, user_id')
    .eq('owner_role', 'primary');

  if (!ownerships?.length) return;

  // Get non-archived app IDs for filtering
  const { data: activeApps } = await supabase
    .from('apps')
    .select('id')
    .neq('status', 'archived');

  const activeAppIds = new Set((activeApps ?? []).map((a: { id: string }) => a.id));
  const cutoff = new Date(Date.now() - STALE_OWNER_DAYS * 24 * 60 * 60 * 1000);

  for (const { app_id, user_id } of ownerships) {
    if (!activeAppIds.has(app_id)) continue;

    const lastSignIn = lastSignInByUserId.get(user_id);
    const isStale = !lastSignIn || new Date(lastSignIn) < cutoff;

    if (!isStale) continue;
    if (await hasUnresolvedFlag(supabase, app_id, 'stale_owner')) continue;

    const daysSince = lastSignIn
      ? Math.floor((Date.now() - new Date(lastSignIn).getTime()) / (24 * 60 * 60 * 1000))
      : null;
    const description = lastSignIn
      ? `Primary owner has not signed in for ${daysSince} days (threshold: ${STALE_OWNER_DAYS}).`
      : `Primary owner has never signed in.`;

    await supabase.from('risk_flags').insert({
      app_id,
      flag_type: 'stale_owner',
      severity: 'warning',
      description,
    });
    results.stale_owner++;
  }
}

async function runCapacityCheck(
  supabase: ReturnType<typeof getServiceClient>,
  results: FlagResult
): Promise<void> {
  // Get all primary-owned non-archived apps grouped by maker
  const { data: ownerships } = await supabase
    .from('app_owners')
    .select('user_id, app_id, apps(id, tier, status, created_at)')
    .eq('owner_role', 'primary');

  if (!ownerships?.length) return;

  // Group by maker
  const byMaker = new Map<string, { app_id: string; tier: string; created_at: string }[]>();
  for (const o of ownerships) {
    const appRaw = o.apps as unknown;
    const app = (Array.isArray(appRaw) ? appRaw[0] : appRaw) as { id: string; tier: string; status: string; created_at: string } | null;
    if (!app || app.status === 'archived') continue;
    if (!byMaker.has(o.user_id)) byMaker.set(o.user_id, []);
    byMaker.get(o.user_id)!.push({ app_id: o.app_id, tier: app.tier, created_at: app.created_at });
  }

  for (const [, apps] of byMaker) {
    const capacity = apps.reduce(
      (sum, a) => sum + (TIER_WEIGHTS[a.tier as keyof typeof TIER_WEIGHTS] ?? 0),
      0
    );

    if (capacity <= CAPACITY_LIMIT) continue;

    // Check if ANY of this maker's apps already has an unresolved capacity_exceeded flag
    const appIds = apps.map((a) => a.app_id);
    const { data: existing } = await supabase
      .from('risk_flags')
      .select('id')
      .in('app_id', appIds)
      .eq('flag_type', 'capacity_exceeded')
      .is('resolved_at', null)
      .limit(1);

    if (existing?.length) continue;

    // Attach to newest app (the one that tipped the maker over the limit)
    const newest = apps.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    await supabase.from('risk_flags').insert({
      app_id: newest.app_id,
      flag_type: 'capacity_exceeded',
      severity: 'warning',
      description: `Maker has exceeded the ${CAPACITY_LIMIT}-point capacity limit (current: ${capacity.toFixed(1)} pts). Review and archive apps to reduce load.`,
    });
    results.capacity_exceeded++;
  }
}

async function runDormancyCheck(
  supabase: ReturnType<typeof getServiceClient>,
  results: FlagResult
): Promise<void> {
  const cutoffIso = new Date(Date.now() - DORMANCY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Query active/testing apps where COALESCE(last_activity_at, updated_at) < cutoff
  // last_activity_at is the canonical dormancy column; falls back to updated_at for older apps
  const { data: apps } = await supabase
    .from('apps')
    .select('id, last_activity_at, updated_at')
    .in('status', ['active', 'testing']);

  if (!apps?.length) return;

  for (const app of apps) {
    const activityDate = app.last_activity_at ?? app.updated_at;
    if (!activityDate || new Date(activityDate) >= new Date(cutoffIso)) continue;

    if (await hasUnresolvedFlag(supabase, app.id, 'dormancy_attestation')) continue;

    await supabase.from('risk_flags').insert({
      app_id: app.id,
      flag_type: 'dormancy_attestation',
      severity: 'warning',
      description: `No activity for ${DORMANCY_DAYS}+ days. Owner confirmation required.`,
    });
    results.dormancy_attestation++;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const results: FlagResult = { stale_owner: 0, capacity_exceeded: 0, dormancy_attestation: 0 };

  await runStaleOwnerCheck(supabase, results);
  await runCapacityCheck(supabase, results);
  await runDormancyCheck(supabase, results);

  // TODO: high_wau_red_tier — implement when Amplitude WAU data is available

  return NextResponse.json({ ok: true, flagged: results });
}
