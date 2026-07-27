'use client';

import { ContentType } from '@signage/types';
import { Image, Video, Type, Globe } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ContentTypeBadgeProps {
  type: ContentType;
  className?: string;
}

const typeConfig: Record<ContentType, { label: string; Icon: React.ElementType; className: string }> = {
  [ContentType.IMAGE]: {
    label: 'Image',
    Icon: Image,
    className: 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20',
  },
  [ContentType.VIDEO]: {
    label: 'Video',
    Icon: Video,
    className: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20',
  },
  [ContentType.TEXT]: {
    label: 'Text',
    Icon: Type,
    className: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20',
  },
  [ContentType.WEB]: {
    label: 'Web',
    Icon: Globe,
    className: 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20',
  },
};

export function ContentTypeBadge({ type, className }: ContentTypeBadgeProps) {
  const config = typeConfig[type];
  if (!config) return null;
  const { label, Icon } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
