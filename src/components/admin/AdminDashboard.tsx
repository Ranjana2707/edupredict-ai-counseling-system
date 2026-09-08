import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Cpu,
  Database,
  TrendingUp,
  Activity,
  AlertTriangle,
  Server,
  HardDrive,
  CheckCircle,
  Clock,
  Bell,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAdminStats, useSystemLogs, useAdminNotifications } from '../../hooks/useAdminData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const RISK_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#DC2626']; // Low, Medium, High, Critical

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: logs, isLoading: logsLoading } = useSystemLogs();
  const { data: notifications, isLoading: notificationsLoading } = useAdminNotifications();
  const [activeChartGroup, setActiveChartGroup] = useState<'academic' | 'prediction' | 'retention' | 'faculty'>('academic');

  if (statsLoading || logsLoading || notificationsLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-surface-container rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-surface-container rounded-xl animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-surface-container rounded-xl animate-pulse" />
          <div className="h-80 bg-surface-container rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // --- MOCK CHART DATA ---
  const studentsByDeptData = [
    { name: 'Comp Sci', students: 24, highRisk: 4 },
    { name: 'Electrical', students: 18, highRisk: 1 },
    { name: 'Mechanical', students: 8, highRisk: 0 },
    { name: 'Business Admin', students: 6, highRisk: 0 }
  ];

  const studentsBySemesterData = [
    { name: '1st Sem', students: 45 },
    { name: '2nd Sem', students: 42 },
    { name: '3rd Sem', students: 38 },
    { name: '4th Sem', students: 35 },
    { name: '5th Sem', students: 32 },
    { name: '6th Sem', students: 28 }
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: stats.lowRiskCount },
    { name: 'Medium Risk', value: stats.mediumRiskCount },
    { name: 'High Risk', value: stats.highRiskCount },
    { name: 'Critical Threat', value: 1 } // Simulated critical
  ];

  const attendanceOverviewData = [
    { name: '90-100%', count: 20 },
    { name: '80-89%', count: 15 },
    { name: '70-79%', count: 10 },
    { name: '60-69%', count: 6 },
    { name: '<60%', count: 5 }
  ];

  const predictionTrendData = [
    { week: 'Week 2', accuracy: 89.5, highRiskFlags: 2 },
    { week: 'Week 4', accuracy: 91.2, highRiskFlags: 3 },
    { week: 'Week 6', accuracy: 93.0, highRiskFlags: 4 },
    { week: 'Week 8', accuracy: 94.1, highRiskFlags: 5 },
    { week: 'Week 10', accuracy: stats.predictionAccuracy, highRiskFlags: 5 }
  ];

  const retentionRateData = [
    { year: '2022', rate: 86.4 },
    { year: '2023', rate: 88.1 },
    { year: '2024', rate: 89.5 },
    { year: '2025', rate: 91.2 },
    { year: '2026 (Target)', rate: 92.5 }
  ];

  const facultyWorkloadData = [
    { name: 'Prof. Richard', studentsTracked: 12, flagsRaised: 3 },
    { name: 'Prof. Alan', studentsTracked: 15, flagsRaised: 4 },
    { name: 'Dr. Nikola', studentsTracked: 8, flagsRaised: 1 },
    { name: 'Dr. James', studentsTracked: 6, flagsRaised: 2 }
  ];

  const counselingStatsData = [
    { subject: 'Academic Help', A: 85, fullMark: 100 },
    { subject: 'Financial Installments', A: 70, fullMark: 100 },
    { subject: 'Medical Leaves', A: 50, fullMark: 100 },
    { subject: 'Mental Health Intake', A: 90, fullMark: 100 },
    { subject: 'Attendance Warning', A: 75, fullMark: 100 }
  ];

  // Helper log color
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-rose-500/10 text-rose-600 border-rose-500/15';
      case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-500/15';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/15';
    }
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Central Command telemetry</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Real-time indicators, cloud database integrity, and retention success charts.</p>
        </div>
        <Button
          onClick={() => {
            refetchStats();
            toast.success('System telemetry indicators refetched.');
          }}
          variant="outline"
          size="sm"
          className="text-xs font-bold gap-2 self-start sm:self-auto h-9 border-outline-variant/60"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
        </Button>
      </div>

      {/* Grid Status Indicators (12 columns structure) */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <Card className="p-4 flex flex-col justify-between hover:border-primary/20 transition cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Total Students</span>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-on-surface">{stats.totalStudents}</h4>
            <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">Active Cohorts</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between hover:border-primary/20 transition cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Total Faculty</span>
            <GraduationCap className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-on-surface">{stats.totalFaculty}</h4>
            <p className="text-[10px] text-on-surface-variant/80 font-bold mt-1 uppercase">Assigned Mentors</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between hover:border-primary/20 transition cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Counselors</span>
            <ShieldCheck className="h-5 w-5 text-tertiary" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-on-surface">{stats.totalCounselors}</h4>
            <p className="text-[10px] text-on-surface-variant/80 font-bold mt-1 uppercase">Wellness Officers</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between hover:border-primary/20 transition cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Active Users</span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-on-surface">{stats.activeUsersCount}</h4>
            <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">Online Session Logs</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between hover:border-primary/20 transition cursor-default col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Accuracy</span>
            <Award className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-on-surface">{stats.predictionAccuracy}%</h4>
            <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase">XGBoost prediction</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between hover:border-primary/20 transition cursor-default col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Cloud Engine</span>
            <Server className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-black text-on-surface uppercase flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> {stats.serverStatus}
            </h4>
            <p className="text-[10px] text-on-surface-variant/80 font-bold mt-1 uppercase">Uptime: {stats.serverUptime}</p>
          </div>
        </Card>
      </div>

      {/* Cloud DB & Storage Details Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-surface-container/20 border-outline-variant/30">
          <div className="p-4 flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-0.5 text-xs">
              <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider block">Firestore Database</span>
              <p className="font-extrabold text-on-surface flex items-center gap-1.5 uppercase">
                Status: Connected <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-container/20 border-outline-variant/30">
          <div className="p-4 flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <HardDrive className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-0.5 text-xs">
              <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider block">Storage Allocated</span>
              <p className="font-extrabold text-on-surface uppercase">{stats.storageUsageGb} GB / 100 GB (32.4%)</p>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-container/20 border-outline-variant/30 sm:col-span-2 lg:col-span-1">
          <div className="p-4 flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-0.5 text-xs">
              <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider block">Risk Threshold Alerts</span>
              <p className="font-extrabold text-rose-500 uppercase">{stats.highRiskCount} Students in Critical Zone</p>
            </div>
          </div>
        </Card>
      </div>

      {/* DASHBOARD ANALYTICS PANEL */}
      <Card className="border-outline-variant/60 shadow-sm">
        <CardHeader className="border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-lg">
          <div>
            <span className="text-[10px] font-black text-primary tracking-widest uppercase">Visual Insights</span>
            <CardTitle className="text-sm font-black text-on-surface uppercase mt-0.5">Enterprise Dashboard Analytics</CardTitle>
          </div>

          {/* Quick tab switchers */}
          <div className="flex bg-surface-container p-1 rounded-lg gap-1 border border-outline-variant/30 select-none overflow-x-auto">
            {[
              { id: 'academic', label: 'Enrollment' },
              { id: 'prediction', label: 'Predictions' },
              { id: 'retention', label: 'Engagement' },
              { id: 'faculty', label: 'Staff Metrics' }
            ].map(group => (
              <button
                key={group.id}
                onClick={() => setActiveChartGroup(group.id as any)}
                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-md transition shrink-0 cursor-pointer ${
                  activeChartGroup === group.id
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Block 1 */}
            {activeChartGroup === 'academic' && (
              <>
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Students by Department</h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentsByDeptData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--color-outline-variant), 0.15)" />
                        <XAxis dataKey="name" stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Bar name="Total Registered" dataKey="students" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar name="High Dropout Risk" dataKey="highRisk" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Students by Semester Distribution</h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studentsBySemesterData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-outline-variant), 0.15)" />
                        <XAxis dataKey="name" stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Area name="Cohort Students" type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudents)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Chart Block 2 */}
            {activeChartGroup === 'prediction' && (
              <>
                <div className="space-y-3 flex flex-col justify-between">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Risk Level Distribution Density</h4>
                  <div className="h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {riskDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">FastAPI ML Accuracy & Threat Flags Timeline</h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={predictionTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="week" stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-outline-variant), 0.15)" />
                        <Area name="Model Accuracy (%)" type="monotone" dataKey="accuracy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.15} strokeWidth={2} />
                        <Area name="Critical Flags Raised" type="monotone" dataKey="highRiskFlags" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Chart Block 3 */}
            {activeChartGroup === 'retention' && (
              <>
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Attendance Bracket Spread</h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceOverviewData} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(var(--color-outline-variant), 0.15)" />
                        <XAxis type="number" stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <YAxis dataKey="name" type="category" stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Bar name="Total Students" dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Annual Institutional Retention Success Trajectory</h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={retentionRateData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-outline-variant), 0.15)" />
                        <XAxis dataKey="year" stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Line name="Retention Rate (%)" type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Chart Block 4 */}
            {activeChartGroup === 'faculty' && (
              <>
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Faculty Active Workload & Risk Triggers</h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={facultyWorkloadData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-outline-variant), 0.15)" />
                        <XAxis dataKey="name" stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="rgba(var(--color-on-surface-variant), 0.6)" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Bar name="Students Tracked" dataKey="studentsTracked" fill="#4B5563" radius={[4, 4, 0, 0]} />
                        <Bar name="High-Risk Escaped Warnings" dataKey="flagsRaised" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Counseling Support Categories (Intensive Study)</h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={counselingStatsData}>
                        <PolarGrid stroke="rgba(var(--color-outline-variant), 0.3)" />
                        <PolarAngleAxis dataKey="subject" stroke="rgba(var(--color-on-surface-variant), 0.8)" fontSize={9} fontWeight="bold" />
                        <PolarRadiusAxis stroke="rgba(var(--color-on-surface-variant), 0.4)" fontSize={9} />
                        <Radar name="Active Cases" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.25} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RECENT ACTIVITIES & SYSTEM ALERTS PANEL */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Recent Audit Timeline */}
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 flex flex-row items-center justify-between p-lg">
              <div>
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block">Security Trails</span>
                <CardTitle className="text-xs font-black text-on-surface uppercase">Live Central Audit Log</CardTitle>
              </div>
              <Cpu className="h-4.5 w-4.5 text-on-surface-variant/70 animate-spin-slow" />
            </CardHeader>
            <CardContent className="p-lg space-y-4">
              <div className="relative border-l-2 border-outline-variant pl-4 ml-2 space-y-5">
                {logs.slice(0, 4).map((log) => (
                  <div key={log.id} className="relative">
                    {/* Circle bullet node */}
                    <span className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-surface-container-lowest bg-primary flex items-center justify-center shadow-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-surface-container-lowest" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-on-surface">{log.user}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityBadge(log.severity)}`}>
                          {log.type}
                        </span>
                        <span className="text-[9px] text-on-surface-variant/80 font-bold ml-auto uppercase tracking-wider flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] font-semibold text-on-surface-variant leading-relaxed">
                        {log.message}
                      </p>
                      {log.details && (
                        <p className="font-mono text-[9px] bg-surface-container-low text-on-surface-variant/90 p-1.5 rounded leading-normal border border-outline-variant/30">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications list summary */}
        <div className="md:col-span-5">
          <Card className="h-full">
            <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 flex flex-row items-center justify-between p-lg">
              <div>
                <span className="text-[9px] font-black uppercase text-secondary tracking-widest block">Central Alerts</span>
                <CardTitle className="text-xs font-black text-on-surface uppercase">Active Broadcast Board</CardTitle>
              </div>
              <Bell className="h-4.5 w-4.5 text-on-surface-variant/70 shrink-0" />
            </CardHeader>
            <CardContent className="p-lg space-y-3.5">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/60 space-y-1.5 hover:border-secondary/20 transition text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-sans font-black text-on-surface uppercase text-[11px] truncate">{notif.title}</h5>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/10">
                        {notif.channel}
                      </span>
                    </div>
                    <p className="font-sans text-[11px] leading-relaxed font-semibold text-on-surface-variant">
                      {notif.message}
                    </p>
                    <div className="text-[9px] text-on-surface-variant/80 font-bold uppercase tracking-wider flex items-center justify-between pt-1 select-none">
                      <span>Recipient: {notif.type === 'broadcast' ? 'All Roles' : notif.targetRole || 'Single User'}</span>
                      <span>{new Date(notif.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-on-surface-variant">
                  <CheckCircle className="h-8 w-8 mx-auto text-on-surface-variant/30" />
                  <p className="text-xs mt-2 font-bold uppercase tracking-wider">Alert board cleared</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
