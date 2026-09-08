import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { History, TrendingUp, TrendingDown, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface TimelineData {
  date: string;
  riskScore: number;
  attendance: number;
  cgpa: number;
  counselingSessions: number;
}

interface RiskTimelineProps {
  historicalTrend: TimelineData[];
}

export function RiskTimeline({ historicalTrend = [] }: RiskTimelineProps) {
  // Determine trend of risk change
  const trendList = historicalTrend || [];
  const firstPoint = trendList[0];
  const lastPoint = trendList[trendList.length - 1];
  const riskChange = lastPoint ? lastPoint.riskScore - (firstPoint?.riskScore || 0) : 0;
  const isImproving = riskChange < 0;

  return (
    <Card className="border border-outline-variant/60 shadow-xs">
      <CardHeader className="p-lg pb-3 border-b border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div>
            <div className="flex items-center gap-1.5">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-xs font-black uppercase text-on-surface">
                Student Risk & Performance Timeline
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-medium text-on-surface-variant mt-0.5">
              Multi-week progression of calculated dropout risk plotted against core engagement indices.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs">
            {isImproving ? (
              <>
                <TrendingDown className="h-4 w-4 text-emerald-500" />
                <span className="font-extrabold uppercase text-emerald-500">
                  Improvement Trend (-{Math.abs(riskChange)}% Risk)
                </span>
              </>
            ) : riskChange > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-rose-500" />
                <span className="font-extrabold uppercase text-rose-500">
                  Risk Climbed (+{riskChange}%)
                </span>
              </>
            ) : (
              <span className="font-extrabold uppercase text-outline">Risk Stable (0%)</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-lg space-y-8">
        {/* Dual Axis Area Chart */}
        <div className="space-y-2">
          <h5 className="text-[10px] font-black uppercase text-outline tracking-wider">Historical Trend Metrics Mapping</h5>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" domain={[0, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#10B981" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Area yAxisId="left" type="monotone" name="Dropout Risk %" dataKey="riskScore" stroke="#3B82F6" fillOpacity={1} fill="url(#riskGrad)" strokeWidth={2.5} />
                <Line yAxisId="right" type="monotone" name="Attendance %" dataKey="attendance" stroke="#10B981" strokeWidth={2} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Step-by-step Timeline Node list */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-black uppercase text-outline tracking-wider">Prediction Milestone Checkpoints</h5>
          
          <div className="relative pl-6 border-l-2 border-outline-variant/30 space-y-6">
            {(historicalTrend || []).map((pt, idx) => (
              <div key={idx} className="relative">
                {/* Timeline node dot */}
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-surface-container-lowest border-2 border-primary flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h6 className="font-sans font-black text-xs text-on-surface uppercase">{pt.date}</h6>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      pt.riskScore < 30 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                      pt.riskScore < 60 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/10'
                    }`}>
                      {pt.riskScore}% Risk
                    </span>
                  </div>

                  <div className="text-[11px] text-on-surface-variant font-medium grid grid-cols-3 gap-4 pt-1 max-w-md">
                    <span>Attendance: <strong className="text-on-surface font-extrabold">{pt.attendance}%</strong></span>
                    <span>CGPA: <strong className="text-on-surface font-extrabold">{pt.cgpa.toFixed(2)}</strong></span>
                    <span>Counseling Sessions: <strong className="text-on-surface font-extrabold">{pt.counselingSessions}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
