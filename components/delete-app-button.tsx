'use client';

import { useState } from 'react';
import { Trash2, Info, X } from 'lucide-react';

interface DeleteAppButtonProps {
  appId: string;
  appName: string;
}

export function DeleteAppButton({ appId: _appId, appName }: DeleteAppButtonProps) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowMessage(true)}
        className="flex items-center gap-2 rounded-[6px] border border-red-200 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all duration-150"
      >
        <Trash2 className="h-4 w-4" />
        Delete App
      </button>

      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[6px] bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-[6px] bg-amber-100 p-2">
                <Info className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">
                  Cannot delete &ldquo;{appName}&rdquo;
                </h3>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  This feature will require a process before going live. App deletion
                  will follow the dormancy attestation and retirement workflow defined
                  in the Launchpad governance framework.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMessage(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowMessage(false)}
                className="rounded-[6px] bg-mvf-dark-blue px-4 py-2 text-[13px] font-medium text-white hover:bg-mvf-dark-blue/90 active:scale-[0.98] transition-all duration-150"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
