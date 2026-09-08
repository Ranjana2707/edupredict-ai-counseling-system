import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  XCircle,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  User,
  Activity,
  ChevronRight,
  ClipboardList,
  Sparkles,
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  useCounselorSessions,
  useCounselorStudents,
  useCreateCounselingSession,
  useUpdateCounselingSession,
  useCancelCounselingSession
} from '../../hooks/useCounselorData';
import { CounselingSession } from '../../types';

interface SessionManagerProps {
  directScheduleStudentId?: string | null;
  directScheduleStudentName?: string | null;
  onClearDirectSchedule?: () => void;
}

export function SessionManager({ directScheduleStudentId, directScheduleStudentName, onClearDirectSchedule }: SessionManagerProps) {
  const { data: sessions, isLoading: sessionsLoading } = useCounselorSessions();
  const { data: students } = useCounselorStudents();

  const createSessionMutation = useCreateCounselingSession();
  const updateSessionMutation = useUpdateCounselingSession();
  const cancelSessionMutation = useCancelCounselingSession();

  // Dialog/Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);

  // Form States for creation
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('2026-07-12');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(45);
  const [type, setType] = useState<CounselingSession['type']>('academic');
  const [notes, setNotes] = useState('');
  const [followUpReminder, setFollowUpReminder] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpPriority, setFollowUpPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Form States for edits/outcomes
  const [editNotes, setEditNotes] = useState('');
  const [editOutcome, setEditOutcome] = useState('');
  const [editFeedback, setEditFeedback] = useState('');
  const [editStatus, setEditStatus] = useState<CounselingSession['status']>('upcoming');

  // Trigger schedule modal if direct action from student card
  React.useEffect(() => {
    if (directScheduleStudentId && directScheduleStudentName) {
      setStudentId(directScheduleStudentId);
      setIsCreateOpen(true);
      if (onClearDirectSchedule) onClearDirectSchedule();
    }
  }, [directScheduleStudentId, directScheduleStudentName, onClearDirectSchedule]);

  const handleOpenCreate = () => {
    setStudentId(students?.[0]?.id || '');
    setDate('2026-07-12');
    setTime('10:00');
    setDuration(45);
    setType('academic');
    setNotes('');
    setFollowUpReminder('');
    setFollowUpDate('');
    setFollowUpPriority('medium');
    setIsCreateOpen(true);
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selStudent = students?.find(s => s.id === studentId);
    if (!selStudent) return;

    createSessionMutation.mutate({
      studentId,
      studentName: selStudent.name,
      date,
      time,
      duration,
      type,
      status: 'upcoming',
      notes,
      followUpReminder: followUpReminder || undefined,
      followUpDate: followUpDate || undefined,
      followUpPriority: followUpDate ? followUpPriority : undefined
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
      }
    });
  };

  const handleOpenEdit = (session: CounselingSession) => {
    setSelectedSession(session);
    setEditNotes(session.notes);
    setEditOutcome(session.outcome || '');
    setEditFeedback(session.studentFeedback || '');
    setEditStatus(session.status);
    setIsEditOpen(true);
  };

  const handleUpdateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    updateSessionMutation.mutate({
      id: selectedSession.id,
      updates: {
        notes: editNotes,
        outcome: editOutcome,
        studentFeedback: editFeedback,
        status: editStatus
      }
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        setSelectedSession(null);
      }
    });
  };

  const handleCancelSession = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this scheduled session?")) {
      cancelSessionMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: CounselingSession['status']) => {
    switch (status) {
      case 'upcoming':
        return <span className="bg-primary/5 text-primary border border-primary/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">Upcoming</span>;
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 text-[9px] font-black uppercase px-2 py-0.5 rounded">Completed</span>;
      case 'cancelled':
        return <span className="bg-rose-500/10 text-rose-600 border border-rose-500/15 text-[9px] font-black uppercase px-2 py-0.5 rounded">Cancelled</span>;
      default:
        return null;
    }
  };

  const getTypeColor = (type: CounselingSession['type']) => {
    switch (type) {
      case 'academic': return 'bg-blue-500/10 text-blue-600';
      case 'psychological': return 'bg-pink-500/10 text-pink-600';
      case 'financial': return 'bg-emerald-500/10 text-emerald-600';
      case 'attendance': return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-purple-500/10 text-purple-600';
    }
  };

  if (sessionsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface-container rounded-md w-1/5" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface-container rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session action line */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Intervention Sessions Registry</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Detailed history and management of counseling logs.</p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="text-xs font-black gap-1.5 h-10">
          <Plus className="h-4.5 w-4.5" /> Book Dialogue
        </Button>
      </div>

      {/* Session entries list */}
      <div className="space-y-4">
        {sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <Card key={session.id} className="border border-outline-variant/60 hover:shadow-sm">
              <div className="p-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Information segment */}
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-full border border-outline-variant/60 bg-surface-container flex items-center justify-center font-sans font-black text-primary text-xs shrink-0 overflow-hidden">
                    {session.studentAvatar ? (
                      <img src={session.studentAvatar} alt={session.studentName} className="h-full w-full object-cover" />
                    ) : (
                      session.studentName.charAt(0)
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-sans text-xs font-black text-on-surface">{session.studentName}</h4>
                      {getStatusBadge(session.status)}
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded capitalize ${getTypeColor(session.type)}`}>
                        {session.type} counseling
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {session.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.time} ({session.duration} mins)</span>
                      <span className="bg-surface-container px-1.5 rounded">ID: {session.id}</span>
                    </div>
                    <p className="text-xs font-medium text-on-surface-variant leading-relaxed max-w-2xl pt-1">
                      <strong>Notes:</strong> {session.notes}
                    </p>
                    {session.outcome && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                        <strong>Outcome:</strong> {session.outcome}
                      </div>
                    )}
                    {session.studentFeedback && (
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold italic">
                        <strong>Feedback:</strong> "{session.studentFeedback}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations column */}
                <div className="flex md:flex-col items-center md:items-end justify-end gap-2.5 shrink-0 border-t md:border-t-0 border-outline-variant/30 pt-3 md:pt-0">
                  <Button
                    onClick={() => handleOpenEdit(session)}
                    variant="outline"
                    size="sm"
                    className="text-xs font-black gap-1 h-9 px-4"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-primary" /> Update Outcome
                  </Button>
                  {session.status === 'upcoming' && (
                    <Button
                      onClick={() => handleCancelSession(session.id)}
                      variant="ghost"
                      size="sm"
                      className="text-xs font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50/10 gap-1 h-9 px-4"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Cancel Session
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center border border-dashed border-outline-variant rounded-lg bg-surface-container/10">
            <Calendar className="h-10 w-10 text-on-surface-variant/40 mx-auto" />
            <h4 className="font-sans text-sm font-bold text-on-surface mt-3">No sessions logged</h4>
            <p className="text-xs text-on-surface-variant mt-1">Book a counseling slot to generate your dynamic intervention ledger.</p>
          </div>
        )}
      </div>

      {/* CREATE DIALOG MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-lg border-b border-outline-variant bg-surface-container/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-sans text-base font-black text-on-surface">Book Counseling Session</h3>
              </div>
              <Button onClick={() => setIsCreateOpen(false)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <XCircle className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* Form Scrollable Body */}
            <form onSubmit={handleCreateSessionSubmit} className="flex-1 overflow-y-auto p-lg space-y-4">
              {/* Student selection dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Select Cohort Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                >
                  <option value="" disabled>-- Choose Assigned Student --</option>
                  {students?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (ID: {s.id} - {(s.riskLevel || 'low').toUpperCase()})</option>
                  ))}
                </select>
              </div>

              {/* Grid Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Session Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Start Time</label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Duration and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Duration (Minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                    required
                  >
                    <option value={15}>15 Minutes (Brief Sync)</option>
                    <option value={30}>30 Minutes (Standard Audit)</option>
                    <option value={45}>45 Minutes (Full Check-in)</option>
                    <option value={60}>60 Minutes (Intense Crisis Review)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Intervention Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                    required
                  >
                    <option value="academic">Academic support</option>
                    <option value="psychological">Psychological counseling</option>
                    <option value="financial">Financial guidance</option>
                    <option value="attendance">Attendance plan</option>
                    <option value="general">General mentorship</option>
                  </select>
                </div>
              </div>

              {/* Initial Session Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Diagnostic Intake Notes / Objectives</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Specify primary dialogue issues or academic alerts being addressed..."
                  required
                />
              </div>

              {/* Divider for optional Follow-up creation */}
              <div className="border-t border-outline-variant/40 pt-3 mt-2">
                <h4 className="font-sans text-[10px] font-black uppercase text-primary tracking-widest block mb-2 select-none">Automated Follow-up Scheduler</h4>
                <div className="grid grid-cols-1 gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase">Checklist item description</label>
                    <input
                      type="text"
                      value={followUpReminder}
                      onChange={(e) => setFollowUpReminder(e.target.value)}
                      className="w-full text-xs font-semibold p-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                      placeholder="e.g., Confirm student signed tutor agreement."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase">Action Due Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full text-xs font-semibold p-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase">Priority status</label>
                      <select
                        value={followUpPriority}
                        onChange={(e) => setFollowUpPriority(e.target.value as any)}
                        className="w-full text-xs font-semibold p-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3.5 pt-4">
                <Button onClick={() => setIsCreateOpen(false)} type="button" variant="outline" className="text-xs font-bold">
                  Cancel
                </Button>
                <Button
                  loading={createSessionMutation.isPending}
                  type="submit"
                  variant="primary"
                  className="text-xs font-black"
                >
                  Confirm Slot
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* UPDATE OUTCOME DIALOG MODAL */}
      {isEditOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-lg border-b border-outline-variant bg-surface-container/30 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-sans text-base font-black text-on-surface">Update Session Summary</h3>
              </div>
              <Button onClick={() => setIsEditOpen(false)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <XCircle className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateSessionSubmit} className="p-lg space-y-4">
              {/* Session Status dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Update Session Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                  required
                >
                  <option value="upcoming">Upcoming (Reserved)</option>
                  <option value="completed">Completed (Outcome Closed)</option>
                  <option value="cancelled">Cancelled (Nullified)</option>
                </select>
              </div>

              {/* Adjust Diagnostic Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Detailed Counseling Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                  required
                />
              </div>

              {/* Complete outcomes */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Structured Outcome / Resolution Agreements</label>
                <textarea
                  value={editOutcome}
                  onChange={(e) => setEditOutcome(e.target.value)}
                  rows={2}
                  className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                  placeholder="What was resolved or signed? (e.g., agreed to 3-installment fee splits)"
                />
              </div>

              {/* Student Feedback */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Student Feedback Reflection</label>
                <textarea
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  rows={1}
                  className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                  placeholder="How did the student respond or feel?"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3.5 pt-2">
                <Button onClick={() => setIsEditOpen(false)} type="button" variant="outline" className="text-xs font-bold">
                  Cancel
                </Button>
                <Button
                  loading={updateSessionMutation.isPending}
                  type="submit"
                  variant="primary"
                  className="text-xs font-black"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
