import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { counselingNotesService, CounselingNoteDoc, NoteUrgency, NoteStatus } from '../../services/counselingNotesService';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Flame,
  Loader2, 
  Calendar, 
  Clock,
  User, 
  FileText,
  Filter,
  Check,
  Search,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface CounselingNotesProps {
  studentId: string;
  studentName: string;
}

const NOTE_TYPES = [
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
  open: { label: 'Open Issue', badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' },
  in_progress: { label: 'In Progress', badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  resolved: { label: 'Resolved', badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' }
};

export function CounselingNotes({ studentId, studentName }: CounselingNotesProps) {
  const { user } = useAuth();
  
  const [notes, setNotes] = useState<CounselingNoteDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states for Creation
  const [isAdding, setIsAdding] = useState(false);
  const [noteType, setNoteType] = useState(NOTE_TYPES[0]);
  const [urgency, setUrgency] = useState<NoteUrgency>('medium');
  const [sessionDate, setSessionDate] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  });
  const [noteContent, setNoteContent] = useState('');
  const [outcomeContent, setOutcomeContent] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [status, setStatus] = useState<NoteStatus>('in_progress');

  // Edit states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editType, setEditType] = useState('');
  const [editUrgency, setEditUrgency] = useState<NoteUrgency>('medium');
  const [editSessionDate, setEditSessionDate] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editOutcome, setEditOutcome] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [editStatus, setEditStatus] = useState<NoteStatus>('in_progress');

  // Check permissions - only counselors, faculty, and admins can manage counseling notes
  const canManageNotes = user && ['counselor', 'faculty', 'admin'].includes(user.role);

  // Load notes for specific student
  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await counselingNotesService.getNotesForStudent(studentId);
      setNotes(data);
    } catch (err: any) {
      console.error('Error loading counseling notes:', err);
      setError('Could not retrieve notes from database.');
      toast.error('Data Load Error', {
        description: 'Unable to sync with live counseling logs.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadNotes();
    }
  }, [studentId]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!noteContent.trim()) {
      toast.error('Invalid Content', { description: 'Please provide detailed counseling session remarks.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedSessionIso = new Date(sessionDate).toISOString();
      await counselingNotesService.addNote({
        studentId,
        studentName,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        sessionDate: formattedSessionIso,
        urgency,
        notes: noteContent.trim(),
        type: noteType,
        outcome: outcomeContent.trim(),
        followUpDate: followUpDate || undefined,
        status
      });

      toast.success('Session Note Logged', {
        description: `Stored structured note with ${urgency.toUpperCase()} urgency under ${studentName}.`
      });

      // Reset form
      setNoteContent('');
      setOutcomeContent('');
      setFollowUpDate('');
      setUrgency('medium');
      setStatus('in_progress');
      setIsAdding(false);
      await loadNotes();
    } catch (err: any) {
      console.error('Error saving counseling note:', err);
      toast.error('Save Failure', {
        description: 'Unable to save notes to the secure Firestore database.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (note: CounselingNoteDoc) => {
    setEditingNoteId(note.id);
    setEditType(note.type);
    setEditUrgency(note.urgency || 'medium');
    
    // Parse session date to local datetime string
    let parsedSession = '';
    if (note.sessionDate) {
      try {
        const d = new Date(note.sessionDate);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const mins = String(d.getMinutes()).padStart(2, '0');
          parsedSession = `${year}-${month}-${day}T${hours}:${mins}`;
        }
      } catch {
        parsedSession = '';
      }
    }
    setEditSessionDate(parsedSession);
    setEditContent(note.notes);
    setEditOutcome(note.outcome || '');
    setEditFollowUpDate(note.followUpDate || '');
    setEditStatus(note.status || 'open');
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) {
      toast.error('Invalid Content', { description: 'Intervention notes cannot be empty.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedSessionIso = editSessionDate ? new Date(editSessionDate).toISOString() : undefined;
      await counselingNotesService.updateNote({
        noteId,
        notes: editContent.trim(),
        type: editType,
        urgency: editUrgency,
        outcome: editOutcome.trim(),
        sessionDate: formattedSessionIso,
        followUpDate: editFollowUpDate || undefined,
        status: editStatus
      });

      toast.success('Note Modified', {
        description: 'Intervention note updated successfully.'
      });

      setEditingNoteId(null);
      await loadNotes();
    } catch (err: any) {
      console.error('Error updating counseling note:', err);
      toast.error('Update Failure', {
        description: 'Failed to rewrite note in database.'
      });
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
      toast.success('Status Updated', {
        description: `Session marked as ${newStatus.replace('_', ' ').toUpperCase()}`
      });
      await loadNotes();
    } catch (err: any) {
      toast.error('Status Update Failed', { description: 'Could not update status in Firestore.' });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this intervention log? This action is irreversible.')) {
      return;
    }

    try {
      await counselingNotesService.deleteNote(noteId);
      toast.success('Note Deleted', {
        description: 'Successfully removed intervention record.'
      });
      await loadNotes();
    } catch (err: any) {
      console.error('Error deleting note:', err);
      toast.error('Deletion Failure', {
        description: 'Failed to erase intervention note from secure logs.'
      });
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(timestamp);
  };

  const formatSessionDate = (sessionDateStr: string) => {
    if (!sessionDateStr) return 'Not recorded';
    const d = new Date(sessionDateStr);
    if (isNaN(d.getTime())) return sessionDateStr;
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (urgencyFilter !== 'all' && n.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'all' && (n.status || 'open') !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = n.notes.toLowerCase().includes(q);
      const matchType = n.type.toLowerCase().includes(q);
      const matchOutcome = (n.outcome || '').toLowerCase().includes(q);
      const matchAuthor = n.authorName.toLowerCase().includes(q);
      if (!matchText && !matchType && !matchOutcome && !matchAuthor) return false;
    }
    return true;
  });

  if (!canManageNotes) {
    return (
      <Card id="counseling-notes-no-permission" className="border-rose-500/10 bg-rose-500/5">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500/80 mb-3" />
          <p className="font-sans font-bold text-on-surface text-sm">Confidential Directory Section</p>
          <p className="font-sans text-xs text-outline mt-1.5 max-w-md">
            Counseling intervention diaries are strictly restricted to authenticated Institution Advisors, Counselors, teaching Faculty, and system Admins.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="counseling-notes-container" className="space-y-6">
      {/* Header section with add button and counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h4 className="font-sans text-sm font-black text-on-surface">Advising & Counseling Session Notes</h4>
            <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {notes.length} {notes.length === 1 ? 'record' : 'records'}
            </span>
          </div>
          <p className="text-[11px] text-outline mt-1">
            Structured session logs with timestamps, urgency flags, and agreed interventions stored in Firestore.
          </p>
        </div>

        {!isAdding && (
          <Button 
            id="btn-add-counseling-note"
            onClick={() => setIsAdding(true)} 
            size="sm" 
            className="flex items-center gap-1.5 h-8.5 font-bold text-xs shrink-0"
          >
            <Plus className="h-4 w-4" /> Log New Session Note
          </Button>
        )}
      </div>

      {/* Add New Note Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="border-2 border-primary/30 rounded-2xl bg-surface-container-low/90 p-5 space-y-4 shadow-md"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <span className="font-sans text-xs font-black text-on-surface uppercase tracking-wider">
                  Log Counseling Dialogue &bull; {studentName} ({studentId})
                </span>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
                title="Close Form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              {/* Row 1: Category & Urgency Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                    Intervention Category
                  </label>
                  <select
                    id="select-note-type"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  >
                    {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5 flex items-center justify-between">
                    <span>Urgency Flag</span>
                    <span className="text-[9px] lowercase font-normal text-outline">defines risk severity</span>
                  </label>
                  <select
                    id="select-note-urgency"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as NoteUrgency)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs font-bold text-on-surface focus:border-primary"
                  >
                    <option value="low">🟢 Low / Routine Check-in</option>
                    <option value="medium">🔵 Medium Urgency</option>
                    <option value="high">🟠 High Priority (Urgent)</option>
                    <option value="critical">🔴 Critical (Immediate Crisis / Drop-out)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" /> Session Timestamp
                  </label>
                  <input
                    type="datetime-local"
                    id="input-session-date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  />
                </div>
              </div>

              {/* Row 2: Detailed Session Remarks */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                  Detailed Session Remarks &amp; Observations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="textarea-note-content"
                  required
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record student concerns, root causes (e.g. prerequisite deficits, health, part-time jobs), emotional cues, and counselor analysis..."
                  className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary placeholder:text-outline/50 resize-none leading-relaxed"
                />
              </div>

              {/* Row 3: Agreed Action Plan & Outcomes */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
                  Agreed Action Plan / Resolutions / Target Output
                </label>
                <textarea
                  id="textarea-outcome-content"
                  rows={2}
                  value={outcomeContent}
                  onChange={(e) => setOutcomeContent(e.target.value)}
                  placeholder="e.g., Student committed to 4 hrs weekly peer tutoring; Advisor requested bursary extension from Dean."
                  className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary placeholder:text-outline/50 resize-none leading-relaxed"
                />
              </div>

              {/* Row 4: Status and Follow-up Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container/30 p-3 rounded-xl border border-outline-variant/30">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" /> Target Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="input-followup-date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full h-8.5 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                    Intervention Status
                  </label>
                  <select
                    id="select-note-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as NoteStatus)}
                    className="w-full h-8.5 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none font-sans text-xs text-on-surface focus:border-primary"
                  >
                    <option value="open">Open (Initial Discovery)</option>
                    <option value="in_progress">In Progress (Active Interventions)</option>
                    <option value="resolved">Resolved (Milestone Satisfied)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-outline-variant/40 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAdding(false)} 
                  size="sm"
                  className="h-8.5 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  size="sm"
                  className="h-8.5 font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving to Firestore...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1.5" /> Save Session Note
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Search Bar */}
      {notes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-surface-container/30 border border-outline-variant/40">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-outline" />
            <input
              type="text"
              placeholder="Search in session notes, remarks, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-outline" />
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-[11px] font-bold text-on-surface outline-none"
              >
                <option value="all">All Urgencies</option>
                <option value="critical">🔴 Critical Only</option>
                <option value="high">🟠 High Priority</option>
                <option value="medium">🔵 Medium Urgency</option>
                <option value="low">🟢 Low / Routine</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-[11px] font-bold text-on-surface outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      )}

      {/* Notes List Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-sans text-xs text-outline">Synchronizing with live session diaries...</p>
        </div>
      ) : error ? (
        <div className="p-lg border border-rose-500/20 bg-rose-500/5 rounded-xl text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <p className="font-sans font-bold text-xs text-on-surface">{error}</p>
          <Button onClick={loadNotes} variant="outline" size="xs">Retry Connection</Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="border border-dashed border-outline-variant/80 rounded-2xl py-12 text-center select-none">
          <FileText className="h-10 w-10 text-outline/30 mx-auto mb-3" />
          <p className="font-sans font-bold text-xs text-on-surface">
            {notes.length === 0 ? 'No session notes registered for this student' : 'No notes match your filter criteria'}
          </p>
          <p className="font-sans text-[11px] text-outline mt-1 max-w-sm mx-auto">
            {notes.length === 0 
              ? 'Log structured counseling notes with timestamps and urgency flags to track longitudinal interventions.' 
              : 'Try clearing the search query or changing your urgency filter.'}
          </p>
          {notes.length === 0 && (
            <Button 
              onClick={() => setIsAdding(true)} 
              variant="outline" 
              size="sm" 
              className="mt-4 text-xs font-bold gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Log First Session Note
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const isEditing = editingNoteId === note.id;
            const isAuthor = user && user.id === note.authorId;
            const currentUrgency = note.urgency || 'medium';
            const urgencyMeta = URGENCY_CONFIG[currentUrgency] || URGENCY_CONFIG.medium;
            const UrgencyIcon = urgencyMeta.icon;
            const statusMeta = STATUS_CONFIG[note.status || 'open'] || STATUS_CONFIG.open;

            return (
              <motion.div
                key={note.id}
                layout
                className={`border rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                  currentUrgency === 'critical' ? 'border-rose-500/40 bg-rose-500/[0.02]' : 'border-outline-variant/50'
                }`}
              >
                {/* Card Top Metadata Ribbon */}
                <div className="px-4 py-3 bg-surface-container/25 flex items-center justify-between border-b border-outline-variant/30 flex-wrap gap-2 text-xs">
                  {/* Left: Author & Timestamps */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="flex items-center gap-1 font-sans text-on-surface font-bold text-xs">
                      <User className="h-3.5 w-3.5 text-primary" />
                      {note.authorName}
                      <span className="font-mono text-[9px] uppercase font-black tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded ml-1">
                        {note.authorRole}
                      </span>
                    </span>

                    <span className="text-outline font-medium">&bull;</span>

                    {/* Session Timestamp */}
                    <span className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md" title="Date of Counseling Session">
                      <Clock className="h-3 w-3 text-primary" />
                      Session: {formatSessionDate(note.sessionDate)}
                    </span>

                    {/* Created/Updated Timestamp */}
                    <span className="text-[10px] text-outline font-medium" title="Firestore Entry Timestamp">
                      (Logged: {formatTimestamp(note.createdAt)})
                    </span>
                  </div>

                  {/* Right: Badges & Controls */}
                  <div className="flex items-center gap-2">
                    {/* Urgency Flag Badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${urgencyMeta.badgeClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${urgencyMeta.dotClass}`} />
                      <UrgencyIcon className="h-3 w-3 shrink-0" />
                      {urgencyMeta.label}
                    </span>

                    {/* Category Pill */}
                    <span className="bg-surface-container-low border border-outline-variant text-[10px] font-extrabold text-on-surface px-2.5 py-0.5 rounded-full select-none">
                      {note.type}
                    </span>

                    {/* Status Pill */}
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${statusMeta.badgeClass}`}>
                      {statusMeta.label}
                    </span>

                    {/* Edit/Delete Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 border-l border-outline-variant/40 pl-2 ml-1">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition"
                          title="Edit Session Note"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded text-outline hover:text-rose-500 hover:bg-surface-container transition"
                          title="Delete Session Note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note Content Body */}
                <div className="p-4 space-y-3.5">
                  {isEditing ? (
                    <div className="space-y-3.5 text-xs bg-surface-container/20 p-3.5 rounded-xl border border-primary/20">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Category</label>
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs"
                          >
                            {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Session Date/Time</label>
                          <input
                            type="datetime-local"
                            value={editSessionDate}
                            onChange={(e) => setEditSessionDate(e.target.value)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Follow-up Due Date</label>
                          <input
                            type="date"
                            value={editFollowUpDate}
                            onChange={(e) => setEditFollowUpDate(e.target.value)}
                            className="w-full h-8 px-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Remarks &amp; Dialogue Notes</label>
                        <textarea
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Agreed Plan / Output</label>
                        <textarea
                          rows={2}
                          value={editOutcome}
                          onChange={(e) => setEditOutcome(e.target.value)}
                          className="w-full p-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none text-xs leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setEditingNoteId(null)}
                          className="h-7.5"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="xs"
                          disabled={isSubmitting}
                          onClick={() => handleUpdateNote(note.id)}
                          className="h-7.5 font-bold"
                        >
                          {isSubmitting ? 'Saving...' : 'Apply Changes'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Session Remarks */}
                      <p className="font-sans text-xs text-on-surface leading-relaxed whitespace-pre-line font-medium">
                        {note.notes}
                      </p>

                      {/* Action Plan / Outcomes */}
                      {note.outcome && (
                        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-xl space-y-1">
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Agreed Intervention Outcome &amp; Action Items
                          </span>
                          <p className="font-sans text-xs text-on-surface-variant/90 leading-relaxed font-semibold pl-5">
                            {note.outcome}
                          </p>
                        </div>
                      )}

                      {/* Footer Info: Follow up date & Quick status toggle */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/20 text-[11px]">
                        {note.followUpDate ? (
                          <span className="flex items-center gap-1 text-on-surface-variant font-bold">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            Follow-up Due: <strong className="text-on-surface font-mono">{note.followUpDate}</strong>
                          </span>
                        ) : (
                          <span className="text-outline text-[10px]">No scheduled follow-up</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-outline font-bold">Mark status:</span>
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
