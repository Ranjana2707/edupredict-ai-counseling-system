import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 font-sans text-xs text-on-surface-variant select-none">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-on-surface transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="h-3 w-3 text-outline" />
            {isLast || !item.path ? (
              <span className="font-semibold text-on-surface truncate max-w-[120px] sm:max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-on-surface transition-colors truncate max-w-[120px] sm:max-w-[200px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
