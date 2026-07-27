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
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-white/[0.05] bg-[hsl(222,47%,6%)] shrink-0">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.05] px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/20">
            <Radio className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-none">Signage CP</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 leading-none">MJ Solution ID</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-accent/10 text-accent ring-1 ring-accent/20'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.05] p-3 space-y-2">
          {/* WS Connection Status */}
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isConnected ? 'bg-success animate-pulse' : 'bg-slate-600'
              )}
            />
            <span className="text-xs text-slate-500">
              {isConnected ? 'Live updates active' : 'Connecting...'}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[hsl(222,47%,6%)]/95 px-2 py-2 backdrop-blur-lg">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-accent' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-danger"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}
