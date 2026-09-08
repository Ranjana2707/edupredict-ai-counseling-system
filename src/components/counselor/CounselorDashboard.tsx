import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Bell,
  Check,
  Building,
  Bookmark,
  CalendarCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  useCounselorStats,
  useCounselorSessions,
  useCounselorNotifications,
  useMarkCounselorNotificationRead
} from '../../hooks/useCounselorData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CounselorDashboardProps {
  onNavigateToTab: (tab: 'students' | 'counseling' | 'recommendations' | 'calendar' | 'followup' | 'reports') => void;
  onSelectStudentId?: (id: string) => void;
}

export function CounselorDashboard({ onNavigateToTab, onSelectStudentId }: CounselorDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useCounselorStats();
  const { data: sessions, isLoading: sessionsLoading } = useCounselorSessions();
  const { data: notifications } = useCounselorNotifications();
  const markReadMutation = useMarkCounselorNotificationRead();

  // Recharts Monthly Counseling Load data
  const monthlyStatsData = [
    { name: 'Feb', completed: 12, cancelled: 1, upcoming: 0 },
    { name: 'Mar', completed: 18, cancelled: 2, upcoming: 0 },
    { name: 'Apr', completed: 25, cancelled: 4, upcoming: 0 },
    { name: 'May', completed: 22, cancelled: 1, upcoming: 0 },
    { name: 'Jun', completed: 30, cancelled: 3, upcoming: 2 },
    { name: 'Jul', completed: 28, cancelled: 2, upcoming: 8 },
  ];

  // Recharts Risk Distribution Category
  const riskDistributionData = [
    { name: 'Critical Risk', value: 2, color: '#EF4444' }, // red
    { name: 'High Risk', value: 8, color: '#F59E0B' },    // orange
    { name: 'Medium Risk', value: 14, color: '#3B82F6' },  // blue
    { name: 'Low Risk', value: 32, color: '#10B981' },     // emerald
  ];

  // Recharts Counseling Session types
  const sessionTypesData = [
    { name: 'Academic support', value: 14, fill: '#6366F1' },
    { name: 'Psychological counseling', value: 10, fill: '#EC4899' },
    { name: 'Financial guidance', value: 6, fill: '#10B981' },
    { name: 'Attendance improvement', value: 8, fill: '#F59E0B' },
  ];

  const todaySessions = sessions?.filter(s => s.date === '2026-07-12' || s.status === 'upcoming').slice(0, 3) || [];
  const unreadNotifications = notifications?.filter(n => !n.isRead).slice(0, 4) || [];

  if (statsLoading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface-container animate-pulse rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface-container animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-surface-container animate-pulse rounded-xl" />
          <div className="h-80 bg-surface-container animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Assigned */}
        <Card hoverable className="cursor-pointer" onClick={() => onNavigateToTab('students')}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Assigned Students</span>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="text-2xl font-black">{stats?.totalAssigned || 0}</h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">Direct intervention cohort</p>
          </CardContent>
        </Card>

        {/* High & Critical Risk */}
        <Card hoverable className="cursor-pointer border-rose-500/20 bg-rose-500/5" onClick={() => onNavigateToTab('students')}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400 tracking-wider">High & Critical</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats?.highRiskCount || 0}</h3>
            <p className="text-[10px] text-rose-500/80 font-medium mt-1">Requires immediate support</p>
          </CardContent>
        </Card>

        {/* Medium Risk */}
        <Card hoverable className="cursor-pointer border-amber-500/20 bg-amber-500/5" onClick={() => onNavigateToTab('students')}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider">Medium Risk</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats?.mediumRiskCount || 0}</h3>
            <p className="text-[10px] text-amber-500/80 font-medium mt-1">Continuous progress monitoring</p>
          </CardContent>
        </Card>

        {/* Sessions Today */}
        <Card hoverable className="cursor-pointer" onClick={() => onNavigateToTab('calendar')}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-secondary tracking-wider">Sessions Today</span>
            <CalendarCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="text-2xl font-black">{stats?.sessionsTodayCount || 0}</h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">Active schedule entries</p>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card hoverable className="cursor-pointer" onClick={() => onNavigateToTab('calendar')}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-tertiary tracking-wider">Upcoming Scheduled</span>
            <Calendar className="h-4 w-4 text-tertiary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="text-2xl font-black">{stats?.upcomingSessionsCount || 0}</h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">Planned dialogues ahead</p>
          </CardContent>
        </Card>

        {/* Pending Follow-ups */}
        <Card hoverable className="cursor-pointer border-indigo-500/20 bg-indigo-500/5" onClick={() => onNavigateToTab('followup')}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Pending Action</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats?.pendingFollowupsCount || 0}</h3>
            <p className="text-[10px] text-indigo-500/80 font-medium mt-1">Follow-up checklists</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Session Volume Statistics */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider">Intervention & Session Volume</CardTitle>
                <CardDescription>Monthly counseling loads categorized by outcome</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-lg">
                <span className="text-[10px] font-extrabold uppercase px-2 text-on-surface">Active Term: Jul 2026</span>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip wrapperStyle={{ fontSize: 11 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="completed" name="Completed Sessions" fill="#10B981" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="upcoming" name="Scheduled" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Student Progress Overview */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-wider">Cohort Risk Dispersion</CardTitle>
              <CardDescription>Academic, financial & health threat density</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-lg pt-0 h-80">
              <div className="w-full h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-on-surface">56</span>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase">Total Assessed</span>
                </div>
              </div>

              {/* Legend with values */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 text-xs font-semibold">
                {riskDistributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-[90px]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-on-surface-variant text-[11px] truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-on-surface">{item.value} students</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Secondary Row: Active Sessions Queue and Critical Real-time Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Dialog Queue */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider">Today's & Upcoming Sessions Queue</CardTitle>
                <CardDescription>Scheduled support, biometric checks, and clinical dialogue timelines</CardDescription>
              </div>
              <Button onClick={() => onNavigateToTab('calendar')} variant="ghost" size="sm" className="text-xs font-bold gap-1 text-primary">
                View Calendar <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-outline-variant/30">
                {todaySessions.length > 0 ? (
                  todaySessions.map((session) => (
                    <div key={session.id} className="p-4 flex items-start gap-3.5 hover:bg-surface-container/25 transition">
                      <div className="h-10 w-10 rounded-full bg-surface-container border border-outline-variant/60 flex items-center justify-center shrink-0 font-bold overflow-hidden">
                        {session.studentAvatar ? (
                          <img src={session.studentAvatar} alt={session.studentName} className="h-full w-full object-cover" />
                        ) : (
                          session.studentName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-sans text-xs font-bold text-on-surface hover:underline cursor-pointer" onClick={() => {
                            if (onSelectStudentId) onSelectStudentId(session.studentId);
                            onNavigateToTab('students');
                          }}>
                            {session.studentName}
                          </h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            session.status === 'upcoming' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-on-surface-variant font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.time} ({session.duration}m)</span>
                          <span className="capitalize px-1.5 py-0.2 rounded bg-surface-container font-semibold border border-outline-variant/30">{session.type} counseling</span>
                          <span className="font-mono text-[9px] text-primary bg-primary/5 px-1.5 rounded">{session.date}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-normal leading-relaxed truncate max-w-[450px]">
                          {session.notes}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-on-surface-variant">
                    No scheduled sessions pending on queue today.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High Risk Alerts & Counselor Notifications */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider">Predictive Alerts & Core Messages</CardTitle>
                <CardDescription>Real-time machine learning threat and administrative dispatches</CardDescription>
              </div>
              <Bell className="h-4 w-4 text-rose-500 shrink-0" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-outline-variant/30">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notif) => (
                    <div key={notif.id} className="p-4 space-y-1.5 hover:bg-surface-container/25 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${
                            notif.type === 'high_risk' ? 'bg-rose-500 animate-pulse' :
                            notif.type === 'session_reminder' ? 'bg-blue-500' : 'bg-amber-500'
                          }`} />
                          <h4 className="font-sans text-xs font-black text-on-surface leading-tight">{notif.title}</h4>
                        </div>
                        <Button
                          onClick={() => markReadMutation.mutate(notif.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-primary/10 rounded-full"
                        >
                          <Check className="h-3 w-3 text-primary" />
                        </Button>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex justify-between items-center text-[9px] text-on-surface-variant/80 font-bold uppercase tracking-wider">
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="bg-surface-container px-1.5 py-0.5 rounded">{notif.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-on-surface-variant">
                    All notifications cleared! Excellent system monitoring.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Counselor Co-pilot recommendation box */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-lg flex flex-col md:flex-row items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-sans text-xs font-black text-primary uppercase select-none tracking-wider">AI Counselor Assistant Co-Pilot</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Based on Week 10 academic and behavioral telemetry matrices, <strong>2 students in your cohort</strong> (Neha Sen, Priyanka Nair) are showing a risk score acceleration &gt; 15% in Theory of Computation. Recommended to schedule bi-weekly psychological intervention sessions and propose tailored financial scholarship protection.
            </p>
          </div>
          <Button onClick={() => onNavigateToTab('recommendations')} size="sm" className="h-9 text-xs font-bold gap-1.5 shrink-0">
            Explore AI Suggestions <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
