'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Search, Shield, LogOut, AlertTriangle, FileText, MessageSquare, Inbox, Palette } from 'lucide-react';
import { CapacityIndicator } from '@/components/capacity-indicator';
import { ThemeToggle } from '@/components/theme-toggle';
import { PulseBadge } from '@/components/pulse-badge';
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
  { href: '/', label: 'My Apps', icon: LayoutDashboard },
  { href: '/browse', label: 'App Library', icon: Search },
  { href: '/register', label: 'Register App', icon: PlusCircle },
  { href: '/brand-guidelines', label: 'Brand Guidelines', icon: Palette },
  { href: '/support', label: 'Support', icon: MessageSquare },
];

const adminNavItems = [
  { href: '/governance', label: 'Governance', icon: Shield },
  { href: '/support/admin', label: 'Support Inbox', icon: Inbox },
  { href: '/prd', label: 'Roadmap', icon: FileText },
];

export function DashboardShell({ user, capacityUsed, unresolvedFlags, children }: DashboardShellProps) {
  const pathname = usePathname();
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-sidebar-border bg-sidebar flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 pt-6 pb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mvf-logo-white.svg" alt="MVF" width={56} height={19} />
            <span className="text-[13px] font-semibold text-sidebar-foreground tracking-tight">Launchpad</span>
          </Link>
        </div>

        <nav className="flex-1 px-2 pt-[10px] flex flex-col gap-4">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-[6px] px-2.5 h-8 text-[13px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                      : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className="h-[15px] w-[15px] shrink-0" style={{ color: 'var(--mvf-light-blue)' }} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {user.role === 'admin' && (
            <div className="space-y-0.5">
              <p className="px-2.5 mb-1 text-[11px] font-medium text-sidebar-foreground/30 uppercase tracking-wider">Admin</p>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-[6px] px-2.5 h-8 text-[13px] transition-colors duration-150 ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                        : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="h-[15px] w-[15px] shrink-0" style={{ color: 'var(--mvf-yellow)' }} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Action Required */}
        {unresolvedFlags.length > 0 && (
          <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3" style={{ color: 'var(--mvf-orange)' }} />
              <p className="text-[11px] font-medium" style={{ color: 'var(--mvf-orange)' }}>
                Action Required <PulseBadge count={unresolvedFlags.length} />
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
        <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
          <CapacityIndicator used={capacityUsed} limit={CAPACITY_LIMIT} variant="sidebar" />
        </div>

        {/* User */}
        <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
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
          <div className="mt-2 flex items-center gap-1">
            <form action="/api/auth/signout" method="POST" className="flex-1">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 h-8 text-[13px] text-sidebar-foreground/40 hover:text-sidebar-foreground/75 hover:bg-sidebar-accent transition-colors duration-150"
              >
                <LogOut className="h-[15px] w-[15px]" />
                Sign out
              </button>
            </form>
            <ThemeToggle />
          </div>
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
