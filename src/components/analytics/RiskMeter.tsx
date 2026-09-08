import React from 'react';
import { motion } from 'motion/react';

interface RiskMeterProps {
  probability: number; // 0 to 100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export function RiskMeter({ probability, riskLevel, confidence }: RiskMeterProps) {
  // Determine rotation of the needle (from -90deg to 90deg, matching 0% to 100%)
  const needleRotation = -90 + (probability / 100) * 180;

  // Determine text color and label
  const getRiskDetails = () => {
    switch (riskLevel) {
      case 'low':
        return {
          label: 'LOW RISK',
          color: 'text-emerald-500',
          gradient: 'from-emerald-500/20 to-emerald-500/5',
          strokeColor: '#10B981',
          bgGlow: 'shadow-emerald-500/10'
        };
      case 'medium':
        return {
          label: 'MEDIUM RISK',
          color: 'text-amber-500',
          gradient: 'from-amber-500/20 to-amber-500/5',
          strokeColor: '#F59E0B',
          bgGlow: 'shadow-amber-500/10'
        };
      case 'high':
        return {
          label: 'HIGH RISK',
          color: 'text-orange-500',
          gradient: 'from-orange-500/20 to-orange-500/5',
          strokeColor: '#F97316',
          bgGlow: 'shadow-orange-500/10'
        };
      case 'critical':
        return {
          label: 'CRITICAL RISK',
          color: 'text-rose-500',
          gradient: 'from-rose-500/20 to-rose-500/5',
          strokeColor: '#EF4444',
          bgGlow: 'shadow-rose-500/10'
        };
    }
  };

  const details = getRiskDetails();

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface-container/30 border border-outline-variant/40 rounded-2xl relative overflow-hidden h-full">
      {/* Background radial gradient corresponding to risk */}
      <div className={`absolute inset-0 bg-radial ${details.gradient} opacity-40 pointer-events-none`} />

      <h4 className="text-[10px] font-black uppercase text-outline tracking-widest mb-6">AI Dropout Risk Gauge</h4>

      {/* Main Gauge SVG Container */}
      <div className="relative w-64 h-36 flex items-end justify-center">
        {/* Arc Track */}
        <svg className="absolute w-full h-full" viewBox="0 0 200 110">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />   {/* Emerald */}
              <stop offset="40%" stopColor="#F59E0B" />  {/* Amber */}
              <stop offset="75%" stopColor="#F97316" />  {/* Orange */}
              <stop offset="100%" stopColor="#EF4444" /> {/* Rose */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={details.strokeColor} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--outline-variant)"
            strokeWidth="14"
            strokeLinecap="round"
            className="opacity-20"
          />

          {/* Value Filled Arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={251.2} // Circ = pi * r = 3.14 * 80 = 251.2
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (probability / 100) * 251.2 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Needle Pin Center */}
          <circle cx="100" cy="100" r="6" fill="var(--on-surface)" />
          <circle cx="100" cy="100" r="3" fill="var(--surface-container-lowest)" />
        </svg>

        {/* Needle with rotation animation */}
        <motion.div
          style={{ transformOrigin: 'bottom center' }}
          className="absolute bottom-0 w-1.5 h-24 flex justify-center"
          initial={{ rotate: -90 }}
          animate={{ rotate: needleRotation }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <div className="w-1 h-20 bg-on-surface rounded-t-full relative">
            <div
              className="absolute top-0 -left-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: details.strokeColor, filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }}
            />
          </div>
        </motion.div>

        {/* Numerical Probability Overlay */}
        <div className="absolute bottom-0 text-center select-none z-10">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-on-surface tracking-tight"
          >
            {probability}%
          </motion.h3>
          <p className={`text-xs font-black tracking-widest mt-0.5 uppercase ${details.color}`}>
            {details.label}
          </p>
        </div>
      </div>

      {/* Info Indicators */}
      <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-outline-variant/30 text-xs text-center select-none">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-outline">Risk Threshold</p>
          <p className="font-sans font-bold text-on-surface text-xs">
            {probability < 30 ? 'Safe Interval' : probability < 60 ? 'Warning Level' : 'Critical Action'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-outline">Model Confidence</p>
          <p className="font-sans font-bold text-primary text-xs">
            {confidence}% <span className="text-[9px] font-normal text-outline">Accuracy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
