'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render a same-size placeholder until mounted
  // (returning null causes layout shift as the sidebar reflows)
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-8 w-8 shrink-0" aria-hidden />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center justify-center h-8 w-8 rounded-[6px] text-sidebar-foreground/40 hover:text-sidebar-foreground/75 hover:bg-sidebar-accent transition-colors duration-150"
    >
      {isDark ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
    </button>
  );
}
