import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingDown,
  TrendingUp,
  Award,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Layers,
  Activity,
  History,
  GraduationCap,
  Cpu,
  PieChart as PieIcon,
  HelpCircle,
  Users,
  Download,
  Printer,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Info,
  Percent,
  FileSpreadsheet,
  FileText,
  Sliders,
  RefreshCw
} from 'lucide-react';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

// React Hooks & Services
import {
  useExecutiveStats,
  useAttendanceAnalytics,
  useAcademicAnalytics,
  useRiskAnalytics,
  useCounselingAnalytics,
  usePredictionAnalytics,
  useComparativeAnalytics,
  useSmartInsights
} from '../hooks/useAnalyticsData';
import { AnalyticsFilters } from '../types';
import { exportToCSV, exportToExcel, triggerPrint } from '../utils/exportUtils';

// Recharts Data Visualizations
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

// Custom Animated Counter Component
function AnimatedCounter({ value, duration = 1000, suffix = '', decimals = 0 }: { value: number; duration?: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMs = duration;
    const incrementTime = 16; // ~60fps
    const step = (end - start) / (totalMs / incrementTime);

    const timer = setInterval(() => {
      start += step;
      if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  const displayValue = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return <span>{displayValue}{suffix}</span>;
}

// Interactive Heatmap Component
function CustomVisualHeatmap({
  data,
  title,
  description
}: {
  data: { label?: string; day?: string; Week1: number; Week2: number; Week3: number; Week4: number }[];
  title: string;
  description: string;
}) {
  const getColorClass = (value: number) => {
    if (value < 70) return 'bg-rose-500/80 text-rose-100 hover:scale-105';
    if (value < 80) return 'bg-orange-500/80 text-orange-100 hover:scale-105';
    if (value < 90) return 'bg-amber-500/80 text-amber-100 hover:scale-105';
    return 'bg-emerald-500/80 text-emerald-100 hover:scale-105';
  };

  return (
    <Card className="border border-outline-variant/60 shadow-xs">
      <CardHeader>
        <CardTitle className="text-xs font-black uppercase tracking-wider">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[450px] space-y-2">
            <div className="grid grid-cols-5 text-center text-[10px] font-black uppercase text-outline pb-1">
              <div>Dimension</div>
              <div>Week 1</div>
              <div>Week 2</div>
              <div>Week 3</div>
              <div>Week 4</div>
            </div>
            {data.map((row, index) => {
              const rowLabel = row.label || row.day || `Row ${index + 1}`;
              return (
                <div key={`heatmap-row-${index}-${rowLabel}`} className="grid grid-cols-5 gap-2 items-center text-xs">
                  <div className="font-extrabold text-on-surface truncate">{rowLabel}</div>
                  <div className={`p-2.5 rounded-lg text-center font-mono font-black transition-transform duration-200 cursor-pointer ${getColorClass(Number(row.Week1))}`}>
                    {row.Week1}%
                  </div>
                  <div className={`p-2.5 rounded-lg text-center font-mono font-black transition-transform duration-200 cursor-pointer ${getColorClass(Number(row.Week2))}`}>
                    {row.Week2}%
                  </div>
                  <div className={`p-2.5 rounded-lg text-center font-mono font-black transition-transform duration-200 cursor-pointer ${getColorClass(Number(row.Week3))}`}>
                    {row.Week3}%
                  </div>
                  <div className={`p-2.5 rounded-lg text-center font-mono font-black transition-transform duration-200 cursor-pointer ${getColorClass(Number(row.Week4))}`}>
                    {row.Week4}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4 text-[10px] font-bold text-outline">
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> &lt;70% Critical</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-orange-500" /> 70%-80% Risk</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> 80%-90% Medium</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> &gt;90% Optimal</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  // 1. Central filter state matching enterprise criteria
  const [filters, setFilters] = useState<AnalyticsFilters>({
    department: 'all',
    semester: 'all',
    dateRange: '30days',
    riskLevel: 'all',
    attendanceRange: [40, 100],
    cgpaRange: [3.0, 10.0],
    searchQuery: ''
  });

  // Active worksheet tab matching all requested segments
  const [activeTab, setActiveTab] = useState<'executive' | 'attendance' | 'academic' | 'risk' | 'counseling' | 'prediction' | 'comparative'>('executive');

  // Trigger active queries through TanStack hooks
  const { data: stats, isLoading: isStatsLoading } = useExecutiveStats(filters);
  const { data: attendance, isLoading: isAttendanceLoading } = useAttendanceAnalytics(filters);
  const { data: academic, isLoading: isAcademicLoading } = useAcademicAnalytics(filters);
  const { data: risk, isLoading: isRiskLoading } = useRiskAnalytics(filters);
  const { data: counseling, isLoading: isCounselingLoading } = useCounselingAnalytics(filters);
  const { data: prediction, isLoading: isPredictionLoading } = usePredictionAnalytics(filters);
  const { data: comparative, isLoading: isComparativeLoading } = useComparativeAnalytics(filters);
  const { data: insights } = useSmartInsights(filters);

  // Quick helper to reset active BI filters
  const resetFilters = () => {
    setFilters({
      department: 'all',
      semester: 'all',
      dateRange: '30days',
      riskLevel: 'all',
      attendanceRange: [40, 100],
      cgpaRange: [3.0, 10.0],
      searchQuery: ''
    });
  };

  // Color mappings
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const RISK_COLORS = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
    Critical: '#8B5CF6'
  };

  // Check if any telemetry is loading to show placeholder skeletons
  const isGlobalLoading =
    isStatsLoading ||
    isAttendanceLoading ||
    isAcademicLoading ||
    isRiskLoading ||
    isCounselingLoading ||
    isPredictionLoading ||
    isComparativeLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise BI Analytics Suite"
        description="Complex decision-support dashboard loaded with high-fidelity student retention metrics, multi-dimensional charts, and explainable ML trends."
        breadcrumbs={[{ label: 'BI Analytics', path: '/analytics' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => triggerPrint('printable-dashboard-workspace')}
              variant="outline"
              size="sm"
              className="font-bold text-xs flex items-center gap-1.5 h-8 cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print Dashboard / PDF
            </Button>
            <Button
              onClick={() => {
                if (activeTab === 'attendance' && attendance) {
                  exportToExcel(attendance.subjectAttendance, 'SubjectAttendance');
                } else if (activeTab === 'academic' && academic) {
                  exportToExcel(academic.departmentPerformance, 'AcademicDeptComparison');
                } else if (stats) {
                  exportToExcel([stats], 'BI_ExecutiveStats');
                }
              }}
              variant="outline"
              size="sm"
              className="font-bold text-xs flex items-center gap-1.5 h-8 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
            <Button
              onClick={() => {
                if (activeTab === 'attendance' && attendance) {
                  exportToCSV(attendance.monthlyTrend, 'MonthlyAttendanceTrends');
                } else if (activeTab === 'risk' && risk) {
                  exportToCSV(risk.riskDistribution, 'CohortRiskDistribution');
                } else if (stats) {
                  exportToCSV([stats], 'BI_ExecutiveStats');
                }
              }}
              variant="outline"
              size="sm"
              className="font-bold text-xs flex items-center gap-1.5 h-8 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==========================================================
            interactive Control Sidebar (Left 3 Columns)
            ========================================================== */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-outline-variant/60 shadow-xs">
            <CardHeader className="p-lg pb-3 border-b border-outline-variant/20 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-xs font-black uppercase tracking-wider">BI Query Filters</CardTitle>
              </div>
              <button
                onClick={resetFilters}
                className="text-[10px] font-black uppercase text-outline hover:text-primary flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            </CardHeader>
            <CardContent className="p-lg space-y-5 select-none font-sans">
              {/* Search input */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-outline">Search Student / ID</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-outline" />
                  <Input
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    placeholder="Search query..."
                    className="pl-8.5 text-xs h-9 font-semibold"
                  />
                </div>
              </div>

              {/* Department Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-outline">Department Branch</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full text-xs font-extrabold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  <option value="CS">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                </select>
              </div>

              {/* Semester Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-outline">Academic Semester</label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="w-full text-xs font-extrabold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary cursor-pointer"
                >
                  <option value="all">All Semesters</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                </select>
              </div>

              {/* Date Range Picker */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-outline">Date Range Window</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full text-xs font-extrabold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary cursor-pointer"
                >
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="180days">Last 180 Days</option>
                  <option value="this_sem">This Active Semester</option>
                </select>
              </div>

              {/* Risk Level Category */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-outline">Risk Classification</label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                  className="w-full text-xs font-extrabold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary cursor-pointer"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk Only</option>
                  <option value="medium">Medium Risk Only</option>
                  <option value="high">High Risk Only</option>
                  <option value="critical">Critical Risk Only</option>
                </select>
              </div>

              {/* Attendance Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-outline">
                  <span>Min Attendance</span>
                  <span className="text-primary font-mono">{filters.attendanceRange[0]}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={filters.attendanceRange[0]}
                  onChange={(e) => setFilters({ ...filters, attendanceRange: [Number(e.target.value), filters.attendanceRange[1]] })}
                  className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* CGPA Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-outline">
                  <span>Min CGPA (10-Point Scale)</span>
                  <span className="text-primary font-mono">{filters.cgpaRange[0].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={filters.cgpaRange[0]}
                  onChange={(e) => setFilters({ ...filters, cgpaRange: [Number(e.target.value), filters.cgpaRange[1]] })}
                  className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick System Status Card */}
          <Card className="border border-outline-variant/60 shadow-xs bg-primary/5">
            <CardContent className="p-lg select-none space-y-2">
              <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5 animate-pulse" /> Live Telemetry Synced
              </div>
              <p className="text-[11px] leading-relaxed text-on-surface-variant font-medium">
                Our model utilizes real-time attendance, SGPA vectors, and counselor audits. Filtering applies instantaneously.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ==========================================================
            Main Analytics Canvas Workspace (Right 9 Columns)
            ========================================================== */}
        <div className="lg:col-span-9 space-y-6">
          {/* Main Navigation Worksheet Tab Row */}
          <div className="flex bg-surface-container p-1 rounded-xl gap-1 border border-outline-variant/50 select-none overflow-x-auto">
            {[
              { id: 'executive', label: 'Executive Dashboard' },
              { id: 'attendance', label: 'Attendance Tracking' },
              { id: 'academic', label: 'Academic Performance' },
              { id: 'risk', label: 'Dropout Risk Index' },
              { id: 'counseling', label: 'Counseling Impact' },
              { id: 'prediction', label: 'Model Validation' },
              { id: 'comparative', label: 'Comparative Charts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase transition shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-surface-container-lowest shadow-sm font-extrabold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Printable Container Region */}
          <div id="printable-dashboard-workspace" className="space-y-6">
            <AnimatePresence mode="wait">
              {isGlobalLoading ? (
                /* Skeleton Loading State for BI elements */
                <motion.div
                  key="loading-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-28 bg-surface-container animate-pulse rounded-xl" />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[300px] bg-surface-container animate-pulse rounded-2xl" />
                    <div className="h-[300px] bg-surface-container animate-pulse rounded-2xl" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* ==========================================================
                      TAB 1: Executive Dashboard (KPIs, Insights, Overall overview)
                      ========================================================== */}
                  {activeTab === 'executive' && stats && (
                    <div className="space-y-6">
                      {/* Top KPI Cards Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* KPI 1 */}
                        <Card hoverable className="border border-outline-variant/50 relative overflow-hidden">
                          <CardHeader className="pb-1.5 p-lg select-none">
                            <CardDescription className="uppercase tracking-wider font-extrabold text-[9px] text-primary">
                              Total Active Students
                            </CardDescription>
                            <CardTitle className="text-3xl font-black mt-1 text-on-surface">
                              <AnimatedCounter value={stats.totalStudents} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-lg pb-lg">
                            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-500">
                              <TrendingUp className="h-3.5 w-3.5" /> +{stats.monthlyGrowth}% MoM Growth
                            </div>
                          </CardContent>
                        </Card>

                        {/* KPI 2 */}
                        <Card hoverable className="border border-outline-variant/50 relative overflow-hidden">
                          <CardHeader className="pb-1.5 p-lg select-none">
                            <CardDescription className="uppercase tracking-wider font-extrabold text-[9px] text-rose-500">
                              High Risk Cohort
                            </CardDescription>
                            <CardTitle className="text-3xl font-black mt-1 text-rose-500">
                              <AnimatedCounter value={stats.highRiskStudents} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-lg pb-lg">
                            <p className="text-[10px] text-outline font-bold">Requires urgent physical counseling</p>
                          </CardContent>
                        </Card>

                        {/* KPI 3 */}
                        <Card hoverable className="border border-outline-variant/50 relative overflow-hidden">
                          <CardHeader className="pb-1.5 p-lg select-none">
                            <CardDescription className="uppercase tracking-wider font-extrabold text-[9px] text-amber-500">
                              Active Intervention Logs
                            </CardDescription>
                            <CardTitle className="text-3xl font-black mt-1 text-on-surface">
                              <AnimatedCounter value={stats.activeCounselingSessions} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-lg pb-lg">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-outline">
                              <span>In-progress counselor reviews</span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* KPI 4 */}
                        <Card hoverable className="border border-outline-variant/50 relative overflow-hidden">
                          <CardHeader className="pb-1.5 p-lg select-none">
                            <CardDescription className="uppercase tracking-wider font-extrabold text-[9px] text-emerald-500">
                              Average Retention Rate
                            </CardDescription>
                            <CardTitle className="text-3xl font-black mt-1 text-emerald-500">
                              <AnimatedCounter value={stats.overallRetentionRate} suffix="%" decimals={1} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-lg pb-lg">
                            <p className="text-[10px] text-outline font-bold">Target criteria benchmark is 92%</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Smart Insights Panel Section */}
                      {insights && insights.length > 0 && (
                        <Card className="border border-primary/25 bg-primary/2">
                          <CardHeader className="pb-2 border-b border-primary/10">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                              <CardTitle className="text-xs font-black uppercase text-primary">Smart AI BI Insights</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {insights.map((ins) => (
                                <div key={ins.id} className="flex gap-3 bg-surface-container-lowest/80 p-3.5 rounded-xl border border-outline-variant/40 hover:shadow-xs transition duration-150">
                                  {ins.type === 'danger' && <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                                  {ins.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />}
                                  {ins.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                                  {ins.type === 'info' && <Info className="h-5 w-5 text-blue-500 shrink-0" />}
                                  
                                  <div className="space-y-1 text-xs">
                                    <p className="font-semibold text-on-surface">{ins.text}</p>
                                    <span className="text-[9px] font-black uppercase text-outline bg-surface-container px-1.5 py-0.5 rounded leading-none">
                                      {ins.impact}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Main overall summaries and distributions */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Overall Risk Density Pie */}
                        {risk && (
                          <Card className="border border-outline-variant/60 shadow-xs">
                            <CardHeader>
                              <CardTitle className="text-xs font-black uppercase tracking-wider">Overall Risk Density Breakdown</CardTitle>
                              <CardDescription>Classified risk percentages evaluated by ML solver</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex flex-col md:flex-row items-center justify-between gap-4">
                              <div className="w-full h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={risk.riskDistribution}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={75}
                                      paddingAngle={3}
                                      dataKey="count"
                                      nameKey="level"
                                    >
                                      {(risk?.riskDistribution || []).map((entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={
                                            entry.level === 'Critical' ? '#8B5CF6' :
                                            entry.level === 'High' ? '#EF4444' :
                                            entry.level === 'Medium' ? '#F59E0B' : '#10B981'
                                          }
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} Students`, 'Count']} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="space-y-2 select-none w-full md:w-48 font-sans">
                                {(risk?.riskDistribution || []).map((item, index) => (
                                  <div key={`risk-level-${index}-${item.level}`} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                                      <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                          backgroundColor:
                                            item.level === 'Critical' ? '#8B5CF6' :
                                            item.level === 'High' ? '#EF4444' :
                                            item.level === 'Medium' ? '#F59E0B' : '#10B981'
                                        }}
                                      />
                                      {item.level} Risk
                                    </div>
                                    <span className="font-mono font-black text-primary">{item.count}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Average attendance trends over semesters */}
                        {attendance && (
                          <Card className="border border-outline-variant/60 shadow-xs">
                            <CardHeader>
                              <CardTitle className="text-xs font-black uppercase tracking-wider">Attendance Trajectory by Semester</CardTitle>
                              <CardDescription>Average attendance index comparison</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendance.semesterComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                  <XAxis dataKey="semester" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                                  <YAxis domain={[60, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                                  <Tooltip formatter={(value) => [`${value}%`, 'Average Attendance']} />
                                  <Bar dataKey="attendance" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={35}>
                                    {(attendance?.semesterComparison || []).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ==========================================================
                      TAB 2: Attendance Analytics (Trend, Subject, Heatmap, etc)
                      ========================================================== */}
                  {activeTab === 'attendance' && attendance && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Area Chart: Monthly attendance trend */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Monthly Attendance Trend</CardTitle>
                          <CardDescription>Aggregate monthly class engagement percentages</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendance.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis domain={[50, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Area type="monotone" dataKey="attendance" stroke="#10B981" fillOpacity={1} fill="url(#attGrad)" strokeWidth={2.5} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Bar Chart: Subject-wise attendance */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Subject-wise Average Attendance</CardTitle>
                          <CardDescription>Individual subject enrollment metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendance.subjectAttendance} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                              <XAxis type="number" domain={[40, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis dataKey="subject" type="category" stroke="#9CA3AF" fontSize={8} width={100} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="attendance" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Visual Heatmap component */}
                      <CustomVisualHeatmap
                        data={attendance.attendanceHeatmap as any}
                        title="Interactive Weekly Attendance Heatmap"
                        description="Correlation weights representing attendance rates per day over weeks"
                      />

                      {/* Attendance distribution count */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Attendance Bracket Distribution</CardTitle>
                          <CardDescription>Division of cohort across attendance brackets</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendance.attendanceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={35} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* ==========================================================
                      TAB 3: Academic Analytics (CGPA Performance & Support lists)
                      ========================================================== */}
                  {activeTab === 'academic' && academic && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* CGPA distribution Pie */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">CGPA Bracket Density</CardTitle>
                          <CardDescription>Academic grading profile segments across the cohort</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="w-full h-44">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={academic.cgpaDistribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={3}
                                  dataKey="count"
                                  nameKey="range"
                                >
                                  {(academic?.cgpaDistribution || []).map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} Students`, 'Count']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-1.5 select-none w-full md:w-48 font-sans">
                            {(academic?.cgpaDistribution || []).map((item, idx) => (
                              <div key={`cgpa-dist-${idx}-${item.range}`} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                  {item.range}
                                </div>
                                <span className="font-mono font-black text-primary">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Department Average CGPA performance */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Department Performance Indexes</CardTitle>
                          <CardDescription>Average grading comparisons across engineering departments</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={academic.departmentPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="department" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis domain={[5.0, 10.0]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="averageCgpa" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={35} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Marks & exams analysis */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Course Performance Matrices</CardTitle>
                          <CardDescription>Class averages vs Passing percentages</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={academic.marksAnalysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="subject" stroke="#9CA3AF" fontSize={8} tickLine={false} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Bar dataKey="classAverage" name="Class Avg Marks" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="passingRate" name="Passing Rate %" fill="#10B981" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Students Needing Support List */}
                      <Card className="border border-outline-variant/60 shadow-xs select-none">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-rose-500">Students Requiring Support triggers</CardTitle>
                          <CardDescription>Identified via cumulative SGPA & attendance warning levels</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto max-h-64">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-surface-container/50 sticky top-0">
                              <tr className="border-b border-outline-variant/30">
                                <th className="p-3 font-extrabold text-on-surface-variant">Name</th>
                                <th className="p-3 font-extrabold text-on-surface-variant text-center">CGPA</th>
                                <th className="p-3 font-extrabold text-on-surface-variant text-center">Attendance</th>
                                <th className="p-3 font-extrabold text-on-surface-variant text-right">Primary Cause</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                              {(academic?.studentsNeedingSupport || []).map((student, index) => (
                                <tr key={`support-student-${index}-${student.name}`} className="hover:bg-rose-500/5 transition duration-150">
                                  <td className="p-3 font-bold text-on-surface">{student.name}</td>
                                  <td className="p-3 font-mono text-center text-rose-500 font-extrabold">{student.cgpa}</td>
                                  <td className="p-3 font-mono text-center text-on-surface-variant">{student.attendance}%</td>
                                  <td className="p-3 text-right text-[10px] text-outline font-medium max-w-[150px] truncate">{student.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* ==========================================================
                      TAB 4: Dropout Risk Analytics (Distribution, stacked, etc)
                      ========================================================== */}
                  {activeTab === 'risk' && risk && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Stacked Bar Chart: Department-wise Risk */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Department-wise Risk Ratio</CardTitle>
                          <CardDescription>Risk category stacked comparison per branch</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={risk.deptRisk} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="department" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Bar dataKey="low" name="Low Risk" stackId="a" fill="#10B981" />
                              <Bar dataKey="medium" name="Medium Risk" stackId="a" fill="#F59E0B" />
                              <Bar dataKey="high" name="High Risk" stackId="a" fill="#EF4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Semester-wise Risk Grouped bar */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Semester-wise Risk Analysis</CardTitle>
                          <CardDescription>Risk profile comparative distribution across years</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={risk.semesterRisk} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="semester" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Bar dataKey="low" fill="#10B981" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="medium" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="high" fill="#EF4444" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Area Chart: Dropout risk trajectory weekly */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Continuous Risk score Index Trajectory</CardTitle>
                          <CardDescription>Aggregate risk score progression over academic weeks</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={risk.trendAnalysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="riskTrendGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Area type="monotone" dataKey="riskScore" stroke="#EF4444" fillOpacity={1} fill="url(#riskTrendGrad)" strokeWidth={2.5} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Styled Factor Impact Heatmap / Matrix */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Inference Features Attribution Heatmap</CardTitle>
                          <CardDescription>Risk weights contributing to predictions based on SHAP calculations</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto max-h-64">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-surface-container/50">
                              <tr className="border-b border-outline-variant/30">
                                <th className="p-3.5 font-extrabold text-on-surface-variant">Attribution Parameter</th>
                                <th className="p-3.5 font-extrabold text-on-surface-variant text-center">Influence Weight</th>
                                <th className="p-3.5 font-extrabold text-on-surface-variant text-right">Inference Impact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                              {(risk?.riskHeatmap || []).map((factor, index) => (
                                <tr key={`factor-${index}-${factor.factor}`} className="hover:bg-surface-container/15 transition duration-150">
                                  <td className="p-3.5 font-bold text-on-surface">{factor.factor}</td>
                                  <td className="p-3.5 text-center font-mono text-primary font-black">+{factor.riskWeight}%</td>
                                  <td className="p-3.5 text-right">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border leading-none ${
                                      factor.impactLevel === 'high' ? 'text-rose-500 bg-rose-500/10 border-rose-500/15' :
                                      factor.impactLevel === 'medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/15' :
                                      'text-emerald-500 bg-emerald-500/10 border-emerald-500/15'
                                    }`}>
                                      {factor.impactLevel} Impact
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* ==========================================================
                      TAB 5: Counseling Analytics (Conducted, complete, effectiveness)
                      ========================================================== */}
                  {activeTab === 'counseling' && counseling && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border border-outline-variant/50">
                          <CardHeader className="pb-1">
                            <CardDescription className="uppercase tracking-wider font-extrabold text-[9px] text-primary">Sessions Completed</CardDescription>
                            <CardTitle className="text-3xl font-black text-on-surface">
                              <AnimatedCounter value={counseling.sessionsCompleted} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-lg pb-lg">
                            <p className="text-[10px] text-outline font-bold">From {counseling.sessionsConducted} conducted meetings</p>
                          </CardContent>
                        </Card>

                        <Card className="border border-outline-variant/50">
                          <CardHeader className="pb-1">
                            <CardDescription className="uppercase tracking-wider font-extrabold text-[9px] text-emerald-500">Follow-up Success rate</CardDescription>
                            <CardTitle className="text-3xl font-black text-emerald-500">
                              <AnimatedCounter value={counseling.followUpSuccess} suffix="%" decimals={1} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-lg pb-lg">
                            <p className="text-[10px] text-outline font-bold">Correlation of positive academic transitions</p>
                          </CardContent>
                        </Card>

                        <Card className="border border-outline-variant/50">
                          <CardHeader className="pb-1">
                            <CardDescription className="uppercase tracking-wider font-extrabold text-[9px] text-purple-500">Effective Intervention Rate</CardDescription>
                            <CardTitle className="text-3xl font-black text-purple-500">85.4%</CardTitle>
                          </CardHeader>
                          <CardContent className="px-lg pb-lg">
                            <p className="text-[10px] text-outline font-bold">Assessed under multi-tier feedback metrics</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Radar Chart: Before vs After counseling effectiveness */}
                        <Card className="border border-outline-variant/60 shadow-xs">
                          <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-wider">Counseling Effectiveness Analysis</CardTitle>
                            <CardDescription>Multi-dimensional improvement comparison before & after session intervention</CardDescription>
                          </CardHeader>
                          <CardContent className="h-64 flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={counseling.counselingEffectiveness}>
                                <PolarGrid stroke="#E5E7EB" />
                                <PolarAngleAxis dataKey="category" stroke="#9CA3AF" fontSize={8} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" fontSize={8} />
                                <Radar name="Before Counseling" dataKey="before" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} />
                                <Radar name="After Counseling" dataKey="after" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 10 }} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Line Chart: Counseling Monthly trends */}
                        <Card className="border border-outline-variant/60 shadow-xs">
                          <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-wider">Monthly Intervention Sessions Trend</CardTitle>
                            <CardDescription>Dispensation of counselors work hour units per month</CardDescription>
                          </CardHeader>
                          <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={counseling.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="sessions" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* ==========================================================
                      TAB 6: Prediction Analytics (Validation, History, Accuracy)
                      ========================================================== */}
                  {activeTab === 'prediction' && prediction && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Prediction daily/weekly/monthly statistics info card */}
                      <Card className="border border-outline-variant/60 shadow-xs md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Model Inference Throughput stats</CardTitle>
                          <CardDescription>Computing capacity of predictive servers</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4 text-center select-none font-sans">
                          <div className="p-4 bg-surface-container/30 border border-outline-variant/30 rounded-xl">
                            <p className="text-[10px] font-black uppercase text-outline">Executed Today</p>
                            <h4 className="text-2xl font-black text-primary mt-1">{prediction.dailyPredictions}</h4>
                          </div>
                          <div className="p-4 bg-surface-container/30 border border-outline-variant/30 rounded-xl">
                            <p className="text-[10px] font-black uppercase text-outline">Executed This Week</p>
                            <h4 className="text-2xl font-black text-primary mt-1">{prediction.weeklyPredictions}</h4>
                          </div>
                          <div className="p-4 bg-surface-container/30 border border-outline-variant/30 rounded-xl">
                            <p className="text-[10px] font-black uppercase text-outline">Executed This Month</p>
                            <h4 className="text-2xl font-black text-primary mt-1">{prediction.monthlyPredictions}</h4>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Area Chart: Prediction History trend */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Daily Inference Ingestion Load</CardTitle>
                          <CardDescription>Number of active student predictions evaluated per day</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={prediction.predictionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="predHistoryGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Area type="monotone" dataKey="count" stroke="#3B82F6" fillOpacity={1} fill="url(#predHistoryGrad)" strokeWidth={2.5} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Line Chart: Model validation accuracy over time */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Model Training Loss & Accuracy epochs</CardTitle>
                          <CardDescription>Comparison of training accuracy vs cross-validation metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={prediction.modelAccuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis domain={[80, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Line type="monotone" dataKey="accuracy" name="Training Accuracy" stroke="#10B981" strokeWidth={2} />
                              <Line type="monotone" dataKey="validation" name="Validation Accuracy" stroke="#8B5CF6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Bar Chart: Model Confidence Distribution */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Inference Confidence score segments</CardTitle>
                          <CardDescription>Frequency of predictions falling within validation bounds</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prediction.confidenceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={35} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* ==========================================================
                      TAB 7: Comparative Analytics (Dept, Sem, Scatter correlations)
                      ========================================================== */}
                  {activeTab === 'comparative' && comparative && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Scatter Plot: Attendance vs CGPA */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Attendance vs CGPA correlation</CardTitle>
                          <CardDescription>Scatter correlation representing academic indicators</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[40, 100]} stroke="#9CA3AF" fontSize={10} />
                              <YAxis type="number" dataKey="cgpa" name="CGPA" unit="" domain={[3.0, 10.0]} stroke="#9CA3AF" fontSize={10} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Scatter name="Student Coordinates" data={comparative.attendanceVsCgpa} fill="#2563EB" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Scatter/Line Chart: CGPA vs Risk */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">CGPA vs Risk index correlation</CardTitle>
                          <CardDescription>Vulnerability index mapping against student GPA metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis type="number" dataKey="cgpa" name="CGPA" unit="" domain={[3.0, 10.0]} stroke="#9CA3AF" fontSize={10} />
                              <YAxis type="number" dataKey="riskScore" name="Risk Score" unit="%" domain={[0, 100]} stroke="#9CA3AF" fontSize={10} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Scatter name="Students Risk Profile" data={comparative.cgpaVsRisk} fill="#DC2626" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Scatter Plot: Attendance vs Risk */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Attendance vs Risk Index correlation</CardTitle>
                          <CardDescription>Vulnerability index mapping against attendance indexes</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[40, 100]} stroke="#9CA3AF" fontSize={10} />
                              <YAxis type="number" dataKey="riskScore" name="Risk Score" unit="%" domain={[0, 100]} stroke="#9CA3AF" fontSize={10} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Scatter name="Students Risk Profile" data={comparative.attendanceVsRisk} fill="#F59E0B" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Bar/Area: Counseling sessions vs academic improvement */}
                      <Card className="border border-outline-variant/60 shadow-xs">
                        <CardHeader>
                          <CardTitle className="text-xs font-black uppercase tracking-wider">Counseling Sessions vs Improvement indexes</CardTitle>
                          <CardDescription>Correlation of academic & attendance gains per session weight</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparative.counselingVsImprovement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="sessions" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Bar dataKey="academicGain" name="GPA Gain Factor" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="attendanceGain" name="Attendance Gain %" fill="#10B981" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
