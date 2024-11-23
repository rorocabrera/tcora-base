// apps/platform/src/components/loading-screen/index.tsx
import { cn } from '@/lib/utils';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-16 h-16 rounded-full",
          "border-4 border-primary/30 border-t-primary",
          "animate-spin"
        )} />
        <p className="mt-4 text-lg font-medium text-foreground">Loading...</p>
      </div>
    </div>
  );
}