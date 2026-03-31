import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mock state ---
let mockUser: { id: string } | null;
let mockProfileRole: string;
let mockExistingRequest: Record<string, unknown> | null;
let mockUpdateResult: Record<string, unknown> | null;
let mockUpdateError: { message: string } | null;
let emailSendCalled: boolean;
let emailSendArgs: Record<string, unknown> | null;

function buildMockSupabase() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser } }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        // Support two different queries: role check + resolver name
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { role: mockProfileRole, full_name: 'Admin User' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'support_requests') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: mockExistingRequest,
                error: mockExistingRequest ? null : { message: 'Not found' },
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: mockUpdateResult,
                  error: mockUpdateError,
                }),
              }),
            }),
          }),
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

vi.mock('@/lib/email', () => ({
  sendResolutionEmail: (args: Record<string, unknown>) => {
    emailSendCalled = true;
    emailSendArgs = args;
    return Promise.resolve();
  },
}));

const { PATCH } = await import('@/app/api/support/[id]/route');

interface RouteContext {
  params: Promise<{ id: string }>;
}

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/support/req-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const routeContext: RouteContext = { params: Promise.resolve({ id: 'req-1' }) };

beforeEach(() => {
  mockUser = { id: 'admin-1' };
  mockProfileRole = 'admin';
  mockExistingRequest = {
    id: 'req-1',
    subject: 'Bug in form',
    status: 'open',
    wants_reply: true,
    submitted_email: 'user@example.com',
    submitted_name: 'Test User',
  };
  mockUpdateResult = { id: 'req-1', status: 'in_progress' };
  mockUpdateError = null;
  emailSendCalled = false;
  emailSendArgs = null;
});

describe('PATCH /api/support/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockUser = null;
    const res = await PATCH(makeRequest({ status: 'in_progress' }), routeContext);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not admin', async () => {
    mockProfileRole = 'maker';
    const res = await PATCH(makeRequest({ status: 'in_progress' }), routeContext);
    expect(res.status).toBe(403);
  });

  it('returns 404 when request does not exist', async () => {
    mockExistingRequest = null;
    const res = await PATCH(makeRequest({ status: 'in_progress' }), routeContext);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status value', async () => {
    const res = await PATCH(makeRequest({ status: 'invalid_status' }), routeContext);
    expect(res.status).toBe(400);
  });

  it('returns 400 when completed without resolution_note', async () => {
    const res = await PATCH(makeRequest({ status: 'completed' }), routeContext);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 when wont_do without resolution_note', async () => {
    const res = await PATCH(makeRequest({ status: 'wont_do' }), routeContext);
    expect(res.status).toBe(400);
  });

  it('returns 400 when resolution_note is too short for completed', async () => {
    const res = await PATCH(makeRequest({ status: 'completed', resolution_note: 'Too short' }), routeContext);
    expect(res.status).toBe(400);
  });

  it('returns 200 when setting status to in_progress without note', async () => {
    const res = await PATCH(makeRequest({ status: 'in_progress' }), routeContext);
    expect(res.status).toBe(200);
  });

  it('returns 200 when setting status to open', async () => {
    const res = await PATCH(makeRequest({ status: 'open' }), routeContext);
    expect(res.status).toBe(200);
  });

  it('returns 200 when completed with valid resolution_note', async () => {
    mockUpdateResult = { id: 'req-1', status: 'completed' };
    const res = await PATCH(makeRequest({ status: 'completed', resolution_note: 'This has been fixed in the latest deploy.' }), routeContext);
    expect(res.status).toBe(200);
  });

  it('returns 200 when wont_do with valid resolution_note', async () => {
    mockUpdateResult = { id: 'req-1', status: 'wont_do' };
    const res = await PATCH(makeRequest({ status: 'wont_do', resolution_note: 'This is out of scope for now.' }), routeContext);
    expect(res.status).toBe(200);
  });

  it('sends resolution email when completed and wants_reply is true', async () => {
    mockUpdateResult = { id: 'req-1', status: 'completed' };
    await PATCH(makeRequest({ status: 'completed', resolution_note: 'Fixed in the latest deploy.' }), routeContext);
    expect(emailSendCalled).toBe(true);
    expect(emailSendArgs?.to).toBe('user@example.com');
    expect(emailSendArgs?.status).toBe('completed');
  });

  it('sends resolution email when wont_do and wants_reply is true', async () => {
    mockUpdateResult = { id: 'req-1', status: 'wont_do' };
    await PATCH(makeRequest({ status: 'wont_do', resolution_note: 'Out of scope for now.' }), routeContext);
    expect(emailSendCalled).toBe(true);
    expect(emailSendArgs?.status).toBe('wont_do');
  });

  it('does NOT send email when wants_reply is false', async () => {
    mockExistingRequest = { ...mockExistingRequest, wants_reply: false };
    mockUpdateResult = { id: 'req-1', status: 'completed' };
    await PATCH(makeRequest({ status: 'completed', resolution_note: 'Fixed in the latest deploy.' }), routeContext);
    expect(emailSendCalled).toBe(false);
  });

  it('does NOT send email when setting to in_progress', async () => {
    await PATCH(makeRequest({ status: 'in_progress' }), routeContext);
    expect(emailSendCalled).toBe(false);
  });

  it('returns 500 when DB update fails', async () => {
    mockUpdateError = { message: 'DB error' };
    mockUpdateResult = null;
    const res = await PATCH(makeRequest({ status: 'in_progress' }), routeContext);
    expect(res.status).toBe(500);
  });
});
