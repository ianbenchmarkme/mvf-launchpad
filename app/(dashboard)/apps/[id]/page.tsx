import { notFound } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { TierBadge } from '@/components/tier-badge';
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

  const typedApp = app as App;
  const typedOwners = (owners || []) as (AppOwner & { profiles: Profile })[];
  const typedFlags = (flags || []) as RiskFlag[];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{typedApp.name}</h1>
            <TierBadge tier={typedApp.tier} />
          </div>
          <p className="mt-1 text-muted-foreground">{typedApp.problem_statement}</p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
          {STATUS_LABELS[typedApp.status]}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid gap-4 sm:grid-cols-2">
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
        <h2 className="text-lg font-semibold mb-2">Owners</h2>
        {typedOwners.length === 0 ? (
          <p className="text-sm text-muted-foreground">No owners assigned</p>
        ) : (
          <ul className="space-y-2">
            {typedOwners.map((owner) => (
              <li key={owner.id} className="flex items-center gap-3">
                {owner.profiles.avatar_url && (
                  <img src={owner.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                )}
                <span className="text-sm">{owner.profiles.full_name || owner.profiles.email}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {owner.owner_role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Risk Flags */}
      {typedFlags.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Active Flags</h2>
          <ul className="space-y-2">
            {typedFlags.map((flag) => (
              <li
                key={flag.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className={`h-2 w-2 rounded-full ${
                  flag.severity === 'critical' ? 'bg-red-500' :
                  flag.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <span className="capitalize">{flag.flag_type.replace(/_/g, ' ')}</span>
                {flag.description && (
                  <span className="text-muted-foreground">— {flag.description}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm capitalize">{value}</dd>
    </div>
  );
}
