'use client';

import { DeviceStatus } from '@signage/types';
import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isOnline = status === DeviceStatus.ONLINE;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
        isOnline
          ? 'bg-success/10 text-success ring-1 ring-success/20'
          : 'bg-danger/10 text-danger ring-1 ring-danger/20',
        className
      )}
    >
      {isOnline ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
      )}
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
