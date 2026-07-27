'use client';

import { useState, useEffect } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { AuthGuard } from './AuthGuard';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <QueryProvider>
      <AuthGuard>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthGuard>
    </QueryProvider>
  );
}
