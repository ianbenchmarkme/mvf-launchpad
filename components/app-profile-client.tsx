'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, KeyRound, Scale, Replace } from 'lucide-react';
import { TierBadge } from '@/components/tier-badge';
import { DeleteAppButton } from '@/components/delete-app-button';
import { AdminActions } from '@/components/admin-actions';
import { RiskFlagsList } from '@/components/risk-flags-list';
import { EditableSection } from '@/components/editable-section';
import { TristateField } from '@/components/fields/tristate-field';
import { SimilarToolsCheck } from '@/components/similar-tools-check';
import { LAYER_LABELS, STATUS_LABELS, TARGET_USERS_LABELS } from '@/lib/constants';
import {
  CATEGORY_OPTIONS, TARGET_OPTIONS, TRISTATE_OPTIONS,
  type AppCategory, type TargetUsers, type Tristate,
} from '@/lib/field-options';
import type { App, AppOwner, Profile, RiskFlag } from '@/lib/supabase/types';

type EditingSection = 'identity' | 'context' | 'security' | 'thirdparty' | null;

interface AppProfileClientProps {
  app: App;
  owners: (AppOwner & { profiles: Profile })[];
  flags: RiskFlag[];
  isAdmin: boolean;
  isOwner: boolean;
}

export function AppProfileClient({
  app,
  owners,
  flags,
  isAdmin,
  isOwner,
}: AppProfileClientProps) {
  const router = useRouter();
  const canEdit = isOwner || isAdmin;
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Form state (initialized from app data) ────────────────
  const [name, setName] = useState(app.name);
  const [problemStatement, setProblemStatement] = useState(app.problem_statement);
  const [category, setCategory] = useState<AppCategory | null>(app.category ?? null);
  const [targetUsers, setTargetUsers] = useState<TargetUsers>(app.target_users);
  const [potentialRoi, setPotentialRoi] = useState(app.potential_roi || '');
  const [needsBusinessData, setNeedsBusinessData] = useState<Tristate>(app.needs_business_data);
  const [handlesPii, setHandlesPii] = useState<Tristate>(app.handles_pii);
  const [usesApiKeys, setUsesApiKeys] = useState<Tristate>(app.uses_api_keys);
  const [apiKeyServices, setApiKeyServices] = useState(app.api_key_services || '');
  const [replacesThirdParty, setReplacesThirdParty] = useState(app.replaces_third_party);
  const [replacedToolName, setReplacedToolName] = useState(app.replaced_tool_name || '');
  const [replacedToolCost, setReplacedToolCost] = useState(app.replaced_tool_cost || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetSection(section: EditingSection) {
    setErrors({});
    setSaveError(null);
    if (section === 'identity') {
      setName(app.name);
      setProblemStatement(app.problem_statement);
    } else if (section === 'context') {
      setCategory(app.category ?? null);
      setTargetUsers(app.target_users);
      setPotentialRoi(app.potential_roi || '');
    } else if (section === 'security') {
      setNeedsBusinessData(app.needs_business_data);
      setHandlesPii(app.handles_pii);
      setUsesApiKeys(app.uses_api_keys);
      setApiKeyServices(app.api_key_services || '');
    } else if (section === 'thirdparty') {
      setReplacesThirdParty(app.replaces_third_party);
      setReplacedToolName(app.replaced_tool_name || '');
      setReplacedToolCost(app.replaced_tool_cost || '');
    }
  }

  function handleCancel() {
    resetSection(editingSection);
    setEditingSection(null);
  }

  function getSectionPayload(section: EditingSection): Record<string, unknown> {
    switch (section) {
      case 'identity':
        return { name, problem_statement: problemStatement };
      case 'context':
        return { category: category || null, target_users: targetUsers, potential_roi: potentialRoi || null };
      case 'security':
        return {
          needs_business_data: needsBusinessData,
          handles_pii: handlesPii,
          uses_api_keys: usesApiKeys,
          api_key_services: apiKeyServices,
        };
      case 'thirdparty':
        return {
          replaces_third_party: replacesThirdParty,
          replaced_tool_name: replacedToolName,
          replaced_tool_cost: replacedToolCost,
        };
      default:
        return {};
    }
  }

  function validateSection(section: EditingSection): boolean {
    const sectionErrors: Record<string, string> = {};

    if (section === 'identity') {
      if (!name || name.length < 2) sectionErrors.name = 'App name must be at least 2 characters';
      if (!problemStatement || problemStatement.length < 10) sectionErrors.problem_statement = 'Problem statement must be at least 10 characters';
    } else if (section === 'context') {
      if (!targetUsers) sectionErrors.target_users = 'Please select target users';
    } else if (section === 'security') {
      if (usesApiKeys === 'yes' && !apiKeyServices.trim()) {
        sectionErrors.api_key_services = 'Please specify which services use API keys';
      }
    } else if (section === 'thirdparty') {
      if (replacesThirdParty && !replacedToolName.trim()) {
        sectionErrors.replaced_tool_name = 'Please specify which tool this replaces';
      }
    }

    setErrors(sectionErrors);
    return Object.keys(sectionErrors).length === 0;
  }

  async function handleSave() {
    if (!editingSection) return;
    if (!validateSection(editingSection)) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = getSectionPayload(editingSection);
      const res = await fetch(`/api/apps/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || 'Failed to save changes');
        return;
      }

      setEditingSection(null);
      setErrors({});
      router.refresh();
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  // ── Input class helper ─────────────────────────────────────
  const inputClass = 'w-full rounded-[6px] border bg-background px-4 h-[44px] text-[14px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50';
  const textareaClass = 'w-full rounded-[6px] border bg-background px-4 py-3 text-[14px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50 resize-none';

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header — always read-only (name/status shown, tier via TierBadge) */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">{app.name}</h1>
            <TierBadge tier={app.tier} />
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">{app.problem_statement}</p>
        </div>
        <span className="rounded-[5px] bg-muted px-1.5 py-0.5 text-[11px] font-medium">
          {STATUS_LABELS[app.status]}
        </span>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {saveError}
        </div>
      )}

      {/* ── Section 1: Identity ────────────────────────────── */}
      <EditableSection
        title="Identity"
        canEdit={canEdit}
        isEditing={editingSection === 'identity'}
        onEditStart={() => setEditingSection('identity')}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        readContent={
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="App Name" value={app.name} />
            <DetailItem label="Problem Statement" value={app.problem_statement} span2 />
          </div>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="edit-name" className="block text-[13px] font-medium">App Name</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            {errors.name && <p className="text-[13px] text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-problem" className="block text-[13px] font-medium">Problem Statement</label>
            <textarea
              id="edit-problem"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={4}
              className={textareaClass}
            />
            {errors.problem_statement && <p className="text-[13px] text-red-500">{errors.problem_statement}</p>}
          </div>
          {name !== app.name && name.length >= 2 && (
            <SimilarToolsCheck query={name} />
          )}
        </div>
      </EditableSection>

      {/* ── Section 2: Context ─────────────────────────────── */}
      <EditableSection
        title="Context"
        canEdit={canEdit}
        isEditing={editingSection === 'context'}
        onEditStart={() => setEditingSection('context')}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        readContent={
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Layer" value={LAYER_LABELS[app.layer]} />
            <DetailItem label="Category" value={app.category || '—'} />
            <DetailItem label="Target Users" value={TARGET_USERS_LABELS[app.target_users]} />
            {app.potential_roi && <DetailItem label="Potential ROI" value={app.potential_roi} />}
          </div>
        }
      >
        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-[13px] font-medium">
              Category <span className="text-muted-foreground font-normal">(optional)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(category === opt.value ? null : opt.value)}
                  className={`rounded-[5px] px-3 py-1.5 text-[13px] font-medium border transition-all duration-150 ${
                    category === opt.value
                      ? 'border-mvf-purple bg-mvf-purple text-white'
                      : 'border-input bg-background text-foreground hover:border-mvf-purple/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-[13px] font-medium">Target Users</legend>
            <div className="flex gap-2">
              {TARGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetUsers(opt.value)}
                  className={`flex-1 rounded border px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                    targetUsers === opt.value
                      ? 'border-mvf-purple bg-mvf-purple text-white'
                      : 'border-input bg-background hover:border-mvf-purple/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.target_users && <p className="text-[13px] text-red-500">{errors.target_users}</p>}
          </fieldset>

          <div className="space-y-1">
            <label htmlFor="edit-roi" className="block text-[13px] font-medium">
              Potential ROI <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="edit-roi"
              type="text"
              value={potentialRoi}
              onChange={(e) => setPotentialRoi(e.target.value)}
              placeholder="e.g., saves 2h/week for 5 people"
              className={inputClass}
            />
          </div>
        </div>
      </EditableSection>

      {/* ── Section 3: Data & Security ─────────────────────── */}
      <EditableSection
        title="Data & Security"
        canEdit={canEdit}
        isEditing={editingSection === 'security'}
        onEditStart={() => setEditingSection('security')}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        readContent={
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Needs Business Data" value={app.needs_business_data} />
            <DetailItem label="Handles PII" value={app.handles_pii} />
            <DetailItem label="Uses API Keys" value={app.uses_api_keys} />
            {app.api_key_services && <DetailItem label="API Services" value={app.api_key_services} />}
          </div>
        }
      >
        <div className="space-y-4">
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
            alert={handlesPii === 'yes' ? 'Legal will be notified automatically.' : undefined}
          />
          <fieldset className="space-y-3">
            <legend className="text-[15px] font-medium flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-mvf-purple" />
              Uses API Keys or External Services?
            </legend>
            <div className="flex gap-2">
              {TRISTATE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUsesApiKeys(opt.value)}
                  className={`flex-1 rounded border px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
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
              <div className="space-y-1">
                <label htmlFor="edit-api-services" className="block text-[13px] font-medium">
                  Which services?
                </label>
                <input
                  id="edit-api-services"
                  type="text"
                  value={apiKeyServices}
                  onChange={(e) => setApiKeyServices(e.target.value)}
                  placeholder="e.g., OpenAI, Stripe, Replicate"
                  className={inputClass}
                />
                {errors.api_key_services && <p className="text-[13px] text-red-500">{errors.api_key_services}</p>}
              </div>
            )}
          </fieldset>
        </div>
      </EditableSection>

      {/* ── Section 4: Third-Party Replacement ─────────────── */}
      <EditableSection
        title="Third-Party Replacement"
        canEdit={canEdit}
        isEditing={editingSection === 'thirdparty'}
        onEditStart={() => setEditingSection('thirdparty')}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        readContent={
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Replaces Third-Party" value={app.replaces_third_party ? 'Yes' : 'No'} />
            {app.replaces_third_party && (
              <>
                <DetailItem label="Replaced Tool" value={app.replaced_tool_name || '—'} />
                {app.replaced_tool_cost && <DetailItem label="Estimated Saving" value={app.replaced_tool_cost} />}
              </>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="text-[13px] font-medium flex items-center gap-2">
              <Replace className="h-4 w-4 text-mvf-purple" />
              Replaces a Third-Party Tool?
            </legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReplacesThirdParty(true)}
                className={`flex-1 rounded border px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
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
                className={`flex-1 rounded border px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  !replacesThirdParty
                    ? 'border-mvf-purple bg-mvf-purple text-white'
                    : 'border-input bg-background hover:border-mvf-purple/40'
                }`}
              >
                No
              </button>
            </div>
            {replacesThirdParty && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="edit-replaced-tool" className="block text-[13px] font-medium">
                    Which tool does it replace?
                  </label>
                  <input
                    id="edit-replaced-tool"
                    type="text"
                    value={replacedToolName}
                    onChange={(e) => setReplacedToolName(e.target.value)}
                    placeholder="e.g., Canva Pro"
                    className={inputClass}
                  />
                  {errors.replaced_tool_name && <p className="text-[13px] text-red-500">{errors.replaced_tool_name}</p>}
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-replaced-cost" className="block text-[13px] font-medium">
                    Approximate annual cost
                  </label>
                  <input
                    id="edit-replaced-cost"
                    type="text"
                    value={replacedToolCost}
                    onChange={(e) => setReplacedToolCost(e.target.value)}
                    placeholder="e.g., £2,000/year"
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </fieldset>
        </div>
      </EditableSection>

      {/* ── Owners (read-only) ─────────────────────────────── */}
      <section className="rounded-lg border bg-card p-5 card-shadow">
        <h3 className="text-[15px] font-semibold tracking-tight mb-4">Owners</h3>
        {owners.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No owners assigned</p>
        ) : (
          <ul className="space-y-2">
            {owners.map((owner) => (
              <li key={owner.id} className="flex items-center gap-3">
                {owner.profiles.avatar_url && (
                  <img src={owner.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                )}
                <span className="text-[13px]">{owner.profiles.full_name || owner.profiles.email}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {owner.owner_role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Risk Flags */}
      <RiskFlagsList flags={flags} isAdmin={isAdmin} />

      {/* Admin Controls */}
      {isAdmin && (
        <div className="border-t pt-6">
          <h2 className="text-[12px] font-medium text-muted-foreground mb-3">Admin Controls</h2>
          <AdminActions appId={app.id} currentTier={app.tier} />
        </div>
      )}

      {/* Danger Zone */}
      <div className="border-t pt-6">
        <h2 className="text-[12px] font-medium text-muted-foreground mb-3">Danger Zone</h2>
        <DeleteAppButton appId={app.id} appName={app.name} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function DetailItem({ label, value, span2 }: { label: string; value: string; span2?: boolean }) {
  return (
    <div className={`space-y-0.5 ${span2 ? 'sm:col-span-2' : ''}`}>
      <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-[13px] capitalize">{value}</dd>
    </div>
  );
}
