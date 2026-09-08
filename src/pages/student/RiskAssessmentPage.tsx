import { motion } from 'motion/react';
import {
  AlertTriangle,
  TrendingUp,
  GraduationCap,
  CheckCircle,
  HelpCircle,
  Info,
  Activity,
  Award
} from 'lucide-react';
import { useStudentRiskAnalysis } from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function RiskAssessmentPage() {
  const { data: risk, isLoading } = useStudentRiskAnalysis();

  if (isLoading || !risk) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse bg-surface-container-highest/40 rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2"><CardSkeleton /></div>
          <div><CardSkeleton /></div>
        </div>
      </div>
    );
  }

  // Define colors based on risk levels
  const levelColors: Record<string, { border: string; text: string; bg: string; bar: string; label: string }> = {
    LOW: {
      border: 'border-emerald-500/20',
      text: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      bar: 'bg-emerald-500',
      label: 'Low Advisory Need'
    },
    MEDIUM: {
      border: 'border-amber-500/20',
      text: 'text-amber-500',
      bg: 'bg-amber-500/10',
      bar: 'bg-amber-500',
      label: 'Moderate Advisory Need'
    },
    HIGH: {
      border: 'border-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      bar: 'bg-rose-500',
      label: 'High Advisory Need'
    }
  };

  const levelColor = levelColors[risk.riskLevel] || levelColors.LOW;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Standing & Advisory Profile"
        description="Review academic advisory indicators, track standing trends, and coordinate targeted support actions."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Advisory Standing', path: '/student/risk' }
        ]}
      />

      {/* Grid: Risk Meter & Prediction Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Risk Level Badge & Gauge */}
        <Card className={`border-2 ${levelColor.border} bg-surface-container-lowest shadow-sm`}>
          <CardHeader className="text-center">
            <CardDescription className="uppercase tracking-widest font-extrabold text-[10px] text-outline">
              Advisory Support Level
            </CardDescription>
            <div className="mt-2 inline-flex mx-auto items-center justify-center rounded-full px-4 py-1.5 font-sans text-xs font-black uppercase tracking-wider bg-surface-container border border-outline-variant/40">
              <span className={`h-2.5 w-2.5 rounded-full mr-2 ${levelColor.bar}`} />
              Status: <span className={`ml-1 font-extrabold ${levelColor.text}`}>{levelColor.label}</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2 space-y-5">
            {/* Styled Circular Gauge representation */}
            <div className="relative flex h-36 w-36 items-center justify-center select-none">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="var(--color-surface-container, #e5e7eb)"
                  strokeWidth="8"
                  fill="transparent"
                  className="dark:stroke-surface-container/30"
                />
                {/* Value Circle arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={risk.riskLevel === 'MEDIUM' ? '#f59e0b' : risk.riskLevel === 'HIGH' ? '#f43f5e' : '#10b981'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * risk.riskPercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Inner Percentage display */}
              <div className="absolute flex flex-col items-center text-center">
                <span className="font-sans text-3xl font-black text-on-surface">{risk.riskPercentage}%</span>
                <span className="text-[10px] text-outline uppercase font-extrabold tracking-wider">Attention Index</span>
              </div>
            </div>

            {/* Model Confidence Badge */}
            <div className="w-full bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/40 space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-outline uppercase tracking-wider">
                <GraduationCap className="h-4 w-4 text-primary" />
                Advisory Accuracy
              </div>
              <p className="font-sans text-sm font-black text-on-surface">
                {risk.predictionConfidence}% Assessment Standing
              </p>
              <p className="font-sans text-[10px] text-on-surface-variant font-medium">
                Evaluated based on attendance & progress
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Timeline Recharts chart */}
        <div className="md:col-span-2">
          <Card className="h-full shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold">Weekly Academic standing</CardTitle>
                  <CardDescription>Academic progression and attention indices across the current semester</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant select-none">
                  <Activity className="h-4 w-4 text-rose-500" />
                  <span>Term Progress Tracking</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={risk.timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.004 286.32)" className="dark:stroke-outline-variant/30" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface-container-highest, #f3f4f6)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk Drivers Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-outline-variant/40 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle className="text-base font-extrabold">Academic Support Indicators</CardTitle>
              <CardDescription>Primary indicators showing areas where proactive counseling can assist your term completion</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {(risk?.riskDrivers || []).map((driver, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-outline-variant/40 bg-surface-container-low/50 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-on-surface">
                    <span>Focus Area {idx + 1}</span>
                    <span className="text-rose-500">Attention Level: {driver.impact}/10</span>
                  </div>
                  <h4 className="font-sans text-xs font-bold text-on-surface">{driver.factor}</h4>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed font-medium">
                    {driver.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Information Notice */}
      <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/50 space-y-2 flex gap-3.5">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-on-surface uppercase">Institutional Policy Support Disclosure</h4>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            These standing indicators are advisory priorities designed to route counseling, mentoring, and tutoring resources to students. They are confidential, do not affect official grade transcripts, and are protected under private university student data guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
