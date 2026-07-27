'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // If we're on the login page, don't block rendering
    if (pathname === '/login') {
      setAuthorized(true);
      return;
    }

    const token = localStorage.getItem('signage_token');
    if (!token) {
      setAuthorized(false);
      router.replace('/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== '/login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(222,47%,6%)] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-accent" />
          <p className="text-sm font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
