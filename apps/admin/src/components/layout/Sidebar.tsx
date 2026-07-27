'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Monitor,
  Library,
  LogOut,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLogout } from '@/hooks/useAuth';
import { useSocketContext } from '@/providers/SocketProvider';

import Image from 'next/image';

const navItems = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Devices', href: '/devices', icon: Monitor },
  { label: 'Content Library', href: '/contents', icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const { isConnected } = useSocketContext();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-surface-border bg-background shrink-0">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-surface-border px-6">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-surface">
            <Image src="/logo.png" alt="Signage Logo" width={32} height={32} className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground tracking-tight leading-none">Signage</p>
            <p className="mt-1 text-[11px] font-medium text-neutral-500 leading-none">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-surface text-foreground'
                        : 'text-neutral-400 hover:bg-surface-hover hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-surface-border p-4 space-y-3">
          <div className="flex items-center gap-2 rounded-md bg-surface border border-surface-border px-3 py-2">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isConnected ? 'bg-success animate-pulse' : 'bg-neutral-600'
              )}
            />
            <span className="text-xs font-medium text-neutral-400">
              {isConnected ? 'System online' : 'Connecting...'}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-all hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-surface-border bg-background/95 px-2 py-2 backdrop-blur-lg">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-neutral-500 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-medium text-neutral-500 hover:text-danger"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}
