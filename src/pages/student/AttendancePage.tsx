import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Grid
} from 'lucide-react';
import { useStudentAttendance } from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function AttendancePage() {
  const { data: attendance, isLoading } = useStudentAttendance();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Fixed mock month: July 2026

  if (isLoading || !attendance) {
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

  // Generate calendar days for July 2026 (Starts on Wednesday, 31 days)
  const daysInMonth = 31;
  const startDayOffset = 3; // Wednesday (0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed...)
  const calendarDays = [];

  // Padding days for previous month
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push({ day: null, status: 'none' });
  }

  // Active month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `2026-07-${d < 10 ? '0' : ''}${d}`;
    const matchedRecord = attendance.heatmapData.find((h) => h.date === dateStr);
    
    // Add realistic status for weekdays
    const dayOfWeek = (startDayOffset + d - 1) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let status: 'present' | 'absent' | 'excused' | 'untracked' | 'none' = 'untracked';
    if (isWeekend) {
      status = 'none';
    } else if (matchedRecord) {
      status = matchedRecord.status;
    } else {
      // General mock patterns
      status = d % 7 === 0 ? 'absent' : d % 12 === 0 ? 'excused' : 'present';
    }

    calendarDays.push({ day: d, status });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Engagement Analytics"
        description="Verify institutional attendance records, view monthly trends, and address critical debarment thresholds."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Attendance Metric', path: '/student/attendance' }
        ]}
      />

      {/* Low Attendance Critical Alerts Banner */}
      {attendance.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-error/25 bg-error/10 p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-error font-extrabold text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4.5 w-4.5" />
            Institutional Attendance Shortage Detected
          </div>
          <div className="space-y-1.5 pl-6 list-disc">
            {(attendance?.alerts || []).map((alert, idx) => (
              <p key={idx} className="font-sans text-xs text-on-surface-variant font-medium leading-relaxed">
                • {alert}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grid: Overview and Monthly Trend Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subject-Wise Lecture Percentage */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-outline-variant/40">
              <div>
                <CardTitle className="text-base font-extrabold">Subject-Wise Analytics</CardTitle>
                <CardDescription>Lecture percentages mapped against the 75% institutional threshold</CardDescription>
              </div>
              <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded-default border border-primary/25">
                Overall: {attendance.overall}%
              </span>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-4">
                {(attendance?.subjects || []).map((sub) => {
                  const isBelow = sub.percentage < sub.required;
                  return (
                    <div
                      key={sub.code}
                      className="p-4 rounded-lg border border-outline-variant/40 bg-surface-container-low/40 space-y-3 hover:border-primary/20 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                              {sub.code}
                            </span>
                            <h4 className="font-sans text-sm font-extrabold text-on-surface">{sub.name}</h4>
                          </div>
                          <p className="text-[11px] text-on-surface-variant font-medium mt-1">
                            Attended: <span className="font-bold">{sub.attended}</span> / <span className="font-bold">{sub.total}</span> lectures
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`font-sans text-lg font-black ${isBelow ? 'text-error' : 'text-emerald-500'}`}>
                              {sub.percentage}%
                            </p>
                            <p className="text-[9px] text-outline font-bold uppercase">Required: {sub.required}%</p>
                          </div>
                          <div className="shrink-0">
                            {isBelow ? (
                              <span className="inline-flex h-6 px-2 items-center justify-center rounded bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider">
                                At Risk
                              </span>
                            ) : (
                              <span className="inline-flex h-6 px-2 items-center justify-center rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                Safe
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${isBelow ? 'bg-error' : 'bg-emerald-500'}`}
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recharts Monthly Trend area chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold">Monthly Engagement Vector</CardTitle>
                  <CardDescription>Calculated cumulative lecture attendance over time</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span>Stabilized since May</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendance.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.004 286.32)" className="dark:stroke-outline-variant/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface-container-highest, #f3f4f6)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#attendanceGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side layout: Interactive Calendar Grid & Visual Heatmap */}
        <div className="space-y-6">
          {/* Institutional Attendance Calendar & Heatmap */}
          <Card>
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4.5 w-4.5 text-primary" />
                  <CardTitle className="text-sm font-extrabold uppercase tracking-wider">
                    July 2026 Log
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-extrabold uppercase text-outline tracking-wider select-none">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 select-none">
                {calendarDays.map((item, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square flex items-center justify-center rounded text-xs font-bold transition-all relative ${
                      item.day === null
                        ? 'text-transparent pointer-events-none'
                        : item.status === 'present'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15'
                        : item.status === 'absent'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15'
                        : item.status === 'excused'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15'
                        : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20'
                    }`}
                  >
                    {item.day}
                  </div>
                ))}
              </div>

              {/* Legend checklist */}
              <div className="pt-4 border-t border-outline-variant/30 grid grid-cols-3 gap-2 text-[10px] uppercase font-bold text-on-surface-variant select-none">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Excused</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Heatmap overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Grid className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider">
                  Weekly Pattern Intensity
                </CardTitle>
              </div>
              <CardDescription>
                Frequency and distribution of active academic attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-xs font-semibold text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span>Mon-Wed Lectures Block</span>
                  <span className="font-bold text-rose-500">64% Presence (Critical)</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: '64%' }} />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span>Thu-Fri Labs Block</span>
                  <span className="font-bold text-emerald-500">88% Presence (Stable)</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 leading-relaxed text-on-surface-variant font-medium">
                <strong>AI Correlation Insight:</strong> Low attendance on Monday/Tuesday mornings directly correlates with overdue algorithms coursework submissions. Establishing a Tuesday study structure is recommended.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
