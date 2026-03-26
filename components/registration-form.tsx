'use client';

import { useState } from 'react';
import { registrationSchema, type RegistrationInput } from '@/lib/validators';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationInput) => Promise<void> | void;
}

type Layer = 'L1' | 'L2' | 'L3';
type TargetUsers = 'my_team' | 'department' | 'org_wide';
type Tristate = 'yes' | 'no' | 'unsure';

const LAYER_OPTIONS: { value: Layer; label: string }[] = [
  { value: 'L1', label: 'Engineering' },
  { value: 'L2', label: 'Product & Design' },
  { value: 'L3', label: 'Makers Programme' },
];

const TARGET_OPTIONS: { value: TargetUsers; label: string }[] = [
  { value: 'my_team', label: 'My Team' },
  { value: 'department', label: 'Department' },
  { value: 'org_wide', label: 'Organisation-wide' },
];

const TRISTATE_OPTIONS: { value: Tristate; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' },
];

export function RegistrationForm({ onSubmit }: RegistrationFormProps) {
  const [name, setName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [layer, setLayer] = useState<Layer | ''>('');
  const [targetUsers, setTargetUsers] = useState<TargetUsers | ''>('');
  const [potentialRoi, setPotentialRoi] = useState('');
  const [needsBusinessData, setNeedsBusinessData] = useState<Tristate>('unsure');
  const [handlesPii, setHandlesPii] = useState<Tristate>('unsure');
  const [usesApiKeys, setUsesApiKeys] = useState<Tristate>('unsure');
  const [apiKeyServices, setApiKeyServices] = useState('');
  const [replacesThirdParty, setReplacesThirdParty] = useState(false);
  const [replacedToolName, setReplacedToolName] = useState('');
  const [replacedToolCost, setReplacedToolCost] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData = {
      name,
      problem_statement: problemStatement,
      layer: layer || undefined,
      target_users: targetUsers || undefined,
      potential_roi: potentialRoi,
      needs_business_data: needsBusinessData,
      handles_pii: handlesPii,
      uses_api_keys: usesApiKeys,
      api_key_services: apiKeyServices,
      replaces_third_party: replacesThirdParty,
      replaced_tool_name: replacedToolName,
      replaced_tool_cost: replacedToolCost,
    };

    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch {
      // Let caller handle errors
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* App Name */}
      <div className="space-y-1">
        <label htmlFor="app-name" className="block text-sm font-medium">
          App Name
        </label>
        <input
          id="app-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What's your tool called?"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Problem Statement */}
      <div className="space-y-1">
        <label htmlFor="problem-statement" className="block text-sm font-medium">
          Problem Statement
        </label>
        <textarea
          id="problem-statement"
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="What problem are you trying to solve?"
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        {errors.problem_statement && (
          <p className="text-sm text-red-600">{errors.problem_statement}</p>
        )}
      </div>

      {/* Layer */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Layer</legend>
        <div className="flex gap-2">
          {LAYER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLayer(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                layer === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.layer && <p className="text-sm text-red-600">{errors.layer}</p>}
      </fieldset>

      {/* Target Users */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Target Users</legend>
        <div className="flex gap-2">
          {TARGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTargetUsers(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                targetUsers === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.target_users && <p className="text-sm text-red-600">{errors.target_users}</p>}
      </fieldset>

      {/* Potential ROI */}
      <div className="space-y-1">
        <label htmlFor="potential-roi" className="block text-sm font-medium">
          Potential ROI
        </label>
        <input
          id="potential-roi"
          type="text"
          value={potentialRoi}
          onChange={(e) => setPotentialRoi(e.target.value)}
          placeholder="e.g., saves 2h/week for 5 people"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Needs Business Data */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Needs Business Data?</legend>
        <div className="flex gap-2">
          {TRISTATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setNeedsBusinessData(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                needsBusinessData === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Handles PII */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Handles PII?</legend>
        <div className="flex gap-2">
          {TRISTATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setHandlesPii(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                handlesPii === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {handlesPii === 'yes' && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
            Legal will be notified automatically when this app is registered.
          </p>
        )}
      </fieldset>

      {/* Uses API Keys */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Uses API Keys or External Services?</legend>
        <div className="flex gap-2">
          {TRISTATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setUsesApiKeys(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                usesApiKeys === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {usesApiKeys === 'yes' && (
          <div className="space-y-1">
            <label htmlFor="api-services" className="block text-sm font-medium">
              Which services?
            </label>
            <input
              id="api-services"
              type="text"
              value={apiKeyServices}
              onChange={(e) => setApiKeyServices(e.target.value)}
              placeholder="e.g., OpenAI, Stripe, Replicate"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {errors.api_key_services && (
              <p className="text-sm text-red-600">{errors.api_key_services}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* Replaces Third-Party Tool */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Replaces a Third-Party Tool?</legend>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReplacesThirdParty(true)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              replacesThirdParty
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-accent'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setReplacesThirdParty(false)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              !replacesThirdParty
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-accent'
            }`}
          >
            No
          </button>
        </div>
        {replacesThirdParty && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="replaced-tool" className="block text-sm font-medium">
                Which tool does it replace?
              </label>
              <input
                id="replaced-tool"
                type="text"
                value={replacedToolName}
                onChange={(e) => setReplacedToolName(e.target.value)}
                placeholder="e.g., Canva Pro"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              {errors.replaced_tool_name && (
                <p className="text-sm text-red-600">{errors.replaced_tool_name}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="replaced-cost" className="block text-sm font-medium">
                Approximate annual cost
              </label>
              <input
                id="replaced-cost"
                type="text"
                value={replacedToolCost}
                onChange={(e) => setReplacedToolCost(e.target.value)}
                placeholder="e.g., £2,000/year"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Registering...' : 'Register App'}
      </button>
    </form>
  );
}
