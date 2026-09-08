import React from 'react';
import { AIInsights } from '../../types/prediction';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Sparkles, ThumbsUp, AlertTriangle, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

interface InsightsPanelProps {
  insights: AIInsights;
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card className="border border-outline-variant/60 shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="p-lg pb-3 border-b border-outline-variant/30 bg-surface-container/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          <CardTitle className="text-xs font-black uppercase text-on-surface">AI Insights & Diagnostics Matrix</CardTitle>
        </div>
        <CardDescription className="text-xs font-medium text-on-surface-variant">
          Automated contextual synthesis of positive buffers and active danger points.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-lg space-y-6 flex-1">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Positive side */}
          <div className="space-y-4">
            {/* Strengths */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5 select-none">
                <ThumbsUp className="h-4 w-4" /> Core Student Strengths
              </h5>
              <ul className="space-y-1.5 pl-5 list-disc text-xs text-on-surface-variant font-semibold">
                {(insights?.strengths || []).map((s, idx) => (
                  <li key={idx} className="leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>

            {/* Positive Indicators */}
            <div className="space-y-2.5 pt-2">
              <h5 className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1.5 select-none">
                <CheckCircle2 className="h-4 w-4" /> Protective Buffers
              </h5>
              <ul className="space-y-1.5 pl-5 list-disc text-xs text-on-surface-variant font-semibold">
                {(insights?.positiveIndicators || []).map((p, idx) => (
                  <li key={idx} className="leading-relaxed">{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Negative/Action side */}
          <div className="space-y-4 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
            {/* Key Risk Factors */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-black uppercase text-rose-500 tracking-wider flex items-center gap-1.5 select-none">
                <AlertTriangle className="h-4 w-4" /> Principal Risk Factors
              </h5>
              <ul className="space-y-1.5 pl-5 list-disc text-xs text-on-surface-variant font-semibold">
                {(insights?.keyRiskFactors || []).map((r, idx) => (
                  <li key={idx} className="leading-relaxed text-rose-500/95">{r}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement / Weaknesses */}
            <div className="space-y-2.5 pt-2">
              <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 select-none">
                <FileText className="h-4 w-4" /> Improvement Pathways
              </h5>
              <ul className="space-y-1.5 pl-5 list-disc text-xs text-on-surface-variant font-semibold">
                {(insights?.areasForImprovement || []).map((a, idx) => (
                  <li key={idx} className="leading-relaxed">{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
