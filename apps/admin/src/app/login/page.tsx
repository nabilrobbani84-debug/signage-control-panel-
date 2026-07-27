'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin, useRegister } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@signage.id');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isPending = isLoginPending || isRegisterPending;

  useEffect(() => {
    const token = localStorage.getItem('signage_token');
    if (token) router.replace('/');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'login') {
      login(
        { email, password },
        {
          onSuccess: () => router.replace('/'),
          onError: (err: unknown) => {
            const message =
              (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
              'Login failed. Please check your credentials.';
            setErrorMessage(message);
          },
        }
      );
    } else {
      register(
        { name, email, password },
        {
          onSuccess: () => router.replace('/'),
          onError: (err: unknown) => {
            const message =
              (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
              'Registration failed. Please try again.';
            setErrorMessage(message);
          },
        }
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-[400px] animate-fade-in space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface border border-surface-border">
            <Image src="/logo.png" alt="Signage Logo" width={48} height={48} className="object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Signage Control Panel · PT MJ Solution
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <label htmlFor="register-name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="form-input"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
              className="form-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="form-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger border border-danger/20">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full h-10"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-neutral-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage('');
            }}
            className="font-medium text-foreground hover:underline transition-all"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
