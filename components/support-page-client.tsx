'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupportForm } from '@/components/support-form';
import type { SupportRequestData } from '@/lib/validators';

interface SupportPageClientProps {
  userApps: { id: string; name: string }[];
}

export function SupportPageClient({ userApps }: SupportPageClientProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up redirect timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleSubmit(data: SupportRequestData) {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to submit request');
    }

    setSubmitted(true);
    timerRef.current = setTimeout(() => router.push('/'), 2500);
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-48px)]">
      <div className="w-full max-w-3xl space-y-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Support &amp; Feedback</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Report a bug, request a feature, or ask the team a question.
          </p>
        </div>
        <div className="rounded-[8px] border border-border bg-card p-10 card-shadow">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'color-mix(in srgb, var(--mvf-pink) 15%, transparent)' }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--mvf-pink)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-foreground">Request submitted</p>
              <p className="text-[13px] text-muted-foreground">
                Thanks — the support team will be in touch soon. Redirecting you home…
              </p>
            </div>
          ) : (
            <SupportForm userApps={userApps} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}
