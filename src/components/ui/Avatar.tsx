import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-lg',
      xl: 'h-20 w-20 text-2xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full border border-outline-variant bg-surface-container font-sans font-semibold text-on-surface-variant items-center justify-center select-none',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || fallback}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback on image loading error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        <span className="absolute flex h-full w-full items-center justify-center uppercase">
          {fallback.substring(0, 2)}
        </span>
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
