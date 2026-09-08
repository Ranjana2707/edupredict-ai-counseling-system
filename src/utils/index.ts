import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple ClassValues into a single Tailwind-friendly class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a decimal percentage to a human-readable string.
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Formats standard CGPA scale.
 */
export function formatCGPA(value: number): string {
  return value.toFixed(2);
}

/**
 * Gets Tailwind color class matching a specific Risk Level.
 */
export function getRiskColorClass(level: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (level) {
    case 'low':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50';
    case 'medium':
      return 'text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50';
    case 'high':
      return 'text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50';
    case 'critical':
      return 'text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800/50';
  }
}
