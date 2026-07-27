'use client';

import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accentColor?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'text-accent',
  loading = false,
}: StatsCardProps) {
  return (
    <div className="stats-card group">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded-md bg-white/[0.06]" />
          ) : (
            <p className={cn('mt-1.5 text-3xl font-bold tracking-tight', accentColor)}>{value}</p>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
            'bg-white/[0.05] ring-white/10'
          )}
        >
          <Icon className={cn('h-5 w-5', accentColor)} />
        </div>
      </div>

      {/* Trend row */}
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <TrendingUp
            className={cn('h-3.5 w-3.5', trend.value >= 0 ? 'text-success' : 'text-danger')}
          />
          <span className={trend.value >= 0 ? 'text-success' : 'text-danger'}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-slate-600">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
