'use client';

import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/components/registration-form';
import type { RegistrationInput } from '@/lib/validators';

export default function RegisterPage() {
  const router = useRouter();

  async function handleSubmit(data: RegistrationInput) {
    const res = await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to register app');
    }

    const app = await res.json();
    router.push(`/apps/${app.id}`);
  }

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Register New App</h1>
          <p className="mt-1 text-muted-foreground">
            Tell us what you&apos;re building. This takes about 30 seconds.
          </p>
        </div>
        <RegistrationForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
