import React from 'react';
import { ModelPerformanceMetrics } from '../../types/prediction';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Cpu, Calendar, Database, ShieldCheck, Sparkles } from 'lucide-react';

interface ModelPerformanceProps {
  metrics: ModelPerformanceMetrics;
}

export function ModelPerformance({ metrics }: ModelPerformanceProps) {
  // Simple layout calculations for confusion matrix
  const { tp, fp, fn, tn } = metrics.confusionMatrix;
  const total = tp + fp + fn + tn;

  const scoreStats = [
    { label: 'ML Accuracy', value: `${metrics.accuracy}%`, color: 'text-primary' },
    { label: 'Precision Rate', value: `${metrics.precision}%`, color: 'text-sky-500' },
    { label: 'Recall Rate', value: `${metrics.recall}%`, color: 'text-emerald-500' },
    { label: 'F1 Score Coeff', value: `${metrics.f1Score}%`, color: 'text-amber-500' },
    { label: 'ROC AUC Curve', value: `${metrics.rocAuc}%`, color: 'text-indigo-500' }
  ];

  return (
    <Card className="border border-outline-variant/60 shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="p-lg pb-3 border-b border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-5 w-5 text-primary" />
              <CardTitle className="text-xs font-black uppercase text-on-surface">
                Prediction Model Telemetry & Weights
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-medium text-on-surface-variant mt-0.5">
              Statistical performance indices verified against active validation datasets.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-500/15 text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 animate-pulse" /> Certified Production Ready
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-lg space-y-6 flex-1">
        {/* KPI Core Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {scoreStats.map((stat, idx) => (
            <div
              key={idx}
              className="p-3 bg-surface-container/30 border border-outline-variant/30 rounded-xl text-center select-none"
            >
              <p className="text-[9px] font-black uppercase text-outline leading-tight">{stat.label}</p>
              <h4 className={`text-xl font-black mt-1.5 ${stat.color}`}>{stat.value}</h4>
            </div>
          ))}
        </div>

        {/* Model Details & Confusion Matrix */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Details list */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5 select-none">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Model Hyperparameters
            </h5>

            <div className="bg-surface-container/20 border border-outline-variant/20 rounded-xl p-4 space-y-3.5 font-sans text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-semibold">Active Algorithmic Core</span>
                <span className="font-mono font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30 text-[10px]">
                  XGBOOST CLASSIFIER (v3)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-semibold">Inference Model Version</span>
                <span className="font-mono font-bold text-on-surface">{metrics.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-semibold">Last Training Compilation</span>
                <span className="font-mono font-bold text-on-surface flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-outline" /> {metrics.trainingDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-semibold">Validation Dataset Volume</span>
                <span className="font-mono font-bold text-on-surface flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-outline" /> {metrics.datasetSize.toLocaleString()} records
                </span>
              </div>
            </div>
          </div>

          {/* Confusion Matrix Block */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase text-outline tracking-wider select-none">
              In-Sample Confusion Matrix
            </h5>

            {/* Matrix Visual Frame */}
            <div className="border border-outline-variant/30 rounded-xl overflow-hidden font-sans text-xs select-none">
              <div className="grid grid-cols-3 bg-surface-container/50 border-b border-outline-variant/30 p-2.5 text-center font-black uppercase text-[9px] text-outline">
                <span>Actual \ Pred</span>
                <span>GRADUATING</span>
                <span>RISK</span>
              </div>

              {/* Graduate True Row */}
              <div className="grid grid-cols-3 border-b border-outline-variant/10 p-2.5 text-center items-center font-semibold">
                <span className="font-black text-left text-[9px] text-outline pl-2 uppercase">GRADUATE</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/15 font-bold">
                  <p className="text-[9px] uppercase font-black text-outline">TN</p>
                  <p className="font-mono font-extrabold">{tn}</p>
                </div>
                <div className="p-2 bg-rose-500/5 text-rose-500/80 rounded-lg border border-rose-500/10 font-bold">
                  <p className="text-[9px] uppercase font-black text-outline">FP</p>
                  <p className="font-mono font-extrabold">{fp}</p>
                </div>
              </div>

              {/* Dropout/Risk Row */}
              <div className="grid grid-cols-3 p-2.5 text-center items-center font-semibold">
                <span className="font-black text-left text-[9px] text-outline pl-2 uppercase">RISK / DROP</span>
                <div className="p-2 bg-rose-500/5 text-rose-500/80 rounded-lg border border-rose-500/10 font-bold">
                  <p className="text-[9px] uppercase font-black text-outline">FN</p>
                  <p className="font-mono font-extrabold">{fn}</p>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/15 font-bold">
                  <p className="text-[9px] uppercase font-black text-outline">TP</p>
                  <p className="font-mono font-extrabold">{tp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
