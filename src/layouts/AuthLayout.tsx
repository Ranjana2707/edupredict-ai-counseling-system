import { Outlet } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden p-4 sm:p-6 select-none transition-colors duration-300">
      {/* 1. Subtle, ultra-premium background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.5] dark:opacity-[0.25]" />
      
      {/* 2. Soft atmospheric glowing blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[450px] w-[450px] rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-cyan-400/10 dark:bg-cyan-500/15 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '15s' }} />

      {/* 3. Center card structure */}
      <div className="w-full max-w-[520px] z-10 flex flex-col items-center">
        {/* The Card - 20px rounded, extremely subtle glass panel, light borders, backdrop-blur */}
        <div className="w-full min-h-[720px] bg-white/70 dark:bg-[#0F172A]/80 backdrop-blur-md rounded-[20px] border border-slate-200/60 dark:border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-8 sm:p-10 flex flex-col justify-between transition-colors duration-300">
          
          {/* Top Brand Logo & Header Area */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative group">
              {/* Subtle backglow animation behind the logo */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-60 blur-md group-hover:opacity-90 transition duration-1000 group-hover:duration-200 animate-pulse" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-white font-extrabold text-2xl shadow-lg">
                EP
              </div>
            </div>
            
            <div className="text-center space-y-1 mt-2">
              <h2 className="font-sans text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {APP_NAME}
              </h2>
              <p className="font-sans text-[10px] text-blue-600 dark:text-cyan-400 uppercase tracking-widest font-black flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                Predictive AI Retention Engine
              </p>
            </div>
          </div>

          {/* Child pages content container */}
          <div className="flex-1 flex flex-col justify-center">
            <Outlet />
          </div>

        </div>

        {/* Footnote notes */}
        <p className="mt-6 font-sans text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase max-w-xs mx-auto leading-normal">
          Authorized personnel only • Compliance Monitored
        </p>
      </div>
    </div>
  );
}
