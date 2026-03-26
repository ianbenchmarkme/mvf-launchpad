import { GoogleSignInButton } from '@/components/google-sign-in-button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Launchpad</h1>
          <p className="mt-2 text-muted-foreground">
            Ship tools fast. Keep them running.
          </p>
        </div>
        <GoogleSignInButton />
      </div>
    </div>
  );
}
