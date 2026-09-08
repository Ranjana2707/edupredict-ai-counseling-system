import { cn } from '../../utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function LoadingSkeleton({ className, variant = 'rect' }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-container-highest/60',
        {
          'h-4 w-full rounded': variant === 'text',
          'h-24 w-full rounded-lg': variant === 'rect',
          'h-12 w-12 rounded-full': variant === 'circle',
        },
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="circle" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" className="w-1/3 h-5" />
          <LoadingSkeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <LoadingSkeleton variant="rect" className="h-20" />
      <div className="flex justify-between items-center pt-2">
        <LoadingSkeleton variant="text" className="w-1/4 h-4" />
        <LoadingSkeleton variant="text" className="w-1/4 h-8 rounded" />
      </div>
    </div>
  );
}
