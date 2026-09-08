import { APP_NAME } from '../../constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-lowest py-lg mt-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-lg md:px-xl gap-4">
        {/* Left Side */}
        <p className="font-sans text-xs text-on-surface-variant text-center sm:text-left select-none">
          &copy; {currentYear} {APP_NAME} Prediction Hub. All rights reserved.
        </p>

        {/* Right Side */}
        <div className="flex items-center justify-center gap-4 font-sans text-[10px] sm:text-xs font-semibold text-on-surface-variant select-none">
          <span className="flex items-center gap-1.5 rounded bg-surface-container px-2 py-0.5 border border-outline-variant/30 text-outline">
            v1.0.0 Stable (Beta)
          </span>
          <span className="flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            ML Prediction Engine Online
          </span>
        </div>
      </div>
    </footer>
  );
}
