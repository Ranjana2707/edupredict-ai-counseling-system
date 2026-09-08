import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  History,
  FileText,
  DollarSign,
  TrendingUp,
  Sliders,
  Award,
  Phone,
  Mail,
  Home,
  MessageSquare,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCounselorStudent } from '../../hooks/useCounselorData';
import { CounselingNotes } from '../common/CounselingNotes';
import { getRiskColorClass } from '../../utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';

interface Student360DrawerProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Student360Drawer({ studentId, isOpen, onClose }: Student360DrawerProps) {
  const { data: student, isLoading } = useCounselorStudent(studentId || undefined);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'predictive' | 'counseling'>('overview');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-40 transition-opacity"
      />

      {/* Slide out panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed inset-y-0 right-0 w-full max-w-4xl bg-surface-container-lowest border-l border-outline-variant shadow-2xl z-50 overflow-y-auto flex flex-col"
      >
        {/* Drawer Header */}
        <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-surface-container/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-sans font-black text-primary text-sm shrink-0">
              {student?.name ? student.name.split(' ').map((n: string) => n[0]).join('') : '?'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-base font-black text-on-surface">{student?.name || 'Loading Student...'}</h2>
                {student && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getRiskColorClass(student.riskLevel)}`}>
                    {student.riskLevel}
                  </span>
                )}
              </div>
              <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                ID: {student?.id} &bull; {student?.department} &bull; {student?.semester}
              </p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <X className="h-4.5 w-4.5 text-on-surface-variant" />
          </Button>
        </div>

        {isLoading || !student ? (
          <div className="flex-1 p-lg space-y-6 animate-pulse">
            <div className="h-12 bg-surface-container rounded-md w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-surface-container rounded-md" />
              <div className="h-32 bg-surface-container rounded-md" />
              <div className="h-32 bg-surface-container rounded-md" />
            </div>
            <div className="h-64 bg-surface-container rounded-md w-full" />
          </div>
        ) : (
          <>
            {/* Tab Swapper */}
            <div className="flex border-b border-outline-variant p-2 gap-1.5 select-none bg-surface-container-low/50">
              {[
                { id: 'overview', label: '360° Profile Overview', icon: User },
                { id: 'academic', label: 'Academic & Course Ledger', icon: GraduationCap },
                { id: 'predictive', label: 'ML Analytics & Engagement', icon: Sliders },
                { id: 'counseling', label: 'Counseling & Remarks Log', icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-extrabold rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body content */}
            <div className="flex-1 p-lg space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Contact cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2 p-md">
                        <CardTitle className="text-xs font-black uppercase text-primary tracking-wider">Student Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 p-md pt-0 text-xs">
                        <div className="flex justify-between py-1 border-b border-outline-variant/30">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address</span>
                          <span className="font-semibold text-on-surface">{student.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-outline-variant/30">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</span>
                          <span className="font-semibold text-on-surface">{student.phone || '+1 (555) 000-1111'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-outline-variant/30">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date of Birth</span>
                          <span className="font-semibold text-on-surface">{student.dob || '2005-01-01'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2 p-md">
                        <CardTitle className="text-xs font-black uppercase text-secondary tracking-wider">Guardian Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 p-md pt-0 text-xs">
                        <div className="flex justify-between py-1 border-b border-outline-variant/30">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Guardian Name</span>
                          <span className="font-semibold text-on-surface">{student.guardianName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-outline-variant/30">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Guardian Phone</span>
                          <span className="font-semibold text-on-surface">{student.guardianPhone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-outline-variant/30">
                          <span className="text-on-surface-variant font-medium flex items-center gap-1.5"><Home className="h-3.5 w-3.5" /> Permanent Residence</span>
                          <span className="font-semibold text-on-surface">Registered Student Dormitory</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Financial & Scholarship Statuses */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-black uppercase text-tertiary tracking-wider">Financial & Scholarship Audit</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-md rounded-lg bg-surface-container/40 border border-outline-variant/30">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black shrink-0 ${
                          student.financialStatus === 'clear' ? 'bg-emerald-500/10 text-emerald-600' :
                          student.financialStatus === 'pending_installment' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Tuition Ledger Status</span>
                          <span className="font-sans text-xs font-bold capitalize text-on-surface">
                            {student.financialStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-md rounded-lg bg-surface-container/40 border border-outline-variant/30">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Scholarship & Grants details</span>
                          <span className="font-sans text-xs font-bold text-on-surface leading-snug">
                            {student.scholarshipDetails || 'None (Self-Financed)'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Brief Performance Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/30 text-center">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase block">CGPA Cumulative</span>
                      <span className="text-base font-black text-on-surface mt-1 block">{student.cgpa}</span>
                    </div>
                    <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/30 text-center">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Class Attendance</span>
                      <span className={`text-base font-black mt-1 block ${student.attendance < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>{student.attendance}%</span>
                    </div>
                    <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/30 text-center">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase block">ML Prediction Score</span>
                      <span className="text-base font-black text-primary mt-1 block">{student.predictionScore}/100</span>
                    </div>
                    <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/30 text-center">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Prediction Accuracy</span>
                      <span className="text-base font-black text-emerald-500 mt-1 block">{student.predictionConfidence}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC & ATTENDANCE */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  {/* Semester GPA Progress Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs font-black uppercase tracking-wider text-primary">Academic GPA progression trend</CardTitle>
                      <CardDescription>Visual history tracking GPA across past semesters</CardDescription>
                    </CardHeader>
                    <CardContent className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={student.academicHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                          <XAxis dataKey="semester" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                          <YAxis domain={[0, 10.0]} stroke="#9CA3AF" fontSize={9} tickLine={false} />
                          <Tooltip wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="gpa" name="GPA" stroke="#6366F1" strokeWidth={3} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Subject Attendance & Classes breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attendance summary */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-secondary tracking-wider">Subject-wise Presence Registry</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-outline-variant/30">
                          {student.attendanceHistory.map((item, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs font-semibold">
                              <div>
                                <span className="block text-on-surface truncate max-w-[190px]">{item.subject}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">Attended {item.classesAttended} / {item.classesTotal} classes</span>
                              </div>
                              <span className={`font-mono text-xs font-black ${item.percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {item.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Homework Assignment status */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-tertiary tracking-wider">Course Assignments Ledger</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-outline-variant/30">
                          {student.assignmentStatus.map((item, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs font-semibold">
                              <div>
                                <span className="block text-on-surface truncate max-w-[190px]">{item.title}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">Due: {item.dueDate}</span>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                item.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' :
                                item.status === 'overdue' ? 'bg-rose-500/10 text-rose-600 border-rose-500/15 animate-pulse' : 'bg-amber-500/10 text-amber-600 border-amber-500/15'
                              }`}>
                                {item.status} {item.grade ? `(${item.grade})` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 3: PREDICTIVE ANALYTICS */}
              {activeTab === 'predictive' && (
                <div className="space-y-6">
                  {/* Prediction score trajectory */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs font-black uppercase tracking-wider text-rose-500">Dropout Risk score timeline</CardTitle>
                      <CardDescription>Predictive probability of drop-out evaluated by system algorithms over semester progress</CardDescription>
                    </CardHeader>
                    <CardContent className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={student.predictionTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="studentRiskGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={9} tickLine={false} />
                          <Tooltip wrapperStyle={{ fontSize: 11 }} />
                          <Area type="monotone" dataKey="score" name="Dropout Risk Index" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#studentRiskGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* LMS Engagement gauges */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-black uppercase text-primary tracking-wider">Core LMS & Library Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-md rounded-lg bg-surface-container/30 border border-outline-variant/20 text-center">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">LMS Engagement Activity</span>
                        <span className="text-xl font-black text-on-surface mt-1.5 block">{student.engagementMetrics.lmsActivityHours} hrs / week</span>
                        <span className="text-[9px] text-rose-500/80 font-bold block mt-1">Below target cohort avg (5.8h)</span>
                      </div>

                      <div className="p-md rounded-lg bg-surface-container/30 border border-outline-variant/20 text-center">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Library biometrics Check-ins</span>
                        <span className="text-xl font-black text-on-surface mt-1.5 block">{student.engagementMetrics.libraryCheckins} visits / month</span>
                        <span className="text-[9px] text-on-surface-variant font-bold block mt-1">Target visits: &gt; 5</span>
                      </div>

                      <div className="p-md rounded-lg bg-surface-container/30 border border-outline-variant/20 text-center">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Forum Contributions</span>
                        <span className="text-xl font-black text-on-surface mt-1.5 block">{student.engagementMetrics.forumContributions} posts</span>
                        <span className="text-[9px] text-on-surface-variant font-bold block mt-1">Target visits: &gt; 8</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 4: COUNSELING & REMARKS LOG */}
              {activeTab === 'counseling' && (
                <div className="space-y-6">
                  {/* Live Counseling Intervention Diary */}
                  <CounselingNotes studentId={student.id} studentName={student.name} />

                  {/* Counseling session history */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-black uppercase text-primary tracking-wider">Past Counseling Intervention logs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-outline-variant/30">
                        {student.counselingHistory.length > 0 ? (
                          student.counselingHistory.map((log, idx) => (
                            <div key={idx} className="p-lg space-y-1.5 hover:bg-surface-container/10 transition text-xs">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                                <span>Date: {log.date} &bull; Counselor: {log.counselorName}</span>
                                <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded">{log.type}</span>
                              </div>
                              <h5 className="font-sans font-black text-on-surface">Systematic Notes:</h5>
                              <p className="text-on-surface-variant leading-relaxed text-xs">
                                {log.notes}
                              </p>
                              <h5 className="font-sans font-black text-emerald-600 dark:text-emerald-400 mt-1">Agreed Session Outcome:</h5>
                              <p className="text-on-surface-variant/90 leading-relaxed text-xs">
                                {log.outcome}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-on-surface-variant text-xs">
                            No recorded past counseling interventions. Direct check-in pending.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Faculty Remarks */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-black uppercase text-secondary tracking-wider">Direct Faculty Remarks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-outline-variant/30">
                        {student.facultyRemarks.length > 0 ? (
                          student.facultyRemarks.map((remark, idx) => (
                            <div key={idx} className="p-4 space-y-1 hover:bg-surface-container/10 transition text-xs">
                              <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant">
                                <span>{remark.facultyName}</span>
                                <span>{remark.date}</span>
                              </div>
                              <p className="text-on-surface italic font-medium leading-relaxed mt-1">
                                "{remark.remark}"
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-on-surface-variant text-xs">
                            No documented remarks from teaching faculty.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer action trigger */}
            <div className="p-lg border-t border-outline-variant bg-surface-container/20 flex justify-end gap-3.5">
              <Button onClick={onClose} variant="outline" size="sm" className="h-9 px-5 text-xs font-bold">
                Close Profile
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
