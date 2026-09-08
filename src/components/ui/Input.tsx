import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300 select-none tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-4 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl py-3 px-4 font-sans text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
              {
                'pl-11': leftIcon,
                'pr-11': rightIcon,
                'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500 dark:focus:border-red-500': error,
              },
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 flex items-center justify-center text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="font-sans text-xs text-error font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
