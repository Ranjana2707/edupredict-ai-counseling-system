import { doc, collection, query, where, orderBy, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export type NoteUrgency = 'low' | 'medium' | 'high' | 'critical';
export type NoteStatus = 'open' | 'in_progress' | 'resolved';

export interface CounselingNoteDoc {
  id: string;
  studentId: string;
  studentName: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  sessionDate: string; // ISO date or datetime string
  urgency: NoteUrgency;
  type: string;
  notes: string;
  outcome?: string;
  followUpDate?: string;
  status?: NoteStatus;
  createdAt: any;
  updatedAt: any;
}

const DEFAULT_SEEDED_NOTES: CounselingNoteDoc[] = [
  {
    id: 'note-seed-1',
    studentId: 'STU001',
    studentName: 'Aarav Sharma',
    authorId: 'advisor-1',
    authorName: 'Dr. Evelyn Reed',
    authorRole: 'counselor',
    sessionDate: '2026-08-20T14:30:00.000Z',
    urgency: 'critical',
    type: 'Academic Delay / Grades',
    notes: 'Aarav has missed 4 consecutive Advanced Calculus lectures and scored 48% on Midterm 1. Discussed high anxiety regarding midterm grade penalties. Student reported feeling overwhelmed with laboratory coursework.',
    outcome: 'Enrolled Aarav in peer-tutoring sessions on Tuesdays/Thursdays. Scheduled follow-up progress audit before Midterm 2.',
    followUpDate: '2026-09-02',
    status: 'in_progress',
    createdAt: '2026-08-20T14:30:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'note-seed-2',
    studentId: 'STU001',
    studentName: 'Aarav Sharma',
    authorId: 'advisor-2',
    authorName: 'Prof. Marcus Vance',
    authorRole: 'faculty',
    sessionDate: '2026-08-12T10:15:00.000Z',
    urgency: 'medium',
    type: 'Attendance Shortage',
    notes: 'Initial check-in regarding attendance falling to 64%. Student cited transportation bottlenecks from southern transit line.',
    outcome: 'Provided commuter student shuttle pass information and adjusted lab section to 11:00 AM slot.',
    followUpDate: '2026-08-26',
    status: 'resolved',
    createdAt: '2026-08-12T10:15:00.000Z',
    updatedAt: '2026-08-12T10:15:00.000Z'
  },
  {
    id: 'note-seed-3',
    studentId: 'STU002',
    studentName: 'Zara Patel',
    authorId: 'advisor-1',
    authorName: 'Dr. Evelyn Reed',
    authorRole: 'counselor',
    sessionDate: '2026-08-22T11:00:00.000Z',
    urgency: 'high',
    type: 'Financial Stress',
    notes: 'Zara discussed pending tuition fee installment due this Friday. Working 28 hours per week off-campus affecting study schedules.',
    outcome: 'Submitted emergency scholarship application to Dean of Student Welfare. Requested payment extension till end of semester.',
    followUpDate: '2026-08-29',
    status: 'in_progress',
    createdAt: '2026-08-22T11:00:00.000Z',
    updatedAt: '2026-08-22T11:00:00.000Z'
  },
  {
    id: 'note-seed-4',
    studentId: 'STU003',
    studentName: 'Rohan Gupta',
    authorId: 'advisor-1',
    authorName: 'Dr. Evelyn Reed',
    authorRole: 'counselor',
    sessionDate: '2026-08-18T16:00:00.000Z',
    urgency: 'low',
    type: 'Career Guidance',
    notes: 'Semester planning meeting. Rohan is interested in AI/ML research specialization and wanted guidance on prerequisite coursework.',
    outcome: 'Curated recommended elective roadmap: CS402 Deep Learning & Data Mining for next term.',
    followUpDate: '2026-10-15',
    status: 'resolved',
    createdAt: '2026-08-18T16:00:00.000Z',
    updatedAt: '2026-08-18T16:00:00.000Z'
  }
];

function getStoredLocalNotes(): CounselingNoteDoc[] {
  const raw = localStorage.getItem('local_counseling_notes');
  if (!raw) {
    localStorage.setItem('local_counseling_notes', JSON.stringify(DEFAULT_SEEDED_NOTES));
    return DEFAULT_SEEDED_NOTES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem('local_counseling_notes', JSON.stringify(DEFAULT_SEEDED_NOTES));
    return DEFAULT_SEEDED_NOTES;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}


export const counselingNotesService = {
  /**
   * Save a new counseling note to Firestore with urgency flag and session timestamp
   */
  async addNote(params: {
    studentId: string;
    studentName: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    sessionDate?: string;
    urgency?: NoteUrgency;
    notes: string;
    type: string;
    outcome?: string;
    followUpDate?: string;
    status?: NoteStatus;
  }): Promise<CounselingNoteDoc> {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const path = `counseling_notes/${noteId}`;
    const sessionDate = params.sessionDate || new Date().toISOString();
    const urgency = params.urgency || 'medium';
    const status = params.status || 'open';

    if (!auth.currentUser) {
      console.info('Using local storage fallback for addNote operation.');
      const localNotes = getStoredLocalNotes();
      const payload: CounselingNoteDoc = {
        id: noteId,
        studentId: params.studentId,
        studentName: params.studentName,
        authorId: params.authorId,
        authorName: params.authorName,
        authorRole: params.authorRole,
        sessionDate,
        urgency,
        notes: params.notes,
        type: params.type,
        outcome: params.outcome || '',
        followUpDate: params.followUpDate || '',
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localNotes.unshift(payload);
      localStorage.setItem('local_counseling_notes', JSON.stringify(localNotes));
      return payload;
    }

    try {
      const docRef = doc(db, 'counseling_notes', noteId);
      const payload = {
        id: noteId,
        studentId: params.studentId,
        studentName: params.studentName,
        authorId: params.authorId,
        authorName: params.authorName,
        authorRole: params.authorRole,
        sessionDate,
        urgency,
        notes: params.notes,
        type: params.type,
        outcome: params.outcome || '',
        followUpDate: params.followUpDate || '',
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, payload);
      return {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  /**
   * Retrieve counseling notes for a specific student, sorted with newest first
   */
  async getNotesForStudent(studentId: string, filter?: { urgency?: string; type?: string; status?: string }): Promise<CounselingNoteDoc[]> {
    const path = 'counseling_notes';
    if (!auth.currentUser) {
      console.info('Using local storage fallback for getNotesForStudent operation.');
      let localNotes = getStoredLocalNotes().filter((note) => note.studentId === studentId);
      if (filter?.urgency && filter.urgency !== 'all') {
        localNotes = localNotes.filter((n) => n.urgency === filter.urgency);
      }
      if (filter?.type && filter.type !== 'all') {
        localNotes = localNotes.filter((n) => n.type === filter.type);
      }
      if (filter?.status && filter.status !== 'all') {
        localNotes = localNotes.filter((n) => (n.status || 'open') === filter.status);
      }
      return localNotes;
    }

    try {
      const q = query(
        collection(db, 'counseling_notes'),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const results: CounselingNoteDoc[] = [];
      querySnapshot.forEach((docSnap) => {
        results.push(docSnap.data() as CounselingNoteDoc);
      });

      let filtered = results;
      if (filter?.urgency && filter.urgency !== 'all') {
        filtered = filtered.filter((n) => n.urgency === filter.urgency);
      }
      if (filter?.type && filter.type !== 'all') {
        filtered = filtered.filter((n) => n.type === filter.type);
      }
      if (filter?.status && filter.status !== 'all') {
        filtered = filtered.filter((n) => (n.status || 'open') === filter.status);
      }

      // If empty in firestore on initial run, fall back to seeded notes for that student
      if (filtered.length === 0) {
        const local = getStoredLocalNotes().filter((note) => note.studentId === studentId);
        if (local.length > 0) return local;
      }

      return filtered;
    } catch (err) {
      console.warn('Firestore fetch encountered issue, falling back to cached notes:', err);
      return getStoredLocalNotes().filter((note) => note.studentId === studentId);
    }
  },

  /**
   * Retrieve all counseling notes across all students for the advisor overview
   */
  async getAllNotes(filter?: { studentId?: string; urgency?: string; type?: string; status?: string }): Promise<CounselingNoteDoc[]> {
    const path = 'counseling_notes';
    if (!auth.currentUser) {
      let localNotes = getStoredLocalNotes();
      if (filter?.studentId && filter.studentId !== 'all') {
        localNotes = localNotes.filter((n) => n.studentId === filter.studentId);
      }
      if (filter?.urgency && filter.urgency !== 'all') {
        localNotes = localNotes.filter((n) => n.urgency === filter.urgency);
      }
      if (filter?.type && filter.type !== 'all') {
        localNotes = localNotes.filter((n) => n.type === filter.type);
      }
      if (filter?.status && filter.status !== 'all') {
        localNotes = localNotes.filter((n) => (n.status || 'open') === filter.status);
      }
      return localNotes;
    }

    try {
      const q = query(
        collection(db, 'counseling_notes'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const results: CounselingNoteDoc[] = [];
      querySnapshot.forEach((docSnap) => {
        results.push(docSnap.data() as CounselingNoteDoc);
      });

      let filtered = results.length > 0 ? results : getStoredLocalNotes();
      if (filter?.studentId && filter.studentId !== 'all') {
        filtered = filtered.filter((n) => n.studentId === filter.studentId);
      }
      if (filter?.urgency && filter.urgency !== 'all') {
        filtered = filtered.filter((n) => n.urgency === filter.urgency);
      }
      if (filter?.type && filter.type !== 'all') {
        filtered = filtered.filter((n) => n.type === filter.type);
      }
      if (filter?.status && filter.status !== 'all') {
        filtered = filtered.filter((n) => (n.status || 'open') === filter.status);
      }
      return filtered;
    } catch (err) {
      console.warn('Error fetching all notes, using stored fallback:', err);
      let localNotes = getStoredLocalNotes();
      if (filter?.studentId && filter.studentId !== 'all') {
        localNotes = localNotes.filter((n) => n.studentId === filter.studentId);
      }
      if (filter?.urgency && filter.urgency !== 'all') {
        localNotes = localNotes.filter((n) => n.urgency === filter.urgency);
      }
      return localNotes;
    }
  },

  /**
   * Update details of a counseling note in Firestore
   */
  async updateNote(params: {
    noteId: string;
    notes?: string;
    type?: string;
    urgency?: NoteUrgency;
    outcome?: string;
    sessionDate?: string;
    followUpDate?: string;
    status?: NoteStatus;
  }): Promise<void> {
    const path = `counseling_notes/${params.noteId}`;
    if (!auth.currentUser) {
      console.info('Using local storage fallback for updateNote operation.');
      const localNotes = getStoredLocalNotes();
      const idx = localNotes.findIndex((note) => note.id === params.noteId);
      if (idx !== -1) {
        localNotes[idx] = {
          ...localNotes[idx],
          ...(params.notes !== undefined && { notes: params.notes }),
          ...(params.type !== undefined && { type: params.type }),
          ...(params.urgency !== undefined && { urgency: params.urgency }),
          ...(params.outcome !== undefined && { outcome: params.outcome }),
          ...(params.sessionDate !== undefined && { sessionDate: params.sessionDate }),
          ...(params.followUpDate !== undefined && { followUpDate: params.followUpDate }),
          ...(params.status !== undefined && { status: params.status }),
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('local_counseling_notes', JSON.stringify(localNotes));
      }
      return;
    }

    try {
      const docRef = doc(db, 'counseling_notes', params.noteId);
      const updatePayload: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (params.notes !== undefined) updatePayload.notes = params.notes;
      if (params.type !== undefined) updatePayload.type = params.type;
      if (params.urgency !== undefined) updatePayload.urgency = params.urgency;
      if (params.outcome !== undefined) updatePayload.outcome = params.outcome;
      if (params.sessionDate !== undefined) updatePayload.sessionDate = params.sessionDate;
      if (params.followUpDate !== undefined) updatePayload.followUpDate = params.followUpDate;
      if (params.status !== undefined) updatePayload.status = params.status;

      await updateDoc(docRef, updatePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  /**
   * Delete a counseling note
   */
  async deleteNote(noteId: string): Promise<void> {
    const path = `counseling_notes/${noteId}`;
    if (!auth.currentUser) {
      console.info('Using local storage fallback for deleteNote operation.');
      const localNotes = getStoredLocalNotes();
      const filtered = localNotes.filter((note) => note.id !== noteId);
      localStorage.setItem('local_counseling_notes', JSON.stringify(filtered));
      return;
    }

    try {
      const docRef = doc(db, 'counseling_notes', noteId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};
