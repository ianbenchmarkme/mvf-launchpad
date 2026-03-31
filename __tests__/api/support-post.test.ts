import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mock state ---
let mockUser: { id: string } | null;
let mockProfile: { role: string; email: string; full_name: string | null } | null;
let mockInsertResult: Record<string, unknown> | null;
let mockInsertError: { message: string } | null;

function buildMockSupabase() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser } }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return makeChain({ data: mockProfile, error: mockProfile ? null : { message: 'Not found' } });
      }
      if (table === 'support_requests') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: mockInsertResult,
                error: mockInsertError,
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

const { POST } = await import('@/app/api/support/route');

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  request_type: 'bug_report',
  subject: 'Button not working',
  description: 'The submit button on the registration form does nothing when clicked.',
  related_app_id: null,
  priority: 'medium',
  wants_reply: true,
};

beforeEach(() => {
  mockUser = { id: 'user-1' };
  mockProfile = { role: 'maker', email: 'user@example.com', full_name: 'Test User' };
  mockInsertResult = { id: 'req-1', ...validBody, submitted_by: 'user-1', status: 'open' };
  mockInsertError = null;
});

describe('POST /api/support', () => {
  it('returns 401 when not authenticated', async () => {
    mockUser = null;
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 400 when request_type is missing', async () => {
    const { request_type: _, ...rest } = validBody;
    void _;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 when subject is too short', async () => {
    const res = await POST(makeRequest({ ...validBody, subject: 'Hi' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 when description is too short', async () => {
    const res = await POST(makeRequest({ ...validBody, description: 'Too short' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 when priority is invalid', async () => {
    const res = await POST(makeRequest({ ...validBody, priority: 'critical' }));
    expect(res.status).toBe(400);
  });

  it('returns 201 with valid payload', async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
  });

  it('returns the created record on success', async () => {
    const res = await POST(makeRequest(validBody));
    const body = await res.json();
    expect(body.id).toBe('req-1');
    expect(body.status).toBe('open');
  });

  it('returns 500 when DB insert fails', async () => {
    mockInsertError = { message: 'DB error' };
    mockInsertResult = null;
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });

  it('accepts feature_request type', async () => {
    const res = await POST(makeRequest({ ...validBody, request_type: 'feature_request' }));
    expect(res.status).toBe(201);
  });

  it('accepts feedback type', async () => {
    const res = await POST(makeRequest({ ...validBody, request_type: 'feedback' }));
    expect(res.status).toBe(201);
  });

  it('accepts question type', async () => {
    const res = await POST(makeRequest({ ...validBody, request_type: 'question' }));
    expect(res.status).toBe(201);
  });

  it('accepts wants_reply false', async () => {
    const res = await POST(makeRequest({ ...validBody, wants_reply: false }));
    expect(res.status).toBe(201);
  });
});
