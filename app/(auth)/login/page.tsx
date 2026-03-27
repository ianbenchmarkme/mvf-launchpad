import Image from 'next/image';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { TierBlocks } from './tier-blocks';
import { AudienceCards } from './audience-cards';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel: content ──────────────────────────────── */}
      <div
        className="lg:flex-1 lg:min-h-screen flex flex-col justify-between p-10 lg:p-14"
        style={{ background: 'linear-gradient(160deg, #0F0F4B 0%, #0B0B38 60%, #08082A 100%)' }}
      >
        {/* Top: logo */}
        <div className="flex items-center gap-2">
          <Image src="/mvf-logo-white.svg" alt="MVF" width={60} height={20} />
          <span className="text-[13px] font-semibold text-white/50 tracking-widest uppercase">
            Launchpad
          </span>
        </div>

        {/* Middle: headline + content */}
        <div className="flex flex-col gap-10 py-12 lg:py-0">
          {/* Headline */}
          <div>
            <h1 className="text-[28px] lg:text-[34px] font-bold text-white leading-[1.15] tracking-tight">
              Every internal tool,<br />in one place.
            </h1>
            <p className="mt-3 text-[14px] text-white/50 leading-relaxed max-w-sm">
              Find what exists. Know what&apos;s safe.<br className="hidden lg:block" /> Build what&apos;s missing.
            </p>
          </div>

          {/* Audience cards */}
          <AudienceCards />

          {/* Tier blocks */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-3">
              App tiers
            </p>
            <TierBlocks />
          </div>
        </div>

        {/* Bottom: disclaimer */}
        <p className="text-[11px] text-white/25 leading-relaxed max-w-xs">
          Not an approval process. Not another committee.<br />Just visibility into what&apos;s being built.
        </p>
      </div>

      {/* ── Right panel: auth ────────────────────────────────── */}
      <div className="lg:w-[420px] flex items-center justify-center p-10 bg-background min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-xs space-y-6 text-center flex flex-col items-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Image
                src="/mvf-logo-navy.svg"
                alt="MVF"
                width={72}
                height={24}
                className="dark:hidden"
              />
              <Image
                src="/mvf-logo-white.svg"
                alt="MVF"
                width={72}
                height={24}
                className="hidden dark:block"
              />
              <span className="text-lg font-semibold tracking-tight">Launchpad</span>
            </div>
            <p className="text-[13px] text-muted-foreground">
              Sign in with your MVF Google account
            </p>
          </div>
          <GoogleSignInButton />
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            Access is limited to MVF employees.<br />
            Your role is set automatically on first sign-in.
          </p>
        </div>
      </div>

    </div>
  );
}
