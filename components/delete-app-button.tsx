'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, X, Check } from 'lucide-react';

interface DeleteAppButtonProps {
  appId: string;
  appName: string;
  isAdmin: boolean;
}

export function DeleteAppButton({ appId, appName, isAdmin }: DeleteAppButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [activeUsers, setActiveUsers] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function reset() {
    setShowModal(false);
    setReason('');
    setActiveUsers('');
    setConfirmed(false);
    setSuccess(false);
  }

  async function handleAdminDelete() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/apps/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestDeletion() {
    setSubmitting(true);
    try {
      // Create a manual risk flag with the deletion request details
      const res = await fetch(`/api/apps/${appId}/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_type: 'manual',
          severity: 'warning',
          description: `Deletion requested. Reason: ${reason}. Active users: ${activeUsers}.`,
        }),
      });
      if (res.ok) {
        setSuccess(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmitRequest = reason.trim().length >= 5 && activeUsers.trim() !== '' && confirmed;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-[6px] border border-red-200 px-3 h-8 text-[13px] text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all duration-150"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isAdmin ? 'Delete App' : 'Request Deletion'}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[8px] bg-white dark:bg-[#161650] border border-mvf-dark-blue/10 dark:border-white/10 p-6 space-y-4">
            {success ? (
              /* Success state */
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-[6px] bg-emerald-100 p-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[13px] font-semibold">Deletion requested</h3>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Your request to delete &ldquo;{appName}&rdquo; has been submitted.
                      An admin will review it and follow the retirement process.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-[6px] bg-mvf-dark-blue px-4 h-8 text-[13px] font-medium text-white hover:bg-mvf-dark-blue/90 active:scale-[0.98] transition-all duration-150"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : isAdmin ? (
              /* Admin: confirm delete */
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-[6px] bg-red-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[13px] font-semibold">
                      Delete &ldquo;{appName}&rdquo;?
                    </h3>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      This will archive the app and remove it from the library.
                      This action can be reversed by an admin.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-[6px] border px-4 h-8 text-[13px] font-medium hover:bg-accent transition-all duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleAdminDelete}
                    className="rounded-[6px] bg-red-600 px-4 h-8 text-[13px] font-medium text-white hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 transition-all duration-150"
                  >
                    {submitting ? 'Deleting...' : 'Delete App'}
                  </button>
                </div>
              </>
            ) : (
              /* Non-admin: request deletion with reason + active users */
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-[6px] bg-amber-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[13px] font-semibold">
                      Request deletion of &ldquo;{appName}&rdquo;
                    </h3>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      An admin will review your request. Apps with active users
                      follow the retirement process with 30 days notice.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="delete-reason" className="text-[12px] font-medium">
                      Why should this app be deleted?
                    </label>
                    <textarea
                      id="delete-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., Replaced by a better tool, no longer needed, duplicate of another app..."
                      rows={3}
                      className="w-full rounded-[6px] border bg-background px-3 py-2 text-[13px] outline-none focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 transition-all duration-150 resize-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="active-users" className="text-[12px] font-medium">
                      How many active users does this app have?
                    </label>
                    <input
                      id="active-users"
                      type="text"
                      value={activeUsers}
                      onChange={(e) => setActiveUsers(e.target.value)}
                      placeholder="e.g., 0, 5, 25+"
                      className="w-full rounded-[6px] border bg-background px-3 h-8 text-[13px] outline-none focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 transition-all duration-150 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-muted-foreground/30"
                    />
                    <span className="text-[12px] text-muted-foreground">
                      I confirm the active user count above is accurate and I understand
                      that active users will be notified before the app is retired.
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-[6px] border px-4 h-8 text-[13px] font-medium hover:bg-accent transition-all duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!canSubmitRequest || submitting}
                    onClick={handleRequestDeletion}
                    className="rounded-[6px] bg-mvf-pink px-4 h-8 text-[13px] font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
