'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Database, KeyRound, Scale, Replace, UserPlus, X, Pencil, Link2, ExternalLink, Camera, Fingerprint, MessageSquare, Tag, ShieldCheck, Users } from 'lucide-react';
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

type EditingSection = 'identity' | 'purpose' | 'context' | 'security' | 'thirdparty' | null;

interface AppProfileClientProps {
  app: App;
  owners: (AppOwner & { profiles: Profile })[];
  flags: RiskFlag[];
  isAdmin: boolean;
  isOwner: boolean;
  isCreator: boolean;
}

export function AppProfileClient({
  app,
  owners: initialOwners,
  flags,
  isAdmin,
  isOwner,
  isCreator,
}: AppProfileClientProps) {
  const router = useRouter();
  const iconInputRef = useRef<HTMLInputElement>(null);
  const canEdit = isOwner || isAdmin;
  const canManageOwners = isCreator || isAdmin;
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // ── Icon state ─────────────────────────────────────────────
  // savedIconUrl: what's persisted in DB (used to revert on Cancel)
  // pendingIconFile: file selected but not yet uploaded (deferred until Save)
  // previewIconUrl: blob URL for in-editor preview of pending file
  const [savedIconUrl, setSavedIconUrl] = useState<string | null>(app.icon_url ?? null);
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);
  const [previewIconUrl, setPreviewIconUrl] = useState<string | null>(null);
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);

  // ── URL inline-edit state ──────────────────────────────────
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState(app.app_url || '');
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [urlSaveError, setUrlSaveError] = useState<string | null>(null);
  // Tracks the last successfully saved URL so Cancel reverts to it, not the stale prop
  const savedUrlRef = useRef(app.app_url || '');

  // ── Owner management state ─────────────────────────────────
  const [owners, setOwners] = useState(initialOwners);
  const [isEditingOwners, setIsEditingOwners] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerAddError, setOwnerAddError] = useState<string | null>(null);
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [removingOwnerId, setRemovingOwnerId] = useState<string | null>(null);

  // ── Form state (initialized from app data) ────────────────
  const [name, setName] = useState(app.name);
  const [problemStatement, setProblemStatement] = useState(app.problem_statement);
  const [appUrl, setAppUrl] = useState(app.app_url || '');
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

  function handleIconSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconUploadError(null);
    // Revoke previous blob URL to avoid memory leaks
    if (previewIconUrl) URL.revokeObjectURL(previewIconUrl);
    setPendingIconFile(file);
    setPreviewIconUrl(URL.createObjectURL(file));
    if (iconInputRef.current) iconInputRef.current.value = '';
  }

  async function handleAddOwner() {
    if (!ownerEmail.trim()) return;
    setIsAddingOwner(true);
    setOwnerAddError(null);
    try {
      const res = await fetch(`/api/apps/${app.id}/owners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOwnerAddError(data.error || 'Failed to add owner');
        return;
      }
      // Optimistic: fetch fresh owners list to get full profile join
      const refreshed = await fetch(`/api/apps/${app.id}`);
      if (refreshed.ok) {
        const appData = await refreshed.json();
        setOwners(appData.app_owners ?? []);
      }
      setOwnerEmail('');
    } catch {
      setOwnerAddError('Network error. Please try again.');
    } finally {
      setIsAddingOwner(false);
    }
  }

  async function handleRemoveOwner(ownerRowId: string) {
    setRemovingOwnerId(ownerRowId);
    try {
      const res = await fetch(`/api/apps/${app.id}/owners`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: ownerRowId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setOwnerAddError(data.error || 'Failed to remove owner');
        return;
      }
      setOwners((prev) => prev.filter((o) => o.id !== ownerRowId));
    } catch {
      setOwnerAddError('Network error. Please try again.');
    } finally {
      setRemovingOwnerId(null);
    }
  }

  function resetSection(section: EditingSection) {
    setErrors({});
    setSaveError(null);
    if (section === 'purpose') {
      setProblemStatement(app.problem_statement);
    } else if (section === 'identity') {
      setName(app.name);
      setAppUrl(app.app_url || '');
      // Revert any pending icon selection
      if (previewIconUrl) URL.revokeObjectURL(previewIconUrl);
      setPendingIconFile(null);
      setPreviewIconUrl(null);
      setIconUploadError(null);
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
      case 'purpose':
        return { problem_statement: problemStatement };
      case 'identity':
        return { name, app_url: appUrl || null };
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

    if (section === 'purpose') {
      if (!problemStatement || problemStatement.length < 10) sectionErrors.problem_statement = 'Problem statement must be at least 10 characters';
    } else if (section === 'identity') {
      if (!name || name.length < 2) sectionErrors.name = 'App name must be at least 2 characters';
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
      // Upload pending icon first (Identity section only)
      if (editingSection === 'identity' && pendingIconFile) {
        const form = new FormData();
        form.append('file', pendingIconFile);
        const iconRes = await fetch(`/api/apps/${app.id}/icon`, { method: 'POST', body: form });
        const iconData = await iconRes.json();
        if (!iconRes.ok) {
          setSaveError(iconData.error || 'Icon upload failed');
          return;
        }
        // Revoke blob URL and commit the saved URL
        if (previewIconUrl) URL.revokeObjectURL(previewIconUrl);
        setSavedIconUrl(iconData.icon_url);
        setPendingIconFile(null);
        setPreviewIconUrl(null);
      }

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

      // Keep urlDraft and savedUrlRef in sync if Identity section updated appUrl
      if (editingSection === 'identity') {
        savedUrlRef.current = appUrl;
        setUrlDraft(appUrl);
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

  async function handleUrlSave() {
    const trimmed = urlDraft.trim();
    setIsSavingUrl(true);
    setUrlSaveError(null);
    try {
      const res = await fetch(`/api/apps/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_url: trimmed || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setUrlSaveError(data.error || 'Failed to save URL');
        return;
      }
      savedUrlRef.current = trimmed;
      setAppUrl(trimmed);
      setIsEditingUrl(false);
      setUrlSaveError(null);
      router.refresh();
    } catch {
      setUrlSaveError('Network error. Please try again.');
    } finally {
      setIsSavingUrl(false);
    }
  }

  function handleUrlCancel() {
    setUrlDraft(savedUrlRef.current);
    setIsEditingUrl(false);
    setUrlSaveError(null);
  }

  // ── Input class helper ─────────────────────────────────────
  const inputClass = 'w-full rounded-[6px] border bg-background px-4 h-[44px] text-[14px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50';
  const textareaClass = 'w-full rounded-[6px] border bg-background px-4 py-3 text-[14px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50 resize-none';

  const placeholderBg: Record<string, string> = {
    red: 'bg-red-500/10 text-red-600',
    amber: 'bg-amber-500/10 text-amber-600',
    green: 'bg-emerald-500/10 text-emerald-600',
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header — name/tier/status read-only; URL has inline edit */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">{app.name}</h1>
            <TierBadge tier={app.tier} />
          </div>
        </div>
        <span className="rounded-[5px] bg-muted px-1.5 py-0.5 text-[11px] font-medium shrink-0">
          {STATUS_LABELS[app.status]}
        </span>
      </div>

      {/* ── App URL card ────────────────────────────────────── */}
      <section className="rounded-lg border bg-card p-5 card-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-[15px] w-[15px] shrink-0" style={{ color: 'var(--mvf-pink)' }} />
            <h3 className="text-[15px] font-semibold tracking-tight">App URL</h3>
          </div>
          {canEdit && !isEditingUrl && editingSection === null && (
            <button
              type="button"
              onClick={() => { setUrlDraft(app.app_url || ''); setIsEditingUrl(true); }}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>
        {isEditingUrl ? (
          <div className="space-y-3">
            <input
              type="text"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUrlSave();
                if (e.key === 'Escape') handleUrlCancel();
              }}
              placeholder="https://..."
              autoFocus
              className={inputClass}
            />
            {urlSaveError && <p className="text-[12px] text-red-500">{urlSaveError}</p>}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleUrlCancel}
                disabled={isSavingUrl}
                className="rounded px-4 py-2 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUrlSave}
                disabled={isSavingUrl}
                className="flex items-center gap-2 rounded-[6px] bg-mvf-pink px-4 py-2 text-[14px] font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {isSavingUrl ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          app.app_url ? (
            <a
              href={/^https?:\/\/.+/.test(app.app_url) ? app.app_url : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-mvf-purple hover:underline"
            >
              <span className="truncate max-w-[480px]">{app.app_url}</span>
              <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
            </a>
          ) : (
            <p className="text-[13px] text-muted-foreground/60 italic">
              {canEdit ? 'No URL yet — add one' : 'No URL set'}
            </p>
          )
        )}
      </section>

      {/* Save error banner */}
      {saveError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {saveError}
        </div>
      )}

      {/* ── Section 1: Identity ────────────────────────────── */}
      <EditableSection
        title="Identity"
        description="The app's name, icon, and where to access it."
        icon={Fingerprint}
        iconColor="#FF00A5"
        canEdit={canEdit}
        isEditing={editingSection === 'identity'}
        onEditStart={() => { handleUrlCancel(); setEditingSection('identity'); }}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        readContent={
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-3">
              {savedIconUrl ? (
                <img src={savedIconUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[18px] font-semibold ${placeholderBg[app.tier]}`}>
                  {app.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">App Name</dt>
                <dd className="text-[13px]">{app.name}</dd>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Icon — deferred until Save */}
          <div className="space-y-1">
            <p className="text-[13px] font-medium">App Icon</p>
            <div className="flex items-center gap-3">
              {/* Show blob preview if file is staged, otherwise the saved icon, otherwise placeholder */}
              {previewIconUrl ? (
                <img src={previewIconUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              ) : savedIconUrl ? (
                <img src={savedIconUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-[20px] font-semibold ${placeholderBg[app.tier]}`}>
                  {name.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-[6px] border border-input bg-background px-3 h-[36px] text-[13px] font-medium hover:border-mvf-purple/40 transition-colors duration-150"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {(savedIconUrl || previewIconUrl) ? 'Change icon' : 'Upload icon'}
                </button>
                <p className="text-[11px] text-muted-foreground">
                  SVG, PNG or JPG · max 2MB
                  {pendingIconFile && <span className="text-mvf-purple ml-1">· will upload on Save</span>}
                </p>
                {iconUploadError && <p className="text-[12px] text-red-500">{iconUploadError}</p>}
              </div>
              <input
                ref={iconInputRef}
                type="file"
                accept=".svg,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleIconSelect}
              />
            </div>
          </div>

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
            <label htmlFor="edit-app-url" className="block text-[13px] font-medium">
              Where can people access it? <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="edit-app-url"
              type="text"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            {errors.app_url && <p className="text-[13px] text-red-500">{errors.app_url}</p>}
          </div>
          {name !== app.name && name.length >= 2 && (
            <SimilarToolsCheck query={name} />
          )}
        </div>
      </EditableSection>

      {/* ── Section 2: Problem Statement ───────────────────── */}
      <EditableSection
        title="Problem Statement"
        description="What problem does this app solve, and for whom?"
        icon={MessageSquare}
        iconColor="#FF5A41"
        canEdit={canEdit}
        isEditing={editingSection === 'purpose'}
        onEditStart={() => { handleUrlCancel(); setEditingSection('purpose'); }}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        readContent={
          <p className="text-[13px] leading-[1.7] text-muted-foreground">
            {app.problem_statement}
          </p>
        }
      >
        <div className="space-y-1">
          <label htmlFor="edit-problem" className="block text-[13px] font-medium">Problem Statement</label>
          <textarea
            id="edit-problem"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            rows={5}
            className={textareaClass}
          />
          {errors.problem_statement && <p className="text-[13px] text-red-500">{errors.problem_statement}</p>}
        </div>
      </EditableSection>

      {/* ── Section 3: Context ─────────────────────────────── */}
      <EditableSection
        title="Context"
        description="How the app is categorised, who uses it, and its expected value."
        icon={Tag}
        iconColor="#FADC28"
        canEdit={canEdit}
        isEditing={editingSection === 'context'}
        onEditStart={() => { handleUrlCancel(); setEditingSection('context'); }}
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

      {/* ── Section 4: Data & Security ─────────────────────── */}
      <EditableSection
        title="Data & Security"
        description="Whether the app handles sensitive data or connects to external services."
        icon={ShieldCheck}
        iconColor="#10b981"
        canEdit={canEdit}
        isEditing={editingSection === 'security'}
        onEditStart={() => { handleUrlCancel(); setEditingSection('security'); }}
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

      {/* ── Section 5: Third-Party Replacement ─────────────── */}
      <EditableSection
        title="Third-Party Replacement"
        description="Whether this app replaces an existing paid tool, and the cost it saves."
        icon={Replace}
        iconColor="#8264C8"
        canEdit={canEdit}
        isEditing={editingSection === 'thirdparty'}
        onEditStart={() => { handleUrlCancel(); setEditingSection('thirdparty'); }}
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

      {/* ── Owners ─────────────────────────────────────────── */}
      <section className="rounded-lg border bg-card p-5 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-[15px] w-[15px] shrink-0" style={{ color: 'var(--mvf-pink)' }} />
            <h3 className="text-[15px] font-semibold tracking-tight">Owners</h3>
          </div>
          {canManageOwners && !isEditingOwners && (
            <button
              onClick={() => { setIsEditingOwners(true); setOwnerAddError(null); }}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            >
              <Pencil className="h-3.5 w-3.5" />
              Manage
            </button>
          )}
          {isEditingOwners && (
            <button
              onClick={() => { setIsEditingOwners(false); setOwnerEmail(''); setOwnerAddError(null); }}
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Done
            </button>
          )}
        </div>

        {owners.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No owners assigned</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {owners.map((owner) => (
              <li key={owner.id} className="flex items-center gap-3">
                {owner.profiles.avatar_url && (
                  <img src={owner.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                )}
                <span className="text-[13px] flex-1">{owner.profiles.full_name || owner.profiles.email}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {owner.owner_role}
                </span>
                {isEditingOwners && owner.owner_role === 'backup' && (
                  <button
                    onClick={() => handleRemoveOwner(owner.id)}
                    disabled={removingOwnerId === owner.id}
                    aria-label={`Remove ${owner.profiles.full_name || owner.profiles.email}`}
                    className="ml-1 rounded p-0.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors duration-150 disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {isEditingOwners && (
          <div className="border-t pt-4 space-y-2">
            <p className="text-[12px] text-muted-foreground font-medium">Add backup owner</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => { setOwnerEmail(e.target.value); setOwnerAddError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddOwner(); }}
                placeholder="colleague@example.com"
                className="flex-1 rounded-[6px] border bg-background px-3 h-[36px] text-[13px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleAddOwner}
                disabled={isAddingOwner || !ownerEmail.trim()}
                className="flex items-center gap-1.5 rounded-[6px] bg-mvf-pink px-3 h-[36px] text-[13px] font-medium text-white hover:opacity-90 transition-opacity duration-150 disabled:opacity-40"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {isAddingOwner ? 'Adding…' : 'Add'}
              </button>
            </div>
            {ownerAddError && (
              <p className="text-[12px] text-red-500">{ownerAddError}</p>
            )}
            <p className="text-[11px] text-muted-foreground/70">
              The person must have signed in to Launchpad at least once.
            </p>
          </div>
        )}
      </section>

      {/* Risk Flags */}
      <RiskFlagsList flags={flags} isAdmin={isAdmin} isOwner={isOwner} appId={app.id} />

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
