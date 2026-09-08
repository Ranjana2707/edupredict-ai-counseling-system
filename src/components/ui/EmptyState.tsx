import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no active records in this section matching your credentials.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-xl text-center rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low/20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-outline">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-sans text-base font-bold text-on-surface">
        {title}
      </h3>
      <p className="mt-1 font-sans text-xs text-on-surface-variant max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm" className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
