import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mock state ---
let mockUser: { id: string } | null;
let mockProfileRole: string;
let mockOwnership: unknown[];
let mockFlag: { id: string } | null;
let mockFlagUpdateError: { message: string } | null;
let mockAppUpdateError: { message: string } | null;
let flagUpdateCalled: boolean;
let appUpdateCalled: boolean;

function buildMockSupabase() {
  flagUpdateCalled = false;
  appUpdateCalled = false;

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser } }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return makeChain({ data: { role: mockProfileRole }, error: null });
      }
      if (table === 'app_owners') {
        return makeChain({ data: mockOwnership, error: null });
      }
      if (table === 'risk_flags') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                is: () => ({
                  limit: () => ({
                    single: () => Promise.resolve({ data: mockFlag, error: mockFlag ? null : { message: 'Not found' } }),
                  }),
                }),
              }),
            }),
          }),
          update: (data: unknown) => {
            void data;
            flagUpdateCalled = true;
            return {
              eq: () => Promise.resolve({ data: null, error: mockFlagUpdateError }),
            };
          },
        };
      }
      if (table === 'apps') {
        return {
          update: (data: unknown) => {
            void data;
            appUpdateCalled = true;
            return {
              eq: () => Promise.resolve({ data: null, error: mockAppUpdateError }),
            };
          },
        };
      }
      return makeChain({ data: null, error: null });
    },
  };
}

function makeChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'is', 'limit'];
  for (const m of methods) chain[m] = () => chain;
  chain.single = () => Promise.resolve(result);
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

vi.mock('@/lib/supabase/auth-server', () => ({
  createAuthServerClient: () => Promise.resolve(buildMockSupabase()),
}));

// Mock @supabase/supabase-js so the service-role client inside the route
// uses the same mock (which tracks flagUpdateCalled / appUpdateCalled)
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => buildMockSupabase(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

const { POST } = await import('@/app/api/apps/[id]/confirm-active/route');

const routeContext = { params: Promise.resolve({ id: 'app-1' }) };

function makeRequest() {
  return new NextRequest('http://localhost/api/apps/app-1/confirm-active', { method: 'POST' });
}

beforeEach(() => {
  mockUser = { id: 'user-1' };
  mockProfileRole = 'maker';
  mockOwnership = [{ id: 'owner-1' }];
  mockFlag = { id: 'flag-1' };
  mockFlagUpdateError = null;
  mockAppUpdateError = null;
});

describe('POST /api/apps/[id]/confirm-active', () => {
  it('returns 401 when not authenticated', async () => {
    mockUser = null;
    const res = await POST(makeRequest(), routeContext);
    expect(res.status).toBe(401);
  });

  it('returns 403 when caller is not owner or admin', async () => {
    mockOwnership = [];
    mockProfileRole = 'maker';
    const res = await POST(makeRequest(), routeContext);
    expect(res.status).toBe(403);
  });

  it('returns 404 when no unresolved dormancy_attestation flag exists', async () => {
    mockFlag = null;
    const res = await POST(makeRequest(), routeContext);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('No dormancy flag to resolve');
  });

  it('returns 200 and resolves flag + updates last_activity_at when called by owner', async () => {
    const res = await POST(makeRequest(), routeContext);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(flagUpdateCalled).toBe(true);
    expect(appUpdateCalled).toBe(true);
  });

  it('returns 200 when called by admin (not just owner)', async () => {
    mockOwnership = [];
    mockProfileRole = 'admin';
    const res = await POST(makeRequest(), routeContext);
    expect(res.status).toBe(200);
    expect(flagUpdateCalled).toBe(true);
  });
});
