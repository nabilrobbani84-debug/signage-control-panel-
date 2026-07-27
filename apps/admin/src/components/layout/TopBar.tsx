'use client';

import { Bell, User } from 'lucide-react';
import { useSocketContext } from '@/providers/SocketProvider';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { isConnected } = useSocketContext();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.05] px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Realtime indicator */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
            isConnected
              ? 'bg-success/10 text-success ring-success/20'
              : 'bg-slate-800 text-slate-500 ring-white/10'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected ? 'bg-success animate-pulse' : 'bg-slate-600'
            }`}
          />
          {isConnected ? 'Live' : 'Offline'}
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-200">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 ring-1 ring-accent/30">
          <User className="h-4 w-4 text-accent" />
        </div>
      </div>
    </header>
  );
}
