import { describe, it, expect } from 'vitest';
import { registrationSchema, updateAppSchema, sanitizeUpdatePayload } from '@/lib/validators';

const validRegistration = {
  name: 'ArtyFish',
  problem_statement: 'Generate paid marketing wins using AI creative tools',
  target_users: 'department' as const,
  potential_roi: 'Saves 10h/week for the creative team',
  needs_business_data: 'no' as const,
  handles_pii: 'no' as const,
  uses_api_keys: 'yes' as const,
  api_key_services: 'OpenAI, Replicate',
  replaces_third_party: false,
};

describe('registrationSchema', () => {
  it('accepts a valid full registration', () => {
    const result = registrationSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, name: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects empty problem statement', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, problem_statement: '' });
    expect(result.success).toBe(false);
  });

  it('rejects problem statement shorter than 10 characters', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, problem_statement: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('layer is optional and defaults to L3', () => {
    const result = registrationSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.layer).toBe('L3');
    }
  });

  it('rejects invalid layer', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, layer: 'L4' });
    expect(result.success).toBe(false);
  });

  it('accepts valid category', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, category: 'Marketing' });
    expect(result.success).toBe(true);
  });

  it('category is optional — missing is ok', () => {
    const result = registrationSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, category: 'Finance' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid target_users', () => {
    const result = registrationSchema.safeParse({ ...validRegistration, target_users: 'everyone' });
    expect(result.success).toBe(false);
  });

  it('requires api_key_services when uses_api_keys is yes', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      uses_api_keys: 'yes',
      api_key_services: '',
    });
    expect(result.success).toBe(false);
  });

  it('does not require api_key_services when uses_api_keys is no', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      uses_api_keys: 'no',
      api_key_services: '',
    });
    expect(result.success).toBe(true);
  });

  it('does not require api_key_services when uses_api_keys is unsure', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      uses_api_keys: 'unsure',
      api_key_services: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('requires replaced_tool_name when replaces_third_party is true', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      replaces_third_party: true,
      replaced_tool_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts replaced_tool_name and cost when replaces_third_party is true', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      replaces_third_party: true,
      replaced_tool_name: 'Canva Pro',
      replaced_tool_cost: '£2,000/year',
    });
    expect(result.success).toBe(true);
  });

  it('allows potential_roi to be empty', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      potential_roi: '',
    });
    expect(result.success).toBe(true);
  });

  it('allows potential_roi to be undefined', () => {
    const { potential_roi: _, ...withoutRoi } = validRegistration;
    const result = registrationSchema.safeParse(withoutRoi);
    expect(result.success).toBe(true);
  });

  it('defaults needs_business_data to unsure if not provided', () => {
    const { needs_business_data: _, ...withoutField } = validRegistration;
    const result = registrationSchema.safeParse(withoutField);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.needs_business_data).toBe('unsure');
    }
  });
});

describe('updateAppSchema', () => {
  it('accepts a partial payload with just name', () => {
    const result = updateAppSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts a partial payload with just problem_statement', () => {
    const result = updateAppSchema.safeParse({ problem_statement: 'A longer problem statement here' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object (no fields to update)', () => {
    const result = updateAppSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = updateAppSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects problem_statement shorter than 10 characters', () => {
    const result = updateAppSchema.safeParse({ problem_statement: 'Short' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid layer value', () => {
    const result = updateAppSchema.safeParse({ layer: 'L4' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid tristate value', () => {
    const result = updateAppSchema.safeParse({ handles_pii: 'maybe' });
    expect(result.success).toBe(false);
  });

  it('requires api_key_services when uses_api_keys is yes AND api_key_services is present but empty', () => {
    const result = updateAppSchema.safeParse({
      uses_api_keys: 'yes',
      api_key_services: '',
    });
    expect(result.success).toBe(false);
  });

  it('does not require api_key_services when only uses_api_keys is present', () => {
    const result = updateAppSchema.safeParse({ uses_api_keys: 'yes' });
    expect(result.success).toBe(true);
  });

  it('does not require replaced_tool_name when only replaces_third_party is present', () => {
    const result = updateAppSchema.safeParse({ replaces_third_party: true });
    expect(result.success).toBe(true);
  });

  it('requires replaced_tool_name when both fields present and replaces_third_party is true', () => {
    const result = updateAppSchema.safeParse({
      replaces_third_party: true,
      replaced_tool_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid conditional pair', () => {
    const result = updateAppSchema.safeParse({
      uses_api_keys: 'yes',
      api_key_services: 'OpenAI',
    });
    expect(result.success).toBe(true);
  });

  it('ignores unknown fields', () => {
    const result = updateAppSchema.safeParse({ name: 'Valid Name', unknown_field: 'test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('unknown_field' in result.data).toBe(false);
    }
  });
});

describe('sanitizeUpdatePayload', () => {
  it('strips protected fields', () => {
    const payload = { name: 'Test', id: '123', created_by: 'user1', created_at: 'now', updated_at: 'now' };
    const result = sanitizeUpdatePayload(payload, true);
    expect(result).toEqual({ name: 'Test' });
  });

  it('strips admin-only fields for non-admins', () => {
    const payload = { name: 'Test', tier: 'green', status: 'active' };
    const result = sanitizeUpdatePayload(payload, false);
    expect(result).toEqual({ name: 'Test' });
  });

  it('keeps admin-only fields for admins', () => {
    const payload = { name: 'Test', tier: 'green', status: 'active' };
    const result = sanitizeUpdatePayload(payload, true);
    expect(result).toEqual({ name: 'Test', tier: 'green', status: 'active' });
  });

  it('returns empty object when all fields are protected', () => {
    const payload = { id: '123', created_by: 'user1' };
    const result = sanitizeUpdatePayload(payload, false);
    expect(result).toEqual({});
  });
});
