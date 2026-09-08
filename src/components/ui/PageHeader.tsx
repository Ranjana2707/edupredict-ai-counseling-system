import { ReactNode } from 'react';
import { BreadcrumbItem } from '../../types';
import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/30 pb-lg mb-lg">
      <div className="space-y-1.5 flex-1 min-w-0">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl truncate">
          {title}
        </h1>
        {description && (
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2 sm:self-end">
          {actions}
        </div>
      )}
    </div>
  );
}
