import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Search, Shield, LogOut, AlertTriangle } from 'lucide-react';
import { CapacityIndicator } from '@/components/capacity-indicator';
import { CAPACITY_LIMIT } from '@/lib/constants';
import type { Profile } from '@/lib/supabase/types';

interface UnresolvedFlag {
  id: string;
  app_id: string;
  flag_type: string;
}

interface DashboardShellProps {
  user: Profile;
  capacityUsed: number;
  unresolvedFlags: UnresolvedFlag[];
  children: React.ReactNode;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/browse', label: 'App Library', icon: Search },
  { href: '/register', label: 'Register App', icon: PlusCircle },
  { href: '/governance', label: 'Governance', icon: Shield, adminOnly: true },
];

export function DashboardShell({ user, capacityUsed, unresolvedFlags, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="px-4 pt-5 pb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mvf-logo-white.svg" alt="MVF" width={56} height={19} />
            <span className="text-[13px] font-semibold text-sidebar-foreground tracking-tight">Launchpad</span>
          </Link>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item) => {
            if ('adminOnly' in item && item.adminOnly && user.role === 'maker') {
              return null;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-[6px] px-2.5 h-8 text-[13px] text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150"
              >
                <item.icon className="h-[15px] w-[15px] opacity-60" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Required */}
        {unresolvedFlags.length > 0 && (
          <div className="border-t border-sidebar-border px-3 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <p className="text-[11px] font-medium text-amber-400">
                Action Required ({unresolvedFlags.length})
              </p>
            </div>
            <ul className="space-y-0.5">
              {unresolvedFlags.slice(0, 5).map((flag) => (
                <li key={flag.id}>
                  <Link
                    href={`/apps/${flag.app_id}`}
                    className="flex items-center rounded-[6px] px-2 h-6 text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors duration-150 capitalize"
                  >
                    {flag.flag_type.replace(/_/g, ' ')}
                  </Link>
                </li>
              ))}
              {unresolvedFlags.length > 5 && (
                <li className="px-2 text-[11px] text-sidebar-foreground/30">
                  +{unresolvedFlags.length - 5} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Capacity */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="text-[11px] font-medium text-sidebar-foreground/40 mb-1.5">Capacity</p>
          <CapacityIndicator used={capacityUsed} limit={CAPACITY_LIMIT} variant="sidebar" />
        </div>

        {/* User */}
        <div className="border-t border-sidebar-border px-3 py-3">
          <div className="flex items-center gap-2.5 px-1">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-sidebar-foreground">
                {user.full_name || user.email}
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/40 capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST" className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 h-8 text-[13px] text-sidebar-foreground/40 hover:text-sidebar-foreground/75 hover:bg-sidebar-accent transition-colors duration-150"
            >
              <LogOut className="h-[15px] w-[15px]" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col min-h-screen">
        <div className="flex-1 px-8 py-6 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
