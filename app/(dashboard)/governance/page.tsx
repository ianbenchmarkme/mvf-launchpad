import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { TierBadge } from '@/components/tier-badge';
import { GovernanceFlagsList } from '@/components/governance-flags-list';
import { LAYER_LABELS } from '@/lib/constants';
import type { App, RiskFlag, Profile } from '@/lib/supabase/types';

export default async function GovernancePage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  if (!profile || (profile as Profile).role === 'maker') {
    redirect('/');
  }

  // Fetch all apps
  const { data: apps } = await supabase
    .from('apps')
    .select('*')
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  // Fetch all unresolved flags
  const { data: flags } = await supabase
    .from('risk_flags')
    .select('*, apps(name)')
    .is('resolved_at', null);

  const typedApps = (apps || []) as App[];
  const typedFlags = (flags || []) as (RiskFlag & { apps: { name: string } })[];

  // Group apps by layer and tier
  const layers = ['L1', 'L2', 'L3'] as const;
  const tiers = ['green', 'amber', 'red'] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Governance Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          {typedApps.length} registered apps across all layers
        </p>
      </div>

      {/* Landscape Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Landscape</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground">Layer</th>
                {tiers.map((tier) => (
                  <th key={tier} className="p-2 text-center text-xs font-medium">
                    <TierBadge tier={tier} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {layers.map((layer) => (
                <tr key={layer} className="border-t">
                  <td className="p-2 text-sm font-medium">{LAYER_LABELS[layer]}</td>
                  {tiers.map((tier) => {
                    const count = typedApps.filter(
                      (a) => a.layer === layer && a.tier === tier
                    ).length;
                    return (
                      <td key={tier} className="p-2 text-center text-sm">
                        {count > 0 ? count : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Flags */}
      <GovernanceFlagsList flags={typedFlags as (RiskFlag & { apps: { name: string } | null })[]} />

      {/* All Apps List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Registered Apps</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium">Name</th>
                <th className="p-2 text-left font-medium">Layer</th>
                <th className="p-2 text-left font-medium">Tier</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">PII</th>
                <th className="p-2 text-left font-medium">API Keys</th>
              </tr>
            </thead>
            <tbody>
              {typedApps.map((app) => (
                <tr key={app.id} className="border-b">
                  <td className="p-2">
                    <a href={`/apps/${app.id}`} className="text-primary underline">
                      {app.name}
                    </a>
                  </td>
                  <td className="p-2">{LAYER_LABELS[app.layer]}</td>
                  <td className="p-2"><TierBadge tier={app.tier} /></td>
                  <td className="p-2 capitalize">{app.status}</td>
                  <td className="p-2 capitalize">{app.handles_pii}</td>
                  <td className="p-2 capitalize">{app.uses_api_keys}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
