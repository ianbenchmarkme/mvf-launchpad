'use client';

import { useState } from 'react';
import { Bug, Lightbulb, MessageSquare, HelpCircle, ChevronDown } from 'lucide-react';
import type { SupportRequestWithDetails, SupportRequestStatus, SupportRequestType, SupportRequestPriority } from '@/lib/supabase/types';

interface SupportAdminClientProps {
  requests: SupportRequestWithDetails[];
}

const TYPE_CONFIG: Record<SupportRequestType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  bug_report: { label: 'Bug Report', icon: Bug, color: '#ef4444' },
  feature_request: { label: 'Feature Request', icon: Lightbulb, color: 'var(--mvf-purple)' },
  feedback: { label: 'Feedback', icon: MessageSquare, color: 'var(--mvf-light-blue)' },
  question: { label: 'Question', icon: HelpCircle, color: 'var(--mvf-orange)' },
};

const STATUS_CONFIG: Record<SupportRequestStatus, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'var(--muted-foreground)', bg: 'var(--muted)' },
  in_progress: { label: 'In Progress', color: 'var(--mvf-yellow)', bg: 'color-mix(in srgb, var(--mvf-yellow) 12%, transparent)' },
  completed: { label: 'Completed', color: '#22c55e', bg: '#22c55e18' },
  wont_do: { label: "Won't Do", color: 'var(--mvf-orange)', bg: 'color-mix(in srgb, var(--mvf-orange) 12%, transparent)' },
};

const PRIORITY_CONFIG: Record<SupportRequestPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'var(--muted-foreground)' },
  medium: { label: 'Medium', color: 'var(--mvf-yellow)' },
  high: { label: 'High', color: '#ef4444' },
};

const STATUS_OPTIONS: SupportRequestStatus[] = ['open', 'in_progress', 'completed', 'wont_do'];
const TYPE_OPTIONS: SupportRequestType[] = ['bug_report', 'feature_request', 'feedback', 'question'];
const PRIORITY_OPTIONS: SupportRequestPriority[] = ['low', 'medium', 'high'];

interface ResolutionModal {
  requestId: string;
  status: 'completed' | 'wont_do';
}

export function SupportAdminClient({ requests: initialRequests }: SupportAdminClientProps) {
  const [requests, setRequests] = useState<SupportRequestWithDetails[]>(initialRequests);
  const [filterStatus, setFilterStatus] = useState<SupportRequestStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<SupportRequestType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<SupportRequestPriority | 'all'>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [modal, setModal] = useState<ResolutionModal | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType !== 'all' && r.request_type !== filterType) return false;
    if (filterPriority !== 'all' && r.priority !== filterPriority) return false;
    return true;
  });

  async function updateStatus(requestId: string, status: SupportRequestStatus, note?: string) {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { status };
      if (note) body.resolution_note = note;

      const res = await fetch(`/api/support/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) return;

      const updated = await res.json() as SupportRequestWithDetails;
      setRequests((prev) =>
        prev.map((r) => r.id === requestId ? { ...r, ...updated } : r)
      );
    } finally {
      setSaving(false);
    }
  }

  function handleStatusSelect(requestId: string, status: SupportRequestStatus) {
    setOpenDropdown(null);
    if (status === 'completed' || status === 'wont_do') {
      setModal({ requestId, status });
      setResolutionNote('');
      setNoteError('');
    } else {
      void updateStatus(requestId, status);
    }
  }

  async function handleModalSave() {
    if (!modal) return;
    if (!resolutionNote.trim() || resolutionNote.trim().length < 10) {
      setNoteError('Resolution note must be at least 10 characters');
      return;
    }
    await updateStatus(modal.requestId, modal.status, resolutionNote.trim());
    setModal(null);
    setResolutionNote('');
    setNoteError('');
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-5">
      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          <FilterChip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} testId="filter-status-all">All</FilterChip>
          {STATUS_OPTIONS.map((s) => (
            <FilterChip key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)} testId={`filter-status-${s}`}>
              {STATUS_CONFIG[s].label}
            </FilterChip>
          ))}
        </div>

        <div className="w-px bg-border self-stretch" />

        {/* Type filter */}
        <div className="flex gap-1 flex-wrap">
          {TYPE_OPTIONS.map((t) => (
            <FilterChip key={t} active={filterType === t} onClick={() => setFilterType(filterType === t ? 'all' : t)} testId={`filter-type-${t}`}>
              {TYPE_CONFIG[t].label}
            </FilterChip>
          ))}
        </div>

        <div className="w-px bg-border self-stretch" />

        {/* Priority filter */}
        <div className="flex gap-1 flex-wrap">
          {PRIORITY_OPTIONS.map((p) => (
            <FilterChip key={p} active={filterPriority === p} onClick={() => setFilterPriority(filterPriority === p ? 'all' : p)} testId={`filter-priority-${p}`}>
              {PRIORITY_CONFIG[p].label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* ── Request Count ── */}
      <p className="text-[12px] text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'request' : 'requests'}
        {filterStatus !== 'all' || filterType !== 'all' || filterPriority !== 'all' ? ' (filtered)' : ''}
      </p>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="rounded-[8px] border border-border bg-card p-12 text-center">
          <p className="text-[14px] text-muted-foreground">No support requests match your filters.</p>
        </div>
      ) : (
        <div className="rounded-[8px] border border-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">Submitter</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden lg:table-cell">App</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden sm:table-cell">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const typeConf = TYPE_CONFIG[req.request_type];
                const statusConf = STATUS_CONFIG[req.status];
                const priorityConf = PRIORITY_CONFIG[req.priority];
                const TypeIcon = typeConf.icon;
                const isDropdownOpen = openDropdown === req.id;

                return (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    {/* Type */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          color: typeConf.color,
                          backgroundColor: `color-mix(in srgb, ${typeConf.color} 12%, transparent)`,
                        }}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {typeConf.label}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground leading-snug">{req.subject}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{req.description}</p>
                      </div>
                    </td>

                    {/* Submitter */}
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {req.profiles?.full_name ?? req.submitted_email}
                    </td>

                    {/* App */}
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {req.apps?.name ?? <span className="text-muted-foreground/40">—</span>}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[12px] font-medium" style={{ color: priorityConf.color }}>
                        {priorityConf.label}
                      </span>
                    </td>

                    {/* Status dropdown */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(isDropdownOpen ? null : req.id)}
                          data-testid={`status-btn-${req.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-colors hover:opacity-80"
                          style={{
                            color: statusConf.color,
                            backgroundColor: statusConf.bg,
                            borderColor: `color-mix(in srgb, ${statusConf.color} 40%, transparent)`,
                          }}
                          aria-label={statusConf.label}
                        >
                          {statusConf.label}
                          <ChevronDown className="h-3 w-3" />
                        </button>

                        {isDropdownOpen && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            {/* Dropdown */}
                            <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-[6px] shadow-lg overflow-hidden min-w-[140px]">
                              {STATUS_OPTIONS.map((s) => (
                                <button
                                  key={s}
                                  role="option"
                                  aria-selected={req.status === s}
                                  type="button"
                                  onClick={() => handleStatusSelect(req.id, s)}
                                  className={`w-full text-left px-3 py-2 text-[12px] hover:bg-muted transition-colors ${
                                    req.status === s ? 'font-semibold' : ''
                                  }`}
                                  style={{ color: STATUS_CONFIG[s].color }}
                                >
                                  {STATUS_CONFIG[s].label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Resolution Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="bg-card rounded-[8px] border border-border shadow-2xl w-full max-w-md p-6"
          >
            <h3 id="modal-title" className="text-[15px] font-semibold text-foreground mb-1">
              {modal.status === 'completed' ? 'Mark as Completed' : "Mark as Won't Do"}
            </h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              {modal.status === 'completed'
                ? 'Describe what was done to resolve this request.'
                : 'Explain why this request will not be addressed.'}
              {' '}This note will be sent to the submitter if they requested a reply.
            </p>

            <div className="space-y-1 mb-5">
              <label htmlFor="resolution-note" className="block text-[13px] font-medium">
                Resolution Note
              </label>
              <textarea
                id="resolution-note"
                value={resolutionNote}
                onChange={(e) => { setResolutionNote(e.target.value); setNoteError(''); }}
                placeholder="Describe the resolution..."
                rows={4}
                className="w-full rounded-[6px] border bg-background px-4 py-3 text-[14px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50 resize-none"
              />
              {noteError && <p className="text-[12px] text-red-500">{noteError}</p>}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setModal(null); setResolutionNote(''); setNoteError(''); }}
                className="rounded-[6px] border border-input bg-background px-4 h-9 text-[13px] font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleModalSave()}
                disabled={saving}
                className="rounded-[6px] px-4 h-9 text-[13px] font-semibold text-white disabled:opacity-60 transition-colors"
                style={{ backgroundColor: 'var(--mvf-pink)' }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children, testId }: { active: boolean; onClick: () => void; children: React.ReactNode; testId?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`rounded-full px-3 h-7 text-[11px] font-medium transition-colors duration-150 ${
        active
          ? 'bg-mvf-purple text-white'
          : 'border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}
