import { z } from 'zod';

const tristate = z.enum(['yes', 'no', 'unsure']);
const layer = z.enum(['L1', 'L2', 'L3']);
const targetUsers = z.enum(['my_team', 'department', 'org_wide']);

// Base field definitions shared by registration and update schemas
const baseAppFields = z.object({
  name: z.string().min(2).max(100),
  problem_statement: z.string().min(10).max(2000),
  layer: layer,
  target_users: targetUsers,
  potential_roi: z.string().optional().default(''),
  needs_business_data: tristate.optional().default('unsure'),
  handles_pii: tristate.optional().default('unsure'),
  uses_api_keys: tristate.optional().default('unsure'),
  api_key_services: z.string().optional().default(''),
  replaces_third_party: z.boolean().optional().default(false),
  replaced_tool_name: z.string().optional().default(''),
  replaced_tool_cost: z.string().optional().default(''),
});

export const registrationSchema = baseAppFields.check(
  (ctx) => {
    // api_key_services required when uses_api_keys is 'yes'
    if (ctx.value.uses_api_keys === 'yes' && !ctx.value.api_key_services?.trim()) {
      ctx.issues.push({
        code: 'custom',
        message: 'Please specify which services use API keys',
        path: ['api_key_services'],
        input: ctx.value.api_key_services,
      });
    }
    // replaced_tool_name required when replaces_third_party is true
    if (ctx.value.replaces_third_party && !ctx.value.replaced_tool_name?.trim()) {
      ctx.issues.push({
        code: 'custom',
        message: 'Please specify which tool this replaces',
        path: ['replaced_tool_name'],
        input: ctx.value.replaced_tool_name,
      });
    }
  }
);

// Partial schema for app updates — derived from baseAppFields with defaults stripped
export const updateAppSchema = baseAppFields.required().partial().check(
  (ctx) => {
    // Conditional validation only fires when both related fields are explicitly present
    if (ctx.value.uses_api_keys === 'yes' &&
        ctx.value.api_key_services !== undefined && !ctx.value.api_key_services?.trim()) {
      ctx.issues.push({
        code: 'custom',
        message: 'Please specify which services use API keys',
        path: ['api_key_services'],
        input: ctx.value.api_key_services,
      });
    }
    if (ctx.value.replaces_third_party === true &&
        ctx.value.replaced_tool_name !== undefined && !ctx.value.replaced_tool_name?.trim()) {
      ctx.issues.push({
        code: 'custom',
        message: 'Please specify which tool this replaces',
        path: ['replaced_tool_name'],
        input: ctx.value.replaced_tool_name,
      });
    }
  }
);

// Fields that only admins can change — stripped from non-admin update payloads
export const ADMIN_ONLY_FIELDS = ['tier', 'status'] as const;

// Fields that should never be in an update payload
export const PROTECTED_FIELDS = ['id', 'created_by', 'created_at', 'updated_at'] as const;

/** Strip protected and optionally admin-only fields from a payload */
export function sanitizeUpdatePayload(
  data: Record<string, unknown>,
  isAdmin: boolean
): Record<string, unknown> {
  const stripped = { ...data };
  for (const field of PROTECTED_FIELDS) {
    delete stripped[field];
  }
  if (!isAdmin) {
    for (const field of ADMIN_ONLY_FIELDS) {
      delete stripped[field];
    }
  }
  return stripped;
}

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;
export type UpdateAppInput = z.input<typeof updateAppSchema>;
export type UpdateAppData = z.output<typeof updateAppSchema>;
