import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Configurable mock state ────────────────────────────────────
let mockUser: { id: string } | null;
let mockProfileRole: string;
// Is the current user the app creator?
let mockIsCreator: boolean;
// Existing owners on the app
let mockExistingOwners: { id: string; user_id: string; owner_role: string }[];
// Profile found by email lookup
let mockFoundProfile: { id: string; email: string; full_name: string | null } | null;
// Result of insert into app_owners
let mockInsertResult: { data: unknown; error: { message: string } | null };
// Result of delete from app_owners
let mockDeleteResult: { error: { message: string } | null };

// Tracks calls so tests can assert on them
let lastInsertPayload: unknown;

function buildMockSupabase() {
  lastInsertPayload = null;

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser } }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        // Two distinct query paths:
        // 1. Role lookup by id: .select('role').eq('id', ...).single()
        // 2. Profile lookup by email: .select('id, email, full_name').eq('email', ...).single()
        const chain: Record<string, unknown> = {};
        let selectFields = '';
        let eqField = '';

        chain.select = (fields: string) => { selectFields = fields; return chain; };
        chain.eq = (field: string) => { eqField = field; return chain; };
        chain.single = () => {
          if (eqField === 'email') {
            // Email lookup
            return Promise.resolve({
              data: mockFoundProfile,
              error: mockFoundProfile ? null : { message: 'Not found' },
            });
          }
          // Role/id lookup
          void selectFields;
          return Promise.resolve({ data: { role: mockProfileRole }, error: null });
        };
        return chain;
      }

      if (table === 'app_owners') {
        const chain: Record<string, unknown> = {};
        let pendingAction: 'select' | 'insert' | 'delete' | null = null;
        const eqFilters: Record<string, string> = {};
        let insertPayload: unknown = null;

        chain.select = (fields?: string) => {
          void fields;
          pendingAction = 'select';
          return chain;
        };
        chain.insert = (payload: unknown) => {
          pendingAction = 'insert';
          insertPayload = payload;
          lastInsertPayload = payload;
          return chain;
        };
        chain.delete = () => { pendingAction = 'delete'; return chain; };
        chain.eq = (field: string, val: string) => {
          eqFilters[field] = val;
          return chain;
        };
        chain.single = () => {
          if (pendingAction === 'insert') {
            lastInsertPayload = insertPayload;
            return Promise.resolve(mockInsertResult);
          }
          return Promise.resolve({ data: null, error: null });
        };
        // Chains awaited directly (no .single()) — existing-owner check and allOwners check
        chain.then = (resolve: (v: unknown) => unknown) => {
          if (pendingAction === 'select') {
            return Promise.resolve({
              data: mockExistingOwners,
              error: null,
            }).then(resolve);
          }
          if (pendingAction === 'delete') {
            return Promise.resolve(mockDeleteResult).then(resolve);
          }
          return Promise.resolve({ data: null, error: null }).then(resolve);
        };

        return chain;
      }

      if (table === 'apps') {
        const chain: Record<string, unknown> = {};
        chain.select = () => chain;
        chain.eq = () => chain;
        chain.single = () => Promise.resolve({
          data: { created_by: mockIsCreator ? mockUser?.id ?? 'other' : 'other-user' },
          error: null,
        });
        return chain;
      }

      return {};
    },
  };
}

vi.mock('@/lib/supabase/auth-server', () => ({
  createAuthServerClient: () => Promise.resolve(buildMockSupabase()),
}));

const { POST, DELETE } = await import('@/app/api/apps/[id]/owners/route');

const routeContext = { params: Promise.resolve({ id: 'app-1' }) };

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/apps/app-1/owners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/apps/app-1/owners', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// RFC 4122 v4 UUIDs — required by Zod's strict uuid validation
const PRIMARY_OWNER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5';
const BACKUP_OWNER_ID  = 'b2c3d4e5-f6a7-4b8c-9d0e-f1a2b3c4d5e6';
const CREATOR_USER_ID  = 'c3d4e5f6-a7b8-4c9d-ae0f-a1b2c3d4e5f6';
const BACKUP_USER_ID   = 'd4e5f6a7-b8c9-4d0e-bf1a-b2c3d4e5f6a7';

beforeEach(() => {
  mockUser = { id: CREATOR_USER_ID };
  mockProfileRole = 'maker';
  mockIsCreator = true;
  mockExistingOwners = [
    { id: PRIMARY_OWNER_ID, user_id: CREATOR_USER_ID, owner_role: 'primary' },
  ];
  mockFoundProfile = { id: BACKUP_USER_ID, email: 'backup@example.com', full_name: 'Backup User' };
  mockInsertResult = {
    data: { id: BACKUP_OWNER_ID, app_id: 'app-1', user_id: BACKUP_USER_ID, owner_role: 'backup', created_at: '2026-01-01' },
    error: null,
  };
  mockDeleteResult = { error: null };
});

// ── POST /api/apps/[id]/owners ─────────────────────────────────

describe('POST /api/apps/[id]/owners', () => {
  it('returns 401 when not authenticated', async () => {
    mockUser = null;
    const res = await POST(makePostRequest({ email: 'backup@example.com' }), routeContext);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not creator and not admin', async () => {
    mockIsCreator = false;
    mockProfileRole = 'maker';
    const res = await POST(makePostRequest({ email: 'backup@example.com' }), routeContext);
    expect(res.status).toBe(403);
  });

  it('returns 201 when user is admin even if not creator', async () => {
    mockIsCreator = false;
    mockProfileRole = 'admin';
    mockExistingOwners = [{ id: PRIMARY_OWNER_ID, user_id: CREATOR_USER_ID, owner_role: 'primary' }];
    const res = await POST(makePostRequest({ email: 'backup@example.com' }), routeContext);
    expect(res.status).toBe(201);
  });

  it('returns 400 for missing email', async () => {
    const res = await POST(makePostRequest({}), routeContext);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await POST(makePostRequest({ email: 'not-an-email' }), routeContext);
    expect(res.status).toBe(400);
  });

  it('returns 404 when email has no Launchpad account', async () => {
    mockFoundProfile = null;
    const res = await POST(makePostRequest({ email: 'nobody@example.com' }), routeContext);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('No Launchpad account found');
  });

  it('returns 409 when user is already an owner', async () => {
    // mockFoundProfile.id matches an existing owner (the creator/primary)
    mockFoundProfile = { id: CREATOR_USER_ID, email: 'creator@example.com', full_name: 'Creator' };
    const res = await POST(makePostRequest({ email: 'creator@example.com' }), routeContext);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain('already an owner');
  });

  it('returns 201 with new owner on success', async () => {
    const res = await POST(makePostRequest({ email: 'backup@example.com' }), routeContext);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.owner_role).toBe('backup');
  });

  it('inserts with owner_role backup', async () => {
    await POST(makePostRequest({ email: 'backup@example.com' }), routeContext);
    expect(lastInsertPayload).toMatchObject({ owner_role: 'backup' });
  });
});

// ── DELETE /api/apps/[id]/owners ───────────────────────────────

describe('DELETE /api/apps/[id]/owners', () => {
  it('returns 401 when not authenticated', async () => {
    mockUser = null;
    const res = await DELETE(makeDeleteRequest({ owner_id: PRIMARY_OWNER_ID }), routeContext);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not creator and not admin', async () => {
    mockIsCreator = false;
    mockProfileRole = 'maker';
    const res = await DELETE(makeDeleteRequest({ owner_id: BACKUP_OWNER_ID }), routeContext);
    expect(res.status).toBe(403);
  });

  it('returns 400 for missing owner_id', async () => {
    const res = await DELETE(makeDeleteRequest({}), routeContext);
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-uuid owner_id', async () => {
    const res = await DELETE(makeDeleteRequest({ owner_id: 'not-a-uuid' }), routeContext);
    expect(res.status).toBe(400);
  });

  it('returns 400 when trying to remove the primary owner', async () => {
    const res = await DELETE(makeDeleteRequest({ owner_id: PRIMARY_OWNER_ID }), routeContext);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('primary owner');
  });

  it('returns 204 on successful removal of a backup owner', async () => {
    mockExistingOwners = [
      { id: PRIMARY_OWNER_ID, user_id: CREATOR_USER_ID, owner_role: 'primary' },
      { id: BACKUP_OWNER_ID, user_id: BACKUP_USER_ID, owner_role: 'backup' },
    ];
    const res = await DELETE(makeDeleteRequest({ owner_id: BACKUP_OWNER_ID }), routeContext);
    expect(res.status).toBe(204);
  });

  it('returns 204 when admin removes a backup owner even if not creator', async () => {
    mockIsCreator = false;
    mockProfileRole = 'admin';
    mockExistingOwners = [
      { id: PRIMARY_OWNER_ID, user_id: CREATOR_USER_ID, owner_role: 'primary' },
      { id: BACKUP_OWNER_ID, user_id: BACKUP_USER_ID, owner_role: 'backup' },
    ];
    const res = await DELETE(makeDeleteRequest({ owner_id: BACKUP_OWNER_ID }), routeContext);
    expect(res.status).toBe(204);
  });
});
