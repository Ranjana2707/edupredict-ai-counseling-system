import { cn } from '../../utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  textClassName?: string;
  subTextClassName?: string;
  lightText?: boolean;
}

export function Logo({
  className,
  size = 'md',
  withText = false,
  textClassName,
  subTextClassName,
  lightText = false
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-14 w-14 rounded-2xl',
    xl: 'h-20 w-20 rounded-[22px]'
  };

  return (
    <div className={cn("flex items-center gap-3 select-none group cursor-pointer", className)}>
      <div className={cn(
        "relative flex items-center justify-center bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#1E3A8A] text-white shadow-lg shadow-indigo-950/40 border border-white/10 transform group-hover:scale-[1.05] group-hover:rotate-[1deg] transition-all duration-300 ease-out",
        sizeClasses[size]
      )}>
        {/* Dynamic Glowing Aura in Background (Indigo/Blue/Cyan) */}
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-cyan-400/30 blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500" />
        
        {/* Sleek Universal Tech SVG Logo */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="h-[76%] w-[76%] relative z-10"
        >
          <defs>
            {/* Blue-Indigo Gradient for Cap */}
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>

            {/* Cyan Gradient for Accents */}
            <linearGradient id="cyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>

            {/* Glowing filter for high-tech finish */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background clean concentric circles */}
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            stroke="rgba(255, 255, 255, 0.05)" 
            strokeWidth="1" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            stroke="rgba(56, 189, 248, 0.12)" 
            strokeWidth="1.5" 
            strokeDasharray="2 3" 
            className="animate-[spin_180s_linear_infinite]"
          />

          {/* Upward dynamic flight line (representing progress and success) */}
          <path 
            d="M 25 75 Q 40 75 52 58 T 78 30" 
            stroke="url(#cyanGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            filter="url(#logoGlow)"
          />

          {/* Modern Graduation Cap */}
          <path 
            d="M 50 20 L 78 31 L 50 42 L 22 31 Z" 
            fill="url(#capGrad)" 
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))"
          />

          <path 
            d="M 34 37 V 44 C 34 48, 41 51, 50 51 C 59 51, 66 48, 66 44 V 37 L 50 43.5 Z" 
            fill="url(#capGrad)" 
            opacity="0.95"
          />

          {/* Tassel */}
          <path 
            d="M 50 31 Q 34 33 28 43" 
            stroke="#22D3EE" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <circle cx="28" cy="44" r="2.5" fill="#22D3EE" />

          {/* Glowing Success Star */}
          <g transform="translate(78, 30)">
            <path 
              d="M 0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" 
              fill="#FACC15"
              filter="url(#logoGlow)"
            />
          </g>
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-sans font-black tracking-tight text-sm sm:text-base leading-none transition-colors",
            lightText ? "text-white" : "text-slate-900 dark:text-white",
            textClassName
          )}>
            EduPredict<span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"> AI</span>
          </span>
          <span className={cn(
            "font-sans text-[8px] sm:text-[9px] font-black tracking-widest uppercase mt-1 leading-none",
            lightText ? "text-white/60" : "text-slate-500 dark:text-slate-400",
            subTextClassName
          )}>
            Student Success Engine
          </span>
        </div>
      )}
    </div>
  );
}
