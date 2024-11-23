// apps/platform/src/components/ui/spinner.tsx
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full',
        'border-primary/30 border-t-primary',
        'animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

// Usage example:
// <Spinner size="sm" />