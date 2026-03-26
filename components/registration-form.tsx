'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Rocket, Users, Shield, Sparkles,
  ArrowLeft, ArrowRight, Check,
  Code, Palette, Lightbulb,
  Database, KeyRound, Scale,
  Replace,
} from 'lucide-react';
import { registrationSchema, type RegistrationInput } from '@/lib/validators';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationInput) => Promise<void> | void;
}

type Layer = 'L1' | 'L2' | 'L3';
type TargetUsers = 'my_team' | 'department' | 'org_wide';
type Tristate = 'yes' | 'no' | 'unsure';

const STEPS = [
  { title: 'What are you building?', subtitle: 'Tell us about your idea', icon: Rocket },
  { title: 'Who is it for?', subtitle: 'Help us understand the scope', icon: Users },
  { title: 'Data & Security', subtitle: 'Quick safety check', icon: Shield },
  { title: 'Almost done!', subtitle: "Let's launch this", icon: Sparkles },
] as const;

const LAYER_OPTIONS: { value: Layer; label: string; description: string; icon: typeof Code }[] = [
  { value: 'L1', label: 'Engineering', description: 'Core systems, production, strategic Rocks', icon: Code },
  { value: 'L2', label: 'Product & Design', description: 'Internal tools, CRO experiments, prototypes', icon: Palette },
  { value: 'L3', label: 'Makers Programme', description: 'Team tools, workflow improvements, automations', icon: Lightbulb },
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
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Form state
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

  // Trigger entrance animation on step change
  useEffect(() => {
    setMounted(false);
    const frame = requestAnimationFrame(() => setMounted(true));
    contentRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    return () => cancelAnimationFrame(frame);
  }, [currentStep]);

  function validateCurrentStep(): boolean {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!name || name.length < 2) stepErrors.name = 'App name must be at least 2 characters';
      if (!problemStatement || problemStatement.length < 10) stepErrors.problem_statement = 'Problem statement must be at least 10 characters';
    } else if (currentStep === 1) {
      if (!layer) stepErrors.layer = 'Please select a layer';
      if (!targetUsers) stepErrors.target_users = 'Please select target users';
    } else if (currentStep === 2) {
      if (usesApiKeys === 'yes' && !apiKeyServices.trim()) {
        stepErrors.api_key_services = 'Please specify which services use API keys';
      }
    } else if (currentStep === 3) {
      if (replacesThirdParty && !replacedToolName.trim()) {
        stepErrors.replaced_tool_name = 'Please specify which tool this replaces';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setDirection('forward');
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setDirection('back');
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(step: number) {
    if (step < currentStep) {
      setDirection('back');
      setErrors({});
      setCurrentStep(step);
    }
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;

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
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch {
      // Let caller handle
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLastStep = currentStep === STEPS.length - 1;

  // Animation classes — mounted toggles from false→true on each step change
  const slideClass = mounted
    ? 'opacity-100 translate-x-0'
    : direction === 'forward'
      ? 'opacity-0 translate-x-8'
      : 'opacity-0 -translate-x-8';

  return (
    <div ref={contentRef} className="max-w-2xl">
      {/* ── Progress Indicator ──────────────────────────────── */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              data-testid={`step-indicator-${i + 1}`}
              onClick={() => goToStep(i)}
              disabled={i >= currentStep}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                i === currentStep
                  ? 'bg-mvf-purple text-white shadow-lg shadow-mvf-purple/30 scale-110 active'
                  : i < currentStep
                  ? 'bg-mvf-light-blue text-white cursor-pointer hover:scale-105'
                  : 'border-2 border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                i < currentStep ? 'bg-mvf-light-blue' : 'bg-muted-foreground/20'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step Header ─────────────────────────────────────── */}
      <div className={`mb-8 transition-all duration-300 ${slideClass}`}>
        <div className="flex items-center gap-3 mb-1">
          {(() => {
            const Icon = STEPS[currentStep].icon;
            return <Icon className="h-6 w-6 text-mvf-purple" />;
          })()}
          <h2 className="text-xl font-bold">{STEPS[currentStep].title}</h2>
        </div>
        <p className="text-muted-foreground ml-9">{STEPS[currentStep].subtitle}</p>
      </div>

      {/* ── Step Content ────────────────────────────────────── */}
      <div className="overflow-hidden">
        <form
          onSubmit={(e) => { e.preventDefault(); isLastStep ? handleSubmit() : goNext(); }}
          className={`transition-all duration-300 ease-in-out ${slideClass}`}
        >
          {/* Step 1: Identity */}
          {currentStep === 0 && (
            <div className="space-y-6">
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
                  autoFocus
                  className="w-full rounded border bg-background px-4 py-3 text-sm transition-shadow focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple outline-none"
                />
                {errors.name && <p className="text-sm text-red-500 flex items-center gap-1 mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="problem-statement" className="block text-sm font-medium">
                  Problem Statement
                </label>
                <textarea
                  id="problem-statement"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="What problem are you trying to solve?"
                  rows={4}
                  className="w-full rounded border bg-background px-4 py-3 text-sm transition-shadow focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple outline-none resize-none"
                />
                {errors.problem_statement && (
                  <p className="text-sm text-red-500 mt-1">{errors.problem_statement}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Context */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Layer</legend>
                <div className="grid gap-3">
                  {LAYER_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLayer(opt.value)}
                        className={`flex items-start gap-4 rounded border p-4 text-left transition-all duration-200 ${
                          layer === opt.value
                            ? 'border-mvf-purple bg-mvf-purple/10 ring-2 ring-mvf-purple/20'
                            : 'border-input bg-background hover:border-mvf-purple/40 hover:bg-mvf-purple/5'
                        }`}
                      >
                        <div className={`mt-0.5 rounded p-2 ${
                          layer === opt.value ? 'bg-mvf-purple text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{opt.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.layer && <p className="text-sm text-red-500">{errors.layer}</p>}
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Target Users</legend>
                <div className="flex gap-2">
                  {TARGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTargetUsers(opt.value)}
                      className={`flex-1 rounded border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        targetUsers === opt.value
                          ? 'border-mvf-purple bg-mvf-purple text-white'
                          : 'border-input bg-background hover:border-mvf-purple/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {errors.target_users && <p className="text-sm text-red-500">{errors.target_users}</p>}
              </fieldset>

              <div className="space-y-1">
                <label htmlFor="potential-roi" className="block text-sm font-medium">
                  Potential ROI <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  id="potential-roi"
                  type="text"
                  value={potentialRoi}
                  onChange={(e) => setPotentialRoi(e.target.value)}
                  placeholder="e.g., saves 2h/week for 5 people"
                  className="w-full rounded border bg-background px-4 py-3 text-sm transition-shadow focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Data & Security */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <TristateField
                icon={Database}
                label="Needs Business Data?"
                value={needsBusinessData}
                onChange={setNeedsBusinessData}
              />

              <TristateField
                icon={Scale}
                label="Handles PII?"
                value={handlesPii}
                onChange={setHandlesPii}
                alert={handlesPii === 'yes' ? 'Legal will be notified automatically when this app is registered.' : undefined}
              />

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-mvf-purple" />
                  Uses API Keys or External Services?
                </legend>
                <div className="flex gap-2">
                  {TRISTATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUsesApiKeys(opt.value)}
                      className={`flex-1 rounded border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        usesApiKeys === opt.value
                          ? 'border-mvf-purple bg-mvf-purple text-white'
                          : 'border-input bg-background hover:border-mvf-purple/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {usesApiKeys === 'yes' && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="api-services" className="block text-sm font-medium">
                      Which services?
                    </label>
                    <input
                      id="api-services"
                      type="text"
                      value={apiKeyServices}
                      onChange={(e) => setApiKeyServices(e.target.value)}
                      placeholder="e.g., OpenAI, Stripe, Replicate"
                      autoFocus
                      className="w-full rounded border bg-background px-4 py-3 text-sm transition-shadow focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple outline-none"
                    />
                    {errors.api_key_services && (
                      <p className="text-sm text-red-500">{errors.api_key_services}</p>
                    )}
                  </div>
                )}
              </fieldset>
            </div>
          )}

          {/* Step 4: Final Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium flex items-center gap-2">
                  <Replace className="h-4 w-4 text-mvf-purple" />
                  Replaces a Third-Party Tool?
                </legend>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReplacesThirdParty(true)}
                    className={`flex-1 rounded border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      replacesThirdParty
                        ? 'border-mvf-purple bg-mvf-purple text-white'
                        : 'border-input bg-background hover:border-mvf-purple/40'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplacesThirdParty(false)}
                    className={`flex-1 rounded border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      !replacesThirdParty
                        ? 'border-mvf-purple bg-mvf-purple text-white'
                        : 'border-input bg-background hover:border-mvf-purple/40'
                    }`}
                  >
                    No
                  </button>
                </div>
                {replacesThirdParty && (
                  <div className="space-y-4">
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
                        autoFocus
                        className="w-full rounded border bg-background px-4 py-3 text-sm transition-shadow focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple outline-none"
                      />
                      {errors.replaced_tool_name && (
                        <p className="text-sm text-red-500">{errors.replaced_tool_name}</p>
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
                        className="w-full rounded border bg-background px-4 py-3 text-sm transition-shadow focus:ring-2 focus:ring-mvf-purple/30 focus:border-mvf-purple outline-none"
                      />
                    </div>
                  </div>
                )}
              </fieldset>

              {/* Review Summary */}
              <div className="rounded border bg-card/50 p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-mvf-light-blue" />
                  Review your answers
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <SummaryItem label="App Name" value={name} onEdit={() => goToStep(0)} />
                  <SummaryItem label="Layer" value={
                    LAYER_OPTIONS.find(o => o.value === layer)?.label || '—'
                  } onEdit={() => goToStep(1)} />
                  <SummaryItem label="Target Users" value={
                    TARGET_OPTIONS.find(o => o.value === targetUsers)?.label || '—'
                  } onEdit={() => goToStep(1)} />
                  <SummaryItem label="Business Data" value={needsBusinessData} onEdit={() => goToStep(2)} />
                  <SummaryItem label="PII" value={handlesPii} onEdit={() => goToStep(2)} />
                  <SummaryItem label="API Keys" value={usesApiKeys} onEdit={() => goToStep(2)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {isLastStep ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded bg-mvf-pink px-6 py-2.5 text-sm font-semibold text-white hover:bg-mvf-pink/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md shadow-mvf-pink/25 border border-mvf-pink/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Register App
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 rounded bg-mvf-pink px-6 py-2.5 text-sm font-semibold text-white hover:bg-mvf-pink/85 active:scale-[0.98] transition-all duration-150 shadow-md shadow-mvf-pink/25 border border-mvf-pink/20"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function TristateField({
  icon: Icon,
  label,
  value,
  onChange,
  alert,
}: {
  icon: typeof Database;
  label: string;
  value: Tristate;
  onChange: (v: Tristate) => void;
  alert?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium flex items-center gap-2">
        <Icon className="h-4 w-4 text-mvf-purple" />
        {label}
      </legend>
      <div className="flex gap-2">
        {TRISTATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              value === opt.value
                ? 'border-mvf-purple bg-mvf-purple text-white'
                : 'border-input bg-background hover:border-mvf-purple/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {alert && (
        <p className="text-sm text-amber-600 bg-amber-50 rounded px-3 py-2 flex items-center gap-2">
          <Scale className="h-4 w-4 shrink-0" />
          {alert}
        </p>
      )}
    </fieldset>
  );
}

function SummaryItem({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="font-medium capitalize">{value || '—'}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs text-mvf-purple hover:underline"
      >
        Edit
      </button>
    </div>
  );
}
