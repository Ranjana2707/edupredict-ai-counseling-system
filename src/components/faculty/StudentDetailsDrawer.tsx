import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  User,
  Calendar,
  GraduationCap,
  FileText,
  AlertTriangle,
  History,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  Plus,
  Save,
  CheckCircle2,
  MapPin,
  Clock,
  Compass,
  ClipboardList
} from 'lucide-react';
import { FacultyStudent, RiskLevel } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getRiskColorClass } from '../../utils';
import { CounselingNotes } from '../common/CounselingNotes';
import {
  useUpdateStudentAttendance,
  useUpdateStudentMarks
} from '../../hooks/useFacultyData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface StudentDetailsDrawerProps {
  student: FacultyStudent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentDetailsDrawer({ student, isOpen, onClose }: StudentDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'marks' | 'assignments' | 'risk' | 'counseling'>('profile');

  // Input states for updating attendance and marks
  const [editSubjectCode, setEditSubjectCode] = useState<string>('CS-301');
  const [newAttendancePct, setNewAttendancePct] = useState<string>('75');
  const [newInternalMarks, setNewInternalMarks] = useState<string>('70');

  const updateAttendanceMutation = useUpdateStudentAttendance();
  const updateMarksMutation = useUpdateStudentMarks();

  if (!student || !isOpen) return null;

  const handleUpdateAttendance = async () => {
    const val = parseFloat(newAttendancePct);
    if (isNaN(val) || val < 0 || val > 100) return;
    await updateAttendanceMutation.mutateAsync({
      studentId: student.id,
      subjectCode: editSubjectCode,
      attendanceValue: val
    });
  };

  const handleUpdateMarks = async () => {
    const val = parseFloat(newInternalMarks);
    if (isNaN(val) || val < 0 || val > 100) return;
    await updateMarksMutation.mutateAsync({
      studentId: student.id,
      subjectCode: editSubjectCode,
      internalMarks: val
    });
  };

  const riskColorClass = getRiskColorClass(student.riskLevel);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/20 backdrop-blur-sm transition-opacity"
      />

      {/* Slide Container */}
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="pointer-events-auto w-screen max-w-2xl bg-surface-container-lowest border-l border-outline-variant shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="border-b border-outline-variant p-lg bg-surface-container-low/50">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-lg text-primary select-none shrink-0">
                  {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans text-base font-extrabold text-on-surface">{student.name}</h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${riskColorClass}`}>
                      {student.riskLevel}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant font-medium">{student.email}</p>
                  <p className="font-sans text-[10px] text-primary uppercase font-bold tracking-wider">
                    {student.department} • {student.semester}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full text-on-surface-variant hover:bg-surface-container"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-outline-variant/30 mt-lg -mb-lg gap-2 overflow-x-auto select-none">
              {(
                [
                  { id: 'profile', label: 'Profile Preview', icon: User },
                  { id: 'attendance', label: 'Attendance', icon: Calendar },
                  { id: 'marks', label: 'Academics & Marks', icon: GraduationCap },
                  { id: 'assignments', label: 'Assignments', icon: FileText },
                  { id: 'risk', label: 'ML Risk Profile', icon: AlertTriangle },
                  { id: 'counseling', label: 'Counseling Notes', icon: ClipboardList }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-md py-2.5 font-sans text-xs font-semibold border-b-2 transition-all shrink-0 ${
                      isActive
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-lg space-y-6">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Academic Quick KPIs */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container p-md rounded-lg border border-outline-variant/45">
                    <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Attendance</span>
                    <span className="block font-sans text-lg font-black text-on-surface mt-1">{student.attendance}%</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Estimated safe limit</span>
                  </div>
                  <div className="bg-surface-container p-md rounded-lg border border-outline-variant/45">
                    <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">CGPA Score</span>
                    <span className="block font-sans text-lg font-black text-on-surface mt-1">{student.cgpa}</span>
                    <span className="text-[9px] text-on-surface-variant font-medium block mt-0.5">Out of 4.0</span>
                  </div>
                  <div className="bg-surface-container p-md rounded-lg border border-outline-variant/45">
                    <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">AI Forecast Confidence</span>
                    <span className="block font-sans text-lg font-black text-on-surface mt-1">{student.predictionConfidence}%</span>
                    <span className="text-[9px] text-primary font-bold block mt-0.5">Confidence weight</span>
                  </div>
                </div>

                {/* Risk Drivers Card */}
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-lg space-y-3">
                  <h4 className="font-sans text-xs font-black text-rose-800 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    Primary Risk Driver Analysis (ML Weights)
                  </h4>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {student.riskDrivers.map((driver, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Active Support Direct Actions */}
                <div className="bg-surface-container rounded-lg p-lg border border-outline-variant/50 space-y-3">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recommended Intervention Actions
                  </h4>
                  <p className="font-sans text-[11px] text-on-surface-variant">
                    Apply targeted interventions based on indicators generated by the predictive AI engine.
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/40">
                      <div>
                        <p className="font-sans text-xs font-bold text-on-surface">Recommend Counseling</p>
                        <p className="font-sans text-[10px] text-on-surface-variant">Refer to physical counseling dialogue with Dr. Thorne</p>
                      </div>
                      <Button size="sm" className="h-8 text-[11px] font-bold">
                        Refer Student
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/40">
                      <div>
                        <p className="font-sans text-xs font-bold text-on-surface">Issue Academic Support Notice</p>
                        <p className="font-sans text-[10px] text-on-surface-variant">Deliver attendance/marks warnings and recovery schedule</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold">
                        Send Notice
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                {/* Attendance Form Editor */}
                <div className="bg-surface-container rounded-lg p-lg border border-outline-variant/50 space-y-4">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Update Subject Attendance</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Select Subject</label>
                      <select
                        value={editSubjectCode}
                        onChange={(e) => setEditSubjectCode(e.target.value)}
                        className="w-full text-xs h-9 bg-surface-container-lowest border border-outline rounded p-2 text-on-surface focus:outline-primary"
                      >
                        <option value="CS-301">CS-301: Advanced Algorithms</option>
                        <option value="CS-304">CS-304: Distributed Systems</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Attendance Value (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newAttendancePct}
                        onChange={(e) => setNewAttendancePct(e.target.value)}
                        placeholder="75"
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateAttendance}
                      disabled={updateAttendanceMutation.isPending}
                      className="h-9 flex items-center justify-center gap-1.5 text-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {updateAttendanceMutation.isPending ? 'Saving...' : 'Apply Update'}
                    </Button>
                  </div>
                </div>

                {/* Attendance Analytics Grid */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Subject Attendance Ledger</h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/45 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-surface-container/60">
                        <tr>
                          <th className="p-3 font-sans font-extrabold text-on-surface-variant">Subject Code</th>
                          <th className="p-3 font-sans font-extrabold text-on-surface-variant">Subject Name</th>
                          <th className="p-3 font-sans font-extrabold text-on-surface-variant text-right">Attendance Pct</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/40">
                        {student.subjectMarks.map((subj) => (
                          <tr key={subj.subjectCode}>
                            <td className="p-3 font-mono font-bold text-primary">{subj.subjectCode}</td>
                            <td className="p-3 font-medium text-on-surface">{subj.subjectName}</td>
                            <td className="p-3 text-right font-black text-on-surface">{student.attendance}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Heatmap Visual Placeholder */}
                <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/40 space-y-3">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Attendance Heatmap (Last 15 Days)</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const states = ['bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500', 'bg-rose-500', 'bg-emerald-500', 'bg-emerald-500', 'bg-amber-500'];
                      const state = states[i % states.length];
                      return (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className={`h-6 w-6 rounded ${state} border border-outline-variant/10`} />
                          <span className="font-mono text-[8px] text-on-surface-variant">Jul {1 + i}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 justify-center text-[10px] text-on-surface-variant font-bold mt-1">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500" /> Present</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-rose-500" /> Absent</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500" /> Excused</span>
                  </div>
                </div>
              </div>
            )}

            {/* MARKS TAB */}
            {activeTab === 'marks' && (
              <div className="space-y-6">
                {/* Marks Form Editor */}
                <div className="bg-surface-container rounded-lg p-lg border border-outline-variant/50 space-y-4">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Update Subject Internal Marks</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Select Subject</label>
                      <select
                        value={editSubjectCode}
                        onChange={(e) => setEditSubjectCode(e.target.value)}
                        className="w-full text-xs h-9 bg-surface-container-lowest border border-outline rounded p-2 text-on-surface focus:outline-primary"
                      >
                        <option value="CS-301">CS-301: Advanced Algorithms</option>
                        <option value="CS-304">CS-304: Distributed Systems</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Marks Scored (out of 100)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newInternalMarks}
                        onChange={(e) => setNewInternalMarks(e.target.value)}
                        placeholder="70"
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateMarks}
                      disabled={updateMarksMutation.isPending}
                      className="h-9 flex items-center justify-center gap-1.5 text-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {updateMarksMutation.isPending ? 'Saving...' : 'Apply Marks'}
                    </Button>
                  </div>
                </div>

                {/* Marks Analytics */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Academic Performance Ledger</h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/45 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-surface-container/60">
                        <tr>
                          <th className="p-3 font-sans font-extrabold text-on-surface-variant">Code</th>
                          <th className="p-3 font-sans font-extrabold text-on-surface-variant">Subject Name</th>
                          <th className="p-3 font-sans font-extrabold text-on-surface-variant text-center">Internal Score</th>
                          <th className="p-3 font-sans font-extrabold text-on-surface-variant text-center">University Exam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/40">
                        {student.subjectMarks.map((marks) => (
                          <tr key={marks.subjectCode}>
                            <td className="p-3 font-mono font-bold text-primary">{marks.subjectCode}</td>
                            <td className="p-3 font-medium text-on-surface">{marks.subjectName}</td>
                            <td className="p-3 text-center font-black text-on-surface">
                              {marks.internalMarks} / {marks.totalInternal}
                            </td>
                            <td className="p-3 text-center font-medium text-on-surface-variant">
                              {marks.examMarks ? `${marks.examMarks} / ${marks.totalExam}` : 'Pending Endsem'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CGPA Trend Chart */}
                <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/40 space-y-3">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">GPA Trajectory Trend</h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: 'Sem 1', GPA: 7.10 },
                          { name: 'Sem 2', GPA: 7.32 },
                          { name: 'Sem 3', GPA: 7.20 },
                          { name: 'Sem 4', GPA: 7.45 },
                          { name: 'Sem 5', GPA: student.cgpa },
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis domain={[0, 10]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="GPA" stroke="#0062FF" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Submission Monitor</h4>
                  <span className="font-sans text-[10px] text-on-surface-variant font-bold">Estimated 3 total tasks</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: '1', title: 'Dynamic Programming Optimization', subject: 'Advanced Algorithms', status: 'graded', score: '85/100', date: 'Jul 09' },
                    { id: '2', title: 'Distributed Paxos Consensus Design', subject: 'Distributed Systems', status: 'pending', date: 'Jul 15' },
                    { id: '3', title: 'Graph Algorithms & Flows', subject: 'Advanced Algorithms', status: 'pending', date: 'Jul 22' },
                  ].map((ass) => (
                    <div key={ass.id} className="flex items-center justify-between p-lg rounded-lg border border-outline-variant/40 bg-surface-container">
                      <div className="space-y-1">
                        <p className="font-sans text-xs font-bold text-on-surface">{ass.title}</p>
                        <p className="font-sans text-[10px] text-on-surface-variant">{ass.subject} • Due {ass.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {ass.status === 'graded' ? (
                          <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {ass.score}
                          </span>
                        ) : (
                          <span className="font-sans text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RISK PROFILE TAB */}
            {activeTab === 'risk' && (
              <div className="space-y-6">
                {/* Risk Distribution Indicator */}
                <div className="bg-surface-container rounded-lg p-lg border border-outline-variant/40 space-y-4">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Predictive ML Telemetry</h4>
                  <div className="flex justify-between items-center bg-surface-container-low p-md rounded border border-outline-variant/40">
                    <div>
                      <span className="font-sans text-[10px] text-on-surface-variant font-bold block uppercase">Classification</span>
                      <span className={`font-sans text-sm font-black uppercase ${riskColorClass}`}>{student.riskLevel}</span>
                    </div>
                    <div>
                      <span className="font-sans text-[10px] text-on-surface-variant font-bold block uppercase">Confidence weight</span>
                      <span className="font-sans text-sm font-black text-primary">{student.predictionConfidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Student Risk Timeline */}
                <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/40 space-y-3">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Student Risk Level Timeline</h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={student.riskTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="#EF4444" fillOpacity={1} fill="url(#riskGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Prediction History Records */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs font-extrabold text-on-surface uppercase tracking-wider">Historical ML Predictions</h4>
                  <div className="space-y-2.5">
                    {student.predictionHistory.map((hist) => (
                      <div key={hist.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-on-surface-variant">{hist.date}</span>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                              Confidence: {hist.confidence}%
                            </span>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getRiskColorClass(hist.riskLevel)}`}>
                            {hist.riskLevel}
                          </span>
                        </div>
                        <div>
                          <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Intervention Recommendations:</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {hist.recommendations.map((rec, i) => (
                              <span key={i} className="text-[9px] bg-surface-container px-2 py-1 rounded text-on-surface font-medium border border-outline-variant/30">
                                {rec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1.5 border-t border-outline-variant/30 text-[10px] font-bold">
                          <span className="text-on-surface-variant uppercase">Status:</span>
                          <span className="text-primary uppercase select-none">{hist.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COUNSELING TAB */}
            {activeTab === 'counseling' && (
              <div className="space-y-6">
                <CounselingNotes studentId={student.id} studentName={student.name} />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
