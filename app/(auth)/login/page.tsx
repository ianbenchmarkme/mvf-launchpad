import Image from 'next/image';
import { GoogleSignInButton } from '@/components/google-sign-in-button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-xs space-y-6 text-center flex flex-col items-center">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Image src="/mvf-logo-navy.svg" alt="MVF" width={72} height={24} className="dark:hidden" />
            <Image src="/mvf-logo-white.svg" alt="MVF" width={72} height={24} className="hidden dark:block" />
            <span className="text-lg font-semibold tracking-tight">Launchpad</span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Ship tools fast. Keep them running.
          </p>
        </div>
        <GoogleSignInButton />
      </div>
    </div>
  );
}
