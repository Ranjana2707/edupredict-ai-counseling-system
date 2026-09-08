import React, { useState } from 'react';
import { ShapFeatureContribution } from '../../types/prediction';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { HelpCircle, ChevronRight, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface ShapDashboardProps {
  shapData: ShapFeatureContribution[];
  dropoutProbability: number;
}

export function ShapDashboard({ shapData = [], dropoutProbability }: ShapDashboardProps) {
  const [activeFeature, setActiveFeature] = useState<ShapFeatureContribution | null>(null);

  const safeShapData = shapData || [];

  // Prepare data for the horizontal Recharts bar chart
  const barChartData = safeShapData.map((s) => ({
    name: s.displayName,
    contribution: s.contribution,
    valueStr: s.value.toString(),
    direction: s.direction,
    rawFeature: s.feature
  }));

  // Create Waterfall items starting from baseline institutional rate of 35%
  const baseRate = 35;
  let runningSum = baseRate;
  const waterfallData = safeShapData.map((s) => {
    const start = runningSum;
    runningSum += s.contribution;
    // Cap running sum between 0 and 100 for safety
    runningSum = Math.min(Math.max(runningSum, 0), 100);
    return {
      name: s.displayName,
      contribution: s.contribution,
      value: s.value,
      start,
      end: runningSum,
      isPositive: s.contribution >= 0
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest border border-outline-variant p-2.5 rounded-lg shadow-md text-xs space-y-1 select-none font-sans font-semibold">
          <p className="text-on-surface font-black uppercase text-[10px]">{data.name}</p>
          <p className="text-outline">Current Value: <span className="text-on-surface font-extrabold">{data.valueStr}</span></p>
          <p className={data.contribution >= 0 ? 'text-rose-500 font-extrabold' : 'text-emerald-500 font-extrabold'}>
            Risk Impact: {data.contribution >= 0 ? '+' : ''}{data.contribution}% {data.contribution >= 0 ? 'dropout force' : 'retention force'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-outline-variant/60 shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="p-lg pb-2 border-b border-outline-variant/30 bg-surface-container/15">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
              Explainable AI (SHAP Framework)
            </span>
            <CardTitle className="text-xs font-black uppercase text-on-surface mt-2.5">
              Individual Feature Risk Attribution
            </CardTitle>
            <CardDescription className="text-xs font-medium text-on-surface-variant">
              Mathematical weights representing each feature's contribution to this specific predicted risk level.
            </CardDescription>
          </div>
          <HelpCircle className="h-5 w-5 text-outline cursor-pointer hover:text-on-surface transition" />
        </div>
      </CardHeader>

      <CardContent className="p-lg space-y-8 flex-1">
        {/* Waterfall Plot Placeholder / Section */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5 select-none">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> SHAP Risk Attribution Waterfall (Base Rate 35%)
          </h5>

          <div className="bg-surface-container-low/40 border border-outline-variant/30 rounded-xl p-4 space-y-3 font-sans text-xs">
            {/* Step-by-step waterfall diagram */}
            <div className="flex items-center justify-between text-[10px] text-outline font-black uppercase border-b border-outline-variant/20 pb-2 mb-3">
              <span>Feature Contribution Vector</span>
              <span className="text-right">Risk Score Shift</span>
            </div>

            {/* Base Institution Rate */}
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-outline">
                <ChevronRight className="h-3.5 w-3.5 text-outline/50" /> Base Institutional Rate
              </span>
              <span className="font-mono font-black text-on-surface">35.0%</span>
            </div>

            {/* Incremental waterfalls */}
            {waterfallData.slice(0, 5).map((w, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-semibold hover:bg-surface-container/30 rounded px-1 transition duration-150 py-0.5">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <ChevronRight className="h-3.5 w-3.5 text-primary/30" /> {w.name}
                  <span className="text-[9px] text-outline font-normal">({w.value})</span>
                </span>
                <span className={`font-mono font-bold flex items-center gap-1 ${w.isPositive ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {w.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {w.contribution >= 0 ? '+' : ''}{w.contribution}%
                </span>
              </div>
            ))}

            {/* Final predicted outcome */}
            <div className="border-t border-outline-variant/30 pt-3 flex items-center justify-between font-black text-xs uppercase text-on-surface">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Final Calculated Dropout Risk
              </span>
              <span className="font-mono text-sm tracking-tight text-primary">{dropoutProbability}%</span>
            </div>
          </div>
        </div>

        {/* Feature Attribution Bar Chart */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-black uppercase text-outline tracking-wider select-none">
            SHAP Contribution Coordinates
          </h5>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-container-low)', opacity: 0.4 }} />
                <ReferenceLine x={0} stroke="#9CA3AF" strokeWidth={1.5} />
                <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                  {barChartData.map((entry, idx) => {
                    const isPositive = entry.contribution >= 0;
                    return (
                      <Cell
                        key={`cell-${idx}`}
                        fill={isPositive ? '#F87171' : '#34D399'} // soft rose-400 or emerald-400
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart Legend */}
          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase select-none text-outline pt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-rose-400" />
              <span>Supports Dropout (+ Risk)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-emerald-400" />
              <span>Supports Graduation (- Risk)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
