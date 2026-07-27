'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();
  const [email, setEmail] = useState('admin@signage.id');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('signage_token');
    if (token) router.replace('/');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    login(
      { email, password },
      {
        onSuccess: () => {
          router.replace('/');
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Login failed. Please check your credentials.';
          setErrorMessage(message);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(222,47%,6%)] p-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, hsl(217,91%,20%) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, hsl(189,100%,10%) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 ring-1 ring-accent/30 shadow-glow">
              <Radio className="h-7 w-7 text-accent" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-100">Signage Control Panel</h1>
              <p className="mt-0.5 text-sm text-slate-500">PT MJ Solution Indonesia</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@signage.id"
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-accent/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger ring-1 ring-danger/20">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary mt-2 w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            Signage Control Panel v1.0 · PT MJ Solution Indonesia
          </p>
        </div>
      </div>
    </div>
  );
}
