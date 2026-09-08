import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Award,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Bell,
  CheckCircle2,
  CalendarDays,
  FileText,
  Compass
} from 'lucide-react';
import {
  useStudentProfile,
  useStudentAttendance,
  useStudentAcademics,
  useStudentRiskAnalysis,
  useStudentCounseling,
  useStudentNotifications
} from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { StudentRiskCard } from '../../components/analytics/StudentRiskCard';

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Queries
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: attendance, isLoading: attendanceLoading } = useStudentAttendance();
  const { data: academics, isLoading: academicsLoading } = useStudentAcademics();
  const { data: risk, isLoading: riskLoading } = useStudentRiskAnalysis();
  const { data: counseling, isLoading: counselingLoading } = useStudentCounseling();
  const { data: notifications, isLoading: notificationsLoading } = useStudentNotifications();

  const isLoading =
    profileLoading ||
    attendanceLoading ||
    academicsLoading ||
    riskLoading ||
    counselingLoading ||
    notificationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse bg-surface-container-highest/40 rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <CardSkeleton />
          </div>
          <div>
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Get first upcoming session
  const nextSession = counseling?.find((s) => s.status === 'Confirmed');

  // Unread notifications
  const unreadAlerts = notifications?.filter((n) => !n.isRead).slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. Welcome Card (Premium Hero Layout with integrated Profile details) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-secondary/5 to-surface-container-lowest p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
          <GraduationCap className="h-48 w-48 text-primary" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-sans text-[10px] font-extrabold uppercase tracking-wider text-primary border border-primary/20">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            Academic Advisory Portal
          </div>
          <div className="space-y-1.5">
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Welcome back, {profile?.name}
            </h2>
            <p className="font-sans text-xs md:text-sm text-on-surface-variant font-medium">
              {profile?.department} &bull; {profile?.semester} &bull; Student ID: <span className="font-mono">{profile?.id}</span>
            </p>
          </div>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-2xl font-normal">
            Review your personalized academic progress, lecture attendance metrics, and priority standing indicators below. Engage with advisor recommendations or schedule active dialogue sessions to optimize your performance margins.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="sm" onClick={() => navigate('/student/recommendations')} className="font-bold shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              View Study Suggestions
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/student/counseling')} className="font-bold">
              <CalendarDays className="h-3.5 w-3.5" />
              Schedule Advisor Check-In
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Grid: 4 Core Mini cards (Attendance, CGPA, Risk, Dropout Probability) - Symmetrical & Clean */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance Percentage Card */}
        <motion.div whileHover={{ y: -2 }} className="transition-all duration-200">
          <Card hoverable className="h-full border-t-4 border-t-amber-500 flex flex-col justify-between shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-widest font-black text-[9px] text-amber-600 dark:text-amber-400">
                Attendance Standing
              </CardDescription>
              <CardTitle className="text-3xl font-black mt-1 flex items-baseline gap-2 text-on-surface">
                {profile?.overallAttendance}%
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  (Below Target)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed font-normal">
                  Your cumulative attendance metric has slipped below the 75% required university threshold.
                </p>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${profile?.overallAttendance}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => navigate('/student/attendance')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dim transition hover:underline self-start cursor-pointer"
              >
                Subject breakdown <ArrowRight className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current CGPA Card */}
        <motion.div whileHover={{ y: -2 }} className="transition-all duration-200">
          <Card hoverable className="h-full border-t-4 border-t-emerald-500 flex flex-col justify-between shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-widest font-black text-[9px] text-emerald-600 dark:text-emerald-400">
                Cumulative CGPA
              </CardDescription>
              <CardTitle className="text-3xl font-black mt-1 flex items-baseline gap-1 text-on-surface">
                {profile?.cgpa}
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-normal">
                  / 10.00
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed font-normal">
                  Excellent academic stability. Your records place you within the top quarter of your engineering cohort.
                </p>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(profile?.cgpa || 0) * 10}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => navigate('/student/academic')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dim transition hover:underline self-start cursor-pointer"
              >
                Grade progression <ArrowRight className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Academic Advisory Standing Card */}
        <motion.div whileHover={{ y: -2 }} className="transition-all duration-200">
          <StudentRiskCard
            probability={risk?.riskPercentage || 35}
            riskLevel={risk?.riskLevel || 'medium'}
            confidence={risk?.predictionConfidence || 94.8}
            studentName="Academic Advisory Score"
            compact={true}
          />
        </motion.div>

        {/* Term Completion Advisory Card */}
        <motion.div whileHover={{ y: -2 }} className="transition-all duration-200">
          <StudentRiskCard
            probability={profile?.dropoutProbability || 10}
            riskLevel={risk?.riskLevel || 'medium'}
            confidence={risk?.predictionConfidence || 94.8}
            studentName="Term Completion Risk"
            compact={true}
          />
        </motion.div>
      </div>

      {/* Main Column Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Columns (Academics & Risk Triggers & Progress) */}
        <div className="md:col-span-2 space-y-6">
          {/* Course Marks & Class Average comparison (Fully optimized: showing all semester subjects) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-on-surface">Subject Grades vs. Class Average</CardTitle>
                  <CardDescription>Comprehensive comparison of internal grades for the current semester</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Your Score
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                    <span className="h-2 w-0.5 bg-outline" /> Class Average
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-outline bg-surface-container px-2.5 py-1 rounded border border-outline-variant/40">
                    Rank: {academics?.stats.classRank || 'N/A'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {academics?.subjectMarks && academics.subjectMarks.length > 0 ? (
                <div className="space-y-4.5">
                  {academics.subjectMarks.map((mark, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-on-surface font-bold truncate max-w-[200px] sm:max-w-md">
                          {mark.subject}
                        </span>
                        <span className="text-on-surface-variant font-medium">
                          Internal: <strong className="text-primary font-bold">{mark.internal}%</strong>
                          <span className="text-outline mx-1.5">|</span>
                          Class Avg: <span className="font-mono text-outline">{mark.classAverage}%</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-2 w-full bg-surface-container rounded-full overflow-hidden relative">
                          {/* Class Average marker line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-outline z-10"
                            style={{ left: `${mark.classAverage}%` }}
                            title={`Class Average: ${mark.classAverage}%`}
                          />
                          {/* Student score progress fill */}
                          <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${mark.internal}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-outline-variant/30 rounded-xl">
                  <p className="text-xs text-outline font-medium">No academic grade records found.</p>
                </div>
              )}
              <div className="pt-2 border-t border-outline-variant/20">
                <button
                  onClick={() => navigate('/student/academic')}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dim transition duration-150 cursor-pointer"
                >
                  View full gradecard & credit details <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Active Risk Drivers */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">Academic Standing Risk Drivers</CardTitle>
                  <CardDescription>Key metrics requiring focus to maintain safe retention margins</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {risk?.riskDrivers && risk.riskDrivers.length > 0 ? (
                risk.riskDrivers.map((driver, idx) => {
                  const isHigh = driver.impact >= 7;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isHigh
                          ? 'border-rose-500/15 bg-rose-500/[0.02] dark:bg-rose-500/[0.01]'
                          : 'border-outline-variant/40 bg-surface-container-low/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-sans text-xs font-bold text-on-surface flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${isHigh ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          {driver.factor}
                        </h4>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed pl-3.5 font-normal">
                          {driver.description}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 self-start sm:self-center ${
                        isHigh
                          ? 'text-rose-600 bg-rose-500/10 border-rose-500/10'
                          : 'text-amber-600 bg-amber-500/10 border-amber-500/10'
                      }`}>
                        Impact Weight: {driver.impact}/10
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 border border-dashed border-outline-variant/30 rounded-xl">
                  <p className="text-xs text-outline font-medium">No risk factor logs currently active.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones & Achievements Grid layout */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Milestones & Timeline progression</CardTitle>
              <CardDescription>
                Semester academic schedule paired with registered milestones and awards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Left: Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-on-surface-variant font-medium">Semester Progress: Week 10 / 16</span>
                    <span className="text-primary font-bold">62.5% Complete</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: '62.5%' }} />
                  </div>

                  {/* Timeline checkpoints */}
                  <div className="relative border-l border-outline-variant ml-3.5 pl-5 space-y-4.5 pt-2">
                    <div className="relative">
                      <div className="absolute -left-[27px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-on-surface">Midterm Evaluations Completed</p>
                        <p className="text-[10px] text-on-surface-variant">Week 8 &bull; Grades integrated</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[27px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-white shadow-sm animate-pulse">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-primary">Intervention Advisory Cycle</p>
                        <p className="text-[10px] text-on-surface-variant">Week 10 (Current) &bull; Advisory active</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[27px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-surface border border-outline-variant text-outline">
                        <div className="h-1.5 w-1.5 rounded-full bg-outline" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-on-surface-variant">Final Project Assessments</p>
                        <p className="text-[10px] text-outline">Week 14 &bull; Scheduled</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Achievements */}
                <div className="space-y-4 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-4 sm:pt-0 sm:pl-6">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-500" />
                    Institutional Achievements
                  </h4>
                  <div className="space-y-2">
                    {profile?.achievements && profile.achievements.length > 0 ? (
                      profile.achievements.map((ach, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 p-2.5 text-xs text-on-surface font-medium hover:border-outline-variant transition duration-150"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight text-on-surface-variant">{ach}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-outline font-medium">No recorded achievement badges.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns (Counseling Session, Notifications, Quick Actions) */}
        <div className="space-y-6">
          {/* Upcoming Counseling Card */}
          <Card className="border border-primary/20 bg-surface-container-low shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
                  Advisory Appointment
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {nextSession ? (
                <div className="space-y-3.5">
                  <div className="rounded-xl bg-surface p-3.5 border border-outline-variant/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-xs font-bold text-on-surface">
                        {nextSession.counselorName}
                      </p>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {nextSession.status}
                      </span>
                    </div>
                    <div className="space-y-1 font-sans text-xs text-on-surface-variant">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-outline" />
                        {nextSession.date} at {nextSession.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <Compass className="h-3.5 w-3.5 text-outline" />
                        {nextSession.mode} ({nextSession.location})
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full text-xs font-bold shadow-sm" onClick={() => navigate('/student/counseling')}>
                    Manage Bookings <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2 space-y-3">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    No upcoming counseling sessions are scheduled. We recommend booking a proactive sync to review course standing.
                  </p>
                  <Button size="sm" className="w-full text-xs font-bold" onClick={() => navigate('/student/counseling')}>
                    Book Support Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => navigate('/student/attendance')}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-container transition-all border border-outline-variant/30 flex items-center justify-between cursor-pointer shadow-sm hover:shadow"
              >
                <span className="flex items-center gap-2 text-on-surface-variant">
                  <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                  Attendance Standing
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-outline" />
              </button>

              <button
                onClick={() => navigate('/student/academic')}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-container transition-all border border-outline-variant/30 flex items-center justify-between cursor-pointer shadow-sm hover:shadow"
              >
                <span className="flex items-center gap-2 text-on-surface-variant">
                  <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                  Academic Breakdown
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-outline" />
              </button>

              <button
                onClick={() => navigate('/student/assignments')}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-container transition-all border border-outline-variant/30 flex items-center justify-between cursor-pointer shadow-sm hover:shadow"
              >
                <span className="flex items-center gap-2 text-on-surface-variant">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  Assignments Portal
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-outline" />
              </button>

              <button
                onClick={() => navigate('/student/recommendations')}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-container transition-all border border-outline-variant/30 flex items-center justify-between cursor-pointer shadow-sm hover:shadow"
              >
                <span className="flex items-center gap-2 text-on-surface-variant">
                  <Sparkles className="h-4 w-4 text-secondary shrink-0" />
                  Personal Study Plans
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-outline" />
              </button>
            </CardContent>
          </Card>

          {/* Recent Notifications Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Unread Notifications
                </CardTitle>
              </div>
              <button
                onClick={() => navigate('/student/notifications')}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                View all
              </button>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {unreadAlerts.length > 0 ? (
                <div className="space-y-2.5">
                  {unreadAlerts.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl border border-outline-variant/30 bg-surface hover:bg-surface-container transition duration-150 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-on-surface flex items-center gap-1.5 leading-tight">
                          {n.type === 'risk' && <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                          {n.type === 'attendance' && <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                          {n.type === 'assignment' && <FileText className="h-3.5 w-3.5 text-primary shrink-0" />}
                          {n.title}
                        </span>
                        <span className="text-[9px] text-outline font-semibold shrink-0 mt-0.5">{n.date}</span>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed text-[11px] font-normal pl-5">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-outline-variant/30 rounded-xl">
                  <p className="text-xs text-outline font-medium">No pending unread alerts.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}


