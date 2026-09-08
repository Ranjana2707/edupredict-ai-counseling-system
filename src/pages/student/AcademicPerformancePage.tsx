import { motion } from 'motion/react';
import {
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  Layers,
  ChevronUp,
  BarChart,
  CheckCircle2
} from 'lucide-react';
import { useStudentAcademics } from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from 'recharts';

export default function AcademicPerformancePage() {
  const { data: academics, isLoading } = useStudentAcademics();

  if (isLoading || !academics) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Performance Analytics"
        description="Verify semester grades, compare internal & external midterm metrics, and track credit accumulation progress."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Academic Index', path: '/student/academic' }
        ]}
      />

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hoverable className="border-l-4 border-l-primary">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider">
              Cumulative CGPA
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1">{academics.cgpa}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-on-surface-variant font-medium">
              Calculated on 110 accumulated credits.
            </p>
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Class Cohort Rank
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              {academics?.stats?.classRank ? academics.stats.classRank.split(' ')[0] : 'N/A'}
              <span className="text-xs font-semibold text-on-surface-variant ml-1">
                / {academics?.stats?.classRank ? (academics.stats.classRank.split(' ')[2] || academics.stats.classRank.split(' ')[1] || 'N/A') : 'N/A'} Enrolled
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-on-surface-variant font-medium">
              Upper quintile performance curve.
            </p>
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-secondary">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider text-secondary">
              Acquired Credits
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1">
              {academics.stats.passedCredits}
              <span className="text-xs font-semibold text-on-surface-variant ml-1">
                / {academics.stats.totalCredits}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-on-surface-variant font-medium">
              100% completion rate, 0 non-cleared papers.
            </p>
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Academic Backlogs
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1">
              {academics.stats.backlogs}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-on-surface-variant font-medium">
              All prior components cleared.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CGPA Trend Line Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold">GPA Growth Vector</CardTitle>
                <CardDescription>Visualizing academic trajectory over completed semesters</CardDescription>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                <ChevronUp className="h-4 w-4" />
                Dean's List Area
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={academics.semesterGpa} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.004 286.32)" className="dark:stroke-outline-variant/30" />
                  <XAxis dataKey="semester" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                  <YAxis domain={[5.0, 10.0]} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface-container-highest, #f3f4f6)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Internal vs External bar chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base font-extrabold">Evaluation Benchmarks</CardTitle>
              <CardDescription>Comparing your internal and external score profiles</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={academics.subjectMarks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.004 286.32)" className="dark:stroke-outline-variant/30" />
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface-container-highest, #f3f4f6)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  <Bar dataKey="internal" name="Internal Marks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="external" name="External Marks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Ledger list (Internal, External, class average) */}
      <Card>
        <CardHeader className="border-b border-outline-variant/40 pb-4">
          <div>
            <CardTitle className="text-base font-extrabold">Evaluated Subjects Registry</CardTitle>
            <CardDescription>Detailed midterm scores with comparison benchmarks</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-0">
          <div className="overflow-x-auto">
            <Table id="grades-ledger">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-xs uppercase tracking-wider pl-lg">Subject / Course</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Internal (100)</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">External (100)</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Class Avg (100)</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-lg">Deviation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(academics?.subjectMarks || []).map((sub, idx) => {
                  const myAvg = (sub.internal + sub.external) / 2;
                  const dev = myAvg - sub.classAverage;
                  const devSign = dev >= 0 ? '+' : '';
                  const devColor = dev >= 0 ? 'text-emerald-500 font-bold' : 'text-error font-bold';

                  return (
                    <TableRow key={idx} className="hover:bg-surface-container-low/30 transition-all">
                      <TableCell className="font-sans font-extrabold text-sm text-on-surface pl-lg py-4">
                        {sub.subject}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-center text-on-surface-variant">
                        {sub.internal}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-center text-on-surface-variant">
                        {sub.external}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-center text-on-surface-variant">
                        {sub.classAverage}
                      </TableCell>
                      <TableCell className={`font-mono text-xs text-right pr-lg py-4 ${devColor}`}>
                        {devSign}{dev.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Academic Advice Banner */}
      <div className="p-4 rounded-lg bg-surface-container border border-outline-variant/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            AI Course Recovery Dialogue
          </h4>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed font-medium">
            Your marks in Algorithms and Distributed Systems are running below average due to attendance gaps. Pulling up presence guarantees external exam margins.
          </p>
        </div>
      </div>
    </div>
  );
}
