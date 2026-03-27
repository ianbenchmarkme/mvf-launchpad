import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Configurable mock state
let mockUser: { id: string } | null;
let mockProfileRole: string;
let mockOwnership: unknown[];
let mockCurrentApp: Record<string, string>;
let mockUpdateResult: Record<string, unknown>;
let mockUpdateError: { message: string } | null;
let mockInsertedFlags: unknown[];

// Build mock supabase that reads from the module-level state variables
function buildMockSupabase() {
  mockInsertedFlags = [];

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
          insert: (flags: unknown[]) => {
            mockInsertedFlags = flags;
            return Promise.resolve({ data: null, error: null });
          },
        };
      }
      // 'apps' table
      let pendingUpdate: Record<string, unknown> | null = null;
      const chain: Record<string, unknown> = {};
      chain.select = () => chain;
      chain.update = (data: Record<string, unknown>) => { pendingUpdate = data; return chain; };
      chain.eq = () => chain;
      chain.single = () => {
        if (pendingUpdate) {
          const result = mockUpdateError
            ? { data: null, error: mockUpdateError }
            : { data: mockUpdateResult, error: null };
          pendingUpdate = null;
          return Promise.resolve(result);
        }
        // Select for current app state
        return Promise.resolve({ data: mockCurrentApp, error: null });
      };
      return chain;
    },
  };
}

function makeChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'is'];
  for (const m of methods) chain[m] = () => chain;
  // Both .single() and .limit() can be terminal — return a thenable chain
  chain.single = () => Promise.resolve(result);
  chain.limit = () => Promise.resolve(result);
  // Also make the chain itself thenable for direct await
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

vi.mock('@/lib/supabase/auth-server', () => ({
  createAuthServerClient: () => Promise.resolve(buildMockSupabase()),
}));

const { PATCH, DELETE } = await import('@/app/api/apps/[id]/route');

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/apps/app-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest() {
  return new NextRequest('http://localhost/api/apps/app-1', { method: 'DELETE' });
}

const routeContext = { params: Promise.resolve({ id: 'app-1' }) };

beforeEach(() => {
  mockUser = { id: 'user-1' };
  mockProfileRole = 'maker';
  mockOwnership = [{ id: 'owner-1' }];
  mockCurrentApp = { handles_pii: 'no', needs_business_data: 'no', uses_api_keys: 'no' };
  mockUpdateResult = { id: 'app-1', name: 'Updated' };
  mockUpdateError = null;
});

describe('PATCH /api/apps/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockUser = null;
    const res = await PATCH(makeRequest({ name: 'Test' }), routeContext);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid payload', async () => {
    const res = await PATCH(makeRequest({ name: 'A' }), routeContext);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('returns 403 for non-owner non-admin', async () => {
    mockOwnership = [];
    const res = await PATCH(makeRequest({ name: 'Valid Name' }), routeContext);
    expect(res.status).toBe(403);
  });

  it('returns 200 for owner with valid payload', async () => {
    const res = await PATCH(makeRequest({ name: 'Valid Name' }), routeContext);
    expect(res.status).toBe(200);
  });

  it('returns 200 for admin (even if not owner)', async () => {
    mockProfileRole = 'admin';
    mockOwnership = [];
    const res = await PATCH(makeRequest({ name: 'Valid Name' }), routeContext);
    expect(res.status).toBe(200);
  });

  it('creates risk flag when handles_pii changes to unsure', async () => {
    await PATCH(makeRequest({ handles_pii: 'unsure' }), routeContext);
    expect(mockInsertedFlags).toEqual(expect.arrayContaining([
      expect.objectContaining({ flag_type: 'unsure_pii', severity: 'warning' }),
    ]));
  });

  it('creates pii_confirmed flag when handles_pii changes to yes', async () => {
    await PATCH(makeRequest({ handles_pii: 'yes' }), routeContext);
    expect(mockInsertedFlags).toEqual(expect.arrayContaining([
      expect.objectContaining({ flag_type: 'pii_confirmed', severity: 'critical' }),
    ]));
  });

  it('creates multiple flags for multiple unsure changes', async () => {
    await PATCH(makeRequest({
      handles_pii: 'unsure',
      needs_business_data: 'unsure',
      uses_api_keys: 'unsure',
    }), routeContext);
    expect(mockInsertedFlags).toHaveLength(3);
  });

  it('does not create flags when tristate value unchanged', async () => {
    await PATCH(makeRequest({ name: 'New Name' }), routeContext);
    expect(mockInsertedFlags).toHaveLength(0);
  });

  it('returns 400 when no valid fields to update after stripping', async () => {
    // Non-admin sending only admin fields — should be stripped to empty
    const res = await PATCH(makeRequest({ tier: 'green', status: 'active' } as Record<string, unknown>), routeContext);
    // updateAppSchema strips unknown fields, so tier/status won't even parse
    // Actually they'll be in the raw body but not in the schema output
    // Let's check — the schema accepts {} (empty) which then gets sanitized to empty
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/apps/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockUser = null;
    const res = await DELETE(makeDeleteRequest(), routeContext);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-owner non-admin', async () => {
    mockOwnership = [];
    const res = await DELETE(makeDeleteRequest(), routeContext);
    expect(res.status).toBe(403);
  });

  it('returns 200 for owner', async () => {
    const res = await DELETE(makeDeleteRequest(), routeContext);
    expect(res.status).toBe(200);
  });

  it('returns 200 for admin', async () => {
    mockProfileRole = 'admin';
    mockOwnership = [];
    const res = await DELETE(makeDeleteRequest(), routeContext);
    expect(res.status).toBe(200);
  });
});
