import { notFound } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { TierBadge } from '@/components/tier-badge';
import { DeleteAppButton } from '@/components/delete-app-button';
import { AdminActions } from '@/components/admin-actions';
import { RiskFlagsList } from '@/components/risk-flags-list';
import { LAYER_LABELS, STATUS_LABELS, TARGET_USERS_LABELS } from '@/lib/constants';
import type { App, AppOwner, Profile, RiskFlag } from '@/lib/supabase/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createAuthServerClient();

  // Fetch app with owners and flags
  const { data: app } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .single();

  if (!app) {
    notFound();
  }

  const { data: owners } = await supabase
    .from('app_owners')
    .select('*, profiles(*)')
    .eq('app_id', id);

  const { data: flags } = await supabase
    .from('risk_flags')
    .select('*')
    .eq('app_id', id)
    .is('resolved_at', null);

  // Fetch current user role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  const isAdmin = (profile as Profile | null)?.role === 'admin';
  const typedApp = app as App;
  const typedOwners = (owners || []) as (AppOwner & { profiles: Profile })[];
  const typedFlags = (flags || []) as RiskFlag[];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">{typedApp.name}</h1>
            <TierBadge tier={typedApp.tier} />
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">{typedApp.problem_statement}</p>
        </div>
        <span className="rounded-[5px] bg-muted px-1.5 py-0.5 text-[11px] font-medium">
          {STATUS_LABELS[typedApp.status]}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Layer" value={LAYER_LABELS[typedApp.layer]} />
        <DetailItem label="Target Users" value={TARGET_USERS_LABELS[typedApp.target_users]} />
        {typedApp.potential_roi && <DetailItem label="Potential ROI" value={typedApp.potential_roi} />}
        <DetailItem label="Needs Business Data" value={typedApp.needs_business_data} />
        <DetailItem label="Handles PII" value={typedApp.handles_pii} />
        <DetailItem label="Uses API Keys" value={typedApp.uses_api_keys} />
        {typedApp.api_key_services && <DetailItem label="API Services" value={typedApp.api_key_services} />}
        {typedApp.replaces_third_party && (
          <>
            <DetailItem label="Replaces" value={typedApp.replaced_tool_name || 'Unknown'} />
            {typedApp.replaced_tool_cost && <DetailItem label="Estimated Saving" value={typedApp.replaced_tool_cost} />}
          </>
        )}
      </div>

      {/* Owners */}
      <div>
        <h2 className="text-[13px] font-semibold text-muted-foreground mb-2">Owners</h2>
        {typedOwners.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No owners assigned</p>
        ) : (
          <ul className="space-y-2">
            {typedOwners.map((owner) => (
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
      </div>

      {/* Risk Flags */}
      <RiskFlagsList flags={typedFlags} isAdmin={isAdmin} />

      {/* Admin Controls */}
      {isAdmin && (
        <div className="border-t pt-6">
          <h2 className="text-[12px] font-medium text-muted-foreground mb-3">Admin Controls</h2>
          <AdminActions appId={typedApp.id} currentTier={typedApp.tier} />
        </div>
      )}

      {/* Danger Zone */}
      <div className="border-t pt-6">
        <h2 className="text-[12px] font-medium text-muted-foreground mb-3">Danger Zone</h2>
        <DeleteAppButton appId={typedApp.id} appName={typedApp.name} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-[13px] capitalize">{value}</dd>
    </div>
  );
}
