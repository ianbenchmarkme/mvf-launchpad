import { z } from 'zod';

const tristate = z.enum(['yes', 'no', 'unsure']);
const layer = z.enum(['L1', 'L2', 'L3']);
const targetUsers = z.enum(['my_team', 'department', 'org_wide']);

export const registrationSchema = z.object({
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
}).check(
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

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;
