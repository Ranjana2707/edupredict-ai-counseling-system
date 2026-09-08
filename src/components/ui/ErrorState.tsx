import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Database Connection Timeout',
  description = 'Unable to fetch real-time analytics indicators. Please verify local environment configurations.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-xl text-center rounded-lg border border-error/20 bg-error/5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-sans text-base font-bold text-on-surface">
        {title}
      </h3>
      <p className="mt-1 font-sans text-xs text-on-surface-variant max-w-sm">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm" className="mt-6">
          Retry Sync Sequence
        </Button>
      )}
    </div>
  );
}
