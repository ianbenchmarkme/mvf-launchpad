import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Shield, LogOut } from 'lucide-react';
import type { Profile } from '@/lib/supabase/types';

interface DashboardShellProps {
  user: Profile;
  children: React.ReactNode;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/register', label: 'Register App', icon: PlusCircle },
  { href: '/governance', label: 'Governance', icon: Shield },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar p-4 flex flex-col">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mvf-logo-white.svg" alt="MVF" width={63} height={21} />
            <span className="text-lg font-bold text-sidebar-foreground">Launchpad</span>
          </Link>
          <p className="text-xs text-sidebar-foreground/50 mt-1">
            Ship tools fast. Keep them running.
          </p>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            // Only show Governance to admins and viewers
            if (item.href === '/governance' && user.role === 'maker') {
              return null;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-3 px-3">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt=""
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.full_name || user.email}
              </p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST" className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}
