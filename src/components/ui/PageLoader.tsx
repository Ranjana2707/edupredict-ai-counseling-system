import { LoadingSpinner } from './LoadingSpinner';
import { Logo } from './Logo';

export function PageLoader({ message = 'Synchronizing secure predictive model data...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 text-center p-lg max-w-sm">
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring animation around the logo */}
          <div className="absolute h-20 w-20 rounded-[22px] bg-indigo-500/10 border border-indigo-500/20 animate-ping opacity-75" />
          <Logo size="lg" className="animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="font-sans text-base font-black tracking-tight text-on-surface">
            EduPredict<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
          </h3>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            {message}
          </p>
        </div>
        <LoadingSpinner size="sm" className="text-primary mt-2" />
      </div>
    </div>
  );
}
