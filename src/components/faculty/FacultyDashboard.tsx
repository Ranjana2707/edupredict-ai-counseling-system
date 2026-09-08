import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Calendar,
  FileText,
  UserCheck,
  Briefcase,
  Bell,
  Sparkles,
  FileSpreadsheet,
  PlusCircle,
  FileDown,
  ChevronRight,
  ArrowRight,
  Activity,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { getRiskColorClass } from '../../utils';
import {
  useFacultyProfile,
  useFacultyStats,
  useFacultyStudents,
  useFacultyNotifications,
  useMarkFacultyNotificationRead,
  useGenerateReport
} from '../../hooks/useFacultyData';
import { UploadDialog } from './UploadDialog';
import { CreateAssignmentDialog } from './CreateAssignmentDialog';
import { StudentDetailsDrawer } from './StudentDetailsDrawer';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';

export function FacultyDashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: profile } = useFacultyProfile();
  const { data: stats } = useFacultyStats();
  const { data: students } = useFacultyStudents();
  const { data: notifications } = useFacultyNotifications();

  const markReadMutation = useMarkFacultyNotificationRead();
  const generateReportMutation = useGenerateReport();

  if (!profile || !stats || !students) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <div className="h-10 bg-surface-container animate-pulse rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-surface-container animate-pulse rounded-lg" />
          <div className="h-96 bg-surface-container animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Risk Level Category distribution chart
  const riskDistributionData = [
    { name: 'Low Risk', value: stats.lowRiskStudents, color: '#10B981' },
    { name: 'Medium Risk', value: stats.mediumRiskStudents, color: '#F59E0B' },
    { name: 'High & Critical', value: stats.highRiskStudents, color: '#EF4444' }
  ];

  // Department Attendance average bar chart
  const attendanceDeptData = [
    { name: 'Comp Sci', Attendance: 82.5 },
    { name: 'Info Tech', Attendance: 78.0 },
    { name: 'Elec Eng', Attendance: 74.2 },
    { name: 'Mech Eng', Attendance: 71.0 }
  ];

  const handleNotificationClick = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleGenerateReport = (type: 'student' | 'attendance' | 'marks' | 'risk') => {
    generateReportMutation.mutate(type);
  };

  return (
    <div className="space-y-6">
      {/* Faculty Profile Hero Card */}
      <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 h-36 w-36 rounded-full bg-primary/5 blur-xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-14 w-14 rounded-full object-cover border-2 border-primary/20 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-lg font-black text-on-surface">{profile.name}</h2>
                <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/15">
                  Faculty
                </span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant font-medium">
                {profile.designation} • {profile.department}
              </p>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {profile.subjectsTaught.map((subj, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[9px] font-extrabold bg-surface-container px-2 py-0.5 rounded text-on-surface border border-outline-variant/30"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Summary Banner */}
          <div className="flex gap-4 md:border-l border-outline-variant/60 md:pl-6 select-none">
            <div className="text-center md:text-left">
              <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Average Attendance</span>
              <span className="block font-sans text-xl font-black text-on-surface mt-1">{stats.averageAttendance}%</span>
            </div>
            <div className="text-center md:text-left border-l border-outline-variant/30 pl-4">
              <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Average CGPA</span>
              <span className="block font-sans text-xl font-black text-on-surface mt-1">{stats.averageCgpa}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort KPIs Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-l-4 border-l-primary">
          <CardHeader className="pb-1.5 p-lg">
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-on-surface-variant">
              Total Enrolled Cohort
            </CardDescription>
            <div className="flex items-baseline justify-between mt-1">
              <CardTitle className="text-3xl font-black">{stats.totalStudents}</CardTitle>
              <Users className="h-5 w-5 text-primary/60" />
            </div>
          </CardHeader>
          <CardContent className="px-lg pb-lg text-[10px] text-on-surface-variant font-semibold">
            Real-time active telemetry index
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-1.5 p-lg">
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-rose-600 dark:text-rose-400">
              High Risk Students
            </CardDescription>
            <div className="flex items-baseline justify-between mt-1">
              <CardTitle className="text-3xl font-black text-rose-600">{stats.highRiskStudents}</CardTitle>
              <AlertTriangle className="h-5 w-5 text-rose-500/60" />
            </div>
          </CardHeader>
          <CardContent className="px-lg pb-lg text-[10px] text-rose-600/90 font-bold uppercase">
            Awaiting physical counselling
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-1.5 p-lg">
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-amber-600 dark:text-amber-400">
              Medium Risk Students
            </CardDescription>
            <div className="flex items-baseline justify-between mt-1">
              <CardTitle className="text-3xl font-black text-amber-500">{stats.mediumRiskStudents}</CardTitle>
              <Activity className="h-5 w-5 text-amber-500/60" />
            </div>
          </CardHeader>
          <CardContent className="px-lg pb-lg text-[10px] text-amber-600/90 font-semibold">
            Monitored attendance alerts
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-1.5 p-lg">
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-emerald-600 dark:text-emerald-400">
              Low Risk Students
            </CardDescription>
            <div className="flex items-baseline justify-between mt-1">
              <CardTitle className="text-3xl font-black text-emerald-600">{stats.lowRiskStudents}</CardTitle>
              <UserCheck className="h-5 w-5 text-emerald-500/60" />
            </div>
          </CardHeader>
          <CardContent className="px-lg pb-lg text-[10px] text-emerald-600/90 font-semibold">
            Passing baseline indicators
          </CardContent>
        </Card>
      </div>

      {/* Main Multi-Column Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Columns (Analytics and Table) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Distribution Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-extrabold uppercase">Risk Distribution Factor</CardTitle>
                <CardDescription>Breakdown of dropout prediction probabilities</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Statistics Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-extrabold uppercase">Department Performance</CardTitle>
                <CardDescription>Average attendance trends by branch</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceDeptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="Attendance" fill="#0062FF" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Predictions Ledger */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-extrabold uppercase">Recent Cohort Predictions</CardTitle>
                  <CardDescription>Real-time machine learning prediction results</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="text-xs font-bold" onClick={() => (window.location.hash = '#/students')}>
                  View All Directory <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-container/60 border-b border-outline-variant/50">
                    <tr>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant">Student</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant">CGPA</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Attendance</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Risk Level</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {students.slice(0, 4).map((student) => (
                      <tr key={student.id} className="hover:bg-surface-container/40 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center">
                              {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                            </div>
                            <div>
                              <p className="font-sans font-bold text-on-surface">{student.name}</p>
                              <p className="font-sans text-[10px] text-on-surface-variant">ID: {student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium">{student.cgpa}</td>
                        <td className="p-4 text-center font-mono">{student.attendance}%</td>
                        <td className="p-4 text-center">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getRiskColorClass(student.riskLevel)}`}>
                            {student.riskLevel}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                            className="h-8 px-2.5 text-[11px] font-bold text-primary"
                          >
                            Assess Risk
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Quick Actions & Notifications) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-extrabold uppercase">Quick Enterprise Console</CardTitle>
              <CardDescription>Instant administrative actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 p-lg pt-0">
              <Button onClick={() => setIsAssignmentOpen(true)} className="w-full h-10 text-xs font-bold justify-start gap-2.5">
                <PlusCircle className="h-4.5 w-4.5" />
                Publish Custom Assignment
              </Button>
              <Button onClick={() => setIsUploadOpen(true)} variant="outline" className="w-full h-10 text-xs font-bold justify-start gap-2.5">
                <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
                Import Student CSV Cohort
              </Button>

              {/* Reports Download Menu Dropdown */}
              <div className="border-t border-outline-variant/35 pt-3.5 space-y-1.5">
                <p className="font-sans text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider select-none">
                  Compile Comprehensive Reports
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleGenerateReport('student')}
                    variant="ghost"
                    className="h-9 text-[10px] bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 font-bold"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" /> Student Report
                  </Button>
                  <Button
                    onClick={() => handleGenerateReport('attendance')}
                    variant="ghost"
                    className="h-9 text-[10px] bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 font-bold"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" /> Attendance
                  </Button>
                  <Button
                    onClick={() => handleGenerateReport('marks')}
                    variant="ghost"
                    className="h-9 text-[10px] bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 font-bold"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" /> Marks Report
                  </Button>
                  <Button
                    onClick={() => handleGenerateReport('risk')}
                    variant="ghost"
                    className="h-9 text-[10px] bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 font-bold"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" /> Risk Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Interactive Notifications Panel */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-primary animate-pulse" />
                  <CardTitle className="text-sm font-extrabold uppercase">Risk Alerts & Logs</CardTitle>
                </div>
                <span className="font-mono text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                  {notifications?.filter((n) => !n.isRead).length || 0} Unread
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-outline-variant/30 max-h-[350px] overflow-y-auto">
                {notifications?.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`p-lg flex items-start gap-3 cursor-pointer transition ${
                      notif.isRead ? 'opacity-65 hover:bg-surface-container/20' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-500 mt-2 shrink-0 animate-pulse" style={{ opacity: notif.isRead ? 0 : 1 }} />
                    <div className="space-y-1">
                      <p className="font-sans text-xs font-bold text-on-surface leading-tight">{notif.title}</p>
                      <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">{notif.message}</p>
                      <span className="font-mono text-[8px] text-on-surface-variant block mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs and Slide-out Drawers */}
      <UploadDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <CreateAssignmentDialog isOpen={isAssignmentOpen} onClose={() => setIsAssignmentOpen(false)} />
      <StudentDetailsDrawer
        student={selectedStudent}
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
export default FacultyDashboard;
