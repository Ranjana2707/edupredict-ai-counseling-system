import React, { useState } from 'react';
import { PredictionHistoryItem } from '../../types/prediction';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { RefreshCw, TrendingDown, TrendingUp, GitCompare, ChevronRight, HelpCircle } from 'lucide-react';

interface PredictionComparisonProps {
  history: PredictionHistoryItem[];
}

export function PredictionComparison({ history }: PredictionComparisonProps) {
  // Select two indices to compare
  const [selectedOldId, setSelectedOldId] = useState<string>(history[1]?.id || history[0]?.id || '');
  const [selectedNewId, setSelectedNewId] = useState<string>(history[0]?.id || '');

  const oldItem = history.find((h) => h.id === selectedOldId);
  const newItem = history.find((h) => h.id === selectedNewId);

  // Math differences
  const riskDiff = newItem && oldItem ? newItem.riskScore - oldItem.riskScore : 0;
  const attDiff = newItem && oldItem ? newItem.attendance - oldItem.attendance : 0;
  const cgpaDiff = newItem && oldItem ? newItem.cgpa - oldItem.cgpa : 0;

  // Improvement %: negative risk diff represents improvement
  const riskImprovement = -riskDiff;

  return (
    <Card className="border border-outline-variant/60 shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="p-lg pb-3 border-b border-outline-variant/30 bg-surface-container/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <GitCompare className="h-5 w-5 text-primary" />
              <CardTitle className="text-xs font-black uppercase text-on-surface">
                Prediction Interlock Comparison
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-medium text-on-surface-variant">
              Select two historical ML executions to analyze comparative risk variances and improvement steps.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-lg space-y-6 flex-1">
        {/* Selector Dropdowns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 select-none">
            <label className="text-[9px] font-black uppercase text-outline">Benchmark (Old Prediction)</label>
            <select
              value={selectedOldId}
              onChange={(e) => setSelectedOldId(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary uppercase"
            >
              {history.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.studentName} ({new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}) - {h.riskScore}%
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 select-none">
            <label className="text-[9px] font-black uppercase text-outline">Target (New Prediction)</label>
            <select
              value={selectedNewId}
              onChange={(e) => setSelectedNewId(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary uppercase"
            >
              {history.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.studentName} ({new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}) - {h.riskScore}%
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* side by side stats comparison table */}
        {oldItem && newItem ? (
          <div className="space-y-5">
            {/* Comparison Grid */}
            <div className="border border-outline-variant/30 rounded-xl overflow-hidden font-sans text-xs">
              <div className="grid grid-cols-4 bg-surface-container/40 p-3 font-black text-outline uppercase text-[10px] select-none border-b border-outline-variant/30">
                <span>Metric Index</span>
                <span className="text-center">Benchmark</span>
                <span className="text-center">Target</span>
                <span className="text-right">Variance</span>
              </div>

              {/* Row 1: Risk Probability */}
              <div className="grid grid-cols-4 p-3 border-b border-outline-variant/10 items-center font-semibold">
                <span className="text-on-surface font-extrabold uppercase text-[10px]">Dropout Risk</span>
                <span className="text-center font-mono font-bold">{oldItem.riskScore}%</span>
                <span className="text-center font-mono font-bold text-primary">{newItem.riskScore}%</span>
                <span className={`text-right font-mono font-black flex items-center justify-end gap-1 ${riskDiff < 0 ? 'text-emerald-500' : riskDiff > 0 ? 'text-rose-500' : 'text-outline'}`}>
                  {riskDiff < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : riskDiff > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : null}
                  {riskDiff > 0 ? '+' : ''}{riskDiff}%
                </span>
              </div>

              {/* Row 2: Attendance */}
              <div className="grid grid-cols-4 p-3 border-b border-outline-variant/10 items-center font-semibold">
                <span className="text-on-surface font-extrabold uppercase text-[10px]">Attendance</span>
                <span className="text-center font-mono font-bold">{oldItem.attendance}%</span>
                <span className="text-center font-mono font-bold text-primary">{newItem.attendance}%</span>
                <span className={`text-right font-mono font-black flex items-center justify-end gap-1 ${attDiff > 0 ? 'text-emerald-500' : attDiff < 0 ? 'text-rose-500' : 'text-outline'}`}>
                  {attDiff > 0 ? '+' : ''}{attDiff}%
                </span>
              </div>

              {/* Row 3: CGPA */}
              <div className="grid grid-cols-4 p-3 items-center font-semibold">
                <span className="text-on-surface font-extrabold uppercase text-[10px]">CGPA Index</span>
                <span className="text-center font-mono font-bold">{oldItem.cgpa.toFixed(2)}</span>
                <span className="text-center font-mono font-bold text-primary">{newItem.cgpa.toFixed(2)}</span>
                <span className={`text-right font-mono font-black flex items-center justify-end gap-1 ${cgpaDiff > 0 ? 'text-emerald-500' : cgpaDiff < 0 ? 'text-rose-500' : 'text-outline'}`}>
                  {cgpaDiff > 0 ? '+' : ''}{cgpaDiff.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Combined summary callout */}
            <div className="bg-surface-container/10 p-3.5 rounded-xl border border-outline-variant/30 flex items-center gap-3 justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-outline uppercase">Improvement Trend Coefficients</p>
                <p className="text-[11px] font-bold text-on-surface leading-snug">
                  {riskImprovement > 0 ? (
                    <>
                      Core retention triggers improved by <strong className="text-emerald-500">+{riskImprovement}%</strong>. Student continues to respond positively to mentoring.
                    </>
                  ) : riskImprovement < 0 ? (
                    <>
                      Dropout vulnerability increased by <strong className="text-rose-500">+{Math.abs(riskImprovement)}%</strong>. Immediate counselor meeting recommended.
                    </>
                  ) : (
                    <>No net variance detected between checkpoints.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-outline text-center py-8">Need multiple records in database history to execute comparisons.</p>
        )}
      </CardContent>
    </Card>
  );
}
