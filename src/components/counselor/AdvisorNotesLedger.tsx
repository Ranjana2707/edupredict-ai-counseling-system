import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { counselingNotesService, CounselingNoteDoc, NoteUrgency, NoteStatus } from '../../services/counselingNotesService';
import { useCounselorStudents } from '../../hooks/useCounselorData';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Student360Drawer } from './Student360Drawer';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Flame,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

const NOTE_CATEGORIES = [
  'Routine Check-in',
  'Academic Delay / Grades',
  'Attendance Concern',
  'Financial Stress',
  'Mental Health / Personal',
  'Disciplinary Discussion',
  'Career & Specialization Guidance',
  'General Mentorship'
];

const URGENCY_CONFIG: Record<NoteUrgency, { label: string; badgeClass: string; icon: React.ElementType; dotClass: string }> = {
  critical: {
    label: 'Critical Urgency',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    icon: Flame,
    dotClass: 'bg-rose-500 animate-pulse'
  },
  high: {
    label: 'High Priority',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    icon: AlertTriangle,
    dotClass: 'bg-amber-500'
  },
  medium: {
    label: 'Medium Urgency',
    badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
    icon: AlertCircle,
    dotClass: 'bg-sky-500'
  },
  low: {
    label: 'Low / Routine',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    dotClass: 'bg-emerald-500'
  }
};

const STATUS_CONFIG: Record<NoteStatus, { label: string; badgeClass: string }> = {
  open: { label: 'Open', badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' },
  in_progress: { label: 'In Progress', badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  resolved: { label: 'Resolved', badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' }
};

export function AdvisorNotesLedger() {
  const { user } = useAuth();
  const { data: students = [] } = useCounselorStudents();

  const [notes, setNotes] = useState<CounselingNoteDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Filters
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Form modal / inline
  const [isCreating, setIsCreating] = useState(false);
  const [formStudentId, setFormStudentId] = useState('');
  const [formCategory, setFormCategory] = useState(NOTE_CATEGORIES[0]);
  const [formUrgency, setFormUrgency] = useState<NoteUrgency>('medium');
  const [formSessionDate, setFormSessionDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  });
  const [formNotes, setFormNotes] = useState('');
  const [formOutcome, setFormOutcome] = useState('');
  const [formFollowUpDate, setFormFollowUpDate] = useState('');
  const [formStatus, setFormStatus] = useState<NoteStatus>('in_progress');

  // Edit states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUrgency, setEditUrgency] = useState<NoteUrgency>('medium');
  const [editOutcome, setEditOutcome] = useState('');
  const [editSessionDate, setEditSessionDate] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [editStatus, setEditStatus] = useState<NoteStatus>('in_progress');

  const loadAllNotes = async () => {
    setIsLoading(true);
    try {
      const data = await counselingNotesService.getAllNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load counseling ledger notes:', err);
      toast.error('Failed to load notes ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formStudentId) {
      toast.error('Student Required', { description: 'Please choose which student this counseling note is for.' });
      return;
    }
    if (!formNotes.trim()) {
      toast.error('Remarks Required', { description: 'Please enter detailed session observations.' });
      return;
    }

    const studentObj = students.find(s => s.id === formStudentId);
    const studentName = studentObj ? studentObj.name : `Student ${formStudentId}`;

    setIsSubmitting(true);
    try {
      const formattedSessionIso = new Date(formSessionDate).toISOString();
      await counselingNotesService.addNote({
        studentId: formStudentId,
        studentName,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        sessionDate: formattedSessionIso,
        urgency: formUrgency,
        notes: formNotes.trim(),
        type: formCategory,
        outcome: formOutcome.trim(),
        followUpDate: formFollowUpDate || undefined,
        status: formStatus
      });

      toast.success('Session Note Logged', {
        description: `Successfully stored structured ${formUrgency.toUpperCase()} note for ${studentName}.`
      });

      setFormNotes('');
      setFormOutcome('');
      setFormFollowUpDate('');
      setFormUrgency('medium');
      setFormStatus('in_progress');
      setIsCreating(false);
      await loadAllNotes();
    } catch (err) {
      console.error('Error logging note:', err);
      toast.error('Failed to save session note to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (note: CounselingNoteDoc) => {
    setEditingNoteId(note.id);
    setEditNotes(note.notes);
    setEditCategory(note.type);
    setEditUrgency(note.urgency || 'medium');
    setEditOutcome(note.outcome || '');
    setEditFollowUpDate(note.followUpDate || '');
    setEditStatus(note.status || 'open');

    let parsed = '';
    if (note.sessionDate) {
      try {
        const d = new Date(note.sessionDate);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const mins = String(d.getMinutes()).padStart(2, '0');
          parsed = `${year}-${month}-${day}T${hours}:${mins}`;
        }
      } catch {
        parsed = '';
      }
    }
    setEditSessionDate(parsed);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNotes.trim()) {
      toast.error('Content Required', { description: 'Intervention notes cannot be blank.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedSessionIso = editSessionDate ? new Date(editSessionDate).toISOString() : undefined;
      await counselingNotesService.updateNote({
        noteId,
        notes: editNotes.trim(),
        type: editCategory,
        urgency: editUrgency,
        outcome: editOutcome.trim(),
        sessionDate: formattedSessionIso,
        followUpDate: editFollowUpDate || undefined,
        status: editStatus
      });

      toast.success('Session Note Updated', {
        description: 'Changes successfully saved to Firestore.'
      });
      setEditingNoteId(null);
      await loadAllNotes();
    } catch (err) {
      console.error('Error updating note:', err);
      toast.error('Update Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (noteId: string, newStatus: NoteStatus) => {
    try {
      await counselingNotesService.updateNote({
        noteId,
        status: newStatus
      });
      toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      await loadAllNotes();
    } catch (err) {
      toast.error('Failed to change status in database.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this counseling session record permanently?')) return;
    try {
      await counselingNotesService.deleteNote(noteId);
      toast.success('Record Deleted');
      await loadAllNotes();
    } catch (err) {
      toast.error('Failed to delete note.');
    }
  };

  const formatSessionDate = (sessionDateStr: string) => {
    if (!sessionDateStr) return 'Not recorded';
    const d = new Date(sessionDateStr);
    if (isNaN(d.getTime())) return sessionDateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLoggedTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return String(timestamp);
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (selectedStudentFilter !== 'all' && n.studentId !== selectedStudentFilter) return false;
    if (selectedUrgencyFilter !== 'all' && n.urgency !== selectedUrgencyFilter) return false;
    if (selectedStatusFilter !== 'all' && (n.status || 'open') !== selectedStatusFilter) return false;
    if (selectedCategoryFilter !== 'all' && n.type !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = n.notes.toLowerCase().includes(q);
      const matchStudent = n.studentName.toLowerCase().includes(q) || n.studentId.toLowerCase().includes(q);
      const matchCategory = n.type.toLowerCase().includes(q);
      const matchOutcome = (n.outcome || '').toLowerCase().includes(q);
      const matchAuthor = n.authorName.toLowerCase().includes(q);
      if (!matchText && !matchStudent && !matchCategory && !matchOutcome && !matchAuthor) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalNotesCount = notes.length;
  const criticalCount = notes.filter(n => n.urgency === 'critical').length;
  const highCount = notes.filter(n => n.urgency === 'high').length;
  const inProgressCount = notes.filter(n => (n.status || 'open') === 'in_progress').length;
  const resolvedCount = notes.filter(n => (n.status || 'open') === 'resolved').length;

  return (
    <div className="space-y-6" id="advisor-notes-ledger">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-outline tracking-wider">Total Session Notes</span>
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-on-surface mt-2">{totalNotesCount}</p>
          <span className="text-[10px] text-outline font-medium">Logged across all students</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider">Critical Urgency</span>
            <Flame className="h-4 w-4 text-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{criticalCount}</p>
          <span className="text-[10px] text-rose-700/80 dark:text-rose-400/80 font-medium">Immediate intervention needed</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">High Priority</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{highCount}</p>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium">Elevated risk markers</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Resolved Interventions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium">{inProgressCount} currently in progress</span>
        </div>
      </div>

      {/* Action Header & Create Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60">
        <div>
          <h3 className="font-sans font-black text-base text-on-surface">Advisor Counseling &amp; Intervention Ledger</h3>
          <p className="font-sans text-xs text-outline mt-0.5">
            Log and retrieve counseling session notes for individual students with timestamps, categories, and urgency flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadAllNotes}
            variant="outline"
            size="sm"
            className="h-8.5 text-xs font-bold gap-1"
            title="Refresh database records"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sync Firestore
          </Button>

          {!isCreating && (
            <Button
              id="btn-ledger-new-note"
              onClick={() => setIsCreating(true)}
              size="sm"
              className="h-8.5 text-xs font-bold gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Log Counseling Note
            </Button>
          )}
        </div>
      </div>

      {/* Creation Modal / Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-surface-container-lowest border-2 border-primary rounded-2xl p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                <h4 className="font-sans font-black text-sm text-on-surface uppercase tracking-wider">
                  Log New Student Counseling Session Note
                </h4>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              {/* Row 1: Student Selection, Category, Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                    Target Student <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="ledger-select-student"
                    required
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary font-bold"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id}) &bull; CGPA: {s.cgpa} &bull; {s.riskLevel.toUpperCase()} RISK
                      </option>
                    ))}
                    {students.length === 0 && (
                      <>
                        <option value="STU001">Aarav Sharma (STU001)</option>
                        <option value="STU002">Zara Patel (STU002)</option>
                        <option value="STU003">Rohan Gupta (STU003)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                    Intervention Category
                  </label>
                  <select
                    id="ledger-select-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  >
                    {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5 flex items-center justify-between">
                    <span>Urgency Flag</span>
                    <span className="text-[9px] font-normal text-outline">Stored in Firestore</span>
                  </label>
                  <select
                    id="ledger-select-urgency"
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as NoteUrgency)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs font-black text-on-surface focus:border-primary"
                  >
                    <option value="low">🟢 Low / Routine Check-in</option>
                    <option value="medium">🔵 Medium Urgency</option>
                    <option value="high">🟠 High Priority (Urgent)</option>
                    <option value="critical">🔴 Critical (Immediate Crisis / Dropout Risk)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Session Timestamp & Target Follow Up */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" /> Session Date &amp; Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    id="ledger-input-session-time"
                    value={formSessionDate}
                    onChange={(e) => setFormSessionDate(e.target.value)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" /> Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    id="ledger-input-followup"
                    value={formFollowUpDate}
                    onChange={(e) => setFormFollowUpDate(e.target.value)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                    Resolution Status
                  </label>
                  <select
                    id="ledger-select-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as NoteStatus)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  >
                    <option value="open">Open (Initial Discovery)</option>
                    <option value="in_progress">In Progress (Active Monitoring)</option>
                    <option value="resolved">Resolved (Outcome Achieved)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Systematic Session Remarks */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                  Detailed Counseling Observations &amp; Discussion Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="ledger-textarea-notes"
                  required
                  rows={4}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Record confidential remarks: discussion topics, root cause obstacles, academic hurdles, attendance gaps, emotional state, and advisor guidance..."
                  className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary placeholder:text-outline/50 resize-none leading-relaxed"
                />
              </div>

              {/* Row 4: Agreed Action Plan */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                  Agreed Action Plan / Interventions / Next Milestones
                </label>
                <textarea
                  id="ledger-textarea-outcome"
                  rows={2}
                  value={formOutcome}
                  onChange={(e) => setFormOutcome(e.target.value)}
                  placeholder="e.g. Enrolled student in calculus tutoring; Agreed to weekly attendance check-in every Monday."
                  className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary placeholder:text-outline/50 resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-outline-variant pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="font-bold gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving to Firestore...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1" /> Store Session Note
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Controls */}
      <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-outline" />
            <input
              type="text"
              placeholder="Search by student name, ID, notes content, advisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-8.5 pr-3 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:border-primary text-on-surface"
            />
          </div>

          {/* Student Filter */}
          <div>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
            >
              <option value="all">All Students ({totalNotesCount} notes)</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <select
              value={selectedUrgencyFilter}
              onChange={(e) => setSelectedUrgencyFilter(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">🔴 Critical Urgency</option>
              <option value="high">🟠 High Priority</option>
              <option value="medium">🔵 Medium Urgency</option>
              <option value="low">🟢 Low / Routine</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/60">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="font-sans text-xs text-outline">Loading counseling session records from Firestore...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/80 p-8">
          <ClipboardList className="h-10 w-10 text-outline/40 mx-auto mb-3" />
          <h4 className="font-sans font-bold text-sm text-on-surface">No Session Notes Found</h4>
          <p className="font-sans text-xs text-outline mt-1 max-w-md mx-auto">
            {notes.length === 0 
              ? 'No counseling session notes have been recorded yet. Click "Log Counseling Note" above to register an advisor intervention.'
              : 'No notes match your selected search or urgency filter criteria.'}
          </p>
          {notes.length === 0 && (
            <Button onClick={() => setIsCreating(true)} size="sm" className="mt-4 font-bold gap-1.5">
              <Plus className="h-4 w-4" /> Log First Session Note
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNotes.map((note) => {
            const isEditing = editingNoteId === note.id;
            const currentUrgency = note.urgency || 'medium';
            const urgencyMeta = URGENCY_CONFIG[currentUrgency] || URGENCY_CONFIG.medium;
            const UrgencyIcon = urgencyMeta.icon;
            const statusMeta = STATUS_CONFIG[note.status || 'open'] || STATUS_CONFIG.open;

            return (
              <div
                key={note.id}
                className={`rounded-2xl border bg-surface-container-lowest shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md ${
                  currentUrgency === 'critical' 
                    ? 'border-rose-500/40 bg-rose-500/[0.015]' 
                    : 'border-outline-variant/60'
                }`}
              >
                {/* Header Strip */}
                <div className="px-4 py-3 bg-surface-container/20 border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                  {/* Student & Author info */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => setSelectedStudentId(note.studentId)}
                      className="font-sans font-black text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      title="Open Student 360 profile"
                    >
                      <User className="h-3.5 w-3.5" />
                      {note.studentName}
                      <span className="font-mono text-[10px] text-outline font-normal">({note.studentId})</span>
                    </button>

                    <span className="text-outline">&bull;</span>

                    <span className="text-[11px] font-bold text-on-surface-variant">
                      Advisor: <strong className="text-on-surface">{note.authorName}</strong> ({note.authorRole})
                    </span>

                    <span className="text-outline">&bull;</span>

                    {/* Session Timestamp */}
                    <span className="flex items-center gap-1 text-[11px] font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded-md">
                      <Clock className="h-3 w-3 text-primary" />
                      Session: {formatSessionDate(note.sessionDate)}
                    </span>
                  </div>

                  {/* Urgency & Category Badges */}
                  <div className="flex items-center gap-2">
                    {/* Urgency Flag Badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${urgencyMeta.badgeClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${urgencyMeta.dotClass}`} />
                      <UrgencyIcon className="h-3 w-3" />
                      {urgencyMeta.label}
                    </span>

                    {/* Category Badge */}
                    <span className="bg-surface-container-low border border-outline-variant text-[10px] font-bold text-on-surface px-2.5 py-0.5 rounded-full">
                      {note.type}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${statusMeta.badgeClass}`}>
                      {statusMeta.label}
                    </span>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 border-l border-outline-variant/40 pl-2 ml-1">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition"
                          title="Edit Note"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded text-outline hover:text-rose-500 hover:bg-surface-container transition"
                          title="Delete Note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  {isEditing ? (
                    <div className="space-y-3 bg-surface-container/20 p-3.5 rounded-xl border border-primary/20 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs"
                          >
                            {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Urgency Flag</label>
                          <select
                            value={editUrgency}
                            onChange={(e) => setEditUrgency(e.target.value as NoteUrgency)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs font-bold"
                          >
                            <option value="low">🟢 Low</option>
                            <option value="medium">🔵 Medium</option>
                            <option value="high">🟠 High</option>
                            <option value="critical">🔴 Critical</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as NoteStatus)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Session Date &amp; Time</label>
                          <input
                            type="datetime-local"
                            value={editSessionDate}
                            onChange={(e) => setEditSessionDate(e.target.value)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Target Follow-Up Date</label>
                          <input
                            type="date"
                            value={editFollowUpDate}
                            onChange={(e) => setEditFollowUpDate(e.target.value)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Session Observations</label>
                        <textarea
                          rows={3}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Agreed Action Items</label>
                        <textarea
                          rows={2}
                          value={editOutcome}
                          onChange={(e) => setEditOutcome(e.target.value)}
                          className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" size="xs" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                        <Button size="xs" disabled={isSubmitting} onClick={() => handleUpdateNote(note.id)} className="font-bold">
                          {isSubmitting ? 'Saving...' : 'Apply Changes'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Note text */}
                      <p className="font-sans text-xs text-on-surface leading-relaxed whitespace-pre-line font-medium">
                        {note.notes}
                      </p>

                      {/* Outcome */}
                      {note.outcome && (
                        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-xl space-y-1">
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Agreed Intervention Outcome &amp; Action Plan
                          </span>
                          <p className="font-sans text-xs text-on-surface-variant/90 font-semibold pl-5">
                            {note.outcome}
                          </p>
                        </div>
                      )}

                      {/* Footer Details */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/20 text-[11px]">
                        <div className="flex items-center gap-3">
                          {note.followUpDate ? (
                            <span className="flex items-center gap-1 text-on-surface-variant font-bold">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              Follow-up Target: <strong className="text-on-surface font-mono">{note.followUpDate}</strong>
                            </span>
                          ) : (
                            <span className="text-outline text-[10px]">No follow-up set</span>
                          )}

                          <span className="text-outline text-[10px]">
                            Recorded in Firestore: {formatLoggedTimestamp(note.createdAt)}
                          </span>
                        </div>

                        {/* Quick Status Control */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-outline font-bold">Status:</span>
                          <button
                            onClick={() => handleQuickStatusChange(note.id, 'open')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              note.status === 'open' ? 'bg-slate-500 text-white' : 'text-outline hover:bg-surface-container'
                            }`}
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(note.id, 'in_progress')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              note.status === 'in_progress' ? 'bg-amber-500 text-white' : 'text-outline hover:bg-surface-container'
                            }`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(note.id, 'resolved')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              note.status === 'resolved' ? 'bg-emerald-600 text-white' : 'text-outline hover:bg-surface-container'
                            }`}
                          >
                            Resolved
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student 360 Drawer */}
      <Student360Drawer
        studentId={selectedStudentId}
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
}
