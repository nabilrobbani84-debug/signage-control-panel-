'use client';

import { useState, useEffect } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthGuard } from './AuthGuard';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning className="contents">
      <ThemeProvider>
        <QueryProvider>
          <AuthGuard>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthGuard>
        </QueryProvider>
      </ThemeProvider>
    </div>
  );
}
