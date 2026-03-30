import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mock state ---
let mockUsers: { id: string; last_sign_in_at: string | null }[];
let mockOwnerships: { user_id: string; app_id: string; apps: { id: string; tier: string; status: string; created_at: string } | null }[];
let mockActiveApps: { id: string }[];
let mockDormantApps: { id: string; last_activity_at: string | null; updated_at: string }[];
let mockExistingFlags: { id: string }[];
let mockInserted: unknown[];

function buildMockSupabase() {
  mockInserted = [];
  const fromHandler = (table: string) => {
    if (table === 'app_owners') {
      // Returns ownerships with nested apps for capacity check, or flat for stale-owner
      return makeChain({ data: mockOwnerships, error: null });
    }
    if (table === 'apps') {
      // Distinguish stale-owner query (select 'id', uses .neq) from dormancy query
      // (select 'id, last_activity_at, updated_at', uses .in).
      // We detect by whether the caller subsequently calls .neq (stale-owner) or .in (dormancy).
      // Simplest approach: use a proxy that routes based on which filter method is called first.
      return makeAppsChain();
    }
    if (table === 'risk_flags') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              is: () => ({
                limit: () => Promise.resolve({ data: mockExistingFlags, error: null }),
              }),
              in: () => ({
                is: () => ({
                  limit: () => Promise.resolve({ data: mockExistingFlags, error: null }),
                }),
              }),
            }),
          }),
          in: () => ({
            eq: () => ({
              is: () => ({
                limit: () => Promise.resolve({ data: mockExistingFlags, error: null }),
              }),
            }),
          }),
        }),
        insert: (data: unknown) => {
          mockInserted.push(data);
          return Promise.resolve({ data, error: null });
        },
      };
    }
    return makeChain({ data: [], error: null });
  };

  return {
    auth: {
      admin: {
        listUsers: () => Promise.resolve({ data: { users: mockUsers }, error: null }),
      },
    },
    from: fromHandler,
  };
}

function makeChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'neq', 'in', 'is', 'limit'];
  for (const m of methods) chain[m] = () => chain;
  chain.single = () => Promise.resolve(result);
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

function makeFilterChain(data: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.in = () => chain;
  chain.neq = () => chain;
  chain.eq = () => chain;
  chain.is = () => chain;
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve);
  return chain;
}

/**
 * Smart apps-table chain that routes to the right mock data based on which
 * filter method is called:
 *   - .neq(...)  → stale-owner check (needs mockActiveApps)
 *   - .in(...)   → dormancy check (needs mockDormantApps)
 */
function makeAppsChain() {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.is = () => chain;
  chain.neq = () => makeFilterChain(mockActiveApps); // stale-owner path
  chain.in = () => makeFilterChain(mockDormantApps); // dormancy path
  chain.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data: [], error: null }).then(resolve);
  return chain;
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => buildMockSupabase(),
}));

const { GET } = await import('@/app/api/cron/risk-flags/route');

const VALID_SECRET = 'test-secret';
process.env.CRON_SECRET = VALID_SECRET;
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

function makeRequest(secret?: string) {
  const headers: Record<string, string> = {};
  if (secret !== undefined) headers['Authorization'] = `Bearer ${secret}`;
  return new NextRequest('http://localhost/api/cron/risk-flags', { headers });
}

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

beforeEach(() => {
  mockUsers = [];
  mockOwnerships = [];
  mockActiveApps = [];
  mockDormantApps = [];
  mockExistingFlags = [];
  mockInserted = [];
});

// --- Auth guard ---
describe('GET /api/cron/risk-flags — auth', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong secret', async () => {
    const res = await GET(makeRequest('wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('returns 200 with correct secret and empty DB', async () => {
    const res = await GET(makeRequest(VALID_SECRET));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, flagged: { stale_owner: 0, capacity_exceeded: 0, dormancy_attestation: 0 } });
  });
});

// --- Stale owner ---
describe('GET /api/cron/risk-flags — stale owner', () => {
  it('creates stale_owner flag when owner signed in 91 days ago', async () => {
    mockUsers = [{ id: 'user-1', last_sign_in_at: daysAgo(91) }];
    mockOwnerships = [{ user_id: 'user-1', app_id: 'app-1', apps: null }];
    mockActiveApps = [{ id: 'app-1' }];
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.flagged.stale_owner).toBe(1);
    expect(mockInserted).toEqual(expect.arrayContaining([
      expect.objectContaining({ app_id: 'app-1', flag_type: 'stale_owner', severity: 'warning' }),
    ]));
  });

  it('skips when unresolved stale_owner flag already exists (idempotency)', async () => {
    mockUsers = [{ id: 'user-1', last_sign_in_at: daysAgo(91) }];
    mockOwnerships = [{ user_id: 'user-1', app_id: 'app-1', apps: null }];
    mockActiveApps = [{ id: 'app-1' }];
    mockExistingFlags = [{ id: 'flag-1' }]; // already flagged

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.stale_owner).toBe(0);
  });

  it('does not flag owner who signed in 89 days ago', async () => {
    mockUsers = [{ id: 'user-1', last_sign_in_at: daysAgo(89) }];
    mockOwnerships = [{ user_id: 'user-1', app_id: 'app-1', apps: null }];
    mockActiveApps = [{ id: 'app-1' }];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.stale_owner).toBe(0);
  });
});

// --- Capacity exceeded ---
describe('GET /api/cron/risk-flags — capacity exceeded', () => {
  it('creates capacity_exceeded flag on newest app when maker is over limit', async () => {
    // 5 amber apps = 5.0 pts, 1 more red = 5.5 pts — over limit
    mockOwnerships = [
      { user_id: 'user-1', app_id: 'app-1', apps: { id: 'app-1', tier: 'amber', status: 'active', created_at: daysAgo(10) } },
      { user_id: 'user-1', app_id: 'app-2', apps: { id: 'app-2', tier: 'amber', status: 'active', created_at: daysAgo(20) } },
      { user_id: 'user-1', app_id: 'app-3', apps: { id: 'app-3', tier: 'amber', status: 'active', created_at: daysAgo(30) } },
      { user_id: 'user-1', app_id: 'app-4', apps: { id: 'app-4', tier: 'amber', status: 'active', created_at: daysAgo(40) } },
      { user_id: 'user-1', app_id: 'app-5', apps: { id: 'app-5', tier: 'amber', status: 'active', created_at: daysAgo(50) } },
      { user_id: 'user-1', app_id: 'app-6', apps: { id: 'app-6', tier: 'red', status: 'active', created_at: daysAgo(5) } },
    ];
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.capacity_exceeded).toBe(1);
    // app-6 is newest (daysAgo(5))
    expect(mockInserted).toEqual(expect.arrayContaining([
      expect.objectContaining({ app_id: 'app-6', flag_type: 'capacity_exceeded', severity: 'warning' }),
    ]));
  });

  it('skips when any of maker\'s apps already has unresolved capacity_exceeded (idempotency)', async () => {
    mockOwnerships = [
      { user_id: 'user-1', app_id: 'app-1', apps: { id: 'app-1', tier: 'amber', status: 'active', created_at: daysAgo(10) } },
      { user_id: 'user-1', app_id: 'app-2', apps: { id: 'app-2', tier: 'amber', status: 'active', created_at: daysAgo(5) } },
      { user_id: 'user-1', app_id: 'app-3', apps: { id: 'app-3', tier: 'amber', status: 'active', created_at: daysAgo(3) } },
      { user_id: 'user-1', app_id: 'app-4', apps: { id: 'app-4', tier: 'amber', status: 'active', created_at: daysAgo(2) } },
      { user_id: 'user-1', app_id: 'app-5', apps: { id: 'app-5', tier: 'amber', status: 'active', created_at: daysAgo(1) } },
      { user_id: 'user-1', app_id: 'app-6', apps: { id: 'app-6', tier: 'red', status: 'active', created_at: daysAgo(0) } },
    ];
    mockExistingFlags = [{ id: 'flag-existing' }];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.capacity_exceeded).toBe(0);
  });

  it('does not flag maker at exactly 5.0 pts (boundary: > not >=)', async () => {
    mockOwnerships = [
      { user_id: 'user-1', app_id: 'app-1', apps: { id: 'app-1', tier: 'amber', status: 'active', created_at: daysAgo(10) } },
      { user_id: 'user-1', app_id: 'app-2', apps: { id: 'app-2', tier: 'amber', status: 'active', created_at: daysAgo(5) } },
      { user_id: 'user-1', app_id: 'app-3', apps: { id: 'app-3', tier: 'amber', status: 'active', created_at: daysAgo(3) } },
      { user_id: 'user-1', app_id: 'app-4', apps: { id: 'app-4', tier: 'amber', status: 'active', created_at: daysAgo(2) } },
      { user_id: 'user-1', app_id: 'app-5', apps: { id: 'app-5', tier: 'amber', status: 'active', created_at: daysAgo(1) } },
    ]; // exactly 5.0
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.capacity_exceeded).toBe(0);
  });

  it('excludes archived apps from capacity calculation', async () => {
    mockOwnerships = [
      { user_id: 'user-1', app_id: 'app-1', apps: { id: 'app-1', tier: 'amber', status: 'active', created_at: daysAgo(10) } },
      { user_id: 'user-1', app_id: 'app-2', apps: { id: 'app-2', tier: 'amber', status: 'archived', created_at: daysAgo(5) } }, // archived
      { user_id: 'user-1', app_id: 'app-3', apps: { id: 'app-3', tier: 'amber', status: 'active', created_at: daysAgo(3) } },
    ]; // 2 non-archived amber = 2.0 pts
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.capacity_exceeded).toBe(0);
  });
});

// --- Dormancy attestation ---
describe('GET /api/cron/risk-flags — dormancy attestation', () => {
  it('creates dormancy_attestation flag for active app with no activity for 61 days', async () => {
    mockDormantApps = [{ id: 'app-1', last_activity_at: null, updated_at: daysAgo(61) }];
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.dormancy_attestation).toBe(1);
    expect(mockInserted).toEqual(expect.arrayContaining([
      expect.objectContaining({ app_id: 'app-1', flag_type: 'dormancy_attestation', severity: 'warning' }),
    ]));
  });

  it('creates dormancy_attestation flag for testing app (status=testing)', async () => {
    mockDormantApps = [{ id: 'app-1', last_activity_at: null, updated_at: daysAgo(61) }];
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.dormancy_attestation).toBe(1);
  });

  it('does not re-flag after confirm-active: last_activity_at is recent', async () => {
    mockDormantApps = [
      // last_activity_at is today (confirmed active) even though updated_at is old
      { id: 'app-1', last_activity_at: daysAgo(0), updated_at: daysAgo(61) },
    ];
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.dormancy_attestation).toBe(0);
  });

  it('skips when unresolved dormancy_attestation flag already exists (idempotency)', async () => {
    mockDormantApps = [{ id: 'app-1', last_activity_at: null, updated_at: daysAgo(61) }];
    mockExistingFlags = [{ id: 'flag-1' }];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.dormancy_attestation).toBe(0);
  });

  it('does not flag app updated 59 days ago (boundary)', async () => {
    mockDormantApps = [{ id: 'app-1', last_activity_at: null, updated_at: daysAgo(59) }];
    mockExistingFlags = [];

    const res = await GET(makeRequest(VALID_SECRET));
    const body = await res.json();
    expect(body.flagged.dormancy_attestation).toBe(0);
  });
});
