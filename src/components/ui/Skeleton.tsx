import React from 'react';
import { cn } from '@/src/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-church-earth/10 dark:bg-church-earth/20", className)}
      {...props}
    />
  );
}
